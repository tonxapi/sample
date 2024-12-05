# Overview

# Startup
For using the RbNaCl to do the signature , it sould install libsodium pre implementation.

For OS X users, libsodium is available via homebrew and can be installed with:

```
brew install libsodium
```
For FreeBSD users, libsodium is available both via pkgng and ports. To install a binary package:

```
pkg install libsodium
```

# Installation
Ensure your ruby version is `3.3.6` or later an initialize your application's Gemfile:

execute the command in terminal:

```
bundle install
```

# Execution
Under the root folder `backend-ruby` and follow the command line

## Ton simple transfer
```
ruby my-ton-transfer/main.rb
```

## Jetton simple transfer
```
ruby my-jetton-transfer/main.rb
```