const amqp = require("amqplib");

async function consumeDevTeamMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "mailExchange$_$Fanout";
        const queue = "Queue$_$DevTeam";

        await channel.assertExchange(exchange, "fanout", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        // FANOUT BIND (no routing key)
        await channel.bindQueue(queue, exchange, "");

        console.log("Dev Team Consumer waiting for fanout messages...");

        channel.consume(queue, (msg) => {
            if (msg) {
                console.log("Dev Team Broadcast Received:");
                console.log(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeDevTeamMail();
