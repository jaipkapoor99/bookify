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

          // Decode JWT to extract user info
          let userInfo = {
            id: "",
            email: undefined as string | undefined,
            full_name: undefined as string | undefined,
            avatar_url: undefined as string | undefined,
          };

          try {
            // Decode the access token (JWT) to get user info
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            console.log("JWT payload:", payload);

            userInfo = {
              id: payload.sub || payload.user_id || "",
              email: payload.email,
              full_name: payload.name || payload.full_name,
              avatar_url: payload.picture || payload.avatar_url,
            };
          } catch (err) {
            console.warn("Failed to decode JWT:", err);
            // Fallback to URL parameters (though less likely to work)
            userInfo = {
              id: hashParams.get("sub") || hashParams.get("user_id") || "",
              email: hashParams.get("email") || undefined,
              full_name:
                hashParams.get("full_name") ||
                hashParams.get("name") ||
                undefined,
              avatar_url:
                hashParams.get("avatar_url") ||
                hashParams.get("picture") ||
                undefined,
            };
          }

          // Store the session manually for OAuth flow
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresAt,
            token_type: hashParams.get("token_type") || "bearer",
            user: {
              id: userInfo.id,
              email: userInfo.email,
              user_metadata: {
                full_name: userInfo.full_name,
                avatar_url: userInfo.avatar_url,
                provider: "google",
              },
              app_metadata: {
                provider: "google",
                providers: ["google"],
              },
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
