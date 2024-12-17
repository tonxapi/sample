import { TONXJsonRpcProvider } from "@tonx/core";

class TONNftChecker {
    private client: TONXJsonRpcProvider;
    private nftAddress: string;

    constructor(apiKey: string) {
        this.nftAddress = "EQAc4jcphnAeLQ_wmS7e4leWghFysRI_VKUCR0jhiVDX9hXn";
        this.client = new TONXJsonRpcProvider({
            network: "testnet", // testnet or mainnet
            apiKey: apiKey
        });
    }

    async getLatestNftTransfer(): Promise<string> {
        try {
            const transactions = await this.client.getNftTransfers({
                address: this.nftAddress
            });
            return transactions[0].transaction_hash || "No transaction found";
        } catch (error) {
            return "Error fetching transaction";
        }
    }
}

// Usage example
async function main() {
    const checker = new TONNftChecker(process.env.TONX_API_KEY as string);

    console.log("Fetching latest NFT transfer...");
    const lastTransaction = await checker.getLatestNftTransfer();
    console.log("Last Transaction:", lastTransaction);
}

main().catch(console.error);