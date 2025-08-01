package com.refitbackend.repository.donation;

import org.springframework.data.jpa.repository.JpaRepository;

import com.refitbackend.domain.donation.DonationImage;

public interface DontaionImageRepository extends JpaRepository<DonationImage, Long>{
    
}
