import { db } from './src/db';
import { folders, files } from './src/db/schema';

async function seed() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    // await db.delete(files);
    // await db.delete(folders);

    // Create root folders
    const [root1, root2] = await Promise.all([
        db.insert(folders).values({ name: 'Documents' }).$returningId(),
        db.insert(folders).values({ name: 'Pictures' }).$returningId(),
    ]);

    // Create subfolders
    const [work, personal] = await Promise.all([
        db.insert(folders).values({ name: 'Work', parentId: root1[0].id }).$returningId(),
        db.insert(folders).values({ name: 'Personal', parentId: root1[0].id }).$returningId(),
    ]);

    const [vacation] = await Promise.all([
        db.insert(folders).values({ name: 'Vacation 2024', parentId: root2[0].id }).$returningId(),
    ]);

    // Create nested subfolders
    const [projects] = await Promise.all([
        db.insert(folders).values({ name: 'Projects', parentId: work[0].id }).$returningId(),
    ]);

    // Create files
    await db.insert(files).values([
        { folderId: work[0].id, name: 'resume.pdf', size: 1024 * 500, type: 'application/pdf' },
        { folderId: projects[0].id, name: 'app_design.fig', size: 1024 * 1024 * 5, type: 'image/figma' },
        { folderId: projects[0].id, name: 'readme.txt', size: 1024 * 2, type: 'text/plain' },
        { folderId: vacation[0].id, name: 'beach.jpg', size: 1024 * 1024 * 2, type: 'image/jpeg' },
        { folderId: vacation[0].id, name: 'video.mp4', size: 1024 * 1024 * 50, type: 'video/mp4' },
    ]);

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch(console.error);
