const amqp = require("amqplib");

async function consumeMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        const exchange = "mailExchange";
        const routingKey = "sendMail";
        const queue = "mailQueue";

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue(queue, { durable: false });

        // BIND QUEUE
        await channel.bindQueue(queue, exchange, routingKey);

        console.log("waiting...");
        
        // CONSUME MESSAGE
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());

                console.log("Mail received:");
                console.log(data);

                // ACK MESSAGE
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
