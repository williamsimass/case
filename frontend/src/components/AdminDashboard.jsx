
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table.jsx';
import { Trash2, UserPlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

export function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('vendas');
  const [addingUser, setAddingUser] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/v1/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha ao adicionar usuário');
      }
      setNewUsername('');
      setNewPassword('');
      setNewRole('vendas');
      setIsDialogOpen(false);
      fetchUsers(); // Recarregar lista de usuários
    } catch (err) {
      setError(err.message || 'Erro ao adicionar usuário');
    } finally {
      setAddingUser(false);
    }
  };

  // A funcionalidade de exclusão de usuário não foi solicitada, mas pode ser adicionada aqui.
  // Por enquanto, apenas um placeholder.
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setError('');
      try {
        // Implementar endpoint de exclusão no backend e chamar aqui
        console.log(`Excluir usuário com ID: ${userId}`);
        // await fetch(`${apiUrl}/v1/auth/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        // fetchUsers();
        alert('Funcionalidade de exclusão não implementada no backend ainda.');
      } catch (err) {
        setError(err.message || 'Erro ao excluir usuário');
      }
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h2>
      <Card className="shadow-lg">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Usuários Registrados</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}><UserPlus className="h-4 w-4 mr-2" /> Adicionar Usuário</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="text-destructive text-center p-4">{error}</div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum usuário encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)} disabled={user.username === 'admin'}> {/* Não permitir excluir o admin padrão */}
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar uma nova conta de usuário.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Usuário</Label>
                <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Senha</Label>
                <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Função</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecionar função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-destructive text-center p-2">{error}</div>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addingUser}>
                {addingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

