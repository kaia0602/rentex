<<<<<<< HEAD
package com.rentex.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/my-info")
    public ResponseEntity<Map<String, Object>> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        // @AuthenticationPrincipal 어노테이션을 사용하면
        // JwtAuthorizationFilter가 SecurityContext에 저장한 사용자 정보를 바로 받아올 수 있습니다.
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userDetails.getUsername()); // User의 ID
        response.put("authorities", userDetails.getAuthorities()); // User의 권한

        return ResponseEntity.ok(response);
    }
}
=======
//package com.rentex.user.controller;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api")
//public class TestController {
//
//    @GetMapping("/my-info")
//    public ResponseEntity<Map<String, Object>> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
//        // @AuthenticationPrincipal 어노테이션을 사용하면
//        // JwtAuthorizationFilter가 SecurityContext에 저장한 사용자 정보를 바로 받아올 수 있습니다.
//        Map<String, Object> response = new HashMap<>();
//        response.put("userId", userDetails.getUsername()); // User의 ID
//        response.put("authorities", userDetails.getAuthorities()); // User의 권한
//
//        return ResponseEntity.ok(response);
//    }
//}
>>>>>>> origin/feature/admin-items
