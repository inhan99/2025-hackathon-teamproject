package com.refitbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path baseStorageLocation;

    public FileStorageServiceImpl() {
        // 기본 저장 위치: build/resources/main/static
        this.baseStorageLocation = Paths.get("build/resources/main/static").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseStorageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Could not create base upload directory!", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        return storeFile(file, "uploads"); // 기본값은 uploads 폴더
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";

        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) extension = originalFileName.substring(dotIndex);

        String newFileName = UUID.randomUUID().toString() + extension;

        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Invalid path sequence " + originalFileName);
            }
            
            // 서브 디렉토리 생성
            Path targetDirectory = this.baseStorageLocation.resolve(subDirectory);
            Files.createDirectories(targetDirectory);
            
            Path targetLocation = targetDirectory.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // 절대 경로 반환 (웹 접근용)
            // uploads 폴더의 경우 파일명만 반환 (프론트엔드에서 /uploads/ 경로를 추가함)
            if ("uploads".equals(subDirectory)) {
                return newFileName;
            }
            return "/" + subDirectory + "/" + newFileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + newFileName, e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            Path filePath = this.baseStorageLocation.resolve(fileUrl).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file " + fileUrl, e);
        }
    }
}
