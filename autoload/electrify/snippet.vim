" snippet
"
" Integration layer to hook up to a snippet engine (ie, UltiSnips)

let s:currentSnippet = 0
let s:snippetPrefix = "ex"
let s:snippets = {}

function! electrify#snippet#expandAnonymousSnippet(snippet)
" TODO: Assuming UltiSnips is enabled...

python << EOF
from UltiSnips import UltiSnips_Manager
snippet = vim.eval("a:snippet")
UltiSnips_Manager.expand_anon(snippet)
EOF

endfunction
