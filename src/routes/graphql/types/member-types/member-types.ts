import {GraphQLObjectType, GraphQLList, GraphQLID, GraphQLFloat, GraphQLInt} from "graphql";
import {ProfileType} from "../profiles/profiles.js";

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: { type: new GraphQLList(ProfileType)},
  }),
});

// @ts-ignore
export {MemberType}