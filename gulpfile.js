const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const notifier = require('node-notifier');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const babel = require('gulp-babel');

const paths = {
  sass: './assets/sass/**/*.scss',
  sassEntry: './assets/sass/main.scss',
  sassDest: './assets/sass',
  jsEntry: './assets/js/main.js',
  jsDest: './assets/js',
  html: './index.html',
  vendorSrc: [], // Add vendor paths here
  vendorDest: './assets/vendors/js/',
};

// Compile Sass with sourcemaps and stream to browser
function compileSass() {
  return src(paths.sassEntry)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest(paths.sassDest))
    .pipe(browserSync.stream());
}

// Bundle JavaScript with Browserify and Babel
function bundleJS() {
  return browserify(paths.jsEntry)
    .transform('babelify', { presets: ['@babel/preset-env'] })
    .bundle()
    .on('error', function (err) {
      console.error(err.stack);
      notifier.notify({
        title: 'Browserify Compilation Error',
        message: err.message,
      });
      this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(rename('bundle.js'))
    .pipe(dest(paths.jsDest))
    .pipe(browserSync.stream());
}

// Validate JS with JSHint
function validateJS() {
  return src(['./assets/js/**/*.js', '!./assets/js/bundle.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
}

// Copy vendor scripts
function vendors() {
  if (paths.vendorSrc.length === 0) {
    return Promise.resolve();
  }
  return src(paths.vendorSrc)
    .pipe(concat('vendors.js'))
    .pipe(dest(paths.vendorDest));
}

// Reload HTML
function reloadHTML() {
  return src(paths.html).pipe(browserSync.stream());
}

// Serve and watch files
function serve() {
  browserSync.init({
    open: true,
    server: {
      baseDir: './',
    },
  });

  watch(paths.sass, compileSass);
  watch(['./assets/js/**/*.js', '!./assets/js/bundle.js'], series(bundleJS));
  watch('./**/*.html', reloadHTML);
}

// Define tasks
exports.sass = compileSass;
exports.javascript = bundleJS;
exports.validateJS = validateJS;
exports.vendors = vendors;
exports.HTML = reloadHTML;
exports.watch = serve;

// Default task
exports.default = series(
  parallel(vendors, bundleJS, compileSass),
  serve
);