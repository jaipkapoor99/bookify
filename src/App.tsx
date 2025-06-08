import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RootLayout from "@/components/layout/RootLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EventDetailPage from "@/pages/EventDetailPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/events/:eventId",
        element: <EventDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/my-bookings",
            element: <MyBookingsPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
