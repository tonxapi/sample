require 'net/http'
require 'json'


class Tonx 
  HTTP_HEADERS = { 'Content-Type': 'application/json' }
  attr_reader :public_key, :private_key

  # network = 'mainnet' | 'testnet'
  # api_key: String
  def initialize(network, api_key)
    @network = network
    @api_key = api_key
    @uri = URI("https://#{@network}-rpc.tonxapi.com/v2/json-rpc/#{@api_key}")
  end

  # method: String
  # params: {
  #   address: String
  # }
  def run_get_method(method, params)
    body = {
      id: 1,
      jsonrpc: "2.0",
      method: "runGetMethod",
      params: {
        address: params[:address],
        method: method
      }
    }
    response = Net::HTTP.post(@uri, body.to_json, HTTP_HEADERS)
    return JSON.parse(response.body, symbolize_names: true)
  end

  # boc: base64 string
  def send_message(boc)
    body = {
      id: 1,
      jsonrpc: "2.0",
      method: "sendMessage",
      params: {
      boc: boc
      }
    }

    response = Net::HTTP.post(@uri, body.to_json, HTTP_HEADERS)
    return JSON.parse(response.body, symbolize_names: true)
  end

end