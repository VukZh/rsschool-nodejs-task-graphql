import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';
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
        return await prisma.user.findUnique({ where: { id: id } });
      },
    },
  }),
});

// @ts-ignore
export { PostType };
