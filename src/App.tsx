import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Announcement from "./pages/Announcement";
import API from "./pages/API";
import Assets from "./pages/Assets";
import Earn from "./pages/Earn";
import Trading from "./pages/Trading";
import RiverPool from "./pages/RiverPool";
import Referral from "./pages/Referral";
import Docs from "./pages/Docs";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Arena from "./pages/Arena";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Arena />} />
          <Route path="/ai-arena" element={<Arena />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/api" element={<API />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/riverpool" element={<RiverPool />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
