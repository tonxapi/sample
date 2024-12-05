# Overview
This guide provides instructions on setting up and running the Ruby-based project for doing the simple transfer via TONX API including Jetton and Ton 

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
Ensure your ruby version is `3.3.6` or later and initialize your application's Gemfile:

execute the command in terminal:

```
bundle install
```

# Execution
Navigate to the project's root folder `backend-ruby` and use the following command lines based on your desired functionality:

## Ton simple transfer
```
ruby my-ton-transfer/main.rb
```

## Jetton simple transfer
```
ruby my-jetton-transfer/main.rb
```