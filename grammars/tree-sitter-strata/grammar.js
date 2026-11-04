/**
 * Tree-sitter grammar for Strata
 * A C-like custom language with handles, impl blocks, properties, structs, enums.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGN: 1,
  CONDITIONAL: 2,
  OR: 3,
  AND: 4,
  EQUALITY: 5,
  RELATIONAL: 6,
  SHIFT: 7,
  ADD: 8,
  MULT: 9,
  UNARY: 10,
  UPDATE: 11,
  CALL: 12,
  MEMBER: 13,
};

module.exports = grammar({
  name: 'strata',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.array_type, $.expression],
    [$.generic_type, $.expression],
  ],

  rules: {
    source_file: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.import_statement,
      $.function_definition,
      $.struct_declaration,
      $.handle_declaration,
      $.impl_block,
      $.enum_declaration,
      $.const_declaration,
      $.variable_declaration,
      $.property_declaration,
    ),

    // ---------- imports ----------
    import_statement: $ => seq(
      'import',
      field('path', $.import_path),
      ';',
    ),

    import_path: $ => repeat1(
      choice(
        $.identifier,
        '.',
        '/',
      ),
    ),

    // ---------- attributes ----------
    attribute: $ => seq(
      '@',
      field('name', $.identifier),
      optional(field('arguments', $.attribute_arguments)),
    ),

    attribute_arguments: $ => seq(
      '(',
      optional(commaSep($.expression)),
      ')',
    ),

    // ---------- types ----------
    type: $ => choice(
      $.primitive_type,
      $.pointer_type,
      $.array_type,
      $.generic_type,
      $.identifier,
    ),

    primitive_type: _ => token(choice(
      'void',
      'string',
      'bool',
      'int',
      'uint',
      'byte',
      'float',
      'float2',
      'float3',
      'float4',
      // `type` is a built-in meta-type, distinct from user-defined types.
      'type',
    )),

    pointer_type: $ => seq(
      '*',
      field('base', $.type),
    ),

    array_type: $ => seq(
      field('base', choice($.primitive_type, $.generic_type, $.identifier)),
      '[',
      field('size', choice($.number, $.identifier)),
      ']',
    ),

    generic_type: $ => seq(
      field('name', $.identifier),
      field('arguments', $.type_argument_list),
    ),

    type_argument_list: $ => seq(
      '<',
      commaSep1($.type),
      '>',
    ),

    type_parameter_list: $ => seq(
      '<',
      commaSep1($.type_parameter),
      '>',
    ),

    type_parameter: $ => field('name', $.identifier),

    // ---------- functions ----------
    function_definition: $ => seq(
      repeat($.attribute),
      optional('extern'),
      field('return_type', $.type),
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      field('parameters', $.parameter_list),
      choice(
        ';',
        field('body', $.block),
      ),
    ),

    parameter_list: $ => seq(
      '(',
      optional(commaSep(choice($.parameter, '...'))),
      ')',
    ),

    parameter: $ => seq(
      field('type', $.type),
      field('name', $.identifier),
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    _statement: $ => choice(
      $.block,
      $.variable_declaration,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.expression_statement,
      $.empty_statement,
    ),

    variable_declaration: $ => seq(
      repeat($.attribute),
      field('type', $.type),
      field('name', $.identifier),
      optional(seq(
        '=',
        field('value', $.expression),
      )),
      ';',
    ),

    if_statement: $ => prec.right(seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      field('consequence', $._statement),
      optional(seq(
        'else',
        field('alternative', $._statement),
      )),
    )),

    for_statement: $ => seq(
      'for',
      '(',
      optional(choice(
        $.for_variable_declaration,
        $.expression,
      )),
      ';',
      optional(field('condition', $.expression)),
      ';',
      optional(field('update', $.expression)),
      ')',
      field('body', $._statement),
    ),

    for_variable_declaration: $ => seq(
      field('type', $.type),
      field('name', $.identifier),
      optional(seq('=', field('value', $.expression))),
    ),

    while_statement: $ => seq(
      'while',
      '(',
      field('condition', $.expression),
      ')',
      field('body', $._statement),
    ),

    return_statement: $ => seq(
      'return',
      optional(field('value', $.expression)),
      ';',
    ),

    break_statement: _ => seq('break', ';'),
    continue_statement: _ => seq('continue', ';'),

    expression_statement: $ => seq(
      field('value', $.expression),
      ';',
    ),

    empty_statement: _ => ';',

    // ---------- structs / handles / impl / enum / const / property ----------
    struct_declaration: $ => seq(
      repeat($.attribute),
      'struct',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameter_list)),
      choice(
        seq('=', field('alias', $.type), ';'),
        seq(
          '{',
          repeat($.variable_declaration),
          '}',
        ),
      ),
    ),

    handle_declaration: $ => seq(
      repeat($.attribute),
      'handle',
      field('name', $.identifier),
      ';',
    ),

    impl_block: $ => seq(
      repeat($.attribute),
      'impl',
      field('type', $.identifier),
      '{',
      repeat(choice(
        $.function_definition,
        $.property_declaration,
      )),
      '}',
    ),

    property_declaration: $ => seq(
      repeat($.attribute),
      'property',
      field('type', $.type),
      field('name', $.identifier),
      '{',
      repeat($.property_accessor),
      '}',
    ),

    property_accessor: $ => seq(
      field('kind', choice('get', 'set')),
      '=',
      field('value', $.expression),
      ';',
    ),

    enum_declaration: $ => seq(
      repeat($.attribute),
      'enum',
      field('name', $.identifier),
      '{',
      optional(commaSep1($.enum_variant)),
      optional(','),
      '}',
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(seq(
        '=',
        field('value', $.expression),
      )),
    ),

    const_declaration: $ => seq(
      repeat($.attribute),
      'const',
      field('type', $.type),
      field('name', $.identifier),
      '=',
      field('value', $.expression),
      ';',
    ),

    // ---------- expressions ----------
    expression: $ => choice(
      $.assignment_expression,
      $.conditional_expression,
      $.binary_expression,
      $.unary_expression,
      $.update_expression,
      $.call_expression,
      $.member_expression,
      $.index_expression,
      $.parenthesized_expression,
      $.identifier,
      $.number,
      $.string,
      $.character,
      $.boolean,
      $.null_literal,
    ),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', choice(
        $.identifier,
        $.member_expression,
        $.index_expression,
      )),
      field('operator', choice('=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '&=', '|=', '^=')),
      field('right', $.expression),
    )),

    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression),
    )),

    binary_expression: $ => choice(
      prec.left(PREC.OR, seq(field('left', $.expression), field('operator', '||'), field('right', $.expression))),
      prec.left(PREC.AND, seq(field('left', $.expression), field('operator', '&&'), field('right', $.expression))),
      prec.left(PREC.EQUALITY, seq(field('left', $.expression), field('operator', choice('==', '!=')), field('right', $.expression))),
      prec.left(PREC.RELATIONAL, seq(field('left', $.expression), field('operator', choice('<', '<=', '>', '>=')), field('right', $.expression))),
      prec.left(PREC.SHIFT, seq(field('left', $.expression), field('operator', choice('<<', '>>')), field('right', $.expression))),
      prec.left(PREC.ADD, seq(field('left', $.expression), field('operator', choice('+', '-')), field('right', $.expression))),
      prec.left(PREC.MULT, seq(field('left', $.expression), field('operator', choice('*', '/', '%')), field('right', $.expression))),
      prec.left(PREC.MULT, seq(field('left', $.expression), field('operator', choice('&', '|', '^')), field('right', $.expression))),
    ),

    unary_expression: $ => prec(PREC.UNARY, seq(
      field('operator', choice('!', '-', '+', '~')),
      field('argument', $.expression),
    )),

    update_expression: $ => prec.left(PREC.UPDATE, choice(
      seq(field('operator', choice('++', '--')), field('argument', $.expression)),
      seq(field('argument', $.expression), field('operator', choice('++', '--'))),
    )),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', choice(
        $.member_expression,
        $.identifier,
        $.primitive_type,
      )),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq(
      '(',
      optional(commaSep($.expression)),
      ')',
    ),

    member_expression: $ => prec.left(PREC.MEMBER, seq(
      field('object', $.expression),
      '.',
      field('field', $.identifier),
    )),

    index_expression: $ => prec(PREC.CALL, seq(
      field('object', $.expression),
      '[',
      field('index', $.expression),
      ']',
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    // ---------- literals ----------
    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: _ => token(choice(
      /0[xX][0-9a-fA-F]+/,
      /\d+\.\d*([eE][+-]?\d+)?f?/,
      /\.\d+([eE][+-]?\d+)?f?/,
      /\d+[eE][+-]?\d+f?/,
      /\d+f?/,
    )),

    string: $ => seq(
      '"',
      repeat(choice(
        $._string_content,
        $.escape_sequence,
      )),
      '"',
    ),

    _string_content: _ => token.immediate(prec(1, /[^"\\]+/)),

    character: $ => seq(
      "'",
      repeat1(choice(
        $._character_content,
        $.escape_sequence,
      )),
      "'",
    ),

    _character_content: _ => token.immediate(prec(1, /[^'\\]+/)),

    escape_sequence: _ => token.immediate(seq(
      '\\',
      /./,
    )),

    boolean: _ => choice('true', 'false'),

    null_literal: _ => 'null',

    comment: _ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  },
});

function commaSep(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
