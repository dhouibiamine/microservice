const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: ["localhost:9092"], // Spécifiez les brokers Kafka
});

const producer = kafka.producer();

const produceMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic: topic,
    messages: [{ value: message }],
  });
  console.log("Message envoyé avec succès !");
  await producer.disconnect();
};

produceMessage("tvshows_topic", "Votre message ici");
