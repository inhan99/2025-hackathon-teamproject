import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../api/productsApi";
import { getDonationProductByOriginalId } from "../../api/donationApi";
import { addCart } from "../../api/cartApi";
import { getCookie } from "../../util/cookieUtil";
import { useDispatch } from "react-redux";
import { fetchCartItems } from "../../slices/cartSlice";

import ProductImageViewer from "../../components/product/detail/ProductImageViewer";
import ProductSummary from "../../components/product/detail/ProductSummary";
import ProductOptionSelector from "../../components/product/detail/ProductOptionSelector";
import DonationInfoBox from "../../components/product/detail/DonationInfoBox";
import ActionButtons from "../../components/product/detail/ActionButtons";
import ReviewSection from "../../components/product/detail/ReviewSection";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [donationProduct, setDonationProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [useDonationImage, setUseDonationImage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const API_SERVER_HOST = "http://localhost:8080";

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        console.log(productData);

        try {
          const donationData = await getDonationProductByOriginalId(id);
          setDonationProduct(donationData);
        } catch {
          setDonationProduct(null);
        }
      } catch (err) {
        console.error("상품 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getUserEmailFromCookie = () => {
    const token = getCookie("member")?.accessToken;
    if (!token) return null;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.sub || payload.email || null;
  };

  const handleAddToCart = async () => {
    if (!selectedOption) return alert("옵션을 선택해주세요.");
    const userEmail = getUserEmailFromCookie();
    if (!userEmail) return alert("로그인이 필요합니다.");

    try {
      await addCart({
        cartItemId: null,
        productId: product.id,
        optionId: Number(selectedOption),
        quantity: quantity,
      });
      await dispatch(fetchCartItems());
      alert("장바구니에 담겼습니다.");
      navigate("/cart");
    } catch (error) {
      alert("장바구니 담기에 실패했습니다: " + error.message);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOption) return alert("옵션을 선택해주세요.");

    const userEmail = getUserEmailFromCookie();
    if (!userEmail) return alert("로그인이 필요합니다.");

    // 선택된 옵션 찾기
    const selectedOptionObject = product.options.find(
      (opt) => opt.id === parseInt(selectedOption)
    );
    if (!selectedOptionObject) {
      alert("선택된 옵션을 찾을 수 없습니다.");
      return;
    }

    // 옵션 가격 계산 (할인율 적용)
    const optionPrice = selectedOptionObject.price || product.basePrice;
    const totalAmount = optionPrice * quantity;

    console.log("가격 계산:", {
      optionPrice,
      quantity,
      totalAmount,
      selectedOption: selectedOptionObject,
    });

    // 주문 데이터 준비
    const orderRequestDTO = {
      items: [
        {
          productId: product.id,
          optionId: parseInt(selectedOption),
          quantity: quantity,
        },
      ],
    };

    // 결제 페이지로 이동할 데이터 준비
    const orderData = {
      orderRequestDTO: orderRequestDTO,
      orderName: `${product.name} ${quantity}개`,
      totalAmount: totalAmount, // 올바른 가격 계산 적용
      buyerName: userEmail.split("@")[0], // 임시로 이메일에서 이름 추출
      buyerEmail: userEmail,
      buyerTel: "010-0000-0000", // 임시 전화번호
      buyerAddr: "서울시 강남구", // 임시 주소
      buyerPostcode: "12345", // 임시 우편번호
    };

    // 결제 페이지로 이동
    navigate("/order/payment", { state: { orderData } });
  };

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (!product)
    return <div className="text-center py-8">상품이 존재하지 않습니다.</div>;

  return (
    <div className="pt-36 min-h-screen max-w-[1440px] mx-auto py-4 bg-[#ffffff] border-l-4 border-r-4">
      <section className="px-6 py-10 bg-white max-w-5xl mx-auto rounded-2xl shadow-xl pt-20 ">
        <div className="flex flex-col md:flex-row gap-10">
          <ProductImageViewer
            images={product.images}
            mainImageIdx={mainImageIdx}
            setMainImageIdx={setMainImageIdx}
            donationImageUrl={donationProduct?.images?.[0]?.imageUrl}
            useDonationImage={useDonationImage}
            setUseDonationImage={setUseDonationImage}
          />

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <ProductSummary product={product} />
              <ProductOptionSelector
                product={product}
                donationProduct={donationProduct}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                quantity={quantity}
                setQuantity={setQuantity}
                setUseDonationImage={setUseDonationImage}
              />
              <DonationInfoBox
                donationProduct={donationProduct}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                setUseDonationImage={setUseDonationImage}
              />
              <ActionButtons
                onPurchase={handlePurchase}
                onAddToCart={handleAddToCart}
                disabled={!selectedOption}
              />
            </div>
            <div className="text-xs text-gray-400 mt-6">
              등록일: {new Date(product.createdAt).toLocaleDateString("ko-KR")}{" "}
              | 수정일:{" "}
              {new Date(product.updatedAt).toLocaleDateString("ko-KR")}
            </div>
          </div>
        </div>
      </section>

      {/* 실착용 사진 섹션 */}
      <section className="px-6 py-10 mx-auto">
        <div className="bg-white rounded-2xl shadow p-6">
          {product.images && product.images.length > 0 ? (
            <div className="flex flex-col gap-6">
              {product.images.map((image, idx) => (
                <div key={image.id || idx} className="w-full">
                  <img
                    src={`${API_SERVER_HOST}${image.url}`}
                    alt={image.altText || `실착용 이미지 ${idx + 1}`}
                    className="w-full max-h-[800px] object-contain rounded-lg shadow-lg"
                  />
                </div>
              ))}
              <div className="mx-auto">
                <p className="text-lg font-semibold mb-4">사이즈표</p>{" "}
                <img src={"/87.jpg"} alt="사이즈표" />
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              등록된 실착용 사진이 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* 리뷰 섹션 */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        <ReviewSection productId={product.id} />
      </section>
    </div>
  );
};

export default ProductDetailPage;
