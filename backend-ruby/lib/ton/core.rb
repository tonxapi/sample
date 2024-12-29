require 'ton-sdk-ruby'
require 'rbnacl'

class Ton
  include TonSdkRuby


  # builder: Builder
  # source: {
  #   type: 'internal' | 'external-in' | 'external-out',
  #   src: Address | nil
  #   dest: Address,
  #   value: Coins,
  #   bounce: Boolean,
  #   ihr_disabled: Boolean,
  #   bounced: Boolean,
  #   ihr_fee: Number,
  #   forward_fee: Number,
  #   created_at: Number,
  #   created_lt: Number
  # }
  def self.store_common_message_info(builder, source)
    if source[:type] == 'internal'
      builder.store_bit(0)
      builder.store_bit(source[:ihr_disabled])
      builder.store_bit(source[:bounce])
      builder.store_bit(source[:bounced])
      builder.store_address(source[:src])
      builder.store_address(source[:dest])
      builder.store_coins(source[:value])
      builder.store_bit(0)
      builder.store_coins(Coins.new(source[:ihr_fee]))
      builder.store_coins(Coins.new(source[:forward_fee]))
      builder.store_uint(source[:created_lt], 64)
      builder.store_uint(source[:created_at], 32)
    elsif source[:type] == 'external-in'
      builder.store_bit(1)
      builder.store_bit(0)
      builder.store_address(source[:src])
      builder.store_address(source[:dest])
      builder.store_coins(Coins.new(source[:importFee]))
    elsif source[:type] == 'external-out'
      builder.store_bit(1)
      builder.store_bit(1)
      builder.store_address(nil)
      builder.store_address(source[:dest])
      builder.store_uint(source[:created_lt], 64)
      builder.store_uint(source[:created_at], 32)
    else
      raise 'Unknown CommonMessageInfo type'
    end

    return builder
  end

  # builder: Builder
  # body: String | Cell
  def self.store_internal_message_body(builder, body, needRef = false)
    if body.is_a?(String)
      body_string = body
      body = Builder.new
      body.store_uint(0, 32)
      body.store_string(body_string)
      body = body.cell
    end

    if needRef
      builder.store_bit(true);
      builder.store_ref(body || Cell.new);
    else
      builder.store_bit(false);
      if !body.nil?
        builder.store_slice(body.parse);
      end
    end
    return builder

  end

  # params: {
  #   to: Address,
  #   value: Coins,
  #   bounce: Boolean,
  #   init: StateInit,
  #   body: String | Cell  
  # }
  def self.build_internal_message(params)

    builder = Builder.new

    info_src = {
      type: 'internal',
      src: nil,
      dest: Address.new(params[:to]),
      value: params[:value],
      bounce: params[:bounce].nil? ? true : params[:bounce],
      ihr_disabled: true,
      bounced: false,
      ihr_fee: 0,
      forward_fee: 0,
      created_at: 0,
      created_lt: 0
    }

    store_common_message_info(builder, info_src)

    if params[:init] != nil
      raise 'state init is not implemented yet'
    else
      builder.store_bit(false)
    end

    store_internal_message_body(builder, params[:body])

    return builder  
  end

  # params: {
  #   to: String,
  #   init: nil | State_Init,
  #   body: String | Cell | nil
  # }
  def self.build_external_in_message(params, needRef = false)
    builder = Builder.new
    info = {
      type: 'external-in',
      dest: Address.new(params[:to]),
      importFee: 0,
    }
    store_common_message_info(builder, info)

    if params[:init] != nil
      # TODO: implement state_init for deploying smart contracts
      raise 'Not implemented yet'
    else
        builder.store_bit(false);
    end

    if needRef
        builder.store_bit(true);
        builder.store_ref(params[:body]);
    else
      builder.store_bit(false);
      if !params[:body].nil?
        builder.store_slice(params[:body].parse);
      end
    end

    return builder
  end
end