import Link from "next/link";

type TaskItem = {
  title: string;
  count: number;
  description: string;
  href: string;
  buttonLabel: string;
  tone: "blue" | "amber" | "rose" | "zinc";
};

type TodayTasksProps = {
  transitionCount: number;
  pendingPublishCount: number;
  missingImageCount: number;
  missingLocationCount: number;
  loading?: boolean;
};

const toneStyles = {
  blue: {
    card: "border-blue-200 bg-blue-50",
    count: "text-blue-700",
    button:
      "bg-blue-600 text-white hover:bg-blue-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50",
    count: "text-amber-700",
    button:
      "bg-amber-600 text-white hover:bg-amber-700",
  },
  rose: {
    card: "border-rose-200 bg-rose-50",
    count: "text-rose-700",
    button:
      "bg-rose-600 text-white hover:bg-rose-700",
  },
  zinc: {
    card: "border-zinc-200 bg-white",
    count: "text-zinc-900",
    button:
      "bg-zinc-900 text-white hover:bg-zinc-700",
  },
} as const;

export default function TodayTasks({
  transitionCount,
  pendingPublishCount,
  missingImageCount,
  missingLocationCount,
  loading = false,
}: TodayTasksProps) {
  const tasks: TaskItem[] = [
    {
      title: "선착순 전환 확인",
      count: transitionCount,
      description:
        "청약 계약 종료 후 15일 이상 지난 단지입니다.",
      href: "/admin/apartments?task=transition",
      buttonLabel: "전환 대상 보기",
      tone: "blue",
    },
    {
      title: "게시 대기",
      count: pendingPublishCount,
      description:
        "등록되었지만 아직 홈페이지에 게시되지 않은 단지입니다.",
      href: "/admin/apartments?task=pending",
      buttonLabel: "게시 관리",
      tone: "amber",
    },
    {
      title: "대표 이미지 없음",
      count: missingImageCount,
      description:
        "홈과 검색 카드에 사용할 대표 이미지가 없는 단지입니다.",
      href: "/admin/apartments?task=image",
      buttonLabel: "이미지 등록",
      tone: "rose",
    },
    {
      title: "지도 위치 미확인",
      count: missingLocationCount,
      description:
        "위도 또는 경도가 저장되지 않은 단지입니다.",
      href: "/admin/apartments?task=location",
      buttonLabel: "위치 확인",
      tone: "zinc",
    },
  ];

  return (
    <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-bold text-emerald-600">
          TODAY TASKS
        </p>

        <h2 className="mt-1 text-2xl font-black text-zinc-900">
          오늘 확인할 작업
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          사이트 운영에 필요한 항목을 우선순위별로 확인합니다.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tasks.map((task) => {
          const styles =
            toneStyles[task.tone];

          return (
            <article
              key={task.title}
              className={[
                "rounded-2xl border p-5 transition",
                "hover:-translate-y-0.5 hover:shadow-md",
                styles.card,
              ].join(" ")}
            >
              <p className="text-sm font-bold text-zinc-700">
                {task.title}
              </p>

              {loading ? (
                <div className="mt-3 h-11 w-20 animate-pulse rounded-xl bg-white/70" />
              ) : (
                <p
                  className={[
                    "mt-2 text-4xl font-black",
                    styles.count,
                  ].join(" ")}
                >
                  {task.count}
                  <span className="ml-1 text-base">
                    건
                  </span>
                </p>
              )}

              <p className="mt-2 min-h-12 text-xs leading-5 text-zinc-500">
                {task.description}
              </p>

              <Link
                href={task.href}
                className={[
                  "mt-4 inline-flex w-full cursor-pointer",
                  "items-center justify-center rounded-xl",
                  "px-4 py-2.5 text-sm font-bold transition",
                  "hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2",
                  "focus:ring-emerald-500 focus:ring-offset-2",
                  styles.button,
                ].join(" ")}
              >
                {task.buttonLabel}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}