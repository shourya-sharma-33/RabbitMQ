const amqp = require("amqplib");

async function sendMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        // EXCHANGE, ROUTING KEY, MESSAGE
        const exchange = "mailExchange";
        const routingKey = "sendMail";

        const message = {
            to: "ram@email.com",
            from: "shyam@email.com",
            subject: "Hello Ram!!",
            body: "Hello Ram!! What are u doing these days, Long time no see",
        };
        // END - EXCHANGE, ROUTING KEY, MESSAGE

        // ASSERT EXCHANGE & QUEUE
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue("mailQueue", { durable: false });
        // END - ASSERT EXCHANGE & QUEUE

        // BIND QUEUE TO EXCHANGE
        await channel.bindQueue("mailQueue", exchange, routingKey);
        // END - BIND QUEUE TO EXCHANGE

        // PUBLISH MESSAGE
        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );
        // END - PUBLISH MESSAGE

        // CLEANUP
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
        // END - CLEANUP
    } catch (error) {
        console.error(error);
    }
}

sendMail();
