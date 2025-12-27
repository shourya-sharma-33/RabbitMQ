const amqp = require("amqplib");

async function consumeMail() {
    try {
        const connection = await amqp.connect(
            "amqp://appuser:apppassword@localhost:5672"
        );
        const channel = await connection.createChannel();

        const exchange = "mailExchange";
        const dlqExchange = "mail.dlx.exchange";

        const queue = "mailQueue";
        const retryRoutingKey = "mail.retry";
        const dlqRoutingKey = "mail.failed";

        await channel.prefetch(1);

        console.log("Waiting for mail...");

        channel.consume(queue, (msg) => {
            if (!msg) return;

            const data = JSON.parse(msg.content.toString());
            const retryCount = msg.properties.headers["x-retry-count"] || 0;

            console.log(`Processing mail (retry ${retryCount}):`, data);

            // Simulate failure
            const processingFailed = true;

            if (processingFailed) {
                if (retryCount < 3) {
                    console.log("Retrying after delay...");

                    channel.publish(
                        dlqExchange,
                        retryRoutingKey,
                        msg.content,
                        {
                            headers: {
                                "x-retry-count": retryCount + 1,
                            },
                        }
                    );
                } else {
                    console.log("Max retries reached → sending to DLQ");

                    channel.publish(
                        dlqExchange,
                        dlqRoutingKey,
                        msg.content,
                        {
                            headers: {
                                "x-retry-count": retryCount,
                            },
                        }
                    );
                }

                channel.ack(msg);
                return;
            }

            channel.ack(msg);
        });
    } catch (error) {
        console.error(error);
    }
}

consumeMail();
