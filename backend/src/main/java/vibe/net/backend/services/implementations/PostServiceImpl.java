package vibe.net.backend.services.implementations;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.PostErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.PostMapper;
import vibe.net.backend.models.dtos.request.PostCreationRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.PostResponse;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CommentRepository;
import vibe.net.backend.repositories.PostRepository;
import vibe.net.backend.repositories.ReactionRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.services.interfaces.PostService;
import vibe.net.backend.utils.SecurityUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostServiceImpl implements PostService {
    PostRepository postRepository;
    UserRepository userRepository;
    FileService fileService;
    PostMapper postMapper;
    ReactionRepository reactionRepository;
    CommentRepository commentRepository;

    @Override
    public PostResponse createPost(PostCreationRequest request) throws IOException {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Post post = Post.builder()
                .owner(owner)
                .textContent(request.getTextContent())
                .mediaUrl(uploadMedia(request.getMediaFiles()))
                .build();

        Post savedPost = postRepository.save(post);
        return enrich(postMapper.toResponse(savedPost), currentUserId);
    }

    @Override
    public PostResponse updatePost(UUID postId, String textContent) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!post.getOwner().getId().equals(currentUserId)) {
            throw new AppException(PostErrorCode.UNAUTHORIZED);
        }

        if (textContent != null) {
            post.setTextContent(textContent);
        }

        Post savedPost = postRepository.save(post);
        return enrich(postMapper.toResponse(savedPost), currentUserId);
    }

    @Override
    public void deletePost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!post.getOwner().getId().equals(currentUserId) && !isAdmin) {
            throw new AppException(PostErrorCode.UNAUTHORIZED);
        }
        postRepository.delete(post);
    }

    @Override
    public PostResponse getPost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return enrich(postMapper.toResponse(post), currentUserId);
    }

    @Override
    public List<PostResponse> getPostsByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(UserErrorCode.NOT_FOUND);
        }
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return postRepository.findByOwnerId(userId).stream()
                .map(postMapper::toResponse)
                .map(response -> enrich(response, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<PostResponse> getPostsByUserIdPage(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findByOwnerId(userId, pageable);
        return toPageResponse(postPage, page, size);
    }

    @Override
    public PageResponse<PostResponse> getFeedPostsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPageResponse(postPage, page, size);
    }

    private PageResponse<PostResponse> toPageResponse(Page<Post> postPage, int page, int size) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<PostResponse> responses = postPage.getContent().stream()
                .map(postMapper::toResponse)
                .map(response -> enrich(response, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .totalPages(postPage.getTotalPages())
                .pageSize(size)
                .totalElements(postPage.getTotalElements())
                .data(responses)
                .build();
    }

    private PostResponse enrich(PostResponse response, UUID currentUserId) {
        response.setCommentCount((int) commentRepository.countByPostId(response.getId()));
        response.setReactionCount((int) reactionRepository.countByPostId(response.getId()));
        reactionRepository.findByPostIdAndUserId(response.getId(), currentUserId)
                .ifPresent(reaction -> response.setCurrentReaction(reaction.getType()));
        return response;
    }

    private List<String> uploadMedia(List<MultipartFile> mediaFiles) throws IOException {
        List<String> urls = new ArrayList<>();
        if (mediaFiles == null) {
            return urls;
        }
        for (MultipartFile file : mediaFiles) {
            if (file != null && !file.isEmpty()) {
                urls.add(fileService.uploadFile(file, "media/posts"));
            }
        }
        return urls;
    }
}
