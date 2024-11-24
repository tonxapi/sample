import { TONXJsonRpcProvider } from "@tonx/core";

class USDTBalanceChecker {
    private client: TONXJsonRpcProvider;
    private myUsdtAddress: string = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ";

    constructor(apiKey: string) {
        this.client = new TONXJsonRpcProvider({
            network: "mainnet",
            apiKey: apiKey,
        });
    }

    async checkBalanceAndTransaction(): Promise<{
        balance: string;
        transaction: string;
    }> {
        try {
            const transactions = await this.client.getJettonTransfers({
                address: this.myUsdtAddress,
                direction: "in"
            });

            const lastTransactionHash = transactions[0]?.transaction_hash || "No transaction found";

            if (!transactions[0]?.source_wallet) {
                throw new Error("No source wallet found");
            }

            const balanceData = await this.client.getTokenData(transactions[0].source_wallet);

            return {
                balance: balanceData.balance,
                transaction: lastTransactionHash
            };

        } catch (error) {
            return {
                balance: "Error fetching balance",
                transaction: "Error fetching transaction"
            };
        }
    }
}

// 使用範例
async function main() {
    const checker = new USDTBalanceChecker("YOUR_API_KEY");
    console.log("fetching...");

    const result = await checker.checkBalanceAndTransaction();
    console.log("blance:", result.balance);
    console.log("last transaction:", result.transaction);
}

main().catch(console.error);