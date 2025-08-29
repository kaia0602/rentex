package com.rentex.favorite.controller;

import com.rentex.favorite.service.FavoriteService;
import com.rentex.item.dto.ItemResponseDTO;
import com.rentex.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtTokenProvider jwtTokenProvider;

    /** 우선 SecurityContext에서 userId(문자열)를 시도 → 없으면 Authorization 헤더 파싱 */
    private Long currentUserIdOrThrow(String authorizationHeaderIfAny) {
        // 1) SecurityContext 우선
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
            // JwtTokenProvider.getAuthentication(...)은 subject=userId 를 username으로 세팅함
            String username = auth.getName(); // = userId 문자열
            try {
                return Long.parseLong(username);
            } catch (NumberFormatException ignored) { /* 아래 헤더 파싱으로 폴백 */ }
        }

        // 2) 헤더 파싱 폴백
        if (authorizationHeaderIfAny == null || !authorizationHeaderIfAny.startsWith("Bearer ")) {
            throw new org.springframework.security.access.AccessDeniedException("인증 토큰이 필요합니다.");
        }
        String token = authorizationHeaderIfAny.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new org.springframework.security.access.AccessDeniedException("만료되었거나 유효하지 않은 토큰입니다.");
        }
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    /** 찜 토글 */
    @PostMapping("/{itemId}/toggle")
    public ResponseEntity<FavoriteCheckResponse> toggle(
            @PathVariable Long itemId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = currentUserIdOrThrow(authorization);
        boolean favorited = favoriteService.toggleFavorite(itemId, userId);
        return ResponseEntity.ok(new FavoriteCheckResponse(favorited));
    }

    /** 내 찜 목록 */
    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> myFavorites(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = currentUserIdOrThrow(authorization);
        return ResponseEntity.ok(favoriteService.getMyFavorites(userId));
    }

    /** 단건 찜 여부 체크 */
    @GetMapping("/check")
    public ResponseEntity<FavoriteCheckResponse> check(
            @RequestParam Long itemId,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = currentUserIdOrThrow(authorization);
        return ResponseEntity.ok(new FavoriteCheckResponse(favoriteService.isFavorite(itemId, userId)));
    }

    /** 단순 boolean 래퍼 */
    private record FavoriteCheckResponse(boolean favorite) {}
}
