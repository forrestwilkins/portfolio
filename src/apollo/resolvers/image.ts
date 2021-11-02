import { GraphQLUpload } from "apollo-server-micro";
import { ImageVariety } from "../../constants/image";
import { deleteImage } from "../../utils/image";
import prisma from "../../utils/initPrisma";
import { sortByNewest } from "../models/common";

const imageResolvers = {
  FileUpload: GraphQLUpload,

  Query: {
    imagesByPostId: async (_: any, { postId }: { postId: string }) => {
      const images = await prisma.image.findMany({
        where: { postId: parseInt(postId) },
      });
      return images;
    },

    imagesByCommentId: async (_: any, { commentId }: { commentId: string }) => {
      const images = await prisma.image.findMany({
        where: { commentId: parseInt(commentId) },
      });
      return images;
    },

    profilePictures: async (_: any, { userId }: { userId: string }) => {
      const profilePictures = await prisma.image.findMany({
        where: {
          userId: parseInt(userId),
          variety: ImageVariety.ProfilePicture,
        },
      });
      return profilePictures;
    },

    profilePicture: async (_: any, { userId }: { userId: string }) => {
      const profilePictures = await prisma.image.findMany({
        where: {
          userId: parseInt(userId),
          variety: ImageVariety.ProfilePicture,
        },
      });
      return sortByNewest(profilePictures)[0];
    },

    coverPhotoByUserId: async (_: any, { userId }: { userId: string }) => {
      const coverPhotos = await prisma.image.findMany({
        where: {
          userId: parseInt(userId),
          variety: ImageVariety.CoverPhoto,
        },
      });
      return sortByNewest(coverPhotos)[0];
    },
  },

  Mutation: {
    async deleteImage(_: any, { id }: { id: string }) {
      const image = await prisma.image.delete({
        where: { id: parseInt(id) },
      });
      await deleteImage(image.path);
      return true;
    },
  },
};

export default imageResolvers;
