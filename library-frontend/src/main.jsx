import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import { ApolloProvider } from "@apollo/client/react";
import { SetContextLink } from "@apollo/client/link/context";
import App from "./App.jsx";

const authLink = new SetContextLink((prevContext) => {
  const token = localStorage.getItem("user-token");

  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/",
  })
);

const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
