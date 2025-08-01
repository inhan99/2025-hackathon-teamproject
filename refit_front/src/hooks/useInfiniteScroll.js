import { useState, useEffect, useRef, useCallback } from "react";

export function useInfiniteScroll(
  apiFunc,
  apiParams = {},
  pageSize = 10,
  key = ""
) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);

  // key 바뀌면 모든 상태 초기화
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, [key]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await apiFunc({ ...apiParams, page, size: pageSize });
      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (e) {
      console.error("데이터 로드 실패", e);
    } finally {
      setLoading(false);
    }
  }, [apiFunc, apiParams, page, pageSize, loading, hasMore, key]);

  useEffect(() => {
    if (page === 0 && hasMore) {
      loadMore();
    }
  }, [page, hasMore, loadMore]);

  const onScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 200) {
      loadMore();
    }
  };

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, [key]);

  return { items, loading, hasMore, scrollRef, onScroll, reset };
}
