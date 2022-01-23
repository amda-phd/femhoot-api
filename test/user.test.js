"use strict";

require("module-alias/register");
const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script());

const { init } = require("@server");

describe("User /users", () => {
  let server;
  let User;
  let testUsers;

  beforeEach(async () => {
    server = await init();
    User = server.methods.model.mongo("User");
    testUsers = server.methods.getAsset("User");
    await server.methods.setUpDatabase();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("POST with", () => {
    describe("Payload correctly parsed", () => {
      it("Creates a new user in the database and serves it", async () => {
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: testUsers[1],
        });

        expect(res.statusCode).to.equal(201);
        expect(res.result.user).to.exist();
        expect(res.result.user.email).to.equal(testUsers[1].email);

        const user = await User.findOne({ email: res.result.user.email });
        expect(user).not.to.be.null();
        expect(user.email).to.equal(testUsers[1].email);
      });
    });

    describe("Missing name", () => {
      it("Doesn't create the user and throws a 400 error", async () => {
        const preUsers = await User.countDocuments({});
        const { name } = testUsers[1];
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: { name },
        });

        expect(res.statusCode).to.equal(400);
        expect(res.result.user).not.to.exist();

        const postUsers = await User.countDocuments({});
        expect(preUsers).to.equal(postUsers);
      });
    });
    describe("Invalid name", () => {
      it("Doesn't create the user and throws a 400 error", async () => {
        const preUsers = await User.countDocuments({});
        testUsers[1].name = "la";
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: testUsers[1],
        });

        expect(res.statusCode).to.equal(400);
        expect(res.result.user).not.to.exist();

        const postUsers = await User.countDocuments({});
        expect(preUsers).to.equal(postUsers);
      });
    });
    describe("Invalid email", () => {
      it("Doesn't create the user and throws a 400 error", async () => {
        const preUsers = await User.countDocuments({});
        testUsers[1].email = "this is not an email";
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: testUsers[1],
        });

        expect(res.statusCode).to.equal(400);
        expect(res.result.user).not.to.exist();

        const postUsers = await User.countDocuments({});
        expect(preUsers).to.equal(postUsers);
      });
    });
    describe("Duplicated email", () => {
      it("Doesn't create the user and throws a 400 error", async () => {
        const preUsers = await User.countDocuments({});
        const { name, email } = testUsers[0];
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: { name, email },
        });

        expect(res.statusCode).to.equal(409);
        expect(res.result.user).not.to.exist();

        const postUsers = await User.countDocuments({});
        expect(preUsers).to.equal(postUsers);
      });
    });
    describe("Unexpected payload", () => {
      it("Doesn't create the user and throws a 400 error", async () => {
        const preUsers = await User.countDocuments({});
        testUsers[1].score = 200;
        const res = await server.inject({
          method: "POST",
          url: "/users",
          payload: testUsers[1],
        });

        expect(res.statusCode).to.equal(400);
        expect(res.result.user).not.to.exist();

        const postUsers = await User.countDocuments({});
        expect(preUsers).to.equal(postUsers);
      });
    });
  });
});
