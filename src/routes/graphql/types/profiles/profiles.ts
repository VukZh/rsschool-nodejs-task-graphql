import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { UserType } from '../users/users.js';
import { MemberType, MemberTypeIdType } from '../member-types/member-types.js';
import { MemberTypeId } from '../../../member-types/schemas.js';
import { UUIDType } from '../uuid.js';
import { GraphQLInputObjectType } from 'graphql/index.js';
import { Context } from '../../dataloaders.js';

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
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
    user: {
      type: UserType,
      resolve: async (
        { userId }: ProfileEntity,
        _args: unknown,
        { dataloaders }: Context,
      ) => {
        return await dataloaders.usersDataloader.load(userId);
      },
    },
    memberType: {
      type: MemberType,
      resolve: async (
        { memberTypeId }: ProfileEntity,
        _args: unknown,
        { dataloaders }: Context,
      ) => {
        return await dataloaders.membersTypesDataloader.load(memberTypeId);
      },
    },
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
  resolve: async (source: unknown, args: unknown, { fastify: { prisma } }: Context) => {
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
    console.log('dto', dto);
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
