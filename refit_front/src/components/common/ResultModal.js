const ResultModal = ({ title, content, callbackFn }) => {
  const handleClose = (e) => {
    e.stopPropagation();
    callbackFn?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 모달 닫힘 방지
      >
        {/* 타이틀 */}
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-4">
          {title}
        </h2>

        {/* 내용 */}
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-6">
          {content}
        </p>

        {/* 닫기 버튼 */}
        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            onClick={handleClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
