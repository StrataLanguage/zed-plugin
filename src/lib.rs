// Zed extension for Strata. Syntax highlighting comes from the tree-sitter grammar and queries in this
// repository; this file starts the language server (`strata-lsp`, built from the stratac repository).

use zed_extension_api::{self as zed, LanguageServerId, Result, Worktree};

struct StrataExtension;

impl zed::Extension for StrataExtension {
    fn new() -> Self {
        StrataExtension
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<zed::Command> {
        // Found on the PATH Zed inherits. Override the location with `lsp.strata-lsp.binary.path` in Zed settings.
        let command = worktree.which("strata-lsp").ok_or_else(|| {
            "strata-lsp was not found on PATH. Build it from the stratac repository (target strata-lsp) \
             and put it on PATH, or set lsp.strata-lsp.binary.path in Zed settings."
                .to_string()
        })?;

        Ok(zed::Command {
            command,
            args: Vec::new(),
            env: Vec::new(),
        })
    }
}

zed::register_extension!(StrataExtension);
