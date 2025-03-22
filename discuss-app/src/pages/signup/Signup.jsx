import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import "./signup.css";

// Predefined admin credentials
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
  const navigate = useNavigate();

   const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";
   const { dispatch } = useContext(Context);
    

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the entered credentials match any predefined admin
    const admin = admins.find(
      (admin) => admin.email === email && admin.password === password
    );

    // If the credentials match a predefined admin, send to backend
    if (admin) {
      try {
        // Send the login request to backend with predefined admin details
        const res = await axios.post(`${apiBaseUrl}/api/auth/admin-login`, {
          email,
          password,
          username: admin.username, 
        });

        if (res.data) {
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
          navigate("/dashboard");       }
      } catch (err) {
        setError(true); 
      }
    } else {
      setError(true); 
    }
  };

  return (
    <div className="signup">
      <div className="signupContainer">
      
        <div className="signupImageContainer">
          <img
            src="/bit.png" 
            alt="Signup"
            className="signupImage"
          />
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
          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
