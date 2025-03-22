import { useContext, useState } from "react";
import "./write.css";
import axios from "axios";
import { Context } from "../../context/Context";

export default function Write() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [category2, setCategory2] = useState(""); // Optional category
  const [year, setYear] = useState("");
  const [error, setError] = useState(""); // Error message for file size
  const [imerror, setimError] = useState(""); // Error message for missing image
  const [formatError, setFormatError] = useState(""); // Error message for invalid file format
  const [loading, setLoading] = useState(false); // Loading state
  const { user } = useContext(Context);

  // Define the backend URL using environment variables
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
        setLoading(false); // Stop loading if file upload fails
        return;
      }
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/api/posts`, newPost);
      window.location.replace("/post/" + res.data._id);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setLoading(false); // Stop loading
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