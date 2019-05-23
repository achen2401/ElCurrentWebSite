/*
 * note run npm install to get all dependencies before proceeding with tasks
 * DO NOT check in node_modules generated to GIT
 */
const gulp = require("gulp");
const less = require("gulp-less");
const sourcemaps = require("gulp-sourcemaps");
const LessPluginCleanCSS = require("less-plugin-clean-css"),
    cleancss = new LessPluginCleanCSS({
        advanced: true
    });
const rename    = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rootPath = "./";
const lessPath = rootPath + "less";
const cssPath = rootPath + "css";
const mapPath = rootPath + "maps";
const debug = require('gulp-debug');
const jsDest = "js";
const jsSrcPath = "js/src";
const componentsSrcPath = jsSrcPath + "/components";
const vendorsSrcPath = jsSrcPath + "/vendors";
const componentsDistPath = "js/components";
const htmlmin = require('gulp-htmlmin');
const del = require("del");
const jshint = require("gulp-jshint");
const using = require('gulp-using');

// fetch command line arguments
const arg = (argList => {
    let arg = {},
        a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {

        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, "");

        if (opt === thisOpt) {
            // argument value
            if (curOpt) {
              arg[curOpt] = opt;
            }
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;

})(process.argv);
/*
 * transforming less to css
 */
gulp.task("appLess", function() {
    gulp.src("less/app.less")
        .pipe(debug({title: 'lessFile:'}))
        .pipe(using({}))
        .pipe(sourcemaps.init())
        .pipe(less({
            plugins: [cleancss]
        }))
        .pipe(sourcemaps.write("../maps"))
        .pipe(gulp.dest(cssPath));
    return true;
});

gulp.task("watchAppLess", function() { //recompile less if there is change
    gulp.watch("less/app.less", ["appLess"]);
});

gulp.task("watchComponents", function() { //recompile components if there is change
    gulp.watch(componentsPathSrc+"/*.js", ["js-components"]);
});

gulp.task("clean-js-components-dist", function() {
  console.log("delete source file...");
  return del([componentsDistPath + "/components.min.js"]);
});

gulp.task("js-components", ["clean-js-components-dist"], function() { //components only excluding app JS main file
    return gulp.src(componentsSrcPath+"/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat("components.js"))
        .pipe(gulp.dest(componentsDistPath))
        .pipe(rename("components.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write("../../maps"))
        .pipe(gulp.dest(componentsDistPath))
        .on("end", function() {
            del([componentsDistPath + "/components.js"]);
        });
});

gulp.task("clean-app-js-dist", function() {
    console.log("delete app source file...");
    return del(["js/app.min.js"]);
});

gulp.task("appJs", ["clean-app-js-dist", "js-components"], function() {
    return gulp.src([vendorsSrcPath+"/*.js", componentsDistPath+"/components.min.js", jsSrcPath+"/app.js"])
    .pipe(sourcemaps.init())
    .pipe(concat("app_components.js")) //combining components js files and main app js file
    .pipe(gulp.dest("js"))
    .pipe(rename("app.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("js"))
    .on("end", function() {
        del(["js/app_components.js"]);
    });
});

gulp.task("watchAppJs", function() { //recompile app file if there is change
    gulp.watch([jsSrcPath+"/app.js", componentsSrcPath+"/*.js"], ["appJs"]);
});


//linting JS
/*
 * note can pass command line argument for a particular js file to lint
 * example: gulp jslint --file './js/app.js'
 * alternatively can use eslint, see command line tool:  https://eslint.org/docs/user-guide/getting-started
 */
gulp.task("jslint", function() {
    var files = ["./js/app.js"];
    if (arg.file) {
      files = [arg.file];
    }
    return gulp.src(files)
        .pipe(jshint())
        .pipe(jshint.reporter("jshint-stylish"));
});

gulp.task("build", ["appLess", "appJs"]); //this will do a clean build of all files (css, js), run: npm run build
