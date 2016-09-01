"use strict";

const gulp = require("gulp");

const gulpDebounce = require("gulp-debounce-stream");
const gulpFilter = require("gulp-filter");
const gulpPlumber = require("gulp-plumber");
const gulpRename = require("gulp-rename");
const gulpWatch = require("gulp-watch");
const gulpUtil = require("gulp-util");


const _ = require("lodash");
const deepEqual = require("deep-equal");
const merge2 = require("merge2");
const through2 = require("through2");
const typescript = require("typescript");
const webpack = require("webpack");
const Q = require("q");

const fs = require("fs");
const https = require("https");
const path = require('path');
const util = require("util");
const child_process = require("child_process");
const process = require("process");

const cpSpawn = child_process.spawn;


const secrets = require("./secrets.js");
const webpackConfig = require("./webpack.config.js");


const gulpUploadSingleVinylAsModule = () => through2.obj((fileVinyl, enc, cb) => {
    const cbd = Q.defer();
    _gulpUploadVinylsAsModules([ fileVinyl ], cbd.makeNodeResolver());
    cbd.promise.then(_ => cb(null, _), _ => cb(_));
});

const gulpTraceSync = (onEntryCb) => through2.obj((f, e, cb) => {
    onEntryCb(f, e);
    cb(null, f);
});

let __lastUploaded = null;
function _gulpUploadVinylsAsModules(fileVinyls, cb) {
    const email = secrets.email;
    const password = secrets.password;
    const modules = {}
    for (const fileVinyl of fileVinyls) {
        const moduleName = path.basename(fileVinyl.path);
        modules[moduleName] = fileVinyl.contents.toString("utf-8");
    }
    console.log(`Modules: ${_.keys(modules).join(", ")}`);
    const data = { branch: "default", modules: modules };
    if (deepEqual(__lastUploaded, data)) {
        console.log("Skipping upload due to equal outputs.");
        return cb(null, {});
    }
    __lastUploaded = data;
    process.stdout.write("Uploading... ");
    const req = https.request({
        hostname: "screeps.com",
        port: 443,
        path: "/api/user/code",
        method: "POST",
        auth: `${email}:${password}`,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }, res => {
        console.log(`Response: ${res.statusCode}`);
    });

    req.write(JSON.stringify(data));
    req.end();

    cb(null, {});
}

gulp.task("adv-watch", (cb) => {
    const compiler = webpack(webpackConfig);
    compiler.watch({
        aggregateTimeout: 300,
        poll: false,
    }, (err, stats) => {
        gulpUtil.log('[webpack:build]', stats.toString({
            chunks: false, // Makes the build much quieter
            colors: true
        }));
    });
});

gulp.task("adv-watch-upload", () => {
    return gulpWatch("./dist/main.js", { ignoreInitial: true })
        .pipe(gulpPlumber())
        .pipe(gulpDebounce({ fnHash: (v) => "0", timeout: 250 }))//Dummy hash such that any file trigger is debounced
        .pipe(gulpRename(path => { path.dirname = ""; path.extname = ""; }))//strip module extension
        //.pipe(gulpTraceSync(f => console.log(`${f.relative}`)))
        .pipe(gulpUploadSingleVinylAsModule());
});

gulp.task("default", ["adv-watch", "adv-watch-upload"]);
