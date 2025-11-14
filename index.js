const { ApolloServer } = require("@apollo/server");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const resolvers = require("./resolvers");
const mongoose = require("mongoose");
const typeDefs = require("./schema");
require("dotenv").config();

const { expressMiddleware } = require("@as-integrations/express5");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const cors = require("cors");
const http = require("http");

const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");

const mongoUrl = process.env.MONGODB_URL;
console.log("connecting to mongodb");
mongoose
  .connect(mongoUrl, { dbName: "library" })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

mongoose.set("debug", true);

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );

          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;

  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
  });
};

start();
