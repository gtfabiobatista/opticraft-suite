import { useState } from 'react';
import { Key, Plus, Copy, RotateCcw, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useApiKeyManager } from '@/hooks/useApiKeyManager';

const ApiKeysPage = () => {
  const { apiKeys, createApiKey, revokeApiKey, regenerateApiKey, copyToClipboard } = useApiKeyManager();
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<('read' | 'write' | 'admin')[]>(['read']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const handleCreateKey = async () => {
    if (newKeyName.trim() && newKeyPermissions.length > 0) {
      await createApiKey(newKeyName.trim(), newKeyPermissions);
      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setIsDialogOpen(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newHidden = new Set(hiddenKeys);
    if (newHidden.has(keyId)) {
      newHidden.delete(keyId);
    } else {
      newHidden.add(keyId);
    }
    setHiddenKeys(newHidden);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••••••';
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'write':
        return 'bg-warning text-warning-foreground';
      case 'read':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chaves de API</h1>
          <p className="text-muted-foreground">
            Gerencie suas chaves de API e monitore seu uso
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Criar Chave API
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Chave API</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Nome da Chave</Label>
                <Input
                  id="key-name"
                  placeholder="ex: API de Produção, Desenvolvimento"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Permissões</Label>
                <div className="space-y-2">
                  {(['read', 'write', 'admin'] as const).map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newKeyPermissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewKeyPermissions([...newKeyPermissions, permission]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="capitalize">
                        {permission}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {permission === 'read' && '(Ver imagens e estatísticas)'}
                        {permission === 'write' && '(Processar imagens)'}
                        {permission === 'admin' && '(Acesso completo)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim() || newKeyPermissions.length === 0}>
                  Criar Chave
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className={!apiKey.isActive ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Criada em {formatDate(apiKey.createdAt)}
                      {apiKey.lastUsed && ` • Último uso em ${formatDate(apiKey.lastUsed)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {apiKey.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className={getPermissionColor(permission)}
                    >
                      {permission}
                    </Badge>
                  ))}
                  {!apiKey.isActive && (
                    <Badge variant="destructive">Revogada</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* API Key Display */}
              <div className="space-y-2">
                <Label>Chave API</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={hiddenKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {hiddenKeys.has(apiKey.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Uso Mensal</Label>
                  <span className="text-sm text-muted-foreground">
                    {apiKey.requestCount.toLocaleString()} / {apiKey.monthlyLimit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(apiKey.requestCount / apiKey.monthlyLimit) * 100}
                  className="h-2"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  ID: {apiKey.id}
                </div>
                <div className="flex space-x-2">
                  {apiKey.isActive && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateApiKey(apiKey.id)}
                      >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Regenerar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeApiKey(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Revogar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Diretrizes de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Autenticação</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Inclua sua chave API no cabeçalho Authorization:</p>
                <code className="block p-2 bg-muted rounded text-xs">
                  Authorization: Bearer sua_chave_api_aqui
                </code>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Limites de Taxa</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 100 requisições por minuto</p>
                <p>• Limites mensais baseados no plano</p>
                <p>• Processamento em lote conta como múltiplas requisições</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Exemplo de Requisição</h4>
            <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
{`curl -X POST https://api.imageopt.com/v1/optimize \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@photo.jpg" \\
  -F "quality=80" \\
  -F "format=webp"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysPage;