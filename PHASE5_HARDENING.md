# Phase 5 — Hardening, Edge Cases & Deployment

Status of the production-readiness items from the migration plan's Phase 5, split into
**Done in code** vs. **Operational / pending**, plus the manual verification and deployment
checklists. Decisions that were made greenfield (permanent posts, fresh DB, no ETL) are
assumed here.

---

## 5.1 Redis memory & durability

**Done in code**
- **Redis is never the only copy.** Every cached read has a DB fallback that repopulates:
  notification feed (`user:noti:*`), unread notification counter (`user:unread_noti_count:*`),
  latest moment (`locket:latest:*`), unread moments set (`user:unread_moments:*`).
- **Redis outages degrade instead of breaking core writes.** All best-effort cache writes go
  through `utils/RedisSafe` (`runQuietly` / `getQuietly`). Because these sit inside
  `@Transactional` service methods, a Redis failure previously would have rolled back the
  durable DB write (moment delivery, notification persistence). Now the DB commit always
  stands; the cache write is logged and skipped. Cache reads fall back to DB on any Redis error.
- **Client timeouts** (`spring.data.redis.timeout` / `connect-timeout` = 2s) so a slow/unreachable
  Redis fails fast rather than hanging request threads.
- **Bounded collections:** notification feed ZSET trimmed to 100 (`ZREMRANGEBYRANK` in the
  event listener). Latest-moment string + unread-moments set are naturally bounded per user.

**Operational / pending**
- Set Redis server `maxmemory` and eviction policy. **Recommended: `volatile-lru`** paired with
  TTLs on cache keys, so counters/sets that are rebuildable get evicted under pressure while the
  DB stays authoritative. If you switch to `allkeys-lru`, ensure *every* key has a TTL and every
  reader tolerates eviction (they now do, via the fallbacks above).
- Optional TTLs per the plan (feed 30d, latest 30d, unread-moments 7d) can be added in
  `RedisKeys` writers if you want automatic cold-out of inactive users. Not required for
  correctness — fallbacks cover it.
- Verify all fallbacks after a `FLUSHALL` (see verification checklist).

## 5.2 Fan-out edge cases

**Done in code**
- **Partial-send is impossible:** moment creation validates *all* `recipientIds` are close
  friends before any side effect; one bad id fails the whole request (`NOT_CLOSE_FRIEND`).
- **Idempotency:** `view` (sets `viewedAt` once), `react` (unique `(moment, recipient)` upsert),
  close-friend add/remove (unique constraint + idempotent no-ops). Covered by unit tests.
- **Fan-out bound:** the flat close-friend cap (50) bounds every broadcast.
- **Live delivery is already off the request thread:** notifications persist synchronously
  (durability) then publish to Redis Pub/Sub; the `NotificationEventListener` does the
  ZSET/counter/WebSocket work on the listener-container thread, not the caller's.

**Operational / pending**
- The remaining per-request cost is N recipient-row inserts + N notification-row inserts
  (N ≤ 50). Acceptable for v1. If broadcasts grow, batch these inserts (`saveAll`) and/or move
  the notification loop to a Redis Stream consumer. Deliberately **not** made `@Async` now: that
  would move the durable DB write off-thread and reintroduce the silent-loss risk Phase 2 avoided.

## 5.3 Real-time reliability

**Done in code**
- **WebSocket reconnect reconciliation:** clients recover missed live events by pulling
  `GET /api/notifications` + `GET /api/notifications/unread-count` (DB/counter backed) on
  reconnect — Pub/Sub is intentionally lossy, DB is the source of truth.
- **Widget hot path** (`GET /api/locket/moments/latest`) is O(1) Redis with DB fallback; never
  500s on cold cache.

**Operational / pending**
- **Multi-instance WebSocket:** current broker is Spring's in-memory `SimpleBroker` (per-instance).
  For horizontal scale-out, switch to a STOMP broker relay (RabbitMQ) or a shared broker so a push
  from any instance reaches a client connected to any other. **Single-instance is fine for v1** —
  flagged for the scale-out milestone.

## 5.4 Data-consistency sync

**Done in code**
- `viewedAt` is written to the DB synchronously in the same request (cheap + authoritative) and
  the Redis unread set is updated best-effort — DB and cache converge, cache is disposable.

**Operational / pending**
- Optional `@Scheduled` reconciliation job to recompute `user:unread_noti_count:*` and
  `user:unread_moments:*` from the DB nightly to heal any drift. Not required (counters rebuild
  on cache miss) but cheap insurance at scale.

## 5.5 Security

**Done in code**
- **Widget token** is scope-limited (`scope=widget`, no role claim, 90d) and accepted **only** on
  `GET /api/locket/moments/latest` via an explicit allow-list in `JwtAuthenticationFilter`, which
  also confirms non-revocation against `device_tokens`. Replayed as a Bearer token it is inert
  (no role → `@PreAuthorize` fails).
- **Authorization guards:** `viewers` is sender-only, `visitors` is self-only (403
  `ACCESS_DENIED`), moment `view`/`react` are recipient-only (`NOT_A_RECIPIENT`). Unit-tested.
- **Upload validation** (type, size, video duration) runs *before* the file touches disk.

**Operational / pending**
- Add negative security tests once an integration harness with Postgres/Redis exists (e.g. widget
  token rejected on `POST /moments`). Logic is in place; automated proof pending infra.

## 5.6 Verification checklist

Unit-level (no infra) — **done, 19 tests green** (`mvn test -Dtest=*ServiceImplTest`):
close-friend cap/validation/idempotency, moment validation chain + view idempotency +
sender-only viewers + O(1) unread, notification counter DB-fallback + ownership guard,
friendship self/duplicate guards.

Integration-level (needs Postgres + Redis) — **manual, pending infra**:
- [ ] Boot against fresh Postgres + Redis; all tables auto-create (`ddl-auto: update`).
- [ ] Register/login unchanged.
- [ ] Reaction → DB `Notification` row + counter `INCR` + WebSocket frame on `/user/queue/notifications`.
- [ ] Counter rebuilds correctly after `FLUSHALL` (cold-cache path).
- [ ] Moment: photo + 15s-boundary video; `latest` via JWT **and** `X-Widget-Token`; feed; sent;
      view (idempotent); viewers (sender-only 403 otherwise); react (upsert replaces, not stacks).
- [ ] Close-friend cap (50) + non-accepted-friend rejection.
- [ ] Device register/deregister; widget-token mint on register; `DEVICE_TOKEN_NOT_FOUND` on
      unknown deregister.
- [ ] Profile visit upsert (no self-visit; repeat updates timestamp); `visitors` self-only.
- [ ] Redis down → moment creation and notifications still succeed (DB), endpoints degrade not 500.

> Note: the existing `BackendApplicationTests.contextLoads()` is `@SpringBootTest` and needs a live
> Postgres + Redis; it is not part of the infra-free unit run above.

## 5.7 Deployment checklist

- [x] Redis dependency + config wired (`spring-boot-starter-data-redis`, `RedisConfig`, timeouts).
- [x] jcodec added for video duration probing.
- [x] MapStruct annotation processor fixed in `pom.xml` (was silently disabled — app would not
      have started).
- [ ] **FCM/APNs push worker** — not built. Seam is `NotificationEventListener` (currently pushes
      WebSocket only); add `firebase-admin`, resolve recipient `DeviceToken`s, send a data message,
      behind a config flag so local dev without FCM creds still runs.
- [ ] **Flyway for prod** — add `flyway-core` + `flyway-database-postgresql`, set
      `ddl-auto: validate`, capture `V1__baseline.sql` from the current schema then additive
      migrations. Dev stays on `ddl-auto: update` (greenfield, no ETL).
- [ ] Prod `.env`: DB, Redis, `JWT_*`, `FILE_UPLOAD_DIR`, (FCM creds path once worker exists).
- [ ] Redis `maxmemory` + eviction policy per §5.1.
- [ ] Lock WebSocket topology (single-instance `SimpleBroker` vs. relay) for the target deployment.
- [ ] Swagger (`/swagger`) reachable; confirm all new endpoints documented.

## Reconciled decisions (from the plan's open-questions list)
1. **DB strategy:** greenfield, no ETL. ✅
2. **Post model:** permanent posts; Locket is the ephemeral surface. ✅
3. **Notification transport:** synchronous DB write + Pub/Sub fan-out (not Streams). ✅
4. **Error-code numbering:** domain-derived (`LOCKET` 700–799 → effective 701…708, `DEVICE`
   800–899 → 801). The doc's literal `7001…` do **not** apply; mobile client must map to these. ⚠️ action on client
5. **WebSocket topology:** single-instance for v1; relay flagged for scale-out. ✅ (v1)
