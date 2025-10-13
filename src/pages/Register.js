// src/pages/Register.js - IMPROVED VERSION
import React, { useState } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic validation
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      setMessage("Account created successfully! Redirecting to login...");

      // Navigate to Login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign Up" 
      subtitle="Join Twinsta today and start sharing your moments."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Name Input */}
        <div>
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
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
            placeholder="Password (min. 6 characters)"
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

        {/* Password Hint */}
        <p style={{ 
          margin: "-10px 0 10px 0", 
          fontSize: "12px", 
          color: "#8e8e8e",
          textAlign: "center"
        }}>
          Password must be at least 6 characters long
        </p>

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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {/* Terms Notice */}
        <p style={{ 
          margin: "10px 0 0 0", 
          fontSize: "12px", 
          color: "#8e8e8e",
          textAlign: "center",
          lineHeight: "1.4"
        }}>
          By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
        </p>

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

        {/* Login Link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ margin: 0, color: "#262626", fontSize: "14px" }}>
            Have an account?{" "}
            <Link 
              to="/login" 
              style={{ 
                color: "#0095f6", 
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Register;