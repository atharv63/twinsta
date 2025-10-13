// src/components/ImageCropper.js - COMPLETELY REPLACE with this version
import React, { useState, useRef, useEffect, useCallback } from "react";

function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8); // Start slightly zoomed out
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setZoom(0.8); // Reset to slightly zoomed out
  }, [imageSrc]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate bounds - allow more movement when zoomed in
      const img = imageRef.current;
      if (img) {
        const containerSize = 300;
        const imageDisplayWidth =
          img.naturalWidth *
          (containerSize / Math.min(img.naturalWidth, img.naturalHeight)) *
          zoom;
        const imageDisplayHeight =
          img.naturalHeight *
          (containerSize / Math.min(img.naturalWidth, img.naturalHeight)) *
          zoom;

        const maxX = Math.max(0, (imageDisplayWidth - containerSize) / 2);
        const maxY = Math.max(0, (imageDisplayHeight - containerSize) / 2);

        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const cropSize = 300; // The visible crop area (circle)
    const outputSize = 150; // Final cropped image size

    canvas.width = outputSize;
    canvas.height = outputSize;

    // Get actual rendered image size (from CSS + transform)
    const imgRect = img.getBoundingClientRect();
    const renderedWidth = imgRect.width;
    const renderedHeight = imgRect.height;

    // Get natural image size
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Ratio: how many source pixels per rendered pixel
    const ratioX = naturalWidth / renderedWidth;
    const ratioY = naturalHeight / renderedHeight;

    // Center of crop area in the image, adjusted by user drag
    const centerX = renderedWidth / 2 - position.x;
    const centerY = renderedHeight / 2 - position.y;

    // Calculate visible crop area in rendered coordinates
    const cropLeft = centerX - cropSize / 2;
    const cropTop = centerY - cropSize / 2;

    // Map crop area to source image (natural) coordinates
    const sourceX = cropLeft * ratioX;
    const sourceY = cropTop * ratioY;
    const sourceWidth = cropSize * ratioX;
    const sourceHeight = cropSize * ratioY;

    // Fill canvas background white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Draw the cropped portion to canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputSize,
      outputSize
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.8);
    onCrop(croppedImageUrl);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", textAlign: "center" }}>
          Adjust Your Photo
        </h3>

        {/* Crop Container */}
        <div
          style={{
            width: "300px",
            height: "300px",
            border: "2px solid #0095f6",
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 20px",
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab",
            backgroundColor: "#f0f0f0",
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // CHANGED BACK TO "contain" to show full image
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.1s ease",
            }}
          />

          {/* Overlay to show crop area */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: "150px solid rgba(0,0,0,0.4)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Zoom: {zoom.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5" // Can zoom out to see more
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Instructions */}
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#666",
            margin: "0 0 20px 0",
            lineHeight: "1.4",
          }}
        >
          <div>
            • <strong>Start zoomed out</strong> - you can see the full image
          </div>
          <div>
            • <strong>Drag</strong> to position any part in the circle
          </div>
          <div>
            • <strong>Zoom in</strong> to focus on specific areas
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              border: "1px solid #dbdbdb",
              borderRadius: "8px",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#0095f6",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
