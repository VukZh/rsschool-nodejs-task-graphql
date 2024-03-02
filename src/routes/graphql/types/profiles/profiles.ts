import {GraphQLObjectType, GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLList} from 'graphql';
import { UserType } from '../users/users.js';
import {MemberType, MemberTypeIdType} from '../member-types/member-types.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { MemberTypeId } from '../../../member-types/schemas.js'
type ProfileEntity = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
};

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    user: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: UserType,
      resolve: async (
        { userId }: ProfileEntity,
        args: Omit<ProfileEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: userId} });
      },
    },
    userId: { type: GraphQLID },
    memberType: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: MemberType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        args: Omit<ProfileEntity, 'id'>,
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
    type: GraphQLID
    }},
  resolve: async (source: unknown, {id}: {id: string}, { prisma }: FastifyInstance) => {
    return await prisma.profile.findUnique({where: {id:id}})
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
