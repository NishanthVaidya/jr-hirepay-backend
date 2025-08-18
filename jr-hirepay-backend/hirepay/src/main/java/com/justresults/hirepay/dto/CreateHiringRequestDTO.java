package com.justresults.hirepay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateHiringRequestDTO {
    @NotBlank
    private String consultantName;

    @Email @NotBlank
    private String consultantEmail;

    // getters/setters
    public String getConsultantName() { return consultantName; }
    public void setConsultantName(String consultantName) { this.consultantName = consultantName; }
    public String getConsultantEmail() { return consultantEmail; }
    public void setConsultantEmail(String consultantEmail) { this.consultantEmail = consultantEmail; }
}
