import { vi, expect } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import type { EventDisplay } from "@/lib/events";
import { fetchEvents } from "@/lib/events";

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

vi.mock("@/lib/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/events")>();
  return {
    ...actual,
    fetchEvents: vi.fn().mockResolvedValue([]),
  };
});

function makeEvent(overrides: Partial<EventDisplay> = {}): EventDisplay {
  return {
    date: "2026-01-15",
    name: "Test Event",
    place: "Brussels",
    type: "Protest",
    thumbnail: "",
    announcement_url: "",
    announcement_title: "",
    organizers: [],
    media_features: [],
    tags: [],
    ...overrides,
  };
}

const feature = await loadFeature(
  "src/__tests__/features/events-page.feature",
);

describeFeature(feature, ({ AfterEachScenario, Scenario }) => {
  AfterEachScenario(() => {
    cleanup();
  });

  Scenario(
    "Render events in reverse-chronological order",
    ({ Given, When, Then, And }) => {
      let events: EventDisplay[];

      Given(
        'the API returns events on "2025-12-12" and "2026-02-22"',
        () => {
          events = [
            makeEvent({ date: "2025-12-12", name: "Earlier Event" }),
            makeEvent({ date: "2026-02-22", name: "Later Event" }),
          ];
        },
      );

      When("the events page is rendered", async () => {
        const { EventTimeline } = await import(
          "@/components/ui/EventTimeline"
        );
        render(<EventTimeline initialEvents={events} />);
      });

      Then('the first event displayed is from "2026-02-22"', () => {
        const cards = screen.getAllByRole("article");
        expect(
          within(cards[0]).getByText("Later Event"),
        ).toBeInTheDocument();
      });

      And('the second event displayed is from "2025-12-12"', () => {
        const cards = screen.getAllByRole("article");
        expect(
          within(cards[1]).getByText("Earlier Event"),
        ).toBeInTheDocument();
      });
    },
  );

  Scenario(
    "Display event card with all fields",
    ({ Given, When, Then, And }) => {
      let event: EventDisplay;

      Given('an event titled "We Remember" on "2026-02-22"', () => {
        event = makeEvent({ date: "2026-02-22", name: "We Remember" });
      });

      And('the event type is "Manifestation"', () => {
        event.type = "Manifestation";
      });

      And(
        'the event place is "Pl. de l\'Albertine, 1000 Brussels"',
        () => {
          event.place = "Pl. de l'Albertine, 1000 Brussels";
        },
      );

      And(
        'the event has organizers "European Resolve" and "Embassy of Ukraine"',
        () => {
          event.organizers = [
            {
              name: "European Resolve",
              website: "https://european-resolve.org",
              role: "Speakers",
            },
            {
              name: "Embassy of Ukraine",
              website: "https://belgium.mfa.gov.ua/en",
              role: "Organizer",
            },
          ];
        },
      );

      And('the event has tags "Belgium" and "Ukraine"', () => {
        event.tags = ["Belgium", "Ukraine"];
      });

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then('the formatted date "22 February 2026" is displayed', () => {
        expect(screen.getByText("22 February 2026")).toBeInTheDocument();
      });

      And('the event name "We Remember" is displayed', () => {
        expect(screen.getByText("We Remember")).toBeInTheDocument();
      });

      And('a type badge showing "Manifestation" is displayed', () => {
        expect(screen.getByText("Manifestation")).toBeInTheDocument();
      });

      And(
        'the place "Pl. de l\'Albertine, 1000 Brussels" is displayed',
        () => {
          expect(
            screen.getByText("Pl. de l'Albertine, 1000 Brussels"),
          ).toBeInTheDocument();
        },
      );

      And("the organizers are listed", () => {
        expect(
          screen.getByText("European Resolve"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Embassy of Ukraine"),
        ).toBeInTheDocument();
      });

      And("the tags are displayed", () => {
        expect(screen.getByText("Belgium")).toBeInTheDocument();
        expect(screen.getByText("Ukraine")).toBeInTheDocument();
      });
    },
  );

  Scenario("Show thumbnail when available", ({ Given, When, Then }) => {
    let event: EventDisplay;

    Given(
      'an event with thumbnail "/events/2026-02-22.jpg"',
      () => {
        event = makeEvent({ thumbnail: "/events/2026-02-22.jpg" });
      },
    );

    When("the event card is rendered", async () => {
      const { EventCard } = await import("@/components/ui/EventCard");
      render(<EventCard event={event} />);
    });

    Then(
      'an image with source "/events/2026-02-22.jpg" is displayed',
      () => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "/events/2026-02-22.jpg");
      },
    );
  });

  Scenario(
    "Hide thumbnail when not available",
    ({ Given, When, Then }) => {
      let event: EventDisplay;

      Given("an event without a thumbnail", () => {
        event = makeEvent({ thumbnail: "" });
      });

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then("no event image is displayed", () => {
        expect(screen.queryByRole("img")).toBeNull();
      });
    },
  );

  Scenario(
    "Show announcement link when URL is present",
    ({ Given, When, Then, And }) => {
      let event: EventDisplay;

      Given(
        'an event with announcement URL "https://facebook.com/events/123"',
        () => {
          event = makeEvent({
            announcement_url: "https://facebook.com/events/123",
          });
        },
      );

      And(
        'the announcement title is "Official Event Announcement"',
        () => {
          event.announcement_title = "Official Event Announcement";
        },
      );

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then(
        'a link labelled "Official Event Announcement" is displayed',
        () => {
          expect(
            screen.getByText("Official Event Announcement"),
          ).toBeInTheDocument();
        },
      );

      And(
        'the link points to "https://facebook.com/events/123"',
        () => {
          const link = screen.getByText("Official Event Announcement");
          expect(link.closest("a")).toHaveAttribute(
            "href",
            "https://facebook.com/events/123",
          );
        },
      );
    },
  );

  Scenario(
    "Hide announcement link when URL is empty",
    ({ Given, When, Then }) => {
      let event: EventDisplay;

      Given("an event with no announcement URL", () => {
        event = makeEvent({
          announcement_url: "",
          announcement_title: "",
        });
      });

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then("no announcement link is displayed", () => {
        expect(
          screen.queryByText("Official Event Announcement"),
        ).toBeNull();
      });
    },
  );

  Scenario(
    "Show media feature links when present",
    ({ Given, When, Then }) => {
      let event: EventDisplay;

      Given(
        'an event with media features "https://wsj.com/article" and "https://npr.org/story"',
        () => {
          event = makeEvent({
            media_features: [
              "https://wsj.com/article",
              "https://npr.org/story",
            ],
          });
        },
      );

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then("2 media feature links are displayed", () => {
        const links = screen
          .getAllByRole("link")
          .filter(
            (link) =>
              link.getAttribute("href")?.includes("wsj.com") ||
              link.getAttribute("href")?.includes("npr.org"),
          );
        expect(links).toHaveLength(2);
      });
    },
  );

  Scenario(
    "Hide media features section when empty",
    ({ Given, When, Then }) => {
      let event: EventDisplay;

      Given("an event with no media features", () => {
        event = makeEvent({ media_features: [] });
      });

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then("no media feature links are displayed", () => {
        const links = screen.queryAllByRole("link");
        const mediaLinks = links.filter(
          (link) =>
            link.getAttribute("href")?.startsWith("https://") &&
            !link.getAttribute("href")?.includes("facebook.com"),
        );
        expect(mediaLinks).toHaveLength(0);
      });
    },
  );

  Scenario(
    "Link organizer names to their websites",
    ({ Given, When, Then, And }) => {
      let event: EventDisplay;

      Given(
        'an organizer "European Resolve" with website "https://european-resolve.org"',
        () => {
          event = makeEvent({
            organizers: [
              {
                name: "European Resolve",
                website: "https://european-resolve.org",
                role: "Organizer",
              },
            ],
          });
        },
      );

      And('an organizer "Avaaz" without a website', () => {
        event.organizers.push({ name: "Avaaz", role: "Co-Organizer" });
      });

      When("the event card is rendered", async () => {
        const { EventCard } = await import("@/components/ui/EventCard");
        render(<EventCard event={event} />);
      });

      Then(
        '"European Resolve" is a link to "https://european-resolve.org"',
        () => {
          const link = screen.getByText("European Resolve");
          expect(link.closest("a")).toHaveAttribute(
            "href",
            "https://european-resolve.org",
          );
        },
      );

      And('"Avaaz" is displayed as plain text', () => {
        const avaaz = screen.getByText("Avaaz");
        expect(avaaz.closest("a")).toBeNull();
      });
    },
  );

  Scenario(
    "Show empty state when no events exist",
    ({ Given, When, Then }) => {
      Given("the API returns no events", () => {
        // empty setup
      });

      When("the events page is rendered", async () => {
        const { EventTimeline } = await import(
          "@/components/ui/EventTimeline"
        );
        render(<EventTimeline initialEvents={[]} />);
      });

      Then('the message "No events yet" is displayed', () => {
        expect(screen.getByText("No events yet")).toBeInTheDocument();
      });
    },
  );

  Scenario(
    "Client-side refresh does not clear build-time data on failure",
    ({ Given, And, When, Then }) => {
      let events: EventDisplay[];

      Given(
        "the events page was rendered with 2 build-time events",
        () => {
          events = [
            makeEvent({ name: "Event A", date: "2026-01-01" }),
            makeEvent({ name: "Event B", date: "2026-02-01" }),
          ];
        },
      );

      And("the client-side fetch fails", () => {
        vi.mocked(fetchEvents).mockRejectedValue(
          new Error("Network error"),
        );
      });

      When("the page hydrates", async () => {
        const { EventTimeline } = await import(
          "@/components/ui/EventTimeline"
        );
        render(<EventTimeline initialEvents={events} />);
      });

      Then("2 event cards are still displayed", () => {
        const cards = screen.getAllByRole("article");
        expect(cards).toHaveLength(2);
      });
    },
  );
});
