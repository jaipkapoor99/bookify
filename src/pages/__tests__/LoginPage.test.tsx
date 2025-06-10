/// <reference types="vitest/globals" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock hooks and dependencies
vi.mock("@/contexts/AuthContext");
vi.mock("sonner");

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async (importActual) => ({
  ...(await importActual<any>()),
  useNavigate: () => mockedUsedNavigate,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("LoginPage", () => {
  const mockLogin = vi.fn();
  const mockLoginWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
    });
  });

  it("renders the login form", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google" })).toBeInTheDocument();
  });

  it("allows user to type in email and password fields", () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(
      "m@example.com"
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "••••••••"
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("shows loading state and calls login on form submission", async () => {
    mockLogin.mockResolvedValue({ error: null });
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /signing in/i })
      ).toBeDisabled();
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("navigates to / on successful login", async () => {
    mockLogin.mockResolvedValue({ error: null });
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error toast on failed login", async () => {
    const errorMessage = "Invalid login credentials";
    mockLogin.mockResolvedValue({ error: errorMessage });
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred", {
        description: "Please try again later.",
      });
    });
  });

  it("handles Google login", async () => {
    mockLoginWithGoogle.mockResolvedValue({ error: null });
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "Google" }));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it("shows error toast on Google login failure", async () => {
    const errorMessage = "Google login failed";
    mockLoginWithGoogle.mockResolvedValue({ error: { message: errorMessage } });
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "Google" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Google login failed", {
        description: errorMessage,
      });
    });
  });

  it("validates email format", async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    // Should not call login with invalid email
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("validates password length", async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "123" }, // Too short
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    // Should not call login with short password
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("displays link to signup page", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("handles network errors gracefully", async () => {
    mockLogin.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("m@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred", {
        description: "Please try again later.",
      });
    });
  });
});
