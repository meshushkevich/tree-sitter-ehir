/**
 * @file Parser for EHIR
 * @author Maksim Shushkevich <m.e.shushkevich@yandex.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "ehir",
  extras: ($) => [/\s+/, $.comment],
  conflicts: ($) => [],
  rules: {
    module: ($) =>
      repeat(
        choice(
          $.instruction_imp,
          $.instruction_c_like_struct,
          $.instruction_tuple_like_struct,
          $.instruction_unit_like_struct,
          $.instruction_enum,
          $.instruction_fn,
          $.instruction_fdecl,
          $.instruction_fdefi,
        ),
      ),
    instruction_imp: ($) =>
      seq(
        optional($.visibility_modifier),
        "imp",
        field("source", $.identifier),
        "::",
        field("symbol", $.identifier),
      ),
    instruction_c_like_struct: ($) =>
      seq(
        field("public", optional($.visibility_modifier)),
        field("name", $.identifier),
        field("generics", optional($.generic_params)),
        "{",
        field("body", repeat($.typed_variable)),
        "}",
      ),
    instruction_tuple_like_struct: ($) =>
      seq(
        field("public", optional($.visibility_modifier)),
        field("name", $.identifier),
        field("generics", optional($.generic_params)),
        field("types", seq("(", commaSep($.type), ")")),
      ),
    instruction_unit_like_struct: ($) =>
      seq(
        field("public", optional($.visibility_modifier)),
        field("name", $.identifier),
      ),

    instruction_enum: ($) =>
      seq(
        field("public", optional($.visibility_modifier)),
        "enum",
        field("name", $.identifier),
        field("generics", optional($.generic_params)),
        field(
          "body",
          seq(
            "{",
            repeat(
              choice(
                $.instruction_c_like_struct,
                $.instruction_tuple_like_struct,
                $.instruction_unit_like_struct,
              ),
            ),
            "}",
          ),
        ),
      ),

    instruction_fn: ($) =>
      seq(
        "fn",
        field("public", optional($.visibility_modifier)),
        field("name", $.identifier),
        field("generics", optional($.generic_params)),
        field("parameters", $.parameters),
        "->",
        field("ret_type", $.type),
        field("body", $.func_body),
      ),

    instruction_fdecl: ($) =>
      seq(
        "fdecl",
        field("public", optional($.visibility_modifier)),
        field("name", $.identifier),
        field("parameters", $.parameters),
        seq("->", field("return_type", $.type)),
      ),

    instruction_fdefi: ($) =>
      seq(
        "fdefi",
        field("name", $.identifier),
        field("body", "{", repeat($.block), "}"),
      ),

    visibility_modifier: ($) => "@",
    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    parameters: ($) => seq("(", commaSep($.param), ")"),
    type: ($) =>
      seq(
        field("name", $.identifier),
        field("pointer", optional(seq("<", $.identifier, ">"))),
        field("generic_args", optional(seq("[", commaSep($.type), "]"))),
      ),
    block: ($) =>
      seq(field("label", $.block_label), ":", repeat($._instruction)),
    block_label: ($) => seq("$", field("name", $.identifier)),
    param: ($) => seq(field("name", $.identifier), ":", field("type", $.type)),
    comment: ($) => /;.*/,
    _instruction: ($) =>
      choice(
        $.instruction_add,
        $.instruction_sub,
        $.instruction_mul,
        $.instruction_div,
        $.instruction_rem,
        $.instruction_grt,
        $.instruction_geq,
        $.instruction_les,
        $.instruction_leq,
        $.instruction_neq,
        $.instruction_ieq,
        $.instruction_or,
        $.instruction_and,
        $.instruction_lsh,
        $.instruction_rsh,
        $.instruction_xor,

        $.instruction_getfieldptr,
        $.instruction_getptr,

        $.instruction_call,
        $.instruction_not,

        $.instruction_capa,
        $.instruction_caps,
        $.insrtuction_cape,
        $.instruction_capsh,
        $.instruction_capeh,
        $.instruction_store,
        $.instruction_load,
        $.instruction_cast,

        $.instruction_br,
        $.instruction_cbr,
        $.instruction_ret,
        $.instruction_switch,
        $.instruction_match,
      ),

    instruction_add: ($) =>
      seq($._assignable, "add", $._any_variable, ",", $._any_variable),
    instruction_sub: ($) =>
      seq($._assignable, "sub", $._any_variable, ",", $._any_variable),
    instruction_mul: ($) =>
      seq($._assignable, "mul", $._any_variable, ",", $._any_variable),
    instruction_div: ($) =>
      seq($._assignable, "div", $._any_variable, ",", $._any_variable),
    instruction_rem: ($) =>
      seq($._assignable, "rem", $._any_variable, ",", $._any_variable),
    instruction_grt: ($) =>
      seq($._assignable, "grt", $._any_variable, ",", $._any_variable),
    instruction_geq: ($) =>
      seq($._assignable, "geq", $._any_variable, ",", $._any_variable),
    instruction_les: ($) =>
      seq($._assignable, "les", $._any_variable, ",", $._any_variable),
    instruction_leq: ($) =>
      seq($._assignable, "leq", $._any_variable, ",", $._any_variable),
    instruction_neq: ($) =>
      seq($._assignable, "neq", $._any_variable, ",", $._any_variable),
    instruction_ieq: ($) =>
      seq($._assignable, "ieq", $._any_variable, ",", $._any_variable),
    instruction_or: ($) =>
      seq($._assignable, "or", $._any_variable, ",", $._any_variable),
    instruction_and: ($) =>
      seq($._assignable, "and", $._any_variable, ",", $._any_variable),
    instruction_lsh: ($) =>
      seq($._assignable, "lsh", $._any_variable, ",", $._any_variable),
    instruction_rsh: ($) =>
      seq($._assignable, "rsh", $._any_variable, ",", $._any_variable),
    instruction_xor: ($) =>
      seq($._assignable, "xor", $._any_variable, ",", $._any_variable),

    instruction_getfieldptr: ($) =>
      seq(
        $._assignable,
        "getfieldptr",
        $._any_variable,
        repeat(seq("::", choice($._any_variable, /\d+/))),
      ),
    instruction_getptr: ($) => seq($._assignable, "getptr", $._any_variable),

    instruction_call: ($) =>
      seq(
        $._assignable,
        "call",
        field("func_name", $.identifier),
        "(",
        commaSep($._any_variable),
        ")",
      ),
    instruction_not: ($) => seq($._assignable, "not", $._any_variable),

    instruction_capa: ($) => seq($._assignable, "capa", $.atomic),
    instruction_caps: ($) =>
      seq($._assignable, "caps", $.structure_initialization),
    insrtuction_cape: ($) => seq($._assignable, "cape", $.enum_initialization),
    instruction_capsh: ($) => seq($._assignable, "capsh", $.identifier),
    instruction_capeh: ($) => seq($._assignable, "capeh", $.identifier),
    instruction_store: ($) =>
      seq("store", $._any_variable, ",", $._any_variable),
    instruction_load: ($) => seq($._assignable, "load", $._any_variable),
    instruction_cast: ($) =>
      seq($._assignable, "cast", $._any_variable, $.type),

    instruction_br: ($) => seq("br", field("label", $.block_label)),
    instruction_cbr: ($) =>
      seq(
        "cbr",
        field("condition", $._any_variable),
        ",",
        field("true_br", $.block_label),
        ",",
        field("else_br", $.block_label),
      ),
    instruction_ret: ($) => seq("ret", field("variable", $._any_variable)),
    instruction_switch: ($) =>
      seq(
        "switch",
        field("variable", $._any_variable),
        ",",
        field("default", $.block_label),
        "{",
        repeat(seq(/\d+/, "=>", $.block_label)),
        "}",
      ),
    instruction_match: ($) =>
      seq(
        "match",
        field("variable", $._any_variable),
        ",",
        field("default", $.identifier),
        "{",
        repeat(
          seq(
            $.identifier,
            "(",
            repeat($._any_variable),
            ")",
            "=>",
            $.identifier,
          ),
        ),
        "}",
      ),

    _assignable: ($) => seq(field("assign_to", $._any_variable), "="),

    _any_variable: ($) => choice($.typed_variable, $.untyped_variable),
    untyped_variable: ($) => field("name", $.identifier),
    typed_variable: ($) =>
      seq(field("name", $.identifier), ":", field("type", $.type)),
    atomic: ($) => choice($.isized_int, $.usized_int),
    isized_int: ($) => seq($.int, /_i\d+/),
    usized_int: ($) => seq($.int, /_u\d+/),
    int: ($) => choice($._hex, $._oct, $._bin, $._dec),
    _hex: ($) => /0[xX][0-9a-fA-F]+(?:_[0-9a-fA-F]+)*/,
    _oct: ($) => /0[oO][0-7]+(?:_[0-7]+)*/,
    _bin: ($) => /0[bB][01]+(?:_[01]+)*/,
    _dec: ($) => /[0-9]+(?:_[0-9]+)*/,
    generic_params: ($) => seq("[", commaSep($.identifier), "]"),
    func_body: ($) => seq("{", repeat($.block), "}"),
    structure_initialization: ($) =>
      seq(
        field("type", $.type),
        field("args", seq("(", commaSep($._any_variable), ")")),
      ),
    enum_initialization: ($) =>
      seq(
        field("name", $.identifier),
        field("generic_args", optional(seq("[", commaSep($.type), "]"))),
        "::",
        field("variant", $.identifier),
        field("args", optional(seq("(", commaSep($._any_variable), ")"))),
      ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
