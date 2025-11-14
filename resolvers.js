const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const { GraphQLError, subscribe } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

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
    allAuthors: async () => {
      const authorsWithBookCount = await Author.aggregate([
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "author",
            as: "books",
          },
        },
        {
          $addFields: {
            bookCount: { $size: "$books" },
          },
        },
        {
          $project: {
            name: 1,
            born: 1,
            bookCount: 1,
          },
        },
      ]);
      return authorsWithBookCount
    },
    me: (root, args, { currentUser }) => currentUser,
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

      pubsub.publish("BOOK_ADDED", { bookAdded: book.populate("author") });

      return book.populate("author");
    },
    editAuthor: async (root, args, { currentUser }) => {
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
