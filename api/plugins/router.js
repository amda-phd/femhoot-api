"use strict";

const { readdirSync } = require("fs");
const Path = require("path");
const { camelCase, join, tail } = require("lodash");

const register = (server, options) => {
  const {
    parent = "routes",
    keepParent = false,
    noPathNames = ["root"],
    globalPrefix,
  } = options;

  const routes = readdirSync(Path.resolve("./api", parent), {
    withFileTypes: true,
  });

  routes.forEach(async (route) => {
    // Analyze the new route to decide what to do with it depending on it being a file or a folder
    const parts = route.name.split(".");

    const newName = route.isFile() ? camelCase(parts[0]) : parts[0];
    const path = noPathNames.includes(newName)
      ? parent
      : `${parent}/${newName}`;

    // If we've found a file, make sure that it contains a hapi plugin with register
    const isJS = route.isFile() && parts[parts.length - 1] === "js";
    let isValid = isJS;
    let plugin;
    if (isJS) {
      const finalRoute = Path.join(parent, route.name);
      plugin = require(Path.resolve("./api", finalRoute));
      isValid = !!plugin.plugin?.register;
    }

    if (route.isDirectory()) {
      register(server, { ...options, parent: path });
    } else if (isValid) {
      // Create the prefix and manipulate it according to the requested options
      let prefix = keepParent ? path : join(tail(path.split("/")), "/");
      prefix = prefix.length > 1 ? "/" + prefix : undefined;
      if (globalPrefix) prefix = `/${globalPrefix}${prefix ? prefix : ""}`;

      await server.register({
        plugin,
        routes: { prefix },
      });
    } else {
      server.log(
        ["warn", "server"],
        `[${route.name}] doesn't seem to contain a valid hapi plugin-like route or set of routes.`
      );
    }
  });
};

exports.plugin = {
  register,
  name: "router",
  description:
    "Load all the API's endpoints contained in `api/routes`, reproducing the folder and sub-folder structure in the routing.",
  version: require("@pack").version,
  once: true,
};
