[![Build Status](https://travis-ci.org/extr0py/vim-electrify.svg?branch=master)](https://travis-ci.org/extr0py/vim-electrify)
[![Stories in Ready](https://badge.waffle.io/extr0py/vim-electrify.png?label=ready&title=Ready)](https://waffle.io/extr0py/vim-electrify)
# vim-electrify
###### Write VIM plugins in JavaScript, powered by [Electron](http://electron.atom.io)
---------------------------------------------------

- [Intro](#intro)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Windows](#windows)
    - [OSX](#osx)
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

The personal motivation for this project is to avoid using VimScript and leverage
the same technology I use for my day job (JS, TS, etc) in order to enhance the editor.
I prefer using VIM as opposed to Sublime, VSCode, Atom, Visual Studio, even with VIM-like
plugins, but I miss features like autocomplete and the ease of extending some of these features.

The project simply started as an engine for TS completion, but grew into something that could
be more generalized.

This plugin is experimental and currently in a prototyping stage.

It will not appeal to everyone, especially those who prefer a minimalist VIM install and plugins
with no dependencies. However, if you use Node/NPM and related technologies on a day-to-day basis,
I hope that you find this useful.

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

### OSX

The plugin has not yet been tested on OS X.

Guide
=====

### Architecture

Diagram
Vim -> Send Events to Python -> TCP client talking to TCP server

TCP Server -> Send response to TCP client -> Execute asynchronously using the 'remote-execute' functionality

### API

TODO

### Examples

- [Echo](samples/echo.js)
- [Eval](samples/eval.js)
- [Command](samples/command.js)
- [Simple omnicompleter](samples/omnicompleter_simple.js);
- [BrowserWindow](samples/browserwindow.js)

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
