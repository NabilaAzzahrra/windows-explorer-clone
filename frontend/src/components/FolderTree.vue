<script setup lang="ts">
import { ref, computed } from 'vue';
import { Folder, FolderOpen, ChevronRight } from 'lucide-vue-next';

interface FolderNode {
  id: number;
  name: string;
  parentId: number | null;
  children: FolderNode[];
}

const props = defineProps<{
  node: FolderNode;
  selectedId: number | null;
  depth?: number;
}>();

const emit = defineEmits(['select']);

const isOpen = ref(false);
const currentDepth = props.depth || 0;

const isSelected = computed(() => props.selectedId === props.node.id);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const handleSelect = () => {
  emit('select', props.node.id);
  // Auto-expand on click if it has children and is not open
  if (props.node.children.length > 0 && !isOpen.value) {
    isOpen.value = true;
  }
};
</script>

<template>
  <div class="folder-node-wrapper">
    <div 
      class="node-content" 
      :class="{ 'is-selected': isSelected }"
      :style="{ paddingLeft: `${currentDepth * 12 + 12}px` }"
      @click="handleSelect"
    >
      <div 
        class="chevron-wrapper" 
        :class="{ 'is-open': isOpen, 'is-hidden': node.children.length === 0 }"
        @click.stop="toggleOpen"
      >
        <ChevronRight :size="12" />
      </div>
      
      <div class="icon-wrapper">
        <FolderOpen v-if="isOpen" :size="16" class="folder-icon open" />
        <Folder v-else :size="16" class="folder-icon" />
      </div>
      
      <span class="node-name">{{ node.name }}</span>
    </div>

    <transition name="expand">
      <div v-if="isOpen && node.children.length > 0" class="node-children">
        <FolderTree 
          v-for="child in node.children" 
          :key="child.id" 
          :node="child" 
          :selected-id="selectedId"
          :depth="currentDepth + 1"
          @select="id => emit('select', id)"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.folder-node-wrapper {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  height: 32px;
  transition: var(--transition-smooth);
  margin: 1px 0;
  position: relative;
}

.node-content::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: var(--accent-color);
  border-radius: 4px;
  opacity: 0;
  transition: var(--transition-smooth);
}

.node-content:hover {
  background-color: var(--item-hover);
}

.node-content.is-selected {
  background-color: var(--item-selected);
}

.node-content.is-selected::before {
  opacity: 1;
}

.node-content.is-selected .node-name {
  color: var(--accent-color);
  font-weight: 500;
}

.chevron-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-tertiary);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 4px;
}

.chevron-wrapper:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.chevron-wrapper.is-open {
  transform: rotate(90deg);
}

.chevron-wrapper.is-hidden {
  visibility: hidden;
}

.icon-wrapper {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.folder-icon {
  color: #fbbf24; /* Folder Gold */
}

.folder-icon.open {
  color: #f59e0b;
}

.node-name {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: var(--transition-smooth);
}

/* Base style for children container */
.node-children {
  overflow: hidden;
}

/* Expand Transition - Windows 11 Style */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px; /* Large enough to fit children */
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
