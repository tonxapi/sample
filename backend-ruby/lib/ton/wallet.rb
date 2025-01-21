require 'ton-sdk-ruby'
require 'rbnacl'
require_relative "core"

class TonWallet 
  include TonSdkRuby

  SEND_MODE = {
    CARRY_ALL_REMAINING_BALANCE: 128,
    CARRY_ALL_REMAINING_INCOMING_VALUE: 64,
    DESTROY_ACCOUNT_IF_ZERO: 32,
    PAY_GAS_SEPARATELY: 1,
    IGNORE_ERRORS: 2,
    NONE: 0
  }

  attr_reader :public_key, :private_key, :provider

  def initialize(seed, provider = nil)
    keypair = TonMnemonic.new.mnemonic_to_private_key(seed.split(' '))
    @public_key = [keypair[:public]].pack('H*')
    @private_key = [keypair[:secret]].pack('H*')
    @provider = provider
  end
  
  # payload: {
  #   from: String,
  #   to: String,
  #   amount: Number,
  #   comment: String
  # }
  def create_ton_transfer(payload)
    boc_base64 = create_external_message_boc(
      payload[:from],
      {
        to: payload[:to],
        value: payload[:amount],
        bounce: true,
        body: payload[:comment]
      }
    )

    return boc_base64
  end

  # payload: {
  #   from: String,
  #   to: String,
  #   amount: Number,
  #   comment: String
  # }
  def ton_transfer(payload)
    if @provider.nil?
      raise 'Provider is required'
    end
    boc = create_ton_transfer(payload)
    resp = @provider.send_message(boc)
    if !resp[:result].nil?
      return resp[:result]
    else
      raise 'unknown error'
    end
  end



  # payload: {
  #   from: String,
  #   to: String,
  #   amount: Number,
  #   jetton_wallet_address: String,
  # }
  def create_jetton_transfer(payload)
    internal_message_body = Builder.new
    internal_message_body.store_uint(0xf8a7ea5, 32)
    internal_message_body.store_uint(0, 64)
    internal_message_body.store_coins(payload[:amount])
    internal_message_body.store_address(Address.new(payload[:to]))
    internal_message_body.store_address(nil)
    internal_message_body.store_dict(nil)
    internal_message_body.store_coins(Coins.new(0))
    internal_message_body.store_maybe_ref(nil)

    boc_base64 = create_external_message_boc(
      payload[:from],
      {
        to: payload[:jetton_wallet_address],
        value: Coins.new(0.1),
        bounce: true,
        body: internal_message_body.cell
      }
    )

    return boc_base64
  end

  # payload: {
  #   from: String,
  #   to: String,
  #   amount: Number,
  #   jetton_wallet_address: String,
  # }
  def jetton_transfer(payload)
    if @provider.nil?
      raise 'Provider is required'
    end
    boc = create_jetton_transfer(payload)
    resp = @provider.send_message(boc)
    if !resp[:result].nil?
      return resp[:result]
    else
      raise 'unknown error'
    end
  end

  #provider: Tonx
  def get_subwallet_id(address)
    if @provider.nil?
      raise 'Provider is required'
    end
    resp = @provider.run_get_method('get_subwallet_id', {
      address: address
    })
    if !resp[:result].nil?
      return Integer(resp[:result][:stack][0][1])
    else
      raise 'unknown error'
    end
  end

  # provider: Tonx
  def get_seqno(address)
    if @provider.nil?
      raise 'Provider is required'
    end
    resp = @provider.run_get_method('seqno', {
      address: address
    })
    if !resp[:result].nil?
     return Integer(resp[:result][:stack][0][1])
    else
      raise 'unknown error'
    end
  end

  # message : hex string
  def signature(message)
    signing_key = RbNaCl::SigningKey.new(private_key)
  
    return signing_key.sign(message).bytes
  end

  # to: address string
  # internal_message_params: {
  #   to: Address,
  #   value: Coins,
  #   bounce: Boolean,
  #   init: StateInit,
  #   body: String | Cell  
  # }
  def create_external_message_boc(to, internal_message_params, op_code = 0)
    internal_message = Ton.build_internal_message(internal_message_params)

    subWallet_id = get_subwallet_id(to)
    seqno = get_seqno(to)

    message = Builder.new
    message.store_uint(subWallet_id, 32)
    message.store_uint(0xFFFFFFFF, 32)
    message.store_uint(seqno, 32)
    message.store_uint(op_code, 8)
    message.store_uint(SEND_MODE[:PAY_GAS_SEPARATELY], 8)
    message.store_ref(internal_message.cell)

    external_message_body = Builder.new
    external_message_body.store_bytes(signature([message.cell.hash].pack('H*')))
    external_message_body.store_slice(message.cell.parse)

    external_message = {
      to: Address.new(to),
      init: nil, #'wallet.init',
      body: external_message_body.cell
    }

    external_message_slice = Ton.build_external_in_message(external_message).cell.parse

    external_message_builder = Builder.new
    external_message_builder.store_slice(external_message_slice)

    bytes = serialize(external_message_builder.cell)
    base64 = bytes_to_base64(bytes)

    return base64
  end
end