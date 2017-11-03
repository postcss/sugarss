const path = require('path');
const fs   = require('fs');

const stringify = require('../stringify');
const parse     = require('../parse');

let tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.sss' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

function run(sss) {
    let root = parse(sss);
    let output = '';
    stringify(root, i => {
        output += i;
    });
    expect(sss).toEqual(output);
}

it('saves newlines', () => {
    run('a\r\n  color: black');
});

for ( let name of tests ) {
    it('stringifies ' + name, () => {
        run(read(name));
    });
}
