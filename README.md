# Portfolio for Forrest Wilkins

A website to showcase my work and skills. The tech stack includes the following:

- Apollo GraphQL
- TypeScript
- Next.js
- Prisma

This is free and open source software, as specified by the GNU General Public License.

## Setting up for development

1. Install Node version 15.12.0 using NVM or Homebrew
2. Install Yarn: `npm install -g yarn`
3. Download the package or clone the repo.
4. Install Node modules: `cd portfolio && yarn install`
5. Create a `.env` file and include your database URL as `DATABASE_URL`
6. Generate the Prisma client: `yarn prisma generate`
7. Run the database migrations: `yarn prisma migrate dev --preview-feature`
8. Run `mkdir public/uploads` to enable image uploads
9. Start development server: `yarn dev`
10. To create first user, navigate to http://localhost:3000/users/signup
11. To test out roles and permissions features, navigate to http://localhost:3000/roles
12. Enable pre-commit hook with Husky: `npx husky install && npx husky add .husky/pre-commit "yarn lint-staged"`

The default database is PostgreSQL.

## Tools to get Involved and Collaborate

- Discord: message me at **forrest#2807**
- Notion: https://alike-yamamomo-a11.notion.site/Portfolio-8d75ce0322cc4ab09807b8bd590d6f0b

## Contributions

This project is open to contributions. Please read [CONTRIBUTING.md](https://github.com/forrestwilkins/portfolio/blob/main/CONTRIBUTING.md) for more details.
