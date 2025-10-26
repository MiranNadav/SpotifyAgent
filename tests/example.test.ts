// Example test to verify Jest setup
describe("Example Test Suite", () => {
  it("should run tests successfully", () => {
    expect(true).toBe(true);
  });

  it("should do basic math", () => {
    expect(2 + 2).toBe(4);
  });

  it("should handle strings", () => {
    const greeting = "Hello, SpotifyAgent!";
    expect(greeting).toContain("SpotifyAgent");
  });
});

