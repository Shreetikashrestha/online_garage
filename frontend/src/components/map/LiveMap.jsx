import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG icons for map pins
const USER_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const MECHANIC_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;
const SOS_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

const createMarkupIcon = (color, svgContent, isSOS = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${color}, 0 4px 10px rgba(0,0,0,0.5);
        animation: ${isSOS ? 'pulse-glow-red' : 'pulse-glow'} 2s infinite;
      ">
        ${svgContent}
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

// Map controller to handle programmatically updating coordinates/bounds
function ChangeMapView({ center, bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.flyTo(center, map.getZoom() || 14, { animate: true, duration: 1.5 });
    }
  }, [center, bounds, map]);

  return null;
}

export default function LiveMap({ 
  center = [27.7172, 85.324], // Default center (Kathmandu as default)
  zoom = 13, 
  userLocation = null,
  mechanicLocation = null,
  nearbyMechanics = [],
  sosLocation = null,
  height = '400px'
}) {
  // Compute fitting bounds if multiple markers exist
  const bounds = [];
  if (userLocation) bounds.push(userLocation);
  if (mechanicLocation) bounds.push(mechanicLocation);
  if (sosLocation) bounds.push(sosLocation);

  const finalCenter = userLocation || mechanicLocation || center;

  return (
    <div style={{ height, width: '100%', position: 'relative', overflow: 'hidden' }}>
      <MapContainer 
        center={finalCenter} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Change map view dynamically */}
        <ChangeMapView center={finalCenter} bounds={bounds.length > 1 ? bounds : null} />

        {/* User Marker */}
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={createMarkupIcon('var(--accent-primary)', USER_PIN)}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>You</strong>
                <p>Your Current Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Mechanic Marker */}
        {mechanicLocation && (
          <Marker 
            position={mechanicLocation} 
            icon={createMarkupIcon('var(--accent-secondary)', MECHANIC_PIN)}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>Assigned Mechanic</strong>
                <p>Heading to your location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Mechanics Map Pins */}
        {nearbyMechanics.map((mechanic) => {
          if (!mechanic.latitude || !mechanic.longitude) return null;
          return (
            <Marker
              key={mechanic.id}
              position={[mechanic.latitude, mechanic.longitude]}
              icon={createMarkupIcon('rgba(16, 185, 129, 0.8)', MECHANIC_PIN)}
            >
              <Popup>
                <div style={{ color: '#000', fontSize: '0.875rem' }}>
                  <strong>{mechanic.name}</strong>
                  <p>Rating: ⭐ {mechanic.rating || 'N/A'}</p>
                  <p>Specialty: {mechanic.specialty?.join(', ') || 'General'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* SOS Alert Marker */}
        {sosLocation && (
          <Marker
            position={sosLocation}
            icon={createMarkupIcon('var(--danger)', SOS_PIN, true)}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>⚠️ EMERGENCY SOS ALERT</strong>
                <p>Someone requires urgent roadside assistance!</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
