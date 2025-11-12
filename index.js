const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const Author = require("./models/author");
const mongoose = require("mongoose");
const { GraphQLError } = require("graphql");

require("dotenv").config();

const mongoUrl = process.env.MONGODB_URL;

(async () => {
  try {
    await mongoose.connect(mongoUrl, { dbName: "library" });
    console.log("db connection successful");
  } catch (err) {
    console.error("error connecting to db, failed!!!!");
  }
})();

const authors = Author.find();
const books = Book.find();

const typeDefs = `
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments({}),
    authorCount: async () => Author.countDocuments({}),
    allBooks: async (root, args) => {
      let filteredBooks;
      const books = await Book.find().populate("author");
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        filteredBooks = await Book.find({ author: author._id }).populate(
          "author"
        );
        if (args.genre) {
          return filteredBooks.filter((book) =>
            book.genres.includes(args.genre)
          );
        }
      }
      return args.genre
        ? books.filter((book) => book.genres.includes(args.genre))
        : books;
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, { currentUser }) => currentUser,
  },

  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate("author");
      return books.filter((book) => book.author.name === root.name).length;
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({
          name: args.author,
        });

        await author.save();
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id,
      });
      try {
        await book.save();
      } catch (err) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            err,
          },
        });
      }

      return book.populate("author");
    },
    editAuthor: async (root, args, {currentUser}) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const author = await Author.findOne({ name: args.name });
      if (author) {
        author.born = args.setBornTo;
        return await author.save();
      } else return null;
    },
    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({
        username,
        favoriteGenre,
      });
      return await user.save();
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username: username });

      if (!user || password != "secret") {
        throw new GraphQLError("Invalid Credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
        lover: "Aisha",
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
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
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
