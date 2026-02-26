import { IFolderRepository, FolderRepository } from '../repositories/folder.repository';
import { IFileRepository, FileRepository } from '../repositories/file.repository';

export interface FolderNode {
    id: number;
    name: string;
    parentId: number | null;
    children: FolderNode[];
}

export class FolderService {
    constructor(
        private folderRepo: IFolderRepository = new FolderRepository(),
        private fileRepo: IFileRepository = new FileRepository()
    ) { }

    /**
     * Fetches all folders and builds a recursive tree structure.
     */
    async getFullTree(): Promise<FolderNode[]> {
        const allFolders = await this.folderRepo.findAll();

        const folderMap = new Map<number, FolderNode>();
        const roots: FolderNode[] = [];

        // Initialize map
        allFolders.forEach((f) => {
            folderMap.set(f.id, { ...f, children: [] });
        });

        // Build tree
        allFolders.forEach((f) => {
            const node = folderMap.get(f.id)!;
            if (f.parentId === null) {
                roots.push(node);
            } else {
                const parent = folderMap.get(f.parentId);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Orphaned folder, treat as root
                    roots.push(node);
                }
            }
        });

        return roots;
    }

    /**
     * Fetches direct subfolders and files for a specific folder with pagination.
     */
    async getDirectChildren(folderId: number, limit = 50, offset = 0) {
        const [subFolders, subFiles] = await Promise.all([
            this.folderRepo.findByParentId(folderId),
            this.fileRepo.findByFolderId(folderId, limit, offset),
        ]);

        return {
            folders: subFolders,
            files: subFiles,
        };
    }

    /**
     * Search for folders and files by name
     */
    async search(query: string) {
        const [matchedFolders, matchedFiles] = await Promise.all([
            this.folderRepo.search(query),
            this.fileRepo.search(query)
        ]);

        return { folders: matchedFolders, files: matchedFiles };
    }
}
