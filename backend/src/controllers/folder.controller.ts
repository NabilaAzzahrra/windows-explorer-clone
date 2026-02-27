import { Elysia, t } from 'elysia';
import { FolderService } from '../services/folder.service';

const folderService = new FolderService();

export const folderController = new Elysia({ prefix: '/api/v1' })
    .get('/folders', () => folderService.getFullTree())
    .get('/folders/:id/children', ({ params: { id }, query }) => {
        const limit = query.limit ? Number(query.limit) : 50;
        const offset = query.offset ? Number(query.offset) : 0;
        return folderService.getDirectChildren(Number(id), limit, offset);
    }, {
        params: t.Object({
            id: t.String()
        }),
        query: t.Object({
            limit: t.Optional(t.String()),
            offset: t.Optional(t.String())
        })
    })
    .post('/folders', async ({ body }) => {
        return await folderService.createFolder(body.parentId, body.name);
    }, {
        body: t.Object({
            parentId: t.Union([t.Number(), t.Null()]),
            name: t.String()
        })
    })
    .post('/files', async ({ body }) => {
        return await folderService.createFile(body.folderId, body.name, body.size, body.type);
    }, {
        body: t.Object({
            folderId: t.Number(),
            name: t.String(),
            size: t.Number(),
            type: t.String()
        })
    })
    .get('/search', ({ query: { q } }) => folderService.search(q), {
        query: t.Object({
            q: t.String()
        })
    });
