import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart3, TrendingUp, Database, Clock, LogOut, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Buscar estatísticas
      const statsResponse = await fetch('http://localhost:8000/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Buscar análises recentes
      const analysesResponse = await fetch('http://localhost:8000/api/v1/admin/recent-analyses?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setRecentAnalyses(analysesData.analyses || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-10 w-10 text-purple-600" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">Estatísticas e gerenciamento do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={onLogout} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardDescription>Total de Análises</CardDescription>
              <CardTitle className="text-3xl">{stats?.total_analyses || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <Database className="h-4 w-4 mr-1" />
                URLs únicas analisadas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardDescription>Cache Hits</CardDescription>
              <CardTitle className="text-3xl">{stats?.cache_hits || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                Respostas instantâneas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardDescription>Cache Misses</CardDescription>
              <CardTitle className="text-3xl">{stats?.cache_misses || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                Novas análises
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardDescription>Eficiência do Cache</CardDescription>
              <CardTitle className="text-3xl">{stats?.cache_efficiency || '0%'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-purple-600">
                <BarChart3 className="h-4 w-4 mr-1" />
                Taxa de acerto
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Análises Recentes</CardTitle>
            <CardDescription>Últimas 5 URLs analisadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma análise realizada ainda.</p>
            ) : (
              <div className="space-y-4">
                {recentAnalyses.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{analysis.company}</p>
                      <p className="text-sm text-gray-600 truncate max-w-md">{analysis.url}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={analysis.cache_age_days === 0 ? "default" : "secondary"}>
                        {analysis.cache_age_days === 0 ? 'Hoje' : `${analysis.cache_age_days}d atrás`}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(analysis.analyzed_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        {stats?.last_analysis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Última Análise</p>
                  <p className="font-semibold">{new Date(stats.last_analysis).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status do Sistema</p>
                  <Badge variant="default" className="bg-green-500">
                    ✓ Operacional
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

