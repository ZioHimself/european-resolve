# Testing

**Mapped:** 2026-07-28

## Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | ^4.1.5 | Test runner |
| @testing-library/react | ^16.3.2 | Component rendering & queries |
| @testing-library/jest-dom | ^6.9.1 | DOM assertion matchers |
| jsdom | ^29.1.1 | Browser environment simulation |
| @amiceli/vitest-cucumber | ^6.5.0 | BDD/Gherkin scenario testing |

## Configuration

- **Environment:** jsdom
- **Setup file:** `vitest.setup.ts` — imports `@testing-library/jest-dom/vitest`
- **Path alias:** `@/` → `./src/` (matches tsconfig)
- **Plugin:** `@vitejs/plugin-react` for JSX transform

## Test Structure

```
src/__tests__/
├── components.test.tsx       # Nav, Footer, MemberCard, BusinessCard
├── events.test.ts            # parseEvents(), groupOrganizersByRole()
├── events-page.spec.tsx      # BDD scenarios (EventTimeline, EventCard)
├── members.test.ts           # members data integrity + helper functions
├── qr.test.ts               # vCard generation + name parsing
├── ObfuscatedEmail.test.tsx  # Email obfuscation component
└── features/
    └── events-page.feature   # Gherkin feature definitions
```

## Testing Patterns

### Unit Tests (logic)
```typescript
describe("parseEvents", () => {
  it("maps raw fields to display type", () => {
    const raw = [makeRawEvent({ ... })];
    const result = parseEvents(raw, {});
    expect(result[0]).toEqual({ ... });
  });
});
```

### Component Tests (rendering)
```typescript
describe("MemberCard", () => {
  it("renders name, title, city", () => {
    render(<MemberCard member={testMember} />);
    expect(screen.getByText("Test Person")).toBeInTheDocument();
  });
});
```

### BDD Tests (Gherkin scenarios)
```typescript
const feature = await loadFeature("src/__tests__/features/events-page.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("Render events in reverse-chronological order", ({ Given, When, Then }) => {
    // Step implementations
  });
});
```

## Mocking

### Next.js Link
All component tests mock `next/link` as a plain `<a>` tag:
```typescript
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));
```

### API Functions
```typescript
vi.mock("@/lib/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/events")>();
  return { ...actual, fetchEvents: vi.fn().mockResolvedValue([]) };
});
```

## Test Helpers

- `makeRawEvent(overrides)` — factory for `RawEvent` test data
- `makeEvent(overrides)` — factory for `EventDisplay` test data
- `makeMember(overrides)` — factory for `Member` test data
- All use `Partial<T>` overrides pattern

## Coverage

Tests cover:
- Data transformation logic (events parsing, sorting, filtering)
- Component rendering (all UI components)
- Data integrity (member records, slugs, photo paths)
- Accessibility (keyboard focus, ARIA attributes)
- Edge cases (empty arrays, missing fields, single-word names)
- BDD scenarios (full user-facing behavior)

## Running Tests

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Watch mode |
| `npx vitest run {file}` | Single file |
