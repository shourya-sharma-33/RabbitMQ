const amqp = require("amqplib");

async function sendTasks() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "taskQueue";
    await channel.assertQueue(queue, { durable: true });

    for (let i = 1; i <= 10; i++) {
        const task = { id: i, job: `Task ${i}` };
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), { persistent: true });
        console.log("Sent:", task);
    }

    setTimeout(() => channel.close(), 500);
}

sendTasks();
