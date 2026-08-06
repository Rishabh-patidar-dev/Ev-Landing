'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface SiteMapProps {
  lat?: number
  lng?: number
  zoom?: number
  height?: number
  interactive?: boolean
  onLocationSelect?: (lat: number, lng: number) => void
}

export function SiteMap({ lat, lng, zoom = 15, height = 300, interactive = true, onLocationSelect }: SiteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    let isMounted = true

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!isMounted || !mapRef.current) return

      // Fix default marker icons
      const iconDefault = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      const defaultLat = lat ?? 20.5937
      const defaultLng = lng ?? 78.9629

      // Destroy previous instance
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapRef.current!, {
        center: [defaultLat, defaultLng],
        zoom,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: iconDefault, draggable: interactive && !!onLocationSelect }).addTo(map)
        markerRef.current = marker

        if (interactive && onLocationSelect) {
          marker.on('dragend', () => {
            const pos = (marker as { getLatLng: () => { lat: number; lng: number } }).getLatLng()
            onLocationSelect(pos.lat, pos.lng)
          })
        }
      }

      if (interactive && onLocationSelect) {
        map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
          const { lat: clickLat, lng: clickLng } = e.latlng

          if (markerRef.current) {
            (markerRef.current as { setLatLng: (coords: [number, number]) => void }).setLatLng([clickLat, clickLng])
          } else {
            const m = L.marker([clickLat, clickLng], { icon: iconDefault, draggable: true }).addTo(map)
            markerRef.current = m
            m.on('dragend', () => {
              const pos = (m as { getLatLng: () => { lat: number; lng: number } }).getLatLng()
              onLocationSelect(pos.lat, pos.lng)
            })
          }

          onLocationSelect(clickLat, clickLng)
        })
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker when lat/lng change
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return
    const map = mapInstanceRef.current as {
      setView: (coords: [number, number], zoom: number) => void
    }
    map.setView([lat, lng], zoom)
    if (markerRef.current) {
      (markerRef.current as { setLatLng: (coords: [number, number]) => void }).setLatLng([lat, lng])
    }
  }, [lat, lng, zoom])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-sand/30" style={{ height }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {!lat && !lng && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sand/10 pointer-events-none">
          <MapPin className="w-8 h-8 text-sand mb-2" />
          <p className="text-sm text-sand">No location set</p>
          {interactive && <p className="text-xs text-sand/70 mt-1">Click on the map to set location</p>}
        </div>
      )}
    </div>
  )
}
