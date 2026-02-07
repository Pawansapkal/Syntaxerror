"use client"

import { useState, useMemo } from "react"
import {
  Brain,
  Clock,
  Target,
  AlertTriangle,
  ChevronRight,
  Gauge,
  MapPin,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react"
import {
  parkingZones,
  zonePredictions,
  trafficFlows,
  getStressColor,
  getStressLabel,
} from "@/lib/parking-data"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PredictionsPanelProps {
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}

export default function PredictionsPanel({ selectedZone, onSelectZone }: PredictionsPanelProps) {
  const [timeHorizon, setTimeHorizon] = useState<"30" | "60" | "90">("30")

  const activeZone = selectedZone
    ? parkingZones.find((z) => z.id === selectedZone) ?? parkingZones[0]
    : parkingZones[0]

  const prediction = useMemo(
    () => zonePredictions.find((p) => p.zoneId === activeZone.id),
    [activeZone.id],
  )

  const chartData = prediction?.timeSlots.map((slot) => ({
    time: slot.time,
    availability: slot.availability,
    confidence: slot.confidence,
  })) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: zone selector + time horizon */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Zone pills */}
        <div className="flex flex-wrap gap-2">
          {parkingZones.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelectZone(z.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                activeZone.id === z.id
                  ? "bg-[#0f2557] text-white shadow-md"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-100"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: z.color }}
              />
              {z.name}
            </button>
          ))}
        </div>

        {/* Time horizon */}
        <div className="ml-auto flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm">
          {(["30", "60", "90"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeHorizon(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                timeHorizon === t
                  ? "bg-[#0f2557] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t} min
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT: Prediction details */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Zone header */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{activeZone.name}</h2>
                  <p className="text-xs text-gray-500">
                    {activeZone.type.charAt(0).toUpperCase() + activeZone.type.slice(1)} Parking
                    &middot; {activeZone.totalSpots} total spots
                  </p>
                </div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: getStressColor(activeZone.stressIndex) }}
              >
                {getStressLabel(activeZone.stressIndex)} Stress
              </span>
            </div>

            {/* Key metrics row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricBox
                label="Now"
                value={`${activeZone.currentAvail}%`}
                color={activeZone.color}
                icon={MapPin}
              />
              <MetricBox
                label={`In ${timeHorizon} min`}
                value={`${
                  timeHorizon === "30"
                    ? activeZone.predicted30
                    : timeHorizon === "60"
                      ? activeZone.predicted60
                      : Math.max(2, activeZone.predicted60 - 5)
                }%`}
                color="#f59e0b"
                icon={Clock}
              />
              <MetricBox
                label="Confidence"
                value={`${activeZone.confidence}%`}
                color="#3b82f6"
                icon={Target}
              />
              <MetricBox
                label="Stress"
                value={`${activeZone.stressIndex}/100`}
                color={getStressColor(activeZone.stressIndex)}
                icon={Gauge}
              />
            </div>
          </div>

          {/* Prediction chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Availability Forecast</h3>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-6 rounded-full bg-blue-500" /> Availability
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-6 rounded-full bg-emerald-400" /> Confidence
                </span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradAvail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="availability"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gradAvail)"
                    name="Availability"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gradConf)"
                    name="Confidence"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI explanation */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">AI Prediction Rationale</h3>
            </div>
            <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-amber-700">
              <li className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Historical patterns show {activeZone.name} drops by ~15% in next hour on weekdays
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Current traffic inflow on nearby corridors is above average
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Model uses ensemble of LSTM + XGBoost with 89% accuracy on test data
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Zone grid + traffic */}
        <div className="flex flex-col gap-4">
          {/* All zones comparison */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Zone Comparison
            </h3>
            <div className="flex flex-col gap-2">
              {parkingZones.map((z) => {
                const trend =
                  z.predicted30 < z.currentAvail
                    ? "down"
                    : z.predicted30 > z.currentAvail
                      ? "up"
                      : "stable"
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => onSelectZone(z.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                      activeZone.id === z.id ? "bg-blue-50 ring-1 ring-blue-300" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                      <span className="font-medium text-gray-700">{z.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: z.color }}>
                        {z.currentAvail}%
                      </span>
                      {trend === "down" && <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
                      {trend === "up" && <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />}
                      {trend === "stable" && <Minus className="h-3.5 w-3.5 text-gray-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confidence gauge */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Model Confidence
            </h3>
            <div className="flex flex-col items-center gap-3">
              <ConfidenceRing value={activeZone.confidence} />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{activeZone.confidence}%</p>
                <p className="text-xs text-gray-500">
                  {activeZone.confidence >= 85
                    ? "High reliability"
                    : activeZone.confidence >= 70
                      ? "Moderate reliability"
                      : "Low reliability"}
                </p>
              </div>
            </div>
          </div>

          {/* Traffic flows */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Traffic Feed
            </h3>
            <div className="flex flex-col gap-2">
              {trafficFlows.slice(0, 4).map((tf) => (
                <div key={tf.corridor} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{tf.corridor}</p>
                    <p className="text-[11px] text-gray-400">
                      {tf.direction} &middot; {tf.avgSpeed} km/h
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${tf.congestionLevel}%`,
                          backgroundColor: tf.congestionLevel > 70 ? "#ef4444" : tf.congestionLevel > 50 ? "#f59e0b" : "#10b981",
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-gray-600">
                      {tf.congestionLevel}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function MetricBox({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  color: string
  icon: typeof Clock
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4" style={{ color }} />
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase text-gray-400">{label}</p>
    </div>
  )
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 50
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference
  const color = value >= 85 ? "#10b981" : value >= 70 ? "#3b82f6" : "#f59e0b"

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-700"
      />
    </svg>
  )
}
