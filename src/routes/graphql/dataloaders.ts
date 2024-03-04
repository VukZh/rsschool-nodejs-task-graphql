import { FastifyInstance } from 'fastify/types/instance.js';
import DataLoader from 'dataloader';
import { FastifyBaseLogger, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export type Context = {
  fastify: FastifyInstance;
  dataloaders: DataloadersType;
};

type FastifyInstanceType = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type DataloadersType = {
  usersDataloader: DataLoader<unknown, unknown, unknown>;
  postsDataloader: DataLoader<unknown, unknown, unknown>;
  profilesDataloader: DataLoader<unknown, unknown, unknown>;
  membersTypesDataloader: DataLoader<unknown, unknown, unknown>;
};

const getDataloaders = (fastify: FastifyInstanceType) => {
  const MembersDataLoaderFunction = async (keys: unknown) => {
    const results = await fastify.prisma.memberType.findMany({
      where: { id: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map((key) =>
      results.find((memberType) => memberType.id === key),
    );
  };

  const PostsDataLoaderFunction = async (keys: unknown) => {
    const results = await fastify.prisma.post.findMany({
      where: { authorId: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map((key) =>
      results.find((post) => post.authorId === key),
    );
  };

  const ProfilesDataLoaderFunction = async (keys: unknown) => {
    const results = await fastify.prisma.profile.findMany({
      where: { userId: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map((key) =>
      results.find((profile) => profile.userId === key),
    );
  };

  const UsersDataLoaderFunction = async (keys: unknown) => {
    const results = await fastify.prisma.user.findMany({
      where: { id: { in: keys as Array<string> } },
    });
    return (keys as Array<string>).map((key) => results.find((user) => user.id === key));
  };

  const usersDataloader = new DataLoader(UsersDataLoaderFunction);
  const postsDataloader = new DataLoader(PostsDataLoaderFunction);
  const profilesDataloader = new DataLoader(ProfilesDataLoaderFunction);
  const membersTypesDataloader = new DataLoader(MembersDataLoaderFunction);

  const dataloaders: DataloadersType = {
    usersDataloader,
    postsDataloader,
    profilesDataloader,
    membersTypesDataloader,
  };

  return dataloaders;
};

// @ts-ignore
export { getDataloaders };
