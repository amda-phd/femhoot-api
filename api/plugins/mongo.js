"use strict";

const { uri: mongoUri, loadModels } = require("@mongo");

const register = async (server) => {
  const uri = mongoUri();
  if (!uri) return;

  await server.register({
    plugin: require("hapi-mongoose"),
    options: {
      promises: "native",
      uri,
      mongooseOptions: {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      },
    },
  });

  loadModels(server);
  server.method(
    "model.mongo",
    (model) => server.plugins["hapi-mongoose"].connection.models[model]
  );
  server.log(["info", "database", "mongo"], "MongoDB models loaded");
};

exports.plugin = {
  register,
  name: "mongo",
  description:
    "Creates MongoDB client connection through hapi-mongoose and uses loadModels method to scan the /mongo/models folder so they can be accessed through server.methods.model.mongos(modelName) for further use.",
  version: require("@pack").version,
  once: true,
};
