const amqp = require("amqplib");

async function consumeMessages() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "quorumQueue";
    await channel.assertQueue(queue, { durable: true, arguments: { "x-queue-type": "quorum" } });

    console.log("Waiting for messages from quorum queue...");

    channel.consume(queue, (msg) => {
        if (msg) {
            console.log("Received:", msg.content.toString());
            channel.ack(msg);
        }
    });
}

consumeMessages();
