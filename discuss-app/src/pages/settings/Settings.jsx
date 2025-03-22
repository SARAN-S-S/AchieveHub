import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Context } from "../../context/Context";
import "./settings.css";
import Sidebar from "../../components/sidebar/Sidebar";

export default function Settings() {
  const { user, dispatch } = useContext(Context);
  const [username, setUsername] = useState(user.username); // Initialize with current username
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  // Sync username state with user context
  useEffect(() => {
    setUsername(user.username);
  }, [user.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file && file.size > 3 * 1024 * 1024) {
      setError("Image size should be under 3MB only allowed...");
      return;
    }

    dispatch({ type: "UPDATE_START" });
    const updatedUser = {
      userId: user._id,
      username,
      password: user.role === "admin" ? password : undefined,
    };

    if (file) {
      const data = new FormData();
      data.append("file", file);
      try {
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload`, data);
        updatedUser.profilePic = uploadRes.data.url; // Update profilePic with the new URL
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    try {
      const res = await axios.put(`${apiBaseUrl}/api/users/${user._id}`, updatedUser);
      setSuccess(true);

      // Update the user in the context with the new data, including the profilePic
      dispatch({ type: "UPDATE_SUCCESS", payload: { ...res.data, profilePic: updatedUser.profilePic || user.profilePic } });

      // Reset the form fields immediately after successful update
      setUsername(""); // Set username to the updated value
      setPassword(""); // Clear the password field
      setFile(null); // Clear the file input

      // Hide the success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setSuccess(false);
      dispatch({ type: "UPDATE_FAILURE" });
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="settings">
      <div className="settingsWrapper">
        <div className="settingsTitle">
          <span className="settingsUpdateTitle">Update Your Account</span>
        </div>
        <form className="settingsForm" onSubmit={handleSubmit}>
          <label>Profile Picture</label>
          <div className="settingsPP">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : user.profilePic
                  ? user.profilePic
                  : "/profile.jpg"
              }
              alt=""
            />
            <label htmlFor="fileInput">
              <i className="settingsPPIcon fa-regular fa-circle-user"></i>
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
                  setError("Image size should be under 3MB only allowed...");
                  setFile(null);
                } else {
                  setError("");
                  setFile(selectedFile);
                }
              }}
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <label>User Details</label>
          <br></br>

          <label>Email</label>
          <input
            type="email"
            value={user.email}
            readOnly
            style={{ fontWeight: 'bold' }}
          />

          <label>Username</label>
          <input
            type="text"
            placeholder={user.username} // Placeholder for username
            value={username} // Controlled input for username
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          {user.role === "admin" && (
            <>
              <label>Password</label>
              <input
                type="password"
                value={password} // Controlled input for password
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}
          <button className="settingsSubmit" type="submit">
            Update
          </button>
          {success && (
            <span className={`updateSuccessMessageSet ${success ? '' : 'fade-out'}`}>
              Profile updated successfully!
            </span>
          )}
        </form>
      </div>

      <Sidebar />
    </div>
  );
}