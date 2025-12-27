const amqp = require("amqplib");

async function sendMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        // TOPIC EXCHANGE
        const exchange = "mailExchange$_$Topic";

        // TOPIC ROUTING KEYS
        const devRoutingKey = "mail.dev.alert";
        const userRoutingKey = "mail.user.promo";

        // DEV TEAM MESSAGE
        const devTeamMessage = {
            to: "devteam@company.com",
            subject: "URGENT: Fix Payment Service",
            body: "Payment service is failing in production. Please investigate immediately.",
            service: "payment-service",
            severity: "high",
        };

        // USER MESSAGE
        const userMessage = {
            to: "user@customer.com",
            subject: "🎄 Christmas Sale – 30% OFF",
            body: "Flat 30% off on all items this Christmas. Limited time offer!",
            discount: "30%",
        };

        // ASSERT EXCHANGE & QUEUES
        await channel.assertExchange(exchange, "topic", { durable: false });
        await channel.assertQueue("Queue$_$DevTeam", { durable: false });
        await channel.assertQueue("Queue$_$Users", { durable: false });

        // BIND QUEUES USING TOPIC PATTERNS
        await channel.bindQueue(
            "Queue$_$DevTeam",
            exchange,
            "mail.dev.*"
        );

        await channel.bindQueue(
            "Queue$_$Users",
            exchange,
            "mail.user.*"
        );

        // PUBLISH MESSAGES
        channel.publish(
            exchange,
            devRoutingKey,
            Buffer.from(JSON.stringify(devTeamMessage))
        );

        channel.publish(
            exchange,
            userRoutingKey,
            Buffer.from(JSON.stringify(userMessage))
        );

        console.log("Topic-based mail events published");

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
