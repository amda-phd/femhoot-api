"use strict";

const Path = require("path");
const { readdirSync } = require("fs");
const { startCase } = require("lodash");

const register = (server, options) => {
  const { parent = "app", noPathNames = ["root"] } = options;
  const routes = readdirSync(Path.join(__dirname, "../../", parent), {
    withFileTypes: true,
  });

  routes.forEach((route) => {
    // Analyze the new route to decide what to do with it depending on it being a file or a folder
    const parts = route.name.split(".");
    const subName =
      noPathNames.includes(parts[0]) || !parent.includes("/")
        ? ""
        : startCase(parts[0]);
    const preName = parent.includes("/")
      ? startCase(parent.split("/")[parent.split("/").length - 1])
      : startCase(parts[0]);

    // If we've found a file, make sure that it contains a hapi plugin with register
    const isJS = route.isFile() && parts[parts.length - 1] === "js";
    let isValid = isJS;
    let App;
    let app;

    if (isJS) {
      const finalRoute = Path.join("../../", parent, route.name);
      try {
        App = require(Path.resolve(__dirname, finalRoute));
        app = new App(server);
      } catch (e) {
        isValid = false;
        server.log(
          ["warn", "server"],
          `[/app/${route.name}] doesn't seem to contain a valid App class to create methods with. Whatever was contained in it hasn't been loaded as a server method.`
        );
      }
    }

    if (route.isDirectory()) {
      register(server, { ...options, parent: `${parent}/${route.name}` });
    } else if (isValid) {
      Object.getOwnPropertyNames(Object.getPrototypeOf(app)).forEach(
        (method) => {
          if (method !== "constructor" && method[0] !== "_") {
            const methodName = `${preName}.${method}${subName}`;
            server.method(methodName, async (input, h) => {
              try {
                const { response, code, credentials } = await app[method](
                  input
                );
                if (credentials) return h.authenticated({ credentials });
                return h.response(response).code(code);
              } catch (error) {
                return h.throw(h.request, error);
              }
            });
          }
        }
      );
    }
  });
};

exports.plugin = {
  register,
  name: "app-wrapper",
  description:
    "Scans the /app folder and adds all the methods contained in its classes to server.methods. Wraps each new method asyncronously so that every error is automatically caught and thrown through the h.throw decoration created by the boomer plugin.",
  version: require("@pack").version,
  once: true,
};
