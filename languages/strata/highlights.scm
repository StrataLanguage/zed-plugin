; Strata syntax highlighting

; ---------- comments ----------
(comment) @comment

; ---------- keywords ----------
"import" @keyword
"extern" @keyword
"struct" @keyword
"handle" @keyword
"impl" @keyword
"enum" @keyword
"const" @keyword
"property" @keyword
"return" @keyword
"if" @keyword
"else" @keyword
"for" @keyword
"while" @keyword
"break" @keyword
"continue" @keyword
"get" @keyword
"set" @keyword

; ---------- literals ----------
(number) @number
(string) @string
(character) @character
(escape_sequence) @string.escape
(boolean) @boolean
(null_literal) @constant.builtin

; ---------- types ----------
(primitive_type) @type.builtin

(type
  (identifier) @type)

(generic_type
  name: (identifier) @type)

(type_parameter
  name: (identifier) @type)

(array_type
  base: (identifier) @type)

(struct_declaration
  name: (identifier) @type)

(handle_declaration
  name: (identifier) @type)

(enum_declaration
  name: (identifier) @type)

(impl_block
  type: (identifier) @type)

; ---------- functions ----------
(function_definition
  name: (identifier) @function)

(call_expression
  function: (identifier) @function)

(call_expression
  function: (primitive_type) @function)

(call_expression
  function: (member_expression
    field: (identifier) @function))

; ---------- variables / fields / constants ----------
(variable_declaration
  name: (identifier) @variable)

(parameter
  name: (identifier) @variable.parameter)

(member_expression
  field: (identifier) @property)

(property_declaration
  name: (identifier) @property)

(enum_variant
  name: (identifier) @constant)

(const_declaration
  name: (identifier) @constant)

; ---------- attributes ----------
"@" @attribute
(attribute
  name: (identifier) @attribute)

; ---------- modules / imports ----------
(import_path) @string.special

; ---------- operators / punctuation ----------
[
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "<<="
  ">>="
  "&="
  "|="
  "^="
  "||"
  "&&"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "<<"
  ">>"
  "+"
  "-"
  "*"
  "/"
  "%"
  "&"
  "|"
  "^"
  "!"
  "~"
  "?"
  ":"
  "."
  "++"
  "--"
] @operator

[
  ";"
  ","
  "..."
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket
