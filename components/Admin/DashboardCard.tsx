import Link from "next/link";

type DashboardCardColor =
  | "blue"
  | "green"
  | "amber"
  | "zinc";

type DashboardCardProps = {
  title: string;
  count: number;
  description: string;
  href?: string;
  buttonLabel?: string;
  color?: DashboardCardColor;
  loading?: boolean;
};

const colorStyles: Record<
  DashboardCardColor,
  {
    card: string;
    count: string;
    button: string;
  }
> = {
  blue: {
    card: "border-blue-200 bg-blue-50",
    count: "text-blue-700",
    button:
      "bg-blue-600 text-white hover:bg-blue-700",
  },

  green: {
    card:
      "border-emerald-200 bg-emerald-50",
    count: "text-emerald-700",
    button:
      "bg-emerald-600 text-white hover:bg-emerald-700",
  },

  amber: {
    card: "border-amber-200 bg-amber-50",
    count: "text-amber-700",
    button:
      "bg-amber-600 text-white hover:bg-amber-700",
  },

  zinc: {
    card: "border-zinc-200 bg-white",
    count: "text-zinc-900",
    button:
      "bg-zinc-900 text-white hover:bg-zinc-700",
  },
};

export default function DashboardCard({
  title,
  count,
  description,
  href,
  buttonLabel = "보기",
  color = "zinc",
  loading = false,
}: DashboardCardProps) {
  const styles = colorStyles[color];

  return (
    <article
      className={[
        "rounded-3xl border p-5 shadow-sm transition",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.card,
      ].join(" ")}
    >
      <p className="text-sm font-bold text-zinc-600">
        {title}
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
          {count}
          <span className="ml-1 text-base font-bold">
            건
          </span>
        </p>
      )}

      <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">
        {description}
      </p>

      {href && (
        <Link
          href={href}
          className={[
            "mt-4 inline-flex w-full cursor-pointer items-center justify-center",
            "rounded-xl px-4 py-2.5 text-sm font-bold transition",
            "hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
            styles.button,
          ].join(" ")}
        >
          {buttonLabel}
        </Link>
      )}
    </article>
  );
}