import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BarChart from "../../components/BarChart/BarChart";
import "./statistics.css";

const StatisticsPage = () => {
  const [monthlyPosts, setMonthlyPosts] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);
  const [noPostsFound, setNoPostsFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setNoPostsFound(false); 
    try {
      const res = await axios.get(`${apiBaseUrl}/api/stats/monthly-posts?month=${month}&year=${year}`);
      setMonthlyPosts(res.data.posts);
      setTotalPosts(res.data.totalPosts);

      // Check for no data based on if the posts array is empty
      if (res.data.posts.length === 0) {
        setNoPostsFound(true);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setNoPostsFound(true);
      setMonthlyPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  }, [month, year , apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="statisStatisticsPage">
      <h1>Monthly Approved Post Statistics</h1> 
      <div className="statisFilters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={2024 + i}>
              {2024 + i}
            </option>
          ))}
        </select>
      </div>
      <div className="statisStatsContainer">
        <div className="statisTotalPosts">
          <h3>Total Approved Posts in {year || "All Years"}</h3> 
          <p>{totalPosts}</p>
        </div>
        {monthlyPosts.map((post) => (
          <div key={post._id} className="statisStatItem">
            <h3>{post.monthName || "No Data"}</h3>
            <p>Approved Posts: {post.count || 0}</p> 
            <p>Percentage: {post.percentage || "0.00"}%</p>
          </div>
        ))}
      </div>
      <div className="statisCharts">
        {loading ? (
          <div className="statisLoadingContainer">
            <p className="statisLoadingMessage">Loading...</p>
          </div>
        ) : noPostsFound ? (
          <div className="statisNoPostsContainer">
            <div className="statisNoPostsContent">
              <span className="statisNoPostsEmoji">📊</span>
              <p className="statisNoPostsMessage">No approved posts found for the selected month and year.</p> {/* Updated message */}
            </div>
          </div>
        ) : (
          <>
            {monthlyPosts.length > 0 && (
              <BarChart
              data={monthlyPosts.map((p) => p.percentage)}
              labels={monthlyPosts.map((p) => p.monthName)}
              title="Approved Posts by Month (%)" // Updated title
              backgroundColor={monthlyPosts.map((p, index) => {
                const colors = ['#81D4FA', '#A5D6A7', '#CE93D8', '#FFE082', '#80CBC4', '#FFCC80', '#80DEEA', '#B39DDB', '#CFD8DC', '#A1C4FD', '#81F7E5', '#E1BEE7'];
                return colors[index % colors.length];
              })}
              borderColor={monthlyPosts.map((p, index) => {
                const colors = ['#29B6F6', '#4CAF50', '#AB47BC', '#FFC107', '#009688', '#FF9800', '#00BCD4', '#5E35B1', '#607D8B', '#3F51B5', '#00ACC1', '#9C27B0'];
                return colors[index % colors.length];
              })}
            />
            
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;