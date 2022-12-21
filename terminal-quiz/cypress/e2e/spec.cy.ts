describe("terminal", () => {
  it("passes", () => {
    cy.visit("http://127.0.0.1:5173/");
    const testString = "test";
    cy.get("body").type(testString);
    cy.get("body").type("{ctrl}{backspace}");

    // Check if the message was sent
    cy.get("body").should("not.contain", testString);

    // Type the message again
    cy.get("body").type(testString);

    cy.get("body").type("{ctrl}l");

    // Check if the message was cleared
    cy.get("body").should("not.contain", testString);

    // Change the room
    cy.get("body").type("changeRoom testRoom{enter}");

    // Check if the room was changed
    cy.get("body").should("contain", "testRoom");

    // Set the host
    cy.get("body").type("setHost{enter}");

    // Check if the host was set
    cy.get("body").should("contain", "Host set!");

    // Start the game
    cy.get("body").type("start{enter}");

    // Type next to start the game
    cy.get("body").type("next{enter}");

    // Check if the game started
    cy.get("body").should("contain", "Question:");

    // Gues the answer is 1
    cy.get("body").type("1{enter}");

    // Wait for 10 seconds
    cy.wait(10000);

    // Type done to end the game
    cy.get("body").type("done{enter}");
  });
});
