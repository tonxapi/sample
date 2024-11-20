package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/hmac"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/tlb"
	"github.com/xssnick/tonutils-go/ton/wallet"
	"github.com/xssnick/tonutils-go/tvm/cell"
	"golang.org/x/crypto/pbkdf2"
)

const WALLET_V4R2 = ""
const TONX_API = "https://testnet-rpc.tonxapi.com/v2/json-rpc"
const API_KEY = ""
const JETTON_WALLET_ADDRESS = ""
const DESTINATION_ADDRESS = ""

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

	walletSeqno := func() *uint64 {
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "runGetMethod",
			Params: map[string]any{
				"address": walletAddress.String(),
				"method":  "seqno",
			},
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

		r, err := strconv.ParseUint(parsedResBody["result"].(map[string]any)["stack"].([]any)[0].([]any)[1].(string), 0, 64)
		if err != nil {
			fmt.Println("[ERROR] Fail to run get-method at", walletAddress.String(), "with error:", err.Error())
		}

		return &r
	}()
	if walletSeqno == nil {
		fmt.Println("[ERROR] Fail to get the wallet-v4r2's \"seqno\" value")
		return
	}

	internalMessage := func() *cell.Cell {
		msg := tlb.InternalMessage{
			DstAddr: address.MustParseAddr(JETTON_WALLET_ADDRESS),
			Amount:  tlb.MustFromTON("0.15"),
			Body: cell.BeginCell().
				MustStoreUInt(0xf8a7ea5, 32).
				MustStoreUInt(0, 64).
				MustStoreCoins(1).
				MustStoreAddr(address.MustParseAddr(DESTINATION_ADDRESS)).
				MustStoreAddr(walletAddress).
				MustStoreUInt(0, 1).
				MustStoreCoins(tlb.MustFromTON("0.1").Nano().Uint64()).
				MustStoreBuilder(cell.BeginCell().MustStoreUInt(0, 1)).
				EndCell(),
		}
		res, _ := tlb.ToCell(msg)
		return res
	}()

	externalMessage := func() *cell.Cell {
		body := cell.BeginCell().
			MustStoreUInt(uint64(wallet.DefaultSubwallet), 32).
			MustStoreUInt(uint64(time.Now().Add(30*time.Minute).UTC().Unix()), 32).
			MustStoreUInt(uint64(*walletSeqno), 32).
			MustStoreInt(0, 8).
			MustStoreUInt(uint64(0), 8).
			MustStoreRef(internalMessage)
		extMsg := tlb.ExternalMessage{
			DstAddr: walletAddress,
			Body: cell.BeginCell().
				MustStoreSlice(body.EndCell().Sign(privateKey), 512).
				MustStoreBuilder(body).
				EndCell(),
		}
		res, _ := tlb.ToCell(extMsg)
		return res
	}()

	{
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "getJettonWallets",
			Params: map[string]any{
				"address": JETTON_WALLET_ADDRESS,
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

		balance := parsedResBody["result"].([]any)[0].(map[string]any)["balance"].(string)

		fmt.Println(
			"\nBefore the transfer, owner has Jetton balance",
			balance,
			"(multiplied by decimals)",
		)
	}

	sendMessageSuccess := func() *bool {
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "sendMessage",
			Params: map[string]any{
				"boc": base64.StdEncoding.EncodeToString(externalMessage.ToBOC()),
			},
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

		if parsedResBody["result"].(map[string]any)["@type"].(string) != "ok" {
			r := false
			return &r
		}

		r := true
		return &r
	}()
	if (sendMessageSuccess == nil) || (!*sendMessageSuccess) {
		fmt.Println("[ERROR] Fail to send message to the blockchain")
		return
	}

	fmt.Println("\nSuccessfully send message to the blockchain by TONX API")
	fmt.Println("Call \"Get Messages\" API with the following hash")
	fmt.Printf("\n%s\n\n", base64.StdEncoding.EncodeToString(externalMessage.Hash()))

	fmt.Println("Wait for the Jetton transfer")
	time.Sleep(20 * time.Second)

	{
		req := Request{
			Id:      1,
			JsonRpc: "2.0",
			Method:  "getJettonWallets",
			Params: map[string]any{
				"address": JETTON_WALLET_ADDRESS,
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

		balance := parsedResBody["result"].([]any)[0].(map[string]any)["balance"].(string)

		fmt.Println(
			"\nAfter the transfer, owner has Jetton balance",
			balance,
			"(multiplied by decimals)",
		)
	}
}
