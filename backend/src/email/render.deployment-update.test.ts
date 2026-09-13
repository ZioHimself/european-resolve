import { describe, it, expect } from "vitest";
import { renderDeploymentUpdateEmail } from "./render.js";

describe("renderDeploymentUpdateEmail", () => {
  const data = {
    name: "Alice",
    email: "alice@example.com",
  };

  it("renders EN subject and key deployment copy for three units", () => {
    const rendered = renderDeploymentUpdateEmail(data, "en");

    expect(rendered.subject).toBe("Run for Ukraine 2026 | Update from Hurkit");
    expect(rendered.text).toContain("Hello Alice,");
    expect(rendered.text).toContain("As we promised");
    expect(rendered.text).toContain("three recipient units");
    expect(rendered.text).toContain(
      "Every euro went directly to Hurkit for portable power stations for Ukraine's defenders.",
    );
    expect(rendered.text).not.toContain("€6,473");
    expect(rendered.text).not.toContain("eight stations in total");
    expect(rendered.text).toContain("eight portable power stations have been purchased");
    expect(rendered.text).toContain("Deliveries and unit reports are still in progress");
    expect(rendered.text).toContain("Purchased for the 54th Separate Mechanised Brigade");
    expect(rendered.text).toContain("Oukitel BP3000E");
    expect(rendered.text).toContain("EcoFlow DELTA 3 Max");
    expect(rendered.text).toContain("EcoFlow Delta 2");
    expect(rendered.text).toContain(
      "Our support will also reach air defence units that work on Shahed drone interception.",
    );
    expect(rendered.text).toContain(
      "Reports from the units expected as deliveries complete.",
    );
    expect(rendered.text).toContain("Rewards and merchandise");
    expect(rendered.text).toContain(
      "We still have a lot of dog tags and other merchandise left from the event.",
    );
    expect(rendered.text).toContain(
      "You are welcome to pick up your rewards or contact Olena (olena.kuzhym@european-resolve.org) for details.",
    );
    expect(rendered.text).not.toContain("receive them with a donation");
    expect(rendered.text).toContain(
      "We will keep you posted as Hurkit shares reports from the units.",
    );
    expect(rendered.text).not.toContain("front line");
    expect(rendered.html).toContain(
      'href="mailto:olena.kuzhym@european-resolve.org"',
    );
    expect(rendered.html).toContain('href="https://hurkit.org/"');
    expect(rendered.html).not.toMatch(/Hurkit Foundation<\/a>\./);
    expect(rendered.html).toContain(
      "https://european-resolve.org/events/2026-run-for-ukraine/",
    );
    expect(rendered.text).toContain(
      "You can find the full update and final results on the event page:",
    );
    expect(rendered.text).not.toContain("follow progress");
    expect(rendered.text).toContain("info@european-resolve.org");
  });

  it("does not use em dashes in EN copy", () => {
    const rendered = renderDeploymentUpdateEmail(data, "en");
    expect(rendered.text).not.toContain("—");
    expect(rendered.html).not.toContain("—");
  });

  it("interpolates the recipient name in the greeting", () => {
    const rendered = renderDeploymentUpdateEmail(
      { ...data, name: "Svitlana" },
      "en",
    );
    expect(rendered.text).toContain("Hello Svitlana,");
  });
});
