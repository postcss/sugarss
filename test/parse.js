import parse from '../parse';

import { jsonify } from 'postcss-parser-tests';
import   path      from 'path';
import   test      from 'ava';
import   fs        from 'fs';

test('detects indent', t => {
    let root = parse('@one\n  @two\n    @three');
    t.same(root.raws.indent, '  ');
});

test('throws on first indent', t => {
    t.throws(() => {
        parse('  @charset "UTF-8"');
    }, '<css input>:1:1: First line should not have indent');
});

test('throws on too big indent', t => {
    t.throws(() => {
        parse('@supports\n  @media\n      // test');
    }, '<css input>:3:1: Expected 4 indent, but get 6');
});

test('throws on wrong indent step', t => {
    t.throws(() => {
        parse('@supports\n  @media\n @media');
    }, '<css input>:3:1: Expected 0 or 2 indent, but get 1');
});

test('throws on decl without property', t => {
    t.throws(() => {
        parse(': black');
    }, '<css input>:1:1: Declaration without name');
});

test('keeps trailing spaces', t => {
    let root = parse('@media  screen \n  a\n  b \n    color: \n      black ');
    t.same(root.first.raws.between, ' ');
    t.same(root.first.raws.afterName, '  ');
    t.same(root.first.first.raws.between, ' ');
    t.same(root.first.first.first.raws.between, ': \n      ');
    t.same(root.first.first.first.raws.value.raw, 'black ');
});

let tests = fs.readdirSync(path.join(__dirname, 'cases'))
              .filter(i => path.extname(i) === '.sss' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

for ( let name of tests ) {
    test('parses ' + name, t => {
        let sss  = read(name);
        let css  = read(name.replace(/\.sss/, '.css')).trim();
        let json = read(name.replace(/\.sss/, '.json')).trim();
        let root = parse(sss, { from: name });
        t.same(root.toString(), css);
        t.same(jsonify(root), json);
    });
}
