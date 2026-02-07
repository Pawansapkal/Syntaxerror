"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingUp,
  Users,
  Car,
  Clock,
} from "lucide-react"
import {
  hourlyPattern,
  dailyPattern,
  parkingZones,
  trafficFlows,
} from "@/lib/parking-data"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from "recharts"

const zoneRadarData = parkingZones.map((z) => ({
  zone: z.name.length > 10 ? `${z.name.slice(0, 10)}...` : z.name,
  availability: z.currentAvail,
  stress: z.stressIndex,
  confidence: z.confidence,
}))

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const HOURS = ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"] as const

function buildHeatmap() {
  const grid: { day: string; hour: string; value: number }[] = []
  for (const day of DAYS) {
    const di = DAYS.indexOf(day)
    for (const hour of HOURS) {
      const hi = HOURS.indexOf(hour)
      const base = dailyPattern[di]?.avgOccupancy ?? 60
      const hourMod = hourlyPattern[hi * 2]?.occupancy ?? 50
      const value = Math.min(100, Math.round((base + hourMod) / 2 + ((di * 7 + hi * 3) % 10 - 5)))
      grid.push({ day, hour, value })
    }
  }
  return grid
}
const heatmapData = buildHeatmap()

function heatColor(val: number) {
  if (val >= 85) return "#ef4444"
  if (val >= 70) return "#f59e0b"
  if (val >= 50) return "#fbbf24"
  return "#10b981"
}

export default function AnalyticsPanel() {
  const [chartView, setChartView] = useState<"hourly" | "daily">("hourly")

  const avgOccupancy = Math.round(
    hourlyPattern.reduce((s, h) => s + h.occupancy, 0) / hourlyPattern.length,
  )
  const peakHour = hourlyPattern.reduce(
    (max, h) => (h.occupancy > max.occupancy ? h : max),
    hourlyPattern[0],
  )
  const totalCapacity = parkingZones.reduce((s, z) => s + z.totalSpots, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={BarChart3} label="Avg Occupancy" value={`${avgOccupancy}%`} sub="Today" iconColor="text-blue-600" iconBg="bg-blue-100" />
        <SummaryCard icon={Clock} label="Peak Hour" value={peakHour.hour} sub={`${peakHour.occupancy}% full`} iconColor="text-red-600" iconBg="bg-red-100" />
        <SummaryCard icon={Car} label="Total Capacity" value={totalCapacity.toLocaleString()} sub="All zones" iconColor="text-emerald-600" iconBg="bg-emerald-100" />
        <SummaryCard icon={Users} label="Avg Turnover" value="3.2x" sub="Per spot/day" iconColor="text-orange-600" iconBg="bg-orange-100" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Hourly / Daily toggle */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Occupancy Patterns</h3>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
              {(["hourly", "daily"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChartView(v)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    chartView === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === "hourly" ? (
                <AreaChart data={hourlyPattern}>
                  <defs>
                    <linearGradient id="aGradOcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aGradPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                  <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={2} fill="url(#aGradOcc)" name="Actual" />
                  <Area type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fill="url(#aGradPred)" name="Predicted" />
                  <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              ) : (
                <BarChart data={dailyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="avgOccupancy" name="Avg" radius={[4, 4, 0, 0]}>
                    {dailyPattern.map((entry) => (
                      <Cell key={entry.day} fill={heatColor(entry.avgOccupancy)} />
                    ))}
                  </Bar>
                  <Bar dataKey="peakOccupancy" name="Peak" fill="#3b82f6" opacity={0.4} radius={[4, 4, 0, 0]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-800">Zone Performance Radar</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={zoneRadarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="zone" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <Radar name="Availability" dataKey="availability" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Stress" dataKey="stress" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Radar name="Confidence" dataKey="confidence" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Heatmap */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-1 text-sm font-bold text-gray-800">Weekly Occupancy Heatmap</h3>
          <p className="mb-4 text-[11px] text-gray-400">Average occupancy by day and time</p>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px]">
              <thead>
                <tr>
                  <th className="w-12 pb-2 text-left font-semibold text-gray-500" />
                  {HOURS.map((h) => (
                    <th key={h} className="pb-2 font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="py-1 text-left font-semibold text-gray-600">{day}</td>
                    {heatmapData.filter((d) => d.day === day).map((cell) => (
                      <td key={`${cell.day}-${cell.hour}`} className="p-0.5">
                        <div
                          className="mx-auto flex h-7 w-full max-w-[36px] items-center justify-center rounded text-[8px] font-bold text-white"
                          style={{ backgroundColor: heatColor(cell.value), opacity: 0.65 + (cell.value / 100) * 0.35 }}
                          title={`${cell.day} ${cell.hour}: ${cell.value}%`}
                        >
                          {cell.value}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: "#10b981" }} /> {"< 50%"}</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: "#fbbf24" }} /> 50-70%</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: "#f59e0b" }} /> 70-85%</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded" style={{ backgroundColor: "#ef4444" }} /> {"85%+"}</span>
          </div>
        </div>

        {/* Traffic */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-bold text-gray-800">Traffic Corridors</h3>
          <p className="mb-4 text-[11px] text-gray-400">Real-time congestion levels</p>
          <div className="flex flex-col gap-3">
            {trafficFlows.map((tf) => (
              <div key={tf.corridor}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-medium text-gray-700">{tf.corridor}</span>
                  <span className="flex items-center gap-1 font-semibold" style={{
                    color: tf.congestionLevel > 70 ? "#ef4444" : tf.congestionLevel > 50 ? "#f59e0b" : "#10b981",
                  }}>
                    {tf.congestionLevel}%
                    {tf.trend === "increasing" && <TrendingUp className="h-3 w-3" />}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${tf.congestionLevel}%`,
                      backgroundColor: tf.congestionLevel > 70 ? "#ef4444" : tf.congestionLevel > 50 ? "#f59e0b" : "#10b981",
                    }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-gray-400">{tf.direction} &middot; {tf.avgSpeed} km/h</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
  iconBg,
}: {
  icon: typeof BarChart3
  label: string
  value: string
  sub: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  )
}
