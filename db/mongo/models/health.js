"use strict";

module.exports = (server, name) => {
  const db = server.plugins["hapi-mongoose"].connection;
  const mongoose = server.plugins["hapi-mongoose"].lib;

  const schema = new mongoose.Schema({
    isHealthy: {
      type: Boolean,
      default: true,
    },
  });

  return db.model(name, schema);
};
