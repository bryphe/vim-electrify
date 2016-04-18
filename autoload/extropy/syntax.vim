
" setSyntaxHighlighting
"
" Sets syntax highlighting for keywords
"
" Expects a Dictionary like:
" {
"   'Function': ['keyword1', 'keyword2'],
"   'Comment': ['keyword3', 'keyword4']
" }
function! extropy#syntax#setKeywordHighlighting(serializedHighlightDictionary)
    call extropy#debug#logInfo("extropy#syntax#setKeywordHighlighting:".a:serializedHighlightDictionary)
    let highlightDictionary = extropy#js#deserialize(a:serializedHighlightDictionary)

    let highlightPrefix = bufnr('%')."_"."extropy_"

    for key in keys(highlightDictionary)
        execute "highlight link ".highlightPrefix.key." ".key
        let keys = join(highlightDictionary[key], " ")
        execute "syntax clear " .highlightPrefix.key
        execute "syntax keyword ".highlightPrefix.key." ".keys
    endfor
endfunction

