const amqp = require("amqplib");

async function consumeMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        const exchange = "mail.main.exchange";
        const routingKey = "sendMail";
        const queue = "mail.queue";

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue(queue, { durable: false });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log("Waiting for delayed mail...");

        // CONSUME MESSAGE
        channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());

                console.log("Mail received after delay:");
                console.log(data);

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
