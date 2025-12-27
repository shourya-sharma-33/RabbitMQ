const amqp = require("amqplib");

async function sendMail() {
    try {
        // AMQPLIB SETUP
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        // FANOUT EXCHANGE
        const exchange = "mailExchange$_$Fanout";

        const broadcastMessage = {
            subject: "🚨 System Maintenance Notice",
            body: "The system will undergo maintenance tonight from 12 AM to 2 AM.",
            timestamp: new Date().toISOString(),
        };

        // ASSERT EXCHANGE & QUEUES
        await channel.assertExchange(exchange, "fanout", { durable: false });
        await channel.assertQueue("Queue$_$DevTeam", { durable: false });
        await channel.assertQueue("Queue$_$Users", { durable: false });

        // BIND QUEUES (NO ROUTING KEY)
        await channel.bindQueue("Queue$_$DevTeam", exchange, "");
        await channel.bindQueue("Queue$_$Users", exchange, "");

        // PUBLISH MESSAGE (routing key ignored)
        channel.publish(
            exchange,
            "",
            Buffer.from(JSON.stringify(broadcastMessage))
        );

        console.log("Fanout broadcast message sent");

        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error(error);
    }
}

sendMail();
