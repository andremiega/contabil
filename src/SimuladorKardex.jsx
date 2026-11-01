import React, { useState, useEffect } from 'react';

export default function SimuladorKardex({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [movimentacoesRaw, setMovimentacoesRaw] = useState([]);

  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'entrada',
    origem: 'compra', // 'compra' (Fornecedor) ou 'producao' (Simulador de Custos)
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
        const custoMedio = saldoValor / saldoQtd;
        
        return {
          ...mov,
          inQ: mov.quant, inU: mov.valorUnit, inT: totalEntrada,
          outQ: 0, outU: 0, outT: 0,
          salQ: saldoQtd, salU: custoMedio, salT: saldoValor
        };
      } else {
        // Saída (Venda)
        const custoMedioAtual = saldoQtd > 0 ? (saldoValor / saldoQtd) : 0;
        const totalSaida = mov.quant * custoMedioAtual;
        
        saldoQtd -= mov.quant;
        saldoValor -= totalSaida;
        if (saldoQtd === 0) saldoValor = 0; // Correção de dízimas
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

  // Registar Movimento e Enviar para a Contabilidade
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

    // INTEGRAÇÃO CONTÁBIL (O SISTEMA NERVOSO)
    if (typeof registrarFatoGerador === 'function') {
      const idEstoque = planoContas.find(c => c.nome_conta.toLowerCase().includes('estoque'))?.id;
      const idFornecedor = planoContas.find(c => c.nome_conta.toLowerCase().includes('fornecedor'))?.id;
      const idCmv = planoContas.find(c => c.nome_conta.toLowerCase().includes('cmv') || c.nome_conta.toLowerCase().includes('cpv'))?.id;

      if (form.tipo === 'entrada') {
        const descricaoHist = form.origem === 'producao' 
          ? `Entrada de Produto Acabado ref. OP Produção - ${form.produto}`
          : `Aquisição de Estoque (${form.produto}) conf. ${form.nf}`;

        registrarFatoGerador(
          descricaoHist,
          valorTotalOperacao,
          'Estoque (Kardex)',
          [idEstoque], // Débito no Ativo
          [idFornecedor] // Crédito no Passivo (Ou Conta de Apuração de Custos)
        );
      } else {
        registrarFatoGerador(
          `Baixa de Estoque e Reconhecimento do CMV (${form.produto}) conf. ${form.nf}`,
          valorTotalOperacao,
          'Estoque (Kardex)',
          [idCmv], // Débito na DRE (Custo)
          [idEstoque] // Crédito no Ativo (Estoque diminui)
        );
      }
    }

    // Salvar no Kardex Local
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

    if(mostrarToast) mostrarToast(`Operação de ${form.tipo} registrada e Fato Contábil gerado!`, 'sucesso');
    setForm({ ...form, quant: '', valorUnit: '', nf: '', produto: '' });
  };

  const handleRemover = (id) => {
    setMovimentacoesRaw(movimentacoesRaw.filter(m => m.id !== id));
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📦</span> Ficha de Controle de Estoque (Kardex)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Apuramento dinâmico do Custo da Mercadoria Vendida (CMV) e integração de Produtos Acabados.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Método de Custeio:</span>
          <span style={{ backgroundColor: '#1e293b', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>Custo Médio Ponderado</span>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
          <span style={{ color: '#166534', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Estoque Atual</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '28px', marginTop: '4px' }}>{totais.saldoQtd} un.</strong>
        </div>
        
        <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <span style={{ color: '#1e40af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Médio Unitário</span>
          <strong style={{ display: 'block', color: '#1d4ed8', fontSize: '28px', marginTop: '4px' }}>{formatMoeda(totais.custoMedio)}</strong>
        </div>

        <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
          <span style={{ color: '#92400e', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Total no Ativo</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '28px', marginTop: '4px' }}>{formatMoeda(totais.saldoValor)}</strong>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
          <span style={{ color: '#991b1b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>CMV Acumulado (DRE)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '28px', marginTop: '4px' }}>{formatMoeda(totais.cmvAcumulado)}</strong>
        </div>
      </div>

      {/* FORMULÁRIO DE LANÇAMENTO COM PRODUTO E ORIGEM */}
      <form onSubmit={handleAddMovimento} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px', alignItems: 'flex-end' }}>
        
        <div style={{ flex: '1 1 100%', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Data da Operação:
            <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </label>

          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Movimento:
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: form.tipo === 'entrada' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
              <option value="entrada">Entrada no Estoque</option>
              <option value="saida">Saída (Baixa / Venda)</option>
            </select>
          </label>

          {form.tipo === 'entrada' && (
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Origem da Entrada:
              <select value={form.origem} onChange={e => setForm({...form, origem: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                <option value="compra">Compra de Fornecedor</option>
                <option value="producao">Produção Interna (Simulador de Custos)</option>
              </select>
            </label>
          )}
        </div>

        <div style={{ flex: '1 1 100%', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <label style={{ flex: 2, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
            Produto / Item:
            <input type="text" placeholder="Ex: Cadeira de Escritório, Matéria-Prima X..." value={form.produto} onChange={e => setForm({...form, produto: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </label>

          <label style={{ flex: 2, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            NF-e / Ordem de Produção (Histórico):
            <input type="text" placeholder="Ex: NF 1234 ou OP-001" value={form.nf} onChange={e => setForm({...form, nf: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </label>

          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
            Quantidade:
            <input type="number" min="1" value={form.quant} onChange={e => setForm({...form, quant: e.target.value})} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
          </label>

          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569', opacity: form.tipo === 'saida' ? 0.5 : 1 }}>
            Custo Unit. (R$):
            <input type="number" step="0.01" value={form.tipo === 'saida' ? 0 : form.valorUnit} onChange={e => setForm({...form, valorUnit: e.target.value})} disabled={form.tipo === 'saida'} title={form.tipo === 'saida' ? 'O custo de saída é a Média Ponderada.' : ''} style={{ padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: form.tipo === 'saida' ? '#e2e8f0' : 'white' }} />
          </label>
        </div>

        <button type="submit" style={{ flex: '1 1 100%', padding: '14px', backgroundColor: form.tipo === 'entrada' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          {form.tipo === 'entrada' ? '📥 Registar Entrada e Contabilizar Estoque' : '📤 Registar Saída e Apurar CMV'}
        </button>
      </form>

      {/* TABELA KARDEX COM PRODUTO E HISTÓRICO */}
      <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
              <th colSpan="3" style={{ padding: '10px', borderRight: '1px solid #334155' }}>DADOS DA OPERAÇÃO</th>
              <th colSpan="3" style={{ backgroundColor: '#059669', padding: '10px', borderRight: '1px solid #334155' }}>ENTRADAS</th>
              <th colSpan="3" style={{ backgroundColor: '#dc2626', padding: '10px', borderRight: '1px solid #334155' }}>SAÍDAS (CMV)</th>
              <th colSpan="3" style={{ backgroundColor: '#2563eb', padding: '10px' }}>SALDO EM ESTOQUE</th>
              <th rowSpan="2" style={{ backgroundColor: '#1e293b', padding: '10px' }}>Ação</th>
            </tr>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Data</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>Produto</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>NF / OP</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Valor Unit.</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a', borderBottom: '2px solid #cbd5e1' }}>Total</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Custo Médio</th>
              <th style={{ padding: '8px', borderRight: '2px solid #0f172a', borderBottom: '2px solid #cbd5e1' }}>Total (CMV)</th>
              
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Qtd</th>
              <th style={{ padding: '8px', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #cbd5e1' }}>Custo Médio</th>
              <th style={{ padding: '8px', borderBottom: '2px solid #cbd5e1' }}>Saldo Total</th>
            </tr>
          </thead>
          <tbody>
            {tabelaProcessada.length === 0 ? (
              <tr><td colSpan="13" style={{ padding: '30px', color: '#64748b' }}>Nenhuma movimentação registada no Kardex.</td></tr>
            ) : (
              tabelaProcessada.map((linha, index) => (
                <tr key={linha.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: linha.tipo === 'entrada' ? '#f0fdf4' : '#fef2f2' }}>
                  <td style={{ padding: '10px', borderRight: '1px solid #cbd5e1' }}>{new Date(linha.data).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '10px', borderRight: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 'bold' }}>{linha.produto}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>{linha.historico}</td>
                  
                  {/* Entradas */}
                  <td style={{ padding: '10px', color: linha.inQ ? '#0f172a' : 'transparent' }}>{linha.inQ || '-'}</td>
                  <td style={{ padding: '10px', color: linha.inU ? '#0f172a' : 'transparent' }}>{linha.inU ? formatMoeda(linha.inU) : '-'}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', color: linha.inT ? '#059669' : 'transparent', fontWeight: 'bold' }}>{linha.inT ? formatMoeda(linha.inT) : '-'}</td>
                  
                  {/* Saídas */}
                  <td style={{ padding: '10px', color: linha.outQ ? '#0f172a' : 'transparent' }}>{linha.outQ || '-'}</td>
                  <td style={{ padding: '10px', color: linha.outU ? '#0f172a' : 'transparent' }}>{linha.outU ? formatMoeda(linha.outU) : '-'}</td>
                  <td style={{ padding: '10px', borderRight: '2px solid #cbd5e1', color: linha.outT ? '#dc2626' : 'transparent', fontWeight: 'bold' }}>{linha.outT ? formatMoeda(linha.outT) : '-'}</td>
                  
                  {/* Saldos */}
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{linha.salQ}</td>
                  <td style={{ padding: '10px' }}>{formatMoeda(linha.salU)}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#1d4ed8' }}>{formatMoeda(linha.salT)}</td>
                  
                  <td style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid #cbd5e1' }}>
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