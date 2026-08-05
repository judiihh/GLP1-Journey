"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

const chartColors = {
  lavender: "#a892d4",
  rose: "#d48989",
  turquoise: "#4db8aa",
  sage: "#9fb89f",
};

interface ChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  type?: "line" | "area" | "bar";
  unit?: string;
}

export function TrendChart({
  data,
  dataKey,
  xKey = "date",
  color = chartColors.lavender,
  height = 220,
  type = "area",
  unit = "",
}: ChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        Log some data to see your trends here
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-soft border border-lavender-100 text-sm">
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-semibold text-gray-800">
          {payload[0].value}{unit}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 overflow-hidden" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      {type === "bar" ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ecf8" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      ) : type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ecf8" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ecf8" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#grad-${dataKey})`}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
    </div>
  );
}

export function BodyMap({
  sites,
  suggestedSite,
}: {
  sites: {
    id: string;
    label: string;
    shortLabel: string;
    lastUsed: string | null;
    count: number;
  }[];
  suggestedSite?: string;
}) {
  const getSiteColor = (id: string, lastUsed: string | null) => {
    if (id === suggestedSite) return "bg-turquoise-300 ring-2 ring-turquoise-400";
    if (!lastUsed) return "bg-lavender-100";
    const daysSince = lastUsed
      ? Math.floor(
          (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;
    if (daysSince < 3) return "bg-rose-200";
    if (daysSince < 7) return "bg-rose-100";
    return "bg-sage-200";
  };

  const sitePositions: Record<string, string> = {
    "upper-arm-left": "top-[18%] left-[8%]",
    "upper-arm-right": "top-[18%] right-[8%]",
    "abdomen-left": "top-[38%] left-[30%]",
    "abdomen-right": "top-[38%] right-[30%]",
    "thigh-left": "bottom-[22%] left-[28%]",
    "thigh-right": "bottom-[22%] right-[28%]",
  };

  return (
    <div className="relative w-48 h-64 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-56 rounded-full bg-lavender-50/50 border-2 border-lavender-100 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-lavender-50 border-2 border-lavender-100" />
          {sites.map((site) => (
            <div
              key={site.id}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-medium text-gray-700 transition-all ${sitePositions[site.id]} ${getSiteColor(site.id, site.lastUsed)}`}
              title={`${site.label}${site.lastUsed ? ` — last used ${site.lastUsed}` : ""}`}
            >
              {site.shortLabel}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 flex justify-center gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sage-200" /> Ready
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-200" /> Recent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-turquoise-300" /> Suggested
        </span>
      </div>
    </div>
  );
}
