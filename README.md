
# 🚀 Todo Group Management API

A comprehensive RESTful API built on Node.js/Express, utilizing MongoDB (Mongoose ODM) to manage collaborative groups and personal/group to-do lists, with detailed user authorization and granular permissions.

## Manual Installation

If you would still prefer to do the installation manually, follow these steps:

Clone the repo:

```bash
git clone https://github.com/TS0906/Day1.git todo-group-api

cd todo-group-api

npx rimraf ./.git
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env

# open .env and modify the environment variables (if needed)
```

The application uses main.js as the entry point, ensuring the database connects before the Express server starts.
```bash
npm run dev
```
## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=3000
# URL of the Mongo DB
MONGODB_URL=mongodb://127.0.0.1:27017/node-boilerplate
# JWT secret key
JWT_SECRET=thisisasamplesecret
# Number of days after which an access token expires
JWT_EXPIRES_IN=30
# Your Database-name
DATABASE_NAME=abc
```
## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:5000/api-docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.