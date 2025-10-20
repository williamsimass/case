import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Search, LogOut, Loader2, CheckCircle, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';

export function Dashboard({ token, onLogout }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/v1/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar o site');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Erro ao analisar o site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Sales Intelligence</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Análise de Sites</h2>
          <p className="text-muted-foreground">
            Insira a URL de um site para obter insights de vendas automatizados
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Analisar Novo Site</CardTitle>
            <CardDescription>
              Digite a URL completa do site que deseja analisar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL do Site</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://exemplo.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analisar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultados da Análise</CardTitle>
                <Badge variant={result.is_cached ? "secondary" : "default"}>
                  {result.is_cached ? 'Cache' : 'Nova Análise'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {result.url}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Empresa</h3>
                <p className="text-foreground">{result.insights.nome_empresa}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Principal Serviço/Produto</h3>
                <p className="text-foreground">{result.insights.principal_servico_produto}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Público-Alvo</h3>
                <p className="text-foreground">{result.insights.publico_alvo}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Proposta de Valor</h3>
                <p className="text-foreground">{result.insights.proposta_de_valor}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Pontos de Venda (USPs)</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.insights.pontos_de_venda_usp.map((usp, index) => (
                    <li key={index} className="text-foreground">{usp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Resumo Executivo</h3>
                <p className="text-foreground leading-relaxed">{result.insights.resumo_executivo}</p>
              </div>

              {result.cached_at && (
                <div className="text-sm text-muted-foreground pt-4 border-t">
                  Última atualização: {new Date(result.cached_at).toLocaleString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

