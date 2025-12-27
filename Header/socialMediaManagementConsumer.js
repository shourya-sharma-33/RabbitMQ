const amqp = require("amqplib");

async function socialMediaConsumer() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "productExchange$_$Headers";
        const queue = "Queue$_$SocialMedia";

        await channel.assertExchange(exchange, "headers", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        await channel.bindQueue(queue, exchange, "", {
            "x-match": "any",
            feature: true,
            advertisement: true,
        });

        console.log("Social Media Team waiting for messages...");

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log("Social Media Team Received:");
                console.log(JSON.parse(msg.content.toString()));
                console.log("Headers:", msg.properties.headers);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

socialMediaConsumer();
