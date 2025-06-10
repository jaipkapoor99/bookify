/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
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
    } as any);

    mockedCreateDatabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any);
  });

  it("renders the signup form", () => {
    renderWithToaster(<SignupPage />);

    expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    // Use getAllBy since there are two password fields
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs).toHaveLength(2);
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
    } as any);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const fullNameInput = screen.getByPlaceholderText("John Doe");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInputs[0], { target: { value: "Password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "Password123" } });
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
    } as any);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const fullNameInput = screen.getByPlaceholderText("John Doe");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "fail@example.com" } });
    fireEvent.change(passwordInputs[0], { target: { value: "Password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "Password123" } });
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
    } as any);

    renderWithToaster(<SignupPage />);

    const emailInput = screen.getByPlaceholderText("m@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const fullNameInput = screen.getByPlaceholderText("John Doe");
    const termsCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(fullNameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "taken@example.com" } });
    fireEvent.change(passwordInputs[0], { target: { value: "Password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "Password123" } });
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
