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
    
    // Se o aluno já abriu a dica, podemos preencher as contas automaticamente
    if (dicaAbertaId === item.id) {
      if (item.debitosSugeridos?.[0]) setContaDebitoId(item.debitosSugeridos[0]);
      if (item.creditosSugeridos?.[0]) setContaCreditoId(item.creditosSugeridos[0]);
    } else {
      setContaDebitoId('');
      setContaCreditoId('');
    }

    setAbaExibicao('novo');
    if (mostrarToast) mostrarToast('Dados da pendência carregados no formulário!', 'aviso');
  };

  // Helper para traduzir IDs de contas em Nomes para a Dica do Tutor
  const obterNomesContas = (idsArray) => {
    if (!idsArray || idsArray.length === 0) return 'Conta a definir pelo aluno';
    return idsArray.map(id => {
      const c = planoContas.find(conta => conta.id === id);
      return c ? `${c.codigo_contabil} - ${c.nome_conta}` : 'Conta não encontrada';
    }).join(' / ');
  };

  // Gravar no Supabase
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
          id_cliente: clienteSelecionado.id,
          data_lancamento: dataAssento,
          id_conta_debito: contaDebitoId,
          id_conta_credito: contaCreditoId,
          valor: valorNumerico,
          historico: historicoComIdentificador
        }]);

      if (error) throw error;

      if (mostrarToast) mostrarToast('Partida dobrada escriturada com sucesso!', 'sucesso');

      setHistoricoAssento('');
      setValorAssentoStr('');
      setContaDebitoId('');
      setContaCreditoId('');
      setDicaAbertaId(null); // Fecha a dica se estiver aberta
      setAbaExibicao('diario');

      if (typeof onConcluirPendencia === 'function') onConcluirPendencia(valorNumerico);
    } catch (err) {
      if (mostrarToast) mostrarToast('Erro ao gravar: ' + err.message, 'erro');
    } finally {
      setSalvando(false);
    }
  };

  // Excluir Lançamento
  const handleExcluirLinha = async (idLancamento) => {
    if (!window.confirm('Deseja excluir este lançamento contábil permanentemente?')) return;
    setExcluindoId(idLancamento);
    try {
      const { error } = await supabase.from('lancamentos_diario').delete().eq('id', idLancamento);
      if (error) throw error;
      if (mostrarToast) mostrarToast('Lançamento removido do diário!', 'sucesso');
      if (typeof onExcluirLancamento === 'function') onExcluirLancamento(idLancamento);
    } catch (err) {
      if (mostrarToast) mostrarToast('Erro ao remover: ' + err.message, 'erro');
    } finally {
      setExcluindoId(null);
    }
  };

  // Totais Gerais e Filtros
  const totalLivro = historico.reduce((acc, cur) => acc + (cur.valor || 0), 0);
  const lancamentosFiltrados = historico.filter(l => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (l.historico || '').toLowerCase().includes(txt) || 
           (l.nomeDebito || '').toLowerCase().includes(txt) || (l.debito || '').includes(txt) ||
           (l.nomeCredito || '').toLowerCase().includes(txt) || (l.credito || '').includes(txt);
  });

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📖</span> Livro Diário Geral & Auditoria de Partidas Dobradas
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Escrituração oficial conforme ITG 2000 (R1) • 
            <span style={{ backgroundColor: modo === 'automatico' ? '#dcfce7' : '#fef3c7', color: modo === 'automatico' ? '#166534' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              {modo === 'automatico' ? '⚙️ Modo Automático' : '✍️ Modo Manual'}
            </span>
          </p>
        </div>

        {/* NAVEGAÇÃO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button onClick={() => setAbaExibicao('diario')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: abaExibicao === 'diario' ? '#0f172a' : 'transparent', color: abaExibicao === 'diario' ? 'white' : '#64748b' }}>
            📋 Livro Diário ({historico.length})
          </button>
          <button onClick={() => setAbaExibicao('novo')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: abaExibicao === 'novo' ? '#2563eb' : 'transparent', color: abaExibicao === 'novo' ? 'white' : '#64748b' }}>
            ✍️ Novo Assento Contábil
          </button>
        </div>
      </div>

      {/* FILA DE PENDÊNCIAS (MODO MANUAL) */}
      {modo === 'manual' && pendencias.length > 0 && abaExibicao === 'diario' && (
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>🦉</span>
            <strong style={{ fontSize: '14px', color: '#92400e' }}>
              Fatos Geradores Pendentes de Escrituração ({pendencias.length}):
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendencias.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#ffffff', border: '1px solid #fcd34d', borderRadius: '8px', overflow: 'hidden' }}>
                
                {/* Linha Principal da Pendência */}
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.descricao}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Módulo: {item.modulo} • Gerado em: {item.data}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>R$ {formatMoeda(item.valor)}</span>
                    
                    {/* Botão de Ajuda (A Cola) */}
                    <button 
                      onClick={() => setDicaAbertaId(dicaAbertaId === item.id ? null : item.id)}
                      style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {dicaAbertaId === item.id ? 'Ocultar Dica' : '💡 Pedir Ajuda'}
                    </button>

                    <button onClick={() => preencherPorPendencia(item)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Resolver ✍️
                    </button>
                  </div>
                </div>

                {/* Painel da Dica Revelada (Gabarito) */}
                {dicaAbertaId === item.id && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderTop: '1px dashed #cbd5e1', animation: 'fadeIn 0.3s' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🦉</span>
                      <strong style={{ fontSize: '12px', color: '#334155' }}>Dica do Auditor (Gabarito da Operação):</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                      <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DÉBITO SUGERIDO:</span>
                        <span style={{ fontSize: '12px', color: '#064e3b', fontWeight: 'bold' }}>{obterNomesContas(item.debitosSugeridos)}</span>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CRÉDITO SUGERIDO:</span>
                        <span style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: 'bold' }}>{obterNomesContas(item.creditosSugeridos)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
                      * Se clicar em "Resolver" agora, o formulário já virá com as contas pré-preenchidas para você analisar.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARDS DE CONTROLE E EQUILÍBRIO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Volume Total de Assentos</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{historico.length} Lançamentos</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Exercício Ativo</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Débito (Σ D)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totalLivro)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Aplicações de Recursos</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Crédito (Σ C)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totalLivro)}</strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Origens de Recursos</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ABA: EXIBIÇÃO FORMAL DO LIVRO DIÁRIO                  */}
      {/* ========================================================= */}
      {abaExibicao === 'diario' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          
          <div style={{ marginBottom: '18px', display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Pesquisar por histórico, conta ou código contábil..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            {filtroTexto && <button onClick={() => setFiltroTexto('')} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Limpar Filtro</button>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {lancamentosFiltrados.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>Nenhum lançamento encontrado.</div>
            ) : (
              lancamentosFiltrados.map((item, index) => (
                <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ backgroundColor: '#0f172a', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Assento nº {String(historico.length - index).padStart(4, '0')}</span>
                      <strong style={{ color: '#475569' }}>Data: {new Date(item.data).toLocaleDateString('pt-BR')}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '13px' }}>Valor: {formatMoeda(item.valor)}</strong>
                      <button onClick={() => handleExcluirLinha(item.id)} disabled={excluindoId === item.id} title="Excluir Lançamento" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#dc2626', opacity: excluindoId === item.id ? 0.5 : 1 }}>🗑️</button>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <tbody>
                        <tr style={{ color: '#1e3a8a' }}>
                          <td style={{ padding: '4px 0', width: '30px', fontWeight: 'bold', color: '#2563eb' }}>D:</td>
                          <td style={{ padding: '4px 0', fontWeight: '600' }}>{item.debito} - {item.nomeDebito}</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{formatMoeda(item.valor)}</td>
                        </tr>
                        <tr style={{ color: '#0f172a' }}>
                          <td style={{ padding: '4px 0', width: '30px', fontWeight: 'bold', color: '#dc2626', paddingLeft: '10px' }}>C:</td>
                          <td style={{ padding: '4px 0', paddingLeft: '10px' }}>{item.credito} - {item.nomeCredito}</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{formatMoeda(item.valor)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', fontSize: '11px', color: '#475569', fontStyle: 'italic' }}>
                      <strong>Histórico:</strong> {item.historico?.replace(/\[ID:.*\]/, '')}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: FORMULÁRIO DE NOVO ASSENTO CONTÁBIL               */}
      {/* ========================================================= */}
      {abaExibicao === 'novo' && (
        <form onSubmit={handleGravarLancamento} style={{ animation: 'fadeIn 0.3s', backgroundColor: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Novo Assento no Livro Diário (Partidas Dobradas)</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Assento nº {String(historico.length + 1).padStart(4, '0')}</span>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Data da Operação Contábil:
              <input type="date" value={dataAssento} onChange={e => setDataAssento(e.target.value)} required style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>

            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Auditor de Equilíbrio das Partidas:
              <div style={{ marginTop: '4px', padding: '8px 12px', borderRadius: '6px', backgroundColor: estaEquilibrado ? '#f0fdf4' : '#fff5f5', border: `1px solid ${estaEquilibrado ? '#86efac' : '#fecaca'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: estaEquilibrado ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                  {estaEquilibrado ? '✅ Partidas Perfeitamente Equilibradas' : `🚨 Preencha Débito, Crédito e Valor`}
                </span>
                <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 'bold' }}>
                  Σ D: {formatMoeda(valorNumerico)} | Σ C: {formatMoeda(valorNumerico)}
                </span>
              </div>
            </div>
          </div>

          {/* CONTAS */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* DÉBITO */}
            <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #2563eb' }}>
              <strong style={{ fontSize: '13px', color: '#1e3a8a', display: 'block', marginBottom: '10px' }}>Conta a DÉBITO (Aplicação de Recurso):</strong>
              <select value={contaDebitoId} onChange={e => setContaDebitoId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="">-- Selecione a conta de débito --</option>
                {planoContas.map(p => <option key={`d-${p.id}`} value={p.id}>{p.codigo_contabil} - {p.nome_conta}</option>)}
              </select>
            </div>
            {/* CRÉDITO */}
            <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #dc2626' }}>
              <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block', marginBottom: '10px' }}>Conta a CRÉDITO (Origem de Recurso):</strong>
              <select value={contaCreditoId} onChange={e => setContaCreditoId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="">-- Selecione a conta de crédito --</option>
                {planoContas.map(p => <option key={`c-${p.id}`} value={p.id}>{p.codigo_contabil} - {p.nome_conta}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Valor Total da Operação (R$):
              <input type="number" step="0.01" min="0.01" placeholder="Ex: 1500.00" value={valorAssentoStr} onChange={e => setValorAssentoStr(e.target.value)} required style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold' }} />
            </label>
            <label style={{ flex: 3, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Histórico Padronizado do Fato Contábil:
              <input type="text" placeholder="Descreva o documento hábil (NF-e, recibo, etc.)..." value={historicoAssento} onChange={e => setHistoricoAssento(e.target.value)} required style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setAbaExibicao('diario')} style={{ padding: '12px 20px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={!estaEquilibrado || salvando} style={{ padding: '12px 24px', backgroundColor: estaEquilibrado && !salvando ? '#16a34a' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: estaEquilibrado && !salvando ? 'pointer' : 'not-allowed', boxShadow: estaEquilibrado ? '0 4px 10px rgba(22,163,74,0.3)' : 'none' }}>
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