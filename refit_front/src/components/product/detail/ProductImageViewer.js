import React from "react";
import { API_SERVER_HOST } from "../../../api/productsApi";

const ProductImageViewer = ({
  images = [],
  mainImageIdx,
  setMainImageIdx,
  donationImageUrl,
  useDonationImage,
  setUseDonationImage,
}) => {
  const mainImage = images?.[mainImageIdx];

  const mainImageUrl =
    useDonationImage && donationImageUrl
      ? `${API_SERVER_HOST}${donationImageUrl}`
      : mainImage?.url
      ? `${API_SERVER_HOST}${mainImage.url}`
      : "";

  const thumbnails =
    images?.map((img, idx) => ({
      url: img.urlThumbnail
        ? `${API_SERVER_HOST}${img.urlThumbnail}`
        : `${API_SERVER_HOST}/thumbs/${img.id || "unknown"}_thumbnail.jpg`,
      alt: img.altText || `썸네일 ${idx + 1}`,
    })) || [];

  return (
    <div className="flex flex-col items-center md:w-1/2">
      <img
        src={mainImageUrl}
        alt={mainImage?.altText || "상품 이미지"}
        className="w-full h-[450px] object-cover rounded-xl border shadow-lg"
      />
      <div className="flex gap-3 mt-4">
        {thumbnails.map((thumb, idx) => (
          <img
            key={idx}
            src={thumb.url}
            alt={thumb.alt}
            className={`w-20 h-20 object-cover rounded cursor-pointer border transition-all duration-200 hover:border-blue-400 ${
              mainImageIdx === idx
                ? "border-blue-500 ring-2 ring-blue-400"
                : "border-gray-300"
            }`}
            onClick={() => {
              setMainImageIdx(idx);
              setUseDonationImage(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageViewer;
