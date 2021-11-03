import { gql } from "apollo-server-micro";
import User from "./user";
import Post from "./post";
import Comment from "./comment";
import Like from "./like";
import Image from "./image";
import Setting from "./setting";
import Role from "./role";
import RoleMember from "./roleMember";
import Permission from "./permission";

export const typeDefs = gql`
  scalar FileUpload
  scalar JSON

  ${User}
  ${Post}
  ${Comment}
  ${Like}
  ${Image}
  ${Setting}
  ${Role}
  ${RoleMember}
  ${Permission}

  type FeedPayload {
    pagedItems: [Post]
    totalItems: Int!
  }

  type Query {
    user(id: ID!): User!
    userByName(name: String!): User!
    allUsers: [User]!
    homeFeed(userId: ID, currentPage: Int!, pageSize: Int!): FeedPayload!
    profileFeed(name: String!, currentPage: Int!, pageSize: Int!): FeedPayload!

    post(id: ID!): Post!
    postsByUserName(name: String!): [Post]

    comment(id: ID!): Comment!
    commentsByPostId(postId: ID!): CommentsPayload!
    commentsByMotionId(motionId: ID!): CommentsPayload!

    likesByPostId(postId: ID!): [Like]!
    likesByMotionId(motionId: ID!): [Like]!
    likesByCommentId(commentId: ID!): [Like]!

    imagesByPostId(postId: ID!): [Image]
    imagesByCommentId(commentId: ID!): [Image]
    profilePicture(userId: ID!): Image
    profilePictures(userId: ID!): [Image]
    coverPhotoByUserId(userId: ID!): Image

    settingsByUserId(userId: ID!): [Setting]!
    settingsByGroupId(groupId: ID!): [Setting]!

    role(id: ID!): Role!
    globalRoles: [Role]!
    roleMembers(roleId: ID!): [RoleMember]
    permissionsByRoleId(roleId: ID!): [Permission]!
    hasPermissionGlobally(name: String!, userId: ID!): Boolean!
  }

  type Mutation {
    signUp(input: SignUpInput!): UserPayload!
    signIn(input: SignInInput!): UserPayload!
    updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
    deleteUser(id: ID!): Boolean!

    createPost(
      userId: ID!
      groupId: ID
      eventId: ID
      input: CreatePostInput!
    ): PostPayload!
    updatePost(id: ID!, input: UpdatePostInput!): PostPayload!
    deletePost(id: ID!): Boolean!

    createComment(
      userId: ID!
      postId: ID
      motionId: ID
      input: CreateCommentInput!
    ): CommentPayload!
    updateComment(id: ID!, input: UpdateCommentInput!): CommentPayload!
    deleteComment(id: ID!): Boolean!

    createLike(
      userId: ID!
      postId: ID
      motionId: ID
      commentId: ID
    ): LikePayload!
    deleteLike(id: ID!): Boolean!

    deleteImage(id: ID!): Boolean!

    updateSettings(input: UpdateSettingsInput!): SettingsPayload!

    createRole(
      groupId: ID
      global: Boolean
      input: CreateRoleInput!
    ): RolePayload!
    updateRole(id: ID!, input: UpdateRoleInput!): RolePayload!
    deleteRole(id: ID!): Boolean!
    initializeAdminRole(userId: ID!): RolePayload!

    addRoleMembers(roleId: ID!, input: AddRoleMembersInput!): RoleMemberPayload!
    deleteRoleMember(id: ID!): Boolean!

    updatePermissions(input: UpdatePermissionsInput!): PermissionsPayload!
  }
`;
