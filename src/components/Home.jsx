import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
// import "./Home.css";  // Add basic CSS styles

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    socket.emit("create-room",roomId)
    navigate(`/broadcast/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim() !== "") {
      socket.emit("join-room",roomId);
      navigate(`/viewer/${roomId}`);
    } else {
      alert("Enter a valid room ID.");
    }
  };

  return (
    <div className="home-container">
      <h1>Live Streaming Platform 🎥</h1>
      <div className="room-actions">
        <button onClick={createRoom}>Create Room</button>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default Home;
