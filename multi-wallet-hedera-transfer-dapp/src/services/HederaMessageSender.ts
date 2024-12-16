import { 
    AccountId, 
    PrivateKey, 
    Client, 
    TopicMessageSubmitTransaction 
} from "@hashgraph/sdk";

export class HederaMessageSender {
    private client: Client;

    constructor(accountId: string, privateKey: string) {
        this.client = Client.forTestnet();
        const operatorId = AccountId.fromString(accountId);
        const operatorKey = PrivateKey.fromStringECDSA(privateKey);
        this.client.setOperator(operatorId, operatorKey);
    }

    async sendMessage(topicId: string, message: string): Promise<boolean> {
        try {
            const tId = AccountId.fromString(topicId);
            console.log(tId)
            const transaction = await new TopicMessageSubmitTransaction({
                topicId: tId,
                message: message,
            }).execute(this.client);

            const receipt = await transaction.getReceipt(this.client);
            return receipt.status.toString() === "SUCCESS";
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }
}