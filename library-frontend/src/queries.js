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

export const BOOKS = gql`
  query {
    allBooks {
      title
      published
      author
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
      author
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
