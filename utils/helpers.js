"use strict";

const { NODE_ENV: env } = process.env;

module.exports = {
  is: (environment) =>
    Array.isArray(environment)
      ? environment.includes(env)
      : env === environment,
};
