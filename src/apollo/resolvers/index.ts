import userResolvers from "./user";
import postResolvers from "./post";
import imageResolvers from "./image";
import commentResolvers from "./comment";
import likeResolvers from "./like";
import settingResolvers from "./setting";
import roleResolvers from "./role";
import roleMemberResolvers from "./roleMember";
import permissionResolvers from "./permission";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...likeResolvers.Query,
    ...imageResolvers.Query,
    ...settingResolvers.Query,
    ...roleResolvers.Query,
    ...roleMemberResolvers.Query,
    ...permissionResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...imageResolvers.Mutation,
    ...settingResolvers.Mutation,
    ...roleResolvers.Mutation,
    ...roleMemberResolvers.Mutation,
    ...permissionResolvers.Mutation,
  },
};
