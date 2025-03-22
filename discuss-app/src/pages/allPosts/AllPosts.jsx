import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../../components/BarChart/BarChart";
import "./allPosts.css";


const eventTypes = ["Project", "Paper", "Competition", "Patent", "Journal", "Product", "Placement"];
const studentYears = ["First Year", "Second Year", "Third Year", "Final Year"];

const PostsPage = () => {
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsByEventType, setPostsByEventType] = useState({});
  const [postsByYear, setPostsByYear] = useState({});


  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${apiBaseUrl}/api/stats/posts`);
      setTotalPosts(res.data.totalPosts);

      // Initialize counts as 0 for all event types
      const eventTypeCounts = eventTypes.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {});

      // Fill in actual counts from the API response
      res.data.postsByEventType.forEach((p) => {
        eventTypeCounts[p._id] = p.count;
      });

      // Initialize counts as 0 for all student years
      const studentYearCounts = studentYears.reduce((acc, year) => {
        acc[year] = 0;
        return acc;
      }, {});

      // Fill in actual counts from the API response
      res.data.postsByYear.forEach((p) => {
        studentYearCounts[p._id] = p.count;
      });

      setPostsByEventType(eventTypeCounts);
      setPostsByYear(studentYearCounts);
    };

    fetchData();
  }, [apiBaseUrl]);

  // Calculate percentages
  const calculatePercentage = (count) =>
    totalPosts ? ((count / totalPosts) * 100).toFixed(2) : 0;

  return (
    <div className="allpostsPostsPage">
      <h1>Post Statistics</h1>

      {/* Total Posts Container */}
      <div className="allpostsTotalPostsContainer">
        <p>Total Approved Posts: {totalPosts}</p>
      </div>

      {/* Event Type Counts */}
      <span><h2>Event Type Counts</h2></span>
      <div className="allpostsGrid">
        {eventTypes.map((type) => (
          <div key={type} className="allpostsCountContainer">
            <p>{type} Count: {postsByEventType[type]}</p>
            <p>Percentage: {calculatePercentage(postsByEventType[type])}%</p>
          </div>
        ))}
      </div>

      {/* Student Year Counts */}
      <span><h2>Student Year Counts</h2></span>
      <div className="allpostsGrid">
        {studentYears.map((year) => (
          <div key={year} className="allpostsCountContainer">
            <p>{year} Count: {postsByYear[year]}</p>
            <p>Percentage: {calculatePercentage(postsByYear[year])}%</p>
          </div>
        ))}
      </div>

      {/* Bar Charts */}
      <div className="allpostsBarChartContainer">
        <span><h2>Event Type Percentage in Charts</h2></span>
        <BarChart
          data={eventTypes.map((type) => calculatePercentage(postsByEventType[type]))}
          labels={eventTypes}
          title="Posts by Event Type"
          backgroundColor={[
            "#A5D6A7", 
            "#90CAF9", 
            "#CE93D8", 
            "#FFE082", 
            "#E0E0E0",
            "#FFAB91", 
            "#B39DDB", 
          ]}
          borderColor={[
            "#4CAF50", 
            "#2196F3",
            "#AB47BC", 
            "#FFC107", 
            "#616161", 
            "#FF7043", 
            "#7E57C2", 
          ]}
        />

        <span><h2>Student Year Percentage in Charts</h2></span>
        <BarChart
          data={studentYears.map((year) => calculatePercentage(postsByYear[year]))}
          labels={studentYears}
          title="Posts by Student Year"
          backgroundColor={["#64B5F6", "#D1C4E9", "#FFD54F", "#D7CCC8"]} // Unique colors
          borderColor={["#0D47A1", "#673AB7", "#F57F17", "#5D4037"]} // Darker borders
        />
      </div>
    </div>
  );
};

export default PostsPage;