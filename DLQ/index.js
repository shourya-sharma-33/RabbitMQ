const amqp = require("amqplib");

async function sendMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const mainExchange = "mail.main.exchange";
        const routingKey = "sendMail";

        const mainQueue = "mail.queue";
        const dlqExchange = "mail.dlx.exchange";
        const dlqQueue = "mail.dlq.queue";

        // ASSERT DLQ EXCHANGE AND QUEUE
        await channel.assertExchange(dlqExchange, "direct", { durable: false });
        await channel.assertQueue(dlqQueue, { durable: false });
        await channel.bindQueue(dlqQueue, dlqExchange, "mail.failed");

        // ASSERT MAIN EXCHANGE AND QUEUE WITH DLQ CONFIG
        await channel.assertExchange(mainExchange, "direct", { durable: false });
        await channel.assertQueue(mainQueue, {
            durable: false,
            arguments: {
                "x-dead-letter-exchange": dlqExchange,
                "x-dead-letter-routing-key": "mail.failed", // Messages go to DLQ on failure
            },
        });

        await channel.bindQueue(mainQueue, mainExchange, routingKey);

        // MESSAGE TO SEND
        const message = {
            to: "ram@email.com",
            from: "shyam@email.com",
            subject: "Test Mail with DLQ",
            body: "This mail might fail and go to DLQ",
            createdAt: new Date().toISOString(),
        };

        // PUBLISH MESSAGE
        channel.publish(
            mainExchange,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );

        console.log("Mail sent (will go to DLQ if rejected)");

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
