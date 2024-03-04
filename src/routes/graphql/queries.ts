import { GraphQLObjectType } from 'graphql';
import { UserQueryType, UsersQueryType } from './types/users/users.js';
import { PostQueryType, PostsQueryType } from './types/posts/posts.js';
import { MemberQueryType, MembersQueryType } from './types/member-types/member-types.js';
import { ProfileQueryType, ProfilesQueryType } from './types/profiles/profiles.js';

export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: UserQueryType,
    users: UsersQueryType,
    post: PostQueryType,
    posts: PostsQueryType,
    memberType: MemberQueryType,
    memberTypes: MembersQueryType,
    profile: ProfileQueryType,
    profiles: ProfilesQueryType,
  }),
});
