import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { getAnalyzedPages, analyzeUrl } from '@/api/scrape.js';

export function VendasDashboard({ token, onLogout }) {
  const [pages, setPages] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const data = await getAnalyzedPages(token);
      setPages(data.pages || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAnalyze() {
    if (!newUrl) return;
    setLoading(true);
    try {
      await analyzeUrl(token, newUrl);
      setNewUrl('');
      fetchPages(); // atualizar lista
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Dashboard de Vendas</h1>
      <p className="mb-6">Bem-vindo, equipe de vendas!</p>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Nova URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analisando...' : 'Solicitar análise'}
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Páginas analisadas:</h2>
      <ul className="list-disc pl-5">
        {pages.map((p) => (
          <li key={p.url}>
            {p.url} - {p.is_cached ? 'Usando cache' : 'Nova análise'}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white">
          Logout
        </Button>
      </div>
    </div>
  );
}
