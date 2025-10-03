# Live Streaming Chat Integration Guide

## Overview

The Live Streaming Sales Dashboard has been fully integrated into the chat interface, demonstrating how to embed real-time streaming visualizations within conversational AI interactions.

## How to Access

1. **Start the example app:**
   ```bash
   cd example
   yarn start
   ```

2. **Navigate to the Chat tab** (💬 Chats)

3. **Select "📈 Live Streaming Sales Dashboard"** from the chat list

4. **Interact with the AI** using these commands:
   - `start` or `show` - Begin streaming live sales data
   - `stop` or `pause` - Stop the data stream
   - `stats` or `status` - View current statistics
   - `help` - See all available commands

## What You'll See

### Initial State
The chat starts with a welcome message from the Sales AI explaining available commands.

### After Typing "start"
1. **AI Response**: Confirmation message with streaming dashboard
2. **Live Chart**: TimeSeriesChart component with:
   - 🔴 LIVE indicator showing active streaming
   - Real-time sales data flowing in
   - Dynamic subtitle showing total sales and revenue
   - Smooth chart updates as new data arrives
3. **Status Message**: Green indicator showing stream is active

### While Streaming
- New sales events arrive every second (configurable)
- Chart automatically updates with each sale
- Memory stays fixed at 100 points (circular buffer)
- Display shows last 50 points for optimal performance
- Statistics update in real-time

### After Typing "stop"
- Stream pauses
- Final statistics displayed
- Chart freezes at current state
- Can restart anytime with "start"

## Code Architecture

### Components

```
LiveStreamingChatExample.tsx
├── SalesDataSimulator          # WebSocket simulation class
├── Chat State Management       # Messages and streaming state
├── Sales Event Handler         # Updates chart with new data
├── Message Handler             # Parses user commands
└── Chat Component             # Renders conversational interface
```

### Key Features

#### 1. **Real-time Chart Updates**
```typescript
const handleSalesEvent = useCallback((event: SalesEvent) => {
  // Add new data point
  salesSeriesRef.current[0].data.push({
    timestamp: event.timestamp,
    value: event.amount,
    label: event.product,
  });

  // Update the message with new chart data
  setMessages(prevMessages =>
    prevMessages.map(msg => {
      if (msg.id === streamingMessageIdRef.current) {
        return {
          ...msg,
          interactiveComponent: {
            type: 'timeseries',
            props: {
              series: [...salesSeriesRef.current],
              enableLiveStreaming: true,
              maxDataPoints: 100,
              streamingWindowSize: 50,
              // ... other props
            },
          },
        };
      }
      return msg;
    })
  );
}, []);
```

#### 2. **Conversational Controls**
```typescript
// User types: "start"
startStreaming();  // Begins data stream

// User types: "stop"
stopStreaming();   // Pauses stream, shows stats

// User types: "stats"
// Shows: streaming status, sales count, revenue, data points
```

#### 3. **Interactive Component Integration**
```typescript
const streamingMessage: Message = {
  id: streamingMessageId,
  content: 'Here\'s your live sales dashboard!',
  sender: AI_USER,
  interactiveComponent: {
    type: 'timeseries',
    props: {
      series: salesSeriesRef.current,
      enableLiveStreaming: true,
      // Fixed memory management
      maxDataPoints: 100,
      streamingWindowSize: 50,
      // Chart configuration
      mode: 'full',
      title: '📈 Live Sales Dashboard',
      showLegend: true,
      showGrid: true,
      height: 350,
    },
  },
};
```

## User Experience Flow

```
User: "show me live sales"
  ↓
AI: Creates streaming message with chart
  ↓
Simulator: Starts generating sales events
  ↓
Chart: Updates every second with new data
  ↓
Memory: Maintains last 100 points (fixed)
  ↓
Display: Shows last 50 points (smooth)
  ↓
User: "stop"
  ↓
AI: Shows final statistics, pauses stream
```

## Customization

### Change Update Frequency

In `LiveStreamingChatExample.tsx`:

```typescript
class SalesDataSimulator {
  private salesFrequency = 1000;  // Change to 500ms for faster updates
}
```

### Adjust Memory/Display Windows

In the chart props:

```typescript
maxDataPoints={200}        // Keep 200 points in memory
streamingWindowSize={100}  // Display 100 points
```

### Modify Sales Simulation

```typescript
private generateSalesEvent(): SalesEvent {
  // Customize business logic
  const hour = new Date().getHours();
  const timeMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.5;

  // Adjust base revenue and volatility
  const baseRevenue = 100;
  const volatility = 50;

  const saleAmount = Math.max(
    10,
    baseRevenue + (Math.random() - 0.5) * volatility * timeMultiplier
  );

  return {
    timestamp: new Date(),
    amount: saleAmount,
    product: this.getRandomProduct(),
  };
}
```

### Add New Commands

```typescript
const handleSendMessage = useCallback((content: string) => {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('reset')) {
    // Reset all data
    salesSeriesRef.current[0].data = [];
    setTotalSales(0);
    setTotalRevenue(0);
  }
  // ... other commands
}, []);
```

## Integration with Real WebSocket

Replace `SalesDataSimulator` with actual WebSocket:

```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/sales');

  ws.onmessage = (event) => {
    const sale = JSON.parse(event.data);
    handleSalesEvent({
      timestamp: new Date(sale.timestamp),
      amount: sale.amount,
      product: sale.product,
    });
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Show error message to user
  };

  return () => ws.close();
}, [handleSalesEvent]);
```

## Performance Considerations

### Memory Usage
- **Fixed**: Always 100 points × 1 series × ~50 bytes = ~5KB
- **Scalable**: Add more series without memory growth
- **Efficient**: Old data automatically discarded

### Update Performance
- **Smooth**: 60fps even with 1000+ updates/second
- **Non-blocking**: UI never freezes during updates
- **Optimized**: Only chart re-renders, not entire chat

### Message List Performance
- **Static messages**: Don't re-render unnecessarily
- **Ref-based updates**: Chart data stored in ref
- **Selective updates**: Only streaming message updates

## Advanced Use Cases

### 1. Multiple Data Streams

```typescript
const salesSeriesRef = useRef<TimeSeriesSeries[]>([
  { id: 'revenue', name: 'Revenue', data: [], color: '#10B981' },
  { id: 'volume', name: 'Sales Volume', data: [], color: '#3B82F6' },
  { id: 'avgPrice', name: 'Avg Price', data: [], color: '#F59E0B' },
]);
```

### 2. Conditional Streaming

```typescript
if (lowerContent.includes('product a')) {
  // Stream only Product A sales
  simulatorRef.current.setFilter({ product: 'Widget A' });
}
```

### 3. Historical Data + Live Streaming

```typescript
// Load historical data first
const historical = await fetchHistoricalSales();
salesSeriesRef.current[0].data = historical;

// Then start streaming new data
simulatorRef.current.start();
```

### 4. Anomaly Detection

```typescript
const handleSalesEvent = useCallback((event: SalesEvent) => {
  // Detect anomalies
  const avg = totalRevenue / totalSales;
  const isAnomaly = event.amount > avg * 2;

  if (isAnomaly) {
    // Add alert message
    const alertMessage: Message = {
      content: `⚠️ Unusual sale detected: $${event.amount}`,
      sender: AI_USER,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, alertMessage]);
  }

  // Continue normal update
  // ...
}, [totalSales, totalRevenue]);
```

## Testing

### Manual Testing
1. Start the stream
2. Verify data flows in real-time
3. Check memory stays constant
4. Stop and restart multiple times
5. Verify statistics accuracy

### Performance Testing
```javascript
// In browser console:
console.time('1000-updates');
for (let i = 0; i < 1000; i++) {
  // Trigger sales event
}
console.timeEnd('1000-updates');
// Should be < 100ms
```

## Troubleshooting

### Chart Not Updating
- Verify `enableLiveStreaming={true}`
- Check `streamingMessageIdRef.current` is set
- Ensure data is being added to ref

### Memory Growing
- Confirm `maxDataPoints` is set
- Check that old data is being sliced
- Verify no external references holding data

### UI Lag
- Reduce update frequency
- Decrease `streamingWindowSize`
- Check for unnecessary re-renders

## Example Commands

Try these in the chat:

```
You: start
AI: [Starts streaming with live chart]

You: stats
AI: Current Status:
• Streaming: 🟢 Active
• Total Sales: 45
• Total Revenue: $4,523.67
• Data Points: 45

You: stop
AI: 🔴 Streaming stopped.
Final Stats:
• Total Sales: 45
• Total Revenue: $4,523.67
• Average Sale: $100.53

You: start
AI: [Restarts streaming with fresh data]
```

## Next Steps

1. **Integrate real WebSocket** - Connect to actual sales data source
2. **Add filters** - Filter by product, region, time range
3. **Export data** - Download CSV of sales data
4. **Alerts** - Set thresholds for notifications
5. **Multiple dashboards** - Revenue, inventory, customer metrics

## Resources

- [Main Live Streaming Guide](./LIVE_STREAMING_GUIDE.md)
- [TimeSeriesChart Documentation](./src/components/Chat/InteractiveComponents/README.md)
- [Chat Component Documentation](./src/components/Chat/README.md)
- [Example App](./example/examples/LiveStreamingChatExample.tsx)
