import { useState, useEffect, useCallback } from "react";
import { getAllCategory } from "../api/categoryApi";

export const useCategory = () => {
  const [categories, setCategories] = useState({});
  const [categoryIds, setCategoryIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 전체 카테고리 정보 로드
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllCategory();
      console.log("DB에서 가져온 카테고리 데이터:", data);

      // DB 데이터를 프론트엔드 형식으로 변환
      const transformedCategories = {};
      const transformedCategoryIds = {};

      // 백엔드 API 응답 형식:
      // [
      //   { id: 1, name: "반팔", categoryId: 1, categoryName: "상의" },
      //   { id: 2, name: "긴팔", categoryId: 1, categoryName: "상의" },
      //   { id: 3, name: "아우터", categoryId: 1, categoryName: "상의" },
      //   { id: 4, name: "반바지", categoryId: 2, categoryName: "하의" },
      //   ...
      // ]

      if (Array.isArray(data)) {
        // 메인 카테고리별로 그룹화
        const groupedByMain = data.reduce((acc, item) => {
          const mainCategoryId = item.categoryId;
          const subCategoryName = item.name;
          const subCategoryId = item.id;

          // DB에서 가져온 메인 카테고리 이름 사용
          const mainCategoryName = item.categoryName;

          if (!acc[mainCategoryName]) {
            acc[mainCategoryName] = [];
            transformedCategoryIds[mainCategoryName] = {
              id: mainCategoryId,
              subCategories: {},
            };
          }

          if (!acc[mainCategoryName].includes(subCategoryName)) {
            acc[mainCategoryName].push(subCategoryName);
          }

          transformedCategoryIds[mainCategoryName].subCategories[
            subCategoryName
          ] = subCategoryId;

          return acc;
        }, {});

        setCategories(groupedByMain);
        setCategoryIds(transformedCategoryIds);
      } else {
        console.error("예상치 못한 카테고리 데이터 형식:", data);
        setError("카테고리 데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("카테고리 로드 실패:", err);
      setError("카테고리 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ID로 카테고리 이름 찾기
  const getCategoryNameById = useCallback(
    (mainId, subId) => {
      for (const [mainName, mainData] of Object.entries(categoryIds)) {
        if (mainData.id === parseInt(mainId)) {
          for (const [subName, subDataId] of Object.entries(
            mainData.subCategories
          )) {
            if (subDataId === parseInt(subId)) {
              return `${mainName} - ${subName}`;
            }
          }
        }
      }
      return `카테고리 ${mainId} - ${subId}`;
    },
    [categoryIds]
  );

  // 메인 카테고리 ID로 메인 카테고리 이름 찾기
  const getMainCategoryNameById = useCallback(
    (mainId) => {
      for (const [mainName, mainData] of Object.entries(categoryIds)) {
        if (mainData.id === parseInt(mainId)) {
          return mainName;
        }
      }
      return `카테고리 ${mainId}`;
    },
    [categoryIds]
  );

  // 초기 로드
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    categoryIds,
    loading,
    error,
    getCategoryNameById,
    getMainCategoryNameById,
    reloadCategories: loadCategories,
  };
};
