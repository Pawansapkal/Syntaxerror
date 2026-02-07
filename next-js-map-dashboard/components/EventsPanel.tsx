"use client"

import {
  Activity,
  Calendar,
  MapPin,
  Users,
  AlertTriangle,
  Music,
  Trophy,
  PartyPopper,
  ShoppingBag,
  Presentation,
  Zap,
  ArrowRight,
} from "lucide-react"
import {
  cityEvents,
  parkingZones,
  getImpactColor,
  type CityEvent,
} from "@/lib/parking-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const eventIcons: Record<CityEvent["type"], typeof Music> = {
  concert: Music,
  sports: Trophy,
  festival: PartyPopper,
  market: ShoppingBag,
  conference: Presentation,
}

const surgeChartData = cityEvents.map((e) => ({
  name: e.name.length > 12 ? `${e.name.slice(0, 12)}...` : e.name,
  surge: e.predictedSurge,
  impact: e.parkingImpact,
}))

interface EventsPanelProps {
  isSimulating: boolean
  onToggleSimulation: () => void
}

export default function EventsPanel({ isSimulating, onToggleSimulation }: EventsPanelProps) {
  const criticalEvents = cityEvents.filter((e) => e.parkingImpact === "critical")
  const totalAffectedZones = new Set(cityEvents.flatMap((e) => e.affectedZones)).size
  const maxSurge = Math.max(...cityEvents.map((e) => e.predictedSurge))

  return (
    <div className="flex flex-col gap-4">
      {/* Top summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={Calendar}
          label="Upcoming Events"
          value={String(cityEvents.length)}
          sub="Next 7 days"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Critical Impact"
          value={String(criticalEvents.length)}
          sub="Events"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <SummaryCard
          icon={MapPin}
          label="Zones Affected"
          value={String(totalAffectedZones)}
          sub={`of ${parkingZones.length} total`}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <SummaryCard
          icon={Zap}
          label="Max Demand Surge"
          value={`${maxSurge}%`}
          sub="AFL Grand Final"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Simulation banner */}
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
        isSimulating
          ? "border-red-300 bg-red-50"
          : "border-amber-200 bg-amber-50"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isSimulating ? "bg-red-100" : "bg-amber-100"
          }`}>
            <Activity className={`h-5 w-5 ${isSimulating ? "text-red-600" : "text-amber-600"}`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${isSimulating ? "text-red-800" : "text-amber-800"}`}>
              {isSimulating ? "Event Surge Simulation Active" : "Event Surge Simulator"}
            </p>
            <p className={`text-xs ${isSimulating ? "text-red-600" : "text-amber-600"}`}>
              {isSimulating
                ? "Simulating AFL Grand Final impact on all zones - MCG area under critical stress"
                : "Test how upcoming events will impact parking demand across Melbourne"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleSimulation}
          className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
            isSimulating
              ? "border-red-500 bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          {isSimulating ? "Stop Simulation" : "Simulate Surge"}
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Event cards */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Upcoming Events & Predicted Impact
          </h3>
          {cityEvents.map((event) => {
            const Icon = eventIcons[event.type]
            const impactColor = getImpactColor(event.parkingImpact)
            const affected = event.affectedZones.map(
              (zId) => parkingZones.find((z) => z.id === zId)?.name ?? zId,
            )

            return (
              <div
                key={event.id}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                {/* Icon */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${impactColor}18` }}
                >
                  <Icon className="h-6 w-6" style={{ color: impactColor }} />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{event.name}</h4>
                      <p className="text-xs text-gray-500">
                        {event.location} &middot; {event.date} &middot; {event.time}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: impactColor }}
                    >
                      {event.parkingImpact}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase text-gray-400">Attendees</p>
                      <p className="text-sm font-bold text-gray-800">
                        {event.expectedAttendees.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-gray-400">Demand Surge</p>
                      <p className="text-sm font-bold" style={{ color: impactColor }}>
                        +{event.predictedSurge}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase text-gray-400">Radius</p>
                      <p className="text-sm font-bold text-gray-800">
                        {event.surgeRadius >= 1000
                          ? `${(event.surgeRadius / 1000).toFixed(1)}km`
                          : `${event.surgeRadius}m`}
                      </p>
                    </div>
                  </div>

                  {/* Affected zones */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-medium text-gray-400">Zones:</span>
                    {affected.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Surge chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-800">Predicted Demand Surge</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={surgeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" unit="%" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={80} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
                    formatter={(val: number) => [`+${val}%`, "Surge"]}
                  />
                  <Bar dataKey="surge" radius={[0, 4, 4, 0]}>
                    {surgeChartData.map((entry) => (
                      <Cell key={entry.name} fill={getImpactColor(entry.impact as CityEvent["parkingImpact"])} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
              <Zap className="h-4 w-4" />
              AI Recommendations
            </h3>
            <div className="flex flex-col gap-2.5 text-[12px] leading-relaxed text-blue-700">
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>Pre-allocate 200 spots at Docklands for AFL Grand Final overflow</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>Deploy temporary signage on St Kilda Rd directing to Carlton Gardens</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>Increase shuttle frequency from Docklands to MCG 2 hours pre-event</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>Activate dynamic pricing at Crown Casino garage during Night Market</p>
              </div>
            </div>
          </div>

          {/* Impact Legend */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Impact Scale
            </h3>
            <div className="flex flex-col gap-2">
              {(["low", "medium", "high", "critical"] as const).map((level) => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getImpactColor(level) }}
                  />
                  <span className="font-semibold capitalize text-gray-700">{level}</span>
                  <span className="text-gray-400">
                    {level === "low" && "< 20% surge"}
                    {level === "medium" && "20-60% surge"}
                    {level === "high" && "60-150% surge"}
                    {level === "critical" && "> 150% surge"}
                  </span>
                </div>
              ))}
            </div>
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
  iconBg,
  iconColor,
}: {
  icon: typeof Calendar
  label: string
  value: string
  sub: string
  iconBg: string
  iconColor: string
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
