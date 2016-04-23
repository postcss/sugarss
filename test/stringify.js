import stringify from '../stringify';
import parse     from '../parse';

import path from 'path';
import test from 'ava';
import fs   from 'fs';

let tests = fs.readdirSync(path.join(__dirname, 'cases'))
              .filter(i => path.extname(i) === '.sss' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

function run(t, sss) {
    let root = parse(sss);
    let output = '';
    stringify(root, i => {
        output += i;
    });
    t.deepEqual(sss, output);
}

test('saves newlines', t => {
    run(t, 'a\r\n  color: black');
});

for ( let name of tests ) {
    test('stringifies ' + name, t => {
        run(t, read(name));
    });
}
