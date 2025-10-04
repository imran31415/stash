# Theme System Usage Guide

The Stash component library now includes a comprehensive theming system that supports both light and dark modes, with the ability to customize colors.

## Quick Start

### 1. Wrap Your App with ThemeProvider

```tsx
import { ThemeProvider } from '@stash/components';

function App() {
  return (
    <ThemeProvider initialTheme="light">
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Using Theme in Components

#### Option 1: Use the useThemeColors hook

```tsx
import { useThemeColors } from '@stash/components';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

#### Option 2: Use the useTheme hook (for full control)

```tsx
import { useTheme } from '@stash/components';

function MyComponent() {
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <View>
      <Text>Current mode: {themeMode}</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
}
```

## Theme Switching

### Toggle Between Light and Dark

```tsx
import { useTheme } from '@stash/components';

function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Button
      title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
      onPress={toggleTheme}
    />
  );
}
```

### Set Specific Theme Mode

```tsx
import { useTheme } from '@stash/components';

function ThemeSelector() {
  const { setThemeMode } = useTheme();

  return (
    <View>
      <Button title="Light Mode" onPress={() => setThemeMode('light')} />
      <Button title="Dark Mode" onPress={() => setThemeMode('dark')} />
    </View>
  );
}
```

## Custom Theme Colors

### Customize Theme at Provider Level

```tsx
import { ThemeProvider } from '@stash/components';

const customColors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#1A1A2E',
  text: '#EAEAEA',
};

function App() {
  return (
    <ThemeProvider initialTheme="dark" customColors={customColors}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Update Theme Colors Dynamically

```tsx
import { useTheme } from '@stash/components';

function ThemeCustomizer() {
  const { updateThemeColors } = useTheme();

  const changePrimaryColor = () => {
    updateThemeColors({ primary: '#FF0000' });
  };

  return <Button title="Change Primary Color" onPress={changePrimaryColor} />;
}
```

### Reset to Default Theme

```tsx
import { useTheme } from '@stash/components';

function ResetTheme() {
  const { resetTheme } = useTheme();

  return <Button title="Reset Theme" onPress={resetTheme} />;
}
```

## Available Color Tokens

The theme system provides the following color tokens:

### Primary Colors
- `primary` - Main brand color
- `primaryLight` - Lighter variant
- `primaryDark` - Darker variant
- `secondary` - Secondary brand color
- `secondaryLight` - Lighter variant
- `secondaryDark` - Darker variant

### Neutral Colors
- `background` - Main background color
- `surface` - Surface/card background
- `border` - Border color
- `divider` - Divider lines

### Text Colors
- `text` - Primary text
- `textSecondary` - Secondary text
- `textTertiary` - Tertiary text (hints, placeholders)
- `textDisabled` - Disabled text
- `textOnPrimary` - Text on primary color backgrounds

### Status Colors
- `success` - Success state
- `warning` - Warning state
- `error` - Error state
- `info` - Info state

### Component-Specific Colors
- `messageBubbleOwn` - Own message background
- `messageBubbleOther` - Other message background
- `messageTextOwn` - Own message text
- `messageTextOther` - Other message text
- `inputBackground` - Input field background
- `buttonBackground` - Button background
- `buttonBackgroundActive` - Active button background
- `avatarBackground` - Avatar background
- `systemMessageBackground` - System message background
- `systemMessageText` - System message text
- `replyBorder` - Reply message border

### Code Block Colors
- `codeBackground`
- `codeLineNumberBackground`
- `codeLineNumberText`
- `codeBorder`
- `codeHeaderBackground`
- `codeHeaderText`
- `codeText`
- `codeHighlightLine`

### Task/Priority Colors
- `priorityCritical`
- `priorityHigh`
- `priorityMedium`
- `priorityLow`
- `statusCompleted`
- `statusInProgress`
- `statusBlocked`
- `statusCancelled`
- `statusPending`

## Advanced: Creating Custom Themes

You can create completely custom themes using the `createTheme` utility:

```tsx
import { createTheme } from '@stash/components';

const myCustomTheme = createTheme('dark', {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  // ... more custom colors
});

// Use it with ThemeProvider
function App() {
  return (
    <ThemeProvider initialTheme="dark" customColors={myCustomTheme.colors}>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Component-Specific Helpers

For interactive components that need status and priority colors:

```tsx
import { useComponentColors } from '@stash/components';

function TaskItem({ task }) {
  const colors = useComponentColors();

  const statusColor = colors.getStatusColor(task.status);
  const priorityColor = colors.getPriorityColor(task.priority);

  return (
    <View style={{ borderLeftColor: statusColor }}>
      <Text style={{ color: colors.text }}>{task.title}</Text>
      <View style={{ backgroundColor: priorityColor }}>
        <Text>{task.priority}</Text>
      </View>
    </View>
  );
}
```

## Migration Guide

If you're migrating from hardcoded colors:

### Before
```tsx
<View style={{ backgroundColor: '#007AFF' }}>
  <Text style={{ color: '#FFFFFF' }}>Hello</Text>
</View>
```

### After
```tsx
import { useThemeColors } from '@stash/components';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={{ color: colors.textOnPrimary }}>Hello</Text>
    </View>
  );
}
```

## Best Practices

1. **Always use theme colors** - Avoid hardcoding colors in your components
2. **Use semantic tokens** - Use `colors.background` instead of specific hex codes
3. **Test both themes** - Ensure your UI looks good in both light and dark modes
4. **Provide defaults** - When using the `theme` prop on components, provide fallbacks to theme colors
5. **Keep customization minimal** - Only customize colors when necessary to maintain consistency

## TypeScript Support

The theme system is fully typed. You can import types as needed:

```tsx
import type { Theme, ThemeMode, ColorScheme } from '@stash/components';

const myTheme: Theme = {
  mode: 'dark',
  colors: {
    // ... your colors (fully typed)
  }
};
```

## Example: Complete App Setup

```tsx
import React from 'react';
import { ThemeProvider, useTheme, Chat, Button } from '@stash/components';

function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();
  return (
    <Button
      title={`${themeMode === 'light' ? '🌙' : '☀️'} Toggle Theme`}
      onPress={toggleTheme}
      variant="outline"
    />
  );
}

function App() {
  return (
    <ThemeProvider initialTheme="light">
      <View style={{ flex: 1 }}>
        <ThemeToggle />
        <Chat {...chatProps} />
      </View>
    </ThemeProvider>
  );
}

export default App;
```
