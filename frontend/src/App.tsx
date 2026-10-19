import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./layouts/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import FeaturedTalent from "./pages/FeaturedTalent";
import Reviews from "./pages/Reviews";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Discovery from "./pages/Discovery";
import RoleDetail from "./pages/RoleDetail";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import Admin from "./pages/Admin";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/talent" element={<FeaturedTalent />} />
            <Route path="/artists" element={<Navigate to="/talent" replace />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<ArticleDetail />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Navigate to="/signup" replace />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;