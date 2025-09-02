/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "@/pages/LoginPage";
import { AuthProvider } from "@/contexts/AuthContext.tsx";


// Mock the auth functions
const mockLoginWithGoogle = vi.fn();

vi.mock("@/contexts/AuthContext", async () => {
  const actual = await vi.importActual("@/contexts/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      session: null,
      loading: false,
      profile: null,
      loginWithGoogle: mockLoginWithGoogle,
      logout: vi.fn(),
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

  it("renders the login page with Google login button", () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
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
});
