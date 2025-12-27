const amqp = require("amqplib");

async function rpcServer() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const rpcQueue = "rpc_queue";
    await channel.assertQueue(rpcQueue, { durable: false });
    channel.prefetch(1); // process one request at a time

    console.log("RPC Server waiting for requests...");

    channel.consume(rpcQueue, async (msg) => {
        const request = JSON.parse(msg.content.toString());
        console.log("Request received:", request);

        // Example processing: calculate factorial
        const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
        const result = factorial(request.num);

        // Send response to replyTo queue
        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify({ result })),
            { correlationId: msg.properties.correlationId }
        );

        // Acknowledge the request
        channel.ack(msg);
    });
}

rpcServer();
