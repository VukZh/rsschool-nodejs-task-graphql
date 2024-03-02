import {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList} from 'graphql';
import { UserType } from '../users/users.js';
import { FastifyInstance } from 'fastify/types/instance.js';

type PostEntity = { id: string; title: string; content: string; authorId: string };
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLID },
    author: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: UserType,
      resolve: async (
        { id }: PostEntity,
        args: Omit<PostEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id } });
      },
    },
  }),
});

const PostQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: PostType,
  args: { id: GraphQLID },
  resolve: async (source: unknown, {id}: {id: string}, { prisma }: FastifyInstance) => {
    return await prisma.post.findUnique({where: {id: id}})
  }
}

const PostsQueryType = {
  type: new GraphQLList(PostType),
  resolve: async (source: unknown, args: unknown, { prisma }: FastifyInstance) => {
    return await prisma.post.findMany()
  }
}

// @ts-ignore
export { PostType, PostQueryType, PostsQueryType };
