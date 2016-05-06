" snippet
"
" Integration layer to hook up to a snippet engine (ie, UltiSnips)

let s:currentSnippet = 0
let s:snippetPrefix = "ex"
let s:snippets = {}

function! extropy#snippet#clearAnonymousSnippets()
    let s:snippets = {}
endfunction


function! extropy#snippet#addAnonymousSnippet(lines)
    let s:currentSnippet = s:currentSnippet + 1
    let prefix = s:snippetPrefix . string(s:currentSnippet)
    let s:snippets[prefix] = lines
endfunction

function! extropy#snippet#expandAnonymousSnippet(id)
    " TODO: Assuming UltiSnips is enabled...

python << EOF
from UltiSnips import UltiSnips_Manager
UltiSnips_Manager.expand_anon("oh hai hi hi")
EOF

endfunction
