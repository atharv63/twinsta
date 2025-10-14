import React, { useState, useEffect } from "react";
import { getPendingFollowRequests, approveFollowRequest, rejectFollowRequest } from "../api";

function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getPendingFollowRequests();
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await approveFollowRequest(requestId);
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectFollowRequest(requestId);
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Follow Requests</h2>
      {requests.length === 0 ? (
        <p>No pending follow requests</p>
      ) : (
        requests.map(request => (
          <div key={request.id} style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "15px",
            borderBottom: "1px solid #dbdbdb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img
                src={request.follower.profilePic || "/default-avatar.png"}
                alt={request.follower.name}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
              <div>
                <h4 style={{ margin: 0 }}>{request.follower.name}</h4>
                <p style={{ margin: 0, color: "#666" }}>{request.follower.bio}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleApprove(request.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#0095f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(request.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#262626",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default FollowRequests;