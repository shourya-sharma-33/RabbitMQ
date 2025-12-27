const amqp = require("amqplib");

async function consumeMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        const exchange = "mail.lazy.exchange";
        const routingKey = "sendMail";
        const queue = "mail.lazy.queue";

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: true });
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                "x-queue-mode": "lazy",
            },
        });

        await channel.bindQueue(queue, exchange, routingKey);

        console.log("Waiting for messages from lazy queue...");

        // CONSUME MESSAGE
        channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());

                console.log("Mail received:");
                console.log(data);
                console.log("-----------------------");

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
