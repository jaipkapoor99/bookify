import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Chrome } from "lucide-react";

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        toast.error("Google login failed", {
          description: error,
        });
      }
      // On success, Supabase handles the redirect, so no navigation is needed here.
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred with Google login.";
      toast.error("Google login failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="flex flex-col justify-center px-12 py-16 relative z-10">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/Bookify_SVG.svg"
                alt="Bookify"
                className="h-10 w-10 object-contain"
              />
              <span className="text-3xl font-bold gradient-text">Bookify</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Welcome back to your next great experience
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Sign in to access your bookings, discover new events, and continue
              your journey with us.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Secure and trusted platform</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Instant booking confirmations</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src="/Bookify_SVG.svg"
                alt="Bookify"
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold gradient-text">Bookify</span>
            </div>
          </div>

          <Card className="border-0 lg:border lg:shadow-lg">
            <CardHeader className="space-y-2 text-center lg:text-left">
              <CardTitle className="text-3xl font-bold">Sign in</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 text-base button-press"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-sm text-muted-foreground">
                Sign in with your Google account to continue.
              </p>
            </CardFooter>
          </Card>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground max-w-sm mx-auto leading-relaxed">
            By signing in, you agree to our{" "}
            <Button variant="link" className="p-0 h-auto text-xs">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="p-0 h-auto text-xs">
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
