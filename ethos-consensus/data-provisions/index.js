require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);

// Build Hedera testnet client
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);



async function createDataProvisionsAuditTopic() {
    try {
        // Create the topic
        let txResponse = await new TopicCreateTransaction().execute(client);

        // Get the topic ID
        const receipt = await txResponse.getReceipt(client);
        const topicId = receipt.topicId;
        console.log(`🎉 Your Data Provisions topic ID is: ${topicId}`);
        
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Send first test message
        const firstMessage = {
            eventType: "NEW_DATA",
            timestamp: new Date().toISOString(),
            userId: "admin",
            dataId: "initial-dataset",
            action: "TOPIC_CREATION",
            details: {
                ipfsEncoded: "QmXxxxxxxxxxxxFirstTestHashxxxxxxxxxxx"
            }
        };

        // Submit the message
        const submitMsg = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: JSON.stringify(firstMessage),
        }).execute(client);

        // Get the receipt
        const msgReceipt = await submitMsg.getReceipt(client);
        console.log(`✅ First message sent successfully! Status: ${msgReceipt.status}`);
        console.log("\n⚠️ IMPORTANT: Save this topic ID for future use:", topicId.toString());
        
        return topicId;
    } catch (error) {
        console.error("❌ Error creating topic:", error);
        throw error;
    }
}

// Execute the function
createDataProvisionsAuditTopic()
