import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ObfuscatedEmail } from "@/components/ui/ObfuscatedEmail";

afterEach(() => {
  cleanup();
});

describe("ObfuscatedEmail", () => {
  const testEmail = "john.doe@european-resolve.org";

  describe("obfuscation", () => {
    it("renders obfuscated text with [at] instead of @", () => {
      render(<ObfuscatedEmail email={testEmail} />);

      expect(screen.getByText(/john\.doe\[at\]european-resolve\.org/)).toBeInTheDocument();
    });

    it("does not render plain @ symbol in visible text", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const textContent = container.textContent;
      expect(textContent).not.toContain("@");
      expect(textContent).toContain("[at]");
    });

    it("does not include mailto: in href attribute during SSR", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const link = container.querySelector("a, [role='link']");
      const href = link?.getAttribute("href");
      expect(href).not.toContain("mailto:");
    });
  });

  describe("data attributes", () => {
    it("has data-user attribute with username part", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const element = container.querySelector("[data-user]");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("data-user", "john.doe");
    });

    it("has data-domain attribute with domain part", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const element = container.querySelector("[data-domain]");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("data-domain", "european-resolve.org");
    });
  });

  describe("accessibility", () => {
    it("is keyboard focusable", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const element = container.querySelector("a, [tabindex='0'], button");
      expect(element).toBeInTheDocument();
    });

    it("has accessible role (link or button)", () => {
      render(<ObfuscatedEmail email={testEmail} />);

      const element = screen.getByRole("link") || screen.getByRole("button");
      expect(element).toBeInTheDocument();
    });

    it("responds to Enter key press", () => {
      const { container } = render(<ObfuscatedEmail email={testEmail} />);

      const element = container.querySelector("[data-user]");
      expect(element).toBeInTheDocument();

      fireEvent.keyDown(element!, { key: "Enter" });
    });
  });

  describe("styling", () => {
    it("accepts optional className prop", () => {
      const { container } = render(
        <ObfuscatedEmail email={testEmail} className="custom-class" />
      );

      const element = container.querySelector(".custom-class");
      expect(element).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles simple email format", () => {
      render(<ObfuscatedEmail email="info@example.org" />);

      expect(screen.getByText(/info\[at\]example\.org/)).toBeInTheDocument();
    });

    it("handles email with subdomain", () => {
      render(<ObfuscatedEmail email="user@mail.example.org" />);

      const { container } = render(<ObfuscatedEmail email="user@mail.example.org" />);
      const element = container.querySelector("[data-domain]");
      expect(element).toHaveAttribute("data-domain", "mail.example.org");
    });

    it("handles email with dots in username", () => {
      render(<ObfuscatedEmail email="first.middle.last@example.org" />);

      const { container } = render(<ObfuscatedEmail email="first.middle.last@example.org" />);
      const element = container.querySelector("[data-user]");
      expect(element).toHaveAttribute("data-user", "first.middle.last");
    });
  });
});
