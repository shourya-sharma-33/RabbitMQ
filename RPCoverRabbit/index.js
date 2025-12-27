const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

async function rpcClient(requestData) {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const rpcQueue = "rpc_queue";
    await channel.assertQueue(rpcQueue, { durable: false });

    // Create a temporary exclusive queue for replies
    const replyQueue = await channel.assertQueue("", { exclusive: true });

    const correlationId = uuidv4();

    console.log("Sending RPC request:", requestData);

    channel.sendToQueue(rpcQueue, Buffer.from(JSON.stringify(requestData)), {
        correlationId,
        replyTo: replyQueue.queue,
    });

    // Listen for the response
    channel.consume(
        replyQueue.queue,
        (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                console.log("RPC Response:", response);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        },
        { noAck: true }
    );
}

// Example request
rpcClient({ num: 5 });
