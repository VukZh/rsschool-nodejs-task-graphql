import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLResolveInfo,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { PostType } from '../posts/posts.js';
import { UUIDType } from '../uuid.js';
import { GraphQLBoolean, GraphQLInputObjectType } from 'graphql/index.js';
import { Context } from '../../dataloaders.js';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

export type UserEntity = { id: string; balance: number; name: string };
type User = UserEntity & {
  userSubscribedTo: Array<{ subscriberId: string; authorId: string }>;
  subscribedToUser: Array<{ subscriberId: string; authorId: string }>;
};
type SubscribedType = {
  subscribedToUser?: object;
  userSubscribedTo?: object;
};

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: ProfileType,
      resolve: async ({ id }: UserEntity, args: unknown, { dataloaders }: Context) => {
        return await dataloaders.profilesDataloader.load(id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        { id }: UserEntity,
        args: unknown,
        { fastify: { prisma } }: Context,
      ) => {
        return await prisma.post.findMany({ where: { authorId: id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, args: unknown, { dataloaders }: Context) => {
        const usersSubscriber = (await dataloaders.usersDataloader.load(id)) as User;

        const usersSubscriberIds = usersSubscriber.userSubscribedTo.map((item) => {
          return dataloaders.usersDataloader.load(item.authorId);
        });

        const result = await Promise.all(usersSubscriberIds);

        return result;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }: UserEntity, args: unknown, { dataloaders }: Context) => {
        const subscribers = (await dataloaders.usersDataloader.load(id)) as User;

        const subscribersIds = subscribers.subscribedToUser.map((item) => {
          return dataloaders.usersDataloader.load(item.subscriberId);
        });

        const result = await Promise.all(subscribersIds);

        return result;
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
    { fastify: { prisma }, dataloaders }: Context,
    resolveInfo: GraphQLResolveInfo,
  ) => {
    const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
    const { fields } = simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfoFragment as ResolveTree,
      new GraphQLList(UserType),
    );

    const { subscribedToUser, userSubscribedTo } = fields as SubscribedType;

    const users = await prisma.user.findMany({
      include: {
        subscribedToUser: subscribedToUser ? true : false,
        userSubscribedTo: userSubscribedTo ? true : false,
      },
    });

    users.forEach((user) => {
      dataloaders.usersDataloader.prime(user.id, user);
    });

    return await dataloaders.usersDataloader.load(id);
  },
};

const UsersQueryType = {
  type: new GraphQLList(UserType),
  resolve: async (
    source: unknown,
    args: unknown,
    { fastify: { prisma }, dataloaders }: Context,
    resolveInfo: GraphQLResolveInfo,
  ) => {
    const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
    const { fields } = simplifyParsedResolveInfoFragmentWithType(
      parsedResolveInfoFragment as ResolveTree,
      new GraphQLList(UserType),
    );

    const { subscribedToUser, userSubscribedTo } = fields as SubscribedType;

    const users = await prisma.user.findMany({
      include: {
        subscribedToUser: subscribedToUser ? true : false,
        userSubscribedTo: userSubscribedTo ? true : false,
      },
    });

    users.forEach((user) => {
      dataloaders.usersDataloader.prime(user.id, user);
    });

    return users;
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
        subscriberId_authorId: { subscriberId: userId, authorId },
      },
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
