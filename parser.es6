import Root from 'postcss/lib/root';

export default class Parser {

    constructor(input) {
        this.input = input;

        this.line    = 0;
        this.root    = new Root();
        this.current = this.root;
        this.spaces  = '';

        this.root.source = { input, start: { line: 1, column: 1 } };
    }

    loop() {
        while ( this.line < this.lines.length ) {
            this.line += 1;
        }
    }

}
