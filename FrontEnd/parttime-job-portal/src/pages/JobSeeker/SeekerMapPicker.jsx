// components/SeekerMapPicker.jsx
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/* ---------------- USER BALL ---------------- */
const ballColor = "#ff3333";

const pinIcon = L.divIcon({
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: ${ballColor};
      border: 3px solid red;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(0,0,0,0.45);
      display:inline-block;
      transform: translateY(-6px);
    "></div>
  `,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

/* ---------------- JOB MARKERS ---------------- */
const pinImages = {
  blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  orange: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  violet: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  gold: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  grey: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
};

const typeMarker = {
  "Full Time": pinImages.blue,
  "Part Time": pinImages.green,
  "One-Day Job": pinImages.orange,
  "Weekend Job": pinImages.violet,
  "Evening Job": pinImages.gold,
  "Monthly Job": pinImages.orange,
  "Urgent / Today Only Job": pinImages.red,
  Delivery: pinImages.red,
};

function createJobMarker(job) {
  const markerUrl = typeMarker[job.type] || pinImages.grey;

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:white;
          color:black;
          padding:4px 6px;
          border-radius:6px;
          margin-bottom:4px;
          font-size:12px;
          font-weight:bold;
          white-space:nowrap;
          border:1px solid #ccc;
          box-shadow:0 2px 5px rgba(0,0,0,0.28);
        ">
          ${job.title}
        </div>
        <img src="${markerUrl}" style="width:25px;height:41px; display:block;" />
      </div>
    `,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
  });
}

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const SeekerMapPicker = ({ location, setLocation, jobPins = [] }) => {
  // ⭐ STATIC initial center only once
  const initialCenter = { lat: 16.5449, lng: 81.5212 };

const mapRef = useRef(null);
  const [theme, setTheme] = useState("light");

  const tileLayers = {
    light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  };

  /* ⭐ MAIN MAGIC
     WHEN USER SEARCHES → MAP ALSO MOVES
  */
useEffect(() => {
  if (!mapRef.current) return;

  setTimeout(() => {
    try {
      mapRef.current.invalidateSize();
    } catch {}
  }, 200);

  if (!location?.lat || !location?.lng) return;

  mapRef.current.flyTo([location.lat, location.lng], 15, {
    animate: true,
    duration: 1.2,
  });
}, [location?.lat, location?.lng]);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <button
        className="map-theme-btn"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        🌓
      </button>

      <MapContainer
        center={initialCenter}   // ❗ FIXED CENTER
        zoom={13}
        zoomControl={false}
       whenCreated={(map) => (mapRef.current = map)}
        style={{
          height: "100%",
          minHeight: "260px",
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <TileLayer url={tileLayers[theme]} />
        <MapClickHandler
          onSelect={(pos) =>
            setLocation(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }))
          }
        />

        {/* USER MARKER */}
        {location?.lat && location?.lng && (
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={pinIcon}
          />
        )}

        {/* JOB MARKERS */}
        {jobPins.map(
          (job) =>
            job.latitude &&
            job.longitude && (
              <Marker
                key={job.id}
                position={{ lat: job.latitude, lng: job.longitude }}
                icon={createJobMarker(job)}
              >
                <Popup>
                  <b>{job.title}</b> <br />
                  Type: {job.type} <br />
                  Salary: {job.salary}
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
};

export default SeekerMapPicker;

import { useMap } from "react-leaflet";

const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;

    map.flyTo([location.lat, location.lng], 15, {
      animate: true,
      duration: 1.2,
    });

  }, [location?.lat, location?.lng, map]);

  return null;
};
