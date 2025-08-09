import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SettingsPanel } from '@/components/optimize/SettingsPanel';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const {
    optimizationDefaults,
    updateOptimizationDefaults,
    presets,
    addPreset,
    deletePreset,
    duplicatePreset,
    setDefaultPreset,
    resetPresetsToFactory,
    monthlyUsageLimit,
    setMonthlyUsageLimit,
    planName,
    setPlanName,
    historyRetentionDays,
    setHistoryRetentionDays,
  } = useAppSettings();
  const { clearHistory } = useProcessingHistory();

  const [limitValue, setLimitValue] = useState<number>(monthlyUsageLimit);
  const [planValue, setPlanValue] = useState<string>(planName);
  const [retentionValue, setRetentionValue] = useState<string>(historyRetentionDays ? String(historyRetentionDays) : '');

  useEffect(() => {
    document.title = 'Configurações — Otimizador de Imagens';
  }, []);

  useEffect(() => {
    setLimitValue(monthlyUsageLimit);
    setPlanValue(planName);
    setRetentionValue(historyRetentionDays ? String(historyRetentionDays) : '');
  }, [monthlyUsageLimit, planName, historyRetentionDays]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Ajuste padrões, presets e limites de uso</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Padrões de Otimização */}
        <div className="lg:col-span-2">
          <SettingsPanel
            settings={optimizationDefaults}
            onSettingsChange={(s) => {
              updateOptimizationDefaults(s);
            }}
            onPresetSave={(name, s) => {
              addPreset(name, s);
              toast({ title: 'Preset salvo', description: `“${name}” criado a partir dos padrões.` });
            }}
            className="sticky top-6"
          />
        </div>

        {/* Uso e Limites + Histórico */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso e Limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <div className="flex gap-2 items-center">
                  <Input id="plan" value={planValue} onChange={(e) => setPlanValue(e.target.value)} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPlanName(planValue.trim() || 'Pro');
                      toast({ title: 'Plano atualizado', description: `Plano definido como “${planValue || 'Pro'}”.` });
                    }}
                  >
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Nome do plano exibido no Dashboard.</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="limit">Limite mensal de requisições</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="limit"
                    type="number"
                    value={limitValue}
                    onChange={(e) => setLimitValue(parseInt(e.target.value || '0', 10))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMonthlyUsageLimit(limitValue);
                      toast({ title: 'Limite salvo', description: `Limite mensal: ${limitValue.toLocaleString()}.` });
                    }}
                  >
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Usado para calcular a barra de uso mensal.</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="retention">Retenção do histórico (dias)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="retention"
                    type="number"
                    placeholder="Ilimitado"
                    value={retentionValue}
                    onChange={(e) => setRetentionValue(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const days = retentionValue.trim() ? Math.max(1, Math.floor(Number(retentionValue))) : null;
                      setHistoryRetentionDays(days);
                      toast({ title: 'Retenção atualizada', description: days ? `${days} dias` : 'Ilimitado' });
                    }}
                  >
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Entradas mais antigas serão removidas automaticamente.</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Histórico</Label>
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearHistory();
                    toast({ title: 'Histórico limpo', description: 'Todo o histórico foi removido.' });
                  }}
                >
                  Limpar histórico agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Presets de Otimização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">Gerencie, duplique, defina padrão ou remova presets.</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  addPreset('Novo preset', optimizationDefaults);
                  toast({ title: 'Preset criado', description: 'Novo preset baseado nos padrões atuais.' });
                }}
              >
                Criar a partir dos padrões
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetPresetsToFactory();
                  toast({ title: 'Presets restaurados', description: 'Presets de fábrica foram restaurados.' });
                }}
              >
                Restaurar padrões
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {presets.map((p) => (
              <div key={p.id} className={`p-4 rounded-lg border ${p.isDefault ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium truncate max-w-[70%]">{p.name}</h4>
                  {p.isDefault && <Badge variant="outline" className="text-xs">Padrão</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between"><span>Qualidade:</span><span>{p.settings.quality}%</span></div>
                  <div className="flex justify-between"><span>Formato:</span><span className="uppercase">{p.settings.format}</span></div>
                  {p.settings.width && (
                    <div className="flex justify-between"><span>Tamanho:</span><span>{p.settings.width}×{p.settings.height || 'auto'}</span></div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!p.isDefault && (
                    <Button size="sm" variant="outline" onClick={() => { setDefaultPreset(p.id); toast({ title: 'Padrão definido', description: `“${p.name}” agora é o preset padrão.` }); }}>Definir padrão</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { duplicatePreset(p.id); toast({ title: 'Preset duplicado', description: `“${p.name}” foi duplicado.` }); }}>Duplicar</Button>
                  {!p.isDefault && (
                    <Button size="sm" variant="destructive" onClick={() => { deletePreset(p.id); toast({ title: 'Preset removido', description: `“${p.name}” foi excluído.` }); }}>Excluir</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
