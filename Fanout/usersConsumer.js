const amqp = require("amqplib");

async function consumeUserMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "mailExchange$_$Fanout";
        const queue = "Queue$_$Users";

        await channel.assertExchange(exchange, "fanout", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        // FANOUT BIND (no routing key)
        await channel.bindQueue(queue, exchange, "");

        console.log("User Consumer waiting for fanout messages...");

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log("User Broadcast Received:");
                console.log(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeUserMail();
