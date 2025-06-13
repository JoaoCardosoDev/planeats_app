// Simple test script to verify frontend can connect to backend
const API_BASE_URL = 'http://localhost:8000';

async function testRecipesAPI() {
  console.log('Testing Recipes API connection...');
  
  try {
    // Test 1: Get all recipes
    console.log('\n1. Testing: GET /api/v1/recipes');
    const response1 = await fetch(`${API_BASE_URL}/api/v1/recipes?skip=0&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Success: Found ${data1.total} total recipes`);
      console.log(`   Returned ${data1.recipes.length} recipes in this page`);
    } else {
      console.log(`❌ Failed: ${response1.status} ${response1.statusText}`);
    }

    // Test 2: Get user created recipes (without auth)
    console.log('\n2. Testing: GET /api/v1/recipes?user_created_only=true');
    const response2 = await fetch(`${API_BASE_URL}/api/v1/recipes?user_created_only=true&skip=0&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ Success: Found ${data2.total} user-created recipes`);
    } else {
      console.log(`❌ Failed: ${response2.status} ${response2.statusText}`);
    }

    // Test 3: Get imported recipes
    console.log('\n3. Testing: GET /api/v1/recipes?imported_only=true');
    const response3 = await fetch(`${API_BASE_URL}/api/v1/recipes?imported_only=true&skip=0&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`✅ Success: Found ${data3.total} imported recipes`);
    } else {
      console.log(`❌ Failed: ${response3.status} ${response3.statusText}`);
    }

    // Test 4: Test with search parameter
    console.log('\n4. Testing: GET /api/v1/recipes?search=arroz');
    const response4 = await fetch(`${API_BASE_URL}/api/v1/recipes?search=arroz&skip=0&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log(`✅ Success: Found ${data4.total} recipes matching 'arroz'`);
      if (data4.recipes.length > 0) {
        console.log(`   Sample recipe: ${data4.recipes[0].recipe_name}`);
      }
    } else {
      console.log(`❌ Failed: ${response4.status} ${response4.statusText}`);
    }

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

// Run the test
testRecipesAPI();
