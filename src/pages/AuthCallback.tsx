import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api-client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // For OAuth callbacks, extract tokens from URL fragments
        const urlParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Store the session manually for OAuth flow
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(urlParams.get("expires_in") || "3600", 10),
            token_type: urlParams.get("token_type") || "bearer",
            user: {
              id: urlParams.get("sub") || "",
              email: urlParams.get("email"),
            },
          };

          localStorage.setItem(
            "booking-platform-session",
            JSON.stringify(session)
          );
          navigate("/");
        } else {
          // Try to get existing session
          const { error } = await authApi.getSession();
          if (error) {
            navigate("/login?error=oauth_failed");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.warn("Auth callback error:", err);
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
