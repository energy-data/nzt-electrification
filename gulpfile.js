var gulp       = require('gulp');
var coffee     = require('gulp-coffee');
var gutil      = require('gulp-util');
var uglify     = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var coffees = './coffee/*.coffee';
var dist    = './dist/javascripts/';

gulp.task('build:coffees-dev', function() {
  gulp.src(coffees)
    .pipe(sourcemaps.init())
    .pipe(coffee({ bare: true }))
    .on('error', function(e) {
      gutil.beep();
      gutil.log(gutil.colors.red(e));
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist));
});

gulp.task('build:coffees-prod', function() {
  gulp.src(coffees)
    .pipe(coffee({ bare: true }))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('watch', function() {
  gulp.start('build:coffees-dev');
  gulp.watch(coffees, ['build:coffees-dev']);
});

gulp.task('build', function() {
  gulp.start('build:coffees-prod');
});
