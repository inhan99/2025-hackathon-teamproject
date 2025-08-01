import { getProductById } from "../../api/productsApi";

export const handleGraphMessage = async (
  text,
  setProductCache,
  productCache
) => {
  try {
    const res = await fetch("http://localhost:8000/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "그래프 생성 중 오류가 발생했습니다."
      );
    }

    const chartData = await res.json();

    if (chartData.productIds && chartData.productIds.length > 0) {
      const productPromises = chartData.productIds.map((productId) =>
        getProductInfo(productId, setProductCache, productCache)
      );
      await Promise.all(productPromises);
    }

    const botMessage = {
      type: "bot",
      content: "그래프가 생성되었습니다! 📊",
      chartData: chartData,
      timestamp: new Date(),
    };
    return { botMessage };
  } catch (error) {
    console.error("서버 오류 (graph):", error);
    const errorMessage = {
      type: "bot",
      content: "❌ 그래프 생성 중 서버 오류가 발생했습니다.",
      timestamp: new Date(),
    };
    return { botMessage: errorMessage };
  }
};

// 상품 정보 가져오기 (캐시 활용)
export const getProductInfo = async (
  productId,
  setProductCache,
  productCache
) => {
  if (productCache[productId]) {
    return productCache[productId];
  }

  try {
    const productInfo = await getProductById(productId);
    setProductCache((prev) => ({
      ...prev,
      [productId]: productInfo,
    }));
    return productInfo;
  } catch (error) {
    console.error(`상품 정보 가져오기 실패 (ID: ${productId}):`, error);
    return null;
  }
};
