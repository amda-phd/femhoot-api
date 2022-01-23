"use strict";

const Boom = require("@hapi/boom");

const Pack = require("@pack");
const TranslateError = require("Utils/translateError");
const { is } = require("@helpers");
const { app } = require("@settings");

const {
  HAPI_PORT: port,
  HAPI_HOST: host,
  LOG,
  SWAGGER_USER,
  SWAGGER_PASSWORD,
  WATCH,
  MAX_BYTES: maxBytes,
  SAMPLE_INTERVAL: sampleInterval = 0,
  MAX_HEAP_USED_BYTES: maxHeapUsedBytes,
  MAX_RSS_BYTES: maxRssBytes,
  MAX_EVENT_LOOP_DELAY: maxEventLoopDelay,
} = process.env;

const url = `http://${host}:${port}`;
const log = !!LOG || is("prod");
const watch = WATCH === "true";

// Plugins that will be used no matter the environment
let plugins = [
  require("Plugins/helpers"),
  require("Plugins/validators"),
  require("Plugins/mongo"),
  require("Plugins/boomer"),
  require("Plugins/swagger-responses"),
  require("Plugins/app-wrapper"),

  // SECURITY PLUGINS
  require("@hapi/scooter"),
  {
    plugin: require("blankie"),
    options: {
      defaultSrc: "self",
      scriptSrc: "self",
      frameAncestors: "none",
      imgSrc: "self",
      styleSrc: "none",
    },
  },
  {
    plugin: require("disinfect"),
    options: {
      disinfectQuery: true,
      disinfectParams: true,
      disinfectPayload: true,
    },
  },
];

if (!is("test")) {
  // Avoid logs during testing (because it's impossible to read anything with all the errors on)
  const logEvents = ["error", "load"];
  if (!watch) logEvents.push("onPostStart", "onPostStop");
  if (is("prod")) logEvents.push("response", "request-error");

  plugins = [
    {
      plugin: require("hapi-pino"),
      options: {
        transport: log ? undefined : { target: "pino-pretty" },
        redact: log
          ? []
          : {
              paths: ["tags"],
              remove: true,
            },
        mergeHapiLogData: true,
        logEvents,
        ignoreFunc: (options, request) =>
          request.path.startsWith("/swagger") ||
          request.path.includes(app.documentation.path),
      },
    },
    require("@hapi/inert"),
    require("@hapi/vision"),
  ].concat(plugins);

  // Prevent documentation to be created and loaded in production and testing enviornments. Also, in the environments where documentation is accesible, simple authentication will be required in order to view it.
  if (!is("prod")) {
    plugins = plugins.concat([
      require("@hapi/basic"),
      require("Plugins/swagger-auth"),
      {
        plugin: require("hapi-swagger"),
        options: {
          info: {
            title: `${Pack.name} Documentation`,
            description: Pack.description,
            version: Pack.version,
          },
          auth: SWAGGER_USER && SWAGGER_PASSWORD ? "swagger" : undefined,
          securityDefinitions: {
            jwt: {
              type: "apiKey",
              name: app.headers.auth,
              in: "header",
            },
          },
          security: [{ jwt: [] }],
          pathPrefixSize: 2,
          documentationPath: app.documentation.path || undefined,
          documentationRoutePlugins: {
            blankie: false,
          },
        },
      },
    ]);
  }
} else {
  // Database fixtures will only be loaded and used during tests, so it doesn't make sense to load this kind of information for any other environment.
  plugins.push(require("Plugins/db-fixtures"));
}

// Load all the routes after everything else
plugins.push({
  plugin: require("Plugins/router"),
  options: {
    noPathNames: ["health"],
  },
});

module.exports = {
  server: {
    port,
    host,
    app,
    debug:
      // Log Debug messages for debugger and tests when logging is requested
      is("test") && !log
        ? false
        : {
            log: ["error"],
            request: ["error"],
          },
    routes: {
      // Return validation err.message to inform the user of what's expected from their request. This message can be customized in the schema construction.
      validate: {
        failAction: (request, h, error) =>
          Boom.badRequest(TranslateError(request, error)),
      },
      // SECURITY SETTINGS
      // Set a default payload maximum size (can be changed on specific routes) and include error translation for the resulting error.
      payload: {
        maxBytes,
        failAction: (request, h, error) =>
          Boom.entityTooLarge(TranslateError(request, error)),
      },
      // Tune this as the app develops to accomodate its prod and dev reality
      cors: {
        origin: is(["prod", "dev"]) ? ["ignore"] : ["*"],
        credentials: true,
        additionalHeaders: Object.values(app.headers),
      },
      // Call Hoek.jsonEscape() automatically
      json: {
        escape: true,
      },
      security: true,
    },
    // Define load limits in order to reject requests if the server is working at its maximum capacity. Throws 503 and logs events with 'load' tag.
    load: {
      sampleInterval,
      maxHeapUsedBytes,
      maxRssBytes,
      maxEventLoopDelay,
    },
  },
  register: { plugins },
};
