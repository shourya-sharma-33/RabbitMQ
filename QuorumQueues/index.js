const amqp = require("amqplib");

async function sendMessage() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "quorumQueue";

    // Create a quorum queue
    await channel.assertQueue(queue, {
        durable: true,
        arguments: { "x-queue-type": "quorum" },
    });

    const messages = ["Message 1", "Message 2", "Message 3"];
    messages.forEach((msg) => {
        channel.sendToQueue(queue, Buffer.from(msg));
        console.log("Sent:", msg);
    });

    setTimeout(() => {
        channel.close();
        connection.close();
    }, 500);
}

sendMessage();
