import { gql } from "@apollo/client";

export const AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription Subscription {
    bookAdded {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

export const BOOKS_BY_GENRE = gql`
  query BookByGenre($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      genres
    }
  }
`;

export const USER_GENRE = gql`
  query Me {
    me {
      favoriteGenre
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addNewPerson(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      author {
        name
      }
      title
      published
    }
  }
`;

export const EDIT_BIRTH_YEAR = gql`
  mutation setBirthYear($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
