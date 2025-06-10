import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { createRoutesFromElements, Route } from "react-router-dom";
import { initializeConsoleInterceptor } from "@/lib/console-interceptor";

// Initialize console interceptor in development
if (import.meta.env.DEV) {
  initializeConsoleInterceptor();
}

import { AuthProvider } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/contexts/AppStateProvider";
import RootLayout from "@/components/layout/RootLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import AccountPage from "@/pages/AccountPage";
import AdminEventPage from "@/pages/AdminEventPage";
import AuthCallback from "@/pages/AuthCallback";
import { Toaster } from "@/components/ui/sonner";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route
            path="/book/confirm/:eventVenueId"
            element={<BookingConfirmationPage />}
          />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/events" element={<AdminEventPage />} />
        </Route>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>
);
