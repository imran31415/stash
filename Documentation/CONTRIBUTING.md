# Contributing to Stash Library

This guide outlines the standard process for adding new components to the Stash library and integrating them into the example project.

## Table of Contents

1. [Adding a New Component to the Library](#adding-a-new-component-to-the-library)
2. [Integrating Components into Example Project](#integrating-components-into-example-project)
3. [Adding Interactive Chat Components](#adding-interactive-chat-components)
4. [Code Quality Standards](#code-quality-standards)
5. [Testing](#testing)

---

## Adding a New Component to the Library

### Step 1: Create Component Files

Create your component in the appropriate directory under `src/components/`:

```
src/components/
  └── YourComponent/
      ├── YourComponent.tsx       # Main component
      ├── YourComponent.types.ts  # TypeScript interfaces (if needed)
      ├── YourComponent.utils.ts  # Helper functions (if needed)
      ├── index.ts                # Exports
      └── README.md               # Component documentation
```

### Step 2: Define TypeScript Types

Create clear, well-documented TypeScript interfaces:

```typescript
// YourComponent.types.ts
export interface YourComponentProps {
  title?: string;
  data: DataType[];
  onItemPress?: (item: DataType) => void;
  // ... other props
}

export interface DataType {
  id: string;
  name: string;
  // ... other fields
}
```

### Step 3: Implement the Component

Follow these guidelines:

- **Self-contained**: Include all necessary styles and theme colors inline
- **TypeScript**: Use strict typing with proper interfaces
- **Adaptive**: Support iOS, Android, and Web platforms
- **Accessible**: Include accessibility props (accessibilityLabel, accessibilityRole, etc.)
- **Performance**: Use React.memo, useMemo, and useCallback where appropriate

```typescript
// YourComponent.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { YourComponentProps } from './YourComponent.types';

export const YourComponent: React.FC<YourComponentProps> = ({
  title,
  data,
  onItemPress,
}) => {
  // Implementation
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles
  },
});
```

### Step 4: Create Barrel Export

```typescript
// index.ts
export * from './YourComponent.types';
export { YourComponent } from './YourComponent';
```

### Step 5: Update Main Library Exports

Add your component to the main library export:

```typescript
// src/index.ts
export * from './components/YourComponent';
```

### Step 6: Document Your Component

Create a comprehensive README.md:

```markdown
# YourComponent

Brief description of what the component does.

## Features
- Feature 1
- Feature 2

## Usage
\`\`\`tsx
import { YourComponent } from 'stash';

<YourComponent
  title="Example"
  data={sampleData}
  onItemPress={(item) => console.log(item)}
/>
\`\`\`

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | No | Component title |
| data | DataType[] | Yes | Data to display |

## Examples
[Provide code examples]
```

---

## Integrating Components into Example Project

### Step 1: Create Example File

Create a dedicated example file:

```
example/
  └── examples/
      └── YourComponentExample.tsx
```

```typescript
// YourComponentExample.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { YourComponent } from '../../src/components/YourComponent';

export default function YourComponentExample() {
  const sampleData = [
    // Sample data
  ];

  return (
    <ScrollView style={styles.container}>
      <YourComponent
        title="Example Title"
        data={sampleData}
        onItemPress={(item) => console.log('Item pressed:', item)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
```

### Step 2: Add Tab to App.tsx

1. **Update TabType**:
```typescript
type TabType = 'existing' | 'yourComponent';
```

2. **Import Example**:
```typescript
import YourComponentExample from './examples/YourComponentExample';
```

3. **Add to renderContent**:
```typescript
const renderContent = () => {
  switch (activeTab) {
    case 'yourComponent':
      return <YourComponentExample />;
    // ... other cases
  }
};
```

4. **Add Tab Button**:
```tsx
<TouchableOpacity
  style={[styles.tab, activeTab === 'yourComponent' && styles.tabActive]}
  onPress={() => setActiveTab('yourComponent')}
>
  <Text style={[styles.tabText, activeTab === 'yourComponent' && styles.tabTextActive]}>
    🎯 Your Component
  </Text>
</TouchableOpacity>
```

---

## Adding Interactive Chat Components

Interactive components can be embedded directly in chat messages.

### Step 1: Create Interactive Component

Place in `src/components/Chat/InteractiveComponents/`:

```
src/components/Chat/InteractiveComponents/
  ├── YourInteractiveComponent.tsx
  ├── YourInteractiveComponent.types.ts (optional)
  └── index.ts (update exports)
```

### Step 2: Define Component Type

Update `src/components/Chat/types.ts`:

```typescript
export interface InteractiveComponent {
  type: 'task-list' | 'gantt-chart' | 'your-component' | 'custom';
  data: any;
  onAction?: (action: string, data: any) => void;
}
```

### Step 3: Register in ChatMessage.tsx

Update `src/components/Chat/ChatMessage.tsx`:

```typescript
// 1. Import component
import { YourComponent } from './InteractiveComponents';

// 2. Add to renderInteractiveComponent
const renderInteractiveComponent = () => {
  switch (type) {
    case 'your-component':
      return (
        <YourComponent
          {...data}
          onAction={(action, data) => onAction?.(action, data)}
        />
      );
    // ... other cases
  }
};
```

### Step 4: Use in Chat Examples

Add messages with your interactive component:

```typescript
// In AIChatExample.tsx or UserChatExample.tsx
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-x',
    type: 'text',
    content: 'Here is your component:',
    sender: AI_USER,
    timestamp: new Date(),
    isOwn: false,
    interactiveComponent: {
      type: 'your-component',
      data: {
        // Your component props
        title: 'Example',
        items: [...],
      },
      onAction: (action, data) => console.log('Action:', action, data),
    },
  },
];
```

---

## Code Quality Standards

### 1. TypeScript
- Use strict typing
- Define all interfaces/types
- Avoid `any` types
- Export all public types

### 2. Styling
- Use StyleSheet.create
- Include inline theme colors (self-contained)
- Support both light and dark themes
- Use consistent spacing/padding

### 3. Performance
- Memoize expensive computations
- Use React.memo for component optimization
- Avoid unnecessary re-renders
- Lazy load when appropriate

### 4. Accessibility
- Add accessibilityLabel to interactive elements
- Use accessibilityRole appropriately
- Support screen readers
- Ensure proper focus management

### 5. Platform Support
- Test on iOS, Android, and Web
- Use Platform-specific code when needed
- Ensure responsive design
- Handle different screen sizes

### 6. Code Organization
```typescript
// 1. Imports (grouped and sorted)
import React from 'react';
import { View } from 'react-native';

// 2. Type definitions
interface Props {}

// 3. Constants
const CONSTANT = 'value';

// 4. Component
export const Component: React.FC<Props> = () => {
  // Hooks
  // Event handlers
  // Render functions
  // Return JSX
};

// 5. Styles
const styles = StyleSheet.create({});
```

---

## Testing

### Manual Testing Checklist

Before submitting:

- [ ] Component renders correctly on iOS
- [ ] Component renders correctly on Android
- [ ] Component renders correctly on Web
- [ ] All interactive features work
- [ ] Accessibility features work
- [ ] Performance is acceptable
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Code is properly formatted
- [ ] Documentation is complete

### Example App Testing

1. Run the example app: `cd example && yarn start`
2. Test on iOS: `yarn ios`
3. Test on Android: `yarn android`
4. Test on Web: `yarn web`
5. Navigate to your component's tab
6. Verify all functionality

---

## Dependencies

### Adding New Dependencies

1. **Add to root package.json** (library dependencies):
```bash
yarn add package-name
```

2. **Add to example/package.json** (example-only dependencies):
```bash
cd example && yarn add package-name
```

3. **Update README.md** with new dependencies

### Current Dependencies
- `react-native`: ^0.70.0 (peer)
- `react`: ^18.0.0 (peer)
- `date-fns`: ^4.1.0 (for GanttChart)

---

## Common Patterns

### 1. Adaptive Sizing
```typescript
const { width, height } = Dimensions.get('window');
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
```

### 2. Interactive Components
```typescript
const [selected, setSelected] = useState<string | null>(null);
const [modalVisible, setModalVisible] = useState(false);
```

### 3. Theme Colors (Inline)
```typescript
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  // ... inline theme
};
```

---

## Example Workflow

### Complete workflow for adding a new "ChartComponent":

```bash
# 1. Create component files
mkdir -p src/components/ChartComponent
touch src/components/ChartComponent/ChartComponent.tsx
touch src/components/ChartComponent/ChartComponent.types.ts
touch src/components/ChartComponent/index.ts
touch src/components/ChartComponent/README.md

# 2. Implement component (edit files above)

# 3. Update library exports
# Edit src/index.ts

# 4. Create example
touch example/examples/ChartComponentExample.tsx

# 5. Update example app
# Edit example/App.tsx

# 6. Test
cd example
yarn start

# 7. Build library
cd ..
yarn build
```

---

## Questions?

If you have questions or need help, please:
1. Check existing components for reference
2. Review the InteractiveComponents README
3. Open an issue on GitHub

---

## Summary Checklist

**Adding a Component:**
- [ ] Create component files in src/components/
- [ ] Define TypeScript types
- [ ] Implement component with inline styles
- [ ] Create barrel export (index.ts)
- [ ] Update main library export (src/index.ts)
- [ ] Write comprehensive README.md

**Adding to Example:**
- [ ] Create example file in example/examples/
- [ ] Add tab type to App.tsx
- [ ] Import example in App.tsx
- [ ] Add to renderContent switch
- [ ] Add tab button to UI
- [ ] Test all functionality

**For Interactive Chat Components:**
- [ ] Place in InteractiveComponents/
- [ ] Update types.ts with new type
- [ ] Register in ChatMessage.tsx
- [ ] Add to chat examples
- [ ] Test in chat context
