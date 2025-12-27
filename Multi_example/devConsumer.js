const amqp = require("amqplib");

async function consumeDevTeamMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        const exchange = "mailExchange";
        const routingKey = "sendToDevTeam";
        const queue = "Queue$_$DevTeam";

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        // BIND QUEUE
        await channel.bindQueue(queue, exchange, routingKey);

        console.log("Dev Team Consumer waiting for messages...");

        // CONSUME MESSAGE
        channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());

                console.log("Dev Team Mail Received:");
                console.log(data);

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeDevTeamMail();
