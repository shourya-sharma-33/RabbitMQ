const amqp = require("amqplib");

async function consumeMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        const exchange = "mail.priority.exchange";
        const routingKey = "sendMail";
        const queue = "mail.priority.queue";

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue(queue, {
            durable: false,
            arguments: {
                "x-max-priority": 10,
            },
        });

        await channel.bindQueue(queue, exchange, routingKey);

        console.log("Waiting for priority mails...");

        // CONSUME MESSAGE
        channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());

                console.log("Mail received:");
                console.log(data);
                console.log(
                    "Priority:",
                    msg.properties.priority
                );
                console.log("-----------------------");

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
