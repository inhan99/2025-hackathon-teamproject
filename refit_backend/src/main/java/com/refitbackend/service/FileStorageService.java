package com.refitbackend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file);
    String storeFile(MultipartFile file, String subDirectory);
    void deleteFile(String fileUrl);
}
