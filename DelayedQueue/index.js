const amqp = require("amqplib");

async function sendMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        /**
         * EXCHANGES
         * delayExchange → message first goes here
         * mainExchange  → message finally goes here after delay
         */
        const delayExchange = "mail.delay.exchange";
        const mainExchange = "mail.main.exchange";
        const routingKey = "sendMail";

        /**
         * QUEUES
         * delayQueue → holds message temporarily
         * mainQueue  → consumer reads from this
         */
        const delayQueue = "mail.delay.queue";
        const mainQueue = "mail.queue";

        // ASSERT EXCHANGES
        await channel.assertExchange(delayExchange, "direct", { durable: false });
        await channel.assertExchange(mainExchange, "direct", { durable: false });

        /**
         * DELAY QUEUE CONFIG
         * x-message-ttl → delay time (ms)
         * x-dead-letter-exchange → where message goes after TTL
         */
        await channel.assertQueue(delayQueue, {
            durable: false,
            arguments: {
                "x-message-ttl": 5000, // 5 seconds delay
                "x-dead-letter-exchange": mainExchange,
                "x-dead-letter-routing-key": routingKey,
            },
        });

        // MAIN QUEUE
        await channel.assertQueue(mainQueue, { durable: false });

        // BINDINGS
        await channel.bindQueue(delayQueue, delayExchange, routingKey);
        await channel.bindQueue(mainQueue, mainExchange, routingKey);

        // MESSAGE
        const message = {
            to: "ram@email.com",
            from: "shyam@email.com",
            subject: "Delayed Mail",
            body: "This mail will be delivered after 5 seconds",
            createdAt: new Date().toISOString(),
        };

        // PUBLISH MESSAGE TO DELAY EXCHANGE
        channel.publish(
            delayExchange,
            routingKey,
            Buffer.from(JSON.stringify(message))
        );

        console.log("Mail scheduled with 5 second delay");

        // CLEANUP
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
