# SugarSS [![Build Status][ci-img]][ci]

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

Indent-based CSS syntax for [PostCSS].

```sass
a
  color: blue

.multiline,
.selector
  box-shadow: 1px 0 9px rgba(0, 0, 0, .4),
              1px 0 3px rgba(0, 0, 0, .6)

// Mobile
@media (max-width: 400px)
  .body
    padding: 0 10px
```

As any PostCSS custom syntax, SugarSS has source map, [Stylelint]
and [postcss-sorting] support out-of-box.

It was designed to be used with [PreCSS] syntax-sugar. But you can use
it with any PostCSS plugin or use it without any PostCSS plugins.

[postcss-sorting]: https://github.com/hudochenkov/postcss-sorting
[Stylelint]:       http://stylelint.io/
[PostCSS]:         https://github.com/postcss/postcss
[PreCSS]:          https://github.com/jonathantneal/precss
[ci-img]:          https://img.shields.io/travis/postcss/sugarss.svg
[ci]:              https://travis-ci.org/postcss/sugarss

## Syntax

SugarSS MIME-type is `text/x-sugarss` with `.sss` file extension.

### Indent

We are recommend to use 2 spaces indent for SugarSS sources. However, SugarSS
autodetects indent and can be used with tabs or spaces.

But it is prohibited to mix spaces and tabs in SugarSS sources.

### Multiline

SugarSS was designed to have intuitively multiline selectors and declaration
values.

There are 3 universal rules for any types of nodes:

```sass
// 1. New line inside brackets will be ignored
@supports ( (display: flex) and
            (display: grid) )

// 2. Comma at the end of the line
@media (max-width: 400px),
       (max-height: 800px)

// 3. Backslash before newline
@media screen and \
       (min-width: 600px)
```

In selector you can put a new line anywhere. Just keep same indent
for every line of selector:

```sass
.parent >
.child
  color: black
```

In declaration value you can put new line anywhere. Just keep bigger indent
for value:

```sass
.one
  background: linear-gradient(rgba(0, 0, 0, 0), black)
              linear-gradient(red, rgba(255, 0, 0, 0))

.two
  background:
    linear-gradient(rgba(0, 0, 0, 0), black)
    linear-gradient(red, rgba(255, 0, 0, 0))
```

### Comments

SugarSS supports two types of comments:

```sass
/*
 * Multiline comments
 */

// Inline comments
```

## Text Editors

We are working to add syntax highlight support to main text editors.
Until this work will finished, you can set `Sass` or `Stylus` syntax highlight
for `.sss` files.

## Usage

### SugarSS to CSS

Just set SugarSS to PostCSS’s `parser` option and PostCSS will compile
SugarSS to CSS.

Gulp:

```js
var postcss = require('gulp-postcss');
var sugarss = require('postcss-scss');
var rename  = require('gulp-rename');

gulp.task('style', function () {
    return gulp.src('scr/**/*.sss')
        .pipe(postcss(plugins, { parser: sugarss }))
        .pipe(rename({ extname: '.css' }))
        .pipe(gulp.dest('build'));
});
```

Webpack:

```
{
  module: {
      loaders: [
          {
              test:   /\.sss/,
              loader: "style-loader!css-loader!postcss-loader?parser=sugarss"
          }
      ]
  }
}
```

### SugarSS to SugarSS

Sometimes we use PostCSS not to build CSS, but to fix something in origin
sources. For example, to sort properties by [postcss-sorting].

For this cases, use `syntax` option, instead of `parser`:

```js
gulp.task('sort', function () {
    return gulp.src('scr/**/*.sss')
        .pipe(postcss([sorting], { syntax: sugarss }))
        .pipe(gulp.dest('src'));
});
```

[postcss-sorting]: https://github.com/hudochenkov/postcss-sorting

### CSS to SugarSS

You can even compile existed CSS sources to SugarSS syntax.
Just use `stringifier` option instead of `parser`:

```js
postcss().process(css, { stringifier: sugarss }).then(function (result) {
    result.content // Converted SugarSS content
});
```
