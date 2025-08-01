package com.refitbackend.domain.member;

import lombok.Getter;

@Getter
public enum DonationLevel {

    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4;

    public static DonationLevel fromPoint(int point) {
        if (point >= 50000) return LEVEL_4;
        else if (point >= 25000) return LEVEL_3;
        else if (point >= 15000) return LEVEL_2;
        else return LEVEL_1;
    }
}
