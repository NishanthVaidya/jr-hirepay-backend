package com.justresults.hirepay.util;

import com.justresults.hirepay.config.StorageProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private final Path root;

    public DocumentStorageService(StorageProperties props) throws IOException {
        this.root = Paths.get(props.getFolder()).toAbsolutePath().normalize();
        Files.createDirectories(this.root);
    }

    public String store(String procedureUuid, MultipartFile file) throws IOException {
        String ext = getExt(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path dir = root.resolve(procedureUuid);
        Files.createDirectories(dir);
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return dest.toString();
    }

    public String store(String procedureUuid, byte[] content, String filename) throws IOException {
        String ext = getExt(filename);
        String finalFilename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        Path dir = root.resolve(procedureUuid);
        Files.createDirectories(dir);
        Path dest = dir.resolve(finalFilename);
        Files.write(dest, content, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
        return dest.toString();
    }

    public Resource loadAsResource(String location) throws IOException {
        try {
            Path file = Paths.get(location);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new IOException("Could not read file: " + location);
            }
        } catch (MalformedURLException e) {
            throw new IOException("Could not read file: " + location, e);
        }
    }

    private static String getExt(String name) {
        if (name == null) return "";
        int i = name.lastIndexOf('.');
        return i > 0 ? name.substring(i + 1) : "";
    }
}
