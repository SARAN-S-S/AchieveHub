import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./signup.css";

const admins = [
  {
    email: "saranriderz22@gmail.com",
    password: "saran@2004",
    username: "Saranriderz",
  },
  {
    email: "tharshilinbanu@gmail.com",
    password: "tharshilin@2003",
    username: "Tharshilin",
  },
  {
    email: "skmadhumitha1999@gmail.com",
    password: "madhumitha@2004",
    username: "Madhu",
  },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(Context);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const admin = admins.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (admin) {
      try {
        const res = await axios.post(`${apiBaseUrl}/api/auth/admin-login`, {
          email,
          password,
          username: admin.username, 
        });

        if (res.data) {
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
          navigate("/dashboard");
        }
      } catch (err) {
        setError(true); 
      }
    } else {
      setError(true); 
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup">
      <div className="signupContainer">
        <div className="signupImageContainer">
          <img src="/bit.png" alt="Signup" className="signupImage" />
        </div>
        <h1>AchieveHub</h1>
        <h2>Admin Sign In</h2>
        <form className="signupForm" onSubmit={handleSubmit}>
          <label>Email ID</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <label>Password</label>
          <div className="passwordInputWrapper">
            <div className="passwordInputContainer">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="button"
              className="passwordToggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button className="signupSubmit" type="submit">
            Sign In
          </button>
        </form>

        <button className="loginButton" onClick={() => navigate("/login")}>
          Login for students
        </button>
        {error && <span className="errorMessage">Invalid Email or password!</span>}
      </div>
    </div>
  );
}