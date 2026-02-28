import React, { useState, useMemo, useCallback, memo } from 'react';
import { useData } from '../services/useData';
import { Building2, User, Landmark, TrendingUp } from 'lucide-react';
import CasaApostaModal from '../components/CasaApostaModal';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const Ativos: React.FC = () => {
  const {
    casasApostas, addCasaAposta,
    parcerias, contasParceiros, addContaParceiro, updateContaParceiro, deleteContaParceiro,
    fullReload
  } = useData();

  const [isCasaModalOpen, setIsCasaModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState<number | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    parceiro_id: '',
    valor_inicial: '',
    observacoes: ''
  });

  // Calcular totais da semana atual
  const semanaAtual = useMemo(() => {
    const hoje = new Date();
    return {
      inicio: startOfWeek(hoje, { weekStartsOn: 1 }), // Segunda-feira
      fim: endOfWeek(hoje, { weekStartsOn: 1 }) // Domingo
    };
  }, []);

  const calcularTotalSemanal = (historico: number[] = []) => {
    // Por enquanto retorna a soma total, mas poderia filtrar por semana
    return historico.reduce((sum: number, val: number) => sum + Number(val), 0);
  };

  const handleAddUserToCasa = useCallback(async (casaId: number) => {
    if (!newUserForm.parceiro_id) {
        toast.error("Selecione um parceiro!");
        return;
    }
    try {
        await addContaParceiro({
            casa_id: casaId,
            parceiro_id: Number(newUserForm.parceiro_id),
            valor_inicial: Number(newUserForm.valor_inicial || 0),
            observacoes: newUserForm.observacoes,
            status: 'ativar',
            data_atualizacao: new Date().toISOString()
        });
        setIsAddingUser(null);
        setNewUserForm({ parceiro_id: '', valor_inicial: '', observacoes: '' });
        toast.success('Conta adicionada!');
        fullReload();
    } catch (error) {
        toast.error("Erro ao adicionar.");
    }
  }, [newUserForm, addContaParceiro, fullReload]);

  const handleUpdateField = useCallback(async (id: number, field: string, val: any) => {
    await updateContaParceiro(id, {
        [field]: val,
        data_atualizacao: new Date().toISOString()
    });
    toast.success('Atualizado!');
  }, [updateContaParceiro]);

  const handleLancarGiro = useCallback(async (contaId: number, valor: number) => {
    const conta = contasParceiros.find((c: any) => c.id === contaId);
    if (!conta) return;

    const historicoAtual = conta.historico_apostas || [];
    const novoHistorico = [...historicoAtual, valor];

    await updateContaParceiro(contaId, {
        historico_apostas: novoHistorico,
        data_atualizacao: new Date().toISOString()
    });
    toast.success(`Giro de ${formatCurrency(valor)} lançado!`);
  }, [contasParceiros, updateContaParceiro]);

  // Preparar dados para a planilha estilo Google Sheets
  const dadosPlanilha = useMemo(() => {
    const linhas: any[] = [];

    casasApostas.forEach(casa => {
      const contasDaCasa = (contasParceiros || []).filter((c: any) => c.casa_id === casa.id);

      if (contasDaCasa.length > 0) {
        contasDaCasa.forEach((conta: any) => {
          const parceiro = parcerias.find(p => p.id === conta.parceiro_id);
          const totalApostado = calcularTotalSemanal(conta.historico_apostas);

          linhas.push({
            casa: casa.nome,
            parceiro: parceiro?.nome || 'N/A',
            valorInicial: conta.valor_inicial || 0,
            totalApostado,
            status: conta.status,
            contaId: conta.id,
            casaId: casa.id
          });
        });
      } else {
        // Linha vazia para casas sem contas
        linhas.push({
          casa: casa.nome,
          parceiro: '',
          valorInicial: 0,
          totalApostado: 0,
          status: '',
          contaId: null,
          casaId: casa.id
        });
      }
    });

    return linhas;
  }, [casasApostas, contasParceiros, parcerias]);

  return (
    <div className="space-y-6 max-w-[2000px] mx-auto pb-20 px-4 font-sans">

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight uppercase">
            Planilha de Contas
          </h1>
          <p className="text-slate-400 text-sm font-sans uppercase tracking-widest mt-2">
            Semana: {format(semanaAtual.inicio, 'dd/MM', { locale: ptBR })} - {format(semanaAtual.fim, 'dd/MM', { locale: ptBR })}
          </p>
        </div>
        <button onClick={() => setIsCasaModalOpen(true)} className="btn-stealth-primary gap-2">
            <Landmark size={18} /> Nova Casa
        </button>
      </div>

      {/* Planilha Stealth Fintech */}
      <div className="stealth-card p-6">
        <div className="overflow-x-auto">
          <table className="stealth-table w-full text-left border-collapse">
            {/* Cabeçalho Stealth */}
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-bold text-white min-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                      <Building2 size={16} className="text-white" />
                    </div>
                    <span className="uppercase tracking-wider">Casa de Aposta</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-bold text-white min-w-[140px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="uppercase tracking-wider">Parceiro</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right font-bold text-white min-w-[140px]">
                  <span className="uppercase tracking-wider">Valor Inicial</span>
                </th>
                <th className="px-6 py-4 text-right font-bold text-white min-w-[160px]">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <span className="uppercase tracking-wider">Total Apostado</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-bold text-white min-w-[120px]">
                  <span className="uppercase tracking-wider">Status</span>
                </th>
                <th className="px-6 py-4 text-center font-bold text-white min-w-[140px]">
                  <span className="uppercase tracking-wider">Ações</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {dadosPlanilha.map((linha, index) => (
                <tr key={`${linha.casaId}-${linha.contaId || index}`} className="hover:bg-slate-800/30 transition-all duration-200">

                  {/* Casa */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center text-sm font-bold text-white">
                        {linha.casa.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white text-lg">{linha.casa}</span>
                      </div>
                    </div>
                  </td>

                  {/* Pessoa */}
                  <td className="px-6 py-4">
                    {linha.parceiro ? (
                      <div>
                        <span className="font-bold text-white text-lg">{linha.parceiro}</span>
                        <div className="text-xs text-slate-400 font-sans uppercase tracking-wider">Parceiro Ativo</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingUser(linha.casaId)}
                        className="btn-stealth-ghost text-sm"
                      >
                        + Adicionar Parceiro
                      </button>
                    )}
                  </td>

                  {/* Valor Inicial */}
                  <td className="px-6 py-4 text-right">
                    {linha.contaId ? (
                      <EditableField
                        id={linha.contaId}
                        field="valor_inicial"
                        val={linha.valorInicial}
                        onSave={handleUpdateField}
                        isCurrency
                      />
                    ) : (
                      <span className="text-slate-500 font-sans">--</span>
                    )}
                  </td>

                  {/* Total Apostado */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-sans font-bold text-emerald-400 text-xl">
                        {formatCurrency(linha.totalApostado)}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">Semana Atual</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {linha.contaId ? (
                      <button
                        onClick={() => handleUpdateField(linha.contaId, 'status', linha.status === 'ativar' ? 'ativado' : 'ativar')}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-bold uppercase border transition-all duration-200",
                          linha.status === 'ativado'
                            ? "status-ativado"
                            : "status-ativar"
                        )}
                      >
                        {linha.status === 'ativado' ? 'ATIVADO' : 'ATIVAR'}
                      </button>
                    ) : (
                      <span className="text-slate-500 font-sans">--</span>
                    )}
                  </td>

                  {/* Lançar Giro */}
                  <td className="px-6 py-4 text-center">
                    {linha.contaId ? (
                      <LancarGiroInput contaId={linha.contaId} onLancarGiro={handleLancarGiro} />
                    ) : (
                      <span className="text-slate-500 font-sans">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Stealth para adicionar pessoa */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="stealth-card w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Adicionar Parceiro
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">Parceiro</label>
                <select
                  value={newUserForm.parceiro_id}
                  onChange={e => setNewUserForm({...newUserForm, parceiro_id: e.target.value})}
                  className="stealth-input w-full"
                >
                  <option value="">Selecione um parceiro...</option>
                  {parcerias.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">Valor Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  value={newUserForm.valor_inicial}
                  onChange={e => setNewUserForm({...newUserForm, valor_inicial: e.target.value})}
                  placeholder="0.00"
                  className="stealth-input w-full text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">Observações</label>
                <input
                  value={newUserForm.observacoes}
                  onChange={e => setNewUserForm({...newUserForm, observacoes: e.target.value})}
                  placeholder="Observações opcionais..."
                  className="stealth-input w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleAddUserToCasa(isAddingUser)}
                className="btn-stealth-primary flex-1"
              >
                Adicionar Parceiro
              </button>
              <button
                onClick={() => setIsAddingUser(null)}
                className="btn-stealth-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <CasaApostaModal
        isOpen={isCasaModalOpen}
        onClose={() => setIsCasaModalOpen(false)}
        onSave={async (data) => { await addCasaAposta({...data, status: 'ativa'}); }}
        existingCasas={casasApostas.map(c => c.nome)}
      />
    </div>
  );
};

const EditableField = memo(({ id, field, val, onSave, isCurrency }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [temp, setTemp] = useState(String(val || 0));
    const save = useCallback(() => { onSave(id, field, temp); setIsEditing(false); }, [onSave, id, field, temp]);

    if (isEditing) return <input autoFocus type="number" step="0.01" value={temp} onChange={e => setTemp(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} className="stealth-input w-28 text-right gpu-accelerated" />;
    return (
        <span onClick={() => setIsEditing(true)} className="font-bold text-white font-sans text-lg cursor-pointer hover:text-emerald-400 transition-colors gpu-accelerated">
            {isCurrency ? formatCurrency(Number(val)) : val}
        </span>
    );
});

const LancarGiroInput = memo(({ contaId, onLancarGiro }: { contaId: number; onLancarGiro: (contaId: number, valor: number) => void }) => {
    const [valor, setValor] = useState('');

    const handleSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && valor) {
            const numValor = Number(valor);
            if (numValor > 0) {
                onLancarGiro(contaId, numValor);
                setValor('');
            }
        }
    }, [valor, contaId, onLancarGiro]);

    return (
        <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={handleSubmit}
            className="stealth-input w-24 text-center gpu-accelerated"
        />
    );
});

export default Ativos;