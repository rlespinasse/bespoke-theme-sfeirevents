var gulp = require('gulp'),
  clean = require('gulp-clean'),
  header = require('gulp-header'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  stylus = require('gulp-stylus'),
  autoprefixer = require('gulp-autoprefixer'),
  csso = require('gulp-csso'),
  plumber = require('gulp-plumber'),
  pkg = require('./package.json'),
  browserify = require('gulp-browserify'),
  through = require('through'),
  template = require('lodash').template,
  isDemo = process.argv.indexOf('demo') > 0;

gulp.task('default', ['clean', 'compile']);
gulp.task('compile', ['stylus', 'browserify']);

gulp.task('clean', ['clean:browserify', 'clean:stylus']);
gulp.task('clean:browserify', function() {
  return gulp.src(['dist'], { read: false })
    .pipe(clean());
});

gulp.task('clean:stylus', function() {
  return gulp.src(['lib/tmp'], { read: false })
    .pipe(clean());
});

gulp.task('stylus', ['clean:stylus'], function() {
  return gulp.src('lib/theme.styl')
    .pipe(isDemo ? plumber() : through())
    .pipe(stylus({
      'include css': true,
      'paths': ['./node_modules']
    }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(csso())
    .pipe(gulp.dest('lib/tmp'));
});

gulp.task('browserify', ['clean:browserify', 'stylus'], function() {
  return gulp.src('lib/bespoke-theme-sfeirevents.js')
    .pipe(isDemo ? plumber() : through())
    .pipe(browserify({ transform: ['brfs'], standalone: 'bespoke.themes.sfeirevents' }))
    .pipe(header(template([
      '/*!',
      ' * <%= name %> v<%= version %>',
      ' *',
      ' * Copyright <%= new Date().getFullYear() %>, <%= author.name %>',
      ' * This content is released under the <%= licenses[0].type %> license',
      ' * <%= licenses[0].url %>',
      ' */\n\n'
    ].join('\n'), pkg)))
    .pipe(gulp.dest('dist'))
    .pipe(rename('bespoke-theme-sfeirevents.min.js'))
    .pipe(uglify())
    .pipe(header(template([
      '/*! <%= name %> v<%= version %> ',
      '© <%= new Date().getFullYear() %> <%= author.name %>, ',
      '<%= licenses[0].type %> License */\n'
    ].join(''), pkg)))
    .pipe(gulp.dest('dist'));
});
