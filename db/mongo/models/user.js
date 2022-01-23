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

  schema.methods.toCredentials = function () {
    return { id: this._id };
  };

  schema.methods.increaseScore = async function () {
    const { score } = this;
    return await this.update({ score: score + 10 });
  };

  return db.model(name, schema);
};
