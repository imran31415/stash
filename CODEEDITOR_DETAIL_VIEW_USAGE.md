# Code Editor - View Detail for Previewed Components

## Overview

The Code Editor now supports opening previewed components in their full detail view. This allows users to:
1. See the live preview of their code in the preview pane
2. Click "View Detail" to open the component in its native detail view (e.g., DashboardDetailView, WorkflowDetailView, etc.)

## Implementation

### 1. Updated Types

**CodeEditor.types.ts:**
- `renderPreview` now accepts an optional third parameter: `onExpandPress?: () => void`
- Added new prop: `onPreviewExpandPress?: () => void`

```typescript
renderPreview?: (code: string, language?: SupportedLanguage, onExpandPress?: () => void) => React.ReactNode;
onPreviewExpandPress?: () => void;
```

### 2. Visual Changes

**Preview Header:**
- Added "👁️ View Detail" button next to the expand/collapse button
- Button only appears when `onPreviewExpandPress` callback is provided
- Button uses primary color for consistency

### 3. How to Use

#### Example: Dashboard in Code Editor

```tsx
import React, { useState } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { Dashboard } from './components/Dashboard';
import { DashboardDetailView } from './components/DashboardDetailView';

const MyCodeEditor = () => {
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState(null);

  const handlePreviewExpand = () => {
    setShowDashboardDetail(true);
  };

  const renderPreview = (code, language, onExpandPress) => {
    try {
      const config = JSON.parse(code);
      setDashboardConfig(config);

      return (
        <Dashboard
          config={config}
          mode="mini"
          onExpandPress={onExpandPress} // Pass through the expand callback
          height={400}
        />
      );
    } catch (e) {
      return <Text>Invalid JSON</Text>;
    }
  };

  return (
    <>
      <CodeEditor
        code={defaultDashboardCode}
        language="json"
        renderPreview={renderPreview}
        onPreviewExpandPress={handlePreviewExpand} // Enable "View Detail" button
        showPreview={true}
        mode="full"
        height={600}
      />

      {dashboardConfig && (
        <DashboardDetailView
          visible={showDashboardDetail}
          config={dashboardConfig}
          onClose={() => setShowDashboardDetail(false)}
        />
      )}
    </>
  );
};
```

#### Example: Workflow in Code Editor

```tsx
const renderWorkflowPreview = (code, language, onExpandPress) => {
  try {
    const workflowData = JSON.parse(code);

    return (
      <Workflow
        data={workflowData}
        mode="mini"
        onExpandPress={onExpandPress} // Pass through
        height={400}
      />
    );
  } catch (e) {
    return <Text>Invalid workflow data</Text>;
  }
};

<CodeEditor
  code={workflowCode}
  language="json"
  renderPreview={renderWorkflowPreview}
  onPreviewExpandPress={() => setShowWorkflowDetail(true)}
  showPreview={true}
/>
```

### 4. User Flow

1. **User edits code** in the left pane
2. **Live preview** renders in the right pane (in mini mode)
3. **User clicks "👁️ View Detail"** button in preview header
4. **Component opens** in its native detail view (full screen modal)
5. **User can interact** with the component in full detail mode
6. **User closes** detail view and returns to code editor

### 5. When to Use

Use `onPreviewExpandPress` when:
- You want users to see a small preview but also access full functionality
- The component has a dedicated DetailView (Dashboard, Workflow, Gantt, etc.)
- Users need to interact with the component in more depth
- The preview pane is too small for full functionality

### 6. Components with Detail Views

These components have DetailView implementations and can benefit:
- `Dashboard` → `DashboardDetailView`
- `Workflow` → `WorkflowDetailView`
- `GanttChart` → Has expand functionality
- `GraphVisualization` → Has expand functionality
- `TimeSeriesChart` → Has expand functionality
- `KanbanBoard` → Has expand functionality

### 7. Technical Details

**Preview Pane Rendering Flow:**
```
CodeEditor
  └─ renderPreviewPane()
      └─ renderPreview(code, language, onPreviewExpandPress)
          └─ <YourComponent onExpandPress={onPreviewExpandPress} />
```

**When "View Detail" is clicked:**
```
User clicks button
  → onPreviewExpandPress() called
    → Parent component opens DetailView
      → Component renders in full detail mode
```

## Benefits

1. **Better UX**: Users can preview code changes quickly and dive deeper when needed
2. **Space Efficient**: Preview pane stays compact while full detail is accessible
3. **Flexible**: Works with any component that has detail view capability
4. **Consistent**: Uses standard expand pattern across all components
5. **Optional**: Feature is opt-in via the callback prop

## Migration Guide

If you have existing CodeEditor usage with `renderPreview`:

**Before:**
```tsx
renderPreview={(code, language) => <MyComponent data={parseCode(code)} />}
```

**After (with detail view support):**
```tsx
renderPreview={(code, language, onExpandPress) => (
  <MyComponent
    data={parseCode(code)}
    onExpandPress={onExpandPress}  // Add this line
  />
)}
onPreviewExpandPress={() => setShowDetail(true)}  // Add this prop
```

No breaking changes - the third parameter is optional and backward compatible.
