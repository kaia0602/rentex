package com.rentex.common.upload;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class LocalFileUploadService implements FileUploadService {

    private final String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";// 프로젝트 루트에 uploads 폴더 생성해도 OK

    @Override
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String savedFileName = UUID.randomUUID() + "_" + originalFilename;

        File destination = new File(uploadDir, savedFileName);
        destination.getParentFile().mkdirs(); // 디렉토리 없으면 생성

        try {
            file.transferTo(destination);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }

        return "/uploads/" + savedFileName; // 나중에 이 경로는 서버 설정에 따라 다르게 처리 가능
    }
}
