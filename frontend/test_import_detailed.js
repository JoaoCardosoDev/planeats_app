// Detailed test for import functionality debugging
async function testImportFlow() {
  console.log('🔍 Testing Import Flow in Detail...')
  
  let authToken = null

  try {
    // Step 1: Test login
    console.log('\n🔑 Step 1: Testing authentication...')
    const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@planeats.com',
        password: 'admin123'
      })
    })

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error('❌ Login failed:', loginResponse.status, errorText)
      return
    }

    const loginData = await loginResponse.json()
    authToken = loginData.access_token
    console.log('✅ Login successful, got token')

    // Step 2: Test MealDB random endpoint
    console.log('\n🎲 Step 2: Testing MealDB random meal...')
    const randomResponse = await fetch('http://localhost:8000/api/v1/mealdb/random')
    
    let testMealId = null
    if (randomResponse.ok) {
      const randomData = await randomResponse.json()
      testMealId = randomData.id
      console.log(`✅ Got random meal: ${randomData.name} (ID: ${testMealId})`)
    } else {
      console.log('⚠️ Random meal failed, will use hardcoded ID')
      testMealId = '52771' // Spicy Arrabiata Penne - common recipe
    }

    // Step 3: Test specific meal retrieval
    console.log(`\n📖 Step 3: Testing meal retrieval for ID ${testMealId}...`)
    const mealResponse = await fetch(`http://localhost:8000/api/v1/mealdb/meal/${testMealId}`)
    
    if (mealResponse.ok) {
      const mealData = await mealResponse.json()
      console.log(`✅ Retrieved meal: ${mealData.name}`)
    } else {
      const errorText = await mealResponse.text()
      console.log(`❌ Failed to retrieve meal: ${mealResponse.status} - ${errorText}`)
      return
    }

    // Step 4: Test import with authentication
    console.log(`\n📥 Step 4: Testing import for meal ${testMealId}...`)
    const importResponse = await fetch(`http://localhost:8000/api/v1/mealdb/import/${testMealId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    })

    const importResponseText = await importResponse.text()
    console.log(`Import response status: ${importResponse.status}`)
    console.log(`Import response body: ${importResponseText}`)

    if (importResponse.ok) {
      const importData = JSON.parse(importResponseText)
      console.log('✅ Import successful:', importData.message)
      
      // Step 5: Verify the recipe appears in user's collection
      console.log('\n📚 Step 5: Checking if recipe appears in user collection...')
      const recipesResponse = await fetch('http://localhost:8000/api/v1/recipes', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        console.log(`✅ User has ${recipesData.total} recipes`)
        
        // Look for the imported recipe
        const importedRecipe = recipesData.recipes.find(r => 
          r.recipe_name.toLowerCase().includes(importData.recipe?.recipe_name?.toLowerCase() || 'test')
        )
        
        if (importedRecipe) {
          console.log(`✅ Found imported recipe: ${importedRecipe.recipe_name}`)
        } else {
          console.log('⚠️ Imported recipe not found in collection')
        }
      } else {
        console.log('❌ Failed to fetch user recipes')
      }
      
    } else {
      console.log(`❌ Import failed: ${importResponse.status}`)
      console.log(`Error details: ${importResponseText}`)
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }

  console.log('\n🏁 Test completed!')
}

// Run the test
testImportFlow()
