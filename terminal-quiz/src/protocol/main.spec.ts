import { changeRoom, getRoom, setHost } from "./main";

describe("Protocol", () => {
  it("should return the room", () => {
    changeRoom("test");
    expect(getRoom()).toBe("test");
  });

  it("should return the host", () => {
    setHost();
    expect(getRoom()).toBe("test");
  });

  it("should not allow setHost() to be called without a room", () => {
    changeRoom("");
    expect(setHost()).toBe("No room set!");
  });
});
