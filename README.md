# Strata for Zed

A [Zed](https://zed.dev/) extension that adds support for the custom **Strata**
language (`.strata` files): syntax highlighting, bracket matching,
auto-indentation, and code outline — powered by a bundled
[Tree-sitter](https://tree-sitter.github.io/) grammar.

Syntax coverage is derived from the samples in [`examples/`](examples/):

- `//` line comments and `/* … */` block comments
- `import ../common;` statements
- `extern` function declarations (including `...` varargs, e.g. `printf`)
- `struct` aliases (`struct OBJECTID = uint;`) and struct blocks with
  `float[4]`-style array members
- `handle OBJECT;` declarations
- `impl OBJECT { … }` blocks with methods and
  `property float3 position { get = …; }` accessors
- `enum FACE_DIRECTION { X = 1, … }` with trailing commas
- `const uint … = (1 << 0);` constants and global variables
- `@private` attributes
- C-like functions, `if`/`else`, `for`, `while`, `return`, `break`, `continue`
- Expressions: `|| && == != < <= > >= << >> + - * / %`, unary `! -`,
  postfix/prefix `++ --`, ternary `?:`, calls (`float3(…)`,
  `KEY.K_U.is_pressed()`), member access (`.`), indexing (`levels[0]`),
  parenthesized expressions
- Literals: `0.05f`-style floats, integers, `"strings"`, `true`/`false`

## Layout

```
strata-zed/
├── extension.toml                  # Zed extension manifest + grammar pin
├── languages/
│   └── strata/
│       ├── config.toml             # language config (.strata, comments, brackets)
│       ├── highlights.scm          # syntax highlighting queries
│       ├── brackets.scm            # bracket matching
│       ├── indents.scm             # auto-indentation
│       ├── outline.scm             # code outline / symbols
│       └── overrides.scm           # comment/string scopes
├── grammars/
│   └── tree-sitter-strata/         # vendored Tree-sitter grammar source
│       ├── grammar.js
│       ├── queries/highlights.scm
│       ├── src/parser.c            # generated (do not edit by hand)
│       └── test/corpus/            # parser tests
└── examples/                       # sample .strata files
```

## Prerequisites

- [Zed](https://zed.dev/) (for installing/using the extension)
- [tree-sitter CLI](https://tree-sitter.github.io/) ≥ 0.26 (for grammar dev;
  `tree-sitter generate`, `tree-sitter test`, `tree-sitter parse`)
- Node.js (only for `npx tree-sitter-cli`, optional if using the binary)
- Rust via rustup + wasi-sdk (Zed downloads wasi-sdk automatically when
  compiling the grammar; set `WASI_SDK_PATH` to reuse an existing install)

## Grammar development

All commands run from `grammars/tree-sitter-strata`:

```sh
cd grammars/tree-sitter-strata

# Regenerate the parser after editing grammar.js
tree-sitter generate

# Run corpus tests
tree-sitter test

# Parse the bundled examples (should report no ERROR/MISSING)
tree-sitter parse ../../examples/common.strata
tree-sitter parse ../../examples/editor/mode_common.strata
tree-sitter parse ../../examples/editor/example.strata

# Sanity-check Zed queries against the local grammar
tree-sitter query ../../languages/strata/highlights.scm ../../examples/common.strata
tree-sitter query ../../languages/strata/brackets.scm ../../examples/common.strata
tree-sitter query ../../languages/strata/outline.scm ../../examples/common.strata
tree-sitter query ../../languages/strata/indents.scm ../../examples/common.strata
```

## Install in Zed (dev extension)

1. Push this repository to GitHub.
2. In `extension.toml`, set `[grammars.strata]` to the real repository URL
   and to a commit SHA that contains `grammars/tree-sitter-strata`:
   ```toml
   [grammars.strata]
   repository = "https://github.com/YOU/strata-zed"
   rev = "<commit-sha>"
   path = "grammars/tree-sitter-strata"
   ```
3. In Zed: Command Palette → `zed: install dev extension` → select this folder.
4. Open any `.strata` file (e.g. `examples/common.strata`) and confirm
   highlighting, outline (`cmd-shift-O`), and comment toggling (`cmd-/`).
5. Troubleshoot via `zed: open log`, or run `zed --foreground` for verbose logs.

> Iterating on the grammar without pushing: temporarily point
> `[grammars.strata].repository` at your local checkout, e.g.
> `repository = "file:///ABSOLUTE/PATH/TO/strata-zed"`,
> `rev = "<local commit SHA>"`, keeping
> `path = "grammars/tree-sitter-strata"`. Zed will `git fetch` that rev from
> the local repo. Restore the HTTPS URL + pushed SHA before publishing.
> If you switch between local and remote grammars, delete Zed's cached
> `grammars/strata` checkout inside the extension dir.

## Publishing

- Bump `version` in `extension.toml`.
- Ensure `rev` points at a pushed commit containing the grammar.
- Submit the repo to [zed-industries/extensions](https://github.com/zed-industries/extensions)
  following the Zed docs.

## License

MIT — see [LICENSE](LICENSE).
