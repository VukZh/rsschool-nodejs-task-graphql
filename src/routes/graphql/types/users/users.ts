import {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLFloat, GraphQLList} from "graphql";
import {ProfileType} from "../profiles/profiles.js";
import {PostType} from "../posts/posts.js";

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    profile: { type: ProfileType },
    posts: { type: new GraphQLList(PostType) },
    userSubscribedTo: { type: new GraphQLList(UserType) },
    subscribedToUser: { type: new GraphQLList(UserType) },
  }),
});



// @ts-ignore
export {UserType}