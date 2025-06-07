// Simple test to verify pantry API integration
// Run this in the browser console when the add items page is loaded

async function testPantryAPI() {
  console.log('🧪 Testing Pantry API Integration for US2.1...');
  
  try {
    // Test data
    const testItem = {
      item_name: "Test Tomato",
      quantity: 2,
      unit: "kg",
      expiration_date: "2025-01-15",
      purchase_date: "2025-01-07"
    };

    console.log('📤 Creating test pantry item:', testItem);
    
    // Test create pantry item
    const response = await fetch('http://localhost:8000/api/v1/pantry/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testItem)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const createdItem = await response.json();
    console.log('✅ Created pantry item:', createdItem);

    // Test get pantry items
    console.log('📥 Fetching pantry items...');
    const getResponse = await fetch('http://localhost:8000/api/v1/pantry/items');
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('❌ Get API Error:', getResponse.status, errorText);
      return;
    }

    const items = await getResponse.json();
    console.log('✅ Retrieved pantry items:', items);

    console.log('🎉 Pantry API integration test completed successfully!');
    console.log('📋 Summary:');
    console.log('- ✅ POST /api/v1/pantry/items (Create item)');
    console.log('- ✅ GET /api/v1/pantry/items (List items)');
    console.log('- ✅ US2.1 Backend integration working!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('🔍 Make sure:');
    console.log('1. Backend is running on http://localhost:8000');
    console.log('2. CORS is properly configured');
    console.log('3. Database is connected');
  }
}

// Auto-run test
testPantryAPI();
