# Demo Configurations

This folder contains modular demo configurations for the CodeEditorExample component. Each demo is self-contained and can be easily added, removed, or modified.

## Structure

```
demos/
├── types.ts              # TypeScript interfaces for demo configs
├── index.ts              # Central export of all demos
├── ganttDemo.tsx         # Gantt Chart demo
├── timeSeriesDemo.tsx    # Time Series Chart demo
├── heatmapDemo.tsx       # Heatmap demo
├── kanbanDemo.tsx        # Kanban Board demo
├── treeViewDemo.tsx      # TreeView demo
└── README.md            # This file
```

## Adding a New Demo

To add a new demo, follow these steps:

### 1. Create a new demo file

Create a new file in this directory, e.g., `myComponentDemo.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MyComponent, type MyComponentData } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const myComponentDemo: DemoConfig<MyComponentData> = {
  id: 'mycomponent',
  title: 'My Component',
  description: 'Brief description of what this component does',

  // Initial JSON code shown in the editor
  initialCode: `{
  "example": "data",
  "that": "matches",
  "the": "library spec"
}`,

  // Implementation code example for users
  implementationCode: `import { MyComponent, type MyComponentData } from 'stash';

const data: MyComponentData = {
  example: 'data',
  that: 'matches',
  the: 'library spec'
};

<MyComponent
  data={data}
  mode="full"
  height={400}
/>`,

  // Parse function: Convert JSON string to typed data
  parseData: (code: string): MyComponentData | null => {
    try {
      const parsed = JSON.parse(code);

      // Validate and transform the data to match library types
      // IMPORTANT: Always convert Date strings to Date objects
      // IMPORTANT: Ensure all required fields are present

      return {
        // Transform parsed JSON to match exact library spec
        ...parsed,
      };
    } catch (e) {
      console.error('MyComponentDemo parse error:', e);
      return null;
    }
  },

  // Render function: Display the component with parsed data
  renderPreview: (data: MyComponentData) => {
    if (!data) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Invalid data</Text>
        </View>
      );
    }

    return (
      <MyComponent
        data={data}
        mode="full"
        height={400}
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

export default myComponentDemo;
```

### 2. Update index.ts

Add your demo to the demos object in `index.ts`:

```typescript
import myComponentDemo from './myComponentDemo';

export const demos: Record<string, DemoConfig> = {
  // ... existing demos
  mycomponent: myComponentDemo,
};
```

### 3. That's it!

Your new demo will automatically appear in the sidebar menu of the CodeEditorExample.

## Important Guidelines

### Date Handling

Always use ISO 8601 format for dates in JSON:

```json
{
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-15T00:00:00.000Z"
}
```

And parse them in the `parseData` function:

```typescript
startDate: new Date(task.startDate),
endDate: new Date(task.endDate),
```

### Type Safety

Always verify the parsed data matches the library's type requirements:

1. Check the component's `.types.ts` file in `src/components/Chat/InteractiveComponents/`
2. Ensure all required fields are present
3. Convert types appropriately (strings to numbers, string dates to Date objects, etc.)

### Error Handling

Always wrap parsing in try-catch and return null on error:

```typescript
parseData: (code: string): MyType | null => {
  try {
    const parsed = JSON.parse(code);
    // validation and transformation
    return transformedData;
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
},
```

### Validation

Validate data before rendering:

```typescript
renderPreview: (data: MyType) => {
  if (!data || !data.requiredField) {
    return <ErrorView message="Missing required field" />;
  }
  return <MyComponent data={data} />;
},
```

## Demo Data Best Practices

1. **Keep JSON simple**: Use clear, representative data
2. **Match library specs exactly**: Check type definitions before creating JSON
3. **Use meaningful examples**: Data should demonstrate the component's capabilities
4. **Include variety**: Show different states, priorities, statuses, etc.
5. **Keep it small**: Don't overwhelm with too much data
6. **Document with comments**: Add descriptions in implementation code

## Troubleshooting

### "Invalid value for time data" Error

This usually means dates aren't being parsed correctly:
- Ensure dates in JSON use ISO 8601 format
- Verify `new Date()` conversion in `parseData`
- Check that the Date object is valid (not NaN)

### Component doesn't update when switching demos

- Ensure the demo is exported in `index.ts`
- Verify the `key` prop in CodeEditorExample includes `selectedDemo`
- Check that `useMemo` dependencies are correct

### Type errors

- Check the component's type definition file
- Ensure all required fields are present
- Verify optional fields use `?:` or `| undefined`
