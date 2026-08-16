package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.PostErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.PostMapper;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.PostResponse;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.SavedPost;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CommentRepository;
import vibe.net.backend.repositories.PostRepository;
import vibe.net.backend.repositories.ReactionRepository;
import vibe.net.backend.repositories.SavedPostRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.SavedPostService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SavedPostServiceImpl implements SavedPostService {
    SavedPostRepository savedPostRepository;
    PostRepository postRepository;
    UserRepository userRepository;
    PostMapper postMapper;
    CommentRepository commentRepository;
    ReactionRepository reactionRepository;

    @Override
    @Transactional
    public boolean toggleSave(UUID postId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));

        var existing = savedPostRepository.findByUserIdAndPostId(currentUserId, postId);
        if (existing.isPresent()) {
            savedPostRepository.delete(existing.get());
            return false;
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        SavedPost savedPost = SavedPost.builder()
                .user(user)
                .post(post)
                .build();
        savedPostRepository.save(savedPost);
        return true;
    }

    @Override
    public PageResponse<PostResponse> getSavedPosts(int page, int size) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<SavedPost> savedPage = savedPostRepository.findByUserIdOrderBySavedAtDesc(currentUserId, pageable);

        List<PostResponse> responses = savedPage.getContent().stream()
                .map(SavedPost::getPost)
                .map(postMapper::toResponse)
                .map(response -> enrich(response, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .totalPages(savedPage.getTotalPages())
                .pageSize(size)
                .totalElements(savedPage.getTotalElements())
                .data(responses)
                .build();
    }

    private PostResponse enrich(PostResponse response, UUID currentUserId) {
        response.setCommentCount((int) commentRepository.countByPostId(response.getId()));
        response.setReactionCount((int) reactionRepository.countByPostId(response.getId()));
        reactionRepository.findByPostIdAndUserId(response.getId(), currentUserId)
                .ifPresent(reaction -> response.setCurrentReaction(reaction.getType()));
        response.setSaved(true);
        return response;
    }
}
