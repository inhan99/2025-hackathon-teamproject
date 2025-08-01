// import React, { useEffect, useState } from "react";
// import { getProductById } from "../../api/productsApi"; // 경로 맞게 수정

// const API_SERVER_HOST = "http://localhost:8080"; // 백엔드 주소

// const HotProductsComponent = () => {
//   const [product, setProduct] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const data = await getProductById(1); // 예시로 id=1 상품 가져오기
//         setProduct(data);
//       } catch (error) {
//         console.error("상품 불러오기 실패:", error);
//       }
//     };
//     fetchProduct();
//   }, []);

//   if (!product) return <div>로딩 중...</div>;

//   return (
//     <section className="px-6 py-8 bg-white">
//       <h2 className="text-2xl font-bold mb-6 text-gray-900">🔥 인기 상품</h2>

//       <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//         <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300">
//           <img
//             src={
//               product.images?.[0]?.url
//                 ? `${API_SERVER_HOST}${product.images[0].url}`
//                 : "/default-image.jpg"
//             }
//             alt={product.images?.[0]?.altText || "상품 이미지"}
//             className="w-full h-48 object-cover"
//           />
//           <div className="p-4">
//             <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
//             <p className="text-gray-500 text-xs">
//               ₩{product.basePrice.toLocaleString()}
//             </p>
//             <p className="text-gray-600 text-xs mt-2">{product.description}</p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HotProductsComponent;
