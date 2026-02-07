"use client"

import { useState, useCallback, lazy, Suspense } from "react"
import {
  MapPin,
  Map,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  Brain,
  BarChart3,
  CalendarDays,
  Zap,
  ChevronDown,
} from "lucide-react"
import { parkingZones, getStressColor, getStressLabel } from "@/lib/parking-data"

const MapView = lazy(() => import("@/components/MapView"))
const PredictionsPanel = lazy(() => import("@/components/PredictionsPanel"))
const AnalyticsPanel = lazy(() => import("@/components/AnalyticsPanel"))
const EventsPanel = lazy(() => import("@/components/EventsPanel"))

type TabKey = "overview" | "predictions" | "analytics" | "events"

const tabs: { key: TabKey; label: string; icon: typeof Brain }[] = [
  { key: "overview", label: "Live Overview", icon: Zap },
  { key: "predictions", label: "AI Predictions", icon: Brain },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "events", label: "Event Impact", icon: CalendarDays },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [isSimulating, setIsSimulating] = useState(false)
  const [insightMode, setInsightMode] = useState(true)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const handleSelectZone = useCallback((zoneId: string | null) => {
    setSelectedZone(zoneId)
  }, [])

  // Aggregate stats
  const totalSpots = parkingZones.reduce((s, z) => s + z.totalSpots, 0)
  const totalAvailSpots = parkingZones.reduce(
    (s, z) => s + Math.round((z.currentAvail / 100) * z.totalSpots),
    0,
  )
  const overallAvail = Math.round((totalAvailSpots / totalSpots) * 100)
  const overallPred = Math.round(
    parkingZones.reduce((s, z) => s + z.predicted30, 0) / parkingZones.length,
  )
  const overallStress = Math.round(
    parkingZones.reduce((s, z) => s + z.stressIndex, 0) / parkingZones.length,
  )
  const avgConfidence = Math.round(
    parkingZones.reduce((s, z) => s + z.confidence, 0) / parkingZones.length,
  )

  const simAvail = isSimulating ? Math.max(8, overallAvail - 14) : overallAvail
  const simPred = isSimulating ? Math.max(5, overallPred - 12) : overallPred
  const simStress = isSimulating ? Math.min(98, overallStress + 24) : overallStress

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f0f2f5]">
      {/* ====== HEADER ====== */}
      <header className="flex items-center justify-between bg-[#0f2557] px-6 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#1e3a8a] p-2">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">ParkSense</h1>
            <p className="text-[11px] font-medium tracking-wide text-blue-300">
              AI-Powered Parking Intelligence
            </p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="hidden items-center gap-1 md:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white">
            <Map className="h-4 w-4" /> Melbourne
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white">
            <Clock className="h-4 w-4" /> Live
            <span className="relative ml-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Selector */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 md:hidden">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabKey)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none"
          >
            {tabs.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="Current Availability"
          value={`${simAvail}%`}
          subValue={`${totalAvailSpots} of ${totalSpots} spots`}
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          label="Predicted (30 min)"
          value={`${simPred}%`}
          valueColor="text-red-600"
          subValue={isSimulating ? "Event surge active" : "Trending down"}
        />
        <StatCard
          icon={Activity}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Parking Stress Index"
          value={String(simStress)}
          valueColor={`text-[${getStressColor(simStress)}]`}
          subValue={`${getStressLabel(simStress)} | /100`}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Model Confidence"
          value={`${avgConfidence}%`}
          valueColor="text-blue-600"
          subValue="Ensemble average"
        />
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          }
        >
          {activeTab === "overview" && (
            <OverviewTab
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              insightMode={insightMode}
              setInsightMode={setInsightMode}
              selectedZone={selectedZone}
              onSelectZone={handleSelectZone}
            />
          )}
          {activeTab === "predictions" && (
            <PredictionsPanel selectedZone={selectedZone} onSelectZone={handleSelectZone} />
          )}
          {activeTab === "analytics" && <AnalyticsPanel />}
          {activeTab === "events" && (
            <EventsPanel
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}

// ============================================================
// Overview Tab (original map + sidebar, enhanced)
// ============================================================

function OverviewTab({
  isSimulating,
  setIsSimulating,
  insightMode,
  setInsightMode,
  selectedZone,
  onSelectZone,
}: {
  isSimulating: boolean
  setIsSimulating: (v: boolean) => void
  insightMode: boolean
  setInsightMode: (v: boolean) => void
  selectedZone: string | null
  onSelectZone: (id: string | null) => void
}) {
  const selected = selectedZone ? parkingZones.find((z) => z.id === selectedZone) : null

  return (
    <div className="grid min-h-[420px] flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      {/* Map */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        }
      >
        <MapView
          isSimulating={isSimulating}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
        />
      </Suspense>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Zone quick info */}
        {selected && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">{selected.name}</h3>
              <button
                type="button"
                onClick={() => onSelectZone(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Available" value={`${selected.currentAvail}%`} color={selected.color} />
              <MiniStat label="In 30 min" value={`${selected.predicted30}%`} color="#f59e0b" />
              <MiniStat label="Confidence" value={`${selected.confidence}%`} color="#3b82f6" />
              <MiniStat label="Stress" value={`${selected.stressIndex}`} color={getStressColor(selected.stressIndex)} />
            </div>
          </div>
        )}

        {/* Controls card */}
        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* Toggle */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Authority Insight Mode
            </span>
            <label className="relative inline-block h-6 w-11 cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={insightMode}
                onChange={() => setInsightMode(!insightMode)}
              />
              <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#1e3a8a]" />
              <span className="absolute bottom-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Simulate */}
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              isSimulating
                ? "border-red-500 bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            {isSimulating ? "Stop Simulation" : "Simulate Event Surge"}
          </button>

          {/* Insights */}
          {insightMode && (
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Why is PSI {getStressLabel(isSimulating ? 82 : 58)}?
              </h3>
              <div className="flex flex-col gap-2.5">
                <InsightBar label="Peak office hours" level="High" color="#ef4444" pct={85} />
                <InsightBar label="Heavy traffic inflow" level="High" color="#ef4444" pct={92} />
                <InsightBar label="Event nearby" level={isSimulating ? "Critical" : "Med"} color={isSimulating ? "#ef4444" : "#f59e0b"} pct={isSimulating ? 98 : 60} />
                <InsightBar label="Two-wheeler density" level="Med" color="#f59e0b" pct={60} />
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="mt-auto border-t border-gray-100 pt-4 text-[13px] leading-relaxed text-gray-500">
            <strong className="text-gray-700">AI Recommendation:</strong> Divert traffic from
            Flinders St to Docklands Parking A & B. Estimated time savings: 12 min.
          </div>
        </div>

        {/* Zone list */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            All Zones
          </h3>
          <div className="flex flex-col gap-2">
            {parkingZones.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => onSelectZone(z.id === selectedZone ? null : z.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  z.id === selectedZone
                    ? "bg-blue-50 ring-1 ring-blue-300"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: z.color }}
                  />
                  <span className="font-medium text-gray-700">{z.name}</span>
                </div>
                <span className="font-semibold" style={{ color: z.color }}>
                  {z.currentAvail}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Shared small components
// ============================================================

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  subValue,
}: {
  icon: typeof TrendingUp
  iconBg: string
  iconColor: string
  label: string
  value: string
  valueColor?: string
  subValue?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-[11px] font-medium text-gray-500">{label}</h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold ${valueColor ?? "text-gray-900"}`}>
            {value}
          </span>
          {subValue && (
            <span className="truncate text-[11px] text-gray-400">{subValue}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function InsightBar({
  label,
  level,
  color,
  pct,
}: {
  label: string
  level: string
  color: string
  pct: number
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[13px] font-medium text-gray-700">
        <span>{label}</span>
        <span style={{ color }}>{level}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-white p-2 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase text-gray-400">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
