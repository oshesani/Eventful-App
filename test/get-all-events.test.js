const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const Event = require("../models/eventModel");
const User = require("../models/userModels"); // Ensure to import User model if needed
const { describe, it, expect, afterAll, beforeAll } = require("@jest/globals");

let server;
let accessToken;
let testUserId; // To store the test user ID

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

    // Use a dynamic port
    const port = process.env.TEST_PORT || 0; // 0 lets the OS assign a free port
    server = app.listen(port);

    // Ensure the user with fixed email doesn't already exist
    let userResponse = await User.findOne({ email: "lolo@gmail.com" });

    if (!userResponse) {
      // Create a test user
      userResponse = await User.create({
        name: "Test User",
        email: "lolo@gmail.com",
        password: "password413",
        isCreator: true
      });
    }

    testUserId = userResponse._id; // Store the test user ID

    // Login to get the access token
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({
        email: "lolo@gmail.com",
        password: "password413",
      });

    accessToken = loginResponse.body.accessToken;
    console.log("Generated accessToken:", accessToken);

    // Seed the database with test events
    await Event.create([
      { title: "Event 1", description: "Description 1", date: new Date(Date.now() + 24 * 60 * 60 * 1000), creatorId: testUserId },
      { title: "Event 2", description: "Description 2", date: new Date(Date.now() + 48 * 60 * 60 * 1000), creatorId: testUserId },
    ]);
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

describe("GET /api/events", () => {
  describe("given the user is authenticated", () => {
    it("should return 200 and a list of events", async () => {
      const response = await request(app)
        .get("/api/events")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("title");
      expect(response.body[0]).toHaveProperty("description");
      expect(response.body[0]).toHaveProperty("date");
    });
  });
});
