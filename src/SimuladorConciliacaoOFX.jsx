import React, { useState, useMemo } from 'react';

export default function SimuladorConciliacaoOFX({ mostrarToast, registrarFatoGerador, planoContas = [], historicoDiario = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Simulação de Extrato OFX importado do Banco
  const [extratoOfx, setExtratoOfx] = useState([
    { id: 'ofx-1', data: '2026-10-01', descricao: 'PIX Recebido - Cliente Alfa', valor: 15000.00, tipo: 'credito', conciliado: true },
    { id: 'ofx-2', data: '2026-10-05', descricao: 'TED Fornecedor de Insumos', valor: -8500.00, tipo: 'debito', conciliado: false },
    { id: 'ofx-3', data: '2026-10-10', descricao: 'Tarifa Manutenção Conta Corrente', valor: -45.90, tipo: 'debito', conciliado: false },
    { id: 'ofx-4', data: '2026-10-15', descricao: 'Rendimento Aplicação Financeira', valor: 320.50, tipo: 'credito', conciliado: false },
    { id: 'ofx-5', data: '2026-10-20', descricao: 'Pagamento Concessionária de Energia', valor: -1250.00, tipo: 'debito', conciliado: false }
  ]);

  const [filtroStatus, setFiltroStatus] = useState('pendentes');
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);

  // Estados para inserção de nova movimentação
  const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValorStr, setNovoValorStr] = useState('');
  const [novoTipo, setNovoTipo] = useState('debito');

  const saldoExtratoBanco = useMemo(() => {
    return extratoOfx.reduce((acc, item) => acc + item.valor, 0);
  }, [extratoOfx]);

  const handleAdicionarMovimento = (e) => {
    e.preventDefault();
    const val = parseFloat(novoValorStr) || 0;
    if (!novaDescricao.trim() || val <= 0) return alert('Preencha a descrição e um valor válido.');

    const valorFinal = novoTipo === 'debito' ? -Math.abs(val) : Math.abs(val);

    const novoItem = {
      id: 'ofx-' + Date.now(),
      data: novaData,
      descricao: novaDescricao,
      valor: valorFinal,
      tipo: novoTipo,
      conciliado: false
    };

    setExtratoOfx(prev => [novoItem, ...prev]);
    setNovaDescricao('');
    setNovoValorStr('');
    if (mostrarToast) mostrarToast('Nova movimentação adicionada ao extrato!', 'sucesso');
  };

  const handleCarregarExemploPratico = () => {
    const exemplo = {
      id: 'ofx-' + Date.now(),
      data: new Date().toISOString().split('T')[0],
      descricao: 'Tarifa Pix Não Cadastrada (Exemplo Didático)',
      valor: -15.00,
      tipo: 'debito',
      conciliado: false
    };
    setExtratoOfx(prev => [exemplo, ...prev]);
    if (mostrarToast) mostrarToast('Exemplo prático injetado no extrato!', 'sucesso');
  };

  // ==========================================================
  // MOTOR DE INTEGRAÇÃO CONTÁBIL COM O DIÁRIO (CORRIGIDO)
  // ==========================================================
  const handleConciliarEGerarFato = (itemOfx) => {
    if (typeof registrarFatoGerador !== 'function') {
      console.error("registrarFatoGerador não está disponível.");
      return;
    }

    const cSafe = planoContas || [];
    
    const contaBanco = cSafe.find(c => 
      c.codigo_contabil === '1.1.01.02' || 
      (c.nome_conta || '').toLowerCase().includes('banco')
    ) || cSafe[0];

    const contaDespesa = cSafe.find(c => 
      c.codigo_contabil === '5.2.02.02' || 
      (c.nome_conta || '').toLowerCase().includes('tarifa') || 
      (c.nome_conta || '').toLowerCase().includes('despesa')
    ) || contaBanco;

    const contaReceita = cSafe.find(c => 
      c.codigo_contabil === '4.1.01.02' || 
      (c.nome_conta || '').toLowerCase().includes('receita')
    ) || contaBanco;

    const valorAbs = Math.abs(itemOfx.valor);

    if (itemOfx.valor < 0) {
      registrarFatoGerador(
        `Ajuste OFX: ${itemOfx.descricao}`, 
        valorAbs, 
        'Conciliação Bancária', 
        [contaDespesa?.id], 
        [contaBanco?.id]
      );
    } else {
      registrarFatoGerador(
        `Ajuste OFX: ${itemOfx.descricao}`, 
        valorAbs, 
        'Conciliação Bancária', 
        [contaBanco?.id], 
        [contaReceita?.id]
      );
    }

    setExtratoOfx(prev => prev.map(l => l.id === itemOfx.id ? { ...l, conciliado: true } : l));

    if (mostrarToast) {
      mostrarToast(`"${itemOfx.descricao}" conciliado e enviado ao Livro Diário!`, 'sucesso');
    }
  };

  const itensExibidos = extratoOfx.filter(item => filtroStatus === 'todos' || !item.conciliado);

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>📑</span> Conciliação Bancária OFX & Ajustes
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Cruzamento do Extrato Bancário com o Livro Diário, identificação de divergências e escrituração por partidas dobradas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setMostrarExplicacao(!mostrarExplicacao)}
            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {mostrarExplicacao ? '📖 Ocultar Explicação' : '💡 Como Funciona'}
          </button>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px', boxSizing: 'border-box' }}>
            <button 
              onClick={() => setFiltroStatus('pendentes')}
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: filtroStatus === 'pendentes' ? '#2563eb' : 'transparent', color: filtroStatus === 'pendentes' ? 'white' : '#64748b' }}
            >
              🔴 Pendentes ({extratoOfx.filter(i => !i.conciliado).length})
            </button>
            <button 
              onClick={() => setFiltroStatus('todos')}
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: filtroStatus === 'todos' ? '#0f172a' : 'transparent', color: filtroStatus === 'todos' ? 'white' : '#64748b' }}
            >
              📋 Completo
            </button>
          </div>
        </div>
      </div>

      {mostrarExplicacao && (
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px', marginBottom: '20px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14.5px', color: '#1e3a8a' }}>📘 Guia Prático de Conciliação Bancária</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
            O extrato OFX traz a realidade do banco. Ao identificar tarifas ou rendimentos não escriturados, clique em <em>"Conciliar & Lançar no Diário"</em> para gerar automaticamente as partidas dobradas.
          </p>
          <button 
            onClick={handleCarregarExemploPratico}
            style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✨ Injetar Exemplo Prático no Extrato
          </button>
        </div>
      )}

      {/* DASHBOARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Final no Extrato (OFX)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '20px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(saldoExtratoBanco)}</strong>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Itens Já Conciliados</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '20px', marginTop: '4px', wordBreak: 'break-word' }}>{extratoOfx.filter(i => i.conciliado).length} de {extratoOfx.length}</strong>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Divergências Pendentes</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '20px', marginTop: '4px', wordBreak: 'break-word' }}>{extratoOfx.filter(i => !i.conciliado).length} itens</strong>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleAdicionarMovimento} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
          Inserir Movimentação no Extrato OFX
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <label htmlFor="ofxData" style={labelStyle}>Data:</label>
            <input id="ofxData" name="ofxData" autoComplete="off" type="date" value={novaData} onChange={e => setNovaData(e.target.value)} style={inputStyle} required />
          </div>

          <div style={{ minWidth: 0 }}>
            <label htmlFor="ofxTipo" style={labelStyle}>Tipo de Movimento:</label>
            <select id="ofxTipo" name="ofxTipo" autoComplete="off" value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', fontWeight: 'bold' }}>
              <option value="debito">Débito (Saída / Tarifa)</option>
              <option value="credito">Crédito (Entrada / Recebimento)</option>
            </select>
          </div>

          <div style={{ minWidth: 0 }}>
            <label htmlFor="ofxValor" style={{ ...labelStyle, color: '#0f172a' }}>Valor (R$):</label>
            <input id="ofxValor" name="ofxValor" autoComplete="off" type="text" value={novoValorStr} onChange={e => setNovoValorStr(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Ex: 150.00" style={inputStyle} required />
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <label htmlFor="ofxDescricao" style={labelStyle}>Histórico / Descrição no Banco:</label>
          <input id="ofxDescricao" name="ofxDescricao" autoComplete="off" type="text" value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} placeholder="Ex: Tarifa de TED, Juros sobre Capital..." style={inputStyle} required />
        </div>

        <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxSizing: 'border-box' }}>
          Adicionar Movimento ao Extrato 📥
        </button>
      </form>

      {/* TABELA */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', wordBreak: 'break-word' }}>Extrato Bancário (Movimentações OFX)</h3>
        </div>

        <div style={{ overflowX: 'auto', backgroundColor: 'white', boxSizing: 'border-box' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '500px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
              <tr>
                <th style={{ padding: '10px 14px' }}>Data</th>
                <th style={{ padding: '10px 14px' }}>Histórico / Descrição no Banco</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Valor (R$)</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Ação Contábil</th>
              </tr>
            </thead>
            <tbody>
              {itensExibidos.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Nenhum lançamento pendente encontrado. Tudo conciliado! 🎉</td></tr>
              ) : (
                itensExibidos.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: item.conciliado ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{item.descricao}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: item.valor >= 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {item.valor >= 0 ? `+${formatMoeda(item.valor)}` : formatMoeda(item.valor)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px', backgroundColor: item.conciliado ? '#f0fdf4' : '#fff5f5', color: item.conciliado ? '#166534' : '#991b1b', border: `1px solid ${item.conciliado ? '#86efac' : '#fecaca'}` }}>
                        {item.conciliado ? '✅ Conciliado' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {!item.conciliado ? (
                        <button 
                          onClick={() => handleConciliarEGerarFato(item)}
                          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Conciliar & Lançar ⚙️
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Escriturado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}