const amqp = require("amqplib");

async function devConsumer() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "productExchange$_$Headers";
        const queue = "Queue$_$DevTeam";

        await channel.assertExchange(exchange, "headers", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        await channel.bindQueue(queue, exchange, "", {
            "x-match": "all",
            feature: true,
            devDetails: true,
        });

        console.log("Dev Team waiting for messages...");

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log("Dev Team Received:");
                console.log(JSON.parse(msg.content.toString()));
                console.log("Headers:", msg.properties.headers);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

devConsumer();
