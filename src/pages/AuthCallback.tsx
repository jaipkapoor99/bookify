import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { supabase } from "@/lib/auth-client"; // Import the Supabase client
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { session } = useAuth(); // Get session from AuthContext

  useEffect(() => {
    // The onAuthStateChange listener will handle the session automatically.
    // We just need to wait for the session to be established.

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("AuthCallback event:", event);
        if (event === "SIGNED_IN" && session) {
          // Session is now handled by the AuthProvider, redirect home.
          navigate("/");
        } else if (event === "TOKEN_REFRESHED" && session) {
          // Also handle token refresh as a successful login
          navigate("/");
        } else if (event.endsWith("_ERROR")) {
          navigate("/login?error=oauth_failed");
        }
      },
    );

    // If the session is already available from the initial load, redirect immediately.
    if (session) {
      navigate("/");
    }

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        {/* Bookify Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="/Bookify_SVG.svg"
            alt="Bookify"
            className="h-12 w-12 object-contain"
          />
          <span className="text-3xl font-bold gradient-text">Bookify</span>
        </div>

        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <p className="text-lg font-medium text-gray-800">
              Completing sign in...
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Please wait while we authenticate your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
