import { useState, useEffect } from "react";
import "./Menu.css";
import Inbox from "./Inbox";

function Menu({ user, onClose, onLogout, onShare }) {

  const [active, setActive] = useState("menu");
  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {

    const savedName = localStorage.getItem(
      `profileName_${user?.phone}`
    );

    const savedImage = localStorage.getItem(
      `profileImage_${user?.phone}`
    );

    if (savedName) setName(savedName);

    if (savedImage) setImage(savedImage);

    const load = () => {

      const data = JSON.parse(
        localStorage.getItem("history") || "[]"
      );

      setHistory(data);

    };

    load();

    const interval = setInterval(load, 1000);

    return () => clearInterval(interval);

  }, [user]);

  const handleSave = () => {

    localStorage.setItem(
      `profileName_${user?.phone}`,
      name
    );

    setEditing(false);

  };

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setImage(reader.result);

      localStorage.setItem(
        `profileImage_${user?.phone}`,
        reader.result
      );

    };

    reader.readAsDataURL(file);

  };

  return (

    <div className="menu-container">

      <div className="menu-top">

        <h2>SECUREHER</h2>

        <button onClick={onClose}>
          ✖
        </button>

      </div>

      {active !== "menu" && (

        <button
          className="back-btn"
          onClick={() => setActive("menu")}
        >
          ← Back
        </button>

      )}

      <div className="profile-card">

        <img
          src={image || "https://via.placeholder.com/80"}
          alt="profile"
          onClick={() =>
            document.getElementById("fileInput").click()
          }
        />

        <input
          id="fileInput"
          type="file"
          hidden
          onChange={handleImageChange}
        />

        <div>

          {editing ? (

            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <button onClick={handleSave}>
                ✔
              </button>
            </>

          ) : (

            <>
              <h3>{name}</h3>

              <button onClick={() => setEditing(true)}>
                ✏️
              </button>
            </>

          )}

          <p>{user?.phone}</p>

        </div>

      </div>

      {active === "menu" && (

        <div className="menu-grid-ui">

          <div onClick={() => setActive("inbox")}>
            📩
            <span>Inbox</span>
          </div>

          <div onClick={() => setActive("history")}>
            📜
            <span>SOS History</span>
          </div>

          <div onClick={() => setActive("friends")}>
            👥
            <span>Friends</span>
          </div>

          <div onClick={() => setActive("legal")}>
            ⚖️
            <span>Legal</span>
          </div>

          <div onClick={() => setActive("feedback")}>
            💬
            <span>Feedback</span>
          </div>

          <div onClick={() => setActive("helpline")}>
            📞
            <span>Help</span>
          </div>

          <div onClick={() => setActive("settings")}>
            ⚙️
            <span>Settings</span>
          </div>

          <div
            onClick={() => {

              navigator.share?.({

                title: "SecureHer",

                text: "Stay Safe",

                url: window.location.href,

              });

            }}
          >
            📤
            <span>Share App</span>
          </div>

          <div onClick={onLogout}>
            ↩
            <span>Logout</span>
          </div>

        </div>

      )}

      {active === "inbox" && (
        <Inbox user={user} />
      )}

      {active === "friends" && (

        <div className="section-box">

          <h4>Friends</h4>

          <div className="friend-card">

            <span>

              {user.name.toLowerCase() === "chandana"
                ? "Keerthana"
                : "Chandana"}

            </span>

            <button
              onClick={() =>
                onShare(
                  user.name.toLowerCase() === "chandana"
                    ? "keerthana"
                    : "chandana"
                )
              }
            >
              📍 Send
            </button>

          </div>

        </div>

      )}

      {active === "history" && (

        <div className="section-box">

          <h4>History</h4>

          {history.length === 0 && (
            <p>No recordings</p>
          )}

          {history.map((item, i) => (

            <div key={i} className="history-card">

              <p>{item.time}</p>

              <audio controls src={item.url}></audio>

            </div>

          ))}

        </div>

      )}

      {active === "legal" && (

        <div className="section-box">

          <h4>⚖️ Legal</h4>

          <div className="history-card">
            Women Safety Rights
          </div>

          <div className="history-card">
            Cyber Crime Help
          </div>

        </div>

      )}

      {active === "feedback" && (

        <div className="section-box">

          <h4>💬 Feedback</h4>

          <textarea
            placeholder="Write feedback..."
            style={{
              width: "100%",
              height: "120px",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid #ddd",
              resize: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              border: "none",
              borderRadius: "12px",
              background: "#ff4d79",
              color: "white",
            }}
          >
            Submit
          </button>

        </div>

      )}

      {active === "settings" && (

        <div className="section-box">

          <h4>⚙️ Settings</h4>

          <div className="history-card">
            Notifications Enabled
          </div>

          <div className="history-card">

            <button
              onClick={() => {

                document.body.classList.toggle("dark-mode");

                localStorage.setItem(
                  "darkMode",
                  document.body.classList.contains("dark-mode")
                );

              }}
            >
              🌙 Toggle Dark Mode
            </button>

          </div>

          <div className="history-card">

            <button
              onClick={() => {

                document.body.classList.toggle("night-mode");

                localStorage.setItem(
                  "nightMode",
                  document.body.classList.contains("night-mode")
                );

              }}
            >
              🌃 Toggle Night Mode
            </button>

          </div>

        </div>

      )}

      {active === "helpline" && (

        <div className="section-box">

          <h4>Emergency</h4>

          <div className="history-card">
            1091 - Women Helpline
          </div>

          <div className="history-card">
            100 - Police
          </div>

          <div className="history-card">
            112 - Emergency
          </div>

        </div>

      )}

    </div>

  );
}

export default Menu;