// webpack.config.js
const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV || "production",
  entry: {
    background: "./src/background.ts",       // service_worker
    content: "./src/content.ts",             // content script
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
