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

  describe("GET with", () => {
    describe("With correct userId", () => {
      it("Fetches the user", async () => {
        const { _id } = testUsers[0];
        const res = await server.inject({
          method: "GET",
          url: `/users/${_id}`,
        });

        expect(res.statusCode).to.equal(200);
        expect(res.result.user._id.toString()).to.equal(_id);
      });
    });

    describe("With non existant userId", () => {
      it("Throws a 404 error", async () => {
        const _id = new server.plugins[
          "hapi-mongoose"
        ].lib.Types.ObjectId().toString();
        const res = await server.inject({
          method: "GET",
          url: `/users/${_id}`,
        });

        expect(res.statusCode).to.equal(404);
        expect(res.result.user).not.to.exist();
      });
    });

    describe("Badly parsed userId", () => {
      it("Throws a 400 error", async () => {
        const res = await server.inject({
          method: "GET",
          url: `/users/holi`,
        });

        expect(res.statusCode).to.equal(400);
        expect(res.result.user).not.to.exist();
      });
    });
  });

  describe("PATCH with", () => {
    describe("With name correctly parsed", () => {
      it("Changes the name and leaves the rest of the fields as they were", async () => {
        const name = "new name!";
        const { _id } = testUsers[0];
        const { name: preName, email: preEmail } = await User.findById(_id);
        const res = await server.inject({
          method: "PATCH",
          url: `/users/${_id}`,
          payload: { name },
        });

        expect(res.statusCode).to.equal(200);
        expect(res.result.user).to.exist();
        expect(res.result.user.name).to.equal(name);

        const { name: postName, email: postEmail } = await User.findById(_id);
        expect(preName).not.to.equal(postName);
        expect(preEmail).to.equal(postEmail);
      });

      describe("And correct email", () => {
        it("Changes both fields", async () => {
          const { _id } = testUsers[0];
          const res = await server.inject({
            method: "PATCH",
            url: `/users/${_id}`,
            payload: testUsers[1],
          });

          expect(res.statusCode).to.equal(200);
          expect(res.result.user.name).to.equal(testUsers[1].name);
          expect(res.result.user.email).to.equal(testUsers[1].email);
        });
      });
    });

    describe("Forbidden score field", () => {
      it("Throws an error and doesn't change the score", async () => {
        const { _id } = testUsers[0];
        const score = 200;
        const { score: preScore } = await User.findById(_id);
        const res = await server.inject({
          method: "PATCH",
          url: `/users/${_id}`,
          payload: { score },
        });

        expect(res.statusCode).to.equal(400);

        const { score: postScore } = await User.findById(_id);
        expect(postScore).to.equal(preScore);
        expect(postScore).not.to.equal(score);
      });
    });
  });

  describe("DELETE with", () => {
    describe("Existing user", () => {
      it("Removes the user's account from the database", async () => {
        const { _id } = testUsers[0];
        const res = await server.inject({
          method: "DELETE",
          url: `/users/${_id}`,
        });

        expect(res.statusCode).to.equal(204);
        expect(res.result).not.to.exist();

        const user = await User.findById(_id);
        expect(user).to.be.null();
      });
    });
  });
});
