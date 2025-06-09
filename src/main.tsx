import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { createRoutesFromElements, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/contexts/AppStateContext";
import RootLayout from "@/components/layout/RootLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import AccountPage from "@/pages/AccountPage";
import { Toaster } from "@/components/ui/sonner";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route
            path="/book/confirm/:eventVenueId"
            element={<BookingConfirmationPage />}
          />
          <Route path="/account" element={<AccountPage />} />
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
