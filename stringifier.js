const DEFAULT_RAWS = {
  colon: ': ',
  indent: '  ',
  commentLeft: ' ',
  commentRight: ' '
}

module.exports = class Stringifier {
  constructor (builder) {
    this.builder = builder
  }

  stringify (node, semicolon) {
    this[node.type](node, semicolon)
  }

  root (node) {
    this.body(node)
    if (node.raws.after) this.builder(node.raws.after)
  }

  comment (node) {
    let left = DEFAULT_RAWS.commentLeft
    let right = DEFAULT_RAWS.commentRight
    if (this.has(node.raws.left)) left = node.raws.left

    if (node.raws.inline) {
      if (this.has(node.raws.inlineRight)) {
        right = node.raws.inlineRight
      } else {
        right = ''
      }
      if (node.raws.extraIndent) {
        this.builder(node.raws.extraIndent)
      }
      this.builder('//' + left + node.text + right, node)
    } else {
      if (this.has(node.raws.right)) right = node.raws.right
      this.builder('/*' + left + node.text + right + '*/', node)
    }
  }

  decl (node) {
    let between = node.raws.between || DEFAULT_RAWS.colon
    let string = node.prop + between + this.rawValue(node, 'value')

    if (node.important) {
      string += node.raws.important || ' !important'
    }

    this.builder(string, node)
  }

  rule (node) {
    this.block(node, this.rawValue(node, 'selector'))
  }

  atrule (node) {
    let name = '@' + node.name
    let params = node.params ? this.rawValue(node, 'params') : ''

    if (this.has(node.raws.afterName)) {
      name += node.raws.afterName
    } else if (params) {
      name += ' '
    }

    this.block(node, name + params)
  }

  body (node) {
    let indent = node.root().raws.indent || DEFAULT_RAWS.indent

    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i]
      let before =
        child.raws.before.replace(/[^\n]*$/, '') + this.indent(node, indent)
      if (child.type === 'comment' && !child.raws.before.includes('\n')) {
        before = child.raws.before
      }
      if (before) this.builder(before)
      this.stringify(child)
    }
  }

  block (node, start) {
    let between = node.raws.sssBetween || ''
    this.builder(start + between, node, 'start')
    if (this.has(node.nodes)) this.body(node)
  }

  indent (node, step) {
    let result = ''
    while (node.parent) {
      result += step
      node = node.parent
    }
    return result
  }

  has (value) {
    return typeof value !== 'undefined'
  }

  rawValue (node, prop) {
    let value = node[prop]
    let raw = node.raws[prop]
    if (raw && raw.value === value) {
      return raw.sss || raw.raw
    } else {
      return value
    }
  }
}
