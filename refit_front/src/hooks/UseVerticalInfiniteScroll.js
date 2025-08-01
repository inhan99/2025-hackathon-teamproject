import { useState, useEffect, useRef, useCallback } from "react";

export function useVerticalInfiniteScroll(
  apiFunc,
  apiParams = null,
  pageSize = 20
) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const observerRef = useRef(null);
  const lastElementRef = useRef(null);

  const loadMore = useCallback(async () => {
    console.log("loadMore 호출:", {
      loading,
      hasMore,
      page,
      pageSize,
      apiParams,
    });

    // apiParams가 null이거나 유효하지 않으면 로드하지 않음
    if (!apiParams || loading || !hasMore) {
      console.log("loadMore 중단:", {
        noApiParams: !apiParams,
        loading,
        hasMore,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiFunc({ ...apiParams, page, size: pageSize });
      console.log("API 응답:", response);

      if (!response || !response.products || response.products.length === 0) {
        console.log("더 이상 데이터 없음");
        setHasMore(false);
      } else {
        console.log("데이터 추가:", response.products.length, "개");
        setItems((prev) => [...prev, ...response.products]);
        setTotalCount(response.totalCount || 0);
        setPage((prev) => prev + 1);

        // 더 로드할 데이터가 있는지 확인
        if (
          response.products.length < pageSize ||
          (response.totalCount &&
            items.length + response.products.length >= response.totalCount)
        ) {
          setHasMore(false);
        }
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [apiFunc, apiParams, page, pageSize, loading, hasMore, items.length]);

  useEffect(() => {
    // apiParams가 유효할 때만 loadMore 호출
    if (apiParams) {
      console.log("apiParams 변경으로 인한 loadMore 호출:", apiParams);
      loadMore();
    }
  }, [apiParams, loadMore]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && apiParams) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, apiParams]);

  const reset = useCallback(() => {
    console.log("useVerticalInfiniteScroll reset 호출");
    setItems([]);
    setPage(0);
    setLoading(false);
    setHasMore(true);
    setTotalCount(0);
  }, []);

  return {
    items,
    loading,
    hasMore,
    totalCount,
    lastElementRef,
    reset,
  };
}
