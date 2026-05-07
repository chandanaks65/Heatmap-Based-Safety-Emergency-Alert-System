import { useState } from "react";
import "./Auth.css";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);

  const [form, setForm] = useState({});
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  /* 🔹 SEND OTP */
  const sendOTP = () => {
    if (!form.email && !form.phone) {
      return alert("Enter email or phone");
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOTP(code);
    setOtpSent(true);

    alert("OTP: " + code);
  };

  /* 🔹 SIGNUP */
  const handleSignup = () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      return alert("Fill all fields");
    }

    if (form.password.length !== 6) {
      return alert("Password must be 6 digits");
    }

    if (otp !== generatedOTP) return alert("Wrong OTP");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(form);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    setIsLogin(true);
    setOtpSent(false);
  };

  /* 🔹 LOGIN */
  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) =>
        (u.email === form.identifier || u.phone === form.identifier) &&
        u.password === form.password
    );

    if (!user) return alert("Invalid credentials");

    setUser(user);
  };

  /* 🔹 FORGOT PASSWORD */
  const handleResetPassword = () => {
    if (otp !== generatedOTP) return alert("Wrong OTP");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    users = users.map((u) => {
      if (u.email === form.identifier || u.phone === form.identifier) {
        return { ...u, password: form.newPassword };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Password updated!");
    setForgotMode(false);
    setOtpSent(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* TITLE */}
        <h2>
          {forgotMode
            ? "Reset Password"
            : isLogin
            ? "Login"
            : "Signup"}
        </h2>

        {/* SIGNUP */}
        {!isLogin && !forgotMode && (
          <>
            <input placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input placeholder="Phone"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input type="password" placeholder="6-digit Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {!otpSent ? (
              <button onClick={sendOTP}>Send OTP</button>
            ) : (
              <>
                <input
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button onClick={handleSignup}>Signup</button>
              </>
            )}
          </>
        )}

        {/* LOGIN */}
        {isLogin && !forgotMode && (
          <>
            <input
              placeholder="Email or Phone"
              onChange={(e) =>
                setForm({ ...form, identifier: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <button onClick={handleLogin}>Login</button>

            <p
              className="link"
              onClick={() => {
                setForgotMode(true);
                setOtpSent(false);
              }}
            >
              Forgot Password?
            </p>
          </>
        )}

        {/* FORGOT PASSWORD */}
        {forgotMode && (
          <>
            <input
              placeholder="Email or Phone"
              onChange={(e) =>
                setForm({ ...form, identifier: e.target.value })
              }
            />

            {!otpSent ? (
              <button onClick={sendOTP}>Send OTP</button>
            ) : (
              <>
                <input
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="New Password"
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                />

                <button onClick={handleResetPassword}>
                  Reset Password
                </button>
              </>
            )}
          </>
        )}

        {/* SWITCH */}
        {!forgotMode && (
          <p onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create account" : "Already have account"}
          </p>
        )}

      </div>
    </div>
  );
}

export default Auth;