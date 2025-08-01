package com.refitbackend.repository.donation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.refitbackend.domain.donation.DonationImage;
import com.refitbackend.domain.donation.DonationProduct;

@Repository
public interface DonationImageRepository extends JpaRepository<DonationImage, Long> {

    List <DonationImage> findAllByDonationProduct(DonationProduct donationProduct);
}
