import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import typeDefs from "./schema.js";
// db
import _db from "./_db.js";
import DataLoader from "dataloader";
import { groupBy, map } from "ramda";

const resolvers = {
  Query: {
    // what to return when "games" query is being sent
    games() {
      return _db.games;
    },

    authors() {
      return _db.authors;
    },

    reviews() {
      return _db.reviews;
    },

    game(_, args) {
      return _db.games.find((e) => e.id === args.id);
    },
  },
  // relationships
  // manually populate a specific field from Game
  Game: {
    reviews(parent, args, context) {
      const { loaders } = context;
      const { reviewsLoader } = loaders;
      return reviewsLoader.load(parent.id)
    },
  },
  Author: {
    reviews(parent) {
      return _db.reviews.filter((r) => r.author_id === parent.id);
    },
  },
};

// The reviewsById function will batch the requests for reviews by game_id using the `parentIds` array.
// It will query the database (or data source) with all the game IDs at once.
const reviewsById = async (parentIds) => {
  console.log(parentIds); // -> [ '1', '2', '3', '4', '5' ]
  // req to db with parentIds 
  const groupedByID = groupBy((review) => review.game_id, _db.reviews);
  // groupedById object:
  // {
  //   '1': [
  //     { id: '2', rating: 10, content: 'lorem ipsum', author_id: '2', game_id: '1' },
  //     { id: '7', rating: 10, content: 'lorem ipsum', author_id: '3', game_id: '1' }
  //   ],
  //   '2': [
  //     { id: '1', rating: 9, content: 'lorem ipsum', author_id: '1', game_id: '2' },
  //     { id: '6', rating: 7, content: 'lorem ipsum', author_id: '2', game_id: '2' }
  //   ],
  //   '3': [
  //     { id: '3', rating: 7, content: 'lorem ipsum', author_id: '3', game_id: '3' }
  //   ],
  //   '4': [
  //     { id: '4', rating: 5, content: 'lorem ipsum', author_id: '2', game_id: '4' }
  //   ],
  //   '5': [
  //     { id: '5', rating: 8, content: 'lorem ipsum', author_id: '2', game_id: '5' }
  //   ]
  // }
  return map((gameId) => groupedByID[gameId], parentIds);
  // returned value:
  // [
  //   // for game_id '1' -> [ { id: '2', rating: 10, ... }, { id: '7', rating: 10, ... } ]
  //   [
  //     { id: '2', rating: 10, content: 'lorem ipsum', author_id: '2', game_id: '1' },
  //     { id: '7', rating: 10, content: 'lorem ipsum', author_id: '3', game_id: '1' }
  //   ],
  //   // for game_id '2' -> [ { id: '1', rating: 9, ... }, { id: '6', rating: 7, ... } ]
  //   [
  //     { id: '1', rating: 9, content: 'lorem ipsum', author_id: '1', game_id: '2' },
  //     { id: '6', rating: 7, content: 'lorem ipsum', author_id: '2', game_id: '2' }
  //   ],
  //   // for game_id '3' -> [ { id: '3', rating: 7, ... } ]
  //   [
  //     { id: '3', rating: 7, content: 'lorem ipsum', author_id: '3', game_id: '3' }
  //   ],
  //   // for game_id '4' -> [ { id: '4', rating: 5, ... } ]
  //   [
  //     { id: '4', rating: 5, content: 'lorem ipsum', author_id: '2', game_id: '4' }
  //   ],
  //   // for game_id '5' -> [ { id: '5', rating: 8, ... } ]
  //   [
  //     { id: '5', rating: 8, content: 'lorem ipsum', author_id: '2', game_id: '5' }
  //   ]
  // ]
};

const reviewsLoader = new DataLoader(reviewsById);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => ({
    loaders: {
      reviewsLoader: reviewsLoader,
    },
  }),
});

console.log("Server ready at port", { url });
