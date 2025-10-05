import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TreeView, type TreeViewData } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const treeViewDemo: DemoConfig<TreeViewData> = {
  id: 'treeview',
  title: 'TreeView',
  description: 'Hierarchical data visualization with expandable nodes',

  initialCode: `{
  "id": "project-tree",
  "title": "Project Structure",
  "description": "File system hierarchy",
  "roots": [
    {
      "id": "src",
      "label": "src",
      "type": "folder",
      "children": [
        {
          "id": "components",
          "label": "components",
          "type": "folder",
          "children": [
            {
              "id": "Button.tsx",
              "label": "Button.tsx",
              "type": "file",
              "metadata": {
                "size": 2048,
                "description": "Reusable button component"
              }
            },
            {
              "id": "Input.tsx",
              "label": "Input.tsx",
              "type": "file",
              "metadata": {
                "size": 1536,
                "description": "Form input component"
              }
            },
            {
              "id": "Modal.tsx",
              "label": "Modal.tsx",
              "type": "file",
              "metadata": {
                "size": 3072,
                "description": "Modal dialog component"
              }
            }
          ]
        },
        {
          "id": "utils",
          "label": "utils",
          "type": "folder",
          "children": [
            {
              "id": "helpers.ts",
              "label": "helpers.ts",
              "type": "file",
              "metadata": {
                "size": 1024,
                "description": "Helper functions"
              }
            },
            {
              "id": "constants.ts",
              "label": "constants.ts",
              "type": "file",
              "metadata": {
                "size": 512,
                "description": "App constants"
              }
            }
          ]
        },
        {
          "id": "App.tsx",
          "label": "App.tsx",
          "type": "file",
          "metadata": {
            "size": 4096,
            "description": "Main application file"
          }
        }
      ]
    },
    {
      "id": "tests",
      "label": "tests",
      "type": "folder",
      "children": [
        {
          "id": "unit",
          "label": "unit",
          "type": "folder",
          "children": [
            {
              "id": "Button.test.tsx",
              "label": "Button.test.tsx",
              "type": "file"
            }
          ]
        }
      ]
    }
  ]
}`,

  implementationCode: `import { TreeView, type TreeViewData } from 'stash';

// Define your tree structure
const data: TreeViewData = {
  id: 'project-tree',
  title: 'Project Structure',
  description: 'File system hierarchy',
  roots: [
    {
      id: 'src',
      label: 'src',
      type: 'folder',
      children: [
        {
          id: 'components',
          label: 'components',
          type: 'folder',
          children: [
            {
              id: 'Button.tsx',
              label: 'Button.tsx',
              type: 'file',
              metadata: {
                size: 2048,
                description: 'Reusable button component'
              }
            },
            {
              id: 'Input.tsx',
              label: 'Input.tsx',
              type: 'file',
              metadata: {
                size: 1536,
                description: 'Form input component'
              }
            }
          ]
        },
        {
          id: 'utils',
          label: 'utils',
          type: 'folder',
          children: [
            {
              id: 'helpers.ts',
              label: 'helpers.ts',
              type: 'file',
              metadata: {
                size: 1024,
                description: 'Helper functions'
              }
            }
          ]
        }
      ]
    }
  ]
};

// Render the TreeView component
<TreeView
  data={data}
  mode="full"
  showIcons={true}
  showLines={true}
  height={400}
  initialExpandedDepth={2}
/>`,

  parseData: (code: string): TreeViewData | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('TreeViewDemo: Data must be an object');
        return null;
      }

      if (!Array.isArray(parsed.roots)) {
        console.error('TreeViewDemo: Data must have roots array');
        return null;
      }

      const parseNode = (node: any): any => {
        if (!node || typeof node !== 'object') return null;

        return {
          id: String(node.id),
          label: String(node.label || node.id),
          type: node.type || 'item',
          icon: node.icon ? String(node.icon) : undefined,
          children: Array.isArray(node.children)
            ? node.children.map(parseNode).filter(Boolean)
            : undefined,
          metadata: node.metadata || undefined,
          status: node.status || 'normal',
          color: node.color ? String(node.color) : undefined,
          expanded: node.expanded !== undefined ? Boolean(node.expanded) : undefined,
          selectable: node.selectable !== undefined ? Boolean(node.selectable) : undefined,
          badge: node.badge !== undefined ? node.badge : undefined,
        };
      };

      return {
        id: String(parsed.id || 'tree-view'),
        title: String(parsed.title || 'Tree View'),
        description: parsed.description ? String(parsed.description) : undefined,
        roots: parsed.roots.map(parseNode).filter(Boolean),
        metadata: parsed.metadata || undefined,
      };
    } catch (e) {
      console.error('TreeViewDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: TreeViewData) => {
    if (!data || !data.roots || data.roots.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide roots in the tree data</Text>
        </View>
      );
    }

    return (
      <TreeView
        data={data}
        mode="full"
        showIcons={true}
        showLines={true}
        height={400}
        initialExpandedDepth={2}
      />
    );
  },
};

const styles = StyleSheet.create({
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default treeViewDemo;
