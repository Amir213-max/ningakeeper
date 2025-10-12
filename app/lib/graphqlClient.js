import { GraphQLClient } from "graphql-request";

const endpoint = process.env.GRAPHQL_ENDPOINT || "https://keeper.in-brackets.online/graphql";

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
});
