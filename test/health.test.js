"use strict";

require("module-alias/register");
const Lab = require("@hapi/lab");
const { expect } = require("@hapi/code");

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script());

const { init } = require("@server");

describe("Health checks", () => {
  let server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe("GET /ping", () => {
    it("pongs", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/ping",
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal({ ping: "pong" });
    });
  });

  describe("GET /health", () => {
    it("Returns empty object when called without query", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/health",
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.api).not.to.exist();
    });

    describe("?api=true", () => {
      it("Checks only the API's status", async () => {
        const res = await server.inject({
          method: "GET",
          url: "/health?api=true",
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result.api).to.be.true();
      });

      describe("&mongo=true", () => {
        it("Checks that an active MongoDB's is reachable and editable", async () => {
          const res = await server.inject({
            method: "GET",
            url: "/health?api=true&mongo=true",
          });
          expect(res.statusCode).to.equal(200);
          expect(res.result.mongo).to.be.true();

          const Health = server.methods.model.mongo("Health");
          const health = await Health.find({});
          expect(health).to.have.length(1);
          expect(health[0].isHealthy).to.be.true();
        });
      });

      it("Flags the MongoDB as 'off' if it's not reachable", async () => {
        delete server.plugins["hapi-mongoose"];
        const res = await server.inject({
          method: "GET",
          url: "/health?api=true&mongo=true",
        });
        expect(res.statusCode).to.equal(200);
        expect(res.result.mongo).to.be.false();
      });
    });

    describe("Unexpected query", () => {
      it("Returns bad request", async () => {
        const res = await server.inject({
          method: "GET",
          url: "/health?caca=true",
        });
        expect(res.statusCode).to.equal(400);
        expect(res.result.api).not.to.exist();
      });
    });
  });
});
