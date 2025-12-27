const amqp = require("amqplib");

async function consumeTasks(consumerName) {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "taskQueue";
    await channel.assertQueue(queue, { durable: true });

    // Fair dispatch: one message at a time
    channel.prefetch(1);

    console.log(`${consumerName} waiting for messages...`);

    channel.consume(queue, async (msg) => {
        const task = JSON.parse(msg.content.toString());
        console.log(`${consumerName} processing:`, task);

        // Simulate processing time
        await new Promise((r) => setTimeout(r, 1000));

        channel.ack(msg);
        console.log(`${consumerName} finished:`, task);
    });
}

// Run multiple consumers
consumeTasks("Consumer 1");
consumeTasks("Consumer 2");
consumeTasks("Consumer 3");
