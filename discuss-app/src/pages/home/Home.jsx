import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/Sidebar";
import "./home.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 8;
  const { search } = useLocation();

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiBaseUrl}/api/posts` + search);
        setPosts(res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [search, apiBaseUrl]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFirstPage = () => {
    if (currentPage > 1) setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) setCurrentPage(totalPages);
  };

  return (
    <>
      <Header />
      <div className="homeMainContainer">
        <div className="homePostsContainer">
          {loading ? (
            <div className="homeLoading">
              <div className="homeSpinner"></div>
              Loading...
            </div>
          ) : posts.length === 0 ? (
            <div className="homeNoPosts">
              <div className="homeNoPostsContent">
                <span className="homeNoPostsEmoji">📜</span>
                <p className="homeNoPostsMessage">
                  No posts available. Check back later or try a different search.
                </p>
              </div>
            </div>
          ) : (
            <Posts posts={currentPosts} />
          )}

          {/* Pagination Controls */}
          {posts.length > 0 && (
            <div className="homePagination">
              <button
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className="homeFirstLastBtn"
              >
                First
              </button>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="homePrevNextBtn"
              >
                Previous
              </button>

              {/* Display Only 3 Pages with Conditional Styling */}
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (page) =>
                    page === currentPage ||
                    page === currentPage - 1 ||
                    page === currentPage + 1
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`homePageNumberBtn ${
                      page === currentPage
                        ? "homeActivePage" // Current page style
                        : "homeAdjacentPage" // Adjacent pages style
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="homePrevNextBtn"
              >
                Next
              </button>
              <button
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className="homeFirstLastBtn"
              >
                Last
              </button>
            </div>
          )}

          {/* Page Info Container */}
          {posts.length > 0 && (
            <div className="homePageInfoContainer">
              <span style={{ margin: "0 10px" }}>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
        <Sidebar />
      </div>
    </>
  );
}
