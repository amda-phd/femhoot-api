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
      },
    },
    {
      method: "GET",
      path: "/",
      handler: get10,
      options: {
        tags: ["api", "cards"],
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
