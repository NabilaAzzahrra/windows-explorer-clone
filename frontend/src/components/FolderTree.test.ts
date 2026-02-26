import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FolderTree from './FolderTree.vue';

describe('FolderTree.vue', () => {
    const mockNode = {
        id: 1,
        name: 'Documents',
        parentId: null,
        children: [
            { id: 2, name: 'Work', parentId: 1, children: [] }
        ]
    };

    it('renders folder name correctly', () => {
        const wrapper = mount(FolderTree, {
            props: {
                node: mockNode,
                selectedId: null
            }
        });
        expect(wrapper.text()).toContain('Documents');
    });

    it('toggles open state when clicking chevron', async () => {
        const wrapper = mount(FolderTree, {
            props: {
                node: mockNode,
                selectedId: null
            }
        });

        const chevron = wrapper.find('.chevron-wrapper');
        expect(wrapper.find('.node-children').exists()).toBe(false);

        await chevron.trigger('click');
        expect(wrapper.find('.node-children').exists()).toBe(true);
        expect(wrapper.text()).toContain('Work');
    });

    it('emits select event when clicking node', async () => {
        const wrapper = mount(FolderTree, {
            props: {
                node: mockNode,
                selectedId: null
            }
        });

        await wrapper.find('.node-content').trigger('click');
        expect(wrapper.emitted().select[0]).toEqual([1]);
    });
});
