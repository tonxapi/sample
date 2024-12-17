
import { ToncoreAdapter } from "@tonx/adapter";
import { Address } from "@ton/core";

interface Transaction {
    transaction_hash?: string;
    [key: string]: unknown;
}

interface TONCheckResult {
    balance: string;
    lastTransaction: Transaction | string;
}

class TONChecker {
    private client: ToncoreAdapter;
    private walletAddress: Address;

    constructor(apiKey: string, address: string) {
        this.walletAddress = Address.parse(address);
        this.client = new ToncoreAdapter({
            network: "testnet", // testnet or mainnet
            apiKey: apiKey
        });
    }

    async getBalance(): Promise<string> {
        try {
            const balance = await this.client.getBalance(this.walletAddress);
            return balance.toString();
        } catch (error) {
            console.error('Error fetching balance:', error);
            return "Error fetching balance";
        }
    }

    async getLatestTransaction(): Promise<Transaction | string> {
        try {
            const transactions = await this.client.getTransactions(this.walletAddress, {
                limit: 1
            });

            if (transactions.length > 0) {
                return {
                    transaction_hash: transactions[0].hash().toString("hex")
                };
            }
            return "No transaction found";
        } catch (error) {
            console.error('Error fetching transaction:', error);
            return "Error fetching transaction";
        }
    }

    async checkAccount(): Promise<TONCheckResult> {
        const [balance, lastTransaction] = await Promise.all([
            this.getBalance(),
            this.getLatestTransaction()
        ]);

        return {
            balance,
            lastTransaction
        };
    }
}

// Usage example
async function main() {
    const walletAddress = "EQBi5X1kwa27gqKn2MztaEZz7Zkhvb_WlSif-CnIiUjwuLEG"; // Example address
    const checker = new TONChecker(process.env.TONX_API_KEY as string, walletAddress);

    console.log("Checking TON account...");

    // Get individual data
    console.log("\nGetting TON balance...");
    const balance = await checker.getBalance();
    console.log("Balance:", balance);

    console.log("\nGetting latest transaction...");
    const lastTx = await checker.getLatestTransaction();
    if (typeof lastTx === "object" && lastTx.transaction_hash) {
        console.log("Transaction hash:", lastTx.transaction_hash);
        console.log("Explorer URL:", `https://tonviewer.com/transaction/${lastTx.transaction_hash}`);
    } else {
        console.log("Transaction info:", lastTx);
    }
}

main().catch(console.error);