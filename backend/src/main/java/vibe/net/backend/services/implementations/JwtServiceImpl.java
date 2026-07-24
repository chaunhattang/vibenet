package vibe.net.backend.services.implementations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vibe.net.backend.models.entities.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl {
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.audience}")
    private String audience;

    @Value("${app.jwt.expiration-in-ms}")
    private Long expirationTime;

    // Widget tokens are long-lived (90 days) and carry a "widget" scope but NO role claim,
    // so they authorize only the explicit X-Widget-Token allow-list path in the filter and
    // are useless as a Bearer token (role-based @PreAuthorize checks fail without a role).
    private static final long WIDGET_TOKEN_EXPIRATION_MS = 90L * 24 * 60 * 60 * 1000;
    public static final String WIDGET_SCOPE = "widget";

    public String createToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        var token = Jwts.builder()
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("role", user.getRole().toString())
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, Jwts.SIG.HS512).compact();
        return token;
    }

    public String createWidgetToken(User user) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("scope", WIDGET_SCOPE)
                .issuer(issuer)
                .audience().add(audience).and()
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + WIDGET_TOKEN_EXPIRATION_MS))
                .signWith(key, Jwts.SIG.HS512).compact();
    }

    public String extractScope(String token) {
        return extractClaim(token, claims -> claims.get("scope", String.class));
    }

    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaim(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaim(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
