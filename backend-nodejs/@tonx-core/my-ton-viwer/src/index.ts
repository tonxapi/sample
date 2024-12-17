import { TONXJsonRpcProvider } from "@tonx/core";

interface Transaction {
    hash?: string;
    [key: string]: any;
}

class TONAccountChecker {
    private client: TONXJsonRpcProvider;
    private myTonAddress: string = "EQDi1eWU3HWWst8owY8OMq2Dz9nJJEHUROza8R-_wEGb8yu6";

    constructor(apiKey: string) {
        this.client = new TONXJsonRpcProvider({
            network: "testnet ", // testnet or mainnet
            apiKey,
        });
    }

    async checkBalanceAndTransaction(): Promise<{
        balance: string;
        transaction: Transaction | string;
    }> {
        try {
            const balance = await this.client.getAccountBalance(this.myTonAddress);
            const transactions = await this.client.getTransactions({
                account: this.myTonAddress
            });

            return {
                balance,
                transaction: transactions[1] || "No transaction found"
            };
        } catch (error) {
            return {
                balance: "Error fetching balance",
                transaction: "Error fetching transaction"
            };
        }
    }
}

async function main() {
    const checker = new TONAccountChecker(process.env.TONX_API_KEY as string);
    console.log("Checking account...");

    const result = await checker.checkBalanceAndTransaction();
    console.log("Balance:", result.balance);
    console.log("Last Transaction:", result.transaction);
}

main().catch(console.error);