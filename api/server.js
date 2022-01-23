"use strict";

const Glue = require("@hapi/glue");

require("@env")();
const Manifest = require("@manifest");

const options = {
  relativeTo: __dirname,
};

exports.start = async () => {
  const server = await Glue.compose(Manifest, options);
  await server.start();

  server.log(
    ["info", "server"],
    `Server being hapi at port ${Manifest.server.port}`
  );
};

exports.init = async () => {
  const server = await Glue.compose(Manifest, options);
  await server.initialize();

  return server;
};

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: ", p, " reason: ", reason);
  process.exit(1);
});
