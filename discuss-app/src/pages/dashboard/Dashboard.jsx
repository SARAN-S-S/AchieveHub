import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import axios from "axios";
import {
  Users,
  FileText,
  Clock,
  Settings2,
  BarChart3,
  Filter,
} from "lucide-react";
import "./dashboard.css";

export default function Dashboard() {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:7733";

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }

    // Fetch user statistics
    const fetchUserStats = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/stats/users`);
        setTotalUsers((res.data.students || 0) + (res.data.admins || 0));
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      }
    };

    // Fetch post statistics
    const fetchPostStats = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/stats/posts`);
        setTotalPosts(res.data.totalPosts || 0);
        
        // Fetch pending posts count using the same endpoint as approval pending page
        const pendingRes = await axios.get(`${apiBaseUrl}/api/posts/pending?page=1&limit=1`);
        setPendingPosts(pendingRes.data.total || 0);
      } catch (err) {
        console.error("Failed to fetch post stats:", err);
      }
    };

    fetchUserStats();
    fetchPostStats();
  }, [user, navigate, apiBaseUrl]); 


  const menuItems = [
    { 
      title: "Total Users", 
      icon: <Users size={40} />, 
      route: "/users",
      count: totalUsers 
    },
    { 
      title: "Total Posts", 
      icon: <FileText size={40} />, 
      route: "/allposts",
      count: totalPosts 
    },
    { 
      title: "Manage Posts", 
      icon: <Settings2 size={40} />, 
      route: "/manageposts",
      count: totalPosts 
    },
    { 
      title: "Approval Pending", 
      icon: <Clock size={40} />, 
      route: "/approval-pending",
      count: pendingPosts 
    },
    { 
      title: "Statistics", 
      icon: <BarChart3 size={40} />, 
      route: "/statistics" 
    },
    { 
      title: "Filter Posts", 
      icon: <Filter size={40} />, 
      route: "/filter-posts" 
    },
  ];

  return (
    <div className="dashboard">
      <div className="background-animation"></div>
      <h1>Admin Dashboard</h1>
      <div className="dashboardGrid">
        {menuItems.map((item, index) => (
          <div key={index} className="card" onClick={() => navigate(item.route)}>
            <div className="icon">{item.icon}</div>
            <h2>{item.title}</h2>
            {item.count !== undefined && (
              <div className="count-badge">{item.count}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}