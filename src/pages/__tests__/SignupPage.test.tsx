/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "@/pages/SignupPage";
import {
  createSupabaseSignupClient,
  createDatabaseClient,
} from "@/SupabaseClient";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import React from "react";

// Mock the navigation and Supabase clients
vi.mock("react-router-dom", async (importActual) => ({
  ...(await importActual<typeof import("react-router-dom")>()),
  useNavigate: () => vi.fn(),
}));

vi.mock("@/SupabaseClient", () => ({
  createSupabaseSignupClient: vi.fn(),
  createDatabaseClient: vi.fn(),
}));
vi.mock("sonner");

// Test mocks and utilities

const renderWithToaster = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
      <Toaster />
    </MemoryRouter>
  );
};

const mockedToast = vi.mocked(toast);
const mockedCreateSupabaseSignupClient = vi.mocked(createSupabaseSignupClient);
const mockedCreateDatabaseClient = vi.mocked(createDatabaseClient);

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks
    mockedCreateSupabaseSignupClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Default error" },
        }),
      },
    } as unknown as ReturnType<typeof createSupabaseSignupClient>);

    mockedCreateDatabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as unknown as ReturnType<typeof createDatabaseClient>);
  });

  it("renders the signup form", () => {
    renderWithToaster(<SignupPage />);

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your full name")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Create a strong password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm your password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("shows a success message after successful signup", async () => {
    // Override the default mock for this test
    mockedCreateSupabaseSignupClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: "123" } },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof createSupabaseSignupClient>);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText(
      "Create a strong password"
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Confirm your password"
    );
    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith("Signup successful!", {
        description: "Please check your email for the confirmation link.",
      });
    });
  });

  it("shows an error message if signup fails", async () => {
    mockedCreateSupabaseSignupClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Network error" },
        }),
      },
    } as unknown as ReturnType<typeof createSupabaseSignupClient>);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText(
      "Create a strong password"
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Confirm your password"
    );
    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "fail@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Signup failed", {
        description: "Network error",
      });
    });
  });

  it("shows an error if the email is already taken", async () => {
    mockedCreateSupabaseSignupClient.mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "User already registered" },
        }),
      },
    } as unknown as ReturnType<typeof createSupabaseSignupClient>);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText(
      "Create a strong password"
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Confirm your password"
    );
    const fullNameInput = screen.getByPlaceholderText("Enter your full name");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "taken@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "Password123" },
    });
    fireEvent.click(termsCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "This email is already registered. Please login instead."
        )
      ).toBeInTheDocument();
    });
  });
});
