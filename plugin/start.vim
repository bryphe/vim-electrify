
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

let g:extropy_nodeplugins_debugmode = 0

call extropy#js#initializeEventListeners()
call extropy#js#start()
