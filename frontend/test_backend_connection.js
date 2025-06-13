// Simple test to check backend connectivity
async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...')
  
  try {
    // Test 1: Check if backend is running
    console.log('\n📡 Test 1: Testing backend health...')
    const healthResponse = await fetch('http://localhost:8000/health')
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Backend Health:', healthData)
    } else {
      console.log('❌ Backend Health Check Failed:', healthResponse.status)
      return
    }

    // Test 2: Check MealDB test connection endpoint
    console.log('\n🍽️ Test 2: Testing MealDB connection...')
    const mealdbResponse = await fetch('http://localhost:8000/api/v1/mealdb/test-connection')
    if (mealdbResponse.ok) {
      const mealdbData = await mealdbResponse.json()
      console.log('✅ MealDB Connection:', mealdbData)
    } else {
      console.log('❌ MealDB Connection Failed:', mealdbResponse.status, await mealdbResponse.text())
    }

    // Test 3: Try to get categories
    console.log('\n📂 Test 3: Testing MealDB categories...')
    const categoriesResponse = await fetch('http://localhost:8000/api/v1/mealdb/categories')
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      console.log('✅ Categories:', categoriesData.total, 'categories found')
    } else {
      console.log('❌ Categories Failed:', categoriesResponse.status, await categoriesResponse.text())
    }

    // Test 4: Try to get areas
    console.log('\n🌍 Test 4: Testing MealDB areas...')
    const areasResponse = await fetch('http://localhost:8000/api/v1/mealdb/areas')
    if (areasResponse.ok) {
      const areasData = await areasResponse.json()
      console.log('✅ Areas:', areasData.total, 'areas found')
    } else {
      console.log('❌ Areas Failed:', areasResponse.status, await areasResponse.text())
    }

    // Test 5: Try to get random meal
    console.log('\n🎲 Test 5: Testing random meal...')
    const randomResponse = await fetch('http://localhost:8000/api/v1/mealdb/random')
    if (randomResponse.ok) {
      const randomData = await randomResponse.json()
      console.log('✅ Random Meal:', randomData.name, `(${randomData.id})`)
    } else {
      console.log('❌ Random Meal Failed:', randomResponse.status, await randomResponse.text())
    }

    // Test 6: Try to search for pasta
    console.log('\n🔍 Test 6: Testing search...')
    const searchResponse = await fetch('http://localhost:8000/api/v1/mealdb/search?name=pasta')
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log('✅ Search Results:', searchData.total, 'pasta recipes found')
    } else {
      console.log('❌ Search Failed:', searchResponse.status, await searchResponse.text())
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }

  console.log('\n🏁 Test completed!')
}

// Run the test
testBackendConnection()
