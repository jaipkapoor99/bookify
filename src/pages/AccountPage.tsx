import { useState } from "react";
// import { authApi } from "@/lib/api-client"; // TODO: Enable when phone update functionality is implemented
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AccountPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent] = useState(false); // TODO: Remove setOtpSent when phone functionality is implemented

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // TODO: Implement user profile update in authApi
    setError("Profile updates are not yet implemented in this version");
    // const { error } = await authApi.updateUser({
    //   data: { full_name: fullName },
    // });

    // if (error) {
    //   setError(error);
    // } else {
    //   setSuccess("Name updated successfully!");
    // }
    setLoading(false);
  };

  const handleUpdatePhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // TODO: Implement phone number update in authApi
    setError("Phone number updates are not yet implemented in this version");
    // const { error } = await authApi.updateUser({
    //   phone: phoneNumber,
    // });

    // if (error) {
    //   setError(error);
    // } else {
    //   setOtpSent(true);
    //   setSuccess("An OTP has been sent to your new phone number.");
    // }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // TODO: Implement OTP verification in authApi
    setError("OTP verification is not yet implemented in this version");
    // const { error } = await authApi.verifyOtp({
    //   phone: phoneNumber,
    //   token: otp,
    //   type: "phone_change",
    // });

    // if (error) {
    //   setError(error);
    // } else {
    //   setSuccess("Phone number updated successfully!");
    //   setOtpSent(false);
    //   setPhoneNumber("");
    //   setOtp("");
    // }
    setLoading(false);
  };

  if (!user) {
    return <div>Please log in to view your account settings.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Email:</strong> {user.email}
          </p>

          <form onSubmit={handleUpdateName} className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={String(fullName)}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Name"}
              </Button>
            </div>
          </form>

          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Phone Number</h3>
            {!otpSent ? (
              <form onSubmit={handleUpdatePhoneNumber}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Add/Update Phone Number"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium">
                      Verification Code (OTP)
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mt-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
