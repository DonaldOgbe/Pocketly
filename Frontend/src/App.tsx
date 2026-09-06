import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BookmarksPage from "./pages/BookmarksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import type { BookmarkFilter } from "./types/bookmark";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<BookmarkFilter>({ type: "all" });

  return (
    <div className="flex">
      <Sidebar activeFilter={activeFilter} onSelectFilter={setActiveFilter} />
      <div className="flex-1">
        <BookmarksPage filter={activeFilter} />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;