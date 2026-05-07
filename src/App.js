// src/App.js

import { useEffect, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import "./App.css";

import Auth from "./components/Auth";
import Menu from "./components/Menu";
import TrackUser from "./components/TrackUser";
import FakeCall from "./components/FakeCall";

/* ================= HEATMAP ================= */

function Heatmap({ data }) {

  const map = useMap();

  useEffect(() => {

    if (!data || data.length === 0) return;

    const heat = data
      .slice(0, 250)
      .map((c) => [

        parseFloat(c.Latitude),
        parseFloat(c.Longitude),

        c.risk === 2 ? 1 : 0.5,

      ])
      .filter((c) =>
        !isNaN(c[0]) &&
        !isNaN(c[1])
      );

    const layer = L.heatLayer(heat, {

      radius: 18,
      blur: 15,
      maxZoom: 17,

    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };

  }, [data, map]);

  return null;
}

/* ================= RECENTER ================= */

function Recenter({ position }) {

  const map = useMap();

  useEffect(() => {

    if (position) {

      map.flyTo(position, 16, {
        duration: 1.5,
      });

    }

  }, [position, map]);

  return null;
}

function App() {

  const [crimeData, setCrimeData] = useState([]);

  const [userLocation, setUserLocation] =
    useState(null);

  const [showMenu, setShowMenu] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [fakeCall, setFakeCall] =
    useState(false);

  const [trackingStarted, setTrackingStarted] =
    useState(false);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  /* 🔔 NOTIFICATION */

  useEffect(() => {

    if ("Notification" in window) {

      Notification.requestPermission();

    }

    const dark =
      localStorage.getItem("darkMode") === "true";

    const night =
      localStorage.getItem("nightMode") === "true";

    if (dark) {
      document.body.classList.add("dark-mode");
    }

    if (night) {
      document.body.classList.add("night-mode");
    }

  }, []);

  /* FETCH CRIME */

  useEffect(() => {

    fetch("http://127.0.0.1:5000/crime-data")
      .then((res) => res.json())
      .then((data) => setCrimeData(data))
      .catch(() => setCrimeData([]));

  }, []);

  /* SHARE LOCATION */

  const shareLocation = async (friend) => {

    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        await fetch(
          "http://127.0.0.1:5000/send-location",
          {

            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({

              from: user.name.toLowerCase(),

              to: friend.toLowerCase(),

              lat,
              lng,

              address: "Live Location",

            }),

          }
        );

        alert("📍 Location shared");

      },

      () => {
        alert("Location permission denied");
      }

    );

  };

  /* TRACK */

  const handleTrack = () => {

    if (trackingStarted) return;

    setTrackingStarted(true);

    navigator.geolocation.watchPosition(

      (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setUserLocation([lat, lng]);

      },

      () => alert("Allow location"),

      {
        enableHighAccuracy: true,
      }

    );
  };

  /* RECORD */

  const handleRecord = async () => {

    try {

      if (!recording) {

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

        const recorder =
          new MediaRecorder(stream);

        mediaRecorderRef.current =
          recorder;

        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {

          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }

        };

        recorder.onstop = () => {

          const blob = new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          );

          if (blob.size === 0) return;

          const url =
            URL.createObjectURL(blob);

          const old = JSON.parse(
            localStorage.getItem("history") || "[]"
          );

          const item = {

            url,

            time:
              new Date().toLocaleString(),

          };

          localStorage.setItem(
            "history",
            JSON.stringify([item, ...old])
          );

          stream.getTracks().forEach((t) =>
            t.stop()
          );
        };

        recorder.start();

        setRecording(true);

      } else {

        mediaRecorderRef.current?.stop();

        setRecording(false);

      }

    } catch {

      alert("Microphone permission denied");
    }
  };

  /* SOS */

  const handleSOS = () => {

    if (!userLocation) {

      alert("Start tracking first");

      return;
    }

    fetch(
      "http://127.0.0.1:5000/send-sos",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          from: user.name.toLowerCase(),

          to:
            user.name.toLowerCase() === "chandana"
              ? "keerthana"
              : "chandana",

          lat: userLocation[0],
          lng: userLocation[1],

        }),

      }
    );

    if (Notification.permission === "granted") {

      new Notification("🚨 SOS Alert Sent", {
        body: "Emergency alert shared successfully.",
        icon: "/logo192.png"
      });

    }

    alert("🚨 SOS SENT");
  };

  /* LOGOUT */

  const handleLogout = () => {

    localStorage.removeItem("user");

    setUser(null);

    setShowMenu(false);
  };

  /* TRACK PAGE */

  if (
    window.location.pathname === "/track"
  ) {
    return <TrackUser />;
  }

  /* LOGIN */

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (

    <div className="app-container">

      {/* HEADER */}

      <div className="top-nav">

        <div className="logo">
          SecureHer
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >

          <button
            onClick={() => {

              if (Notification.permission === "granted") {

                new Notification("🚨 SecureHer Alert", {
                  body: "High crime activity detected nearby.",
                  icon: "/logo192.png"
                });

              }

            }}
          >
            🔔
          </button>

          <button
            onClick={() =>
              setShowMenu(true)
            }
          >
            ☰
          </button>

        </div>

      </div>

      {/* MAP */}

      <div className="map-wrapper">

        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={13}
          className="map"
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Heatmap data={crimeData} />

          {crimeData
            .filter(
              (point) => point.risk === 2
            )
            .slice(0, 40)
            .map((point, index) => (

              <Marker
                key={index}

                position={[
                  point.Latitude,
                  point.Longitude,
                ]}

                icon={L.divIcon({

                  className: "custom-marker",

                  html: `
                    <div style="
                      width:10px;
                      height:10px;
                      background:red;
                      border-radius:50%;
                      border:2px solid white;
                      box-shadow:0 0 10px red;
                    "></div>
                  `,

                })}
              >

                <Popup>
                  ⚠️ High Crime Area
                </Popup>

              </Marker>

            ))}

          {userLocation && (
            <Recenter
              position={userLocation}
            />
          )}

          {userLocation && (
            <Marker position={userLocation}>

              <Popup>
                You are here
              </Popup>

            </Marker>
          )}

        </MapContainer>

      </div>

      {/* FLOAT BAR */}

      <div className="bottom-bar-wrapper">

        <div className="bottom-bar">

          <button
            onClick={handleTrack}
          >
            📍
            <span>Track</span>
          </button>

          <button
            className={
              recording ? "recording" : ""
            }

            onClick={handleRecord}
          >
            🎤
            <span>Record</span>
          </button>

          <button
            className="sos"
            onClick={handleSOS}
          >
            🚨
          </button>

          <button
            onClick={() =>
              setFakeCall(true)
            }
          >
            📞
            <span>Fake</span>
          </button>

          <button
            onClick={() =>
              alert(
                "Women Helpline: 1091\nPolice: 100\nEmergency: 112"
              )
            }
          >
            🆘
            <span>Help</span>
          </button>

        </div>

      </div>

      {/* MENU */}

      {showMenu && (

        <Menu
          user={user}

          onClose={() =>
            setShowMenu(false)
          }

          onLogout={handleLogout}

          onShare={shareLocation}
        />

      )}

      {/* FAKE CALL */}

      {fakeCall && (

        <FakeCall
          onClose={() =>
            setFakeCall(false)
          }
        />

      )}

    </div>

  );
}

export default App;