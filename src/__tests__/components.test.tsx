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

const memberWithSocials: Member = {
  ...testMember,
  socials: {
    linkedin: "https://linkedin.com/in/test-person",
    github: "https://github.com/test-person",
    x: "https://x.com/testperson",
  },
};

const memberWithAllSocials: Member = {
  ...testMember,
  socials: {
    linkedin: "https://linkedin.com/in/test-person",
    github: "https://github.com/test-person",
    x: "https://x.com/testperson",
    bluesky: "https://bsky.app/profile/testperson",
    facebook: "https://facebook.com/testperson",
  },
};

const memberWithSocialsAndHandles: Member = {
  ...testMember,
  socials: {
    linkedin: { url: "https://linkedin.com/in/test-person", handle: "test-person" },
    github: { url: "https://github.com/testdev", handle: "@testdev" },
    x: "https://x.com/testperson",
  },
};

const memberWithEmptySocials: Member = {
  ...testMember,
  socials: {},
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

  describe("social links", () => {
    it("does not render socials section when member has no socials", () => {
      const { container } = render(<BusinessCard member={testMember} />);
      expect(container.querySelector('a[target="_blank"]')).toBeNull();
    });

    it("does not render socials section when socials object is empty", () => {
      const { container } = render(<BusinessCard member={memberWithEmptySocials} />);
      expect(container.querySelector('a[target="_blank"]')).toBeNull();
    });

    it("renders only provided social links", () => {
      render(<BusinessCard member={memberWithSocials} />);
      expect(screen.getByLabelText("Test Person on LinkedIn")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on GitHub")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on X")).toBeInTheDocument();
      expect(screen.queryByLabelText("Test Person on Bluesky")).toBeNull();
      expect(screen.queryByLabelText("Test Person on Facebook")).toBeNull();
    });

    it("renders all social links when all are provided", () => {
      render(<BusinessCard member={memberWithAllSocials} />);
      expect(screen.getByLabelText("Test Person on LinkedIn")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on GitHub")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on X")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on Bluesky")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Person on Facebook")).toBeInTheDocument();
    });

    it("social links have correct href attributes (string format)", () => {
      render(<BusinessCard member={memberWithSocials} />);
      expect(screen.getByLabelText("Test Person on LinkedIn")).toHaveAttribute(
        "href",
        "https://linkedin.com/in/test-person"
      );
      expect(screen.getByLabelText("Test Person on GitHub")).toHaveAttribute(
        "href",
        "https://github.com/test-person"
      );
      expect(screen.getByLabelText("Test Person on X")).toHaveAttribute(
        "href",
        "https://x.com/testperson"
      );
    });

    it("social links have correct href attributes (object format with handle)", () => {
      render(<BusinessCard member={memberWithSocialsAndHandles} />);
      expect(screen.getByLabelText("Test Person on LinkedIn")).toHaveAttribute(
        "href",
        "https://linkedin.com/in/test-person"
      );
      expect(screen.getByLabelText("Test Person on GitHub")).toHaveAttribute(
        "href",
        "https://github.com/testdev"
      );
    });

    it("social links open in new tab with security attributes", () => {
      render(<BusinessCard member={memberWithSocials} />);
      const linkedinLink = screen.getByLabelText("Test Person on LinkedIn");
      expect(linkedinLink).toHaveAttribute("target", "_blank");
      expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders social icons with correct alt text", () => {
      render(<BusinessCard member={memberWithSocials} />);
      expect(screen.getByAltText("LinkedIn")).toBeInTheDocument();
      expect(screen.getByAltText("GitHub")).toBeInTheDocument();
      expect(screen.getByAltText("X")).toBeInTheDocument();
    });

    it("renders handle text when provided", () => {
      render(<BusinessCard member={memberWithSocialsAndHandles} />);
      expect(screen.getByText("test-person")).toBeInTheDocument();
      expect(screen.getByText("@testdev")).toBeInTheDocument();
    });

    it("does not render handle text for string-only socials", () => {
      render(<BusinessCard member={memberWithSocialsAndHandles} />);
      const xLink = screen.getByLabelText("Test Person on X");
      expect(xLink.querySelector("span")).toBeNull();
    });

    it("sets title attribute to handle when provided, otherwise to platform label", () => {
      render(<BusinessCard member={memberWithSocialsAndHandles} />);
      expect(screen.getByLabelText("Test Person on LinkedIn")).toHaveAttribute(
        "title",
        "test-person"
      );
      expect(screen.getByLabelText("Test Person on X")).toHaveAttribute(
        "title",
        "X"
      );
    });
  });
});
