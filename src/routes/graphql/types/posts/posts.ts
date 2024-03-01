import {GraphQLObjectType, GraphQLString, GraphQLID} from "graphql";
import {UserType} from "../users/users.js";

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    author: { type: UserType },
    authorId: { type: GraphQLID },
  }),
});

// @ts-ignore
export {PostType}