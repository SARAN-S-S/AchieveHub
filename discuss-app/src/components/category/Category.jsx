import React, { useState } from "react";
import "./category.css";
import { Link, useNavigate } from "react-router-dom";

const Category = () => {
  const [activeType, setActiveType] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const navigate = useNavigate();

  const eventTypes = ["Project", "Patent", "Paper", "Journal", "Competition", "Product", "Placement"];
  const studentYears = ["First Year", "Second Year", "Third Year", "Final Year"];

  // Function to clear filters
  const clearFilters = () => {
    setActiveType(null);
    setActiveYear(null);
    navigate("/"); // Redirect to home without filters
  };

  return (
    <div className="category-container">
      <div className="category-section">
        <h3>Event Types</h3>
        <ul>
          {eventTypes.map((type, index) => (
            <li
              key={index}
              className={activeType === type ? "active" : ""}
              onClick={() => setActiveType(type)}
            >
              <Link to={`/?tag=${type}`}>{type}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="category-section">
        <h3>Student Years</h3>
        <ul>
          {studentYears.map((year, index) => (
            <li
              key={index}
              className={activeYear === year ? "active" : ""}
              onClick={() => setActiveYear(year)}
            >
              <Link to={`/?tag=${year}`}>{year}</Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Clear Button */}
      <button className="clear-btn" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
};

export default Category;
