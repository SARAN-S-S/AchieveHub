import { Link } from "react-router-dom";
import "./login.css";
import { Context } from "../../context/Context";
import { useRef, useContext } from "react";
import axios from "axios";


export default function Login() {

  const userRef = useRef();
  const passwordRef = useRef();
  const { dispatch, isFetching } = useContext(Context)
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({type: "LOGIN_START"});
    
    try{
      const res = await axios.post("/api/auth/login", {
        username: userRef.current.value,
        password: passwordRef.current.value,
      });
      dispatch({type: "LOGIN_SUCCESS", payload: res.data});
      
    }
    catch(err) {
      dispatch({type: "LOGIN_FAILURE"});
    }
  };

  
  return (
    <div className="login">
        <div className="loginContainer">
            <span className="loginTitle">Login</span>
            
            <form className="loginForm" onSubmit={handleSubmit}>
                <label>Username</label>
                <input type="text" className="loginInput" placeholder="Enter your Username.." ref={userRef} required />
                <label>Password</label>
                <input type="password" className="loginInput" placeholder="Enter your password.." ref={passwordRef} required />
                <button className="loginSubmit" type="submit" disabled={isFetching}>Login</button>
            </form>
        </div>
        <button className="loginRegisterSubmit">
          <Link className="link" to = "/register">Register</Link>
        </button>
    </div>
  );
}
