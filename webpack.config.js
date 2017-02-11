"use strict";
const webpack = require("webpack");
const path = require("path");
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const { CheckerPlugin } = require('awesome-typescript-loader');
//const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
  plugins: [
    //require("webpack-fail-plugin"),
    //new BabiliPlugin({ comments: false }),
    new TsConfigPathsPlugin(/* { tsconfig, compiler } */),
    new CheckerPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        tslint: {
          configuration: require("./tslint.json"),
          emitErrors: false,
          failOnHint: true,
        },
      },
    }),
  ],
  entry: {
    main: "./src/main.ts",
  },
  output: {
    filename: "./dist/[name].js",
    pathinfo: true,
    libraryTarget: "commonjs2",
  },
  target: "node",
  node: {
    console: true,
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
  resolve: {
    //root: __dirname,
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  devtool: "inline-source-map",
  module: {
    rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      loader: "source-map-loader",
    },
    {
      enforce: 'pre',
      test: /\.tsx?$/,
      use: "source-map-loader",
    },
    {
      test: /\.tsx?$/,
      loader: "awesome-typescript-loader",
      options: {
        configFileName: "tsconfig.json",
      },
      exclude: [
        path.resolve(__dirname, "src/util/snippets"),
      ],
    },
    {
      test: /\.tsx?$/,
      enforce: "pre",
      include: [
        path.resolve(__dirname, "src"),
        path.resolve(__dirname, "test"),
      ],
      exclude: [
        path.resolve(__dirname, "src/util/snippets"),
      ],
      loader: "tslint-loader",
    },
    ],
    
  },
};
