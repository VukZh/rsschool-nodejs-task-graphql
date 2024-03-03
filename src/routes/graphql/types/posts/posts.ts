import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { UserType } from '../users/users.js';
import { FastifyInstance } from 'fastify/types/instance.js';
import { UUIDType } from '../uuid.js';

type PostEntity = { id: string; title: string; content: string; authorId: string };
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: UserType,
      resolve: async (
        { authorId }: PostEntity,
        args: Omit<PostEntity, 'id'>,
        { prisma }: FastifyInstance,
      ) => {
        return await prisma.user.findUnique({ where: { id: authorId } });
      },
    },
  }),
});

const PostQueryType = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  type: PostType,
  args: { id: { type: new GraphQLNonNull(UUIDType) } },
  resolve: async (
    source: unknown,
    { id }: { id: string },
    { prisma }: FastifyInstance,
  ) => {
    return await prisma.post.findUnique({ where: { id } });
  },
};

const PostsQueryType = {
  type: new GraphQLList(PostType),
  resolve: async (source: unknown, args: unknown, { prisma }: FastifyInstance) => {
    return await prisma.post.findMany();
  },
};

const CreatePostType = {
  name: 'CreatePostInput',
  fields: () => ({
    title: {
      title: { type: new GraphQLNonNull(GraphQLString)},
      content: { type: new GraphQLNonNull(GraphQLString) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
  }),
};

const ChangePostType = {
  name: 'ChangePostInput',
  fields: () => ({
    title: {
      title: { type: GraphQLString},
      content: { type: GraphQLString },
    },
  }),
};
// @ts-ignore
export { PostType, PostQueryType, PostsQueryType };
