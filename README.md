# Strata for Zed

A Zed extension that adds support for the **Strata**
language.

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

## Install in Zed

- In Zed: Command Palette → `zed: install dev extension` and select this folder.
