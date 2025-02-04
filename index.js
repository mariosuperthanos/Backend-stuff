import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// db
import _db from "./_db.js";

// types
import { typeDefs } from "./schema.js";

const resolvers = {
  Query: {
    games() {
      return _db.games
    },
    authors() {
      return _db.authors
    },
    reviews() {
      return _db.reviews
    },
    review(_, args) {
      return _db.reviews.find((review) => review.id===args.id)
    },
    author(_, args) {
      return _db.authors.find((author) => author.id===args.id)
    },
    game(_, args) {
      return _db.games.find((game)=> game.id==args.id)
    }
  },
  // relationships
  // "Game" is a specific resolver for Game type from schema
  // resolvers that specify how to get related data based on the parent entity:
  Game: {
    reviews(parent) {
      return _db.reviews.filter((r) => r.game_id === parent.id)
    }
  },
  Author: {
    reviews(parent) {
      return _db.reviews.filter((r) => r.author_id === parent.id)
    }
  },
  Review: {
    author(parent) {
      return _db.authors.find((a) => a.id===parent.author_id)
    },
    game(parent) {
      return _db.games.find((g) => g.id===parent.game_id)
    },
  }
}

// server setup
const server = new ApolloServer({
  // typeDefs
  typeDefs,
  // resolvers - handle the query based on schema type
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log("Server ready at port", 4000);
