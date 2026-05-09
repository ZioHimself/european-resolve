import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { MemberCard } from "@/components/ui/MemberCard";
import { BusinessCard } from "@/components/ui/BusinessCard";
import type { Member } from "@/data/members";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

const testMember: Member = {
  slug: "test-person",
  name: "Test Person",
  title: "Head of Testing",
  city: "Brussels",
  photo: "/team/test-person.png",
};

const memberWithContact: Member = {
  ...testMember,
  email: "test@example.org",
  phone: "+32 123 456 789",
};

describe("Nav", () => {
  it("renders wordmark", () => {
    render(<Nav />);
    expect(screen.getByText("European Resolve")).toBeInTheDocument();
  });

  it("renders Team link", () => {
    render(<Nav />);
    expect(screen.getByText("Team")).toBeInTheDocument();
  });

  it("renders Events link", () => {
    render(<Nav />);
    expect(screen.getByText("Events")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders privacy link", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders no-cookies notice", () => {
    render(<Footer />);
    expect(
      screen.getByText("We don't use cookies or collect personal data."),
    ).toBeInTheDocument();
  });

  it("renders VZW legal line", () => {
    render(<Footer />);
    expect(screen.getByText(/European Resolve VZW/)).toBeInTheDocument();
  });
});

describe("MemberCard", () => {
  it("renders name, title, city", () => {
    render(<MemberCard member={testMember} />);
    expect(screen.getByText("Test Person")).toBeInTheDocument();
    expect(screen.getByText("Head of Testing")).toBeInTheDocument();
    expect(screen.getByText("Brussels")).toBeInTheDocument();
  });

  it("renders photo", () => {
    render(<MemberCard member={testMember} />);
    const img = screen.getByAltText("Test Person");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/team/test-person.png");
  });

  it("links to /team/{slug}", () => {
    render(<MemberCard member={testMember} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/team/test-person");
  });
});

describe("BusinessCard", () => {
  it("renders name, title, city", () => {
    render(<BusinessCard member={testMember} />);
    expect(
      screen.getByRole("heading", { name: "Test Person" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Head of Testing")).toBeInTheDocument();
    expect(screen.getByText("Brussels")).toBeInTheDocument();
  });

  it("renders photo", () => {
    render(<BusinessCard member={testMember} />);
    const img = screen.getByAltText("Test Person");
    expect(img).toBeInTheDocument();
  });

  it("omits email and phone when absent", () => {
    const { container } = render(<BusinessCard member={testMember} />);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("renders email and phone when present", () => {
    render(<BusinessCard member={memberWithContact} />);
    expect(screen.getByText("test@example.org")).toBeInTheDocument();
    expect(screen.getByText("+32 123 456 789")).toBeInTheDocument();
  });
});
