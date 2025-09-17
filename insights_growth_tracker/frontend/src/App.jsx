import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Me from "./pages/Me";
import LoginCard from "./pages/LoginCard";
import SignupCard from "./pages/SignupCard";
import LeaderBoard from "./pages/LeaderBoard";
import CompareTab from "./pages/CompareTab";
import SettingsPage from "./pages/SettingsPage";
import SuggestionTab from "./pages/SuggestionTab";
import CompleteProfile from "./pages/Complete_profile.jsx"
import { useAuth } from "./auth/AuthContext.jsx"; 
import PrivateRoute from "./auth/PrivateRoute.jsx";
import "./App.css";

import SearchInsights from "./pages/SearchInsights.jsx";
import SearchPageResults from "./pages/SearchPageResults.jsx";



function App() {
  const { user } = useAuth(); // check auth state here
  const linkedinId = localStorage.getItem("linkedin_id") || "punit173";

  return (
    <Router>
      {/*  Navbar only when logged in */}
      {user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SearchInsights />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/signup" element={<SignupCard />} />

        {/* Protected routes */}
        <Route
          path="/me"
          element={
            <PrivateRoute>
              <Me />
            </PrivateRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <PrivateRoute>
              <CompareTab />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <LeaderBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <PrivateRoute>
              <SuggestionTab />
            </PrivateRoute>
          }
        />


       

        <Route
          path="/search"
          element={<SearchInsights/>}
        />

         <Route
          path="/searchresults"
          element={
            <PrivateRoute>
              <SearchPageResults/>
            </PrivateRoute>
          }
        />




        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/complete-profile"
          element={
            <PrivateRoute>
              <CompleteProfile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
