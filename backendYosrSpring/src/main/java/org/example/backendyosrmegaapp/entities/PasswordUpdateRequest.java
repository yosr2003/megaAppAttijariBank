package org.example.backendyosrmegaapp.entities;

public class PasswordUpdateRequest {

    private String email;
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
    @Override
    public String toString() {
        return "PasswordUpdateRequest [email=" + email + ", currentPassword=" + currentPassword + ", newPassword="
                + newPassword + ", confirmPassword=" + confirmPassword + "]";
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getCurrentPassword() {
        return currentPassword;
    }
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    public String getNewPassword() {
        return newPassword;
    }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    public String getConfirmPassword() {
        return confirmPassword;
    }
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    public PasswordUpdateRequest() {
        super();
    }
    public PasswordUpdateRequest(String email, String currentPassword, String newPassword, String confirmPassword) {
        super();
        this.email = email;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    // Getters and Setters
}

