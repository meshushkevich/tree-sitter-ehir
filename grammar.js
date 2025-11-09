/**
 * @file Parser for EHIR
 * @author Maksim Shushkevich <m.e.shushkevich@yandex.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "ehir",

  rules: {
    // extras: ($) => [/\s/, $.line_comment, $.block_comment],

    source_file: ($) => seq(repeat($._statement)),

    _statement: ($) => $._declaration_statement, // choice($.expression_statement, $._declaration_statement),

    _declaration_statement: ($) =>
      choice(
        $.fn_item,
        // $.fdecl_item,
        // $.fdefi_item,
        // $.c_like_struct_item,
        // $.tuple_like_struct_item,
        // $.unit_like_struct_item,
      ),

    fn_item: ($) =>
      seq(
        optional($.visibility_modifier),
        "fn",
        field("name", $.identifier),
        field("parameters", $.parameters),
        optional(seq("->", field("return_type", $._type))),
        field("body", $.block),
      ),
    visibility_modifier: ($) => "pub",
    identifier: ($) => /[-a-zA-Z$._][-a-zA-Z$._0-9]*/,
    parameters: ($) => seq("(", commaSep($.param), optional(","), ")"),
    _type: ($) => $.identifier,
    block: ($) => "{}",
    param: ($) => seq($.identifier, ":", $._type),
    // c_like_struct_item: ($) =>
    //   seq(
    //     optional($.visibility_modifier),
    //     "struct",
    //     field("name", $._type_identifier),
    //     field("type_parameters", optional($.type_parameters)),
    //     choice(
    //       seq(
    //         optional($.where_clause),
    //         field("body", $.field_declaration_list),
    //       ),
    //       seq(
    //         field("body", $.ordered_field_declaration_list),
    //         optional($.where_clause),
    //         ";",
    //       ),
    //       ";",
    //     ),
    //   ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
