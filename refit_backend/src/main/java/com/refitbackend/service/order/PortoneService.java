package com.refitbackend.service.order;


import lombok.Getter;
import lombok.Setter;

public interface PortoneService {
    
    // 결제 검증
    boolean verifyPayment(String impUid, String merchantUid, int amount);
    
    // 결제 취소
    boolean cancelPayment(String impUid, String reason);
    
    // 결제 정보 조회
    PaymentInfo getPaymentInfo(String impUid);
    
    // 결제 정보를 담을 내부 클래스
    @Getter
    @Setter
    class PaymentInfo {
        private String impUid;
        private String merchantUid;
        private String status;
        private int amount;
        private String payMethod;
        private String pgProvider;
        
        // // getters and setters
        // public String getImpUid() { return impUid; }
        // public void setImpUid(String impUid) { this.impUid = impUid; }
        
        // public String getMerchantUid() { return merchantUid; }
        // public void setMerchantUid(String merchantUid) { this.merchantUid = merchantUid; }
        
        // public String getStatus() { return status; }
        // public void setStatus(String status) { this.status = status; }
        
        // public int getAmount() { return amount; }
        // public void setAmount(int amount) { this.amount = amount; }
        
        // public String getPayMethod() { return payMethod; }
        // public void setPayMethod(String payMethod) { this.payMethod = payMethod; }
        
        // public String getPgProvider() { return pgProvider; }
        // public void setPgProvider(String pgProvider) { this.pgProvider = pgProvider; }
    }
} 