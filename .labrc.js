"use strict";

const watch = process.env.WATCH === "true" || process.env.DEBUG;
const report = process.env.REPORT === "true";

const options = {
  coverage: !watch,
  "coverage-all": !watch,
  leaks: true,
  threshold: watch ? undefined : 80,
  verbose: !watch && !report,
  silence: watch || report,
  environment: "test",
  colors: true,
  lint: true,
};

if (!watch) {
  options.reporter = ["lcov", "html", "console"];
  options.output = ["./coverage/lcov.info", "./coverage/report.html", "stdout"];
}

if (report) {
  options.reporter.pop();
  options.output.pop();
}

module.exports = options;
