export default function Loading() {
    return (
      <div
        role="status"
        aria-label="페이지를 불러오는 중"
        className="fixed inset-x-0 top-0 z-[9997] h-1 overflow-hidden bg-emerald-100"
      >
        <div className="h-full w-1/2 animate-[jibnun-loading_1s_ease-in-out_infinite] bg-[#0F8F88]" />
  
        <style>{`
          @keyframes jibnun-loading {
            0% {
              transform: translateX(-110%);
            }
  
            100% {
              transform: translateX(220%);
            }
          }
        `}</style>
      </div>
    );
  }
  