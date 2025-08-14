package com.rentex.global.jwt;

import com.rentex.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
public class OAuthAttributes {
    private final Map<String, Object> attributes;
    private final String nameAttributeKey;
    private final String name;
    private final String email;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
    }

    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return ofNaver("id", attributes);
        }
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        // ✅ 이메일 null 체크 추가
        if (email == null) {
            throw new IllegalArgumentException("구글 로그인을 위해서는 이메일 정보 제공에 동의해야 합니다.");
        }

        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email(email)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    private static OAuthAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        String email = (String) response.get("email");
        // ✅ 이메일 null 체크 추가
        if (email == null) {
            throw new IllegalArgumentException("네이버 로그인을 위해서는 이메일 정보 제공에 동의해야 합니다.");
        }

        return OAuthAttributes.builder()
                .name((String) response.get("name"))
                .email(email)
                .attributes(response)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    private static OAuthAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> kakaoProfile = (Map<String, Object>) kakaoAccount.get("profile");
        String email = (String) kakaoAccount.get("email");
        // ✅ 이메일 null 체크 추가
        if (email == null) {
            throw new IllegalArgumentException("카카오 로그인을 위해서는 이메일 정보 제공에 동의해야 합니다.");
        }

        return OAuthAttributes.builder()
                .name((String) kakaoProfile.get("nickname"))
                .email(email)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    public User toEntity() {
        return new User(email, "SOCIAL_LOGIN_PASSWORD", name, name);
    }
}