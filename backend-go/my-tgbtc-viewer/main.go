package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/xssnick/tonutils-go/address"
)

// Official tgBTC Jetton Master mainnet launch is targeted for Q2 2025.

const YOUR_WALLET_ADDRESS = ""
const TONX_API = "https://testnet-rpc.tonxapi.com/v2/json-rpc"
const API_KEY = ""

type Request struct {
	Id      int64          `json:"id"`
	JsonRpc string         `json:"jsonrpc"`
	Method  string         `json:"method"`
	Params  map[string]any `json:"params"`
}

type Response struct {
	Id      int64                  `json:"id"`
	JsonRpc string                 `json:"jsonrpc"`
	Result  map[string]interface{} `json:"result,omitempty"`
	Error   map[string]interface{} `json:"error,omitempty"`
}

func main() {
	defer errorHandler()

	fmt.Println("\nYou are now using TONX API")

	walletAddress := func() *address.Address {
		res, err := address.ParseAddr(YOUR_WALLET_ADDRESS)
		if err != nil {
			panic(err)
		}
		return res
	}()

	fmt.Println("\nWith the wallet")
	fmt.Println(walletAddress.Bounce(true).Testnet(true).String())

	tgBTCWalletAddress := func() *address.Address {
		res := doApiCall(
			"getTgBTCWalletAddressByOwner",
			map[string]any{
				"owner_address": walletAddress.String(),
			},
		)
		return address.MustParseRawAddr(res["address"].(string))
	}()

	tgBTCBalance := func() string {
		res := doApiCall(
			"getTgBTCBalance",
			map[string]any{
				"address": tgBTCWalletAddress.String(),
			},
		)
		return res["balance"].(string)
	}()

	fmt.Println("\nYou are watching the tgBTC Jetton wallet:")
	fmt.Println("Address       ", tgBTCWalletAddress.Bounce(true).Testnet(true).String())
	fmt.Println("Balance       ", tgBTCBalance, "sats")
	fmt.Println("Owner address ", walletAddress.Bounce(true).Testnet(true).String())
}

func errorHandler() {
	if r := recover(); r != nil {
		fmt.Printf("[Error] %+v\n", r)
	}
}

func doApiCall(method string, params map[string]interface{}) map[string]interface{} {
	TONX_API_URL := fmt.Sprintf("%s/%s", TONX_API, API_KEY)

	body, err := json.Marshal(
		Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  method,
			Params:  params,
		},
	)
	if err != nil {
		panic(err)
	}

	res, err := http.Post(TONX_API_URL, "application/json", bytes.NewReader(body))
	if err != nil {
		panic(err)
	}

	defer res.Body.Close()

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		panic(err)
	}

	var parsedResBody Response
	err = json.Unmarshal(resBody, &parsedResBody)
	if err != nil {
		panic(err)
	}

	if parsedResBody.Error != nil {
		panic(parsedResBody.Error)
	}

	return parsedResBody.Result
}
