"use strict";
const webpack = require("webpack");
const path = require("path");

module.exports = {
    plugins: [
        require("webpack-fail-plugin"),

    ],
    entry: {
        main: "./src/main.ts",
        test: "./test/test.ts",
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
