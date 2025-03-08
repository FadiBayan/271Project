import React, { useState } from "react";
import PasswordInput from "./PasswordInput";
import { trySignup } from "../../auth-api";
import { Link, useNavigate } from "react-router-dom"; 
import zxcvbn from "zxcvbn";
import "../../static/LoginPage/signup.css"; // ✅ Use separate styling for signup

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const validateEmail = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value.endsWith("@mail.aub.edu")) {
      setEmailWarning("⚠ Email must end with @mail.aub.edu");
    } else {
      setEmailWarning("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(""); 
    setError(""); 

    try {
        const responseMessage = await trySignup(email, password);

        if (typeof responseMessage === "object") {
            setError(responseMessage.message || "An unexpected error occurred."); 
        } else {
            setMessage(responseMessage); 
            navigate("/login");
        }
    } catch (err) {
        setError("⚠ Failed to fetch. Please check your connection or server.");
    }
  };

  function checkPasswordStrength(password_input) {
    const passwd_Vald = zxcvbn(password_input);

    if (passwd_Vald.score < 3) {
      setPasswordWarning("⚠ Weak password: " + passwd_Vald.feedback.suggestions[passwd_Vald.feedback.suggestions.length - 1]);
    } else {
      setPasswordWarning("");
    }
  }

  return (
    <div className="signup-container"> {/* ✅ Signup-specific wrapper */}
      <div className="signup-box"> {/* ✅ Matches the login box */}
        <h2>Sign Up</h2>

        <form className="form-content" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="studentaccount@mail.aub.edu"
              value={email}
              onChange={validateEmail}
              required
            />
            {emailWarning && <small className="error-message">{emailWarning}</small>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <PasswordInput id="newPassword" value={password} onChange={(e) => {
              checkPasswordStrength(e.target.value);
              setPassword(e.target.value);
            }} />
            {passwordWarning && <small className="error-message">{passwordWarning}</small>}
          </div>

          <button type="submit" className="signup-btn" disabled={emailWarning !== ""}>Sign Up</button>
          
          <p className="have-account">Already have an account? <Link to="/login">Login</Link></p>

          {error && <p className="error-message">{error}</p>}
          {message && !error && <p className="success-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
