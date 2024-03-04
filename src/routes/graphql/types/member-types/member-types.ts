import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLNonNull,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { MemberTypeId } from '../../../member-types/schemas.js';

import { FastifyBaseLogger, FastifyInstance, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstanceType } from '../../dataloaders.js';
import { Context } from '../../dataloaders.js';

type MemberTypeEntity = {
  id: MemberTypeId;
  discount: number;
  postsLimitPerMonth: number;
};

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
        args: unknown,
        { fastify: { prisma } }: Context,
      ) => {
        return await prisma.profile.findMany({ where: { memberTypeId: id } });
      },
    },
  }),
});

const MemberQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: MemberType,
  args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
  resolve: async (
    source: unknown,
    { id }: { id: MemberTypeId },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.memberType.findUnique({ where: { id } });
  },
};

const MembersQueryType = {
  type: new GraphQLList(MemberType),
  resolve: async (source: unknown, args: unknown, { fastify: { prisma } }: Context) => {
    return await prisma.memberType.findMany();
  },
};

// @ts-ignore
export { MemberType, MemberQueryType, MembersQueryType };
