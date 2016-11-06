"use strict";
const webpack = require("webpack");
const path = require("path");
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    plugins: [
        require("webpack-fail-plugin"),
				//new BabiliPlugin({ comments: false }),
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
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        preLoaders: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, "src"),
                    path.resolve(__dirname, "test"),
                ],
                loader: "tslint",
            },
        ],
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                configFileName: "tsconfig.json",
            },
        ],

    },
    tslint: {
        configuration: require("./tslint.json"),
        emitErrors: false,
        failOnHint: true,
    },
};
