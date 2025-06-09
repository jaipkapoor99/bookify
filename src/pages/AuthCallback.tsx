import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/SupabaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error during auth callback:", error);
          navigate("/login?error=oauth_failed");
        } else {
          // Successful authentication - redirect to home
          navigate("/");
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        navigate("/login?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
