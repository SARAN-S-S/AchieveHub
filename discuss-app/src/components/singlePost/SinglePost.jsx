import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect, useContext, useRef } from "react";
import "./singlePost.css";
import axios from "axios";
import { Context } from "../../context/Context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faPaperPlane, faReply, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  const { user } = useContext(Context);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [updateMode, setUpdateMode] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState("");
  const [year, setYear] = useState("");

  const [file, setFile] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [initialPhoto, setInitialPhoto] = useState(null);
  const [error, setError] = useState("");

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const [updateloading, setupdateLoading] = useState(false); // Loading state for updates
  const [loading, setLoading] = useState(true);

  const textareaRef = useRef(null);
  const replyTextareaRef = useRef(null);

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [yearError, setYearError] = useState("");
  const [commentError, setcommentError] = useState("");

  const [video, setVideo] = useState(null); // New state for video
  const [newVideo, setNewVideo] = useState(null); // New state for updated video
  const [initialVideo, setInitialVideo] = useState(null); // New state for initial video
  const [videoError, setVideoError] = useState(""); // New state for video error
  const [showVideo, setShowVideo] = useState(false); // Toggle video visibility

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  useEffect(() => {
    if (editingComment && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [editingComment]);

  useEffect(() => {
    if (replyingToComment && replyTextareaRef.current) {
      replyTextareaRef.current.focus();
    }
  }, [replyingToComment]);

  useEffect(() => {
    const getPostData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/posts/${path}`),
          axios.get(`${apiBaseUrl}/api/comments/${path}`)
        ]);
        const postData = postRes.data;
        setPost(postData);
        setTitle(postData.title);
        setDesc(postData.desc);
        setCategory(postData.tags[0] || "");
        setCategory2(postData.tags[2] || "");
        setYear(postData.tags[1] || "");
        setInitialPhoto(postData.photo || null);
        setInitialVideo(postData.video || null); // Set initial video
        setLikes(postData.likes || 0);
        setComments(commentsRes.data);
        setLoading(false);

        if (user) {
          const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
          setLiked(likedPosts.includes(postData._id));
        }
      } catch (err) {
        console.error("Error fetching post or comments:", err);
        setLoading(false);
      }
    };
    getPostData();
  }, [path, user, apiBaseUrl]);

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
      setNewVideo(null); // Use newVideo here
      return;
    }
  
    // Check video format
    const allowedFormats = ["video/mp4", "video/mov", "video/avi"];
    if (!allowedFormats.includes(selectedVideo.type)) {
      setVideoError("Invalid file format. Only MP4, MOV, and AVI are allowed.");
      setVideo(null);
      setNewVideo(null); // Use newVideo here
      return;
    }
  
    // Check file size
    if (selectedVideo.size > 10 * 1024 * 1024) {
      setVideoError("Video size should be under 10MB only allowed...");
      setVideo(null);
      setNewVideo(null); // Use newVideo here
    } else {
      setVideoError("");
      setVideo(selectedVideo);
      setNewVideo(URL.createObjectURL(selectedVideo)); // Use newVideo here
    }
  };

  const toggleVideo = (e) => {
    e.preventDefault(); // Prevent form submission
    setShowVideo((prev) => !prev);
  };
  
  const handleRemoveVideo = (e) => {
    e.preventDefault(); // Prevent form submission
    setVideo(null);
    setNewVideo(null);
    setInitialVideo(null); // Ensure initialVideo is also set to null
  };
  

  const handleLike = async () => {
    try {
      if (!user) {
        alert("You must be logged in to like a post.");
        return;
      }

      if (liked) {
        await axios.post(`${apiBaseUrl}/api/posts/${post._id}/unlike`);
        setLikes(prevLikes => prevLikes - 1);
        setLiked(false);

        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify(likedPosts.filter(id => id !== post._id)));
      } else {
        await axios.post(`${apiBaseUrl}/api/posts/${post._id}/like`);
        setLikes(prevLikes => prevLikes + 1);
        setLiked(true);

        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, post._id]));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/api/posts/${post._id}`, { data: { username: user.username } });
      window.location.replace("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    // Validation checks
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
  
    setupdateLoading(true); // Start loading
    try {
      const updatedPost = {
        username: user.username,
        title,
        desc,
        category,
        category2,
        year,
        tags: [category, year, category2].filter(Boolean),
        photo: newPhoto ? newPhoto : initialPhoto,
        video: initialVideo, // Default to initialVideo
      };
  
      // Upload photo if a new file is selected
      if (file) {
        const data = new FormData();
        data.append("file", file);
        try {
          const uploadRes = await axios.post(`${apiBaseUrl}/api/upload`, data);
          updatedPost.photo = uploadRes.data.url;
        } catch (err) {
          console.error("Error uploading file:", err);
        }
      }
  
      // Upload video if a new file is selected
      if (video) {
        const data = new FormData();
        data.append("file", video);
        try {
          const uploadRes = await axios.post(`${apiBaseUrl}/api/upload-video`, data);
          updatedPost.video = uploadRes.data.url; // Set video to Cloudinary URL
        } catch (err) {
          console.error("Error uploading video:", err);
        }
      }

  
      // Send the updated post to the backend
      const res = await axios.put(`${apiBaseUrl}/api/posts/${post._id}`, updatedPost);
      setPost(res.data);
      setUpdateMode(false);
      setFile(null);
      setNewPhoto(null);
      setInitialPhoto(res.data.photo);
      setVideo(null);
      setNewVideo(null); // Reset newVideo
      setInitialVideo(res.data.video); // Update initialVideo with the new URL
    } catch (err) {
      console.error("Error updating post:", err);
    } finally {
      setTimeout(() => {
        setupdateLoading(false); // Stop loading after 3 seconds
      }, 3000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
    try {
      const res = await axios.post(`${apiBaseUrl}/api/comments`, {
        postId: post._id,
        userId: user._id,
        username: user.username,
        text: newComment,
        parentCommentId: replyingToComment,
      });

      if (replyingToComment) {
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment._id === replyingToComment) {
              return {
                ...comment,
                replies: [res.data, ...(comment.replies || [])],
              };
            }
            return comment;
          });
        });
      } else {
        setComments([res.data, ...comments]);
      }

      setNewComment("");
      setReplyingToComment(null);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const comment = findCommentById(comments, commentId);

      if (user._id === comment.userId || user.role === "admin") {
        await axios.delete(`${apiBaseUrl}/api/comments/${commentId}`, { 
          data: { userId: user._id }
        });

        setComments(prevComments => {
          return removeCommentFromState(prevComments, commentId);
        });
      } else {
        alert("You can only delete your own comments.");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const findCommentById = (commentsArray, commentId) => {
    for (const comment of commentsArray) {
      if (comment._id === commentId) {
        return comment;
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  const removeCommentFromState = (commentsArray, commentId) => {
    return commentsArray.filter(comment => {
      if (comment._id === commentId) {
        return false;
      }
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromState(comment.replies, commentId);
      }
      return true;
    });
  };

  const handleEditComment = (comment) => {
    if (user._id === comment.userId || user.role === "admin") {
      setEditingComment(comment._id);
      setEditedCommentText(comment.text);
    } else {
      alert("You can only edit your own comments.");
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      if (!editedCommentText.trim()) {
        setcommentError("Comment cannot be empty while updating."); 
        return; 
      }
      const comment = findCommentById(comments, commentId);
      if (user._id === comment.userId || user.role === "admin") {
        const res = await axios.put(`${apiBaseUrl}/api/comments/${commentId}`, {
          userId: user._id,
          text: editedCommentText,
        });

        setComments(prevComments => {
          return prevComments.map(c => updateCommentText(c, commentId, res.data.text));
        });

        setEditingComment(null);
        setcommentError("");
        
      } else {
        alert("You can only update your own comments.");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const updateCommentText = (comment, commentId, newText) => {
    if (comment._id === commentId) {
      return { ...comment, text: newText };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => updateCommentText(reply, commentId, newText)),
      };
    }
    return comment;
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleReply = (comment) => {
    setReplyingToComment(comment._id);
    setReplyText("");
  };

  const handlePostReply = async (commentId) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/api/comments`, {
        postId: post._id,
        userId: user._id,
        username: user.username,
        text: replyText,
        parentCommentId: commentId,
      });

      setComments(prevComments => {
        return prevComments.map(c => updateCommentReplies(c, commentId, res.data));
      });

      setReplyText("");
      setReplyingToComment(null);
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const updateCommentReplies = (comment, commentId, newReply) => {
    if (comment._id === commentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map(reply => updateCommentReplies(reply, commentId, newReply)),
      };
    }
    return comment;
  };

  const renderComment = (comment, level = 0) => {
    const isAuthor = user && (comment.userId === user._id || user.role === "admin");
    return (
      <div className={`comment ${level > 0 ? 'reply' : ''}`} key={comment._id}>
        <div className="commentInfo">
          <span>{comment.username}</span>
          <span>{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        {editingComment === comment._id ? (
          <div className="comment-edit-form">
            <textarea
              ref={textareaRef}
              className="comment-edit-textarea"
              value={editedCommentText}
              onChange={(e) => { setEditedCommentText(e.target.value); setcommentError(""); }}
              style={{ backgroundColor: "#f0f8ff" }} // Light blue background for edit textarea
            />
            <div className="comment-edit-buttons">
              <button
                className="comment-edit-update"
                onClick={() => handleUpdateComment(comment._id)}
              >
                Update
              </button>
              <button
                className="comment-edit-cancel"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
            {commentError && <p className="error-message">{commentError}</p>}
          </div>
        ) : (
          <p>{comment.text}</p>
        )}

        <div className="comment-controls">
          {user && (
            <>
              {isAuthor && (
                <>
                  <FontAwesomeIcon className="commentIcon edit-icon" icon={faPenToSquare} onClick={() => handleEditComment(comment)} />
                  <FontAwesomeIcon className="commentIcon delete-icon" icon={faTrashCan} onClick={() => handleDeleteComment(comment._id)} />
                </>
              )}
              <FontAwesomeIcon className="commentIcon reply-icon" icon={faReply} onClick={() => handleReply(comment)} />
            </>
          )}
        </div>

        {replyingToComment === comment._id && (
          <div className="reply-form">
            <textarea
              ref={replyTextareaRef}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ fontSize: "1.1em" }} // Increase font size while typing
            />
            <button onClick={() => handlePostReply(comment._id)}>Post Reply</button>
            <button onClick={() => setReplyingToComment(null)}>Cancel</button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          comment.replies.map(reply => renderComment(reply, level + 1))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="single-loading-overlay">
        <div className="single-loading-message">
          <div className="single-loading-spinner"></div>
          Loading posts...
        </div>
      </div>
    );
  }

  return (
    <div className="singlePost">
      {updateloading && (
        <div className="single-loading-overlay">
          <div className="single-loading-message">
            <div className="single-loading-spinner"></div>
            Updating... Please wait
          </div>
        </div>
      )}
      <div className="singlePostWrapper">
        {updateMode ? (
          <form onSubmit={handleUpdate}>
            {/* Existing image and title section */}
            <div className="image-edit-section">
              {newPhoto ? (
                <img className="writeImg" src={newPhoto} alt="New Post Preview" />
              ) : initialPhoto ? (
                <img className="singlePostImg" src={initialPhoto} alt={post.title} />
              ) : null}

              {error && <p className="error-message">{error}</p>}

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
                  onChange={(e) => {setTitle(e.target.value);
                  setTitleError("");
                  } }
                />
              </div>
              {titleError && <p className="error-message">{titleError}</p>}
            </div>

            {videoError && <p className="error-message">{videoError}</p>}

            {/* Video Upload Section */}
            <div className="singleVideoUploadContainer" onClick={() => document.getElementById('singleVideoInput').click()}>
              <label htmlFor="singleVideoInput">
                <i className="fa-solid fa-video"></i> 
              </label>
              <input
                type="file"
                id="singleVideoInput"
                className="singleVideoInput"
                onChange={handleVideoChange}
                accept="video/*"
                
              />
            </div>

            {/* Video Preview and Controls */}
            {(newVideo || initialVideo) && (
              <div className="singleVideoContainer">
                {showVideo && (
                  <video controls className="singleVideoPlayer">
                    <source src={newVideo || initialVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {/* Buttons container */}
                <div className="singleVideoButtons">
                  <button className="singleVideoButton" onClick={(e) => toggleVideo(e)}>
                    {showVideo ? "📹 Minimize the video" : "📹 Click here to view the video"}
                  </button>
                  <button className="singleRemoveVideoButton" onClick={(e) => handleRemoveVideo(e)}>
                    ❌ Remove Video
                  </button>
                </div>
              </div>
            )}

            {/* Existing category, year, and description fields */}
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

              <select className="writeInput" value={year} onChange={(e) => { setYear(e.target.value);  setYearError(""); }} required>
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
            <textarea className="singlePostDescInput" value={desc} onChange={(e) => { setDesc(e.target.value); setDescError(""); }} />
            <button className="singlePostButton" type="submit">Update</button>
          </form>
        ) : (
          <div>
            {post.photo && (
              <img className="singlePostImg" src={post.photo} alt={post.title} />
            )}
            <h1 className="siglePostTitle">
              {title}
              {(post.username === user?.username || user?.role === "admin") && (
                <div className="singlePostEdit">
                  <i
                    className="singlePostIcon fa-regular fa-pen-to-square"
                    onClick={() => setUpdateMode(true)}
                  ></i>
                  <i
                    className="singlePostIcon fa-regular fa-trash-can"
                    onClick={handleDelete}
                  ></i>
                </div>
              )}
            </h1>
            <div className="postTags">
              <strong>Tags:</strong>
              {post.tags && post.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <div className="singlePostInfo">
              <span className="singlePostAuthor">
                Author:
                <Link to={`/?user=${post.username}`} className="link">
                  <b>{post.username}</b>
                </Link>
              </span>
              <span className="singlePostDate">
                {new Date(post.createdAt).toDateString()}
              </span>
            </div>

            {/* Video Display Section */}
            {post.video ? (
              <div className="singleVideoContainer">
                {showVideo && (
                  <video controls className="singleVideoPlayer">
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {/* Buttons container */}
                <div className="singleVideoButtons">
                  <button className="singleVideoButton" onClick={toggleVideo}>
                    {showVideo ? "📹 Minimize the video" : "📹 Click here to view the video"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="no-video-message">No video available for this post.</p>
            )}
            <div className="like-container">
              <div className="like-section" onClick={handleLike}>
                <FontAwesomeIcon icon={faThumbsUp} className={`like-icon ${liked ? "liked" : ""}`} />
                <span className="like-count">{likes}</span>
              </div>
            </div>
            <br></br>
            <p className="singlePostDesc">{desc}</p>

            
          </div>
        )}

        {/* Comments Section (unchanged) */}
        <div className="comments-container">
          <div className="comments">
            <h3>Comments</h3>
            {comments.map(comment => renderComment(comment))}
          </div>
          {user && (
            <div className="comment-input-container">
              <form className="commentForm" onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    e.target.style.fontSize = "1.1em"; // Increase font size while typing
                  }}
                  required
                ></textarea>
                <button type="submit">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}