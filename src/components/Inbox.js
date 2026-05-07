import { useEffect, useState } from "react";

function Inbox({ user }) {

  const [requests, setRequests] = useState([]);
  const [sos, setSOS] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  /* LOAD CHAT */

  const loadMessages = (friend) => {

    const room1 =
      `${user.name.toLowerCase()}_${friend}`;

    const room2 =
      `${friend}_${user.name.toLowerCase()}`;

    const data1 = JSON.parse(
      localStorage.getItem(room1) || "[]"
    );

    const data2 = JSON.parse(
      localStorage.getItem(room2) || "[]"
    );

    const all = [...data1, ...data2];

    all.sort((a, b) => a.id - b.id);

    setMessages(all);
  };

  /* FETCH */

  useEffect(() => {

    if (!user) return;

    const fetchData = () => {

      fetch(
        `http://127.0.0.1:5000/get-requests/${user.name.toLowerCase()}`
      )
        .then((res) => res.json())
        .then((data) => setRequests(data))
        .catch(() => console.log("request error"));

      fetch(
        `http://127.0.0.1:5000/get-sos/${user.name.toLowerCase()}`
      )
        .then((res) => res.json())
        .then((data) => setSOS(data))
        .catch(() => console.log("sos error"));

      if (selectedUser) {
        loadMessages(selectedUser);
      }

    };

    fetchData();

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);

  }, [user, selectedUser]);

  /* SEND MESSAGE */

  const sendMessage = () => {

    if (!message.trim()) return;

    const room =
      `${user.name.toLowerCase()}_${selectedUser}`;

    const old = JSON.parse(
      localStorage.getItem(room) || "[]"
    );

    const newMsg = {

      id: Date.now(),

      from: user.name.toLowerCase(),

      text: message,

      time: new Date().toLocaleTimeString(),

    };

    const updated = [...old, newMsg];

    localStorage.setItem(
      room,
      JSON.stringify(updated)
    );

    setMessage("");

    loadMessages(selectedUser);

  };

  /* SEND IMAGE */

  const sendImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      const room =
        `${user.name.toLowerCase()}_${selectedUser}`;

      const old = JSON.parse(
        localStorage.getItem(room) || "[]"
      );

      const newMsg = {

        id: Date.now(),

        from: user.name.toLowerCase(),

        image: reader.result,

        time: new Date().toLocaleTimeString(),

      };

      const updated = [...old, newMsg];

      localStorage.setItem(
        room,
        JSON.stringify(updated)
      );

      loadMessages(selectedUser);

    };

    reader.readAsDataURL(file);

  };

  /* CHAT SCREEN */

  if (selectedUser) {

    return (

      <div className="section-box">

        <button
          className="back-btn"
          onClick={() => setSelectedUser(null)}
        >
          ← Back
        </button>

        <h3>
          💬 Chat with {selectedUser}
        </h3>

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "12px",
            height: "380px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >

          {messages.length === 0 && (
            <p>No messages</p>
          )}

          {messages.map((m, i) => (

            <div
              key={i}
              style={{
                textAlign:
                  m.from === user.name.toLowerCase()
                    ? "right"
                    : "left",

                marginBottom: "14px",
              }}
            >

              {m.text && (

                <div
                  style={{
                    display: "inline-block",
                    background:
                      m.from === user.name.toLowerCase()
                        ? "#ff4d79"
                        : "#eee",

                    color:
                      m.from === user.name.toLowerCase()
                        ? "white"
                        : "black",

                    padding: "10px 14px",

                    borderRadius: "14px",

                    maxWidth: "75%",
                  }}
                >
                  {m.text}
                </div>

              )}

              {m.image && (

                <div>

                  <img
                    src={m.image}
                    alt="chat"
                    style={{
                      width: "140px",
                      borderRadius: "12px",
                      marginTop: "6px",
                    }}
                  />

                </div>

              )}

              <div
                style={{
                  fontSize: "11px",
                  color: "#777",
                  marginTop: "4px",
                }}
              >
                {m.time}
              </div>

            </div>

          ))}

        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Type message..."
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ddd",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              border: "none",
              background: "#ff4d79",
              color: "white",
              padding: "12px 16px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            ➤
          </button>

          <label
            style={{
              background: "#eee",
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            📷

            <input
              type="file"
              hidden
              onChange={sendImage}
            />

          </label>

        </div>

      </div>

    );

  }

  return (

    <div className="section-box">

      <h4>🚨 SOS Alerts</h4>

      {sos.length === 0 && (
        <p>No SOS alerts</p>
      )}

      {sos.map((s, i) => (

        <div
          key={i}
          className="friend-card"
          style={{ background: "#ffe5e5" }}
        >

          <span>
            🚨 {s.from} is in danger!
          </span>

          <button
            onClick={() =>
              window.open(
                `/track?user=${s.from}`,
                "_blank"
              )
            }
          >
            📍 View
          </button>

        </div>

      ))}

      <h4>📩 Incoming Requests</h4>

      {requests.length === 0 && (
        <p>No requests</p>
      )}

      {requests.map((r, i) => (

        <div
          key={i}
          className="friend-card"
        >

          <span>
            {r.from} shared location
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >

            <button
              onClick={() =>
                window.open(
                  `/track?user=${r.from}`,
                  "_blank"
                )
              }
            >
              👀 View
            </button>

            <button
              onClick={() =>
                setSelectedUser(r.from)
              }
            >
              💬 Chat
            </button>

          </div>

        </div>

      ))}

    </div>

  );

}

export default Inbox;