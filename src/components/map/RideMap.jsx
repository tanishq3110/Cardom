import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

// Custom DivIcon creators matching Cardom dark automotive design
function createPickupIcon() {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: rgba(34, 197, 94, 0.2);
        border: 2px solid #22C55E;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.6);
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #22C55E;
          border-radius: 50%;
          border: 2px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function createDropIcon() {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid #EF4444;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #EF4444;
          border-radius: 50%;
          border: 2px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function createDriverIcon(heading = 0) {
  const rotateDeg = heading || 0
  return L.divIcon({
    className: 'custom-map-marker driver-marker',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: rgba(249, 115, 22, 0.25);
        border: 2px solid #F97316;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 18px rgba(249, 115, 22, 0.7);
        transition: transform 0.4s ease-out;
      ">
        <div style="
          width: 22px;
          height: 22px;
          background: #F97316;
          border-radius: 50%;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${rotateDeg}deg);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  })
}

/**
 * RideMap Component:
 * Embeds Leaflet map styled in Dark Matter scheme.
 * Plots Pickup marker (Green), Drop marker (Red), and Driver marker (Orange vehicle with heading).
 * Automatically draws polyline and fits bounds.
 */
export function RideMap({
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  driverLat,
  driverLng,
  heading = 0,
  interactive = true,
  height = '240px',
  className = '',
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const pickupMarkerRef = useRef(null)
  const dropMarkerRef = useRef(null)
  const routeLineRef = useRef(null)

  const hasPickup = pickupLat !== null && pickupLat !== undefined && pickupLng !== null && pickupLng !== undefined
  const hasDrop = dropLat !== null && dropLat !== undefined && dropLng !== null && dropLng !== undefined
  const hasDriver = driverLat !== null && driverLat !== undefined && driverLng !== null && driverLng !== undefined
  const hasAnyCoords = hasPickup || hasDrop || hasDriver

  useEffect(() => {
    if (!hasAnyCoords) return
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const defaultCenter = [
      driverLat || pickupLat || dropLat || 31.634,
      driverLng || pickupLng || dropLng || 74.8723,
    ]

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      driverMarkerRef.current = null
      pickupMarkerRef.current = null
      dropMarkerRef.current = null
      routeLineRef.current = null
    }
  }, [hasAnyCoords, interactive, driverLat, pickupLat, dropLat, driverLng, pickupLng, dropLng])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !hasAnyCoords) return

    const boundsPoints = []

    if (hasPickup) {
      const pos = [pickupLat, pickupLng]
      boundsPoints.push(pos)
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pos, { icon: createPickupIcon() })
          .addTo(map)
          .bindPopup('<b>Pickup Location</b>')
      } else {
        pickupMarkerRef.current.setLatLng(pos)
      }
    }

    if (hasDrop) {
      const pos = [dropLat, dropLng]
      boundsPoints.push(pos)
      if (!dropMarkerRef.current) {
        dropMarkerRef.current = L.marker(pos, { icon: createDropIcon() })
          .addTo(map)
          .bindPopup('<b>Destination</b>')
      } else {
        dropMarkerRef.current.setLatLng(pos)
      }
    }

    if (hasDriver) {
      const pos = [driverLat, driverLng]
      boundsPoints.push(pos)
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(pos, { icon: createDriverIcon(heading) })
          .addTo(map)
          .bindPopup('<b>Your Current Location</b>')
      } else {
        driverMarkerRef.current.setLatLng(pos)
        driverMarkerRef.current.setIcon(createDriverIcon(heading))
      }
    }

    if (boundsPoints.length >= 2) {
      const lineCoords = hasDriver && hasDrop
        ? [[driverLat, driverLng], [dropLat, dropLng]]
        : hasPickup && hasDrop
        ? [[pickupLat, pickupLng], [dropLat, dropLng]]
        : boundsPoints

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(lineCoords, {
          color: '#F97316',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map)
      } else {
        routeLineRef.current.setLatLngs(lineCoords)
      }
    }

    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), {
        padding: [40, 40],
        maxZoom: 16,
      })
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 15)
    }
  }, [pickupLat, pickupLng, dropLat, dropLng, driverLat, driverLng, heading, hasPickup, hasDrop, hasDriver, hasAnyCoords])

  if (!hasAnyCoords) {
    return (
      <div
        className={`w-full rounded-2xl bg-[#111111] border border-[#222222] flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ height }}
      >
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-2.5">
          <MapPin className="w-6 h-6 text-orange-400" />
        </div>
        <p className="text-white font-bold text-sm">Map Location Unavailable</p>
        <p className="text-[#888888] text-xs mt-1 max-w-xs">
          Coordinates are not yet available for this ride. The map will activate as soon as GPS data is received.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#2A2A2A] shadow-lg ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  )
}

