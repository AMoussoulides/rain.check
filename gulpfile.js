const gulp = require("gulp");
	
const browserify = require("browserify");
	
const babelify = require("babelify");
	
const source = require("vinyl-source-stream");
	
const buffer = require("vinyl-buffer");



var pipeline = require('readable-stream').pipeline;
	
const uglify = require('gulp-uglify-es').default;

	
const htmlmin = require("gulp-htmlmin");

const postcss = require("gulp-postcss");



	
const cssnano = require("cssnano");

var imagemin = require('gulp-imagemin');
	
const paths = {
	
    source: "./client",
	
    build: "./build"
	
};
	
function javascriptBuild() {
	
    return pipeline(
        gulp.src('client/js/*.js'),
        uglify(),
        gulp.dest('build/js')
  );
	
}



	
 
	


function copyfonts() {
	
   return  gulp.src(`${paths.source}/font/*`)
    .pipe(gulp.dest(`${paths.build}/font`));
	
}





function imgBuild() {
	
    return gulp.src(`${paths.source}/img/*.{png,jpg,gif,svg}`)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(`${paths.build}/img`));
     
 }
 


function htmlBuild() {
	
    return gulp
	
        .src(`${paths.source}/*.html`)
	
        .pipe(htmlmin())
	
        .pipe(gulp.dest(paths.build));
	
}
	
 
	

	


function cssBuild() {
	
    return gulp
	
        .src(`${paths.source}/css/**/*.css`)
	
        .pipe(postcss([cssnano()]))
	
        .pipe(gulp.dest(`${paths.build}/css`));
	
}
	
 
	



const del = require("del");
	
 
	
function cleanup() {
	
   
	
    return del([paths.build]);
	
}
	
 
	

	


exports.default = exports.build = gulp.series(cleanup, gulp.parallel(javascriptBuild,copyfonts,imgBuild, htmlBuild, cssBuild));