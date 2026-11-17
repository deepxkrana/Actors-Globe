import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PublicLayout } from "./layouts/Layout";
import { AuthLayout } from "./layouts/AuthLayout";
import { WorkspaceLayout } from "./layouts/WorkspaceLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import FeaturedTalent from "./pages/FeaturedTalent";
import ActorProfilePage from "./pages/ActorProfilePage";
import CasterProfilePage from "./pages/CasterProfilePage";
import Reviews from "./pages/Reviews";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Discovery from "./pages/Discovery";
import RoleDetail from "./pages/RoleDetail";
import Dashboard from "./pages/Dashboard";
import Subscriptions from "./pages/Subscriptions";
import Contact from "./pages/Contact";
import HelpFaq from "./pages/HelpFaq";
import LegalPage from "./pages/LegalPage";
import Admin from "./pages/Admin";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyPhone from "./pages/auth/VerifyPhone";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/talent" element={<FeaturedTalent />} />
            <Route path="/talent/:id" element={<ActorProfilePage />} />
            <Route path="/artists" element={<Navigate to="/talent" replace />} />
            <Route path="/casters/:id" element={<CasterProfilePage />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<ArticleDetail />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/roles/:id" element={<RoleDetail />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/pricing" element={<Navigate to="/subscriptions" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpFaq />} />
            <Route path="/faq" element={<Navigate to="/help" replace />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/guidelines" element={<LegalPage type="guidelines" />} />
          </Route>

          {/* Authentication Gateway Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Navigate to="/signup" replace />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-phone" element={<VerifyPhone />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Authenticated Workspace Routes (Actor & Caster) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["ACTOR", "CASTER"]}>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Admin Command Center Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<Admin />} />
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/reports" element={<Admin />} />
            <Route path="/admin/users" element={<Admin />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;