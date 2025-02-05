const typeDefs = `#graphql
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
    reviews: [Review!]!
  }

  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews: [Review!]
  }

  type Review {
    id: ID!
    rating: Float!
    content: String!
    author_id: Author!
    game: Game!
  }

  type Query{
    games: [Game!]!
    game(id: ID!): Game!
    authors: [Author!]!
    author(id: ID!): Author
    reviews: [Review!]!
    review(id: ID!): Review
  }
`

// games is a function without arugments that returns an array with Game type
// game is a function that needs an argument and return a Game
export default typeDefs;