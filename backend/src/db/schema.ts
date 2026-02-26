import { mysqlTable, varchar, int, timestamp, index, AnyMySqlColumn, foreignKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const folders = mysqlTable('folders', {
  id: int('id').primaryKey().autoincrement(),
  parentId: int('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    parentIdx: index('parent_idx').on(table.parentId),
    parentReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'folder_parent_id_fk'
    }).onDelete('cascade'),
  };
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'folder_hierarchy',
  }),
  children: many(folders, {
    relationName: 'folder_hierarchy',
  }),
  files: many(files),
}));

export const files = mysqlTable('files', {
  id: int('id').primaryKey().autoincrement(),
  folderId: int('folder_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  size: int('size').notNull().default(0), // Size in bytes
  type: varchar('type', { length: 50 }).notNull(), // Extension or MIME type
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    folderIdx: index('folder_idx').on(table.folderId),
    folderReference: foreignKey({
      columns: [table.folderId],
      foreignColumns: [folders.id],
      name: 'file_folder_id_fk'
    }).onDelete('cascade'),
  };
});

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));
