import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt, GraphQLEnumType,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { MemberTypeId } from '../../../member-types/schemas.js';

type MemberTypeEntity = { id: MemberTypeId; discount: number; postsLimitPerMonth: number };

export const MemberTypeIdType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeIdType },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (
        { id }: MemberTypeEntity,
        args: Omit<MemberTypeEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.profile.findMany({ where: { memberTypeId: id } });
      },
    },
  }),
});

const MemberQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: MemberType,
  args: {
    id: {
      type: GraphQLInt,
    },
  },
  resolve: async (
    source: unknown,
    { id }: { id: MemberTypeId },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.memberType.findUnique({ where: { id: id } });
  },
};

const MembersQueryType = {
  type: new GraphQLList(MemberType),
  resolve: async (source: unknown, args: unknown, { prisma }: FastifyInstance) => {
    return await prisma.memberType.findMany();
  },
};

// @ts-ignore
export { MemberType, MemberQueryType, MembersQueryType };
