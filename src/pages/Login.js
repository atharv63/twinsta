// src/pages/Login.js - IMPROVED VERSION
import React, { useState } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await loginUser(formData);
      localStorage.setItem("token", res.data.token);
      setMessage("Logged in successfully!");
      
      // Navigate to Home page after a short delay
      setTimeout(() => {
        navigate("/home");
      }, 1000);
      
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Login" 
      subtitle="Welcome back! Sign in to your account."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Email Input */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #dbdbdb",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Password Input */}
        <div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #dbdbdb",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fafafa",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#0095f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Signing in..." : "Log In"}
        </button>

        {/* Divider */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          margin: "20px 0",
          color: "#8e8e8e",
          fontSize: "13px"
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dbdbdb" }}></div>
          <span style={{ padding: "0 15px" }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dbdbdb" }}></div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
            color: message.includes("successfully") ? "#155724" : "#721c24",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}

        {/* Sign Up Link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ margin: 0, color: "#262626", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link 
              to="/register" 
              style={{ 
                color: "#0095f6", 
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;