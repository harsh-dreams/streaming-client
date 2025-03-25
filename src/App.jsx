import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Broadcast from "./components/Broadcast";
import Viewer from "./components/Viewer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/broadcast/:roomId" element={<Broadcast />} />
        <Route path="/viewer/:roomId" element={<Viewer />} />
      </Routes>
    </Router>
  );
};

export default App;
