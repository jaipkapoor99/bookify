import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api-client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's an error in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get("error");

        if (errorParam) {
          console.error("OAuth error:", errorParam);
          navigate("/login?error=oauth_failed");
          return;
        }

        // For OAuth callbacks, extract tokens from URL fragments
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const expiresIn = hashParams.get("expires_in");

        console.log("OAuth callback - Hash params:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          expiresIn,
          fullHash: window.location.hash,
        });

        if (accessToken && refreshToken) {
          // Calculate expiry time (current time + expires_in seconds)
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = now + parseInt(expiresIn || "3600", 10);

          // Store the session manually for OAuth flow
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresAt,
            token_type: hashParams.get("token_type") || "bearer",
            user: {
              id: hashParams.get("sub") || hashParams.get("user_id") || "",
              email: hashParams.get("email") || undefined,
            },
          };

          console.log("Storing OAuth session:", {
            hasToken: !!session.access_token,
            userId: session.user.id,
            email: session.user.email,
          });

          localStorage.setItem(
            "booking-platform-session",
            JSON.stringify(session)
          );

          // Update the API client with the new token
          const { setAuthToken } = await import("@/lib/api-client");
          setAuthToken(accessToken);

          navigate("/");
        } else {
          console.warn("No tokens found in OAuth callback");
          // Try to get existing session
          const { error } = await authApi.getSession();
          if (error) {
            console.error("Session check failed:", error);
            navigate("/login?error=oauth_failed");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
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
