'use strict';

const clean = require('gulp-clean');
const gulp = require('gulp');
const gulpDotFlatten = require('./libs/gulp-dot-flatten.js');
const gulpRename = require('gulp-rename');
const gulpScreepsUpload = require('./libs/gulp-screeps-upload.js');
const gutil = require('gulp-util');
const path = require('path');
const PluginError = require('gulp-util').PluginError;
const runSequence = require('run-sequence');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const tsconfig = ts.createProject('tsconfig.json', { typescript: require('typescript') });

const config = require('./config.json');

gulp.task('lint-only', () => {
    return gulp.src('./src/**/*.ts')
        .pipe(tslint({ formatter: 'prose' }))
        .pipe(tslint.report({
            summarizeFailureOutput: true,
            emitError: false
        }))
});

gulp.task('clean', () => {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

let compileFailed = false;

gulp.task('compile', ['clean'], () => {
    compileFailed = false;
    return tsconfig.src()
        .pipe(ts(tsconfig))
        .on('error', (err) => { compileFailed = true; })
        .js.pipe(gulp.dest('dist/js'));
});

gulp.task('checked-compile', ['compile'], () => {
    if (!compileFailed)
        return true;
    throw new PluginError("gulp-typescript", "failed to compile: not executing further tasks");
    compileFailed = false;
})

gulp.task('lint', ['checked-compile'], () => {
    return gulp.src('./src/**/*.ts')
        .pipe(tslint({ formatter: 'prose' }))
        .pipe(tslint.report({
            summarizeFailureOutput: true,
            emitError: false
        }))
});

gulp.task('flatten', ['lint'], () => {
    return gulp.src('./dist/js/**/*.js')
        .pipe(gulpDotFlatten(0))
        .pipe(gulp.dest('./dist/flat'))
});

gulp.task('upload', ['flatten'], () => {
    return gulp.src('./dist/flat/*.js')
        .pipe(gulpRename(path => { path.extname = ''; }))
        .pipe(gulpScreepsUpload(config.email, config.password, config.branch, 0))
});

gulp.task('watch', () => {
    gutil.log(gutil.colors.green("Watching source files for change ..."));
    gulp.watch('./src/**/*.ts', ['build']);
});

gulp.task('build', () => {
    console.log('');
    gutil.log(gutil.colors.green("Attempting to build and upload project ..."));
    console.log('');
    return runSequence('upload', (error) => {
        console.log('');
        if (error)
            gutil.log(gutil.colors.green("Build aborted due to errors!"));
        else
            gutil.log(gutil.colors.green("Build completed and uploaded successfully."));
        console.log('');
    });
});

gulp.task('test', ['lint-only']);
gulp.task('default', ['watch']);
