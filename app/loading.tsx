export default function Loading() {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-xl">
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600"
          />
  
          <span className="text-sm font-extrabold text-[#0F766E]">
            페이지를 불러오는 중입니다
          </span>
        </div>
      </div>
    );
  }
