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

// Official tgBTC Jetton Master mainnet launch is targeted for Q2 2025.

const YOUR_WALLET_MNEMONIC = ""
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

	privateKey := func() ed25519.PrivateKey {
		hmac := hmac.New(sha512.New, []byte(YOUR_WALLET_MNEMONIC))
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
			panic(err)
		}
		return res
	}()

	walletTonBalance := func() string {
		res := doApiCall(
			"getAddressInformation",
			map[string]any{
				"address": walletAddress.String(),
			},
		)
		return res["balance"].(string)
	}()

	fmt.Println("\nWith the wallet")
	fmt.Println(
		walletAddress.Bounce(true).Testnet(true).String(),
		"(owns", walletTonBalance, "nanotons)",
	)

	walletSeqno := func() uint64 {
		res := doApiCall(
			"runGetMethod",
			map[string]any{
				"address": walletAddress.String(),
				"method":  "seqno",
			},
		)
		result, err := strconv.ParseUint(res["stack"].([]any)[0].([]any)[1].(string), 0, 64)
		if err != nil {
			panic(err)
		}
		return result
	}()

	tgBTCWalletAddress := func() *address.Address {
		res := doApiCall(
			"getTgBTCWalletAddressByOwner",
			map[string]any{
				"owner_address": walletAddress.String(),
			},
		)
		return address.MustParseRawAddr(res["address"].(string))
	}()

	// Send 0.00001 tgBTC from my wallet to myself
	internalMessage := func() *cell.Cell {
		res := doApiCall(
			"getTgBTCTransferPayload",
			map[string]any{
				"source":      walletAddress.String(),
				"destination": walletAddress.String(),
				"amount":      1000, // in the unit of sats
			},
		)
		m := tlb.InternalMessage{
			DstAddr: address.MustParseAddr(res["address"].(string)),
			Amount:  tlb.MustFromDecimal(res["amount"].(string), 0),
			Body: func() *cell.Cell {
				b, _ := base64.URLEncoding.DecodeString(res["payload"].(string))
				r, _ := cell.FromBOC(b)
				return r
			}(),
		}
		c, _ := tlb.ToCell(m)
		return c
	}()

	externalMessage := func() *cell.Cell {
		body := cell.BeginCell().
			MustStoreUInt(uint64(wallet.DefaultSubwallet), 32).
			MustStoreUInt(uint64(time.Now().Add(30*time.Minute).UTC().Unix()), 32).
			MustStoreUInt(uint64(walletSeqno), 32).
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

	sendMessageSuccess := func() bool {
		res := doApiCall(
			"sendMessage",
			map[string]any{
				"boc": base64.StdEncoding.EncodeToString(externalMessage.ToBOC()),
			},
		)
		return res["@type"].(string) == "ok"
	}()
	if sendMessageSuccess {
		fmt.Println("\nSuccessfully send message to the blockchain by TONX API")
		fmt.Println("Call \"Get Messages\" API with the following hash")
		fmt.Printf("\n%s\n\n", base64.StdEncoding.EncodeToString(externalMessage.Hash()))
	}

	fmt.Println("Wait for the tgBTC transferring...")
	time.Sleep(20 * time.Second)

	tgBTCBalance := func() string {
		res := doApiCall(
			"getTgBTCBalance",
			map[string]any{
				"address": tgBTCWalletAddress.String(),
			},
		)
		return res["balance"].(string)
	}()
	fmt.Println(
		"\nAfter the transfer, owner has tgBTC Jetton balance",
		tgBTCBalance, "sats",
	)
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
