CREATE DATABASE IF NOT EXISTS windows_explorer_db;
USE windows_explorer_db;

CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX parent_idx (parent_id),
  CONSTRAINT fk_folder_parent FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folder_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  size INT NOT NULL DEFAULT 0,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX folder_idx (folder_id),
  CONSTRAINT fk_file_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Optional: Initial Seed Data
INSERT INTO folders (name, parent_id) VALUES ('Documents', NULL);
INSERT INTO folders (name, parent_id) VALUES ('Pictures', NULL);
-- Add more as needed or use the seed.ts script

INSERT INTO files (folder_id, name, size, type, created_at, updated_at) VALUES
(1, 'proposal.docx', 245760, 'docx', NOW(), NOW()),
(1, 'laporan.pdf', 512000, 'pdf', NOW(), NOW()),
(1, 'notes.txt', 2048, 'txt', NOW(), NOW()),
(2, 'foto1.jpg', 1048576, 'jpg', NOW(), NOW()),
(2, 'design.png', 2097152, 'png', NOW(), NOW());
