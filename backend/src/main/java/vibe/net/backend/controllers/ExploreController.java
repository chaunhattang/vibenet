package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.ExploreItemResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.services.interfaces.ExploreService;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ExploreController {
    ExploreService exploreService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/grid")
    public ApiResponse<PageResponse<ExploreItemResponse>> getGrid(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ApiResponse.<PageResponse<ExploreItemResponse>>builder()
                .result(exploreService.getGrid(category, page, size))
                .build();
    }
}
