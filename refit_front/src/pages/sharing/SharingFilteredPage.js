import React from "react";
import { useParams } from "react-router-dom";
import FilteredDonationProductsComponent from "../../components/sharing/FilteredDonationProductsComponent";

const SharingFilteredPage = () => {
  const { originalProductId } = useParams();

  return (
    <div>
      <FilteredDonationProductsComponent
        originalProductId={originalProductId}
      />
    </div>
  );
};

export default SharingFilteredPage;
