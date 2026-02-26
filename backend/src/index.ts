import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { node } from '@elysiajs/node';
import { folderController } from './controllers/folder.controller';

const app = new Elysia({ adapter: node() })
    .use(cors())
    .use(folderController)
    .listen(3001);

console.log(
    `🚀 Server is running at http://localhost:3001`
);
