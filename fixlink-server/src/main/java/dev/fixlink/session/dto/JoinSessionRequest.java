package dev.fixlink.session.dto;

public class JoinSessionRequest {
    private String customerName;

    public JoinSessionRequest() {}

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
}
