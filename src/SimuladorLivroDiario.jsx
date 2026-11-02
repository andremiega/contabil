import React, { useState } from 'react';

export default function SimuladorLivroDiario({
  clienteSelecionado,
  userAuth,
  planoContas = [],
  historico = [], 
  supabase,
  mostrarToast,
  tarefaCorrente,
  modo = 'automatico',
  pendencias = [],
  onExcluirLancamento,
  onConcluirPendencia
}) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estados
  const [filtroTexto, setFiltroTexto] = useState('');
  const [abaExibicao, setAbaExibicao] = useState('diario');
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  
  // ESTADO PARA A "COLA" / DICA DO TUTOR
  const [dicaAbertaId, setDicaAbertaId] = useState(null); 

  // Formulário de Novo Lançamento
  const [dataAssento, setDataAssento] = useState(new Date().toISOString().split('T')[0]);
  const [historicoAssento, setHistoricoAssento] = useState('');
  const [contaDebitoId, setContaDebitoId] = useState('');
  const [contaCreditoId, setContaCreditoId] = useState('');
  const [valorAssentoStr, setValorAssentoStr] = useState('');

  // Validação de Equilíbrio
  const valorNumerico = parseFloat(valorAssentoStr) || 0;
  const estaEquilibrado = valorNumerico > 0 && contaDebitoId && contaCreditoId && contaDebitoId !== contaCreditoId;

  // Carrega os dados de uma pendência para o formulário
  const preencherPorPendencia = (item) => {
    setHistoricoAssento(item.descricao || '');
    setValorAssentoStr(String(item.valor || ''));
    
    if (dicaAbertaId === item.id) {
      if (item.debitosSugeridos?.[0]) setContaDebitoId(item.debitosSugeridos[0]);
      if (item.creditosSugeridos?.[0]) setContaCreditoId(item.creditosSugeridos[0]);
    } else {
      setContaDebitoId('');
      setContaCreditoId('');
    }

    setAbaExibicao('novo');
    if (typeof mostrarToast === 'function') mostrarToast('Dados da pendência carregados no formulário!', 'aviso');
  };

  const obterNomesContas = (idsArray) => {
    if (!idsArray || idsArray.length === 0) return 'Conta a definir';
    return idsArray.map(id => {
      const c = planoContas.find(conta => conta.id === id);
      return c ? `${c.codigo_contabil} - ${c.nome_conta}` : 'Conta não encontrada';
    }).join(' / ');
  };

  const handleGravarLancamento = async (e) => {
    e.preventDefault();
    if (!estaEquilibrado) return alert('O lançamento exige uma conta a débito, uma a crédito distintas e um valor válido.');
    if (!historicoAssento.trim()) return alert('Informe o histórico descritivo.');

    setSalvando(true);
    try {
      const historicoComIdentificador = `${historicoAssento.trim()} [ID: ${userAuth?.id || 'anon'}]`;

      const { error } = await supabase
        .from('lancamentos_diario')
        .insert([{
          id_cliente: clienteSelecionado?.id,
          data_lancamento: dataAssento,
          id_conta_debito: contaDebitoId,
          id_conta_credito: contaCreditoId,
          valor: valorNumerico,
          historico: historicoComIdentificador
        }]);

      if (error) throw error;

      if (typeof mostrarToast === 'function') mostrarToast('Partida dobrada escriturada com sucesso!', 'sucesso');

      setHistoricoAssento('');
      setValorAssentoStr('');
      setContaDebitoId('');
      setContaCreditoId('');
      setDicaAbertaId(null); 
      setAbaExibicao('diario');

      if (typeof onConcluirPendencia === 'function') onConcluirPendencia(valorNumerico);
    } catch (err) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao gravar: ' + err.message, 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirLinha = async (idLancamento) => {
    if (!window.confirm('Deseja excluir este lançamento contábil permanentemente?')) return;
    setExcluindoId(idLancamento);
    try {
      const { error } = await supabase.from('lancamentos_diario').delete().eq('id', idLancamento);
      if (error) throw error;
      if (typeof mostrarToast === 'function') mostrarToast('Lançamento removido do diário!', 'sucesso');
      if (typeof onExcluirLancamento === 'function') onExcluirLancamento(idLancamento);
    } catch (err) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao remover: ' + err.message, 'erro');
    } finally {
      setExcluindoId(null);
    }
  };

  const totalLivro = historico.reduce((acc, cur) => acc + (cur.valor || 0), 0);
  const lancamentosFiltrados = historico.filter(l => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (l.historico || '').toLowerCase().includes(txt) || 
           (l.nomeDebito || '').toLowerCase().includes(txt) || (l.debito || '').includes(txt) ||
           (l.nomeCredito || '').toLowerCase().includes(txt) || (l.credito || '').includes(txt);
  });

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>📖</span> Livro Diário & Partidas Dobradas
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            Escrituração oficial (ITG 2000) • 
            <span style={{ backgroundColor: modo === 'automatico' ? '#dcfce7' : '#fef3c7', color: modo === 'automatico' ? '#166534' : '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
              {modo === 'automatico' ? '⚙️ Automático' : '✍️ Manual'}
            </span>
          </p>
        </div>

        {/* NAVEGAÇÃO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaExibicao('diario')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: abaExibicao === 'diario' ? '#0f172a' : 'transparent', color: abaExibicao === 'diario' ? 'white' : '#64748b' }}>
            📋 Livro Diário ({historico.length})
          </button>
          <button onClick={() => setAbaExibicao('novo')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: abaExibicao === 'novo' ? '#2563eb' : 'transparent', color: abaExibicao === 'novo' ? 'white' : '#64748b' }}>
            ✍️ Novo Assento
          </button>
        </div>
      </div>

      {/* FILA DE PENDÊNCIAS (MODO MANUAL) */}
      {modo === 'manual' && pendencias.length > 0 && abaExibicao === 'diario' && (
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '20px' }}>🦉</span>
            <strong style={{ fontSize: '14px', color: '#92400e', wordBreak: 'break-word' }}>
              Fatos Geradores Pendentes ({pendencias.length}):
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
            {pendencias.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#ffffff', border: '1px solid #fcd34d', borderRadius: '12px', overflow: 'hidden', boxSizing: 'border-box' }}>
                
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{item.descricao}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', wordBreak: 'break-word' }}>Módulo: {item.modulo} | Gerado em: {item.data}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#dc2626', wordBreak: 'break-word' }}>R$ {formatMoeda(item.valor)}</span>
                    
                    <button 
                      onClick={() => setDicaAbertaId(dicaAbertaId === item.id ? null : item.id)}
                      style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}
                    >
                      {dicaAbertaId === item.id ? 'Ocultar Dica' : '💡 Pedir Ajuda'}
                    </button>

                    <button onClick={() => preencherPorPendencia(item)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                      Resolver ✍️
                    </button>
                  </div>
                </div>

                {/* DICA REVELADA */}
                {dicaAbertaId === item.id && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderTop: '1px dashed #cbd5e1', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '16px' }}>🦉</span>
                      <strong style={{ fontSize: '12px', color: '#334155', wordBreak: 'break-word' }}>Dica do Auditor (Gabarito da Operação):</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '8px', boxSizing: 'border-box', minWidth: 0 }}>
                        <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DÉBITO SUGERIDO:</span>
                        <span style={{ fontSize: '11.5px', color: '#064e3b', fontWeight: 'bold', wordBreak: 'break-word' }}>{obterNomesContas(item.debitosSugeridos)}</span>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', boxSizing: 'border-box', minWidth: 0 }}>
                        <span style={{ fontSize: '10.5px', color: '#b91c1c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CRÉDITO SUGERIDO:</span>
                        <span style={{ fontSize: '11.5px', color: '#7f1d1d', fontWeight: 'bold', wordBreak: 'break-word' }}>{obterNomesContas(item.creditosSugeridos)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARDS DE CONTROLE E EQUILÍBRIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Volume de Assentos</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{historico.length} Lançamentos</strong>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Débito (Σ D)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totalLivro)}</strong>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Crédito (Σ C)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totalLivro)}</strong>
        </div>
      </div>

      {/* 1. EXIBIÇÃO FORMAL DO LIVRO DIÁRIO */}
      {abaExibicao === 'diario' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <input type="text" placeholder="Pesquisar por histórico, conta ou código..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} style={{ ...inputStyle, flex: '1 1 250px' }} />
            {filtroTexto && <button onClick={() => setFiltroTexto('')} style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 'bold' }}>Limpar</button>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
            {lancamentosFiltrados.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>Nenhum lançamento encontrado.</div>
            ) : (
              lancamentosFiltrados.map((item, index) => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden', boxSizing: 'border-box' }}>
                  
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                      <span style={{ backgroundColor: '#0f172a', color: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Assento nº {String(historico.length - index).padStart(4, '0')}</span>
                      <strong style={{ color: '#475569', wordBreak: 'break-word' }}>Data: {new Date(item.data).toLocaleDateString('pt-BR')}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                      <strong style={{ color: '#0f172a', fontSize: '13px', wordBreak: 'break-word' }}>Valor: {formatMoeda(item.valor)}</strong>
                      <button onClick={() => handleExcluirLinha(item.id)} disabled={excluindoId === item.id} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#dc2626', opacity: excluindoId === item.id ? 0.5 : 1 }}>🗑️</button>
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '320px' }}>
                      <tbody>
                        <tr style={{ color: '#1e3a8a' }}>
                          <td style={{ padding: '6px 0', width: '24px', fontWeight: 'bold', color: '#2563eb' }}>D:</td>
                          <td style={{ padding: '6px 0', fontWeight: '600', wordBreak: 'break-word' }}>{item.debito} - {item.nomeDebito}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(item.valor)}</td>
                        </tr>
                        <tr style={{ color: '#0f172a' }}>
                          <td style={{ padding: '6px 0', width: '24px', fontWeight: 'bold', color: '#dc2626', paddingLeft: '10px' }}>C:</td>
                          <td style={{ padding: '6px 0', paddingLeft: '10px', wordBreak: 'break-word' }}>{item.credito} - {item.nomeCredito}</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(item.valor)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '11.5px', color: '#475569', fontStyle: 'italic', wordBreak: 'break-word' }}>
                      <strong>Histórico:</strong> {item.historico?.replace(/\[ID:.*\]/, '')}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. FORMULÁRIO DE NOVO ASSENTO CONTÁBIL */}
      {abaExibicao === 'novo' && (
        <form onSubmit={handleGravarLancamento} style={{ animation: 'fadeIn 0.3s', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          
          <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>Novo Assento no Livro Diário (Partidas Dobradas)</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Assento nº {String(historico.length + 1).padStart(4, '0')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Data da Operação Contábil:</label>
              <input type="date" value={dataAssento} onChange={e => setDataAssento(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Auditor de Equilíbrio das Partidas:</label>
              <div style={{ marginTop: '4px', padding: '10px 12px', borderRadius: '8px', backgroundColor: estaEquilibrado ? '#f0fdf4' : '#fff5f5', border: `1px solid ${estaEquilibrado ? '#86efac' : '#fecaca'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '11px', color: estaEquilibrado ? '#166534' : '#991b1b', fontWeight: 'bold', wordBreak: 'break-word' }}>
                  {estaEquilibrado ? '✅ Equilibrado' : '🚨 Incompleto'}
                </span>
                <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 'bold', wordBreak: 'break-word' }}>
                  Σ D=C: {formatMoeda(valorNumerico)}
                </span>
              </div>
            </div>
          </div>

          {/* CONTAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
            
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
              <strong style={{ fontSize: '13px', color: '#1e3a8a', display: 'block', marginBottom: '8px', wordBreak: 'break-word' }}>Conta a DÉBITO (Aplicação):</strong>
              <select value={contaDebitoId} onChange={e => setContaDebitoId(e.target.value)} required style={{ ...inputStyle, backgroundColor: 'white' }}>
                <option value="">-- Selecione a conta de débito --</option>
                {planoContas.map(p => <option key={`d-${p.id}`} value={p.id}>{p.codigo_contabil} - {p.nome_conta}</option>)}
              </select>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: '4px solid #dc2626', boxSizing: 'border-box', minWidth: 0 }}>
              <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block', marginBottom: '8px', wordBreak: 'break-word' }}>Conta a CRÉDITO (Origem):</strong>
              <select value={contaCreditoId} onChange={e => setContaCreditoId(e.target.value)} required style={{ ...inputStyle, backgroundColor: 'white' }}>
                <option value="">-- Selecione a conta de crédito --</option>
                {planoContas.map(p => <option key={`c-${p.id}`} value={p.id}>{p.codigo_contabil} - {p.nome_conta}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Valor Total da Operação (R$):</label>
              <input type="number" step="0.01" min="0.01" placeholder="Ex: 1500.00" value={valorAssentoStr} onChange={e => setValorAssentoStr(e.target.value)} required style={{ ...inputStyle, fontWeight: 'bold' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Histórico Padronizado do Fato Contábil:</label>
              <input type="text" placeholder="Descreva o documento (NF-e, recibo...)" value={historicoAssento} onChange={e => setHistoricoAssento(e.target.value)} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <button type="button" onClick={() => setAbaExibicao('diario')} style={{ padding: '10px 18px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>
              Cancelar
            </button>
            <button type="submit" disabled={!estaEquilibrado || salvando} style={{ padding: '10px 22px', backgroundColor: estaEquilibrado && !salvando ? '#16a34a' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: estaEquilibrado && !salvando ? 'pointer' : 'not-allowed', boxShadow: estaEquilibrado ? '0 4px 10px rgba(22,163,74,0.3)' : 'none', fontSize: '12.5px', boxSizing: 'border-box', width: '100%', maxWidth: '240px' }}>
              {salvando ? 'A Gravar...' : 'Gravar Assento no Diário 💾'}
            </button>
          </div>
        </form>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}