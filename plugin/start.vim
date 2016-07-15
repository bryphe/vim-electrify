" Start.vim
" Entry point for the vim-electrify plugin

if exists("g:loaded_vim_node_plugins") 
    finish
endif

if !has("clientserver")
    echom "vim-electrify requires +clientserver"
    finish
endif

if !has("python")
    echom "vim-electrify requires python"
    finish
endif

if !exists("g:extropy_nodejs_enabled")
    let g:extropy_nodejs_enabled = 1
endif

let g:extropy_nodeplugins_debugmode = 0

augroup ExtropyBufferUpdates
    autocmd! CursorHold * :call extropy#js#notifyBufferUpdated()
    autocmd! CursorHoldI * :call extropy#js#notifyBufferUpdated()
    autocmd! InsertEnter * :call extropy#js#notifyBufferUpdated()
    autocmd! InsertChange * :call extropy#js#notifyBufferUpdated()
    autocmd! InsertLeave * :call extropy#js#notifyBufferUpdated()
    autocmd! CursorMoved * :call extropy#js#notifyBufferUpdated()
    autocmd! CursorMovedI * :call extropy#js#notifyBufferUpdated()
augroup END

augroup ExtropyEventListeners
    autocmd!
    autocmd! BufEnter * :call extropy#js#notifyBufferEvent("BufEnter")
    autocmd! VimLeave * :call extropy#js#notifyBufferEvent("VimLeave")
    autocmd! CursorMoved * :call extropy#js#notifyBufferEvent("CursorMoved")
    autocmd! CursorMovedI * :call extropy#js#notifyBufferEvent("CursorMovedI")
augroup END

augroup ExtropyLifecycleListeners
    autocmd!
    autocmd! CursorHold * :call extropy#command#flushIncomingCommands()
    autocmd! CursorMoved * :call extropy#command#flushIncomingCommands()
    autocmd! CursorHoldI * :call extropy#command#flushIncomingCommands()
    autocmd! CursorMovedI * :call extropy#command#flushIncomingCommands()
    autocmd! VimLeave * :call extropy#js#disconnectTcp()
augroup END

call extropy#js#start()
call extropy#omnicomplete#initializeCompletion()
call extropy#command#startWatcher()
