<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FolderTree from './components/FolderTree.vue';
import FolderContent from './components/FolderContent.vue';
import { Search, FolderTree as FolderTreeIcon } from 'lucide-vue-next';

interface FolderNode {
  id: number;
  name: string;
  parentId: number | null;
  children: FolderNode[];
}

const folders = ref<FolderNode[]>([]);
const selectedFolderId = ref<number | null>(null);
const searchQuery = ref('');
const searchResults = ref<{ folders: any[], files: any[] } | null>(null);

const API_BASE = 'http://localhost:3001/api/v1';

const fetchFolders = async () => {
  try {
    const response = await axios.get(`${API_BASE}/folders`);
    folders.value = response.data;
  } catch (error) {
    console.error('Failed to fetch folders:', error);
  }
};

const handleFolderSelect = (id: number) => {
  selectedFolderId.value = id;
  searchResults.value = null;
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = null;
    return;
  }
  
  try {
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: searchQuery.value }
    });
    searchResults.value = response.data;
    selectedFolderId.value = null;
  } catch (error) {
    console.error('Search failed:', error);
  }
};

onMounted(fetchFolders);
</script>

<template>
  <div class="explorer-container animate-fade-in">
    <!-- Sidebar / Left Panel -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="app-brand">
          <FolderTreeIcon :size="20" class="brand-icon" />
          <span class="brand-name">File Explorer</span>
        </div>
        
        <div class="search-box">
          <Search :size="14" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search files and folders" 
            @input="handleSearch"
          />
        </div>
      </div>
      
      <div class="tree-container">
        <div class="tree-label">Folders</div>
        <FolderTree 
          v-for="folder in folders" 
          :key="folder.id" 
          :node="folder" 
          :selected-id="selectedFolderId"
          @select="handleFolderSelect"
        />
      </div>
    </aside>

    <!-- Main Content / Right Panel -->
    <main class="main-content">
      <FolderContent 
        :folder-id="selectedFolderId" 
        :search-results="searchResults"
      />
    </main>
  </div>
</template>

<style scoped>
.sidebar-header {
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
}

.brand-icon {
  color: var(--accent-color);
}

.brand-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-tertiary);
  pointer-events: none;
}

input {
  width: 100%;
  padding: 7px 10px 7px 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  outline: none;
  transition: var(--transition-smooth);
}

input:focus {
  background: white;
  border-color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--accent-color);
}

.tree-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 8px 16px;
}

.tree-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 12px 8px;
}
</style>
