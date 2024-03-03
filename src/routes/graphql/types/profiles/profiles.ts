import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';
import { UserType } from '../users/users.js';
import {MemberType, MemberTypeIdType} from '../member-types/member-types.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { MemberTypeId } from '../../../member-types/schemas.js'
import {UUIDType} from "../uuid.js";
type ProfileEntity = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: MemberTypeId;
  userId: string;
};

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: UserType,
      resolve: async (
        { userId }: ProfileEntity,
        args: unknown,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: userId} });
      },
    },
    userId: { type: GraphQLString },
    memberType: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: MemberType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        args: unknown,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.memberType.findUnique({ where: { id: memberTypeId } });
      },
    },
    memberTypeId: { type: MemberTypeIdType },
  }),
});

const ProfileQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: ProfileType,
  args: {id: {
    type: new GraphQLNonNull(UUIDType)
    }},
  resolve: async (source: unknown, {id}: {id: string}, { prisma }: FastifyInstance) => {
    return await prisma.profile.findUnique({where: {id}})
  }
}

const ProfilesQueryType = {
  type: new GraphQLList(ProfileType),
  resolve: async (source: unknown, args: unknown, { prisma }: FastifyInstance) => {
    return await prisma.profile.findMany()
  }
}

// @ts-ignore
export { ProfileType, ProfileQueryType, ProfilesQueryType };
