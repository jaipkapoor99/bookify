import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "@/pages/SignupPage";
import { supabase } from "@/SupabaseClient";

// Mock Supabase client
vi.mock("@/SupabaseClient", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("SignupPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the signup form", () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("shows a success message after successful signup", async () => {
    (supabase.auth.signUp as Mock).mockResolvedValueOnce({
      data: { user: { identities: [{}] } },
      error: null,
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(
      screen.getByRole("button", { name: "Signing up..." })
    ).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByText("Check your email for the confirmation link!")
      ).toBeInTheDocument();
    });
  });

  it("shows an error message if signup fails", async () => {
    const errorMessage = "A different error occurred";
    (supabase.auth.signUp as Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: errorMessage },
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows an error if the email is already taken", async () => {
    (supabase.auth.signUp as Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(
        screen.getByText("This email is already taken.")
      ).toBeInTheDocument();
    });
  });
});
