package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.enums.MediaType;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.LocketErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.dtos.response.*;
import vibe.net.backend.models.entities.*;
import vibe.net.backend.repositories.*;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.services.interfaces.LocketMomentService;
import vibe.net.backend.utils.LocketConstants;
import vibe.net.backend.utils.RedisKeys;
import vibe.net.backend.utils.RedisSafe;
import vibe.net.backend.utils.SecurityUtils;
import vibe.net.backend.utils.VideoDurationProbe;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LocketMomentServiceImpl implements LocketMomentService {
    LocketMomentRepository momentRepository;
    LocketMomentRecipientRepository recipientRepository;
    LocketReactionRepository reactionRepository;
    CloseFriendRepository closeFriendRepository;
    UserRepository userRepository;
    FileService fileService;
    VideoDurationProbe videoDurationProbe;
    RedisTemplate<String, Object> redisTemplate;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public MomentCreationResponse createMoment(MultipartFile media, String caption,
                                               List<UUID> recipientIds, UUID replyToMomentId) throws IOException {
        UUID callerId = SecurityUtils.getCurrentUserId();

        // 1. media present
        if (media == null || media.isEmpty()) {
            throw new IllegalArgumentException("media is required");
        }
        // 2. content-type resolves to image or video
        MediaType mediaType = resolveMediaType(media.getContentType());
        // 3. size <= 50MB
        if (media.getSize() > LocketConstants.MAX_MEDIA_BYTES) {
            throw new AppException(LocketErrorCode.MEDIA_TOO_LARGE);
        }
        // 4. if video: probe duration <= 15s (validate before any disk side effect)
        Integer durationSeconds = null;
        if (mediaType == MediaType.VIDEO) {
            durationSeconds = validateVideoDuration(media);
        }
        // 5. resolve + validate recipients (fail whole request, never partial-send)
        Set<UUID> recipientSet = resolveRecipients(callerId, recipientIds);
        // 6. reply target must exist and caller must be one of its recipients
        LocketMoment replyTo = resolveReplyTarget(replyToMomentId, callerId);

        User sender = userRepository.findById(callerId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        String mediaUrl = fileService.uploadFile(media, "media/locket");

        LocketMoment moment = momentRepository.save(LocketMoment.builder()
                .sender(sender)
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .durationSeconds(durationSeconds)
                .caption(caption)
                .replyToMoment(replyTo)
                .build());

        LatestMomentResponse latest = toLatestResponse(moment, sender);
        for (UUID recipientId : recipientSet) {
            recipientRepository.save(LocketMomentRecipient.builder()
                    .moment(moment)
                    .recipient(userRepository.getReferenceById(recipientId))
                    .build());

            // Redis hot-path state is best-effort: the recipient rows above are the durable
            // copy, so a Redis outage must not roll back moment delivery.
            RedisSafe.runQuietly("moment unread add",
                    () -> redisTemplate.opsForSet().add(RedisKeys.unreadMoments(recipientId), moment.getId().toString()));
            RedisSafe.runQuietly("moment latest set",
                    () -> redisTemplate.opsForValue().set(RedisKeys.latestMoment(recipientId), latest));

            notificationPublisher.publish(recipientId, callerId, NotificationType.LOCKET_MOMENT_RECEIVED, moment.getId());
        }

        return MomentCreationResponse.builder()
                .momentId(moment.getId())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .durationSeconds(durationSeconds)
                .caption(caption)
                .replyToMomentId(replyTo != null ? replyTo.getId() : null)
                .createdAt(moment.getCreatedAt())
                .recipientCount(recipientSet.size())
                .build();
    }

    @Override
    public LatestMomentResponse getLatest(UUID userId) {
        Object cached = RedisSafe.getQuietly("moment latest read",
                () -> redisTemplate.opsForValue().get(RedisKeys.latestMoment(userId)), null);
        if (cached instanceof LatestMomentResponse latest) {
            return latest;
        }
        // Cache miss/Redis down -> DB fallback, then repopulate. Never 500 on cold cache.
        return recipientRepository.findTopByRecipientIdOrderByDeliveredAtDesc(userId)
                .map(recipient -> {
                    LocketMoment moment = recipient.getMoment();
                    LatestMomentResponse latest = toLatestResponse(moment, moment.getSender());
                    RedisSafe.runQuietly("moment latest repopulate",
                            () -> redisTemplate.opsForValue().set(RedisKeys.latestMoment(userId), latest));
                    return latest;
                })
                .orElse(null);
    }

    @Override
    public PageResponse<MomentFeedItemResponse> getFeed(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LocketMomentRecipient> recipientPage = recipientRepository.findByRecipientIdOrderByDeliveredAtDesc(userId, pageable);

        List<MomentFeedItemResponse> data = recipientPage.getContent().stream().map(recipient -> {
            LocketMoment moment = recipient.getMoment();
            User sender = moment.getSender();
            String myReaction = reactionRepository.findByMomentIdAndRecipientId(moment.getId(), userId)
                    .map(LocketReaction::getEmoji)
                    .orElse(null);
            return MomentFeedItemResponse.builder()
                    .momentId(moment.getId())
                    .senderId(sender.getId())
                    .senderName(displayName(sender))
                    .senderAvatarUrl(avatar(sender))
                    .mediaUrl(moment.getMediaUrl())
                    .mediaType(moment.getMediaType())
                    .caption(moment.getCaption())
                    .createdAt(moment.getCreatedAt())
                    .viewedAt(recipient.getViewedAt())
                    .myReaction(myReaction)
                    .build();
        }).collect(Collectors.toList());

        return PageResponse.<MomentFeedItemResponse>builder()
                .currentPage(page)
                .totalPages(recipientPage.getTotalPages())
                .pageSize(size)
                .totalElements(recipientPage.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    public PageResponse<SentMomentResponse> getSent(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LocketMoment> momentPage = momentRepository.findBySenderIdOrderByCreatedAtDesc(userId, pageable);

        List<SentMomentResponse> data = momentPage.getContent().stream().map(moment -> SentMomentResponse.builder()
                .momentId(moment.getId())
                .mediaUrl(moment.getMediaUrl())
                .mediaType(moment.getMediaType())
                .caption(moment.getCaption())
                .createdAt(moment.getCreatedAt())
                .recipientCount((int) recipientRepository.countByMomentId(moment.getId()))
                .viewedCount((int) recipientRepository.countByMomentIdAndViewedAtIsNotNull(moment.getId()))
                .build()).collect(Collectors.toList());

        return PageResponse.<SentMomentResponse>builder()
                .currentPage(page)
                .totalPages(momentPage.getTotalPages())
                .pageSize(size)
                .totalElements(momentPage.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    @Transactional
    public void viewMoment(UUID momentId, UUID userId) {
        LocketMomentRecipient recipient = recipientRepository.findByMomentIdAndRecipientId(momentId, userId)
                .orElseThrow(() -> new AppException(LocketErrorCode.NOT_A_RECIPIENT));
        if (recipient.getViewedAt() == null) {
            recipient.setViewedAt(java.time.LocalDateTime.now());
            recipientRepository.save(recipient);
        }
        RedisSafe.runQuietly("moment mark viewed",
                () -> redisTemplate.opsForSet().remove(RedisKeys.unreadMoments(userId), momentId.toString()));
    }

    @Override
    public MomentViewersResponse getViewers(UUID momentId, UUID callerId) {
        LocketMoment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new AppException(LocketErrorCode.MOMENT_NOT_FOUND));
        if (!moment.getSender().getId().equals(callerId)) {
            // Only the sender can see who viewed their moment.
            throw new AppException(LocketErrorCode.NOT_A_RECIPIENT);
        }

        List<LocketMomentRecipient> recipients = recipientRepository.findByMomentId(momentId);
        List<MomentViewerResponse> viewers = recipients.stream().map(r -> {
            User u = r.getRecipient();
            return MomentViewerResponse.builder()
                    .userId(u.getId())
                    .userName(u.getUsername())
                    .avatarUrl(avatar(u))
                    .viewedAt(r.getViewedAt())
                    .build();
        }).collect(Collectors.toList());

        int viewedCount = (int) recipients.stream().filter(r -> r.getViewedAt() != null).count();

        return MomentViewersResponse.builder()
                .viewedCount(viewedCount)
                .totalRecipients(recipients.size())
                .viewers(viewers)
                .build();
    }

    @Override
    @Transactional
    public MomentReactionResponse react(UUID momentId, UUID userId, String emoji) {
        LocketMomentRecipient recipient = recipientRepository.findByMomentIdAndRecipientId(momentId, userId)
                .orElseThrow(() -> new AppException(LocketErrorCode.NOT_A_RECIPIENT));
        LocketMoment moment = recipient.getMoment();

        LocketReaction reaction = reactionRepository.findByMomentIdAndRecipientId(momentId, userId)
                .orElseGet(() -> LocketReaction.builder()
                        .moment(moment)
                        .recipient(recipient.getRecipient())
                        .build());
        reaction.setEmoji(emoji);
        reaction = reactionRepository.save(reaction);

        UUID senderId = moment.getSender().getId();
        if (!senderId.equals(userId)) {
            notificationPublisher.publish(senderId, userId, NotificationType.LOCKET_REACTION, momentId);
        }

        return MomentReactionResponse.builder()
                .emoji(reaction.getEmoji())
                .reactedAt(reaction.getReactedAt())
                .build();
    }

    @Override
    public long unreadCount(UUID userId) {
        Long size = RedisSafe.getQuietly("moment unread cardinality",
                () -> redisTemplate.opsForSet().size(RedisKeys.unreadMoments(userId)), null);
        if (size != null && size > 0) {
            return size;
        }
        // Cold cache / Redis down: fall back to DB and repopulate so the O(1) ring check works next time.
        List<LocketMomentRecipient> unviewed = recipientRepository.findByRecipientIdAndViewedAtIsNull(userId);
        if (unviewed.isEmpty()) {
            return 0;
        }
        Object[] momentIds = unviewed.stream().map(r -> r.getMoment().getId().toString()).toArray();
        RedisSafe.runQuietly("moment unread repopulate",
                () -> redisTemplate.opsForSet().add(RedisKeys.unreadMoments(userId), momentIds));
        return unviewed.size();
    }

    // ── Validation helpers ───────────────────────────────────

    private MediaType resolveMediaType(String contentType) {
        if (contentType == null) {
            throw new AppException(LocketErrorCode.INVALID_MEDIA_TYPE);
        }
        if (contentType.startsWith("image/")) {
            return MediaType.PHOTO;
        }
        if (contentType.startsWith("video/")) {
            return MediaType.VIDEO;
        }
        throw new AppException(LocketErrorCode.INVALID_MEDIA_TYPE);
    }

    private Integer validateVideoDuration(MultipartFile media) throws IOException {
        File tmp = Files.createTempFile("locket-probe-", ".tmp").toFile();
        try {
            media.transferTo(tmp);
            double seconds = videoDurationProbe.durationSeconds(tmp);
            if (seconds > LocketConstants.MAX_VIDEO_SECONDS) {
                throw new AppException(LocketErrorCode.VIDEO_TOO_LONG);
            }
            return (int) Math.round(seconds);
        } catch (VideoDurationProbe.ProbeException e) {
            log.warn("Failed to probe Locket video duration", e);
            throw new AppException(LocketErrorCode.INVALID_MEDIA_TYPE);
        } finally {
            if (!tmp.delete()) {
                tmp.deleteOnExit();
            }
        }
    }

    private Set<UUID> resolveRecipients(UUID callerId, List<UUID> recipientIds) {
        Set<UUID> closeFriendIds = closeFriendRepository.findByOwnerIdOrderByAddedAtDesc(callerId).stream()
                .map(cf -> cf.getFriend().getId())
                .collect(Collectors.toSet());

        if (recipientIds == null || recipientIds.isEmpty()) {
            return closeFriendIds;
        }
        for (UUID recipientId : recipientIds) {
            if (!closeFriendIds.contains(recipientId)) {
                throw new AppException(LocketErrorCode.NOT_CLOSE_FRIEND);
            }
        }
        return new LinkedHashSet<>(recipientIds);
    }

    private LocketMoment resolveReplyTarget(UUID replyToMomentId, UUID callerId) {
        if (replyToMomentId == null) {
            return null;
        }
        LocketMoment replyTo = momentRepository.findById(replyToMomentId)
                .orElseThrow(() -> new AppException(LocketErrorCode.MOMENT_NOT_FOUND));
        boolean callerIsRecipient = recipientRepository.findByMomentIdAndRecipientId(replyToMomentId, callerId).isPresent();
        if (!callerIsRecipient) {
            throw new AppException(LocketErrorCode.NOT_A_RECIPIENT);
        }
        return replyTo;
    }

    // ── Mapping helpers ──────────────────────────────────────

    private LatestMomentResponse toLatestResponse(LocketMoment moment, User sender) {
        return LatestMomentResponse.builder()
                .momentId(moment.getId())
                .senderId(sender.getId())
                .senderName(displayName(sender))
                .senderAvatarUrl(avatar(sender))
                .mediaUrl(moment.getMediaUrl())
                .mediaType(moment.getMediaType())
                .caption(moment.getCaption())
                .createdAt(moment.getCreatedAt())
                .build();
    }

    private String displayName(User user) {
        if (user.getProfile() != null && user.getProfile().getFullName() != null) {
            return user.getProfile().getFullName();
        }
        return user.getUsername();
    }

    private String avatar(User user) {
        return user.getProfile() != null ? user.getProfile().getAvatarUrl() : null;
    }
}
