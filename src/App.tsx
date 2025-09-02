import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
import RootLayout from "@/components/layout/RootLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

// Import pages directly
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import AccountPage from "@/pages/AccountPage";
import AdminEventPage from "@/pages/AdminEventPage";
import AuthCallback from "@/pages/AuthCallback";

const createRouter = (initialEntries?: string[]) => {
  const routes = (
    <Route
      path="/"
      element={
        <AuthProvider>
          <RootLayout />
        </AuthProvider>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="/events/:eventId" element={<EventDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
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
  );

  if (initialEntries || import.meta.env.MODE === "test") {
    return createMemoryRouter(createRoutesFromElements(routes), {
      initialEntries: initialEntries || ["/"],
    });
  }

  return createBrowserRouter(createRoutesFromElements(routes));
};

interface AppProps {
  initialEntries?: string[];
}

const App = ({ initialEntries }: AppProps = {}) => {
  const router = createRouter(initialEntries);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
