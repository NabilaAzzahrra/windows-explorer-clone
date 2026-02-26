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
    .get('/search', ({ query: { q } }) => folderService.search(q), {
        query: t.Object({
            q: t.String()
        })
    });
