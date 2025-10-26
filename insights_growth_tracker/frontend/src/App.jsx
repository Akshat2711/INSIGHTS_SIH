import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Me from "./pages/Me";
import LoginCard from "./pages/LoginCard";
import SignupCard from "./pages/SignupCard";
import LeaderBoard from "./pages/LeaderBoard";
import CompareTab from "./pages/CompareTab";
import SettingsPage from "./pages/SettingsPage";
import SuggestionTab from "./pages/SuggestionTab";
import { useAuth } from "./auth/AuthContext.jsx"; 
import PrivateRoute from "./auth/PrivateRoute.jsx";
import "./App.css";

import SearchInsights from "./pages/SearchInsights.jsx";
import SearchPageResults from "./pages/SearchPageResults.jsx";
import ChatBot from "./components/Chatbot.jsx";





function AppWrapper() {
  const location = useLocation();

  // Don't show ChatBot on /searchresults page
  const showChatBot = location.pathname !== "/searchresults";

  const storedData = localStorage.getItem("insight_user_info");
  const user_data = storedData ? JSON.parse(storedData) : null;

  const { user } = useAuth(); // check auth state here

  return (
    <>
      {(showChatBot && user_data) && <ChatBot user_data={user_data.user_data} theme_card_color="purple" />}
      {user && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SearchInsights />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignupCard />} />

        {/* Protected routes */}
        <Route path="/me" element={<PrivateRoute><Me /></PrivateRoute>} />
        <Route path="/compare" element={<PrivateRoute><CompareTab /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderBoard /></PrivateRoute>} />
        <Route path="/suggestions" element={<PrivateRoute><SuggestionTab /></PrivateRoute>} />
        <Route path="/search" element={<SearchInsights />} />
        <Route path="/searchresults" element={<PrivateRoute><SearchPageResults /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
