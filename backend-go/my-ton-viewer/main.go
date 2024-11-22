package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/ton/wallet"
	"golang.org/x/crypto/pbkdf2"
)

const WALLET_V4R2 = ""
const TONX_API = "https://testnet-rpc.tonxapi.com/v2/json-rpc"
const API_KEY = ""

const MAINNET_GLOBAL_ID = -239
const TESTNET_GLOBAL_ID = -3

type Request struct {
	Id      int64          `json:"id"`
	JsonRpc string         `json:"jsonrpc"`
	Method  string         `json:"method"`
	Params  map[string]any `json:"params"`
}

type MasterchainBlock struct {
	Workchain int    `json:"workchain"`
	Shard     string `json:"shard"`
	Seqno     int    `json:"seqno"`
	GlobalId  int    `json:"global_id"`
}

func main() {
	var TONX_API_URL = fmt.Sprintf("%s/%s", TONX_API, API_KEY)

	latestMasterchainInfo := func() *MasterchainBlock {
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "getMasterchainInfo",
		}

		reqBody, err := json.Marshal(req)
		if err != nil {
			fmt.Println("[ERROR] Encode JSON payload with error:", err.Error())
			return nil
		}

		res, err := http.Post(
			TONX_API_URL,
			"application/json",
			bytes.NewReader(reqBody),
		)
		if err != nil {
			fmt.Printf("[ERROR] Fail to call API \"%s\" with error: %s\n", req.Method, err.Error())
			return nil
		}

		defer res.Body.Close()

		resBody, err := io.ReadAll(res.Body)
		if err != nil {
			fmt.Println("[ERROR] Decode response body with error:", err.Error())
			return nil
		}

		parsedResBody := map[string]any{}
		err = json.Unmarshal(resBody, &parsedResBody)
		if err != nil {
			fmt.Println("[ERROR] Decode response body with error:", err.Error())
			return nil
		}

		result := parsedResBody["result"].(map[string]any)["last"].(map[string]any)
		return &MasterchainBlock{
			Workchain: int(result["workchain"].(float64)),
			Shard:     result["shard"].(string),
			Seqno:     int(result["seqno"].(float64)),
			GlobalId:  int(result["global_id"].(float64)),
		}
	}()
	if latestMasterchainInfo == nil {
		fmt.Println("[ERROR] Fail to get latest masterchain information")
		return
	}

	fmt.Println("\nYou are now using TONX API")

	switch latestMasterchainInfo.GlobalId {
	case TESTNET_GLOBAL_ID:
		fmt.Println("\nAt the          ", "Testnet")
	case MAINNET_GLOBAL_ID:
		fmt.Println("\nAt the          ", "Mainnet")
	default:
		fmt.Println("\nAt the          ", "Unknown network")
	}

	privateKey := func() ed25519.PrivateKey {
		hmac := hmac.New(sha512.New, []byte(WALLET_V4R2))
		hmac.Write([]byte(""))
		return ed25519.NewKeyFromSeed(
			pbkdf2.Key(hmac.Sum(nil), []byte("TON default seed"), 100000, 32, sha512.New),
		)
	}()

	walletAddress := func() *address.Address {
		res, err := wallet.AddressFromPubKey(
			privateKey.Public().(ed25519.PublicKey),
			wallet.V4R2,
			wallet.DefaultSubwallet,
		)
		if err != nil {
			return nil
		}
		return res
	}()
	if walletAddress == nil {
		fmt.Println("[ERROR] Fail to get the wallet-v4r2's address")
		return
	}

	fmt.Println("With the wallet ", walletAddress.Bounce(false).Testnet(true).String())
	
	{
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "getAddressInformation",
			Params: map[string]any{
				"address": walletAddress.String(),
			},
		}

		reqBody, err := json.Marshal(req)
		if err != nil {
			fmt.Println("[ERROR] Encode JSON payload with error:", err.Error())
		}

		res, err := http.Post(
			TONX_API_URL,
			"application/json",
			bytes.NewReader(reqBody),
		)
		if err != nil {
			fmt.Printf("[ERROR] Fail to call API \"%s\" with error: %s\n", req.Method, err.Error())
		}

		defer res.Body.Close()

		resBody, err := io.ReadAll(res.Body)
		if err != nil {
			fmt.Println("[ERROR] Decode response body with error:", err.Error())
		}

		parsedResBody := map[string]any{}
		err = json.Unmarshal(resBody, &parsedResBody)
		if err != nil {
			fmt.Println("[ERROR] Decode response body with error:", err.Error())
		}

		balance := parsedResBody["result"].(map[string]any)["balance"].(string)
		fmt.Println("Balance         ", balance)
	}
}
