const amqp = require("amqplib");

async function sendMail() {
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

        // ASSERT EXCHANGE
        await channel.assertExchange(exchange, "direct", { durable: false });

        /**
         * PRIORITY QUEUE
         * x-max-priority → max priority level allowed
         */
        await channel.assertQueue(queue, {
            durable: false,
            arguments: {
                "x-max-priority": 10,
            },
        });

        // BIND QUEUE
        await channel.bindQueue(queue, exchange, routingKey);

        /**
         * MESSAGES WITH DIFFERENT PRIORITIES
         * Higher priority messages are consumed first
         */
        const messages = [
            {
                body: {
                    subject: "Low Priority Mail",
                    message: "This is a low priority mail",
                },
                priority: 1,
            },
            {
                body: {
                    subject: "High Priority Mail",
                    message: "This is a HIGH priority mail",
                },
                priority: 10,
            },
            {
                body: {
                    subject: "Medium Priority Mail",
                    message: "This is a medium priority mail",
                },
                priority: 5,
            },
        ];

        // PUBLISH MESSAGES
        for (const msg of messages) {
            channel.publish(
                exchange,
                routingKey,
                Buffer.from(JSON.stringify(msg.body)),
                {
                    priority: msg.priority,
                }
            );

            console.log(
                `Sent → ${msg.body.subject} (priority: ${msg.priority})`
            );
        }

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
