"use strict";

const register = (server, options) => {
  const { health } = server.plugins.validators;
  const { ping, check } = server.methods.Health;
  server.route([
    {
      method: "GET",
      path: "/ping",
      handler: ping,
      options: {
        auth: false,
        tags: ["api", "health", "ping"],
        description: "The simplest check for server availability",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses("basic"),
              200: {
                description: "Success",
                schema: health.ping,
              },
            },
          },
        },
      },
    },
    {
      method: "GET",
      path: "/health",
      handler: check,
      options: {
        auth: false,
        tags: ["api", "health"],
        validate: {
          query: health.health,
        },
        description:
          "Queries for server, Redis, SQL and/or MongoDB health by running a couple of basic requests against the database",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["400", "429", "500", "503"]),
              200: {
                description:
                  "Success (doesn't mean that all the queried databases are healthy, only that the checks were run successfully)",
                schema: health.health,
              },
            },
          },
        },
      },
    },
  ]);
};

exports.plugin = {
  register,
  name: "Health routes",
  version: require("@pack").version,
  once: true,
};
