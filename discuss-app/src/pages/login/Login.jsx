import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import "./login.css";

export default function Login() {
  const { dispatch } = useContext(Context);
  const navigate = useNavigate();

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      navigate("/");
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" });
      alert(err.response?.data || "Google login failed.");
    }
  };

  return (
    <div className="login">

      <div className="loginContainer">
        <h1>Welcomes</h1>
        <div className="loginImageContainer">
          <img
            src="/bit.png" 
            alt="Login"
            className="loginImage"
          />
        </div>
        <h1>AchieveHub</h1>
        <h2>Students Login</h2>
        <br></br>
        
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Google Login Failed");
            }}
            theme="filled_black"
            shape="circle"
            size="medium"
            useOneTap={true}
          />
        </GoogleOAuthProvider>
        <br></br>
        <button className="signupSubmit" onClick={() => navigate("/signup")}>
          Admin Sign In
        </button>
      </div>
    </div>
  );
}