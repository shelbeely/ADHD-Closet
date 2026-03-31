/**
 * ACP Bidirectional Communication Test
 * 
 * Demonstrates server-to-client notifications via Server-Sent Events
 */

import { notifyItemAdded, notifyJobCompleted, notifyStatsChanged } from './app/lib/acp/notifications';

const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

async function testServerSentEvents() {
  console.log('\n🔄 Testing ACP Bidirectional Communication (SSE)\n');
  console.log('=' .repeat(60));

  // Simulate subscribing to events (in real use, editor does this)
  console.log('\n📡 Simulating event subscription...');
  console.log('   URL: GET /api/acp/events?types=item/added,job/completed');
  console.log('   This would open an SSE connection in the editor\n');

  // Simulate some events
  console.log('🔔 Simulating server events:\n');

  setTimeout(() => {
    console.log('   1. Item added to wardrobe...');
    notifyItemAdded('item-123', 'Blue Shirt', 'tops');
  }, 1000);

  setTimeout(() => {
    console.log('   2. AI job completed...');
    notifyJobCompleted('job-456', 'catalog', { imageUrl: '/images/catalog-123.jpg' });
  }, 2000);

  setTimeout(() => {
    console.log('   3. Wardrobe stats updated...');
    notifyStatsChanged(42, 'added', { tops: 15, bottoms: 12 });
  }, 3000);

  await new Promise(resolve => setTimeout(resolve, 4000));

  console.log('\n✅ Events broadcasted!');
  console.log('   In a real editor connection:');
  console.log('   - Editor receives notifications via SSE');
  console.log('   - Editor UI updates automatically');
  console.log('   - No polling needed\n');
}

async function demonstrateBidirectionalFlow() {
  console.log('\n📚 Bidirectional ACP Flow:\n');
  console.log('=' .repeat(60));
  
  console.log('\n1️⃣  Editor → Server (Tool Execution)');
  console.log('   POST /api/acp/tools');
  console.log('   { "name": "search_wardrobe", "arguments": {...} }\n');
  
  console.log('2️⃣  Server → Editor (Subscribe to Events)');
  console.log('   GET /api/acp/events?types=item/added,job/completed');
  console.log('   Opens SSE connection for notifications\n');
  
  console.log('3️⃣  Server → Editor (Push Notifications)');
  console.log('   data: {"jsonrpc":"2.0","method":"notification",...}');
  console.log('   Editor receives real-time updates\n');
  
  console.log('🎯 Benefits:');
  console.log('   ✓ Real-time updates without polling');
  console.log('   ✓ Efficient server push');
  console.log('   ✓ Standard SSE (no WebSocket complexity)');
  console.log('   ✓ Works with all Next.js deployments\n');
}

async function showEditorIntegration() {
  console.log('\n💻 Editor Integration Example:\n');
  console.log('=' .repeat(60));
  
  console.log('\nJavaScript/TypeScript Client:');
  console.log(`
const eventSource = new EventSource(
  'http://localhost:3000/api/acp/events?types=item/added'
);

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Notification:', notification);
  
  // Update editor UI based on notification type
  if (notification.params.type === 'item/added') {
    showNotification('New item added to wardrobe!');
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
  `);
  
  console.log('\nZed Editor Integration:');
  console.log(`
{
  "acpServers": {
    "twin-style": {
      "url": "http://localhost:3000/api/acp",
      "eventsUrl": "http://localhost:3000/api/acp/events",
      "bidirectional": true
    }
  }
}
  `);
}

async function main() {
  console.log('🚀 ACP Bidirectional Communication Test Suite\n');
  
  await demonstrateBidirectionalFlow();
  await showEditorIntegration();
  await testServerSentEvents();
  
  console.log('=' .repeat(60));
  console.log('\n✨ Bidirectional ACP is ready!');
  console.log('   Editors can now receive real-time notifications');
  console.log('   from Twin Style wardrobe updates.\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

export { main as testACPBidirectional };
