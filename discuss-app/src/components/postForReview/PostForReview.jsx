import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./postForReview.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function PostForReview() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState("");
  const [year, setYear] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [file, setFile] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [initialPhoto, setInitialPhoto] = useState(null);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");

  const [updateloading, setupdateloading] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [yearError, setYearError] = useState("");

  // New state for video
  const [video, setVideo] = useState(null);
  const [newVideo, setNewVideo] = useState(null);
  const [initialVideo, setInitialVideo] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [showVideo, setShowVideo] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/posts/${postId}`);
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
        setCategory(res.data.tags[0] || "");
        setYear(res.data.tags[1] || "");
        setCategory2(res.data.tags[2] || "");
        setInitialPhoto(res.data.photo || null);
        setInitialVideo(res.data.video || null); // Set initial video
        setLikes(res.data.likes || 0);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, apiBaseUrl]);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
    setLiked(likedPosts.includes(postId));
  }, [postId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError("Please upload an image.");
      setFile(null);
      setNewPhoto(null);
      return;
    }

    // Check file format
    const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedFormats.includes(selectedFile.type)) {
      setError("Invalid file format. Only PNG, JPG, and JPEG are allowed.");
      setFile(null);
      setNewPhoto(null);
      return;
    }

    // Check file size
    if (selectedFile.size > 3 * 1024 * 1024) {
      setError("Image size should be under 3MB only allowed...");
      setFile(null);
      setNewPhoto(null);
    } else {
      setError("");
      setFile(selectedFile);
      setNewPhoto(URL.createObjectURL(selectedFile));
    }
  };

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    if (!selectedVideo) {
      setVideoError("Please upload a video.");
      setVideo(null);
      setNewVideo(null);
      return;
    }

    // Check video format
    const allowedFormats = ["video/mp4", "video/mov", "video/avi"];
    if (!allowedFormats.includes(selectedVideo.type)) {
      setVideoError("Invalid file format. Only MP4, MOV, and AVI are allowed.");
      setVideo(null);
      setNewVideo(null);
      return;
    }

    // Check file size
    if (selectedVideo.size > 10 * 1024 * 1024) {
      setVideoError("Video size should be under 10MB only allowed...");
      setVideo(null);
      setNewVideo(null);
    } else {
      setVideoError("");
      setVideo(selectedVideo);
      setNewVideo(URL.createObjectURL(selectedVideo));
    }
  };

  const toggleVideo = (e) => {
    e.preventDefault();
    setShowVideo((prev) => !prev);
  };

  const handleRemoveVideo = (e) => {
    e.preventDefault();
    setVideo(null);
    setNewVideo(null);
    setInitialVideo(null);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.put(`${apiBaseUrl}/api/posts/approve/${postId}`);
      navigate("/approval-pending");
    } catch (err) {
      console.error("Error approving post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${apiBaseUrl}/api/posts/reject/${postId}`, { reason: rejectionReason });
      navigate("/approval-pending");
    } catch (err) {
      console.error("Error rejecting post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (file && file.size > 3 * 1024 * 1024) {
      setError("Image size should be under 3MB only allowed...");
      return;
    }

    if (video && video.size > 10 * 1024 * 1024) {
      setVideoError("Video size should be under 10MB only allowed...");
      return;
    }

    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }
    if (!category.trim()) {
      setCategoryError("Category 1 is required.");
      return;
    }
    if (!year.trim()) {
      setYearError("Student year is required.");
      return;
    }
    if (!desc.trim()) {
      setDescError("Description is required.");
      return;
    }

    setupdateloading(true);
    const tags = [category, year, category2].filter(Boolean);
    const updatedPost = {
      title,
      desc,
      tags,
      photo: newPhoto ? newPhoto : initialPhoto,
      video: initialVideo, // Default to initialVideo
    };

    if (file) {
      const data = new FormData();
      data.append("file", file);
      try {
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload`, data);
        updatedPost.photo = uploadRes.data.url;
      } catch (err) {
        console.error("Error uploading file:", err);
        setupdateloading(false);
        return;
      }
    }

    if (video) {
      const data = new FormData();
      data.append("file", video);
      try {
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload-video`, data);
        updatedPost.video = uploadRes.data.url;
      } catch (err) {
        console.error("Error uploading video:", err);
        setupdateloading(false);
        return;
      }
    }

    try {
      await axios.put(`${apiBaseUrl}/api/posts/edit/${postId}`, updatedPost);
      setPost({ ...post, ...updatedPost });
      setUpdateMode(false);
      setFile(null);
      setNewPhoto(null);
      setInitialPhoto(updatedPost.photo);
      setVideo(null);
      setNewVideo(null);
      setInitialVideo(updatedPost.video);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 10000);
    } catch (err) {
      console.error("Error updating post:", err);
    } finally {
      setTimeout(() => {
        setupdateloading(false);
      }, 3000);
    }
  };

  const handleActionSubmit = () => {
    if (action === "approve") {
      handleApprove();
    } else if (action === "reject") {
      if (!rejectionReason) {
        alert("Please provide a reason for rejection.");
        return;
      }
      handleReject();
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await axios.post(`${apiBaseUrl}/api/posts/${postId}/unlike`);
        setLikes(likes - 1);
        setLiked(false);
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts.filter((id) => id !== postId)));
      } else {
        await axios.post(`${apiBaseUrl}/api/posts/${postId}/like`);
        setLikes(likes + 1);
        setLiked(true);
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, postId]));
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  if (loading) {
    return (
      <div className="review-loading-overlay">
        <div className="review-loading-message">
          <div className="review-loading-spinner"></div>
          Loading posts...
        </div>
      </div>
    );
  }

  return (
    <div className="postForReview">
      {updateloading && (
        <div className="review-loading-overlay">
          <div className="review-loading-message">
            <div className="review-loading-spinner"></div>
            Updating... Please wait
          </div>
        </div>
      )}
      <div className="postForReviewHeader">
        <h1>Review the Post</h1>
        <span className="postIdDisplay">Post ID: {postId}</span>
      </div>
      <div className="postForReviewWrapper">
        {updateMode ? (
          <form onSubmit={handleSave}>
            <div className="image-edit-section">
              {newPhoto ? (
                <img className="writeImg" src={newPhoto} alt="New Post Preview" />
              ) : initialPhoto ? (
                <img className="singlePostImg" src={initialPhoto} alt={post.title} />
              ) : null}

              {error && <p className="review-error-message">{error}</p>}

              <div className="postContainer">
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
                </div>
                <input
                  type="text"
                  value={title}
                  className="singlePostTitleInput"
                  autoFocus
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError("");
                  }}
                />
              </div>
              {titleError && <p className="error-message">{titleError}</p>}
            </div>

            {videoError && <p className="review-error-message">{videoError}</p>}

            {/* Video Upload Section */}
            <div className="reviewVideoUploadContainer" onClick={() => document.getElementById('reviewVideoInput').click()}>
              <label htmlFor="reviewVideoInput">
                <i className="fa-solid fa-video"></i>
              </label>
              <input
                type="file"
                id="reviewVideoInput"
                className="reviewVideoInput"
                onChange={handleVideoChange}
                accept="video/*"
              />
            </div>

            {/* Video Preview and Controls */}
            {(newVideo || initialVideo) && (
              <div className="reviewVideoContainer">
                {showVideo && (
                  <video controls className="reviewVideoPlayer">
                    <source src={newVideo || initialVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Buttons container */}
                <div className="reviewVideoButtons">
                  <button className="reviewVideoButton" onClick={(e) => toggleVideo(e)}>
                    {showVideo ? "📹 Minimize the video" : "📹 Click here to view the video"}
                  </button>
                  <button className="reviewRemoveVideoButton" onClick={(e) => handleRemoveVideo(e)}>
                    ❌ Remove Video
                  </button>
                </div>
              </div>
            )}

            <div className="writeFormGroup">
              <select className="writeInput" value={category} onChange={(e) => { setCategory(e.target.value); setCategoryError(""); }} required>
                <option value="Project">Project</option>
                <option value="Patent">Patent</option>
                <option value="Paper">Paper</option>
                <option value="Journal">Journal</option>
                <option value="Competition">Competition</option>
                <option value="Product">Product</option>
                <option value="Placement">Placement</option>
              </select>

              <select className="writeInput" value={year} onChange={(e) => { setYear(e.target.value); setYearError(""); }} required>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Final Year">Final Year</option>
              </select>

              <select className="writeInput" value={category2} onChange={(e) => setCategory2(e.target.value)}>
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

            {categoryError && <p className="error-message">{categoryError}</p>}
            {yearError && <p className="error-message">{yearError}</p>}

            {descError && <p className="error-message">{descError}</p>}
            <textarea
              className="singlePostDescInput"
              value={desc}
              onChange={(e) => { setDesc(e.target.value); setDescError(""); }}
              placeholder="Write your post description here..."
            />

            <button className="singlePostButton" type="submit">Update</button>
          </form>
        ) : (
          <div>
            {post.photo && (
              <img className="singlePostImg" src={post.photo} alt={post.title} />
            )}
            <h1 className="siglePostTitle">
              {title}
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon fa-regular fa-pen-to-square"
                  onClick={() => setUpdateMode(true)}
                ></i>
              </div>
            </h1>
            <div className="postTags">
              <strong>Tags:</strong>
              {[category, year, category2].filter(Boolean).map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="like-container">
              <div className="like-section" onClick={handleLike}>
                <FontAwesomeIcon icon={faThumbsUp} className={`like-icon ${liked ? "liked" : ""}`} />
                <span className="like-count">{likes}</span>
              </div>
            </div>
            <div className="singlePostInfo">
              <span className="singlePostAuthor">
                Author:
                <b>{post.username}</b>
              </span>
              <span className="singlePostDate">
                {new Date(post.createdAt).toDateString()}
              </span>
            </div>

            {/* Video Display Section */}
            {post.video ? (
              <div className="reviewVideoContainer">
                {showVideo && (
                  <video controls className="reviewVideoPlayer">
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Buttons container */}
                <div className="reviewVideoButtons">
                  <button className="reviewVideoButton" onClick={toggleVideo}>
                    {showVideo ? "📹 Minimize the video" : "📹 Click here to view the video"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="no-video-message">No video available for this post.</p>
            )}

            <p className="singlePostDesc">{desc}</p>
          </div>
        )}
        {updateSuccess && (
          <p className={`updateSuccessMessage ${updateSuccess ? '' : 'fade-out'}`}>
            Post updated successfully!
          </p>
        )}

        <div className="approvalSection">
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Select Action</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
          {action === "reject" && (
            <textarea
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}
          <button onClick={handleActionSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}