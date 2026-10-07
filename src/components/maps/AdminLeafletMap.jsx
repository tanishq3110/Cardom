import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export function AdminLeafletMap({
  center = [28.6139, 77.2090], // Default New Delhi, India
  zoom = 12,
  markers = [],
  className = 'h-96 w-full rounded-2xl overflow-hidden border border-[#262626]',
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      })

      // CartoDB Dark Matter tile layer (sleek dark theme for operations dashboard)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      markersLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update center & zoom if changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    markersLayerRef.current.clearLayers()

    const bounds = []

    markers.forEach((m) => {
      if (!m.lat || !m.lng) return

      const pos = [Number(m.lat), Number(m.lng)]
      bounds.push(pos)

      // Custom HTML pin based on marker type
      let pinColor = '#f97316' // Orange default

      if (m.type === 'pickup') pinColor = '#10b981' // Green
      if (m.type === 'drop') pinColor = '#ef4444' // Red
      if (m.type === 'driver') pinColor = '#3b82f6' // Blue
      if (m.type === 'sos') pinColor = '#f43f5e' // Crimson

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${pinColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px ${pinColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
            ${m.iconText || ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(pos, { icon: customIcon }).addTo(markersLayerRef.current)

      if (m.title || m.description) {
        marker.bindPopup(`
          <div style="font-size: 12px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: bold; color: #ffffff; margin-bottom: 2px;">${m.title || ''}</div>
            <div style="color: #a1a1aa;">${m.description || ''}</div>
            ${m.extra ? `<div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #f97316;">${m.extra}</div>` : ''}
          </div>
        `)
      }
    })

    // If multiple markers exist, fit bounds smoothly
    if (bounds.length > 1 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [markers])

  return <div ref={mapContainerRef} className={className} />
}
