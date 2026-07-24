package vibe.net.backend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedStatic;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.mappers.UserMapper;
import vibe.net.backend.repositories.FriendshipRepository;
import vibe.net.backend.repositories.NotificationRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.implementations.FriendshipServiceImpl;
import vibe.net.backend.services.implementations.NotificationPublisher;
import vibe.net.backend.utils.SecurityUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FriendshipServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock UserMapper userMapper;
    @Mock FriendshipRepository friendshipRepository;
    @Mock NotificationRepository notificationRepository;
    @Mock NotificationPublisher notificationPublisher;

    @InjectMocks FriendshipServiceImpl service;

    @Test
    void sendFriendRequest_rejectsSelf() {
        UUID me = UUID.randomUUID();
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn(me);

            assertThatThrownBy(() -> service.sendFriendRequest(me))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("yourself");
            verify(friendshipRepository, never()).save(any());
            verifyNoInteractions(notificationPublisher);
        }
    }

    @Test
    void sendFriendRequest_rejectsExistingRelationship() {
        UUID me = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn(me);
            when(friendshipRepository.existsBySenderIdAndReceiverId(me, other)).thenReturn(true);

            assertThatThrownBy(() -> service.sendFriendRequest(other))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("already exists");
            verify(friendshipRepository, never()).save(any());
            verifyNoInteractions(notificationPublisher);
        }
    }
}
