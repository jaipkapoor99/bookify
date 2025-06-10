import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RootLayout = () => {
  const { user, loading, logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast.error("Logout failed", {
          description:
            typeof error === "string"
              ? error
              : (error as { message?: string })?.message || "Unknown error",
        });
      } else {
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch {
      toast.error("An unexpected error occurred during logout");
    }
  };

  return (
    <div>
      <header className="p-4 bg-gray-100 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Bookify_SVG.svg"
              alt="Bookify"
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-gray-900">Bookify</span>
          </Link>
          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  My Bookings
                </Link>
                <Link
                  to="/account"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Account
                </Link>
                <Link
                  to="/admin/events"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Admin
                </Link>
                <span className="text-sm text-gray-700">
                  {String(
                    profile?.name ||
                      user.user_metadata?.full_name ||
                      user.email ||
                      "User"
                  )}
                </span>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-50 border-t mt-16">
        <div className="container mx-auto p-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                © 2024 Bookify. All rights reserved.
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Discover amazing events, book with confidence
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
