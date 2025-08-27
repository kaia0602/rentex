package com.rentex.user.service;

import com.rentex.global.jwt.OAuthAttributes;
import com.rentex.user.domain.User;
import com.rentex.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        User user = saveOrUpdate(attributes);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    private User saveOrUpdate(OAuthAttributes attributes) {
        return userRepository.findByEmail(attributes.getEmail())
                .map(entity -> {
                    // 탈퇴 회원이면 복구
                    if (entity.getWithdrawnAt() != null) {
                        entity.recover();
                    }
                    // 소셜 정보 최신화
                    entity.updateName(attributes.getName());
                    entity.updateNickname(attributes.getName());
                    entity.updateProfileImage(attributes.getPicture());
                    return entity; // 영속 상태라 save() 불필요(Dirty Checking)
                })
                .orElseGet(() -> {
                    // 신규 소셜 가입자 생성
                    return userRepository.save(User.builder()
                            .email(attributes.getEmail())
                            // NOTE: password는 nullable=false라 값이 필요함(아래 참고)
                            .password("SOCIAL_LOGIN_PASSWORD")
                            .name(attributes.getName())
                            .nickname(attributes.getName())
                            .role("USER")
                            .profileImageUrl(attributes.getPicture())
                            .build());
                });
    }

}