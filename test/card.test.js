"use strict";

require("module-alias/register");
const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script());

const { init } = require("@server");

describe("Cards /cards", () => {
  let server;
  let User;
  let Card;
  let testUsers;
  let testCards;
  let testTokens;

  beforeEach(async () => {
    server = await init();
    User = server.methods.model.mongo("User");
    Card = server.methods.model.mongo("Card");
    testUsers = server.methods.getAsset("User");
    testCards = server.methods.getAsset("Card");
    testTokens = server.methods.getAsset("Token");
    await server.methods.setUpDatabase();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("POST with", () => {
    describe("Expected parameters", () => {
      it("Creates a new card in the database", async () => {
        const res = await server.inject({
          method: "POST",
          url: "/cards",
          payload: testCards[1],
          headers: { authorization: testTokens[0] },
        });

        expect(res.statusCode).to.equal(201);
        expect(res.result.card).to.exist();

        const card = await Card.findById(res.result.card._id);
        expect(card).not.to.be.null();
        expect(card.creator.toString()).to.equal(testUsers[0]._id);
      });
    });
  });

  describe("GET", () => {
    it("Gets a maximum of ten cards without showing the wight answer", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/cards",
        headers: { authorization: testTokens[0] },
      });

      expect(res.statusCode).to.equal(200);
      expect(res.result.cards).to.exist();
      expect(res.result.cards).to.have.length(1);
      expect(JSON.parse(res.payload).cards[0].rightAnswer).not.to.exist();
    });
  });

  describe("Play with PUT /{id}", () => {
    describe("Same user as creator", () => {
      it("Doesn't add points to the user's score", async () => {
        const { _id } = testUsers[2];
        const { rightAnswer } = testCards[0];
        const { score: preScore } = await User.findById(_id);

        const res = await server.inject({
          method: "PUT",
          url: `/cards/${testCards[0]._id}`,
          headers: { authorization: testTokens[1] },
          payload: { rightAnswer },
        });

        expect(res.statusCode).to.equal(200);
        const { score: postScore } = await User.findById(_id);
        expect(preScore).to.equal(postScore);
      });
    });
    describe("Right answer", () => {
      it("Congrats and add 10 points to the winner's score", async () => {
        const { _id } = testUsers[0];
        const { rightAnswer } = testCards[0];
        const { score: preScore } = await User.findById(_id);

        const res = await server.inject({
          method: "PUT",
          url: `/cards/${testCards[0]._id}`,
          headers: { authorization: testTokens[0] },
          payload: { rightAnswer },
        });

        expect(res.statusCode).to.equal(200);
        expect(res.result.message).to.contain("CONGRATS");

        const { score: postScore } = await User.findById(_id);
        expect(preScore).to.be.below(postScore);
      });
    });
    describe("Wrong answer", () => {
      it("Doesn't change the user's score", async () => {
        const { _id } = testUsers[0];
        const { rightAnswer } = testCards[0];
        const { score: preScore } = await User.findById(_id);

        const res = await server.inject({
          method: "PUT",
          url: `/cards/${testCards[0]._id}`,
          headers: { authorization: testTokens[0] },
          payload: { rightAnswer: rightAnswer - 1 },
        });

        expect(res.statusCode).to.equal(200);
        expect(res.result.message).not.to.contain("CONGRATS");

        const { score: postScore } = await User.findById(_id);
        expect(preScore).to.equal(postScore);
      });
    });
  });
});
