"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recipeAPI, RecipeFilter } from "@/lib/api/recipes"
import { toast } from "sonner"

export default function TestFiltersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testFilter = async (filterName: string, filter: RecipeFilter) => {
    setIsLoading(true)
    try {
      console.log(`Testing ${filterName} with filter:`, filter)
      const response = await recipeAPI.getRecipes(filter)
      console.log(`${filterName} response:`, response)
      
      setResults({
        filterName,
        filter,
        response,
        success: true
      })
      
      toast.success(`${filterName} test successful!`, {
        description: `Found ${response.total} recipes`
      })
    } catch (error) {
      console.error(`${filterName} test failed:`, error)
      setResults({
        filterName,
        filter,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      })
      
      toast.error(`${filterName} test failed`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const tests = [
    {
      name: "AC3.2.1: User Created Only",
      filter: { user_created_only: true }
    },
    {
      name: "AC3.2.2: Max Calories (500)",
      filter: { max_calories: 500 }
    },
    {
      name: "AC3.2.3: Max Prep Time (30 min)",
      filter: { max_prep_time: 30 }
    },
    {
      name: "AC3.2.4: Ingredients (Maçã, Nozes)",
      filter: { ingredients: ["Maçã", "Nozes"] }
    },
    {
      name: "Combined Filters",
      filter: { 
        max_calories: 400, 
        max_prep_time: 45, 
        ingredients: ["tomate"] 
      }
    },
    {
      name: "All Recipes (No Filters)",
      filter: {}
    }
  ]

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">US3.2 Filter Tests</h1>
        <p className="text-muted-foreground mb-8">
          Test the recipe filtering functionality to ensure all acceptance criteria are met.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tests.map((test) => (
            <Card key={test.name}>
              <CardHeader>
                <CardTitle className="text-lg">{test.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <strong>Filter:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(test.filter, null, 2)}
                  </pre>
                </div>
                <Button 
                  onClick={() => testFilter(test.name, test.filter)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Testing..." : "Test Filter"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className={results.success ? "text-green-600" : "text-red-600"}>
                Test Results: {results.filterName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Filter Used:</strong>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(results.filter, null, 2)}
                  </pre>
                </div>
                
                {results.success ? (
                  <div>
                    <strong>Response:</strong>
                    <pre className="text-xs bg-green-50 p-2 rounded mt-1 overflow-x-auto max-h-96">
                      {JSON.stringify(results.response, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <strong>Error:</strong>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                      {results.error}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Ensure the backend is running on http://localhost:8000</li>
            <li>2. Check browser console for detailed request/response logs</li>
            <li>3. Each test validates a specific acceptance criteria</li>
            <li>4. Successful tests show the recipe data returned by the API</li>
            <li>5. Failed tests will show the error message for debugging</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
