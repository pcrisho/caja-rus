"use client";

type DayData = {
  date: string;
  total: number;
};

type Props = {
  data: DayData[];
};

export function SalesSummaryChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.total), 1);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Ventas — últimos 7 días
      </p>

      <div className="flex items-end justify-between gap-2 h-28">
        {data.map((d, i) => {
          const pct = (d.total / max) * 100;
          const date = new Date(d.date + "T12:00:00");
          const dayLabel = days[date.getDay()];
          const isToday =
            d.date === new Date().toISOString().split("T")[0];

          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full flex flex-col justify-end"
                style={{ height: "88px" }}
                title={`S/ ${d.total.toFixed(2)}`}
              >
                <div
                  className={`w-full transition-all duration-500 ${
                    isToday ? "bg-emerald-600" : "bg-blue-900 dark:bg-blue-400"
                  }`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-zinc-400"
                }`}
              >
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-zinc-400">
        <span>
          Total:{" "}
          <strong className="text-gray-900 dark:text-zinc-50">
            S/ {data.reduce((s, d) => s + d.total, 0).toFixed(2)}
          </strong>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-600 inline-block" />
          Hoy
          <span className="w-3 h-3 bg-blue-900 dark:bg-blue-400 inline-block ml-1" />
          Otros días
        </span>
      </div>
    </div>
  );
}
