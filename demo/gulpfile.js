'use strict';

var bespoke_theme = 'bespoke-theme-sfeirevents'

var pkg = require('./package.json'),
  autoprefixer = require('gulp-autoprefixer'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  connect = require('gulp-connect'),
  csso = require('gulp-csso'),
  del = require('del'),
  exec = require('gulp-exec'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  source = require('vinyl-source-stream'),
  stylus = require('gulp-stylus'),
  through = require('through'),
  uglify = require('gulp-uglify-es').default,
  isDist = process.argv.indexOf('serve') === -1,
  // browserifyPlumber fills the role of plumber() when working with browserify
  browserifyPlumber = function(e) {
    if (isDist) throw e;
    gutil.log(e.stack);
    this.emit('end');
  };

gulp.task('js', ['clean:js'], function() {
  // see https://wehavefaces.net/gulp-browserify-the-gulp-y-way-bb359b3f9623
  return browserify('src/scripts/main.js').bundle()
    .on('error', browserifyPlumber)
    .pipe(source('src/scripts/main.js'))
    .pipe(buffer())
    .pipe(isDist ? uglify() : through())
    .pipe(rename('build.js'))
    .pipe(gulp.dest('dist/build'))
    .pipe(connect.reload());
});

gulp.task('html', ['clean:html', 'clean:diagram-images'], function() {
  return gulp.src('src/index.adoc')
    .pipe(isDist ? through() : plumber())
    .pipe(exec('bundle exec asciidoctor-bespoke -r asciidoctor-diagram -o - -T ./node_modules/' + bespoke_theme + '/asciidoctor/templates src/index.adoc', { pipeStdout: true }))
    .pipe(exec.reporter({ stdout: false }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist'))
});

gulp.task('post-html', ['html'], function() {
  return gulp.src('src/images/diag-*')
    .pipe(gulp.dest('dist/images'))
    .pipe(connect.reload());
});

gulp.task('css', ['clean:css'], function() {
  return gulp.src('src/styles/main.styl')
    .pipe(isDist ? through() : plumber())
    .pipe(stylus({ 'include css': true, paths: ['./node_modules'] }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(isDist ? csso() : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/build'))
    .pipe(connect.reload());
});

gulp.task('images', ['theme-images'], function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(connect.reload());
});

gulp.task('theme-images', ['clean:images'], function() {
  return gulp.src('node_modules/' + bespoke_theme + '/lib/images/**/*')
    .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', ['clean:fonts'], function() {
  return gulp.src('src/fonts/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(connect.reload());
});

gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('clean:html', function() {
  return del('dist/index.html');
});

gulp.task('clean:js', function() {
  return del('dist/build/build.js');
});

gulp.task('clean:css', function() {
  return del('dist/build/build.css');
});

gulp.task('clean:images', function() {
  return del('dist/images');
});

gulp.task('clean:diagram-images', function() {
  return del('src/images/diag-*');
});

gulp.task('clean:fonts', function() {
  return del('dist/fonts');
});

gulp.task('connect', ['build'], function() {
  connect.server({ root: 'dist', port: process.env.PORT || 8000, livereload: false });
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.adoc', ['post-html']);
  gulp.watch('src/scripts/**/*.js', ['js']);
  gulp.watch('src/styles/**/*.styl', ['css']);
  // NOTE remove auto-generated asciidoctor diagram from watch (generated during 'post-html' task)
  gulp.watch(['src/images/**/*', '!src/images/diag-*'], ['images']);
  gulp.watch('src/fonts/*', ['fonts']);
});

gulp.task('build', ['js', 'post-html', 'css', 'images', 'fonts']);

gulp.task('serve', ['connect', 'watch']);

gulp.task('default', ['build']);
