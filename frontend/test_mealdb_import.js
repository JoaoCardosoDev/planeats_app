// Test script to debug MealDB import functionality
async function testMealDBImport() {
  console.log('🔍 Testing MealDB Import Functionality...')
  
  // Test 1: Check if MealDB API is accessible
  console.log('\n📡 Test 1: Testing MealDB API connectivity...')
  try {
    const response = await fetch('http://localhost:8000/api/v1/mealdb/test-connection')
    const result = await response.json()
    console.log('✅ MealDB API Test:', result)
  } catch (error) {
    console.error('❌ MealDB API Test Failed:', error.message)
    return
  }

  // Test 2: Get a random meal to test basic functionality
  console.log('\n🎲 Test 2: Getting a random meal...')
  let testMealId = null
  try {
    const response = await fetch('http://localhost:8000/api/v1/mealdb/random')
    const meal = await response.json()
    testMealId = meal.id
    console.log('✅ Random Meal:', { id: meal.id, name: meal.name, category: meal.category })
  } catch (error) {
    console.error('❌ Random Meal Test Failed:', error.message)
    return
  }

  // Test 3: Try to import without authentication (should fail)
  console.log('\n🔒 Test 3: Testing import without authentication (should fail)...')
  try {
    const response = await fetch(`http://localhost:8000/api/v1/mealdb/import/${testMealId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const result = await response.json()
    if (response.status === 401) {
      console.log('✅ Import without auth correctly failed:', result.detail)
    } else {
      console.log('⚠️ Unexpected response:', result)
    }
  } catch (error) {
    console.error('❌ Import test failed:', error.message)
  }

  // Test 4: Check if we can authenticate
  console.log('\n🔑 Test 4: Testing authentication...')
  try {
    const authResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@planeats.com',
        password: 'admin123'
      })
    })
    
    if (authResponse.ok) {
      const authResult = await authResponse.json()
      console.log('✅ Authentication successful')
      
      // Test 5: Try import with authentication
      console.log('\n📥 Test 5: Testing import with authentication...')
      const importResponse = await fetch(`http://localhost:8000/api/v1/mealdb/import/${testMealId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResult.access_token}`
        }
      })
      
      const importResult = await importResponse.json()
      if (importResponse.ok) {
        console.log('✅ Import successful:', importResult.message)
      } else {
        console.error('❌ Import failed:', importResult.detail)
      }
    } else {
      const authError = await authResponse.json()
      console.error('❌ Authentication failed:', authError.detail)
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
  }

  console.log('\n🏁 Test completed!')
}

// Run the test
testMealDBImport().catch(console.error)
