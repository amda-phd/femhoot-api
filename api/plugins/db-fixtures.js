"use strict";

const register = (server) => {
  const { sign } = require("jsonwebtoken");

  const { headers } = server.settings.app;
  const mongoose = server.plugins["hapi-mongoose"].lib;
  const { Types } = mongoose;

  const user0Id = new Types.ObjectId().toString();
  const user2Id = new Types.ObjectId().toString();
  const card0Id = new Types.ObjectId().toString();

  class Headers {
    constructor(crumb) {
      this[headers.csrf] = crumb;
      this.cookie = `crumb=${crumb}`;
    }

    auth(token) {
      this[headers.auth] = token;
    }

    language(language) {
      this[headers.language] = language;
    }

    unCrumb() {
      delete this[headers.csrf];
      delete this.cookie;
    }
  }

  const assets = {
    User: [
      {
        _id: user0Id,
        email: "tester00@test.com",
        name: "Tester00",
      },
      {
        email: "tester01@test.com",
        name: "Tester01",
      },
      {
        _id: user2Id,
        email: "tester02@test.com",
        name: "Tester02",
      },
    ],
    Token: [
      `Bearer ${sign({ _id: user0Id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP,
      })}`,
      `Bearer ${sign({ _id: user2Id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP,
      })}`,
    ],
    Card: [
      {
        _id: card0Id,
        question: "how old are you?",
        possibleAnswers: [
          "asrfwedfasf",
          "arfwefewvew",
          "aweqfgressaa",
          "wqgrwgsadwfwe",
        ],
        rightAnswer: 2,
        creator: user2Id,
      },
      {
        question: "where are you from?",
        possibleAnswers: [
          "asrfwedfasf",
          "arfwefewvew",
          "aweqfgressaa",
          "wqgrwgsadwfwe",
        ],
        rightAnswer: 4,
      },
    ],
  };

  const getAsset = (collection = "User", index) =>
    typeof index === "number" && index < assets[collection].length
      ? assets[collection][index]
      : assets[collection];

  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const setUpMongo = async () => {
    for (const Model in assets) {
      if (Model !== "Token")
        await server.methods.model.mongo(Model).deleteMany();
      for (const asset of assets[Model]) {
        if (asset._id) await server.methods.model.mongo(Model).create(asset);
      }
    }
  };

  server.method("getAsset", getAsset);
  server.method("timeout", timeout);
  server.method("setUpDatabase", async () => {
    await setUpMongo();
  });
  server.method("setupMongo", setUpMongo);
  server.method("makeHeaders", (crumb = "mocked_crumb") => new Headers(crumb));

  return server;
};

exports.plugin = {
  register,
  name: "db-fixtures",
  description:
    "Creates database fixtures for testing and methods to load them on each test. This plugin is only meant to be loaded on test environments.",
  version: require("@pack").version,
  once: true,
};
