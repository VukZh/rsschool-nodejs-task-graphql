import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList, GraphQLNonNull,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { PostType } from '../posts/posts.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import {UUIDType} from "../uuid.js";
import {GraphQLBoolean, GraphQLInt} from "graphql/index.js";
import {MemberTypeIdType} from "../member-types/member-types.js";

export type UserEntity = { id: string; balance: number; name: string };

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID)},
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: ProfileType,
      resolve: async (
        { id }: UserEntity,
        args: unknown,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.profile.findUnique({ where: { userId: id } });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        { id }: UserEntity,
        args: unknown,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.post.findMany({ where: { authorId: id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (
        { id }: UserEntity,
        args: unknown,
        { prisma }: FastifyInstance,
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
      resolve: async (
        { id }: UserEntity,
        args: unknown,
        { prisma }: FastifyInstance,
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
  resolve: async (source: unknown, { id }: { id: string }, { prisma }: FastifyInstance) => {
    return await prisma.user.findUnique({ where: { id } });
  },
};

const UsersQueryType = {
  type: new GraphQLList(UserType),
  resolve: async (source: unknown, args: unknown, { prisma }: FastifyInstance) => {
    return await prisma.user.findMany();
  },
};

const CreateUserType = {
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) }
  }),
};

const ChangeUserType = {
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat }
  }),
};

// @ts-ignore
export { UserType, UserQueryType, UsersQueryType };
