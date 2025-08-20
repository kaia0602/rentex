package com.rentex.common.upload;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileUploadService implements FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir; // ✅ application.yml에서 설정한 외부 디렉토리 (ex: C:/rentex-uploads/)

    @Override
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        // ✅ 원본 파일명 정리
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String savedFileName = UUID.randomUUID() + "_" + originalFilename;

        try {
            // ✅ 업로드 디렉토리 (절대경로 기준으로 생성)
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(basePath); // 디렉토리 없으면 생성

            // ✅ 최종 저장 경로
            Path targetPath = basePath.resolve(savedFileName);
            file.transferTo(targetPath.toFile());

            // ✅ 접근 가능한 URL 반환
            return "/uploads/" + savedFileName;

            // 👉 브라우저에서는 http://localhost:8080/uploads/UUID_파일명 으로 접근 가능
            // 🚀 배포 시에는 http://your-domain.com/uploads/UUID_파일명
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }
    }
}
