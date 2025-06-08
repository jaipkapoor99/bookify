import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/SupabaseClient";
import { Button } from "@/components/ui/button";

const RootLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
                  <span>{user.email}</span>
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
