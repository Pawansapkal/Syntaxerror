"use client"

import { useEffect, useRef, useCallback } from "react"
import type L from "leaflet"
import { parkingZones, getStressColor } from "@/lib/parking-data"

const heatBlobs = [
  { coords: [-37.822, 144.965] as [number, number], color: "#ef4444", radius: 800 },
  { coords: [-37.8076, 144.9568] as [number, number], color: "#f59e0b", radius: 600 },
  { coords: [-37.8102, 144.9628] as [number, number], color: "#f59e0b", radius: 500 },
]

interface MapViewProps {
  isSimulating: boolean
  selectedZone?: string | null
  onSelectZone?: (id: string | null) => void
}

export default function MapView({ isSimulating, selectedZone, onSelectZone }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const simLayerRef = useRef<L.Circle | null>(null)
  const leafletRef = useRef<typeof L | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  const handleMarkerClick = useCallback(
    (zoneId: string) => {
      onSelectZone?.(zoneId)
    },
    [onSelectZone],
  )

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initMap = async () => {
      const leaflet = await import("leaflet")
      await import("leaflet/dist/leaflet.css")
      leafletRef.current = leaflet.default

      delete (leaflet.default.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (!mapContainerRef.current || mapRef.current) return

      const map = leaflet.default
        .map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        })
        .setView([-37.8136, 144.9631], 14)

      leaflet.default
        .tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
        })
        .addTo(map)

      leaflet.default.control.zoom({ position: "bottomleft" }).addTo(map)

      mapRef.current = map

      // Add heat blobs
      for (const blob of heatBlobs) {
        leaflet.default
          .circle(blob.coords, {
            radius: blob.radius,
            stroke: false,
            fillColor: blob.color,
            fillOpacity: 0.4,
            className: "heat-glow",
          })
          .addTo(map)
      }

      // Add parking markers for each zone
      for (const zone of parkingZones) {
        const borderColor = getStressColor(zone.stressIndex)
        const customIcon = leaflet.default.divIcon({
          className: "custom-pin",
          html: `
            <div class="custom-marker-bubble" style="width: 54px; height: 54px; border-color: ${borderColor}">
              <span class="bubble-val">${zone.currentAvail}%</span>
              <span class="bubble-label">Avail</span>
            </div>
          `,
          iconSize: [54, 54],
          iconAnchor: [27, 27],
        })

        const marker = leaflet.default.marker(zone.coords, { icon: customIcon }).addTo(map)
        marker.bindTooltip(
          `<div style="text-align:center;font-family:Inter,sans-serif;">
            <b style="font-size:12px;">${zone.name}</b><br/>
            <span style="font-size:10px;color:#6b7280;">${zone.totalSpots} spots &middot; ${zone.type}</span>
          </div>`,
          { direction: "top", offset: [0, -28] },
        )

        marker.on("click", () => handleMarkerClick(zone.id))
        markersRef.current.set(zone.id, marker)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current.clear()
    }
  }, [handleMarkerClick])

  // Handle simulation
  useEffect(() => {
    const map = mapRef.current
    const Leaflet = leafletRef.current
    if (!map || !Leaflet) return

    if (isSimulating) {
      const simCircle = Leaflet.circle([-37.82, 144.9834], {
        radius: 1200,
        color: "red",
        fillColor: "#7f1d1d",
        fillOpacity: 0.6,
        className: "heat-glow",
      }).addTo(map)

      // Add MCG label
      const mcgIcon = Leaflet.divIcon({
        className: "custom-pin",
        html: `
          <div style="
            background: #7f1d1d;
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            font-family: Inter, sans-serif;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            MCG Event Surge
          </div>
        `,
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      })
      const mcgMarker = Leaflet.marker([-37.82, 144.9834], { icon: mcgIcon }).addTo(map)

      simLayerRef.current = simCircle
      // Store mcg marker for cleanup
      ;(simCircle as unknown as Record<string, L.Marker>)._mcgMarker = mcgMarker

      map.flyTo([-37.82, 144.9834], 14)
    } else {
      if (simLayerRef.current) {
        const mcgMarker = (simLayerRef.current as unknown as Record<string, L.Marker>)._mcgMarker
        if (mcgMarker) map.removeLayer(mcgMarker)
        map.removeLayer(simLayerRef.current)
        simLayerRef.current = null
      }
      map.flyTo([-37.8136, 144.9631], 14)
    }
  }, [isSimulating])

  // Handle zone selection - fly to selected zone
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedZone) return

    const zone = parkingZones.find((z) => z.id === selectedZone)
    if (zone) {
      map.flyTo(zone.coords, 15, { duration: 0.8 })
    }
  }, [selectedZone])

  return (
    <div className="map-wrapper">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Map Overlay Label */}
      <div className="map-overlay-label">
        <h4>Melbourne CBD</h4>
        <span>Parking Stress Heatmap</span>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-title">Stress Intensity</div>
        <div className="gradient-bar" />
        <div className="legend-labels">
          <span>Available</span>
          <span>Filling</span>
          <span>Full</span>
        </div>
      </div>
    </div>
  )
}
