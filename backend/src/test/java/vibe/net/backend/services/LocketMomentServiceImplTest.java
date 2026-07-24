package vibe.net.backend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.models.entities.LocketMoment;
import vibe.net.backend.models.entities.LocketMomentRecipient;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.*;
import vibe.net.backend.services.implementations.LocketMomentServiceImpl;
import vibe.net.backend.services.implementations.NotificationPublisher;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.utils.LocketConstants;
import vibe.net.backend.utils.RedisKeys;
import vibe.net.backend.utils.SecurityUtils;
import vibe.net.backend.utils.VideoDurationProbe;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocketMomentServiceImplTest {

    @Mock LocketMomentRepository momentRepository;
    @Mock LocketMomentRecipientRepository recipientRepository;
    @Mock LocketReactionRepository reactionRepository;
    @Mock CloseFriendRepository closeFriendRepository;
    @Mock UserRepository userRepository;
    @Mock FileService fileService;
    @Mock VideoDurationProbe videoDurationProbe;
    @Mock RedisTemplate<String, Object> redisTemplate;
    @Mock SetOperations<String, Object> setOps;
    @Mock NotificationPublisher notificationPublisher;

    @InjectMocks LocketMomentServiceImpl service;

    private final UUID caller = UUID.randomUUID();
    private final UUID momentId = UUID.randomUUID();

    @Test
    void createMoment_rejectsEmptyMedia() {
        MultipartFile media = mock(MultipartFile.class);
        when(media.isEmpty()).thenReturn(true);
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn(caller);
            assertThatThrownBy(() -> service.createMoment(media, null, null, null))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void createMoment_rejectsUnsupportedType() {
        MultipartFile media = mock(MultipartFile.class);
        when(media.isEmpty()).thenReturn(false);
        when(media.getContentType()).thenReturn("application/pdf");
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn(caller);
            assertThatThrownBy(() -> service.createMoment(media, null, null, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Unsupported media type");
        }
    }

    @Test
    void createMoment_rejectsOversizedMedia() {
        MultipartFile media = mock(MultipartFile.class);
        when(media.isEmpty()).thenReturn(false);
        when(media.getContentType()).thenReturn("image/jpeg");
        when(media.getSize()).thenReturn(LocketConstants.MAX_MEDIA_BYTES + 1);
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn(caller);
            assertThatThrownBy(() -> service.createMoment(media, null, null, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("50MB");
            verifyNoInteractions(fileService);
        }
    }

    @Test
    void viewMoment_throwsWhenNotRecipient() {
        when(recipientRepository.findByMomentIdAndRecipientId(momentId, caller)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.viewMoment(momentId, caller))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("not a recipient");
    }

    @Test
    void viewMoment_setsViewedAtOnceAndClearsUnread() {
        LocketMomentRecipient recipient = LocketMomentRecipient.builder().viewedAt(null).build();
        when(recipientRepository.findByMomentIdAndRecipientId(momentId, caller)).thenReturn(Optional.of(recipient));
        when(redisTemplate.opsForSet()).thenReturn(setOps);

        service.viewMoment(momentId, caller);

        org.assertj.core.api.Assertions.assertThat(recipient.getViewedAt()).isNotNull();
        verify(recipientRepository).save(recipient);
        verify(setOps).remove(RedisKeys.unreadMoments(caller), momentId.toString());
    }

    @Test
    void viewMoment_isIdempotentWhenAlreadyViewed() {
        LocketMomentRecipient recipient = LocketMomentRecipient.builder().viewedAt(LocalDateTime.now().minusHours(1)).build();
        when(recipientRepository.findByMomentIdAndRecipientId(momentId, caller)).thenReturn(Optional.of(recipient));
        when(redisTemplate.opsForSet()).thenReturn(setOps);

        service.viewMoment(momentId, caller);

        // Already-viewed -> no second DB write, but the unread-set cleanup still runs.
        verify(recipientRepository, never()).save(any());
        verify(setOps).remove(RedisKeys.unreadMoments(caller), momentId.toString());
    }

    @Test
    void getViewers_throwsWhenCallerIsNotSender() {
        LocketMoment moment = LocketMoment.builder()
                .id(momentId)
                .sender(User.builder().id(UUID.randomUUID()).build())
                .build();
        when(momentRepository.findById(momentId)).thenReturn(Optional.of(moment));

        assertThatThrownBy(() -> service.getViewers(momentId, caller))
                .isInstanceOf(AppException.class);
        verify(recipientRepository, never()).findByMomentId(any());
    }

    @Test
    void unreadCount_usesRedisSetCardinality() {
        when(redisTemplate.opsForSet()).thenReturn(setOps);
        when(setOps.size(RedisKeys.unreadMoments(caller))).thenReturn(3L);

        org.assertj.core.api.Assertions.assertThat(service.unreadCount(caller)).isEqualTo(3L);
        verify(recipientRepository, never()).findByRecipientIdAndViewedAtIsNull(any());
    }
}
