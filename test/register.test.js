const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");
const { describe, it, expect, afterAll, beforeAll } = require("@jest/globals");

let server

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    //console.log('Database connected');

    // Use a dynamic port
    const port = process.env.TEST_PORT || 0; // 0 lets the OS assign a free port
    server = app.listen(port);
   /* server = app.listen(port, () => console.log(`Server running on port ${port}`)

  );
  */
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




describe("register", () => {
  describe("register to eventful", () => {
    describe("given the user information is not valid", () => {
      it("should return 400 when required fields are missing", async () => {
        jest.setTimeout(20000); // Set timeout to 10 seconds
        const response = await request(app)
          .post("/api/users/register")
          .send({
            password: "112223",
            name: "Musa Sani",
            isCreator: true
          });
        expect(response.status).toBe(400);
      });
    });
  });
});
