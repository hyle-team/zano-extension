const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

const appConfig = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "static/js/app.bundle.js",
  },
};

const backgroundConfig = {
  entry: "./src/background/background.js",
  output: {
    path: path.resolve(__dirname, "build/static/js"),
    filename: "background.bundle.js",
  },
};

const contentConfig = {
  entry: "./src/content/content.js",
  output: {
    path: path.resolve(__dirname, "build/static/js"),
    filename: "content.bundle.js",
  },
};

module.exports = [
  merge(common, appConfig),
  merge(common, backgroundConfig),
  merge(common, contentConfig),
];
