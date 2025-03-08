import React, { useState, useEffect } from "react";
import PasswordInput from "./PasswordInput";
import { tryLogin } from "../../auth-api";  // Relative to the LoginForm.js location
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("student"); // Default role is student
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleRoleSelection = (event) => {
    setRole(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const responseMessage = await tryLogin(email, password);

      if (typeof responseMessage === "object") {
        setError(responseMessage.message || "An unexpected error occurred.");
      } else {
        setMessage(responseMessage);

        // Store user role in localStorage for future use
        localStorage.setItem("userRole", role);

        // Redirect based on role
        if (role === "student") {
          navigate("/student"); // 🚀 Redirect students to StudentPage
        } else {
          navigate("/home"); // 🚀 Redirect cabinet members to HomePage (Cabinet Choice)
        }
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <form className="form-content" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* 🎯 User Role Selection */}
        <div className="input-group">
          <label>
            <input
              type="radio"
              name="loginType"
              value="student"
              checked={role === "student"}
              onChange={handleRoleSelection}
            />
            Student
          </label>
          <label>
            <input
              type="radio"
              name="loginType"
              value="cabinet"
              checked={role === "cabinet"}
              onChange={handleRoleSelection}
            />
            Cabinet
          </label>
        </div>

        {/* 📧 Email Field */}
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* 🔒 Password Field */}
        <div className="input-group">
          <label>Password</label>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {/* 📌 Cabinet-Specific Fields (Only Show If Cabinet is Selected) */}
        {role === "cabinet" && (
          <div id="cabinetFields" className="show">
            <div className="input-group">
              <label>Club CRN</label>
              <input type="text" placeholder="Enter club CRN" required />
            </div>
            <div className="input-group">
              <label>Club Password</label>
              <PasswordInput id="clubPassword" />
            </div>
          </div>
        )}

        <button type="submit" className="login-btn">Login</button>
        <p id="no_account">Don't have an account? <Link id="no_account" to="/signup">Sign Up</Link></p>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
