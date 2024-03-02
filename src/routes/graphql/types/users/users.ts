import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList,
} from 'graphql';
import { ProfileType } from '../profiles/profiles.js';
import { PostType } from '../posts/posts.js';
import { FastifyInstance } from 'fastify/types/instance.js';

export type UserEntity = { id: string; balance: number; name: string };

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: ProfileType,
      resolve: async (
        { id }: UserEntity,
        args: Omit<UserEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.profile.findUnique({ where: { id: id } });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        { id }: UserEntity,
        args: Omit<UserEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.post.findMany({ where: { id: id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (
        { id }: UserEntity,
        args: Omit<UserEntity, 'id'>,
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
        args: Omit<UserEntity, 'id'>,
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

// @ts-ignore
export { UserType };
