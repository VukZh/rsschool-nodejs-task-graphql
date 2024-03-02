import { GraphQLObjectType, GraphQLID, GraphQLBoolean, GraphQLInt } from 'graphql';
import { UserType } from '../users/users.js';
import { MemberType } from '../member-types/member-types.js';
import { FastifyInstance } from 'fastify/types/instance.js';

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
        { id }: ProfileEntity,
        args: Omit<ProfileEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: id } });
      },
    },
    userId: { type: GraphQLID },
    memberType: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: MemberType,
      resolve: async (
        { id }: ProfileEntity,
        args: Omit<ProfileEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.memberType.findUnique({ where: { id: id } });
      },
    },
    memberTypeId: { type: GraphQLID },
  }),
});

// @ts-ignore
export { ProfileType };
