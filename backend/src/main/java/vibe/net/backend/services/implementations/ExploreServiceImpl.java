package vibe.net.backend.services.implementations;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.ExploreAuthorResponse;
import vibe.net.backend.models.dtos.response.ExploreItemResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.Reel;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CommentRepository;
import vibe.net.backend.repositories.PostRepository;
import vibe.net.backend.repositories.ReactionRepository;
import vibe.net.backend.repositories.ReelCommentRepository;
import vibe.net.backend.repositories.ReelReactionRepository;
import vibe.net.backend.repositories.ReelRepository;
import vibe.net.backend.services.interfaces.ExploreService;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExploreServiceImpl implements ExploreService {
    PostRepository postRepository;
    ReelRepository reelRepository;
    CommentRepository commentRepository;
    ReactionRepository reactionRepository;
    ReelCommentRepository reelCommentRepository;
    ReelReactionRepository reelReactionRepository;

    @Override
    public PageResponse<ExploreItemResponse> getGrid(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        boolean isAllCategory = category == null || category.isBlank() || "all".equalsIgnoreCase(category);

        Page<Post> postPage = isAllCategory
                ? postRepository.findAllByOrderByCreatedAtDesc(pageable)
                : postRepository.findByTextContentContainingIgnoreCaseOrderByCreatedAtDesc(category, pageable);

        Page<Reel> reelPage = isAllCategory
                ? reelRepository.findAllByOrderByCreatedAtDesc(pageable)
                : reelRepository.findByTagIgnoreCase(category, pageable);

        List<ExploreItemResponse> items = new ArrayList<>();
        items.addAll(postPage.getContent().stream().map(this::toItem).collect(Collectors.toList()));
        items.addAll(reelPage.getContent().stream().map(this::toItem).collect(Collectors.toList()));

        items.sort(Comparator.comparing(ExploreItemResponse::getCreatedAt).reversed());
        if (items.size() > size) {
            items = items.subList(0, size);
        }

        long totalElements = postPage.getTotalElements() + reelPage.getTotalElements();
        int totalPages = Math.max(postPage.getTotalPages(), reelPage.getTotalPages());

        return PageResponse.<ExploreItemResponse>builder()
                .currentPage(page)
                .totalPages(totalPages)
                .pageSize(size)
                .totalElements(totalElements)
                .data(items)
                .build();
    }

    private ExploreItemResponse toItem(Post post) {
        boolean hasMedia = post.getMediaUrl() != null && !post.getMediaUrl().isEmpty();
        return ExploreItemResponse.builder()
                .id(post.getId())
                .type("POST")
                .mediaUrl(hasMedia ? post.getMediaUrl().get(0) : null)
                .thumbnailUrl(hasMedia ? post.getMediaUrl().get(0) : null)
                .textContent(hasMedia ? null : post.getTextContent())
                .textGradient(hasMedia ? null : post.getTextGradient())
                .likesCount((int) reactionRepository.countByPostId(post.getId()))
                .commentsCount((int) commentRepository.countByPostId(post.getId()))
                .author(toAuthor(post.getOwner()))
                .createdAt(post.getCreatedAt())
                .build();
    }

    private ExploreItemResponse toItem(Reel reel) {
        return ExploreItemResponse.builder()
                .id(reel.getId())
                .type("REEL")
                .mediaUrl(reel.getVideoUrl())
                .thumbnailUrl(reel.getThumbnailUrl())
                .likesCount((int) reelReactionRepository.countByReelId(reel.getId()))
                .commentsCount((int) reelCommentRepository.countByReelId(reel.getId()))
                .author(toAuthor(reel.getCreator()))
                .createdAt(reel.getCreatedAt())
                .build();
    }

    private ExploreAuthorResponse toAuthor(User user) {
        return ExploreAuthorResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getProfile() != null ? user.getProfile().getAvatarUrl() : null)
                .build();
    }
}
