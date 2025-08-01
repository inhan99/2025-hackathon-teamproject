// Google Cloud Vision API 설정
export const VISION_CONFIG = {
  // Google Cloud Vision API 키 파일 경로
  keyFilePath:
    process.env.REACT_APP_GOOGLE_VISION_KEY_PATH ||
    "./src/config/google-vision-key.json",

  // Vision API 설정
  visionConfig: {
    // 이미지 분석 요청 설정
    imageAnalysis: {
      // 라벨 감지 설정
      labelDetection: {
        maxResults: 10, // 최대 결과 수
        minConfidence: 0.7, // 최소 신뢰도 (70%)
      },
      // 텍스트 감지 설정
      textDetection: {
        languageHints: ["ko", "en"], // 한국어, 영어 우선
      },
      // 옷 관련 라벨 필터링
      clothingLabels: [
        "Clothing",
        "Apparel",
        "Fashion",
        "Shirt",
        "T-shirt",
        "Pants",
        "Jeans",
        "Dress",
        "Skirt",
        "Jacket",
        "Coat",
        "Sweater",
        "Hoodie",
        "Shoes",
        "Sneakers",
        "Boots",
        "Sandal",
        "Hat",
        "Cap",
        "Bag",
        "Handbag",
        "Backpack",
        "Accessory",
        "Jewelry",
        "Watch",
        "Sunglasses",
      ],
    },
  },
};

// 옷 종류별 카테고리 매핑
export const CLOTHING_CATEGORIES = {
  상의: ["Shirt", "T-shirt", "Sweater", "Hoodie", "Blouse", "Polo shirt"],
  하의: ["Pants", "Jeans", "Shorts", "Skirt", "Trousers"],
  아우터: ["Jacket", "Coat", "Blazer", "Cardigan", "Vest"],
  원피스: ["Dress", "One-piece", "Gown"],
  신발: ["Shoes", "Sneakers", "Boots", "Sandal", "Heels", "Flats"],
  가방: ["Bag", "Handbag", "Backpack", "Tote bag", "Clutch"],
  액세서리: [
    "Hat",
    "Cap",
    "Accessory",
    "Jewelry",
    "Watch",
    "Sunglasses",
    "Belt",
    "Scarf",
  ],
};

// 신뢰도 점수에 따른 등급
export const CONFIDENCE_GRADES = {
  HIGH: 0.8, // 높음 (80% 이상)
  MEDIUM: 0.6, // 중간 (60-79%)
  LOW: 0.4, // 낮음 (40-59%)
};
