package vibe.net.backend.filter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vibe.net.backend.repositories.DeviceTokenRepository;
import vibe.net.backend.services.implementations.JwtServiceImpl;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtServiceImpl jwtService;
    private final DeviceTokenRepository deviceTokenRepository;

    // The ONLY endpoint that accepts a widget token. A leaked widget token must not be
    // replayable against any other route, so this is an explicit allow-list, not
    // "any valid JWT works here".
    private static final String WIDGET_ALLOWED_PATH = "/api/locket/moments/latest";
    private static final String WIDGET_TOKEN_HEADER = "X-Widget-Token";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        if (tryWidgetAuthentication(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            String tokenParam = request.getParameter("token");
            if (tokenParam != null && !tokenParam.isEmpty()){
                token = tokenParam;
            }
        }

        if (token == null){
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String userId = jwtService.extractSubject(token);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null){
                String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

                List< SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_"+role));

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException e){
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private boolean tryWidgetAuthentication(HttpServletRequest request) {
        String widgetToken = request.getHeader(WIDGET_TOKEN_HEADER);
        if (widgetToken == null || widgetToken.isEmpty()) {
            return false;
        }
        if (!WIDGET_ALLOWED_PATH.equals(request.getRequestURI())) {
            return false;
        }
        try {
            String userId = jwtService.extractSubject(widgetToken);
            String scope = jwtService.extractScope(widgetToken);
            boolean validScope = JwtServiceImpl.WIDGET_SCOPE.equals(scope);
            boolean notRevoked = deviceTokenRepository.findByWidgetToken(widgetToken).isPresent();

            if (userId != null && validScope && notRevoked
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Inject a minimal USER authority so the read-only endpoint authorizes; the
                // token itself never carried a role claim.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                return true;
            }
        } catch (JwtException e) {
            SecurityContextHolder.clearContext();
        }
        return false;
    }
}
