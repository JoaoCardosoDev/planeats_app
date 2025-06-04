'use client';



export interface ConnectionTestResult {
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  responseTime?: number;
}

export class ConnectionTester {
  private results: ConnectionTestResult[] = [];

  async testBackendConnection(): Promise<ConnectionTestResult[]> {
    this.results = [];
    
    const tests = [
      { name: 'Health Check', test: () => this.testHealthCheck() },
      { name: 'Authentication', test: () => this.testAuthentication() },
      { name: 'Pantry Items', test: () => this.testPantryItems() },
      { name: 'Recipes', test: () => this.testRecipes() },
      { name: 'AI Features', test: () => this.testAIFeatures() },
    ];

    for (const { name, test } of tests) {
      try {
        await test();
      } catch (error) {
        this.addResult(name, 'error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return this.results;
  }

  private async testHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.addResult('Health Check', 'success', `Backend is healthy`, responseTime);
      } else {
        this.addResult('Health Check', 'error', `Health check failed with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('Health Check', 'error', `Cannot reach backend: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  private async testAuthentication(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test login endpoint availability (without actual credentials)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'test' })
      });
      
      const responseTime = Date.now() - startTime;
      
      // We expect a 422 or 401 error for invalid credentials, which means the endpoint is working
      if (response.status === 422 || response.status === 401) {
        this.addResult('Authentication', 'success', 'Auth endpoint is responding', responseTime);
      } else if (response.status === 404) {
        this.addResult('Authentication', 'error', 'Auth endpoint not found');
      } else {
        this.addResult('Authentication', 'error', `Unexpected auth response: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Authentication', 'error', `Auth endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testPantryItems(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/pantry/items`);
      const responseTime = Date.now() - startTime;
      
      // We expect 401 for unauthenticated request, which means endpoint exists
      if (response.status === 401) {
        this.addResult('Pantry Items', 'success', 'Pantry endpoint is responding (requires auth)', responseTime);
      } else if (response.status === 404) {
        this.addResult('Pantry Items', 'error', 'Pantry endpoint not found');
      } else {
        this.addResult('Pantry Items', 'success', `Pantry endpoint accessible (status: ${response.status})`, responseTime);
      }
    } catch (error) {
      this.addResult('Pantry Items', 'error', `Pantry endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testRecipes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/recipes`);
      const responseTime = Date.now() - startTime;
      
      // We expect 401 for unauthenticated request, which means endpoint exists
      if (response.status === 401) {
        this.addResult('Recipes', 'success', 'Recipes endpoint is responding (requires auth)', responseTime);
      } else if (response.status === 404) {
        this.addResult('Recipes', 'error', 'Recipes endpoint not found');
      } else {
        this.addResult('Recipes', 'success', `Recipes endpoint accessible (status: ${response.status})`, responseTime);
      }
    } catch (error) {
      this.addResult('Recipes', 'error', `Recipes endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testAIFeatures(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/gemini/recipe-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantry_items: ['tomato', 'cheese'] })
      });
      
      const responseTime = Date.now() - startTime;
      
      // We expect 401 for unauthenticated request, which means endpoint exists
      if (response.status === 401) {
        this.addResult('AI Features', 'success', 'AI endpoint is responding (requires auth)', responseTime);
      } else if (response.status === 404) {
        this.addResult('AI Features', 'error', 'AI endpoint not found');
      } else {
        this.addResult('AI Features', 'success', `AI endpoint accessible (status: ${response.status})`, responseTime);
      }
    } catch (error) {
      this.addResult('AI Features', 'error', `AI endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addResult(endpoint: string, status: 'success' | 'error', message: string, responseTime?: number): void {
    this.results.push({
      endpoint,
      status,
      message,
      responseTime
    });
  }

  async testWithAuthentication(accessToken: string): Promise<ConnectionTestResult[]> {
    this.results = [];
    
    const authenticatedTests = [
      { name: 'Authenticated User Info', test: () => this.testUserInfo(accessToken) },
      { name: 'Authenticated Pantry Access', test: () => this.testAuthenticatedPantry(accessToken) },
      { name: 'Authenticated Recipes Access', test: () => this.testAuthenticatedRecipes(accessToken) },
    ];

    for (const { name, test } of authenticatedTests) {
      try {
        await test();
      } catch (error) {
        this.addResult(name, 'error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return this.results;
  }

  private async testUserInfo(accessToken: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.addResult('Authenticated User Info', 'success', 'User info retrieved successfully', responseTime);
      } else {
        this.addResult('Authenticated User Info', 'error', `Failed to get user info: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Authenticated User Info', 'error', `User info error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testAuthenticatedPantry(accessToken: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/pantry/items`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('Authenticated Pantry Access', 'success', `Pantry items retrieved: ${Array.isArray(data) ? data.length : 'unknown'} items`, responseTime);
      } else {
        this.addResult('Authenticated Pantry Access', 'error', `Failed to get pantry items: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Authenticated Pantry Access', 'error', `Pantry access error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testAuthenticatedRecipes(accessToken: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/recipes`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('Authenticated Recipes Access', 'success', `Recipes retrieved: ${Array.isArray(data) ? data.length : 'unknown'} recipes`, responseTime);
      } else {
        this.addResult('Authenticated Recipes Access', 'error', `Failed to get recipes: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Authenticated Recipes Access', 'error', `Recipes access error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  generateReport(): string {
    if (this.results.length === 0) {
      return 'No tests have been run yet.';
    }

    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    let report = `Connection Test Report\n`;
    report += `========================\n`;
    report += `Total Tests: ${this.results.length}\n`;
    report += `Successful: ${successCount}\n`;
    report += `Failed: ${errorCount}\n`;
    report += `Success Rate: ${Math.round((successCount / this.results.length) * 100)}%\n\n`;

    report += `Detailed Results:\n`;
    report += `-----------------\n`;

    this.results.forEach((result, index) => {
      const status = result.status === 'success' ? '✅' : '❌';
      const responseTime = result.responseTime ? ` (${result.responseTime}ms)` : '';
      report += `${index + 1}. ${status} ${result.endpoint}${responseTime}\n`;
      report += `   ${result.message}\n\n`;
    });

    return report;
  }
}

// Export singleton instance
export const connectionTester = new ConnectionTester();

// Utility functions for quick testing
export const testBackendConnection = () => connectionTester.testBackendConnection();
export const testWithAuth = (token: string) => connectionTester.testWithAuthentication(token);
export const generateConnectionReport = () => connectionTester.generateReport();