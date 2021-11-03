import { ApolloError } from "apollo-server-micro";
import { Role } from ".prisma/client";
import prisma from "../../utils/initPrisma";
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
  INITIAL_GLOBAL_ADMIN_PERMISSIONS,
  INITIAL_GLOBAL_PERMISSIONS,
} from "../../constants/role";
import { initializePermissions } from "../models/role";
import { TypeNames } from "../../constants/common";
import Messages from "../../utils/messages";

interface RoleInput {
  name: string;
  color: string;
}

const roleResolvers = {
  Query: {
    role: async (_: any, { id }: { id: string }) => {
      const role = await prisma.role.findFirst({
        where: {
          id: parseInt(id),
        },
      });
      return role;
    },

    globalRoles: async () => {
      // TODO: Uncomment the line below before refreshing on /roles to update all roles with new permissions
      // syncWithNewRolePermissions();

      const roles = await prisma.role.findMany();
      return roles;
    },
  },

  Mutation: {
    async createRole(
      _: any,
      {
        input,
      }: {
        input: RoleInput;
      }
    ) {
      const { name, color } = input;
      let role: Role;

      try {
        role = await prisma.role.create({
          data: {
            name,
            color,
          },
        });
      } catch {
        throw new ApolloError(Messages.roles.errors.create());
      }

      initializePermissions(INITIAL_GLOBAL_PERMISSIONS, role);

      return { role };
    },

    async updateRole(_: any, { id, input }: { id: string; input: RoleInput }) {
      try {
        const { name, color } = input;
        const role = await prisma.role.update({
          where: { id: parseInt(id) },
          data: { name, color },
        });

        if (!role)
          throw new ApolloError(Messages.items.notFound(TypeNames.Role));

        return { role };
      } catch {
        throw new ApolloError(Messages.roles.errors.update());
      }
    },

    async deleteRole(_: any, { id }: { id: string }) {
      const whereRoleId = {
        where: {
          roleId: parseInt(id),
        },
      };
      const models: any[] = [prisma.roleMember, prisma.permission];
      for (const model of models) {
        await model.deleteMany(whereRoleId);
      }
      await prisma.role.delete({
        where: { id: parseInt(id) },
      });
      return true;
    },

    async initializeAdminRole(_: any, { userId }: { userId: string }) {
      const roles = await prisma.role.findMany();
      if (roles.length > 0)
        throw new ApolloError(Messages.errors.somethingWrong());

      const role = await prisma.role.create({
        data: {
          name: ADMIN_ROLE_NAME,
          color: DEFAULT_ROLE_COLOR,
        },
      });
      initializePermissions(INITIAL_GLOBAL_ADMIN_PERMISSIONS, role);
      await prisma.roleMember.create({
        data: {
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
          role: {
            connect: {
              id: role.id,
            },
          },
        },
      });

      return { role };
    },
  },
};

export default roleResolvers;
