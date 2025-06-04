'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { connectionTester, ConnectionTestResult } from '@/lib/test-connection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Download,
  AlertTriangle,
  Info,
  Server,
  Shield,
  Database,
  Sparkles
} from 'lucide-react';

export default function DiagnosticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [authTestResults, setAuthTestResults] = useState<ConnectionTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningAuth, setIsRunningAuth] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const runBasicTests = async () => {
    setIsRunning(true);
    try {
      const results = await connectionTester.testBackendConnection();
      setTestResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const totalCount = results.length;
      
      toast({
        title: 'Testes Básicos Concluídos',
        description: `${successCount}/${totalCount} testes passaram com sucesso.`,
        variant: successCount === totalCount ? 'default' : 'destructive',
      });
    } catch (_error) {
      toast({
        title: 'Erro nos Testes',
        description: 'Falha ao executar os testes de conexão.',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runAuthenticatedTests = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Token de Acesso Necessário',
        description: 'Faça login para executar testes autenticados.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunningAuth(true);
    try {
      const results = await connectionTester.testWithAuthentication(session.accessToken);
      setAuthTestResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const totalCount = results.length;
      
      toast({
        title: 'Testes Autenticados Concluídos',
        description: `${successCount}/${totalCount} testes passaram com sucesso.`,
        variant: successCount === totalCount ? 'default' : 'destructive',
      });
    } catch (_error) {
      toast({
        title: 'Erro nos Testes Autenticados',
        description: 'Falha ao executar os testes autenticados.',
        variant: 'destructive',
      });
    } finally {
      setIsRunningAuth(false);
    }
  };

  const downloadReport = () => {
    const report = connectionTester.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planeats-connection-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    return status === 'success' 
      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    return (
      <Badge variant={status === 'success' ? 'default' : 'destructive'}>
        {status === 'success' ? 'Sucesso' : 'Erro'}
      </Badge>
    );
  };

  const getEndpointIcon = (endpoint: string) => {
    if (endpoint.toLowerCase().includes('health')) return <Server className="h-4 w-4" />;
    if (endpoint.toLowerCase().includes('auth')) return <Shield className="h-4 w-4" />;
    if (endpoint.toLowerCase().includes('pantry')) return <Database className="h-4 w-4" />;
    if (endpoint.toLowerCase().includes('ai')) return <Sparkles className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Diagnósticos do Sistema</h1>
            <p className="text-muted-foreground">
              Teste a conectividade e funcionamento dos serviços backend
            </p>
          </div>
          
          <div className="flex gap-2">
            {(testResults.length > 0 || authTestResults.length > 0) && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Configuração Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">URL da API:</h4>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                </code>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status da Sessão:</h4>
                <Badge variant={session ? 'default' : 'destructive'}>
                  {session ? 'Autenticado' : 'Não Autenticado'}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Usuário:</h4>
                <span className="text-sm">
                  {session?.user?.name || session?.user?.email || 'N/A'}
                </span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Token Disponível:</h4>
                <Badge variant={session?.accessToken ? 'default' : 'secondary'}>
                  {session?.accessToken ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Tests */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Testes Básicos de Conectividade
                </CardTitle>
                <CardDescription>
                  Testa se os endpoints do backend estão respondendo (não requer autenticação)
                </CardDescription>
              </div>
              <Button 
                onClick={runBasicTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Executando...' : 'Executar Testes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum teste executado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getEndpointIcon(result.endpoint)}
                      <div>
                        <h4 className="font-medium">{result.endpoint}</h4>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.responseTime && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm">
                    {getStatusIcon(testResults.every(r => r.status === 'success') ? 'success' : 'error')}
                    <span className="font-medium">
                      {testResults.filter(r => r.status === 'success').length} de {testResults.length} testes passaram
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authenticated Tests */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Testes Autenticados
                </CardTitle>
                <CardDescription>
                  Testa funcionalidades que requerem autenticação
                </CardDescription>
              </div>
              <Button 
                onClick={runAuthenticatedTests} 
                disabled={isRunningAuth || !session?.accessToken}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunningAuth ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                {isRunningAuth ? 'Executando...' : 'Executar Testes'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!session?.accessToken ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <p>Token de acesso necessário para executar estes testes</p>
                <p className="text-sm">Faça login para habilitar os testes autenticados</p>
              </div>
            ) : authTestResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum teste autenticado executado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {authTestResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getEndpointIcon(result.endpoint)}
                      <div>
                        <h4 className="font-medium">{result.endpoint}</h4>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.responseTime && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm">
                    {getStatusIcon(authTestResults.every(r => r.status === 'success') ? 'success' : 'error')}
                    <span className="font-medium">
                      {authTestResults.filter(r => r.status === 'success').length} de {authTestResults.length} testes passaram
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Links úteis para desenvolvimento e debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <Server className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">API Docs</div>
                    <div className="text-sm text-muted-foreground">Swagger UI</div>
                  </div>
                </a>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <CheckCircle2 className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Health Check</div>
                    <div className="text-sm text-muted-foreground">Status do Backend</div>
                  </div>
                </a>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/redoc`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2"
                >
                  <Info className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">ReDoc</div>
                    <div className="text-sm text-muted-foreground">Documentação</div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}