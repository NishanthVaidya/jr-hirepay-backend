package com.justresults.hirepay.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {
    /**
     * Local folder for uploads (absolute or relative).
     * e.g., storage.folder=uploads
     */
    private String folder = "uploads";

    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }
}
