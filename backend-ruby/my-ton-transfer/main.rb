require 'ton-sdk-ruby'
require 'net/http'
require_relative "../lib/ton/wallet"
require_relative "../lib/ton/tonx"

include TonSdkRuby


provider = Tonx.new('network', 'your tonx api key')

address = "your wallet address"
receiver_address = "receiver address"
amount = Coins.new(1) # your ton value
mnemonics = "enter your mnemonics with space separated here"
wallet = TonWallet.new(mnemonics, provider)



wallet.ton_transfer(
  from: address, 
  to: receiver_address,
  amount: amount,
  comment: "check",
)
