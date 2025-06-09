/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "@/pages/SignupPage";
import { createSupabaseSignupClient } from "@/SupabaseClient";

// The createSupabaseSignupClient is mocked globally in `src/setupTests.ts`

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the signup form", () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("shows a success message after successful signup", async () => {
    // Mock successful signup
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      }),
    };
    (createSupabaseSignupClient as Mock).mockReturnValue({ auth: mockAuth });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signup successful/i)).toBeInTheDocument();
    });

    // Check that navigation happens after 3 seconds
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      },
      { timeout: 4000 }
    );
  });

  it("shows an error message if signup fails", async () => {
    // Mock failed signup
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Signup failed" },
      }),
    };
    (createSupabaseSignupClient as Mock).mockReturnValue({ auth: mockAuth });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Signup failed")).toBeInTheDocument();
    });
  });

  it("shows an error if the email is already taken", async () => {
    // Mock email already taken error
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "User already registered" },
      }),
    };
    (createSupabaseSignupClient as Mock).mockReturnValue({ auth: mockAuth });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "taken@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("This email is already taken.")
      ).toBeInTheDocument();
    });
  });
});
