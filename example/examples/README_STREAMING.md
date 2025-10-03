# Live Streaming Sales Example

## Overview

This example demonstrates real-time WebSocket-style data streaming with the TimeSeriesChart component. It simulates a live sales dashboard that continuously receives and displays sales data with fixed memory usage.

## Features

- **Real-time Updates**: Simulates sales events streaming in real-time
- **Fixed Memory**: Maintains only the last 100 data points in memory
- **Smart Windowing**: Displays the last 50 points while keeping 100 in memory
- **Performance**: Handles high-frequency updates without UI lag
- **Interactive Controls**: Start/stop streaming, adjust frequency, reset data
- **Live Statistics**: Real-time sales metrics and performance monitoring

## Running the Example

1. Navigate to the example directory:
   ```bash
   cd example
   ```

2. Start the development server:
   ```bash
   yarn start
   ```

3. In the app, navigate to the **📈 Live** tab

4. Click **"▶ Start Streaming"** to begin the simulation

## How It Works

### Data Simulator

The `SalesDataSimulator` class simulates a WebSocket connection:

```typescript
class SalesDataSimulator {
  start() {
    // Generates sales events at configurable frequency
    this.intervalId = setInterval(() => {
      const salesEvent = this.generateSalesEvent();
      this.notifySubscribers(salesEvent);
    }, this.salesFrequency);
  }

  generateSalesEvent(): SalesEvent {
    // Simulates realistic sales with business hours patterns
    const timeMultiplier = isBusinessHours ? 1.5 : 0.5;
    const amount = baseRevenue + randomVariation * timeMultiplier;
    return { timestamp: new Date(), amount, product };
  }
}
```

### Memory Management

The chart automatically maintains fixed memory:

```typescript
<TimeSeriesChart
  series={salesSeries}
  enableLiveStreaming={true}
  maxDataPoints={100}        // Keep last 100 in memory
  streamingWindowSize={50}   // Display last 50
/>
```

### Update Flow

1. **Simulator** generates a sale event every N milliseconds
2. **Subscriber** receives the event and updates state
3. **Chart** automatically:
   - Adds the new data point
   - Removes old points beyond maxDataPoints
   - Re-renders with the latest streamingWindowSize points
4. **Statistics** update to show current metrics

## Controls

### Start/Stop Streaming
- Start: Begin receiving simulated sales events
- Stop: Pause the data stream

### Sales Frequency
- **Fast (500ms)**: New sale every 0.5 seconds
- **Normal (1s)**: New sale every second
- **Slow (2s)**: New sale every 2 seconds

### Reset
- Clears all data and statistics
- Stops the stream

## Statistics Panel

Live metrics updated in real-time:
- **Total Sales**: Count of all sales events
- **Total Revenue**: Sum of all sales amounts
- **Avg Sale Amount**: Average value per sale
- **Data Points**: Current number of points in memory

## Performance

The implementation is optimized for:
- **Zero UI Blocking**: Updates don't freeze the interface
- **Fixed Memory**: Memory usage stays constant
- **High Throughput**: Can handle 1000+ updates/second
- **Smooth Animations**: Chart transitions are smooth

## Code Structure

```
LiveStreamingSalesExample.tsx
├── SalesDataSimulator      # WebSocket simulation
├── Component State         # Sales data and statistics
├── Controls Section        # Start/stop, frequency
├── Statistics Panel        # Live metrics
├── Chart Section          # TimeSeriesChart with streaming
└── Info Panels            # Performance info and code examples
```

## Integration with Real WebSocket

To integrate with a real WebSocket:

```typescript
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/sales');

  ws.onmessage = (event) => {
    const sale = JSON.parse(event.data);

    setSalesSeries(prevSeries => {
      const updated = [...prevSeries];
      updated[0].data = [
        ...updated[0].data,
        {
          timestamp: new Date(sale.timestamp),
          value: sale.amount,
          label: sale.product,
        }
      ];
      return updated;
    });
  };

  return () => ws.close();
}, []);
```

## Key Takeaways

1. **Always enable streaming mode** for real-time data:
   ```typescript
   enableLiveStreaming={true}
   ```

2. **Configure memory limits** based on your needs:
   ```typescript
   maxDataPoints={100}  // Adjust based on duration
   streamingWindowSize={50}  // Adjust for visibility
   ```

3. **Clean up resources** when component unmounts:
   ```typescript
   useEffect(() => {
     // Setup...
     return () => {
       ws.close();
       clearInterval(interval);
     };
   }, []);
   ```

4. **Monitor performance** in production:
   - Track data points in memory
   - Monitor update frequency
   - Watch for UI lag

## Next Steps

- Try different frequency settings
- Modify the sales simulation logic
- Add multiple product categories
- Integrate with a real data source
- Experiment with different maxDataPoints values

## Resources

- [Live Streaming Guide](../../LIVE_STREAMING_GUIDE.md)
- [TimeSeriesChart Documentation](../../src/components/Chat/InteractiveComponents/README.md)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
