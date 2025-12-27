const amqp = require("amqplib");

async function consumeQueues() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queues = ["mainQueue", "unroutableQueue"];

    for (const queue of queues) {
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log(`Message from ${queue}:`, msg.content.toString());
                channel.ack(msg);
            }
        });
    }
}

consumeQueues();
