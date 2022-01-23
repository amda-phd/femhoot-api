"use strict";

require("module-alias/register");
const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script());

const { init } = require("@server");

describe("Login POST /login with", () => {
  let server;
  let testUsers;

  beforeEach(async () => {
    server = await init();
    testUsers = server.methods.getAsset("User");
    await server.methods.setUpDatabase();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("Good credential", () => {
    it("Logs the user and produces a valid token", async () => {
      const { email, _id } = testUsers[0];
      let res = await server.inject({
        method: "POST",
        url: "/login",
        payload: { email },
      });

      expect(res.statusCode).to.equal(201);
      expect(res.result.user._id.toString()).to.equal(_id);
      expect(res.result.token).to.exist();

      res = await server.inject({
        method: "GET",
        url: `/users/${_id}`,
        headers: { authorization: `Bearer ${res.result.token}` },
      });

      expect(res.statusCode).to.equal(200);

      res = await server.inject({
        method: "GET",
        url: `/users/${_id}`,
      });

      expect(res.statusCode).to.equal(401);
    });
  });

  describe("Invalid credentials", () => {
    it("Throws an 401 error and doesn't log the user", async () => {
      const { email } = testUsers[1];
      const res = await server.inject({
        method: "POST",
        url: "/login",
        payload: { email },
      });

      expect(res.statusCode).to.equal(401);
    });
  });
});
