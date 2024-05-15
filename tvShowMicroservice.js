// tvShowMicroservice.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
// Charger le fichier tvShow.proto
const tvShowProtoPath = "tvShow.proto";

const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

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
const tvShowSchema = new mongoose.Schema({
  title: String,
  description: String,
});

// Créer le modèle de film à partir du schéma
const tvShowModel = mongoose.model("TvShow", tvShowSchema);
// Implémenter le service de séries TV
const tvShowService = {
  getTvshow: (call, callback) => {
    // Récupérer les détails de la série TV à partir de la base de données
    const tv_show = {
      id: call.request.tv_show_id,
      title: "Exemple de série TV",
      description: "Ceci est un exemple de série TV.",
      // Ajouter d'autres champs de données pour la série TV au besoin
    };
    callback(null, { tv_show });
  },
  searchTvshows: (call, callback) => {
    const { query } = call.request;
    // Effectuer une recherche de séries TV en fonction de la requête
    const tv_shows = [
      {
        id: "1",
        title: "Exemple de série TV 1",
        description: "Ceci est le premier exemple de série TV.",
      },
      {
        id: "2",
        title: "Exemple de série TV 2",
        description: "Ceci est le deuxième exemple de série TV.",
      },
      // Ajouter d'autres résultats de recherche de séries TV au besoin
    ];
    callback(null, { tv_shows });
  },

  createTvShow: async (call, callback) => {
    const { title, description } = call.request;
    const newTv = new tvShowModel({
      title,
      description,
    });
    const savedTv = await newTv.save();
    // await sendMessage("new_movies", { title, description });
    callback(null, { tv_show : savedTv });
  },
};
// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(tvShowProto.TVShowService.service, tvShowService);
const port = 50052;
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
console.log(`Microservice de séries TV en cours d'exécution sur le port
${port}`);
