import { useEffect, useRef, useState } from "react";
import "./FakeCall.css";

function FakeCall({ onClose }) {
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const [accepted, setAccepted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  /* 🔊 RINGTONE */
  useEffect(() => {
    audioRef.current = new Audio("/ringtone.mp3");
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => {});

    return () => audioRef.current.pause();
  }, []);

  /* ⏱ TIMER */
  useEffect(() => {
    if (accepted) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [accepted]);

  const handleAccept = () => {
    audioRef.current.pause();
    setAccepted(true);
  };

  const handleEnd = () => {
    clearInterval(timerRef.current);
    onClose();
  };

  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="call-screen">

      {!accepted ? (
        <>
          <div className="caller-info fade-in">
            <p className="incoming">Incoming call</p>
            <h1 className="caller-name">Mom ❤️</h1>
            <p className="calling">Mobile</p>
          </div>

          <div className="call-buttons slide-up">
            <button className="reject" onClick={handleEnd}>❌</button>
            <button className="accept" onClick={handleAccept}>✅</button>
          </div>
        </>
      ) : (
        <>
          <div className="caller-info fade-in">
            <h1 className="caller-name">Mom ❤️</h1>
            <p className="timer">{formatTime()}</p>
          </div>

          {/* 🔥 CONTROLS */}
          <div className="control-grid">
            <button>🔇<span>Mute</span></button>
            <button>🔊<span>Speaker</span></button>
            <button>⏸️<span>Hold</span></button>
            <button>🎤<span>Record</span></button>
          </div>

          <button className="end-call" onClick={handleEnd}>
            🔴 
          </button>
        </>
      )}

    </div>
  );
}

export default FakeCall;