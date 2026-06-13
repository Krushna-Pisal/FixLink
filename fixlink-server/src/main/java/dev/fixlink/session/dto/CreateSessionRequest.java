package dev.fixlink.session.dto;

import dev.fixlink.shared.Severity;

public class CreateSessionRequest {
    private String issueTitle;
    private Severity severity;

    public CreateSessionRequest() {}

    public String getIssueTitle() { return issueTitle; }
    public void setIssueTitle(String issueTitle) { this.issueTitle = issueTitle; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
}
