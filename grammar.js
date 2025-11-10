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
  conflicts: ($) => [
    [$.instruction_enum],
    [$.instruction_tuple_like_struct, $.parameters],
  ],
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
        optional($.visibility_modifier),
        field("name", $.identifier),
        field("parameters", $.parameters),
      ),
    instruction_tuple_like_struct: ($) =>
      seq(
        optional($.visibility_modifier),
        field("name", $.identifier),
        field("types", seq("(", commaSep($._type), ")")),
      ),
    instruction_unit_like_struct: ($) =>
      seq(optional($.visibility_modifier), field("name", $.identifier)),

    instruction_enum: ($) =>
      seq(
        optional($.visibility_modifier),
        "enum",
        field("name", $.identifier),
        field(
          "variants",
          repeat(
            choice(
              $.instruction_c_like_struct,
              $.instruction_tuple_like_struct,
              $.instruction_unit_like_struct,
            ),
          ),
        ),
      ),

    instruction_fn: ($) =>
      seq(
        optional($.visibility_modifier),
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameters),
        seq("->", field("return_type", $._type)),
        field("body", seq("{", repeat($.block), "}")),
      ),

    instruction_fdecl: ($) =>
      seq(
        "fdecl",
        optional($.visibility_modifier),
        field("name", $.identifier),
        field("parameters", $.parameters),
        seq("->", field("return_type", $._type)),
      ),

    instruction_fdefi: ($) =>
      seq(
        "fdefi",
        field("name", $.identifier),
        field("body", "{", repeat($.block), "}"),
      ),

    visibility_modifier: ($) => "pub",
    identifier: ($) => /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
    parameters: ($) => seq("(", commaSep($.param), optional(","), ")"),
    _type: ($) => $.identifier,
    block: ($) =>
      seq(field("block_name", $.identifier), "{", repeat($.instruction), "}"),
    param: ($) => seq($.identifier, ":", $._type),
    comment: ($) => /;.*/,
    instruction: ($) =>
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
      seq($._assignable, "add", $.any_variable, ",", $.any_variable),
    instruction_sub: ($) =>
      seq($._assignable, "sub", $.any_variable, ",", $.any_variable),
    instruction_mul: ($) =>
      seq($._assignable, "mul", $.any_variable, ",", $.any_variable),
    instruction_div: ($) =>
      seq($._assignable, "div", $.any_variable, ",", $.any_variable),
    instruction_rem: ($) =>
      seq($._assignable, "rem", $.any_variable, ",", $.any_variable),
    instruction_grt: ($) =>
      seq($._assignable, "grt", $.any_variable, ",", $.any_variable),
    instruction_geq: ($) =>
      seq($._assignable, "geq", $.any_variable, ",", $.any_variable),
    instruction_les: ($) =>
      seq($._assignable, "les", $.any_variable, ",", $.any_variable),
    instruction_leq: ($) =>
      seq($._assignable, "leq", $.any_variable, ",", $.any_variable),
    instruction_neq: ($) =>
      seq($._assignable, "neq", $.any_variable, ",", $.any_variable),
    instruction_ieq: ($) =>
      seq($._assignable, "ieq", $.any_variable, ",", $.any_variable),
    instruction_or: ($) =>
      seq($._assignable, "or", $.any_variable, ",", $.any_variable),
    instruction_and: ($) =>
      seq($._assignable, "and", $.any_variable, ",", $.any_variable),
    instruction_lsh: ($) =>
      seq($._assignable, "lsh", $.any_variable, ",", $.any_variable),
    instruction_rsh: ($) =>
      seq($._assignable, "rsh", $.any_variable, ",", $.any_variable),
    instruction_xor: ($) =>
      seq($._assignable, "xor", $.any_variable, ",", $.any_variable),

    instruction_getfieldptr: ($) =>
      seq(
        $._assignable,
        "getfieldptr",
        $.any_variable,
        repeat(seq("::", choice($.any_variable, /\d+/))),
      ),
    instruction_getptr: ($) => seq($._assignable, "getptr", $.any_variable),

    instruction_call: ($) =>
      seq(
        $._assignable,
        "call",
        field("func_name", $.identifier),
        "(",
        commaSep($.any_variable),
        ")",
      ),
    instruction_not: ($) => seq($._assignable, "not", $.any_variable),

    instruction_capa: ($) => seq($._assignable, "capa", $.atomic),
    instruction_caps: ($) => seq($._assignable, "caps", $.identifier),
    insrtuction_cape: ($) => seq($._assignable, "cape", $.identifier),
    instruction_capsh: ($) => seq($._assignable, "capsh", $.identifier),
    instruction_capeh: ($) => seq($._assignable, "capeh", $.identifier),
    instruction_store: ($) => seq("store", $.any_variable, ",", $.any_variable),
    instruction_load: ($) => seq($._assignable, "load", $.any_variable),
    instruction_cast: ($) =>
      seq($._assignable, "cast", $.any_variable, $._type),

    instruction_br: ($) => seq("br", field("label", $.identifier)),
    instruction_cbr: ($) =>
      seq(
        "cbr",
        field("condition", $.any_variable),
        ",",
        field("true_br", $.identifier),
        ",",
        field("else_br", $.identifier),
      ),
    instruction_ret: ($) => seq("ret", field("variable", $.any_variable)),
    instruction_switch: ($) =>
      seq(
        "switch",
        field("variable", $.any_variable),
        ",",
        field("default", $.identifier),
        "{",
        repeat(seq(/\d+/, "=>", $.identifier)),
        "}",
      ),
    instruction_match: ($) =>
      seq(
        "match",
        field("variable", $.any_variable),
        ",",
        field("default", $.identifier),
        "{",
        repeat(
          seq(
            $.identifier,
            "(",
            repeat($.any_variable),
            ")",
            "=>",
            $.identifier,
          ),
        ),
        "}",
      ),

    _assignable: ($) => seq($.any_variable, "="),

    any_variable: ($) => choice($.typed_variable, $.untyped_variable),
    untyped_variable: ($) => $.identifier,
    typed_variable: ($) => seq($.untyped_variable, ":", $._type),
    atomic: ($) => choice($.isized_int, $.usized_int),
    isized_int: ($) => /\d+_i\d+/,
    usized_int: ($) => /\d+_u\d+/,
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
