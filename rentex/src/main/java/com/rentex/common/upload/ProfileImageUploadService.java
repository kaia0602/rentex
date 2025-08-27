package com.rentex.common.upload;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProfileImageUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /** 프로필 이미지를 128x128로 리사이징하여 저장합니다.  */
    public String uploadAndResize(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 프로필 이미지가 없습니다.");
        }

        String savedFileName = generateSavedFileName(file.getOriginalFilename());

        try {
            Path targetPath = resolveTargetPath(savedFileName);

            // 128x128 크기로 리사이징하여 저장
            Thumbnails.of(file.getInputStream())
                    .size(128, 128)
                    .toFile(targetPath.toFile());

            return "/uploads/" + savedFileName;

        } catch (IOException e) {
            throw new RuntimeException("프로필 이미지 저장 중 오류 발생", e);
        }
    }

    private String generateSavedFileName(String originalFilename) {
        String cleanFilename = StringUtils.cleanPath(originalFilename);
        String fileExtension = StringUtils.getFilenameExtension(cleanFilename);
        return UUID.randomUUID() + "." + fileExtension;
    }

    private Path resolveTargetPath(String savedFileName) throws IOException {
        Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(basePath);
        return basePath.resolve(savedFileName);
    }
}