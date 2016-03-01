import parse from '../parse';

import { jsonify } from 'postcss-parser-tests';
import   path      from 'path';
import   test      from 'ava';
import   fs        from 'fs';

test('detects indent', t => {
    let root = parse('@one\n  @two\n    @three');
    t.same(root.raws.indent, '  ');
});

test('ignores comments in indent detection', t => {
    let root = parse('@one\n    // comment\n  @two');
    t.same(root.raws.indent, '  ');
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
