import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom animated red pin
const pinIcon = L.divIcon({
  html: `<div class="map-pin"></div>`,
  className: "custom-pin",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Reverse Geocode (English)
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`
    );
    const data = await res.json();
    const a = data.address || {};

    return {
      address: data.display_name || "",
      city:
        a.city ||
        a.town ||
        a.village ||
        a.hamlet ||
        a.locality ||
        null,
      district: a.state_district || a.county || null,
      state: a.state || null,
    };
  } catch {
    return { address: null, city: null, district: null, state: null };
  }
};

// Search by place name
const searchLocation = async (q) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=1&addressdetails=1&accept-language=en`
    );
    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
};

// Click handler
const MapClickHandler = ({ updatePos }) => {
  useMapEvents({
    click(e) {
      updatePos({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LeafletMapPicker = ({ defaultPosition, onLocationSelect }) => {
  const initial = defaultPosition || { lat: 16.5449, lng: 81.5212 };

  const [position, setPosition] = useState(initial);
  const [address, setAddress] = useState("");
  const [mapRef, setMapRef] = useState(null);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("light");
  const [searching, setSearching] = useState(false);

  // Theme tiles
  const tiles = {
    light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark:
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  };

  // Update position + reverse geocode
  const updatePosition = async (loc) => {
    const newPos = { lat: Number(loc.lat), lng: Number(loc.lng) };
    setPosition(newPos);

    const addr = await getAddressFromCoords(newPos.lat, newPos.lng);
    setAddress(addr.address || "");

    if (onLocationSelect) {
      onLocationSelect({
        lat: newPos.lat,
        lng: newPos.lng,
        address: addr.address,
        city: addr.city,
        district: addr.district,
        state: addr.state,
      });
    }
  };

  // Move map smoothly
  const moveMap = (loc, zoom = 17) => {
    if (!mapRef) return;
    try {
      mapRef.flyTo([loc.lat, loc.lng], zoom, { duration: 1.2 });
    } catch {}
  };

  // HIGH-ACCURACY My Location
  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.log("GPS Accuracy:", pos.coords.accuracy, "meters");

        const loc = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        };

        await updatePosition(loc);

        setTimeout(() => moveMap(loc), 150);

        if (pos.coords.accuracy > 150) {
          alert(
            "⚠ Your GPS accuracy is low.\nEnable High Accuracy Mode for correct location.\n(Settings → Location → High Accuracy)"
          );
        }
      },
      (err) => {
        console.log("GPS error:", err);
        alert(
          "Unable to access GPS.\nTurn ON High Accuracy Mode in your phone settings."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  // Search location  ✅ FIXED (Numbers)
  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);

    const result = await searchLocation(search);

    if (!result) {
      alert("Location not found");
      setSearching(false);
      return;
    }

    const loc = { lat: Number(result.lat), lng: Number(result.lon) };
    await updatePosition(loc);
    moveMap(loc);

    setSearching(false);
  };

  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Search Bar */}
      <div className="map-search-bar">
        <input
          type="text"
          placeholder="Search (Bhimavaram, Kakinada...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onSearchKey}
        />
        <button type="button" onClick={handleSearch} disabled={searching} style={{marginLeft:"10px"}}>
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Theme Toggle */}
      <button
        className="map-theme-btn"
        type="button"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        🌓 Theme
      </button>

      {/* My Location */}
      <button className="map-location-btn" type="button" onClick={detectMyLocation}>
         My Location
      </button>

      {/* Map */}
      <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom
      zoomControl={false}   // <<< ADD THIS
      style={{
        height: "320px",
        width: "100%",
        borderRadius: "12px",
        marginTop: "10px",
      }}
      whenCreated={setMapRef}
    >

        <TileLayer url={tiles[theme]} />

        <MapClickHandler updatePos={updatePosition} />

        <Marker
          position={position}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: async (e) => {
              const p = e.target.getLatLng();
              const loc = { lat: p.lat, lng: p.lng };
              await updatePosition(loc);
              moveMap(loc);
            },
          }}
        />
      </MapContainer>

      {/* Selected address */}
      <p className="map-address">
        <b>Selected Address:</b> {address || "Tap on map to select a location"}
      </p>
    </div>
  );
};

export default LeafletMapPicker;
