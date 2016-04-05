
if exists("g:loaded_vim_node_plugins") 
    finish
endif

if !has("clientserver")
    echom "vim-node-plugins requires clientserver"
    finish
endif

if !has("python")
    echom "vim-node-plugins requires python"
    finish
endif

if !exists("g:extropy_nodejs_enabled")
    let g:extropy_nodejs_enabled = 1
endif

if !exists("g:extropy_nodejs_enable_acp")
    let g:extropy_nodejs_enable_acp = 1
endif

call extropy#js#initializeEventListeners()
call extropy#js#start()

if g:extropy_nodejs_enable_acp == 1
    call extropy#omnicomplete#enableAutocomplete()
endif
