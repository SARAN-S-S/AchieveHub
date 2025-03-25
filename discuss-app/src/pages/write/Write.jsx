import { useContext, useState } from "react";
import "./write.css";
import axios from "axios";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom"; // Import useNavigate


export default function Write() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [video, setVideo] = useState(null); // New state for video
  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState(""); // Optional category
  const [year, setYear] = useState("");
  const [error, setError] = useState(""); // Error message for file size
  const [imerror, setimError] = useState(""); // Error message for missing image
  const [videoError, setVideoError] = useState(""); // Error message for video upload
  const [formatError, setFormatError] = useState(""); // Error message for invalid file format
  const [loading, setLoading] = useState(false); // Loading state
  const { user } = useContext(Context);
  const navigate = useNavigate(); // Initialize useNavigate

  const [showVideo, setShowVideo] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setimError("Please upload an image.");
      return;
    }

    // Check file format
    const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedFormats.includes(selectedFile.type)) {
      setFormatError("Invalid file format. Only PNG, JPG, and JPEG are allowed.");
      setFile(null);
      setimError(""); // Clear "missing image" error
      setError(""); // Clear file size error
      return;
    }

    if (selectedFile.size > 3 * 1024 * 1024) {
      setError("Image size should be under 3MB.");
      setFile(null);
      setimError(""); // Clear "missing image" error
      setFormatError(""); // Clear format error
    } else {
      setError("");
      setimError(""); // Clear any previous error
      setFormatError(""); // Clear format error
      setFile(selectedFile);
    }
  };

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    if (!selectedVideo) {
      setVideoError("Please upload a video.");
      return;
    }

    // Check video format
    const allowedFormats = ["video/mp4", "video/mov", "video/avi"];
    if (!allowedFormats.includes(selectedVideo.type)) {
      setVideoError("Invalid file format. Only MP4, MOV, and AVI are allowed.");
      setVideo(null);
      return;
    }

    if (selectedVideo.size > 10 * 1024 * 1024) {
      setVideoError("Video size should be under 10MB.");
      setVideo(null);
    } else {
      setVideoError("");
      setVideo(selectedVideo);
    }
  };

  const handleRemoveVideo = () => {
    setVideo(null);
    setShowVideo(false);
  };

  const toggleVideo = () => {
    setShowVideo((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setimError("Please upload an image.");
      return;
    }

    setLoading(true); // Start loading
    const tags = [category, year, category2].filter(Boolean);
    const newPost = {
      username: user.username,
      title,
      desc,
      tags,
      approved: false,
    };

    if (file) {
      const data = new FormData();
      data.append("file", file);
      try {
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload`, data);
        newPost.photo = uploadRes.data.url;
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }

    if (video) {
      const data = new FormData();
      data.append("file", video);
      try {
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload-video`, data);
        newPost.video = uploadRes.data.url;
      } catch (err) {
        console.error("Error uploading video:", err);
      }
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/api/posts`, newPost);
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return (
    <div className="write">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-message">Posting... Please wait</div>
        </div>
      )}
      {file && <img className="writeImg" src={URL.createObjectURL(file)} alt="" />}

      {error && <p className="error-message">{error}</p>} {/* File size error */}
      {imerror && <p className="imerror-message">{imerror}</p>} {/* Image required error */}
      {formatError && <p className="format-error-message">{formatError}</p>} {/* Invalid format error */}
      {videoError && <p className="video-error-message">{videoError}</p>} {/* Video upload error */}

      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          <label htmlFor="fileInput">
            <i className="writeIcon fa-solid fa-plus"></i>
          </label>
          <input
            type="file"
            id="fileInput"
            className="writeFile"
            onChange={handleFileChange}
          />
                    
          <input
            type="text"
            placeholder="Event Name | Location"
            className="writeInput"
            autoFocus={true}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Video Upload Field */}
        <div className="videoUploadContainer" onClick={() => document.getElementById('videoInput').click()}>
          <label htmlFor="videoInput">
            <i className="fa-solid fa-video"></i> 
          </label>
          <input
            type="file"
            id="videoInput"
            className="videoInput"
            onChange={handleVideoChange}
            accept="video/*"
          />
        </div>

        {video && (
          <div className="videoContainer">
            {showVideo && (
              <video controls className="videoPlayer">
                <source src={URL.createObjectURL(video)} type={video.type} />
                Your browser does not support the video tag.
              </video>
            )}
            
            {/* Buttons container */}
            <div className="videoButtons">
              <button className="videoButton" onClick={toggleVideo}>
                {showVideo ? "📹 Minimize the video" : "📹 Click here to view the video"}
              </button>
              <button className="removeVideoButton" onClick={handleRemoveVideo}>
                ❌ Remove Video
              </button>
            </div>
          </div>
        )}


        <div className="writeFormGroup">
          <select
            className="writeInput"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category 1</option>
            <option value="Project">Project</option>
            <option value="Patent">Patent</option>
            <option value="Paper">Paper</option>
            <option value="Journal">Journal</option>
            <option value="Competition">Competition</option>
            <option value="Product">Product</option>
            <option value="Placement">Placement</option>
          </select>

          <select
            className="writeInput"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Final Year">Final Year</option>
          </select>

          <select
            className="writeInput"
            value={category2}
            onChange={(e) => setCategory2(e.target.value)}
          >
            <option value="">Select Category 2 (Optional)</option>
            <option value="Project">Project</option>
            <option value="Patent">Patent</option>
            <option value="Paper">Paper</option>
            <option value="Journal">Journal</option>
            <option value="Competition">Competition</option>
            <option value="Product">Product</option>
            <option value="Placement">Placement</option>
          </select>
        </div>
        <div className="writeFormGroup">
          <textarea
            placeholder="Describe the event details, your experience, and the position you secured..."
            type="text"
            className="writeInput writeText"
            onChange={(e) => setDesc(e.target.value)}
            required
          ></textarea>
        </div>
        <button className="writeSubmit" type="submit">
          Post
        </button>
      </form>
    </div>
  );
}