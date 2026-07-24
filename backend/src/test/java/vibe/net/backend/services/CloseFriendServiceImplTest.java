package vibe.net.backend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.models.entities.CloseFriend;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CloseFriendRepository;
import vibe.net.backend.repositories.FriendshipRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.implementations.CloseFriendServiceImpl;
import vibe.net.backend.utils.LocketConstants;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloseFriendServiceImplTest {

    @Mock CloseFriendRepository closeFriendRepository;
    @Mock FriendshipRepository friendshipRepository;
    @Mock UserRepository userRepository;

    @InjectMocks CloseFriendServiceImpl service;

    private final UUID owner = UUID.randomUUID();
    private final UUID friend = UUID.randomUUID();

    @Test
    void addCloseFriend_rejectsNonAcceptedFriend() {
        when(closeFriendRepository.findByOwnerIdAndFriendId(owner, friend)).thenReturn(Optional.empty());
        when(friendshipRepository.areAcceptedFriends(owner, friend)).thenReturn(false);

        assertThatThrownBy(() -> service.addCloseFriend(owner, friend))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("accepted friends");
        verify(closeFriendRepository, never()).save(any());
    }

    @Test
    void addCloseFriend_rejectsAtLimit() {
        when(closeFriendRepository.findByOwnerIdAndFriendId(owner, friend)).thenReturn(Optional.empty());
        when(friendshipRepository.areAcceptedFriends(owner, friend)).thenReturn(true);
        when(closeFriendRepository.countByOwnerId(owner)).thenReturn((long) LocketConstants.CLOSE_FRIEND_LIMIT);

        assertThatThrownBy(() -> service.addCloseFriend(owner, friend))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("limit");
        verify(closeFriendRepository, never()).save(any());
    }

    @Test
    void addCloseFriend_isIdempotentWhenAlreadyPresent() {
        LocalDateTime addedAt = LocalDateTime.now().minusDays(1);
        CloseFriend existing = CloseFriend.builder().friend(User.builder().id(friend).build()).addedAt(addedAt).build();
        when(closeFriendRepository.findByOwnerIdAndFriendId(owner, friend)).thenReturn(Optional.of(existing));

        var result = service.addCloseFriend(owner, friend);

        assertThat(result.getFriendId()).isEqualTo(friend);
        assertThat(result.getAddedAt()).isEqualTo(addedAt);
        verify(friendshipRepository, never()).areAcceptedFriends(any(), any());
        verify(closeFriendRepository, never()).save(any());
    }

    @Test
    void addCloseFriend_succeedsUnderLimitForAcceptedFriend() {
        when(closeFriendRepository.findByOwnerIdAndFriendId(owner, friend)).thenReturn(Optional.empty());
        when(friendshipRepository.areAcceptedFriends(owner, friend)).thenReturn(true);
        when(closeFriendRepository.countByOwnerId(owner)).thenReturn(3L);
        when(userRepository.findById(owner)).thenReturn(Optional.of(User.builder().id(owner).build()));
        when(userRepository.findById(friend)).thenReturn(Optional.of(User.builder().id(friend).build()));
        when(closeFriendRepository.save(any(CloseFriend.class))).thenAnswer(inv -> {
            CloseFriend cf = inv.getArgument(0);
            cf.setAddedAt(LocalDateTime.now());
            return cf;
        });

        var result = service.addCloseFriend(owner, friend);

        assertThat(result.getFriendId()).isEqualTo(friend);
        verify(closeFriendRepository).save(any(CloseFriend.class));
    }

    @Test
    void getCloseFriends_reportsFlatLimit() {
        when(closeFriendRepository.findByOwnerIdOrderByAddedAtDesc(owner)).thenReturn(java.util.List.of());
        var result = service.getCloseFriends(owner);
        assertThat(result.getLimit()).isEqualTo(LocketConstants.CLOSE_FRIEND_LIMIT);
        assertThat(result.getCount()).isZero();
    }
}
