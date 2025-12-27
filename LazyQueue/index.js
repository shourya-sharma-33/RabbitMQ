const amqp = require("amqplib");

async function sendMail() {
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

        // ASSERT EXCHANGE
        await channel.assertExchange(exchange, "direct", { durable: true });

        /**
         * LAZY QUEUE CONFIG
         * x-queue-mode: lazy → messages are stored on disk
         */
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                "x-queue-mode": "lazy",
            },
        });

        // BIND QUEUE
        await channel.bindQueue(queue, exchange, routingKey);

        // MESSAGE
        const message = {
            to: "ram@email.com",
            subject: "Lazy Queue Mail",
            body: "This message is stored on disk instead of memory",
            createdAt: new Date().toISOString(),
        };

        // PUBLISH MESSAGE
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log("Mail sent to lazy queue");

        // CLEANUP
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
