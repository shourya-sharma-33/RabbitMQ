const amqp = require("amqplib");

async function sendMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "mailExchange";
        const routingKey = "sendMail";
        const queue = "mailQueue";

        // DLX & Retry
        const retryQueue = "mail.retry.queue";
        const dlqExchange = "mail.dlx.exchange";
        const dlqQueue = "mail.dlq";

        // Exchanges
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertExchange(dlqExchange, "direct", { durable: false });

        // Main Queue (with DLQ)
        await channel.assertQueue(queue, {
            durable: false,
            arguments: {
                "x-dead-letter-exchange": dlqExchange,
                "x-dead-letter-routing-key": "mail.failed",
            },
        });

        // Retry Queue (TTL → back to main queue)
        await channel.assertQueue(retryQueue, {
            durable: false,
            arguments: {
                "x-message-ttl": 5000, // 5 sec delay
                "x-dead-letter-exchange": exchange,
                "x-dead-letter-routing-key": routingKey,
            },
        });

        // DLQ
        await channel.assertQueue(dlqQueue, { durable: false });

        // Bindings
        await channel.bindQueue(queue, exchange, routingKey);
        await channel.bindQueue(retryQueue, dlqExchange, "mail.retry");
        await channel.bindQueue(dlqQueue, dlqExchange, "mail.failed");

        const message = {
            to: "ram@email.com",
            subject: "Retry Example",
            body: "This message will retry before going to DLQ",
        };

        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            {
                headers: {
                    "x-retry-count": 0,
                },
            }
        );

        console.log("Mail sent");

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
