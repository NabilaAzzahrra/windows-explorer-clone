<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import { Folder, File, FileText, ImageIcon, Music, Video, MoreVertical, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  folderId: number | null;
  searchResults?: { folders: any[], files: any[] } | null;
}>();

const children = ref<{ folders: any[], files: any[] }>({ folders: [], files: [] });
const loading = ref(false);
const offset = ref(0);
const limit = 50;
const hasMore = ref(false);
const API_BASE = 'http://localhost:3001/api/v1';

const fetchChildren = async (id: number, append = false) => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/folders/${id}/children`, {
      params: { limit, offset: offset.value }
    });
    
    if (append) {
      children.value.files = [...children.value.files, ...response.data.files];
    } else {
      children.value = response.data;
    }
    
    hasMore.value = response.data.files.length === limit;
  } catch (error) {
    console.error('Failed to fetch children:', error);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  offset.value += limit;
  if (props.folderId) {
    fetchChildren(props.folderId, true);
  }
};

watch(() => props.folderId, (newId) => {
  offset.value = 0;
  hasMore.value = false;
  if (newId !== null) {
    fetchChildren(newId);
  }
});

watch(() => props.searchResults, (newResults) => {
  hasMore.value = false;
  if (newResults) {
    children.value = newResults;
  } else if (props.folderId) {
    offset.value = 0;
    fetchChildren(props.folderId);
  } else {
    children.value = { folders: [], files: [] };
  }
});

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type === 'text/plain') return FileText;
  return File;
};

const emit = defineEmits(['folder-created']);

const handleCreateFolder = async () => {
  if (!props.folderId) return;
  const name = prompt('Enter new folder name:');
  if (!name || !name.trim()) return;

  try {
    await axios.post(`${API_BASE}/folders`, {
      parentId: props.folderId,
      name: name.trim()
    });
    // Refresh content
    offset.value = 0;
    fetchChildren(props.folderId);
    emit('folder-created');
  } catch (error) {
    console.error('Failed to create folder:', error);
    alert('Failed to create folder');
  }
};

const handleCreateFile = async () => {
  if (!props.folderId) return;
  const name = prompt('Enter new file name (e.g., document.txt):');
  if (!name || !name.trim()) return;

  // Simple type inference based on extension
  let type = 'application/octet-stream';
  if (name.endsWith('.txt')) type = 'text/plain';
  else if (name.match(/\.(jpg|jpeg|png|gif)$/i)) type = 'image/jpeg';
  else if (name.endsWith('.mp3')) type = 'audio/mpeg';
  else if (name.endsWith('.mp4')) type = 'video/mp4';

  try {
    await axios.post(`${API_BASE}/files`, {
      folderId: props.folderId,
      name: name.trim(),
      size: Math.floor(Math.random() * 1000000), // Mock size
      type
    });
    // Refresh content
    offset.value = 0;
    fetchChildren(props.folderId);
  } catch (error) {
    console.error('Failed to create file:', error);
    alert('Failed to create file');
  }
};
</script>

<template>
  <div class="content-wrapper">
    <!-- Top Toolbar / Breadcrumbs -->
    <header class="content-header">
      <div class="breadcrumbs">
        <Folder :size="16" class="root-icon" />
        <ChevronRight :size="14" class="separator" />
        <span class="current-path">{{ folderId ? 'Selected Folder' : 'Root' }}</span>
      </div>
      <div class="actions">
        <button v-if="folderId" @click="handleCreateFolder" class="action-btn">
          <Folder :size="14" /> New Folder
        </button>
        <button v-if="folderId" @click="handleCreateFile" class="action-btn">
          <FileText :size="14" /> New File
        </button>
      </div>
    </header>

    <div v-if="!folderId && !searchResults" class="empty-state animate-fade-in">
      <div class="empty-illustration">📂</div>
      <h3>Welcome to File Explorer</h3>
      <p>Select a folder from the sidebar to browse your files.</p>
    </div>

    <div v-else-if="loading && children.files.length === 0" class="loading-state">
      <div class="win11-spinner"></div>
      <p>Loading contents...</p>
    </div>

    <div v-else class="explorer-view animate-fade-in">
      <div class="grid-header">
        <div class="col-name">Name</div>
        <div class="col-size">Size</div>
        <div class="col-type">Type</div>
        <div class="col-actions"></div>
      </div>

      <div class="grid-body">
        <!-- Folders -->
        <div 
          v-for="folder in children.folders" 
          :key="'f-'+folder.id" 
          class="grid-row folder-row"
        >
          <div class="col-name">
            <div class="icon-wrapper folder">
              <Folder :size="20" fill="currentColor" />
            </div>
            <span class="item-name">{{ folder.name }}</span>
          </div>
          <div class="col-size">--</div>
          <div class="col-type">File folder</div>
          <div class="col-actions"><MoreVertical :size="14" /></div>
        </div>

        <!-- Files -->
        <div 
          v-for="file in children.files" 
          :key="'i-'+file.id" 
          class="grid-row file-row"
        >
          <div class="col-name">
            <div class="icon-wrapper file">
              <component :is="getFileIcon(file.type)" :size="20" />
            </div>
            <span class="item-name">{{ file.name }}</span>
          </div>
          <div class="col-size">{{ formatSize(file.size) }}</div>
          <div class="col-type">{{ file.type.split('/')[1]?.toUpperCase() || 'FILE' }}</div>
          <div class="col-actions"><MoreVertical :size="14" /></div>
        </div>

        <!-- Load More -->
        <div v-if="hasMore" class="load-more-section">
          <button @click="loadMore" :disabled="loading" class="btn-load-more">
            <span v-if="loading" class="mini-spinner"></span>
            {{ loading ? 'Loading...' : 'Show more' }}
          </button>
        </div>

        <div v-if="children.folders.length === 0 && children.files.length === 0 && !loading" class="no-items">
          <p>This folder is empty.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content-header {
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.root-icon {
  color: var(--accent-color);
}

.separator {
  color: var(--text-tertiary);
}

.current-path {
  font-weight: 500;
  color: var(--text-primary);
}

.empty-state, .loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-illustration {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.explorer-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid-header {
  display: flex;
  padding: 8px 24px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.grid-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.grid-row {
  display: flex;
  padding: 8px 24px;
  align-items: center;
  transition: var(--transition-smooth);
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin: 0 8px;
}

.grid-row:hover {
  background-color: var(--item-hover);
}

.col-name { flex: 5; display: flex; align-items: center; min-width: 200px; }
.col-size { flex: 1.5; font-size: 12px; color: var(--text-secondary); }
.col-type { flex: 2; font-size: 12px; color: var(--text-secondary); }
.col-actions { width: 40px; display: flex; justify-content: flex-end; color: var(--text-tertiary); }

.icon-wrapper {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.folder { color: #fbbf24; }
.icon-wrapper.file { color: var(--accent-color); }

.item-name {
  font-size: 13px;
  color: var(--text-primary);
}

.load-more-section {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.btn-load-more {
  padding: 8px 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-load-more:hover {
  background: var(--item-hover);
  border-color: var(--text-tertiary);
}

.win11-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--item-hover);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-items {
  padding: 40px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
