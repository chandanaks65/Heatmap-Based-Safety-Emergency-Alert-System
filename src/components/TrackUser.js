import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* 🔥 RECENTER */
function Recenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

function TrackUser() {
  const [position, setPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [heading, setHeading] = useState(0);
  const [address, setAddress] = useState("");

  const prevPosition = useRef(null);

  /* 🔥 DIRECTION CALC */
  const getHeading = (prev, curr) => {
    if (!prev) return 0;
    const dy = curr[0] - prev[0];
    const dx = curr[1] - prev[1];
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  /* 🔥 DIRECTION TEXT */
  const getDirectionText = (angle) => {
    if (angle >= -22 && angle < 22) return "➡ East";
    if (angle >= 22 && angle < 67) return "↗ NE";
    if (angle >= 67 && angle < 112) return "⬆ North";
    if (angle >= 112 && angle < 157) return "↖ NW";
    if (angle >= 157 || angle < -157) return "⬅ West";
    if (angle >= -157 && angle < -112) return "↙ SW";
    if (angle >= -112 && angle < -67) return "⬇ South";
    if (angle >= -67 && angle < -22) return "↘ SE";
    return "";
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");

    if (!user) return;

    const interval = setInterval(() => {
      fetch(`http://127.0.0.1:5000/get-location/${user}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.lat && data.lng) {
            const newPos = [data.lat, data.lng];

            const angle = getHeading(prevPosition.current, newPos);
            setHeading(angle);

            prevPosition.current = newPos;
            setPath((prev) => [...prev, newPos]);

            setPosition(newPos);
            setAddress(data.address || "Unknown");
          }
        })
        .catch(() => console.log("backend error"));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* 🔥 ARROW ICON */
  const arrowIcon = L.divIcon({
    className: "",
    html: `<div style="
      transform: rotate(${heading}deg);
      font-size: 26px;
      color: red;
    ">➤</div>`,
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>

      {!position && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          📡 Waiting for live location...
        </p>
      )}

      {position && (
        <>
          <MapContainer center={position} zoom={17} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Recenter position={position} />

            {/* 🔥 MOVING ARROW */}
            <Marker position={position} icon={arrowIcon} />

            {/* 🔥 PATH */}
            <Polyline positions={path} color="blue" />
          </MapContainer>

          {/* 🔥 INFO BOX */}
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)"
          }}>
            <div><b>📍 Address:</b> {address}</div>
            <div><b>🧭 Direction:</b> {getDirectionText(heading)}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default TrackUser;