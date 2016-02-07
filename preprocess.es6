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
            for ( let j = tokens.length - 1; j >= 0; j-- )  {
                if ( tokens[j][0] === ',' ) {
                    lastComma = true;
                    break;
                } else if ( tokens[j][0] !== 'space' ) {
                    break;
                }
            }
            atrule = tokens[0][0] === 'at-word';
            colon  = tokens.some( i => i[0] === ':' );
        }

        return { indent, tokens, atrule, colon, lastComma };
    });
}
