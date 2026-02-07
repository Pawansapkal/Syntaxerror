// ============================================================
// ParkSense Melbourne — Shared mock data & types
// All data is synthetic / simulated for hackathon demo purposes
// ============================================================

// ---------- Zone types ----------
export interface ParkingZone {
  id: string
  name: string
  coords: [number, number]
  totalSpots: number
  currentAvail: number          // percentage 0-100
  predicted30: number           // predicted in 30 min
  predicted60: number           // predicted in 60 min
  confidence: number            // 0-100
  stressIndex: number           // 0-100
  color: string                 // marker color
  type: "street" | "garage" | "lot"
}

export interface HourlyData {
  hour: string
  occupancy: number
  predicted: number
}

export interface DailyData {
  day: string
  avgOccupancy: number
  peakOccupancy: number
}

export interface CityEvent {
  id: string
  name: string
  type: "concert" | "sports" | "festival" | "market" | "conference"
  location: string
  coords: [number, number]
  date: string
  time: string
  expectedAttendees: number
  parkingImpact: "low" | "medium" | "high" | "critical"
  surgeRadius: number           // meters
  affectedZones: string[]
  predictedSurge: number        // percentage increase in demand
}

export interface TrafficFlow {
  corridor: string
  direction: string
  congestionLevel: number       // 0-100
  avgSpeed: number              // km/h
  trend: "increasing" | "decreasing" | "stable"
}

// ---------- Melbourne zones ----------
export const parkingZones: ParkingZone[] = [
  {
    id: "fed-square",
    name: "Fed Square",
    coords: [-37.818, 144.9691],
    totalSpots: 450,
    currentAvail: 65,
    predicted30: 52,
    predicted60: 41,
    confidence: 89,
    stressIndex: 35,
    color: "#10b981",
    type: "garage",
  },
  {
    id: "queen-vic",
    name: "Queen Vic Market",
    coords: [-37.8076, 144.9568],
    totalSpots: 620,
    currentAvail: 58,
    predicted30: 44,
    predicted60: 32,
    confidence: 85,
    stressIndex: 42,
    color: "#10b981",
    type: "lot",
  },
  {
    id: "crown-casino",
    name: "Crown Casino",
    coords: [-37.8236, 144.9583],
    totalSpots: 380,
    currentAvail: 12,
    predicted30: 8,
    predicted60: 5,
    confidence: 92,
    stressIndex: 88,
    color: "#ef4444",
    type: "garage",
  },
  {
    id: "docklands",
    name: "Docklands",
    coords: [-37.8183, 144.945],
    totalSpots: 520,
    currentAvail: 18,
    predicted30: 14,
    predicted60: 10,
    confidence: 78,
    stressIndex: 82,
    color: "#ef4444",
    type: "lot",
  },
  {
    id: "southbank",
    name: "Southbank",
    coords: [-37.822, 144.965],
    totalSpots: 310,
    currentAvail: 22,
    predicted30: 16,
    predicted60: 11,
    confidence: 91,
    stressIndex: 78,
    color: "#dc2626",
    type: "street",
  },
  {
    id: "carlton",
    name: "Carlton Gardens",
    coords: [-37.8054, 144.9712],
    totalSpots: 280,
    currentAvail: 71,
    predicted30: 65,
    predicted60: 58,
    confidence: 82,
    stressIndex: 29,
    color: "#10b981",
    type: "street",
  },
  {
    id: "flinders-st",
    name: "Flinders St",
    coords: [-37.8183, 144.9671],
    totalSpots: 190,
    currentAvail: 9,
    predicted30: 6,
    predicted60: 4,
    confidence: 94,
    stressIndex: 91,
    color: "#ef4444",
    type: "street",
  },
  {
    id: "melbourne-central",
    name: "Melbourne Central",
    coords: [-37.8102, 144.9628],
    totalSpots: 750,
    currentAvail: 34,
    predicted30: 28,
    predicted60: 22,
    confidence: 87,
    stressIndex: 66,
    color: "#f59e0b",
    type: "garage",
  },
]

// ---------- Hourly pattern (today) ----------
export const hourlyPattern: HourlyData[] = [
  { hour: "6 AM", occupancy: 15, predicted: 18 },
  { hour: "7 AM", occupancy: 32, predicted: 35 },
  { hour: "8 AM", occupancy: 58, predicted: 62 },
  { hour: "9 AM", occupancy: 78, predicted: 80 },
  { hour: "10 AM", occupancy: 85, predicted: 83 },
  { hour: "11 AM", occupancy: 82, predicted: 81 },
  { hour: "12 PM", occupancy: 79, predicted: 78 },
  { hour: "1 PM", occupancy: 76, predicted: 75 },
  { hour: "2 PM", occupancy: 80, predicted: 82 },
  { hour: "3 PM", occupancy: 84, predicted: 86 },
  { hour: "4 PM", occupancy: 88, predicted: 90 },
  { hour: "5 PM", occupancy: 92, predicted: 94 },
  { hour: "6 PM", occupancy: 86, predicted: 88 },
  { hour: "7 PM", occupancy: 72, predicted: 74 },
  { hour: "8 PM", occupancy: 58, predicted: 60 },
  { hour: "9 PM", occupancy: 42, predicted: 44 },
  { hour: "10 PM", occupancy: 28, predicted: 30 },
  { hour: "11 PM", occupancy: 18, predicted: 20 },
]

// ---------- Daily pattern (week) ----------
export const dailyPattern: DailyData[] = [
  { day: "Mon", avgOccupancy: 72, peakOccupancy: 91 },
  { day: "Tue", avgOccupancy: 75, peakOccupancy: 93 },
  { day: "Wed", avgOccupancy: 78, peakOccupancy: 95 },
  { day: "Thu", avgOccupancy: 76, peakOccupancy: 92 },
  { day: "Fri", avgOccupancy: 82, peakOccupancy: 97 },
  { day: "Sat", avgOccupancy: 68, peakOccupancy: 88 },
  { day: "Sun", avgOccupancy: 45, peakOccupancy: 72 },
]

// ---------- Upcoming events ----------
export const cityEvents: CityEvent[] = [
  {
    id: "e1",
    name: "AFL Grand Final",
    type: "sports",
    location: "MCG",
    coords: [-37.82, 144.9834],
    date: "Feb 8, 2026",
    time: "2:30 PM",
    expectedAttendees: 100000,
    parkingImpact: "critical",
    surgeRadius: 2000,
    affectedZones: ["fed-square", "flinders-st", "southbank"],
    predictedSurge: 340,
  },
  {
    id: "e2",
    name: "Queen Vic Night Market",
    type: "market",
    location: "Queen Victoria Market",
    coords: [-37.8076, 144.9568],
    date: "Feb 7, 2026",
    time: "5:00 PM",
    expectedAttendees: 15000,
    parkingImpact: "high",
    surgeRadius: 800,
    affectedZones: ["queen-vic", "melbourne-central", "carlton"],
    predictedSurge: 85,
  },
  {
    id: "e3",
    name: "Melbourne Jazz Festival",
    type: "concert",
    location: "Southbank Arts Precinct",
    coords: [-37.822, 144.965],
    date: "Feb 9, 2026",
    time: "7:00 PM",
    expectedAttendees: 8000,
    parkingImpact: "medium",
    surgeRadius: 600,
    affectedZones: ["southbank", "crown-casino", "flinders-st"],
    predictedSurge: 55,
  },
  {
    id: "e4",
    name: "Tech Summit 2026",
    type: "conference",
    location: "Melbourne Convention Centre",
    coords: [-37.8252, 144.9541],
    date: "Feb 10, 2026",
    time: "9:00 AM",
    expectedAttendees: 5000,
    parkingImpact: "medium",
    surgeRadius: 500,
    affectedZones: ["docklands", "crown-casino", "southbank"],
    predictedSurge: 42,
  },
  {
    id: "e5",
    name: "White Night Melbourne",
    type: "festival",
    location: "CBD",
    coords: [-37.8136, 144.9631],
    date: "Feb 14, 2026",
    time: "7:00 PM",
    expectedAttendees: 50000,
    parkingImpact: "critical",
    surgeRadius: 1500,
    affectedZones: ["fed-square", "flinders-st", "melbourne-central", "carlton"],
    predictedSurge: 210,
  },
]

// ---------- Traffic corridors ----------
export const trafficFlows: TrafficFlow[] = [
  { corridor: "Flinders St", direction: "Eastbound", congestionLevel: 78, avgSpeed: 18, trend: "increasing" },
  { corridor: "Elizabeth St", direction: "Northbound", congestionLevel: 65, avgSpeed: 22, trend: "stable" },
  { corridor: "St Kilda Rd", direction: "Southbound", congestionLevel: 82, avgSpeed: 15, trend: "increasing" },
  { corridor: "Bourke St", direction: "Westbound", congestionLevel: 55, avgSpeed: 28, trend: "decreasing" },
  { corridor: "Spencer St", direction: "Northbound", congestionLevel: 42, avgSpeed: 35, trend: "decreasing" },
  { corridor: "King St", direction: "Southbound", congestionLevel: 71, avgSpeed: 20, trend: "stable" },
]

// ---------- Zone-level predictions for the AI panel ----------
export interface ZonePrediction {
  zoneId: string
  timeSlots: { time: string; availability: number; confidence: number }[]
}

export const zonePredictions: ZonePrediction[] = parkingZones.map((zone) => ({
  zoneId: zone.id,
  timeSlots: [
    { time: "Now", availability: zone.currentAvail, confidence: zone.confidence },
    { time: "+15 min", availability: Math.max(5, zone.currentAvail - Math.floor(Math.random() * 8 + 3)), confidence: Math.max(60, zone.confidence - 3) },
    { time: "+30 min", availability: zone.predicted30, confidence: Math.max(55, zone.confidence - 6) },
    { time: "+45 min", availability: Math.max(3, zone.predicted30 - Math.floor(Math.random() * 6 + 2)), confidence: Math.max(50, zone.confidence - 10) },
    { time: "+60 min", availability: zone.predicted60, confidence: Math.max(45, zone.confidence - 14) },
    { time: "+90 min", availability: Math.max(2, zone.predicted60 - Math.floor(Math.random() * 5 + 2)), confidence: Math.max(40, zone.confidence - 20) },
  ],
}))

// ---------- Helpers ----------
export function getStressColor(stress: number): string {
  if (stress >= 80) return "#ef4444"
  if (stress >= 60) return "#f59e0b"
  if (stress >= 40) return "#eab308"
  return "#10b981"
}

export function getStressLabel(stress: number): string {
  if (stress >= 80) return "Critical"
  if (stress >= 60) return "High"
  if (stress >= 40) return "Moderate"
  return "Low"
}

export function getImpactColor(impact: CityEvent["parkingImpact"]): string {
  switch (impact) {
    case "critical": return "#ef4444"
    case "high": return "#f59e0b"
    case "medium": return "#3b82f6"
    case "low": return "#10b981"
  }
}

export function getEventTypeIcon(type: CityEvent["type"]): string {
  switch (type) {
    case "concert": return "Music"
    case "sports": return "Trophy"
    case "festival": return "PartyPopper"
    case "market": return "ShoppingBag"
    case "conference": return "Presentation"
  }
}
