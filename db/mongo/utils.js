"use strict";

const Path = require("path");
const { readdirSync } = require("fs");
const { startCase } = require("lodash");

const uri = () => {
  const {
    MONGO_URL,
    MONGO_NAME,
    MONGO_PORT,
    MONGO_HOST,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
  } = process.env;
  const slug = "mongodb";
  const query = "?retryWrites=true&w=majority";

  if (MONGO_URL) return MONGO_URL;
  if (!MONGO_NAME) return;
  if (MONGO_HOST && MONGO_NAME)
    return `${slug}://${MONGO_HOST}:${MONGO_PORT}/${MONGO_NAME}${query}`;
  if (MONGO_USER && MONGO_PASSWORD && MONGO_CLUSTER)
    return `${slug}+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.mongodb.net/${MONGO_NAME}${query}`;
  return;
};

const loadModels = (server) => {
  const files = readdirSync(Path.join(__dirname, "models"));
  const models = {};

  files.forEach((file) => {
    const fileName = file.split(".")[0];
    const modelName = startCase(fileName);
    models[modelName] = require(`Mongo/${fileName}`)(server, modelName);
  });

  return models;
};

module.exports = { uri, loadModels };
