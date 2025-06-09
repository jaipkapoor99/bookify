/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "@/pages/SignupPage";
import { supabase, createSupabaseSignupClient } from "@/SupabaseClient";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

// Mock the navigation and Supabase client
vi.mock("react-router-dom", async (importActual) => ({
  ...(await importActual<typeof import("react-router-dom")>()),
  useNavigate: () => vi.fn(),
}));

vi.mock("@/SupabaseClient", async (importActual) => {
  const actual = await importActual<typeof import("@/SupabaseClient")>();
  return {
    ...actual,
    supabase: {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    },
    createSupabaseSignupClient: vi.fn(),
  };
});

// The Supabase client is mocked globally in `src/setupTests.ts`

const renderWithToaster = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
      <Toaster />
    </MemoryRouter>
  );
};

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    (createSupabaseSignupClient as Mock).mockReturnValue({
      auth: {
        signUp: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
      },
    });

    // Also mock the standard client's insert for profile creation
    (supabase.from as Mock).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

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
      expect(screen.getByText(/signup successful/i)).toBeInTheDocument();
      expect(screen.getByText(/please check your email/i)).toBeInTheDocument();
    });
  });

  it("shows an error message if signup fails", async () => {
    (createSupabaseSignupClient as Mock).mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Network error" },
        }),
      },
    });

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
      expect(screen.getByText("Signup failed")).toBeInTheDocument();
    });
  });

  it("shows an error if the email is already taken", async () => {
    (createSupabaseSignupClient as Mock).mockReturnValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "User already registered" },
        }),
      },
    });

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
