export default function preprocess(lines) {
    return lines.map(line => {
        let indent, tokens;
        if ( line[0][0] === 'space' ) {
            indent = line[0][1];
            tokens = line.slice(1);
        } else {
            indent = '';
            tokens = line;
        }

        let lastComma = false;
        let atrule    = false;
        let colon     = false;
        if ( tokens.length ) {
            lastComma = tokens[tokens.length - 1][0] === ',';
            atrule    = tokens[0][0] === 'at-word';
            colon     = tokens.some( i => i[0] === ':' );
        }

        return { indent, tokens, atrule, colon, lastComma };
    });
}
