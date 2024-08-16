const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const { describe, it, expect, afterAll, beforeAll } = require("@jest/globals");

let server;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

    // Use a dynamic port
    const port = process.env.TEST_PORT || 0; // 0 lets the OS assign a free port
    server = app.listen(port);
  } catch (error) {
    console.error('Error setting up test environment:', error);
  }
});

afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve)); // Ensure the server is closed
  }
  await mongoose.disconnect(); // Disconnect from the database
});

describe("login", () => {
  beforeAll(async () => {
    // Create a test user before running the login tests
    await request(app)
      .post("/api/users/register")
      .send({
        name: "Lolo Chike",
        email: "lolo@gmail.com",
        password: "password413",
        isCreator: true,
      });
  });

  describe("login to eventful", () => {
    describe("given the user information is valid", () => {
      it("should return 200 and a token when login is successful", async () => {
        jest.setTimeout(20000); // Set timeout to 20 seconds

        const response = await request(app)
          .post("/api/users/login")
          .send({
            email: "lolo@gmail.com",
            password: "password413",
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("accessToken"); // Adjust this based on your response
        // You can add more assertions here based on the expected response structure
      });
    });
  });
});
