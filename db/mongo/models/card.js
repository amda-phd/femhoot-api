"use strict";

module.exports = (server, name) => {
  const db = server.plugins["hapi-mongoose"].connection;
  const mongoose = server.plugins["hapi-mongoose"].lib;
  const Joigoose = require("joigoose")(mongoose);

  const { post } = server.plugins.validators.card;

  const schema = new mongoose.Schema(Joigoose.convert(post));
  schema.add({
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  });

  schema.options.toJSON = {
    transform: function (doc, ret, options) {
      delete ret.rightAnswer;
      delete ret.creator;

      return ret;
    },
  };

  return db.model(name, schema);
};
