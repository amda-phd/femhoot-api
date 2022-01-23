# hapi REST API boilerplate

This API has been created using [amda's](https://github.com/amda-phd) basic boilerplate, which includes:

- Project structure developed on the hapi environment.
- Queryable `/health` route.
- Basic validation via `Joi`.
- Unit testing suite via `Lab`.
- Routes documentation via `hapi-swagger`. Access to the documentation will require basic auth if `SWAGGER_USER` and `SWAGGER_PASSWORD` are provided as environment variables.
- Styling and linting according to `eslint:recommended` and `@hapi/recommended`.
- Git hooks via `husky` including:
  - `pre-commit` lint, prettier and create TODOs report.
  - `pre-push` runs all tests.

## Folder structure

- `api/` Contains the elements required for the server construction, like **manifest**, **routing** and environment setters.
  - `plugins/` hapi-ready custom made plugins ready to be included in the **manifest**.
  - `routes/` Endopoint routes written in a hapi plugin fashion. They are meant to be automatically loaded by the `router` method, producing endopints that will reproduce this folder's hierarchy.
  - `validators/` `Joi` validators meant to be reused across the app. They are meant to be detected and loaded into `server.app.validators` by the `validator-loader` plugin.
- `config/` Holds the `.env` files that will be meant to feed the `env` method on server startup. This folder is _gitignored_.
- `app/` Contains constructor classes designed to extract data and methods from the database models in order to create new `server.methods` that will be assigned to each endpoint handler to implement the required action. These files are meant to be processed by the `app-wrapper` plugin. This folder is expected to mimic the hierarchy of `api/routes`.
- `db/` Contains any method designed to interact with `Mongoose` or the MongoDB.
  - `models/` Contains `Mongoose` models ready to be directly injected the serverby the `model-loader` plugin for them to be extracted via the method `server.methods.model.mongo('Name of the model')`.
- `test/` Unit tests ready to be used by the `lab` hapi module. This folder's structure is expected to mimic `api/routes`.
- `utils/` Meant to hold helper methods and other general resources that for some reason, aren't meant to be loaded as plugins or to be considered _per se_ as part of the api.

## Server start up

With this structure, the flux of processes when starting up the server, as defined by `manifest`, is as follows:

### Register

1. Create general helper methods through the `helpers` plugin.
2. Load all the `Joi` validation schemas into `server.app.validators` with the custom plugin `validator-loader`. This needs to be done before loading the database models because some of the validation schemas are used as part of the definition of the `Mongoose` schemas.
3. Connect to a database though a specific plugin and load the models contained in its `/models` folder for them to be accessed through the `server.methods.model` methods.
   1. `MongoDB` connects via `hapi-mongoose` and saves the `Mongoose` instance in the server object (`server.plugins["hapi-mongoose"].lib`).
   2. `Redis` connects the number of desired databases using `hapi-redis2` and creates pseudo-models with specific families of methods to intereact with each database.
   3. `SQL` produces a `sequelize` instance and exposes it in the server. Then adds any model containeed in the `/models` folder to `server.methods.model.sql`.
4. The `boomer` custom plugin takes care of several error-related functionalities:
   1. Create the toolkit decorator `h.throw`. This decorator simplifies the catching and returning of errors, as we will see in the next steps. It also wrapps the following functionalities.
   2. Logs the complete error in console for further inspection.
   3. Creates `server.methods.translateError`, a method that gets the request and the error produced while processing it and returns a processed and translated error message, ready to be shown at the frontend.
   4. Analyzes the error to determine its procedence and uses `Boom` to convert it into a HTTP error.
5. The `app-wrapper` custom plugin takes care of the integration of the functional logic that will connect each endpoint's request with the database models. It has several functions:
   1. Recursively scan the `app/` folder and extract all the methods defined by the constructors saved in it.
   2. Wrapp each found method in an asyncronous `try/catch` block that ensures automatic error catching and throwing (using the `h.throw` decorator previously created) without needing to include this kind of logic in every single method written for `app/`.
   3. Each newly wrapped method will be renamed for further server access following this logic: `server.methods[${parentClass}][${originalMethodName}${subClass}]`. This means that:
      - The method `find` contained in the class `User` (stored as `app/user/root.js`) will be stored and called as `server.methods.User.find`.
      - The method `find` contained in the class `Me` (stored as `app/user/me.js`), chich is a 'child' of the `User` class (in the sense that it inherits part of its methodology) will be stored and called as `server.methods.User.findMe`.
      - The methods starting with `_` will be considered as private and designed for internal use, so they won't be exposed to be implemented as handles.
6. Define a default authentication bearer strategy that will be applied to most of the public API routes. The plugin `auth-token` needs to be loaded after `app-wrapper` because it uses one of the methods created by it to validate the authentication.
7. Configure a handful of security plugins such as:
   1. `hapi-rate-limitor`: Prevents brute-forcing by blocking the server if a threashold of requests is reached in a period of time. This plugin allows extra protection for specific routes, and we use it with more restrictive conditions in `POST /auth`.
   2. `@hapi/crumb`: Produces anti-CSRF tokens for all the REST routes that aren't GET. Ignored for the documentation test routes.
   3. `blankie`: Restrict security headers.
   4. `disinfect`: Escapes payload, query and params to prevent any pollution from reaching the database.
8. **IF logs are requested or we are not in a testing environment** `hapi-pino` and other necessary plugins will be loaded. **BEWARE**: this step is NOT related with the storing of logs in an external MongoDB. As mentioned before, a specific NPM script needs to be loaded in order to save the logs.
9. **IF we are not in testing or production environments** the plugin `hapi-swagger` will create a `/documentation` endpoint that will contain all the information stored in each route's `hapi-swagger` options. Two custom helper plugins complement this functionality:
   1. `swagger-responses` creates and stores in server some frequently used response structures. Also creates `server.methods.errorSchema`, that wrapps a custom `Boom` error as a `Joi` schema and offers it as response example.
   2. `swagger-auth` creates a basic `username/password` authentication strategy that, if `SWAGGER_USER` and `SWAGGER_PASSWORD` environment variables exist, will be required to access the Swagger-powered documentation.
   3. The bearer token authentication is also requested and offered via the `securityDefinitions` option for `hapi-swagger` (no extra custom plugin is required for this).
10. **IF we are in a testing environment** the `db-fixtures` custom plugin will take care of the data and methods used during the tests:
    1. Create the mock data and the `server.methods.getAsset` method to access it from the very same server, without need to require anything during the tests.
    2. The `server.methods.setupDatabase` that clears all the testing collections and fills them with the mocked data. This method is meant to be used `beforeEach` new test.
    3. Other useful methods that might be needed during testing, like an asyncronous timeout that allows waiting before testing some endpoints.
11. Load all the API's endpoints contained in `api/routes`, reproducing the folder and sub-folder structure in the routing. Each of these route packages is meant to be saved as a custom hapi plugin for the `@router` method to extract and include them in the `manifest`. This `@router` method might become a standalone npm package in the future.

### Settings

- The `manifest` contains several security settings, defined under the `routes` and `load` fields. They control CORS, output escaping, maximum payload size and heap usage.
- To ensure that validation errors produced by the endpoint's `JOI` validators are processed and translated using the `translateError` method, just like the response errors processed by the `boomer` plugin. The reason for this is that validation errors don't even make it to the route's handler, so they don't reach the `h.throw` decorator. They need to be processed before, at the `failAction` point.
- The `app` field takes the internal app information contained in `@settings` and incorporates it into `server.app` for easier use accross the app.

## Request lifecycle

Once the server is up and running, a request to any of its endpoints will go through the following steps.

1. **Authentication** (unless `auth` is declared as `false` in the route definition). The default authentication strategy is the bearer token strategy which is implemented by the `authenticate` method of the `Auth` app class. This method extracts the token from the request headers and uses the `Auth` model static method `authenticate` to check its vericity and retrieve the user's credentials and **scoping** to determine the user's current permissions.
2. **Validation**. Each route will validate `headers`, `params`, `query` and/or `payload` against a `Joi` validation schema. If this validation fails, a `failAction` will be thrown before the request reaches the handler. This `failAction` is processed and _boomfied_ via a server option defined at `manifest`.
3. **Handler**. If the request reaches the route's handler, it will be pipped into one of the server methods created by the `app-wrapper` plugin. The wrapping will take care of the error catching, processing and translation (if needed) and the original method (as defined in the contructor classes contained in `app/`) will handle the product logic, the connections to the required database collections and the use of the models' statics and methods.

## Testing features

All tests are meant to be saved in the `test/` folder. The `lab` module will scan that folder recursively an run the tests contained in each `*.test.js` file. The `lab` settings are stored in `.labrc.js`. This file exports the testing settings depending on the `WATCH` environment variable, that can be injected before running up the tests.

With this, we consider several possible ways to run the tests:

- `npm run test` Complete test swap. This is the script that `husky` invoques before pushing any commits. `WATCH` will be falsy in this case, meaning that the coverage threshold will be set to 90% and the report will be detailed. This script will also save coverage reports in the `/coverage` folder. The resulting `lcov.info` file can be fed to the [Coverage Gutters](https://marketplace.visualstudio.com/items?itemName=ryanluker.vscode-coverage-gutters) VSCode extension to get visual aid to spot lines of code missed by the tests.
- `npm run watch:test` A custom solution to run tests in a watch mode using `nodemon`. In this case the `WATCH` variable will be injected as `true`, resulting in a silent run that won't consider coverage. This watch mode is useful to make sure that tests remain stable as we change things in the app or the tests.
- VSCode Debugger: Two VSC debugging routines ('All tests' and 'Current test file') have been defined in `launch.json` in order to debug tests. Using the `.only` method is recommended when a single test wants to be debugged.

## Databases

### MongoDB

Settings ready to connect with a MongoDB database via Mongoose.

- `Mongoose` is pipped directly into the server via `hapi-mongoose`. **Beware**: MongoDB connection parameters must be provided via environment variables. The possible combinations to make it work are:
  - `MONGO_URL`: Single uri containing all the connections settings.
  - `MONGO_HOST`, `MONGO_PORT` and `MONGO_NAME`: Provide the parameters to produce the uri and the name of the database (Mongo instance) that will be connected. Suitable for _dev_ and _local_ environments.
  - `MONGO_USER`, `MONGO_PASSWORD` and `MONGO_CLUSTER`: Provide an external cluster and its credentials.
- All the models contained in the db/models folder are loaded on server startup. Suitable for _prod_ environments.
- All the requests to the API logs can be saved to a MongoDB collection via `pino-mongodb`. The logs collection doesn't necesarily have to be in the same instance as the models. In fact, the load to the database will be better distributed if a different instance of Mongo is used.
  - **Beware**: `MONGO_LOG_URI` and `MONGO_LOG_COLLECTION` must be provided as environment variables when invoking `npm run start:log`.
  - Local version of this function works on very generic local database name and collection. Try it on `npm run start:log:local`.

### Redis

- `ioredis` connects to the Redis databases via `hapi-redis2`. The provided parameters can be:
  - `REDIS_URL`: Single url containing the connection to the 0 instance of a Redis database.
  - `REDIS_PORT`and `REDIS_HOST`: If provided instead of `REDIS_URL` they will be used to create the url.
  - `REDIS_USER`: If needed to construct the connection url.
  - `REDIS_PASSWORD`: If needed to access the database.
- The list `databases` contains the names that will be assigned to each Redis (numeric) database using:
  - Even numbers for local and development.
  - Odd numbers as testing databases.
  - 0-1 will be reserved as cache for the `hapi-rate-limitor`plugin.
- The class `RedisModel` will produce a extendable new family of methods to interact with each new Redis client in a more friendly manner. General methods will be stored in `RedisModel` and specific methods, if needed, will extend that class and will be stored in `/redis/models`.

### SQL

- A `Sequelize` instance is created and exposed in the server. It accepts as connection parameters:
  - `SQL_DIALECT`: Only SQL dialects accepted by Sequelize will be admited. Remember that `sqlite` dialect will expect a database route.
  - `SQL_ROUTE`: If the dialect of choice is `sqlite` (very useful for local environments), this parameter needs to be provided. It will contain the absolute route where the SQLite databases are stored.
  - `SQL_NAME`: Required to access the exact database within the provided location, no matter the dialect.
  - `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`: Provide this in case the SQL dialect requires host and credentials to be accessed.
- The Sequelize models are loaded into the server just like the ones from Mongoose, by scanning whatever model saved in `/sql/models`.
