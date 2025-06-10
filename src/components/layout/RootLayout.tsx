import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  User,
  LogOut,
  Settings,
  Calendar,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const RootLayout = () => {
  const { user, loading, logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActivePath(to)
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </Link>
  );

  const userName = String(
    profile?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User"
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="relative">
                <img
                  src="/Bookify_SVG.svg"
                  alt="Bookify"
                  className="h-9 w-9 object-contain"
                />
              </div>
              <span className="text-2xl font-bold gradient-text">Bookify</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {user && (
                <>
                  <NavLink to="/my-bookings">
                    <Calendar className="w-4 h-4 mr-2 inline" />
                    My Bookings
                  </NavLink>
                  <NavLink to="/admin/events">
                    <ShieldCheck className="w-4 h-4 mr-2 inline" />
                    Admin
                  </NavLink>
                </>
              )}
            </nav>

            {/* User Menu / Auth Buttons */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
              ) : user ? (
                <>
                  {/* Desktop User Menu */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 pl-2 cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="max-w-[120px] truncate">
                            {userName}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {userName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/account" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Account Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="text-red-600"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="button-press">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <NavLink
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                My Bookings
              </NavLink>

              <NavLink to="/account" onClick={() => setMobileMenuOpen(false)}>
                <Settings className="w-4 h-4 mr-2 inline" />
                Account Settings
              </NavLink>

              <NavLink
                to="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck className="w-4 h-4 mr-2 inline" />
                Admin
              </NavLink>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/Bookify_SVG.svg"
                  alt="Bookify"
                  className="h-6 w-6 object-contain"
                />
                <span className="text-lg font-bold">Bookify</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Discover amazing events and book with confidence. Your gateway
                to unforgettable experiences.
              </p>
              <Badge variant="secondary" className="text-xs">
                Professional Event Booking Platform
              </Badge>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Events
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/my-bookings"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/account"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Help Center</p>
                <p>Contact Us</p>
                <p>Terms of Service</p>
                <p>Privacy Policy</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Bookify. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ for amazing events
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
