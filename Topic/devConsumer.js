const amqp = require("amqplib");

async function consumeDevTeamMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "mailExchange$_$Topic";
        const queue = "Queue$_$DevTeam";

        await channel.assertExchange(exchange, "topic", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        // Topic binding
        await channel.bindQueue(queue, exchange, "mail.dev.*");

        console.log("Dev Team Consumer waiting for topic messages...");

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log("Dev Alert Received:");
                console.log(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeDevTeamMail();
