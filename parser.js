let { Declaration, Comment, AtRule, Rule, Root } = require('postcss')

module.exports = class Parser {
  constructor(input) {
    this.input = input

    this.pos = 0
    this.root = new Root()
    this.current = this.root
    this.spaces = ''

    this.extraIndent = false
    this.prevIndent = undefined
    this.step = undefined

    this.root.source = { input, start: { line: 1, column: 1 } }
  }

  loop() {
    let part
    while (this.pos < this.parts.length) {
      part = this.parts[this.pos]

      if (part.comment) {
        this.comment(part)
      } else if (part.atrule) {
        this.atrule(part)
      } else if (part.colon) {
        let next = this.nextNonComment(this.pos)

        if (next.end || next.atrule) {
          this.decl(part)
        } else {
          let moreIndent = next.indent.length > part.indent.length
          if (!moreIndent) {
            this.decl(part)
          } else if (moreIndent && next.colon) {
            this.rule(part)
          } else if (moreIndent && !next.colon) {
            this.decl(part)
          }
        }
      } else if (part.end) {
        this.root.raws.after = part.before
      } else {
        this.rule(part)
      }

      this.pos += 1
    }

    for (let i = this.tokens.length - 1; i >= 0; i--) {
      if (this.tokens[i].length > 3) {
        let last = this.tokens[i]
        this.root.source.end = {
          line: last[4] || last[2],
          column: last[5] || last[3]
        }
        break
      }
    }
  }

  comment(part) {
    let token = part.tokens[0]
    let node = new Comment()
    this.init(node, part)
    node.source.end = { line: token[4], column: token[5] }
    this.commentText(node, token)
  }

  atrule(part) {
    let atword = part.tokens[0]
    let params = part.tokens.slice(1)

    let node = new AtRule()
    node.name = atword[1].slice(1)
    this.init(node, part)

    if (node.name === '') this.unnamedAtrule(atword)

    while (!part.end && part.lastComma) {
      this.pos += 1
      part = this.parts[this.pos]
      params.push(['space', part.before + part.indent])
      params = params.concat(part.tokens)
    }

    node.raws.afterName = this.firstSpaces(params)
    this.keepTrailingSpace(node, params)
    this.checkSemicolon(params)
    this.checkCurly(params)
    this.raw(node, 'params', params, atword)
  }

  decl(part) {
    let node = new Declaration()
    this.init(node, part)

    let between = ''
    let colon = 0
    let value = []
    let prop = ''
    for (let i = 0; i < part.tokens.length; i++) {
      let token = part.tokens[i]
      if (token[0] === ':') {
        between += token[1]
        colon = token
        value = part.tokens.slice(i + 1)
        break
      } else if (token[0] === 'comment' || token[0] === 'space') {
        between += token[1]
      } else if (between !== '') {
        this.badProp(token)
      } else {
        prop += token[1]
      }
    }

    if (prop === '') this.unnamedDecl(part.tokens[0])
    node.prop = prop

    let next = this.parts[this.pos + 1]

    while (
      !next.end &&
      !next.atrule &&
      !next.colon &&
      next.indent.length > part.indent.length
    ) {
      value.push(['space', next.before + next.indent])
      value = value.concat(next.tokens)
      this.pos += 1
      next = this.parts[this.pos + 1]
    }

    let last = value[value.length - 1]
    if (last && last[0] === 'comment') {
      value.pop()
      let comment = new Comment()
      this.current.push(comment)
      comment.source = {
        input: this.input,
        start: { line: last[2], column: last[3] },
        end: { line: last[4], column: last[5] }
      }
      let prev = value[value.length - 1]
      if (prev && prev[0] === 'space') {
        value.pop()
        comment.raws.before = prev[1]
      }
      this.commentText(comment, last)
    }

    for (let i = value.length - 1; i > 0; i--) {
      let t = value[i][0]
      if (t === 'word' && value[i][1] === '!important') {
        node.important = true
        if (i > 0 && value[i - 1][0] === 'space') {
          node.raws.important = value[i - 1][1] + '!important'
          value.splice(i - 1, 2)
        } else {
          node.raws.important = '!important'
          value.splice(i, 1)
        }
        break
      } else if (t !== 'space' && t !== 'newline' && t !== 'comment') {
        break
      }
    }

    node.raws.between = between + this.firstSpaces(value)
    this.checkSemicolon(value)
    this.raw(node, 'value', value, colon)
  }

  rule(part) {
    let node = new Rule()
    this.init(node, part)

    let selector = part.tokens
    let next = this.parts[this.pos + 1]

    while (!next.end && next.indent.length === part.indent.length) {
      selector.push(['space', next.before + next.indent])
      selector = selector.concat(next.tokens)
      this.pos += 1
      next = this.parts[this.pos + 1]
    }

    this.keepTrailingSpace(node, selector)
    this.checkCurly(selector)
    this.raw(node, 'selector', selector)
  }

  /* Helpers */

  indent(part) {
    let indent = part.indent.length
    let isPrev = typeof this.prevIndent !== 'undefined'

    if (!isPrev && indent) this.indentedFirstLine(part)

    if (!this.step && indent) {
      this.step = indent
      this.root.raws.indent = part.indent
    }

    if (isPrev && this.prevIndent !== indent) {
      let diff = indent - this.prevIndent
      if (diff > 0) {
        if (diff !== this.step) {
          this.wrongIndent(this.prevIndent + this.step, indent, part)
        } else if (this.current.last.push) {
          this.current = this.current.last
        } else {
          this.extraIndent = ''
          for (let i = 0; i < diff; i++) {
            this.extraIndent += ' '
          }
        }
      } else if (diff % this.step !== 0) {
        let m = indent + (diff % this.step)
        this.wrongIndent(`${m} or ${m + this.step}`, indent, part)
      } else {
        for (let i = 0; i < -diff / this.step; i++) {
          this.current = this.current.parent
        }
      }
    }

    this.prevIndent = indent
  }

  init(node, part) {
    this.indent(part)

    if (!this.current.nodes) this.current.nodes = []
    this.current.push(node)

    node.raws.before = part.before + part.indent
    if (this.extraIndent) {
      node.raws.extraIndent = this.extraIndent
      this.extraIndent = false
    }
    node.source = {
      start: { line: part.tokens[0][2], column: part.tokens[0][3] },
      input: this.input
    }
  }

  checkCurly(tokens) {
    for (let token of tokens) {
      if (token[0] === '{') {
        this.error('Unnecessary curly bracket', token[2], token[3])
      }
    }
  }

  checkSemicolon(tokens) {
    for (let token of tokens) {
      if (token[0] === ';') {
        this.error('Unnecessary semicolon', token[2], token[3])
      }
    }
  }

  keepTrailingSpace(node, tokens) {
    let lastSpace = tokens[tokens.length - 1]
    if (lastSpace && lastSpace[0] === 'space') {
      tokens.pop()
      node.raws.sssBetween = lastSpace[1]
    }
  }

  firstSpaces(tokens) {
    let result = ''
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i][0] === 'space' || tokens[i][0] === 'newline') {
        result += tokens.shift()[1]
        i -= 1
      } else {
        break
      }
    }
    return result
  }

  raw(node, prop, tokens, altLast) {
    let token, type
    let length = tokens.length
    let value = ''
    let clean = true
    for (let i = 0; i < length; i += 1) {
      token = tokens[i]
      type = token[0]
      if (type === 'comment' || (type === 'space' && i === length - 1)) {
        clean = false
      } else {
        value += token[1]
      }
    }
    if (!clean) {
      let sss = tokens.reduce((all, i) => all + i[1], '')
      let raw = tokens.reduce((all, i) => {
        if (i[0] === 'comment' && i[6] === 'inline') {
          return all + '/* ' + i[1].slice(2).trim() + ' */'
        } else {
          return all + i[1]
        }
      }, '')
      node.raws[prop] = { value, raw }
      if (sss !== raw) node.raws[prop].sss = sss
    }
    node[prop] = value

    let last
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].length > 2) {
        last = tokens[i]
        break
      }
    }
    if (!last) last = altLast

    node.source.end = {
      line: last[4] || last[2],
      column: last[5] || last[3]
    }
  }

  nextNonComment(pos) {
    let next = pos
    let part
    while (next < this.parts.length) {
      next += 1
      part = this.parts[next]
      if (part.end || !part.comment) break
    }
    return part
  }

  commentText(node, token) {
    let text = token[1]
    if (token[6] === 'inline') {
      node.raws.inline = true
      text = text.slice(2)
    } else {
      text = text.slice(2, -2)
    }

    let match = text.match(/^(\s*)([^]*\S)(\s*)\n?$/)
    if (match) {
      node.text = match[2]
      node.raws.left = match[1]
      node.raws.inlineRight = match[3]
    } else {
      node.text = ''
      node.raws.left = ''
      node.raws.inlineRight = ''
    }
  }

  // Errors

  error(msg, line, column) {
    throw this.input.error(msg, line, column)
  }

  unnamedAtrule(token) {
    this.error('At-rule without name', token[2], token[3])
  }

  unnamedDecl(token) {
    this.error('Declaration without name', token[2], token[3])
  }

  indentedFirstLine(part) {
    this.error('First line should not have indent', part.number, 1)
  }

  wrongIndent(expected, real, part) {
    let msg = `Expected ${expected} indent, but get ${real}`
    this.error(msg, part.number, 1)
  }

  badProp(token) {
    this.error('Unexpected separator in property', token[2], token[3])
  }
}
