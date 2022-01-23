"use strict";

module.exports = (server, name) => {
  const db = server.plugins["hapi-mongoose"].connection;
  const mongoose = server.plugins["hapi-mongoose"].lib;
  const Joigoose = require("joigoose")(mongoose);

  const { post } = server.plugins.validators.user;

  const schema = new mongoose.Schema(Joigoose.convert(post));
  schema.path("email").index({ unique: true });
  schema.add({
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
  });

  return db.model(name, schema);
};
