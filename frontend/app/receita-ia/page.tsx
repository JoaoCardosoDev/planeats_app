'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { pantryAPI, PantryItemRead } from '@/lib/api/pantry';
import { aiRecipesAPI, CustomRecipeRequest, CustomRecipeResponse } from '@/lib/api/ai-recipes';

interface GeneratedRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface GeneratedRecipe {
  recipe_name: string;
  instructions: string;
  estimated_calories?: number;
  preparation_time_minutes?: number;
  ingredients: GeneratedRecipeIngredient[];
}

export default function AIRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for pantry items and selection
  const [pantryItems, setPantryItems] = useState<PantryItemRead[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // State for form inputs
  const [maxCalories, setMaxCalories] = useState<string>('');
  const [prepTimeLimit, setPrepTimeLimit] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('');
  const [cuisinePreference, setCuisinePreference] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  // State for generation process
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<CustomRecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Load pantry items
  useEffect(() => {
    if (session) {
      loadPantryItems();
    }
  }, [session]);

  const loadPantryItems = async () => {
    try {
      const items = await pantryAPI.getPantryItems();
      setPantryItems(items);
    } catch (err) {
      console.error('Error loading pantry items:', err);
      setError('Erro ao carregar itens da despensa');
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleGenerateRecipe = async () => {
    if (selectedItems.length === 0) {
      setError('Selecione pelo menos um item da despensa');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const request: CustomRecipeRequest = {
        pantry_item_ids: selectedItems,
        max_calories: maxCalories ? parseInt(maxCalories) : undefined,
        preparation_time_limit: prepTimeLimit ? parseInt(prepTimeLimit) : undefined,
        dietary_restrictions: dietaryRestrictions || undefined,
        cuisine_preference: cuisinePreference || undefined,
        additional_notes: additionalNotes || undefined,
      };

      const response = await aiRecipesAPI.generateCustomRecipe(request);
      setGeneratedRecipe(response);
      setShowResult(true);
    } catch (err: any) {
      console.error('Error generating recipe:', err);
      setError(err.message || 'Erro ao gerar receita');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setMaxCalories('');
    setPrepTimeLimit('');
    setDietaryRestrictions('');
    setCuisinePreference('');
    setAdditionalNotes('');
    setGeneratedRecipe(null);
    setShowResult(false);
    setError(null);
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Login Necessário</h2>
          <p className="text-yellow-600 mb-4">Você precisa estar logado para gerar receitas personalizadas.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Receita Personalizada com IA
          </h1>
          <p className="text-gray-600">
            Selecione ingredientes da sua despensa e deixe a IA criar uma receita única para você!
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">!</div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!showResult ? (
          <div className="space-y-8">
            {/* Pantry Items Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selecionar Ingredientes ({selectedItems.length} selecionados)
              </h2>
              
              {pantryItems.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700">
                    Sua despensa está vazia. 
                    <a href="/meu-frigorifico" className="text-yellow-800 underline ml-1">
                      Adicione alguns itens primeiro
                    </a>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pantryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedItems.includes(item.id!)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => toggleItemSelection(item.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                          </p>
                          {item.expiration_date && (
                            <p className="text-xs text-orange-600">
                              Exp: {new Date(item.expiration_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-xl">
                          {selectedItems.includes(item.id!) ? '✅' : '⭕'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recipe Preferences */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preferências da Receita
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calorias Máximas
                  </label>
                  <input
                    type="number"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(e.target.value)}
                    placeholder="ex: 500"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Máximo (minutos)
                  </label>
                  <input
                    type="number"
                    value={prepTimeLimit}
                    onChange={(e) => setPrepTimeLimit(e.target.value)}
                    placeholder="ex: 30"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrições Dietéticas
                  </label>
                  <select
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Nenhuma</option>
                    <option value="vegetarian">Vegetariano</option>
                    <option value="vegan">Vegano</option>
                    <option value="gluten-free">Sem Glúten</option>
                    <option value="lactose-free">Sem Lactose</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cozinha
                  </label>
                  <select
                    value={cuisinePreference}
                    onChange={(e) => setCuisinePreference(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Qualquer</option>
                    <option value="portuguese">Portuguesa</option>
                    <option value="italian">Italiana</option>
                    <option value="asian">Asiática</option>
                    <option value="mexican">Mexicana</option>
                    <option value="mediterranean">Mediterrânea</option>
                    <option value="indian">Indiana</option>
                    <option value="french">Francesa</option>
                    <option value="american">Americana</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionais
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="ex: Prefiro pratos picantes, evitar cebola..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetForm}
                disabled={isGenerating}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Limpar
              </button>
              
              <button
                onClick={handleGenerateRecipe}
                disabled={isGenerating || selectedItems.length === 0}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Gerando...</span>
                  </>
                ) : (
                  <span>Gerar Receita com IA</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Generated Recipe Display */
          <div className="space-y-6">
            {generatedRecipe && (
              <>
                {/* Recipe Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {generatedRecipe.generated_recipe.recipe_name}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      × Fechar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {generatedRecipe.generated_recipe.estimated_calories && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 font-semibold">
                          {generatedRecipe.generated_recipe.estimated_calories}
                        </div>
                        <div className="text-sm text-blue-500">calorias</div>
                      </div>
                    )}
                    
                    {generatedRecipe.generated_recipe.preparation_time_minutes && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600 font-semibold">
                          {generatedRecipe.generated_recipe.preparation_time_minutes}
                        </div>
                        <div className="text-sm text-green-500">minutos</div>
                      </div>
                    )}
                    
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-purple-600 font-semibold">
                        {generatedRecipe.generated_recipe.ingredients.length}
                      </div>
                      <div className="text-sm text-purple-500">ingredientes</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-orange-600 font-semibold">
                        {generatedRecipe.generation_metadata.generation_time.toFixed(1)}s
                      </div>
                      <div className="text-sm text-orange-500">geração</div>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ingredientes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedRecipe.generated_recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-green-600">•</span>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Modo de Preparo
                  </h3>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {generatedRecipe.generated_recipe.instructions}
                    </div>
                  </div>
                </div>

                {/* Used Pantry Items */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Itens da Despensa Utilizados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generatedRecipe.used_pantry_items.map((item) => (
                      <div key={item.pantry_item_id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600">•</span>
                        <span className="font-medium">{item.item_name}</span>
                        <span className="text-gray-600 text-sm">
                          {item.quantity_used} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generation Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    <p>Receita gerada usando: <strong>{generatedRecipe.generation_metadata.model_used}</strong></p>
                    <p>Tempo de geração: <strong>{generatedRecipe.generation_metadata.generation_time.toFixed(2)}s</strong></p>
                    {generatedRecipe.generation_id && (
                      <p>ID da geração: <code className="text-xs">{generatedRecipe.generation_id}</code></p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Gerar Nova Receita
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Imprimir
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
