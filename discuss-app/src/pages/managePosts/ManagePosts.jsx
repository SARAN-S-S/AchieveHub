import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./managePosts.css";

export default function ManagePostsCustom() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/posts?search=${search}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, apiBaseUrl]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, currentPage]);

  const handleBulkDelete = async () => {
    try {
      await axios.post(`${apiBaseUrl}/api/posts/bulk-delete`, { postIds: selectedPosts });
      fetchPosts();
      setSelectedPosts([]);
    } catch (err) {
      console.error("Error deleting posts:", err);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="managePostsCustom">
      <h1>Manage Posts</h1>
      <div className="containerCustom">
        <div className="searchContainerCustom">
          <div className="searchWrapperCustom">
            <FontAwesomeIcon icon={faSearch} className="searchIconCustom" />
            <input
              type="text"
              placeholder="Search by title, username, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bulkDeleteButtonCustom" onClick={handleBulkDelete}>
            Bulk Delete
          </button>
        </div>

        {isLoading ? (
          <div className="loadingContainerCustom">
            <p className="loadingMessageCustom">Loading posts...</p>
            <div className="spinnerCustom"></div>
          </div>
        ) : currentPosts.length === 0 && !isLoading ? (
          <div className="noPostsContainerCustom">
            <div className="noPostsContentCustom">
              <span className="noPostsEmojiCustom">📝</span>
              <p className="noPostsMessageCustom">No posts found.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="tableContainerCustom">
              <table className="customPostsTable">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Image Status</th>
                    <th>Video Status</th>
                    <th>Event Type 1</th>
                    <th>Event Type 2 (Optional)</th>
                    <th>Student Year</th>
                    
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPosts([...selectedPosts, post._id]);
                            } else {
                              setSelectedPosts(selectedPosts.filter((id) => id !== post._id));
                            }
                          }}
                        />
                      </td>
                      <td>{post.title}</td>
                      <td>{post.username}</td>
                      <td>{post.email}</td>
                      <td>{new Date(post.createdAt).toDateString()}</td>
                      <td>{post.photo ? "Image" : "No Image"}</td>
                      <td>{post.video ? "Video" : "No Video"}</td>
                      <td>{post.tags[0]}</td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        {post.tags?.[2] ? post.tags[2] : "-"}
                      </td>
                      <td>{post.tags[1]}</td>
                      
                      <td>
                        <Link to={`/post/${post._id}`} className="actionLinkCustom">
                          <FontAwesomeIcon icon={faPenToSquare} /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="paginationCustom">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {Math.ceil(posts.length / postsPerPage)}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage >= Math.ceil(posts.length / postsPerPage)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}