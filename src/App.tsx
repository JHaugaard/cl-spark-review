import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OwnerRoute } from "@/components/OwnerRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Galleries from "./pages/Galleries";
import GalleryDetail from "./pages/GalleryDetail";
import ReviewerSignup from "./pages/ReviewerSignup";
import MySelections from "./pages/MySelections";
import Dashboard from "./pages/Dashboard";
import DashboardSelections from "./pages/DashboardSelections";
import DashboardReviewers from "./pages/DashboardReviewers";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import ReviewerDetail from "./pages/ReviewerDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/invite/:token" element={<ReviewerSignup />} />
            <Route
              path="/dashboard"
              element={
                <OwnerRoute>
                  <Dashboard />
                </OwnerRoute>
              }
            />
            <Route
              path="/dashboard/selections"
              element={
                <OwnerRoute>
                  <DashboardSelections />
                </OwnerRoute>
              }
            />
            <Route
              path="/dashboard/reviewers"
              element={
                <OwnerRoute>
                  <DashboardReviewers />
                </OwnerRoute>
              }
            />
            <Route
              path="/dashboard/reviewers/:id"
              element={
                <OwnerRoute>
                  <ReviewerDetail />
                </OwnerRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <OwnerRoute>
                  <DashboardAnalytics />
                </OwnerRoute>
              }
            />
            <Route
              path="/galleries"
              element={
                <ProtectedRoute>
                  <Galleries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/galleries/:galleryId"
              element={
                <ProtectedRoute>
                  <GalleryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/selections"
              element={
                <ProtectedRoute>
                  <MySelections />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
