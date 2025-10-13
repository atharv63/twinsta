// src/App.js - COMPLETE FIXED VERSION
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Home from "./pages/Home";
import Profile from "./pages/Profile"; // ADD THIS IMPORT
import Navbar from "./components/Navbar";
import CreatePostModal from "./components/CreatePostModal";

function App() {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <WithNavbar 
            showCreatePost={showCreatePost} 
            setShowCreatePost={setShowCreatePost} 
          />
        } />
      </Routes>
    </Router>
  );
}

function WithNavbar({ showCreatePost, setShowCreatePost }) {
  const handlePostCreated = () => {
    window.location.reload();
  };

  return (
    <>
      <Navbar onOpenCreatePost={() => setShowCreatePost(true)} />
      <div style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          {/* FIXED PROFILE ROUTES */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </div>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}

export default App;