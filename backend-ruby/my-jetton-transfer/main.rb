require 'ton-sdk-ruby'
require 'net/http'
require_relative "../lib/ton/wallet"
require_relative "../lib/ton/tonx"

include TonSdkRuby


provider = Tonx.new('network', 'your tonx api key')

address = "your wallet address"
receiver_address = "receiver address"
amount = Coins.new(10, {decimals: 6}) # your value and jetton decimals
mnemonics = "enter your mnemonics with space separated here"
jetton_wallet_address = "your jetton wallet address"
wallet = TonWallet.new(mnemonics, provider)



wallet.jetton_transfer(
  from: address, 
  to: receiver_address,
  amount: amount,
  jetton_wallet_address: jetton_wallet_address,
)




