import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { PostType } from '../posts/posts.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { UUIDType } from '../uuid.js';
import { GraphQLBoolean, GraphQLInputObjectType } from 'graphql/index.js';
import {Context, FastifyInstanceType} from "../../dataloaders.js";

export type UserEntity = { id: string; balance: number; name: string };

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: ProfileType,
      resolve: async ({ id }: UserEntity, args: unknown,         { fastify: { prisma } }: Context,
      ) => {
        return await prisma.profile.findUnique({ where: { userId: id } });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async ({ id }: UserEntity, args: unknown,         { fastify: { prisma } }: Context,
      ) => {
        return await prisma.post.findMany({ where: { authorId: id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, args: unknown,         { fastify: { prisma } }: Context,
      ) => {
        const usersSubscriber = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: id },
        });
        const usersSubscriberIds = usersSubscriber.map((s) => s.authorId);
        return await prisma.user.findMany({ where: { id: { in: usersSubscriberIds } } });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, args: unknown,         { fastify: { prisma } }: Context,
      ) => {
        const subscribers = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: id },
        });
        const subscribersIds = subscribers.map((s) => s.subscriberId);
        return await prisma.user.findMany({ where: { id: { in: subscribersIds } } });
      },
    },
  }),
});

const UserQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: UserType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    source: unknown,
    { id }: { id: string },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.user.findUnique({ where: { id } });
  },
};

const UsersQueryType = {
  type: new GraphQLList(UserType),
  resolve: async (source: unknown, args: unknown,         { fastify: { prisma } }: Context) => {
    return await prisma.user.findMany();
  },
};

const CreateUserType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

const ChangeUserType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

const CreateUserMutationType = {
  type: UserType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreateUserType),
    },
  },
  resolve: async (
    source: unknown,
    { dto }: { dto: Omit<UserEntity, 'id'> },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.user.create({ data: dto });
  },
};

const ChangeUserMutationType = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(UUIDType) },
    dto: { type: new GraphQLNonNull(ChangeUserType) },
  },
  resolve: async (
    source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<UserEntity, 'id'>> },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.user.update({ where: { id }, data: dto });
  },
};

const DeleteUserMutationType = {
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
    const result = await prisma.user.delete({ where: { id } });
    return !!result;
  },
};

const SubscribeUserMutationType = {
  type: UserType,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    source: unknown,
    { userId, authorId }: { userId: string; authorId: string },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        userSubscribedTo: {
          create: {
            authorId,
          },
        },
      },
    });
  },
};

const UnsubscribeUserMutationType = {
  type: GraphQLBoolean,
  args: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
  resolve: async (
    source: unknown,
    { userId, authorId }: { userId: string; authorId: string },
    { fastify: { prisma } }: Context,
  ) => {
    const result = await prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: { subscriberId: userId, authorId }},
    });
    return !!result;
  },
};

export {
  // @ts-ignore
  UserType,
  UserQueryType,
  UsersQueryType,
  CreateUserMutationType,
  ChangeUserMutationType,
  DeleteUserMutationType,
  SubscribeUserMutationType,
  UnsubscribeUserMutationType,
};
