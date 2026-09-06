; Strata auto-indentation

(block) @indent

(impl_block
  "{" @start
  "}" @end) @indent

(struct_declaration
  "{" @start
  "}" @end) @indent

(enum_declaration
  "{" @start
  "}" @end) @indent

(property_declaration
  "{" @start
  "}" @end) @indent

(if_statement) @start.if

(for_statement) @indent
(while_statement) @indent
