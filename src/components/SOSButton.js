import React from "react";

function SOSButton() {
  const sendSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          alert(`🚨 SOS Sent!\nLocation: ${lat}, ${lng}`);

          // 👉 Later you can send this to backend / contacts
        },
        (err) => {
          alert("Location access denied!");
          console.log(err);
        }
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  return (
    <button
      onClick={sendSOS}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "red",
        color: "white",
        padding: "15px 20px",
        border: "none",
        borderRadius: "50%",
        fontSize: "18px",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)"
      }}
    >
      SOS
    </button>
  );
}

export default SOSButton;