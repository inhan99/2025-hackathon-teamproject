package com.refitbackend.repository.donation;

import org.springframework.data.jpa.repository.JpaRepository;

import com.refitbackend.domain.donation.DonationOption;

public interface DonationOptionRepository extends JpaRepository<DonationOption, Long> {
}
