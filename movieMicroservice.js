// movieMicroservice.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const { Kafka } = require("kafkajs");
// Charger le fichier movie.proto
const movieProtoPath = "movie.proto";
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

// const kafka = new Kafka({
//   clientId: "my-app",
//   brokers: ["localhost:9092"],
// });

// const producer = kafka.producer();

// const sendMessage = async (topic, message) => {
//   await producer.connect();
//   await producer.send({
//     topic,
//     messages: [{ value: JSON.stringify(message) }],
//   });
//   await producer.disconnect();
// };

// const produceMessage = async (topic, message) => {
//   await producer.connect();
//   await producer.send({
//     topic: topic,
//     messages: [{ value: message }],
//   });
//   console.log("Message envoyé avec succès !");
//   await producer.disconnect();
// };

// Connexion à la base de données MongoDB
mongoose.connect("mongodb://localhost:27017/movieDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur de connexion MongoDB :"));
db.once("open", () => {
  console.log("Connexion à MongoDB réussie");
});

// Définir le schéma du modèle de film
const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
});

// Créer le modèle de film à partir du schéma
const MovieModel = mongoose.model("Movie", movieSchema);

// Implémenter le service movie
const movieService = {
  getMovie: (call, callback) => {
    // Récupérer les détails du film à partir de la base de données
    const movie = {
      id: call.request.movie_id,
      title: "Exemple de film",
      description: "Ceci est un exemple de film.",
      // Ajouter d'autres champs de données pour le film au besoin
    };
    callback(null, { movie });
  },
  searchMovies: (call, callback) => {
    const { query } = call.request;
    // Effectuer une recherche de films en fonction de la requête
    const movies = [
      {
        id: "1",
        title: "Exemple de film 1",
        description: "Ceci est le premier exemple de film.",
      },
      {
        id: "2",
        title: "Exemple de film 2",
        description: "Ceci est le deuxième exemple de film.",
      },
      // Ajouter d'autres résultats de recherche de films au besoin
    ];
    callback(null, { movies });
  },
  // Ajouter d'autres méthodes au besoin
  createMovie: async (call, callback) => {
    const { title, description } = call.request;
    const newMovie = new MovieModel({
      title,
      description,
    });
    const savedMovie = await newMovie.save();
    // await sendMessage("movies_topic", savedMovie);
    // await produceMessage("tvshows_topic", savedMovie);
    callback(null, { movie: savedMovie });
  },
};
// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Échec de la liaison du serveur:", err);
      return;
    }
    console.log(`Le serveur s'exécute sur le port ${port}`);
    server.start();
  }
);
console.log(`Microservice de films en cours d'exécution sur le port ${port}`);
