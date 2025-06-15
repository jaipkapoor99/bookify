/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/contexts/AuthContext";

// Mock the auth functions
const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock("@/contexts/AuthContext", async () => {
  const actual = await vi.importActual("@/contexts/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      user: null,
      loading: false,
    }),
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        {component}
        <Toaster />
      </MemoryRouter>
    </AuthProvider>,
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    renderWithProviders(<LoginPage />);

    // There are multiple "Sign in" texts (title and button), so use getAllByText
    const signInElements = screen.getAllByText("Sign in");
    expect(signInElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("displays the correct initial placeholder text", () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(
      "Enter your email",
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;

    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  it("calls login when form is submitted with valid data", async () => {
    mockLogin.mockResolvedValue({ error: null });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("displays error message when login fails", async () => {
    mockLogin.mockResolvedValue({ error: "Invalid credentials" });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword",
      );
    });
  });

  it("calls loginWithGoogle when Google button is clicked", async () => {
    mockLoginWithGoogle.mockResolvedValue({ error: null });

    renderWithProviders(<LoginPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it("displays error message when Google login fails", async () => {
    mockLoginWithGoogle.mockResolvedValue({ error: "Google login failed" });

    renderWithProviders(<LoginPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it("updates input values when user types", () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(
      "Enter your email",
    ) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    expect(emailInput.value).toBe("user@example.com");
    expect(passwordInput.value).toBe("password");
  });

  it("shows loading state when submitting", async () => {
    // Mock a delayed response
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 100),
        ),
    );

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Check for loading state immediately after click
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it("toggles password visibility", () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText(
      "Enter your password",
    ) as HTMLInputElement;
    // Find the eye/eyeoff toggle button by its position next to the password field
    const toggleButton = passwordInput.parentElement?.querySelector(
      'button[type="button"]',
    );
    expect(toggleButton).toBeInTheDocument();

    expect(passwordInput.type).toBe("password");

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe("text");

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe("password");
    }
  });

  it("contains signup link", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign up here" }),
    ).toBeInTheDocument();
  });

  it("handles network errors gracefully", async () => {
    mockLogin.mockRejectedValue(new Error("Network error"));

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
