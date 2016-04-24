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

    if !exists("b:extropy_nodejs_usedSyntaxGroups")
        let b:extropy_nodejs_usedSyntaxGroups = []
    endif

    call extropy#debug#logInfo("extropy#syntax#setKeywordHighlighting:".a:serializedHighlightDictionary)
    let highlightDictionary = extropy#js#deserialize(a:serializedHighlightDictionary)

    let highlightPrefix = bufnr('%')."_"."extropy_"

    for key in keys(highlightDictionary)
        let keywords = highlightDictionary[key]

        if len(keywords) == 0
            continue
        endif

        let highlightLinkGroup = highlightPrefix.key

        let keys = join(highlightDictionary[key], " ")

        if index(b:extropy_nodejs_usedSyntaxGroups, highlightLinkGroup) > -1
            execute "syntax clear " .highlightLinkGroup
        endif

        execute "highlight link ".highlightLinkGroup." ".key
        execute "syntax keyword ".highlightLinkGroup." ".keys
        call add(b:extropy_nodejs_usedSyntaxGroups, highlightLinkGroup)
    endfor

    redraw
endfunction

