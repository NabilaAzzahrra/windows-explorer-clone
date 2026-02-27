import { db } from '../db';
import { files } from '../db/schema';
import { eq, like } from 'drizzle-orm';

export interface IFileRepository {
    findByFolderId(folderId: number, limit?: number, offset?: number): Promise<any[]>;
    search(query: string): Promise<any[]>;
    create(folderId: number, name: string, size: number, type: string): Promise<any>;
}

export class FileRepository implements IFileRepository {
    async findByFolderId(folderId: number, limit = 50, offset = 0) {
        return await db.select()
            .from(files)
            .where(eq(files.folderId, folderId))
            .limit(limit)
            .offset(offset);
    }

    async search(query: string) {
        return await db.select()
            .from(files)
            .where(like(files.name, `%${query}%`));
    }
    // Create a new file
    async create(folderId: number, name: string, size: number, type: string) {
        const result = await db.insert(files).values({
            folderId,
            name,
            size,
            type,
        });
        return result;
    }
}
