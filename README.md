# vim-electrify
###### Write VIM plugins in JavaScript, powered by [Electron](http://electron.atom.io)
---------------------------------------------------

- [Intro](#intro)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Windows](#windows)
- [Guide](#guide)
    - [Architecture](#architecture)
    - [API](#api)
    - [Examples](#examples)
- [FAQ](#faq)
- [Contact](#contact)
- [License](#license)

Intro
-----

vim-electrify is a VIM plugin that enables the authoring of JavaScript plugins,
running in a Node/Electron environment. These plugins are asynchronous by nature.

The motivation for me is I do most of work with front-end languages (JS, TS, etc),
and I preferred authoring plugins in those languages, if possible. In particular,
a rich OmniComplete API is provided, which allows easy integration and authoring
of completers. 

This plugin is experimental and currently in a prototyping stage.

Installation
------------

Currently, this plugin is only tested on Windows 10, with Vim. It should be 
relatively straightforward to make it work on OS X, however there will likely
be some fixes required.

### Prerequisites

Other requirements are:
    - Vim 7.4 (>1087 patch) with +clientserver and python enabled
    - Node v4.4.2 or higher
    - NPM v1.4.2 or higher

Optional dependencies that improve the plugin:
    - UltiSnips

### Windows

    If using pathogen, clone this repository into your bundle folder.

    Run 'npm run install'
    Run 'npm run build'

### OS X

The plugin has not yet been tested on OS X.

Guide
=====

### Architecture

### API

### Examples

FAQ
===

Nothing here yet :)

Contact
=======

extr0py@extropygames.com

License
=======

This is licensed under the MIT License.

Copyright 2016 
