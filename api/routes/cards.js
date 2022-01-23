"use strict";

const register = (server, options) => {
  const { card } = server.plugins.validators;
  const { post, get10, play } = server.methods.Card;

  server.route([
    {
      method: "POST",
      path: "/",
      handler: post,
      options: {
        tags: ["api", "cards"],
        validate: { payload: card.post },
        description: "Create a new card for all the users to play",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["401", "500"]),
              201: {
                description: "Card created",
                // schema: user.instance,
              },
              400: {
                description: "Invalid creation parameters",
                schema: server.methods.errorSchema("badRequest"),
              },
            },
          },
        },
      },
    },
    {
      method: "GET",
      path: "/",
      handler: get10,
      options: {
        tags: ["api", "cards"],
        description: "Get ten cards to play",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["401", "500"]),
              200: {
                description: "Cards found and served",
                // schema: user.instance,
              },
            },
          },
        },
      },
    },
    {
      method: "PUT",
      path: "/{id}",
      handler: play,
      options: {
        tags: ["api", "cards"],
        validate: {
          payload: card.rightAnswer,
          params: card.id,
        },
        description: "Try and answer one question",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["401", "404", "500"], "Card"),
              200: {
                description: "Answer processed",
                // schema: user.instance,
              },
              400: {
                description: "Invalid answer parameters",
                schema: server.methods.errorSchema("badRequest"),
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
  name: "Card routes",
  version: require("@pack").version,
  once: true,
};
