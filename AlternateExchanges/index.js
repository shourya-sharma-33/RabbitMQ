const amqp = require("amqplib");

async function publishMessages() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    // Main Exchange with alternate exchange
    const mainExchange = "mainExchange";
    const alternateExchange = "aeExchange";

    await channel.assertExchange(alternateExchange, "fanout", { durable: true });
    await channel.assertExchange(mainExchange, "direct", {
        durable: true,
        alternateExchange: alternateExchange,
    });

    // Main queue
    await channel.assertQueue("mainQueue", { durable: true });
    await channel.bindQueue("mainQueue", mainExchange, "validKey");

    // AE queue
    await channel.assertQueue("unroutableQueue", { durable: true });
    await channel.bindQueue("unroutableQueue", alternateExchange, "");

    // Publish message with valid key
    channel.publish(mainExchange, "validKey", Buffer.from("Hello Main Queue"));

    // Publish message with invalid key → goes to AE
    channel.publish(mainExchange, "invalidKey", Buffer.from("Hello AE Queue"));

    console.log("Messages published");

    setTimeout(() => {
        channel.close();
        connection.close();
    }, 500);
}

publishMessages();
