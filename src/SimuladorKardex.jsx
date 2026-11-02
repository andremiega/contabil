import React, { useState, useEffect } from 'react';

export default function SimuladorKardex({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [movimentacoesRaw, setMovimentacoesRaw] = useState([]);

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'entrada',
    origem: 'compra', // 'compra' ou 'producao'
    produto: '',
    quant: '',
    valorUnit: '',
    nf: ''
  });

  const [tabelaProcessada, setTabelaProcessada] = useState([]);
  const [totais, setTotais] = useState({ saldoQtd: 0, saldoValor: 0, custoMedio: 0, cmvAcumulado: 0 });

  // Motor de Cálculo do Kardex (Custo Médio Ponderado)
  useEffect(() => {
    let saldoQtd = 0;
    let saldoValor = 0;
    let cmvAcc = 0;
    
    const movsOrdenadas = [...movimentacoesRaw].sort((a, b) => a.id - b.id);

    const linhas = movsOrdenadas.map(mov => {
      if (mov.tipo === 'entrada') {
        const totalEntrada = mov.quant * mov.valorUnit;
        saldoQtd += mov.quant;
        saldoValor += totalEntrada;
        const custoMedio = saldoQtd > 0 ? saldoValor / saldoQtd : 0;
        
        return {
          ...mov,
          inQ: mov.quant, inU: mov.valorUnit, inT: totalEntrada,
          outQ: 0, outU: 0, outT: 0,
          salQ: saldoQtd, salU: custoMedio, salT: saldoValor
        };
      } else {
        const custoMedioAtual = saldoQtd > 0 ? (saldoValor / saldoQtd) : 0;
        const totalSaida = mov.quant * custoMedioAtual;
        
        saldoQtd -= mov.quant;
        saldoValor -= totalSaida;
        if (saldoQtd === 0) saldoValor = 0; 
        cmvAcc += totalSaida;

        return {
          ...mov,
          inQ: 0, inU: 0, inT: 0,
          outQ: mov.quant, outU: custoMedioAtual, outT: totalSaida,
          salQ: saldoQtd, salU: saldoQtd > 0 ? custoMedioAtual : 0, salT: saldoValor
        };
      }
    });

    setTabelaProcessada(linhas);
    setTotais({
      saldoQtd,
      saldoValor,
      custoMedio: saldoQtd > 0 ? saldoValor / saldoQtd : 0,
      cmvAcumulado: cmvAcc
    });
  }, [movimentacoesRaw]);

  const handleAddMovimento = (e) => {
    e.preventDefault();
    
    const quant = Number(form.quant);
    const valorUnit = Number(form.valorUnit);

    if (quant <= 0) return alert("A quantidade deve ser maior que zero.");
    if (!form.produto.trim()) return alert("Informe o nome do produto.");
    
    if (form.tipo === 'saida' && quant > totais.saldoQtd) {
      return alert(`Estoque insuficiente! Você tem apenas ${totais.saldoQtd} unidades disponíveis.`);
    }
    if (form.tipo === 'entrada' && valorUnit <= 0) {
      return alert("Informe o custo unitário de entrada.");
    }

    const valorTotalOperacao = form.tipo === 'entrada' ? (quant * valorUnit) : (quant * totais.custoMedio);

    if (typeof registrarFatoGerador === 'function') {
      const idEstoque = planoContas.find(c => c.nome_conta.toLowerCase().includes('estoque'))?.id;
      const idFornecedor = planoContas.find(c => c.nome_conta.toLowerCase().includes('fornecedor'))?.id;
      const idCmv = planoContas.find(c => c.nome_conta.toLowerCase().includes('cmv') || c.nome_conta.toLowerCase().includes('cpv'))?.id;

      if (form.tipo === 'entrada') {
        const descricaoHist = form.origem === 'producao' 
          ? `Entrada de Produto Acabado ref. OP - ${form.produto}`
          : `Aquisição de Estoque (${form.produto}) conf. ${form.nf}`;

        registrarFatoGerador(
          descricaoHist,
          valorTotalOperacao,
          'Estoque (Kardex)',
          [idEstoque], 
          [idFornecedor] 
        );
      } else {
        registrarFatoGerador(
          `Baixa de Estoque e CMV (${form.produto}) conf. ${form.nf}`,
          valorTotalOperacao,
          'Estoque (Kardex)',
          [idCmv], 
          [idEstoque] 
        );
      }
    }

    setMovimentacoesRaw([...movimentacoesRaw, { 
      id: Date.now(), 
      data: form.data, 
      tipo: form.tipo, 
      origem: form.origem,
      produto: form.produto,
      historico: form.nf,
      quant, 
      valorUnit: form.tipo === 'entrada' ? valorUnit : 0 
    }]);

    if (typeof mostrarToast === 'function') mostrarToast(`Operação de ${form.tipo} registrada e Fato Contábil gerado!`, 'sucesso');
    setForm({ ...form, quant: '', valorUnit: '', nf: '', produto: '' });
  };

  const handleRemover = (id) => {
    setMovimentacoesRaw(movimentacoesRaw.filter(m => m.id !== id));
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>📦</span> Ficha de Controle de Estoque (Kardex)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Apuramento dinâmico do Custo da Mercadoria Vendida (CMV) e integração de Produtos Acabados.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '8px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#475569' }}>Custeio:</span>
          <span style={{ backgroundColor: '#1e293b', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>Custo Médio Ponderado</span>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Estoque Atual</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{totais.saldoQtd} un.</strong>
        </div>
        
        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1e40af', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Médio Unitário</span>
          <strong style={{ display: 'block', color: '#1d4ed8', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.custoMedio)}</strong>
        </div>

        <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '16px', border: '1px solid #fde68a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#92400e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Total no Ativo</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.saldoValor)}</strong>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fca5a5', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>CMV Acumulado (DRE)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.cmvAcumulado)}</strong>
        </div>
      </div>

      {/* FORMULÁRIO DE LANÇAMENTO */}
      <form onSubmit={handleAddMovimento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>Data da Operação:</label>
          <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} style={inputStyle} required />
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>Movimento:</label>
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white', color: form.tipo === 'entrada' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
            <option value="entrada">Entrada no Estoque</option>
            <option value="saida">Saída (Baixa / Venda)</option>
          </select>
        </div>

        {form.tipo === 'entrada' && (
          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>Origem da Entrada:</label>
            <select value={form.origem} onChange={e => setForm({...form, origem: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
              <option value="compra">Compra de Fornecedor</option>
              <option value="producao">Produção Interna</option>
            </select>
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>Produto / Item:</label>
          <input type="text" placeholder="Ex: Cadeira de Escritório" value={form.produto} onChange={e => setForm({...form, produto: e.target.value})} style={inputStyle} required />
        </div>

        <div style={{ minWidth: 0 }}>
          <label style={labelStyle}>NF-e / OP (Histórico):</label>
          <input type="text" placeholder="Ex: NF 1234 ou OP-001" value={form.nf} onChange={e => setForm({...form, nf: e.target.value})} style={inputStyle} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', gridColumn: '1 / -1', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>Quantidade:</label>
            <input type="number" min="1" value={form.quant} onChange={e => setForm({...form, quant: e.target.value})} style={inputStyle} required />
          </div>

          <div style={{ minWidth: 0, opacity: form.tipo === 'saida' ? 0.5 : 1 }}>
            <label style={labelStyle}>Custo Unit. (R$):</label>
            <input type="number" step="0.01" value={form.tipo === 'saida' ? 0 : form.valorUnit} onChange={e => setForm({...form, valorUnit: e.target.value})} disabled={form.tipo === 'saida'} style={{ ...inputStyle, backgroundColor: form.tipo === 'saida' ? '#e2e8f0' : '#f8fafc' }} />
          </div>
        </div>

        <button type="submit" style={{ gridColumn: '1 / -1', padding: '14px', backgroundColor: form.tipo === 'entrada' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', boxSizing: 'border-box', width: '100%' }}>
          {form.tipo === 'entrada' ? '📥 Registar Entrada e Contabilizar Estoque' : '📤 Registar Saída e Apurar CMV'}
        </button>
      </form>

      {/* TABELA KARDEX */}
      <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', backgroundColor: 'white', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', minWidth: '750px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
              <th colSpan="3" style={{ padding: '10px', borderRight: '1px solid #334155' }}>OPERAÇÃO</th>
              <th colSpan="3" style={{ backgroundColor: '#059669', padding: '10px', borderRight: '1px solid #334155' }}>ENTRADAS</th>
              <th colSpan="3" style={{ backgroundColor: '#dc2626', padding: '10px', borderRight: '1px solid #334155' }}>SAÍDAS (CMV)</th>
              <th colSpan="3" style={{ backgroundColor: '#2563eb', padding: '10px' }}>SALDO EM ESTOQUE</th>
              <th rowSpan="2" style={{ backgroundColor: '#1e293b', padding: '10px' }}>Ação</th>
            </tr>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Data</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', textAlign: 'left' }}>Produto</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a', textAlign: 'left' }}>NF / OP</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Unit.</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a' }}>Total</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Custo</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a' }}>Total</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0' }}>Médio</th>
              <th style={{ padding: '8px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {tabelaProcessada.length === 0 ? (
              <tr><td colSpan="13" style={{ padding: '30px', color: '#64748b' }}>Nenhuma movimentação registada no Kardex.</td></tr>
            ) : (
              tabelaProcessada.map((linha, index) => (
                <tr key={linha.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: linha.tipo === 'entrada' ? '#f0fdf4' : '#fef2f2' }}>
                  <td style={{ padding: '10px', borderRight: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>{new Date(linha.data).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '10px', borderRight: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 'bold', wordBreak: 'break-word' }}>{linha.produto}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b', wordBreak: 'break-word' }}>{linha.historico}</td>
                  
                  {/* Entradas */}
                  <td style={{ padding: '10px', whiteSpace: 'nowrap', color: linha.inQ ? '#0f172a' : 'transparent' }}>{linha.inQ || '-'}</td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap', color: linha.inU ? '#0f172a' : 'transparent' }}>{linha.inU ? formatMoeda(linha.inU) : '-'}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', whiteSpace: 'nowrap', color: linha.inT ? '#059669' : 'transparent', fontWeight: 'bold' }}>{linha.inT ? formatMoeda(linha.inT) : '-'}</td>
                  
                  {/* Saídas */}
                  <td style={{ padding: '10px', whiteSpace: 'nowrap', color: linha.outQ ? '#0f172a' : 'transparent' }}>{linha.outQ || '-'}</td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap', color: linha.outU ? '#0f172a' : 'transparent' }}>{linha.outU ? formatMoeda(linha.outU) : '-'}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', whiteSpace: 'nowrap', color: linha.outT ? '#dc2626' : 'transparent', fontWeight: 'bold' }}>{linha.outT ? formatMoeda(linha.outT) : '-'}</td>
                  
                  {/* Saldos */}
                  <td style={{ padding: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{linha.salQ}</td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{formatMoeda(linha.salU)}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#1d4ed8', whiteSpace: 'nowrap' }}>{formatMoeda(linha.salT)}</td>
                  
                  <td style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>
                    {index === tabelaProcessada.length - 1 && (
                      <button onClick={() => handleRemover(linha.id)} title="Remover" style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}