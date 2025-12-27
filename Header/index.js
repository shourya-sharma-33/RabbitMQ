const amqp = require("amqplib");

async function publishMessages() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        // HEADERS EXCHANGE
        const exchange = "productExchange$_$Headers";
        await channel.assertExchange(exchange, "headers", { durable: false });

        /**
         * Each message clearly defines:
         * 1. Payload (what happened)
         * 2. Headers (who should react to it)
         */

        const messages = [
            {
                // INTENT:
                // This message is about a new feature AND contains dev-specific details
                // ➜ Should be consumed ONLY by the Dev Team
                payload: {
                    title: "New Feature Released",
                    description:
                        "We have released a new payment optimization feature.",
                },
                headers: {
                    feature: true,
                    devDetails: true,
                },
            },
            {
                // INTENT:
                // This message is about a feature AND is an advertisement
                // ➜ Should be consumed by:
                //    - Users
                //    - Social Media Team
                payload: {
                    title: "New Feature Announcement",
                    description:
                        "Check out our new feature now live for all users!",
                },
                headers: {
                    feature: true,
                    advertisement: true,
                },
            },
        ];

        // PUBLISH ALL MESSAGES
        for (const msg of messages) {
            channel.publish(
                exchange,
                "", // routing key is ignored for headers exchange
                Buffer.from(JSON.stringify(msg.payload)),
                {
                    headers: msg.headers,
                }
            );
        }

        console.log("Header-based messages published successfully");

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

publishMessages();
