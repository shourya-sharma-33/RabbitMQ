const amqp = require("amqplib");

async function sendMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();
        // END - AMQPLIB SETUP

        // EXCHANGE & ROUTING KEYS
        const exchange = "mailExchange";
        const routingKeyForDevTeam = "sendToDevTeam";
        const routingKeyForUsers = "sendToUsers";

        // DEV TEAM MESSAGE
        const devTeamMessage = {
            to: "devteam@company.com",
            from: "noreply@company.com",
            subject: "URGENT: Fix Payment Service",
            body: "The payment-service is throwing 500 errors in production. Please investigate the latest deployment and apply a hotfix.",
            priority: "high",
            service: "payment-service",
        };

        // USER MESSAGE
        const userMessage = {
            to: "user@customer.com",
            from: "offers@company.com",
            subject: "🎄 Christmas Special – Flat 30% OFF!",
            body: "Celebrate Christmas with us! Enjoy a flat 30% discount on all products. Offer valid till Dec 25. Happy Holidays!",
            discount: "30%",
            validTill: "25-Dec",
        };

        // ASSERT EXCHANGE & QUEUES
        await channel.assertExchange(exchange, "direct", { durable: false });
        await channel.assertQueue("Queue$_$DevTeam", { durable: false });
        await channel.assertQueue("Queue$_$Users", { durable: false });

        // BIND QUEUES
        await channel.bindQueue(
            "Queue$_$DevTeam",
            exchange,
            routingKeyForDevTeam
        );
        await channel.bindQueue(
            "Queue$_$Users",
            exchange,
            routingKeyForUsers
        );

        // PUBLISH DEV TEAM MESSAGE
        channel.publish(
            exchange,
            routingKeyForDevTeam,
            Buffer.from(JSON.stringify(devTeamMessage))
        );

        // PUBLISH USER MESSAGE
        channel.publish(
            exchange,
            routingKeyForUsers,
            Buffer.from(JSON.stringify(userMessage))
        );

        console.log("Dev & User mail events published successfully");

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
