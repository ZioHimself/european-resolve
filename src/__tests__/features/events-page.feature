Feature: Events page

  The events page displays a timeline of civic actions fetched
  from a Google Sheets API, rendered as static HTML at build time
  with client-side refresh for freshness.

  Scenario: Render events in reverse-chronological order
    Given the API returns events on "2025-12-12" and "2026-02-22"
    When the events page is rendered
    Then the first event displayed is from "2026-02-22"
    And the second event displayed is from "2025-12-12"

  Scenario: Display event card with all fields
    Given an event titled "We Remember" on "2026-02-22"
    And the event type is "Manifestation"
    And the event place is "Pl. de l'Albertine, 1000 Brussels"
    And the event has organizers "European Resolve" and "Embassy of Ukraine"
    And the event has tags "Belgium" and "Ukraine"
    When the event card is rendered
    Then the formatted date "22 February 2026" is displayed
    And the event name "We Remember" is displayed
    And a type badge showing "Manifestation" is displayed
    And the place "Pl. de l'Albertine, 1000 Brussels" is displayed
    And the organizers are listed
    And the tags are displayed

  Scenario: Show thumbnail when available
    Given an event with thumbnail "/events/2026-02-22.jpg"
    When the event card is rendered
    Then an image with source "/events/2026-02-22.jpg" is displayed

  Scenario: Hide thumbnail when not available
    Given an event without a thumbnail
    When the event card is rendered
    Then no event image is displayed

  Scenario: Show announcement link when URL is present
    Given an event with announcement URL "https://facebook.com/events/123"
    And the announcement title is "Official Event Announcement"
    When the event card is rendered
    Then a link labelled "Official Event Announcement" is displayed
    And the link points to "https://facebook.com/events/123"

  Scenario: Hide announcement link when URL is empty
    Given an event with no announcement URL
    When the event card is rendered
    Then no announcement link is displayed

  Scenario: Show media feature links when present
    Given an event with media features "https://wsj.com/article" and "https://npr.org/story"
    When the event card is rendered
    Then 2 media feature links are displayed

  Scenario: Hide media features section when empty
    Given an event with no media features
    When the event card is rendered
    Then no media feature links are displayed

  Scenario: Link organizer names to their websites
    Given an organizer "European Resolve" with website "https://european-resolve.org"
    And an organizer "Avaaz" without a website
    When the event card is rendered
    Then "European Resolve" is a link to "https://european-resolve.org"
    And "Avaaz" is displayed as plain text

  Scenario: Show empty state when no events exist
    Given the API returns no events
    When the events page is rendered
    Then the message "No events yet" is displayed

  Scenario: Client-side refresh does not clear build-time data on failure
    Given the events page was rendered with 2 build-time events
    And the client-side fetch fails
    When the page hydrates
    Then 2 event cards are still displayed
