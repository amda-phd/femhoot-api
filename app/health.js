"use strict";

module.exports = class App extends require("@appFactory") {
  ping() {
    return {
      response: { ping: "pong" },
      code: 200,
    };
  }

  async _wrapper(func) {
    try {
      return await func;
    } catch (error) {
      this.logger("error", error);
      return false;
    }
  }

  async _mongo() {
    if (!this.mongo || !this.mongo("Health")) throw Error();

    await this.mongo("Health").deleteMany();
    const health = await this.mongo("Health").create({});

    return !!health;
  }

  async check({ query }) {
    if (query.mongo) query.mongo = await this._wrapper(this._mongo());

    return { response: query, code: 200 };
  }
};
