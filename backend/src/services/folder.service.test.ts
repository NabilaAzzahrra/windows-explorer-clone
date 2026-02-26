import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FolderService } from './folder.service';
import { IFolderRepository } from '../repositories/folder.repository';
import { IFileRepository } from '../repositories/file.repository';

describe('FolderService', () => {
    let service: FolderService;
    let mockFolderRepo: IFolderRepository;
    let mockFileRepo: IFileRepository;

    beforeEach(() => {
        mockFolderRepo = {
            findAll: vi.fn(),
            findById: vi.fn(),
            findByParentId: vi.fn(),
            search: vi.fn()
        } as any;

        mockFileRepo = {
            findByFolderId: vi.fn(),
            search: vi.fn()
        } as any;

        service = new FolderService(mockFolderRepo, mockFileRepo);
    });

    it('should build a recursive tree correctly', async () => {
        const mockFolders = [
            { id: 1, name: 'Root', parentId: null },
            { id: 2, name: 'Child', parentId: 1 }
        ];

        (mockFolderRepo.findAll as any).mockResolvedValue(mockFolders);

        const tree = await service.getFullTree();

        expect(tree).toHaveLength(1);
        expect(tree[0].name).toBe('Root');
        expect(tree[0].children).toHaveLength(1);
        expect(tree[0].children[0].name).toBe('Child');
    });

    it('should fetch direct children correctly', async () => {
        const mockSubFolders = [{ id: 2, name: 'Sub', parentId: 1 }];
        const mockFiles = [{ id: 1, name: 'File.txt', folderId: 1, size: 100, type: 'text' }];

        (mockFolderRepo.findByParentId as any).mockResolvedValue(mockSubFolders);
        (mockFileRepo.findByFolderId as any).mockResolvedValue(mockFiles);

        const result = await service.getDirectChildren(1);

        expect(result.folders).toEqual(mockSubFolders);
        expect(result.files).toEqual(mockFiles);
    });
});
