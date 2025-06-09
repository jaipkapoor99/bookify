import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { toast } from "sonner";

const RootLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast.error("Logout failed", {
          description: error.message,
        });
      } else {
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during logout");
      console.error("Logout error:", err);
    }
  };

  return (
    <div>
      <header className="p-4 bg-gray-100 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <Image
              src="/Bookify Icon.png"
              alt="Bookify"
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-gray-900">Bookify</span>
          </Link>
          <div className="flex items-center gap-4">
            {!loading &&
              (user ? (
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
                  <span>{user.user_metadata.full_name || user.email}</span>
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
              ))}
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
              <Image
                src="/Bookify Icon.png"
                alt="Bookify"
                className="h-6 w-6 object-contain opacity-60"
              />
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
