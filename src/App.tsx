import { Suspense } from "react";
import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { createRoutesFromElements, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/contexts/AppStateProvider";
import RootLayout from "@/components/layout/RootLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

// Import lazy components and loading states
import {
  LazyHomePage,
  LazyLoginPage,
  LazySignupPage,
  LazyEventDetailPage,
  LazyMyBookingsPage,
  LazyBookingConfirmationPage,
  LazyAccountPage,
  LazyAdminEventPage,
  LazyAuthCallback,
  PageLoader,
} from "@/components/LazyComponents";

const createRouter = (initialEntries?: string[]) => {
  // Use MemoryRouter for tests or when initialEntries provided
  if (initialEntries || import.meta.env.MODE === "test") {
    // For testing, use MemoryRouter
    return createMemoryRouter(
      createRoutesFromElements(
        <>
          <Route path="/" element={<RootLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader chunkName="HomePage" />}>
                  <LazyHomePage />
                </Suspense>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <Suspense fallback={<PageLoader chunkName="EventDetailPage" />}>
                  <LazyEventDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader chunkName="LoginPage" />}>
                  <LazyLoginPage />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<PageLoader chunkName="SignupPage" />}>
                  <LazySignupPage />
                </Suspense>
              }
            />
            <Route
              path="/auth/callback"
              element={
                <Suspense fallback={<PageLoader chunkName="AuthCallback" />}>
                  <LazyAuthCallback />
                </Suspense>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/my-bookings"
                element={
                  <Suspense
                    fallback={<PageLoader chunkName="MyBookingsPage" />}
                  >
                    <LazyMyBookingsPage />
                  </Suspense>
                }
              />
              <Route
                path="/book/confirm/:eventVenueId"
                element={
                  <Suspense
                    fallback={
                      <PageLoader chunkName="BookingConfirmationPage" />
                    }
                  >
                    <LazyBookingConfirmationPage />
                  </Suspense>
                }
              />
              <Route
                path="/account"
                element={
                  <Suspense fallback={<PageLoader chunkName="AccountPage" />}>
                    <LazyAccountPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <Suspense
                    fallback={<PageLoader chunkName="AdminEventPage" />}
                  >
                    <LazyAdminEventPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </>,
      ),
      { initialEntries: initialEntries || ["/"] },
    );
  }

  // For production, use BrowserRouter
  return createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <LazyHomePage />
              </Suspense>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <Suspense fallback={<PageLoader />}>
                <LazyEventDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <LazyLoginPage />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<PageLoader />}>
                <LazySignupPage />
              </Suspense>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <Suspense fallback={<PageLoader />}>
                <LazyAuthCallback />
              </Suspense>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/my-bookings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LazyMyBookingsPage />
                </Suspense>
              }
            />
            <Route
              path="/book/confirm/:eventVenueId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LazyBookingConfirmationPage />
                </Suspense>
              }
            />
            <Route
              path="/account"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LazyAccountPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/events"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LazyAdminEventPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </>,
    ),
  );
};

interface AppProps {
  initialEntries?: string[];
}

const App = ({ initialEntries }: AppProps = {}) => {
  const router = createRouter(initialEntries);

  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppStateProvider>
    </AuthProvider>
  );
};

export default App;
