import { db } from '../db';
import { folders, files } from '../db/schema';
import { eq, like, or, and, isNull } from 'drizzle-orm';

export interface IFolderRepository {
    findAll(): Promise<any[]>;
    findById(id: number): Promise<any | undefined>;
    findByParentId(parentId: number | null): Promise<any[]>;
    search(query: string): Promise<any[]>;
}

export class FolderRepository implements IFolderRepository {
    async findAll() {
        return await db.select().from(folders);
    }

    async findById(id: number) {
        const result = await db.select().from(folders).where(eq(folders.id, id));
        return result[0];
    }

    async findByParentId(parentId: number | null) {
        if (parentId === null) {
            return await db.select().from(folders).where(isNull(folders.parentId));
        }
        return await db.select().from(folders).where(eq(folders.parentId, parentId));
    }

    async search(query: string) {
        return await db.select()
            .from(folders)
            .where(like(folders.name, `%${query}%`));
    }
}
