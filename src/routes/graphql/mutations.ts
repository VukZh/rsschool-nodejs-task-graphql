import { GraphQLObjectType } from 'graphql';
import {
  ChangeUserMutationType,
  CreateUserMutationType,
  DeleteUserMutationType,
  SubscribeUserMutationType,
  UnsubscribeUserMutationType,
} from './types/users/users.js';
import {
  ChangePostMutationType,
  CreatePostMutationType,
  DeletePostMutationType,
} from './types/posts/posts.js';
import {
  ChangeProfileMutationType,
  CreateProfileMutationType,
  DeleteProfileMutationType,
} from './types/profiles/profiles.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  // @ts-ignore
  fields: () => ({
    createUser: CreateUserMutationType,
    createPost: CreatePostMutationType,
    createProfile: CreateProfileMutationType,
    deleteUser: DeleteUserMutationType,
    deletePost: DeletePostMutationType,
    deleteProfile: DeleteProfileMutationType,
    changeUser: ChangeUserMutationType,
    changePost: ChangePostMutationType,
    changeProfile: ChangeProfileMutationType,
    subscribeTo: SubscribeUserMutationType,
    unsubscribeFrom: UnsubscribeUserMutationType,
  }),
});
