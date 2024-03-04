import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from 'graphql';
import { UserType } from '../users/users.js';
import { UUIDType } from '../uuid.js';
import { Context } from '../../dataloaders.js';

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
        { fastify: { prisma } }: Context,
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
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.post.findUnique({ where: { id } });
  },
};

const PostsQueryType = {
  type: new GraphQLList(PostType),
  resolve: async (source: unknown, args: unknown, { fastify: { prisma } }: Context) => {
    return await prisma.post.findMany();
  },
};

const CreatePostType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});

const ChangePostType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

const CreatePostMutationType = {
  type: PostType,
  args: {
    dto: {
      type: new GraphQLNonNull(CreatePostType),
    },
  },
  resolve: async (
    source: unknown,
    { dto }: { dto: Omit<PostEntity, 'id'> },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.post.create({ data: dto });
  },
};

const ChangePostMutationType = {
  type: PostType,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: { type: new GraphQLNonNull(ChangePostType) },
  },
  resolve: async (
    source: unknown,
    { id, dto }: { id: string; dto: Partial<Omit<PostEntity, 'id' | 'authorId'>> },
    { fastify: { prisma } }: Context,
  ) => {
    return await prisma.post.update({ where: { id }, data: dto });
  },
};

const DeletePostMutationType = {
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
    const result = await prisma.post.delete({ where: { id } });
    return !!result;
  },
};

export {
  // @ts-ignore
  PostType,
  PostQueryType,
  PostsQueryType,
  CreatePostMutationType,
  ChangePostMutationType,
  DeletePostMutationType,
};
