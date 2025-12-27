const amqp = require("amqplib");

async function consumeMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const mainQueue = "mail.queue";
        const dlqQueue = "mail.dlq.queue";

        // ASSERT QUEUES
        await channel.assertQueue(mainQueue, { durable: false });
        await channel.assertQueue(dlqQueue, { durable: false });

        console.log("Waiting for main queue messages...");

        // MAIN QUEUE CONSUMER
        channel.consume(mainQueue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log("Processing mail:", data);

                // Simulate failure for DLQ demonstration
                console.log("Simulating failure → sending to DLQ");
                channel.nack(msg, false, false); // reject message → DLQ
            }
        });

        // DLQ CONSUMER
        channel.consume(dlqQueue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log("Message in DLQ:", data);

                channel.ack(msg); // acknowledge from DLQ
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
