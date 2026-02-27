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

    it('should create a new folder correctly', async () => {
        const mockNewFolder = { id: 3, name: 'New Folder', parentId: 1 };
        (mockFolderRepo.create as any).mockResolvedValue(mockNewFolder);

        const result = await service.createFolder(1, 'New Folder');

        expect(mockFolderRepo.create).toHaveBeenCalledWith(1, 'New Folder');
        expect(result).toEqual(mockNewFolder);
    });

    it('should create a new file correctly', async () => {
        const mockNewFile = { id: 2, name: 'New File.txt', folderId: 1, size: 200, type: 'text' };
        (mockFileRepo.create as any).mockResolvedValue(mockNewFile);

        const result = await service.createFile(1, 'New File.txt', 200, 'text');

        expect(mockFileRepo.create).toHaveBeenCalledWith(1, 'New File.txt', 200, 'text');
        expect(result).toEqual(mockNewFile);
    });
});
