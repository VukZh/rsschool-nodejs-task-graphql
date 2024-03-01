import {GraphQLObjectType, GraphQLID, GraphQLBoolean, GraphQLInt} from "graphql";
import {UserType} from "../users/users.js";
import { MemberType } from "../member-types/member-types.js";

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    user: { type: UserType },
    userId: { type: GraphQLID },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    memberType: { type: MemberType },
    memberTypeId: { type: GraphQLID },
  }),
});

// @ts-ignore
export {ProfileType}