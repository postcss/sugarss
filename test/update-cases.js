#!/usr/bin/env node

let { readdirSync, readFileSync, writeFileSync } = require('node:fs')
let { extname, join } = require('node:path')
let { jsonify } = require('postcss-parser-tests')

let parse = require('../parse')

let dir = join(__dirname, 'cases')
readdirSync(dir)
  .filter(i => extname(i) === '.sss')
  .forEach(name => {
    let sssFile = join(dir, name)
    let cssFile = sssFile.replace(/\.sss/, '.css')
    let jsonFile = sssFile.replace(/\.sss/, '.json')
    let sss = readFileSync(sssFile).toString()
    let root = parse(sss, { from: name })
    writeFileSync(cssFile, root.toString())
    writeFileSync(jsonFile, jsonify(root) + '\n')
  })
