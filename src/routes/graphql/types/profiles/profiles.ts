import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UserType } from '../users/users.js';
import { MemberType, MemberTypeIdType } from '../member-types/member-types.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { MemberTypeId } from '../../../member-types/schemas.js';
import { UUIDType } from '../uuid.js';
import { GraphQLInputObjectType } from 'graphql/index.js';
import {Context, FastifyInstanceType} from "../../dataloaders.js";

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
        { fastify: { prisma } }: Context,
      ) => {
        return await prisma.user.findUnique({ where: { id: userId } });
      },
    },
    userId: { type: UUIDType },
    memberType: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: MemberType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        args: unknown,
        { fastify: { prisma } }: Context,
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
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (
    source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.profile.findUnique({ where: { id } });
  },
};

const ProfilesQueryType = {
  type: new GraphQLList(ProfileType),
  resolve: async (source: unknown, args: unknown,         { fastify: { prisma } }: Context,
  ) => {
    return await prisma.profile.findMany();
  },
};

const CreateProfileType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
  }),
});

const ChangeProfileType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  }),
});

const CreateProfileMutationType = {
  type: ProfileType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreateProfileType),
    },
  },
  resolve: async (
    source: unknown,
    { dto }: { dto: Omit<ProfileEntity, 'id'> },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.profile.create({ data: dto });
  },
};

const ChangeProfileMutationType = {
  type: ProfileType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeProfileType) },
  },
  resolve: async (
    source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<ProfileEntity, 'id' & 'userId'>> },
    { fastify: { prisma } }: Context,
  ) => {
    console.log("dto", dto)
    return await prisma.profile.update({ where: { id }, data: dto });
  },
};

const DeleteProfileMutationType = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: async (
    source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: Context,
  ) => {
    const result = await prisma.profile.delete({ where: { id } });
    return !!result;
  },
};

export {
  // @ts-ignore
  ProfileType,
  ProfileQueryType,
  ProfilesQueryType,
  CreateProfileMutationType,
  ChangeProfileMutationType,
  DeleteProfileMutationType,
};
