const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const { describe, it, expect, afterAll, beforeAll } = require("@jest/globals");

let server;
let accessToken;


beforeAll(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
      socketTimeoutMS: 20000, // Increase socket timeout to 20 seconds
    });
   // await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

    // Use a dynamic port
    const port = process.env.TEST_PORT || 0; // 0 lets the OS assign a free port
    server = app.listen(port);

    
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({
        email: "lolo@gmail.com",
        password: "password413",
      });

   console.log("Login response body:", loginResponse.body); 
    accessToken = loginResponse.body.accessToken;
    console.log("Generated accessToken:", accessToken); 
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

describe("create-event", () => {
  describe("given the user is authenticated", () => {
    it("should return 201 and event details when event is created successfully", async () => {
      jest.setTimeout(20000); 

      const response = await request(app)
        .post("/api/events/create-event")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Lagos Townhall Event",
          description: "This is an event",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day in the future
          reminderTime: 5,
          isCreator: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("event");
      expect(response.body).toHaveProperty("shareableUrl");
      expect(response.body).toHaveProperty("qrCodeUrl");
    });

    it("should return 400 when required fields are missing", async () => {
      jest.setTimeout(20000); // Set timeout to 20 seconds

      const response = await request(app)
        .post("/api/events/create-event")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          description: "This is an event",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day in the future
          reminderTime: 5,
          isCreator: true,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "All fields are Mandatory");
    });

    it("should return 400 when the event date is in the past", async () => {
      jest.setTimeout(20000); // Set timeout to 20 seconds

      const response = await request(app)
        .post("/api/events/create-event")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Lagos Townhall Event",
          description: "This event date is in the past",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day in the past
          reminderTime: 5,
          isCreator: true,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Event date cannot be in the past");
    });
  });
});
