# SugarSS

<img align="right" width="120" height="155"
     title="SugarSS logo by Maria Keller"
     src="http://postcss.github.io/sugarss/logo.svg">

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

As any PostCSS custom syntax, SugarSS has source map, [stylelint]
and [postcss-sorting] support out-of-box.

It was designed to be used with [postcss-simple-vars] and [postcss-nested].
But you can use it with any PostCSS plugins
or use it without any PostCSS plugins.
With [postcss-mixins] you can use `@mixin` syntax as in Sass.

<a href="https://evilmartians.com/?utm_source=sugarss">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[postcss-mixins]:              https://github.com/postcss/postcss-mixins
[postcss-nested]:              https://github.com/postcss/postcss-nested
[postcss-simple-vars]:         https://github.com/postcss/postcss-simple-vars
[postcss-sorting]:             https://github.com/hudochenkov/postcss-sorting
[stylelint]:                   http://stylelint.io/
[PostCSS]:                     https://github.com/postcss/postcss


## Syntax

SugarSS MIME-type is `text/x-sugarss` with `.sss` file extension.


### Indent

We recommend 2 spaces indent. However, SugarSS autodetects indent
and can be used with tabs or spaces.

But it is prohibited to mix spaces and tabs in SugarSS sources.


### Multiline

SugarSS was designed to have intuitively multiline selectors and declaration
values.

There are 3 rules for any types of nodes:

```sass
// 1. New line inside brackets will be ignored
@supports ( (display: flex) and
            (display: grid) )

// 2. Comma at the end of the line
@media (max-width: 400px),
       (max-height: 800px)

// 3. Backslash before new line
@media screen and \
       (min-width: 600px)
```

In a selector you can put a new line anywhere. Just keep same indent
for every line of selector:

```sass
.parent >
.child
  color: black
```

In a declaration value you can put a new line anywhere. Just keep a bigger indent
for the value:

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
 Multiline comments
 */

// Inline comments
```

There is no “silent” comment in SugarSS. Output CSS will contain all comments
from `.sss` source. But you can use [postcss-discard-comments]
for Sass’s silent/loud comments behaviour.

[postcss-discard-comments]: https://www.npmjs.com/package/postcss-discard-comments


### Rule and Declarations

SugarSS separates selectors and declarations by `:\s` or `:\n` token.

So you must write a space after the property name: `color: black` is good,
`color:black` is prohibited.


### Other

SugarSS is just a syntax, it change the way how you write CSS,
but do not add preprocessor features build-in.

Here are PostCSS plugins which could add you preprocessor features:

* **[postcss-simple-vars]** adds variables.
* **[postcss-nested]** adds nested rules.
* **[postcss-import]** adds `@import` directive support.
* **[postcss-import-ext-glob]** extends [postcss-import] path resolver to allow glob usage as a path.
* **[postcss-mixins]** add `@mixin` support.
* **[postcss-functions]** allows you to define own CSS functions in JS.

[postcss-functions]: https://github.com/andyjansson/postcss-functions
[postcss-mixins]: https://github.com/postcss/postcss-mixins
[postcss-import-ext-glob]: https://github.com/dimitrinicolas/postcss-import-ext-glob
[postcss-import]:          https://github.com/postcss/postcss-import
[postcss-nested]:          https://github.com/postcss/postcss-nested
[postcss-simple-vars]:     https://github.com/postcss/postcss-simple-vars


## Text Editors

* SublimeText: [Syntax Highlighting for .SSS SugarSS]
* Atom: [language-postcss], [source-preview-postcss] and [build-sugarss]
* Vim: [vim-sugarss]
* VSCode: [vetur](https://vuejs.github.io/vetur/), and [postcss-sugarss-language](https://github.com/MhMadHamster/vscode-postcss-language)

We are working on syntax highlight support in text editors.

Right now, you can set `Sass` or `Stylus` syntax highlight for `.sss` files.

[Syntax Highlighting for .SSS SugarSS]: https://packagecontrol.io/packages/Syntax%20Highlighting%20for%20SSS%20SugarSS
[source-preview-postcss]:          https://atom.io/packages/source-preview-postcss
[language-postcss]:                https://atom.io/packages/language-postcss
[build-sugarss]:                   https://atom.io/packages/build-sugarss
[vim-sugarss]:                     https://github.com/hhsnopek/vim-sugarss


## Usage

SugarSS needs PostCSS compiler. Install [`postcss-loader`] for webpack,
[`gulp-postcss`] for Gulp, [`postcss-cli`] for npm scripts.
[Parcel] has build-in support for PostCSS.

Then install SugarSS: `npm install --save-dev postcss sugarss` if you use npm
and `yarn add --dev postcss sugarss` if you use Yarn.

Then create `.postcssrc` file:

```json
{
  "parser": "sugarss",
  "plugins": {
    "postcss-simple-vars": {}
  }
}
```

[`postcss-loader`]: https://github.com/postcss/postcss-loader
[`gulp-postcss`]: https://github.com/postcss/gulp-postcss
[`postcss-cli`]: https://github.com/postcss/postcss-cli
[Parcel]: https://parceljs.org/transforms.html


### Imports

If you doesn’t use Webpack or Parcel, you need some PostCSS plugin
to process `@import` directives.

If you want `@import`, install [postcss-import] and add it to `.postcssrc` file:

```diff js
{
  "parser": "sugarss",
  "plugins": {
+   "postcss-import": {},
    "postcss-simple-vars": {}
  }
}
```

[postcss-import]:      https://github.com/postcss/postcss-import


### Mixins

For mixins support, install [postcss-mixins] and add it to `.postcssrc` file:

```diff js
{
  "parser": "sugarss",
  "plugins": {
+   "postcss-mixins": {
+     "mixinsDir": "./mixins"
+   },
    "postcss-simple-vars": {}
  }
}
```

Now you can define your mixins in `mixins/` dir.
For example create `mixins/circle.sss` with:

```sss
@define-mixin circle $size
  border-radius: 50%
  width: $size
  height: $size
```


### Functions

To define custom functions you need to install [postcss-functions]
and add it to `.postcssrc` file:

```diff js
{
  "parser": "sugarss",
  "plugins": {
+   "postcss-functions": {
+     "glob": "./functions"
+   },
    "postcss-simple-vars": {}
  }
}
```

Then you can define functions in `functions/` dir. For example,
`functions/foo.js` will define `foo()` function in CSS:

```js
module.exports = function (args) {
  return 'foo'
}
```


### SugarSS to SugarSS

Sometimes we use PostCSS not to build CSS, but to fix source files.
For example, to sort properties by [postcss-sorting].

For this cases use the `syntax` option, instead of `parser`:

```js
gulp.task('sort', function () {
    return gulp.src('src/**/*.sss')
        .pipe(postcss([sorting], { syntax: sugarss }))
        .pipe(gulp.dest('src'));
});
```

[postcss-sorting]: https://github.com/hudochenkov/postcss-sorting


### CSS to SugarSS

You can even compile existing CSS sources to SugarSS syntax.
Just use `stringifier` option instead of `parser`:

```js
postcss().process(css, { stringifier: sugarss }).then(function (result) {
    result.content // Converted SugarSS content
});
```


## Thanks

Cute project logo was made by [Maria Keller](http://www.mariakellerac.com/).
