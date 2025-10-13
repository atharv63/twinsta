// src/components/AuthLayout.js
import React from "react";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fafafa",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        border: "1px solid #dbdbdb"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ 
            margin: "0 0 10px 0", 
            fontSize: "32px", 
            color: "#262626",
            fontFamily: "'Brush Script MT', cursive"
          }}>
            Twinsta
          </h1>
          {subtitle && (
            <p style={{ 
              margin: 0, 
              color: "#8e8e8e", 
              fontSize: "16px",
              fontWeight: "500"
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;