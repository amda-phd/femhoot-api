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
        description: "Create a new user. Without one, you cannot play!",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses("basic"),
              201: {
                description: "User created",
                schema: user.instance,
              },
              400: {
                description: "Invalid email or name, user not created",
                schema: server.methods.errorSchema("badRequest"),
              },
              409: {
                description: "Duplicated email, user not created",
                schema: server.methods.errorSchema("conflict"),
              },
            },
          },
        },
      },
    },
    {
      method: "GET",
      path: "/{id}",
      handler: get,
      options: {
        tags: ["api", "user"],
        validate: { params: user.id },
        description: "Gets user profile. Anyone can see other user's profiles",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(["401", "404", "500"], "User"),
              200: {
                description: "User found and served",
                schema: user.instance,
              },
            },
          },
        },
      },
    },
    {
      method: "PATCH",
      path: "/{id}",
      handler: patch,
      options: {
        tags: ["api", "user"],
        validate: { payload: user.patch, params: user.id },
        description:
          "Edit user profile. Beware! You can only edit your profile.",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(
                ["401", "403", "404", "500"],
                "User"
              ),
              200: {
                description: "User found and modified",
                schema: user.instance,
              },
              400: {
                description: "Invalid edition parameters",
                schema: server.methods.errorSchema("badRequest"),
              },
            },
          },
        },
      },
    },
    {
      method: "DELETE",
      path: "/{id}",
      handler: server.methods.User.delete,
      options: {
        tags: ["api", "user"],
        validate: { params: user.id },
        description: "Delete user profile. You can only delete your profile",
        plugins: {
          "hapi-swagger": {
            responses: {
              ...server.methods.swaggerResponses(
                ["401", "403", "404", "500"],
                "User"
              ),
              204: {
                description: "User found removed",
                schema: user.instance,
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
  name: "User routes",
  version: require("@pack").version,
  once: true,
};
