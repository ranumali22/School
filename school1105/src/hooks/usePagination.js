import { useState, useEffect } from "react";

const usePagination = (data = [], defaultItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const safeData = data || [];

  const totalPages = Math.ceil((safeData.length || 0) / itemsPerPage);

  // ✅ ONLY FIX (IMPORTANT)
  useEffect(() => {
    setCurrentPage(1);
  }, [safeData.length]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentData = safeData.slice(indexOfFirst, indexOfLast);

  const changeItemsPerPage = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    itemsPerPage,
    changeItemsPerPage,
  };
};

export default usePagination;
