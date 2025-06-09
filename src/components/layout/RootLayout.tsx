import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
          <Link to="/" className="text-2xl font-bold">
            Booking Platform
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
    </div>
  );
};

export default RootLayout;
