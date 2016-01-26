'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    browserSync = require("browser-sync"),
    rimraf = require('rimraf'),
    php = require('gulp-connect-php'),
    plumber = require('gulp-plumber'),
    reload = browserSync.reload;

var path = {
    prod:{
        jade: 'prod/',
        js: 'prod/js/',
        css: 'prod/css/',
        img: 'prod/img/',
        fonts: 'prod/fonts/',
        php: 'prod/php/',
        users_img: 'prod/users_img/'
    },
    dist: {
        jade: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/',
        php: 'dist/php/',
        users_img: 'dist/'

    },
    src: { //Пути откуда брать исходники
        jade: 'app/markups/*.jade',
        js: 'app/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        jsAll: 'app/js/partials/*.js',
        style: 'app/sass/main.scss',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*',
        php: 'app/php/**/*.*',
        users_img: 'app/users_img'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        jade: 'app/markups/**/*.jade',
        js: 'app/js/**/*.js',
        style: 'app/sass/**/*.scss',
        img: 'app/img/**/*.*',
        php: 'app/php/**/*.php',
        fonts: 'app/fonts/**/*.*'
    },

     clean: './dist'
};

var config = {
    server: {
        baseDir: "./dist"
    },
    host: 'localhost',
    port: 9000
};

var configPhp = {
    proxy: '127.0.0.1:9010',
    port: 9000,
    open: true,
    notify: false
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('php', function() {
    php.server({ 
        base: 'dist',
        port: 9010, 
        keepalive: true
    });
});

gulp.task('webserver-php', ['php'], function () {
    browserSync(configPhp);
});


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('js:dist', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(plumber())
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в dist
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:dist', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(plumber())
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css)) //И в dist
        .pipe(reload({stream: true}));
});

gulp.task('jade:dist', function(){
  gulp.src(path.src.jade)
    .pipe(plumber())
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(path.dist.jade))
    .pipe(reload({stream: true}));
});

gulp.task('image:dist', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(plumber())
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img)) //И бросим в dist
        .pipe(reload({stream: true}));
});

gulp.task('fonts:dist', function() {
    gulp.src(path.src.fonts)
        .pipe(plumber())
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('php:dist', function() {
    gulp.src(path.src.php)
        .pipe(plumber())
        .pipe(gulp.dest(path.dist.php));
});

gulp.task('test_img', function(){
   gulp.src(path.src.users_img)
       .pipe(gulp.dest(path.dist.users_img));
});

gulp.task('dist', [
    'jade:dist',
    'js:dist',
    'style:dist',
    'fonts:dist',
    'image:dist',
    'php:dist',
    'test_img'
]);
gulp.task('test_img', function(){
    gulp.src(path.src.users_img)
        .pipe(gulp.dest(path.prod.users_img));
});
gulp.task('prod-php', function(){
    gulp.src(path.src.php)
        .pipe(gulp.dest(path.prod.php));
});
gulp.task('image', function(){
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.prod.img));
});
gulp.task('fonts', function(){
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.prod.fonts));
});
gulp.task('style', function(){
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(plumber())
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.prod.css));
});
gulp.task('jade', function(){
    gulp.src(path.src.jade)
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest(path.prod.jade));
});
gulp.task('js', function(){
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.prod.js));
});
gulp.task('build', [
    'jade',
    'js',
    'style',
    'fonts',
    'image',
    'prod-php',
    'test_img'
]);

gulp.task('copy', function() {
    gulp.watch('dist/**/*.*', function () {
        gulp.src(['dist/**/*.*'])
            .pipe(gulp.dest('build'));
    });
});

gulp.task('watch', function(){
    watch([path.watch.jade], function(event, cb) {
        gulp.start('jade:dist');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:dist');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:dist');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:dist');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:dist');
    });
    watch([path.watch.php], function(event, cb) {
        gulp.start('php:dist');
    });
});

gulp.task('server-php', ['dist', 'webserver-php', 'watch']);

gulp.task('default', ['dist', 'webserver', 'watch', 'copy']);