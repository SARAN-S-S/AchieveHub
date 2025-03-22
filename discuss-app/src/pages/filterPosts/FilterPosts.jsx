import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Posts from "../../components/posts/Posts";
import "./filterPosts.css";

export default function FilterPosts() {
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiBaseUrl}/api/posts?category=${category}&year=${year}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    }
    setLoading(false);
  }, [category, year, apiBaseUrl]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="filterFilterPosts">
      <span className="filterHead"><h2>FILTER POSTS</h2></span>

      <div className="filterFilters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="Project">Project</option>
          <option value="Patent">Patent</option>
          <option value="Paper">Paper</option>
          <option value="Journal">Journal</option>
          <option value="Competition">Competition</option>
          <option value="Product">Product</option>
          <option value="Placement">Placement</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
          <option value="Third Year">Third Year</option>
          <option value="Final Year">Final Year</option>
        </select>
      </div>

      {loading ? (
        <div className="filterMessageContainer">
          <p className="filterLoading">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="filterMessageContainer">
          <p className="filterError">{error}</p>
        </div>
      ) : currentPosts.length === 0 ? (
        <div className="filterMessageContainer">
          <div className="filterNoPostsContent">
            <span className="filterNoPostsEmoji">🔍</span>
            <p className="filterNoPostsMessage">No posts found for this category / year.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="filterPostsContainer">
            <Posts posts={currentPosts} />
          </div>

          {/* Pagination */}
          <div className="filterPagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}