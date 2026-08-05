import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { FundraiseForm } from "@/components/ui/FundraiseForm";

vi.mock("@/components/ui/FundraiserConfirmation", () => ({
  FundraiserConfirmation: (props: {
    slug: string;
    editToken: string;
    displayName: string;
  }) => (
    <div data-testid="fundraiser-confirmation">
      <span data-testid="conf-slug">{props.slug}</span>
      <span data-testid="conf-edit-token">{props.editToken}</span>
      <span data-testid="conf-display-name">{props.displayName}</span>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillStep1(
  overrides: { displayName?: string; message?: string; goalEur?: string } = {},
) {
  const name = overrides.displayName ?? "My Page";
  const message = overrides.message ?? "Running for a great cause";
  const goal = overrides.goalEur ?? "100";

  fireEvent.change(screen.getByLabelText(/display name/i), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(/personal message/i), {
    target: { value: message },
  });
  fireEvent.change(screen.getByLabelText(/personal goal/i), {
    target: { value: goal },
  });
}

function clickNext() {
  const buttons = screen.getAllByRole("button");
  const nextBtn = buttons.find(
    (b) => b.textContent?.includes("Next") || b.textContent?.includes("→"),
  );
  fireEvent.click(nextBtn!);
}

function clickBack() {
  fireEvent.click(screen.getByText(/← Back/));
}

function selectTier(name: "Supporter" | "Champion" | "Patron" | "Hero") {
  const tierArticle = screen
    .getByText(name)
    .closest("article") as HTMLElement;
  const selectBtn = within(tierArticle).getByRole("button");
  fireEvent.click(selectBtn);
}

function fillStep2(
  overrides: {
    tier?: "Supporter" | "Champion" | "Patron" | "Hero";
    fullName?: string;
    email?: string;
    country?: string;
    gdpr?: boolean;
  } = {},
) {
  selectTier(overrides.tier ?? "Supporter");

  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: overrides.fullName ?? "Jane Doe" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: overrides.email ?? "jane@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/country/i), {
    target: { value: overrides.country ?? "Belgium" },
  });

  if (overrides.gdpr !== false) {
    const checkboxes = screen.getAllByRole("checkbox");
    const gdprCheckbox = checkboxes.find(
      (cb) => !(cb as HTMLInputElement).checked,
    );
    if (gdprCheckbox) fireEvent.click(gdprCheckbox);
  }
}

function advanceToStep2() {
  fillStep1();
  clickNext();
}

function advanceToStep3() {
  fillStep1();
  clickNext();
  fillStep2();
  clickNext();
}

function mockFetchSuccess(data: Record<string, unknown> = {}) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        success: true,
        data: {
          fundraiser: {
            slug: "jane-doe",
            editToken: "tok_abc123",
            displayName: "My Page",
            photoUrl: null,
          },
          registration: {
            participantId: "R-0042",
            fullName: "Jane Doe",
            tierId: "supporter",
            tierName: "Supporter",
            amountEur: 15,
            rewards: ["Running", "Sticker pack"],
            paymentToken: "pay_xyz",
          },
          ...data,
        },
      }),
      { status: 201 },
    ),
  );
}

function mockFetchFieldErrors(
  errors: { field: string; message: string; code?: string }[],
  status = 400,
) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ success: false, errors }), { status }),
  );
}

function mockFetchNetworkError() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValueOnce(new TypeError("Failed to fetch"));
}

// ===========================================================================
// Tests
// ===========================================================================

describe("FundraiseForm", () => {
  // -----------------------------------------------------------------------
  // Initial rendering
  // -----------------------------------------------------------------------
  describe("initial rendering", () => {
    it("renders step 1 by default", () => {
      render(<FundraiseForm />);
      expect(
        screen.getByRole("heading", { name: /set up your fundraising page/i }),
      ).toBeInTheDocument();
    });

    it("shows step indicator with three steps", () => {
      render(<FundraiseForm />);
      expect(screen.getByText("1. Your page")).toBeInTheDocument();
      expect(screen.getByText("2. Runner details")).toBeInTheDocument();
      expect(screen.getByText("3. Review")).toBeInTheDocument();
    });

    it("does not show step 2 or step 3 content", () => {
      render(<FundraiseForm />);
      expect(
        screen.queryByRole("heading", {
          name: /your runner registration/i,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /review and submit/i }),
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Step 1 — Fundraiser page setup
  // -----------------------------------------------------------------------
  describe("step 1 — fundraiser page setup", () => {
    beforeEach(() => render(<FundraiseForm />));

    it("renders display name, message, and goal fields", () => {
      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/personal message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/personal goal/i)).toBeInTheDocument();
    });

    it("renders photo upload button", () => {
      expect(
        screen.getByRole("button", { name: /upload photo/i }),
      ).toBeInTheDocument();
    });

    it("shows character counter for message", () => {
      expect(screen.getByText("0/500")).toBeInTheDocument();
    });

    it("blocks navigation when display name is too short", () => {
      fillStep1({ displayName: "A" });
      clickNext();
      expect(
        screen.getByText(/display name must be 2-50 characters/i),
      ).toBeInTheDocument();
    });

    it("blocks navigation when message is empty", () => {
      fillStep1({ message: "" });
      clickNext();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });

    it("blocks navigation when goal is below minimum", () => {
      fillStep1({ goalEur: "5" });
      clickNext();
      expect(screen.getByText(/whole number between/i)).toBeInTheDocument();
    });

    it("blocks navigation when goal is not an integer", () => {
      fillStep1({ goalEur: "10.5" });
      clickNext();
      expect(screen.getByText(/whole number between/i)).toBeInTheDocument();
    });

    it("blocks navigation when goal is empty", () => {
      fillStep1({ goalEur: "" });
      clickNext();
      expect(screen.getByText(/whole number between/i)).toBeInTheDocument();
    });

    it("advances to step 2 with valid data", () => {
      fillStep1();
      clickNext();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });

    it("clears previous errors on successful advance", () => {
      fillStep1({ displayName: "A" });
      clickNext();
      expect(
        screen.getByText(/display name must be 2-50 characters/i),
      ).toBeInTheDocument();

      fillStep1({ displayName: "Valid Name" });
      clickNext();
      expect(
        screen.queryByText(/display name must be 2-50 characters/i),
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Step 2 — Runner details
  // -----------------------------------------------------------------------
  describe("step 2 — runner details", () => {
    beforeEach(() => {
      render(<FundraiseForm />);
      advanceToStep2();
    });

    it("renders tier selection, name, email, phone, t-shirt, language, country fields", () => {
      expect(screen.getByText("Supporter")).toBeInTheDocument();
      expect(screen.getByText("Champion")).toBeInTheDocument();
      expect(screen.getByText("Patron")).toBeInTheDocument();
      expect(screen.getByText("Hero")).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/t-shirt size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    it("renders GDPR and comms checkboxes", () => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBe(2);
    });

    it("blocks navigation when no tier is selected", () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "jane@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: "Belgium" },
      });
      const gdprCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(gdprCheckbox);

      clickNext();
      expect(screen.getByText(/please select a tier/i)).toBeInTheDocument();
    });

    it("blocks navigation when full name is empty", () => {
      selectTier("Supporter");
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "jane@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: "Belgium" },
      });
      const gdprCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(gdprCheckbox);

      clickNext();
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });

    it("blocks navigation when email is invalid", () => {
      selectTier("Supporter");
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "not-an-email" },
      });
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: "Belgium" },
      });
      const gdprCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(gdprCheckbox);

      clickNext();
      expect(
        screen.getByText(/valid email address is required/i),
      ).toBeInTheDocument();
    });

    it("blocks navigation when country is empty", () => {
      selectTier("Supporter");
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "jane@example.com" },
      });
      const gdprCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(gdprCheckbox);

      clickNext();
      expect(screen.getByText(/country is required/i)).toBeInTheDocument();
    });

    it("blocks navigation when GDPR consent is unchecked", () => {
      selectTier("Supporter");
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "jane@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: "Belgium" },
      });

      clickNext();
      expect(
        screen.getByText(/gdpr consent is required/i),
      ).toBeInTheDocument();
    });

    it("shows multiple validation errors simultaneously", () => {
      clickNext();
      expect(screen.getByText(/please select a tier/i)).toBeInTheDocument();
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/valid email address is required/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/country is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/gdpr consent is required/i),
      ).toBeInTheDocument();
    });

    it("advances to step 3 with valid data", () => {
      fillStep2();
      clickNext();
      expect(
        screen.getByRole("heading", { name: /review and submit/i }),
      ).toBeInTheDocument();
    });

    it("back button returns to step 1 with preserved data", () => {
      clickBack();
      expect(
        screen.getByRole("heading", {
          name: /set up your fundraising page/i,
        }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/display name/i)).toHaveValue("My Page");
    });
  });

  // -----------------------------------------------------------------------
  // Step 3 — Review
  // -----------------------------------------------------------------------
  describe("step 3 — review", () => {
    beforeEach(() => {
      render(<FundraiseForm />);
      advanceToStep3();
    });

    it("displays the review heading", () => {
      expect(
        screen.getByRole("heading", { name: /review and submit/i }),
      ).toBeInTheDocument();
    });

    it("shows fundraiser page summary", () => {
      expect(screen.getByText("My Page")).toBeInTheDocument();
      expect(
        screen.getByText("Running for a great cause"),
      ).toBeInTheDocument();
      expect(screen.getByText("€100")).toBeInTheDocument();
    });

    it("shows runner registration summary", () => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("Belgium")).toBeInTheDocument();
      expect(screen.getByText(/Supporter — €15/)).toBeInTheDocument();
    });

    it("shows photo status as None when no photo uploaded", () => {
      expect(screen.getByText("None")).toBeInTheDocument();
    });

    it("shows submit button with price", () => {
      expect(
        screen.getByRole("button", {
          name: /create page and register — €15/i,
        }),
      ).toBeInTheDocument();
    });

    it("back button returns to step 2", () => {
      clickBack();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Submission — success
  // -----------------------------------------------------------------------
  describe("submission — success", () => {
    it("shows confirmation screen after successful submit", async () => {
      mockFetchSuccess();
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", {
          name: /create page and register/i,
        }),
      );

      await waitFor(() => {
        expect(
          screen.getByTestId("fundraiser-confirmation"),
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId("conf-slug")).toHaveTextContent("jane-doe");
      expect(screen.getByTestId("conf-edit-token")).toHaveTextContent(
        "tok_abc123",
      );
      expect(screen.getByTestId("conf-display-name")).toHaveTextContent(
        "My Page",
      );
    });

    it("saves result to sessionStorage on success", async () => {
      mockFetchSuccess();
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", {
          name: /create page and register/i,
        }),
      );

      await waitFor(() => {
        expect(
          screen.getByTestId("fundraiser-confirmation"),
        ).toBeInTheDocument();
      });

      const saved = sessionStorage.getItem("r4u:fundraise");
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.fundraiser.slug).toBe("jane-doe");
    });

    it("sends correct form data to the API", async () => {
      const spy = mockFetchSuccess();
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", {
          name: /create page and register/i,
        }),
      );

      await waitFor(() => {
        expect(spy).toHaveBeenCalledOnce();
      });

      const [url, opts] = spy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain("/api/fundraiser/register");
      expect(opts.method).toBe("POST");

      const body = opts.body as FormData;
      expect(body.get("displayName")).toBe("My Page");
      expect(body.get("message")).toBe("Running for a great cause");
      expect(body.get("goalEur")).toBe("100");
      expect(body.get("fullName")).toBe("Jane Doe");
      expect(body.get("email")).toBe("jane@example.com");
      expect(body.get("country")).toBe("Belgium");
      expect(body.get("tierId")).toBe("supporter");
      expect(body.get("tshirtSize")).toBe("M");
      expect(body.get("gdprConsent")).toBe("true");
    });

    it("disables submit button while submitting", async () => {
      let resolveResponse!: (value: Response) => void;
      vi.spyOn(globalThis, "fetch").mockReturnValueOnce(
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
      );

      render(<FundraiseForm />);
      advanceToStep3();

      const submitBtn = screen.getByRole("button", {
        name: /create page and register/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/creating/i)).toBeInTheDocument();
      });
      expect(submitBtn).toBeDisabled();

      resolveResponse(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              fundraiser: {
                slug: "x",
                editToken: "t",
                displayName: "X",
                photoUrl: null,
              },
              registration: {
                participantId: "R-1",
                fullName: "X",
                tierId: "supporter",
                tierName: "Supporter",
                amountEur: 15,
                rewards: [],
                paymentToken: "p",
              },
            },
          }),
          { status: 201 },
        ),
      );

      await waitFor(() => {
        expect(
          screen.getByTestId("fundraiser-confirmation"),
        ).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // Submission — error routing (the bug fix)
  // -----------------------------------------------------------------------
  describe("submission — error routing", () => {
    it("navigates to step 1 when API returns step 1 field errors", async () => {
      mockFetchFieldErrors([
        {
          field: "displayName",
          message: "Already taken",
          code: "VALIDATION_DISPLAYNAME_TAKEN",
        },
      ]);
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: /set up your fundraising page/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it("navigates to step 2 when API returns step 2 field errors", async () => {
      mockFetchFieldErrors([
        {
          field: "email",
          message: "Email already registered",
          code: "VALIDATION_EMAIL_DUPLICATE",
        },
      ]);
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: /your runner registration/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it("stays on step 3 when API returns _global server error", async () => {
      mockFetchFieldErrors(
        [
          {
            field: "_global",
            message: "An internal error occurred",
            code: "INTERNAL_ERROR",
          },
        ],
        500,
      );
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /review and submit/i }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(/unexpected error/i),
      ).toBeInTheDocument();
    });

    it("stays on step 3 when API returns error without field-level errors", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false }), { status: 500 }),
      );
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /review and submit/i }),
        ).toBeInTheDocument();
      });
      const errorEl = screen.getByText(/something went wrong/i);
      expect(errorEl).toBeInTheDocument();
    });

    it("shows network error and stays on step 3 when fetch fails", async () => {
      mockFetchNetworkError();
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /review and submit/i }),
        ).toBeInTheDocument();
      });
      const errorEl = screen.getByText(/network error/i);
      expect(errorEl).toBeInTheDocument();
    });

    it("navigates to step 1 when API returns both step 1 and step 2 errors", async () => {
      mockFetchFieldErrors([
        {
          field: "goalEur",
          message: "Invalid goal",
          code: "VALIDATION_GOAL_INVALID",
        },
        {
          field: "email",
          message: "Invalid email",
          code: "VALIDATION_EMAIL_INVALID",
        },
      ]);
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: /set up your fundraising page/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it("displays field-level error messages on the target step", async () => {
      mockFetchFieldErrors([
        {
          field: "email",
          message: "Email already registered",
        },
      ]);
      render(<FundraiseForm />);
      advanceToStep3();

      fireEvent.click(
        screen.getByRole("button", { name: /create page and register/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("heading", {
            name: /your runner registration/i,
          }),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText("Email already registered"),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Navigation — full round-trip
  // -----------------------------------------------------------------------
  describe("navigation round-trip", () => {
    it("preserves all data across back-and-forward navigation", () => {
      render(<FundraiseForm />);
      fillStep1({ displayName: "Serhiy", message: "For Ukraine", goalEur: "250" });
      clickNext();

      fillStep2({ tier: "Champion", fullName: "Serhiy K", email: "s@test.com", country: "Ukraine" });
      clickNext();

      expect(screen.getByText("Serhiy")).toBeInTheDocument();
      expect(screen.getByText("For Ukraine")).toBeInTheDocument();
      expect(screen.getByText("€250")).toBeInTheDocument();
      expect(screen.getByText("Serhiy K")).toBeInTheDocument();
      expect(screen.getByText("s@test.com")).toBeInTheDocument();
      expect(screen.getByText("Ukraine")).toBeInTheDocument();
      expect(screen.getByText(/Champion — €30/)).toBeInTheDocument();

      clickBack();
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Serhiy K");
      expect(screen.getByLabelText(/email/i)).toHaveValue("s@test.com");

      clickBack();
      expect(screen.getByLabelText(/display name/i)).toHaveValue("Serhiy");
      expect(screen.getByLabelText(/personal message/i)).toHaveValue(
        "For Ukraine",
      );
      expect(screen.getByLabelText(/personal goal/i)).toHaveValue(250);
    });

    it("clears errors when going back", () => {
      render(<FundraiseForm />);
      advanceToStep2();

      clickNext();
      expect(screen.getByText(/please select a tier/i)).toBeInTheDocument();

      clickBack();
      expect(
        screen.queryByText(/please select a tier/i),
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Session restore
  // -----------------------------------------------------------------------
  describe("session restore", () => {
    it("renders confirmation when sessionStorage has a saved result", () => {
      const saved = {
        fundraiser: {
          slug: "restored-user",
          editToken: "tok_restored",
          displayName: "Restored Page",
          photoUrl: null,
        },
        registration: {
          participantId: "R-9999",
          fullName: "Restored User",
          tierId: "patron",
          tierName: "Patron",
          amountEur: 100,
          rewards: ["All rewards"],
          paymentToken: "pay_restored",
        },
      };
      sessionStorage.setItem("r4u:fundraise", JSON.stringify(saved));

      render(<FundraiseForm />);

      expect(
        screen.getByTestId("fundraiser-confirmation"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("conf-slug")).toHaveTextContent(
        "restored-user",
      );
    });

    it("shows step 1 when sessionStorage is empty", () => {
      render(<FundraiseForm />);
      expect(
        screen.getByRole("heading", {
          name: /set up your fundraising page/i,
        }),
      ).toBeInTheDocument();
    });

    it("shows step 1 when sessionStorage has invalid JSON", () => {
      sessionStorage.setItem("r4u:fundraise", "not-json");
      render(<FundraiseForm />);
      expect(
        screen.getByRole("heading", {
          name: /set up your fundraising page/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Step 1 — photo upload validation
  // -----------------------------------------------------------------------
  describe("step 1 — photo upload", () => {
    it("rejects files over 5MB", () => {
      render(<FundraiseForm />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const bigFile = new File(["x".repeat(6 * 1024 * 1024)], "big.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [bigFile] } });
      expect(screen.getByText(/under 5MB/i)).toBeInTheDocument();
    });

    it("rejects non-image file types", () => {
      render(<FundraiseForm />);
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const pdfFile = new File(["content"], "doc.pdf", {
        type: "application/pdf",
      });

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });
      expect(screen.getByText(/jpeg, png, or webp/i)).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Tier selection
  // -----------------------------------------------------------------------
  describe("tier selection on step 2", () => {
    beforeEach(() => {
      render(<FundraiseForm />);
      advanceToStep2();
    });

    it("shows all four tiers with prices", () => {
      expect(screen.getByText("€15")).toBeInTheDocument();
      expect(screen.getByText("€30")).toBeInTheDocument();
      expect(screen.getByText("€60")).toBeInTheDocument();
      expect(screen.getByText("€100")).toBeInTheDocument();
    });

    it("marks selected tier with aria-pressed", () => {
      selectTier("Champion");
      const championArticle = screen
        .getByText("Champion")
        .closest("article") as HTMLElement;
      const btn = within(championArticle).getByRole("button");
      expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    it("updates submit button price on step 3 based on selected tier", () => {
      fillStep2({ tier: "Patron" });
      clickNext();
      expect(
        screen.getByRole("button", {
          name: /create page and register — €60/i,
        }),
      ).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe("edge cases", () => {
    it("handles display name at exact minimum length (2 chars)", () => {
      render(<FundraiseForm />);
      fillStep1({ displayName: "AB" });
      clickNext();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });

    it("handles display name at exact maximum length (50 chars)", () => {
      render(<FundraiseForm />);
      fillStep1({ displayName: "A".repeat(50) });
      clickNext();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });

    it("handles goal at exact minimum (10)", () => {
      render(<FundraiseForm />);
      fillStep1({ goalEur: "10" });
      clickNext();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });

    it("handles goal at exact maximum (100000)", () => {
      render(<FundraiseForm />);
      fillStep1({ goalEur: "100000" });
      clickNext();
      expect(
        screen.getByRole("heading", {
          name: /your runner registration/i,
        }),
      ).toBeInTheDocument();
    });

    it("trims whitespace-only fields as invalid", () => {
      render(<FundraiseForm />);
      fillStep1({ displayName: "  " });
      clickNext();
      expect(
        screen.getByText(/display name must be 2-50 characters/i),
      ).toBeInTheDocument();
    });

    it("truncates long messages in review step", () => {
      render(<FundraiseForm />);
      const longMessage = "A".repeat(120);
      fillStep1({ message: longMessage });
      clickNext();
      fillStep2();
      clickNext();

      expect(screen.getByText(/A{80}…/)).toBeInTheDocument();
    });
  });
});
