"use strict";

const register = (server, options) => {
  const { user } = server.plugins.validators;
  const { post, get, patch } = server.methods.User;

  server.route([
    {
      method: "POST",
      path: "/",
      handler: post,
      options: {
        auth: false,
        tags: ["api", "user"],
        validate: { payload: user.post },
      },
    },
    {
      method: "GET",
      path: "/{id}",
      handler: get,
      options: {
        tags: ["api", "user"],
        validate: { params: user.id },
      },
    },
    {
      method: "PATCH",
      path: "/{id}",
      handler: patch,
      options: {
        tags: ["api", "user"],
        validate: { payload: user.patch, params: user.id },
      },
    },
    {
      method: "DELETE",
      path: "/{id}",
      handler: server.methods.User.delete,
      options: {
        tags: ["api", "user"],
        validate: { params: user.id },
      },
    },
  ]);
};

exports.plugin = {
  register,
  name: "User routes",
  version: require("@pack").version,
  once: true,
};
