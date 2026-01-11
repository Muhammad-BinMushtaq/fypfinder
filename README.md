# FYP Finder

FYP Finder is a Next.js-based platform designed to help students connect, collaborate, and manage their Final Year Project (FYP) activities efficiently.

## Features

- **Authentication**: Secure login and signup functionality.
- **Student Profiles**: Create, update, and manage student profiles.
- **Skill Management**: Add, update, and remove skills.
- **Project Management**: Add, update, and remove projects.
- **Group Management**: Create and manage groups, add or remove members, and lock groups.
- **Messaging**: Send and manage requests and messages between students.
- **Discovery**: Match students based on skills and interests.

## Technologies Used

- **Next.js**: Framework for building the application.
- **Prisma**: ORM for database management.
- **Supabase**: PostgreSQL database hosting.
- **TypeScript**: For type-safe development.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account for database setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Muhammad-BinMushtaq/fypfinder.git
   cd fypfinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add the following variables:
     ```
     DATABASE_URL=your-supabase-database-url
     DIRECT_URL=your-direct-database-url
     ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Push Prisma schema to the database:
   ```bash
   npx prisma db push
   ```

### Running the Development Server

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

- **app/**: Contains the Next.js application pages and API routes.
- **lib/**: Includes Prisma client setup.
- **modules/**: Modularized code for different features (e.g., auth, messaging, etc.).
- **prisma/**: Contains the Prisma schema.

## Deployment

To deploy the application, follow these steps:

1. Set up environment variables in your hosting platform (e.g., Vercel).
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

## License

This project is licensed under the MIT License.