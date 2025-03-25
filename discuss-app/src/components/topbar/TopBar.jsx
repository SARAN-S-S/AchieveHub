import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import "./topbar.css";

export default function TopBar() {
  const { user, dispatch } = useContext(Context);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="top">
      <div className="topLeft">
        <Link className="link" to="/about" onClick={closeMenu}>
          <i className="fa-solid fa-trophy"></i>
          <span className="profile-text">AchieveHub</span>
        </Link>
        
        {/* Replaced menu icon with div */}
        <div 
          className={`mobile-menu-icon ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </div>
        
        {/* Navigation Menu */}
        <ul className={`topList ${isMenuOpen ? "active" : ""}`}>
          {isMenuOpen && (
            <div className="closeIcon" onClick={closeMenu}>
              <span className="close-line"></span>
              <span className="close-line"></span>
            </div>
          )}
          <Link className="link" to={user.role === "admin" ? "/dashboard" : "/"} onClick={closeMenu}>
            <li className="topListItem">Home</li>
          </Link>
          <Link className="link" to="/about" onClick={closeMenu}>
            <li className="topListItem">About</li>
          </Link>
          <Link className="link" to="/contact" onClick={closeMenu}>
            <li className="topListItem">Contact</li>
          </Link>
          <Link className="link" to="/write" onClick={closeMenu}>
            <li className="topListItem">Post</li>
          </Link>
          <Link className="link" to="/my-posts" onClick={closeMenu}>
            <li className="topListItem">My Posts</li>
          </Link>
          <li 
            className="topListItem" 
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
          >
            Logout
          </li>
        </ul>
      </div>
      
      <div className="topRight">
        <ul>
          <Link to="/settings" onClick={closeMenu}>
            <li>
              <img
                className="topImg"
                src={user.profilePic ? user.profilePic : "/profile.jpg"}
                alt="Profile"
              />
            </li>
          </Link>
          <Link className="link" to="/settings" onClick={closeMenu}>
            <li className="topListItem">{user.username}</li>
          </Link>
        </ul>
      </div>
    </div>
  );
}