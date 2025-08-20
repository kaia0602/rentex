<<<<<<< HEAD
//package com.rentex.global.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // 모든 경로
//                .allowedOrigins("http://localhost:3000") // 프론트 포트
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                .allowedHeaders("*")
//                .allowCredentials(true); // 쿠키 허용 (로그인 세션 등)
//    }
//}
=======
package com.rentex.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // 🚀 배포 시: 프론트 도메인으로 변경 필요 (ex. https://rentex.site)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ 외부 경로에 저장된 파일을 /uploads/** URL로 접근할 수 있게 설정
        String fileLocation = Paths.get(uploadDir).toUri().toString();  // file:///C:/rentex-uploads/ 또는 file:/home/ubuntu/rentex/uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileLocation);

        // 🚀 배포 시: application-prod.yml 또는 환경변수로 uploadDir을 "/home/ubuntu/rentex/uploads/" 로 설정해야 함
    }
}
>>>>>>> origin/feature/rentaladd
