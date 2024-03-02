import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { FastifyInstance } from 'fastify/types/instance.js';

type MemberTypeEntity = { id: string; discount: number; postsLimitPerMonth: number };

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: GraphQLID },
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

// @ts-ignore
export { MemberType };
