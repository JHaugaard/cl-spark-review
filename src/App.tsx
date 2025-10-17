import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages (owner-only routes)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardSelections = lazy(() => import("./pages/DashboardSelections"));
const DashboardReviewers = lazy(() => import("./pages/DashboardReviewers"));
const DashboardAnalytics = lazy(() => import("./pages/DashboardAnalytics"));
const ReviewerDetail = lazy(() => import("./pages/ReviewerDetail"));

const queryClient = new QueryClient();

const App = () => {
  return (
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
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                      <Dashboard />
                    </Suspense>
                  </OwnerRoute>
                }
              />
              <Route
                path="/dashboard/selections"
                element={
                  <OwnerRoute>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                      <DashboardSelections />
                    </Suspense>
                  </OwnerRoute>
                }
              />
              <Route
                path="/dashboard/reviewers"
                element={
                  <OwnerRoute>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                      <DashboardReviewers />
                    </Suspense>
                  </OwnerRoute>
                }
              />
              <Route
                path="/dashboard/reviewers/:id"
                element={
                  <OwnerRoute>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                      <ReviewerDetail />
                    </Suspense>
                  </OwnerRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <OwnerRoute>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                      <DashboardAnalytics />
                    </Suspense>
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
};

export default App;
