import React, { useState, useEffect } from 'react';

export default function SimuladorFinanceiro({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Saldos de Disponibilidades
  const [saldoCaixa, setSaldoCaixa] = useState(15000);
  const [saldoBanco, setSaldoBanco] = useState(42500);

  // Títulos Financeiros
  const [titulos, setTitulos] = useState([
    { id: 1, tipo: 'receber', descricao: 'Venda a Prazo - Cliente Alfa', valor: 8500, vencimento: '28/10/2026', status: 'pendente' },
    { id: 2, tipo: 'pagar', descricao: 'Fornecedor de Embalagens Ltda', valor: 3200, vencimento: '30/10/2026', status: 'pendente' },
    { id: 3, tipo: 'pagar', descricao: 'Aluguel do Galpão Operacional', valor: 4500, vencimento: '05/11/2026', status: 'pendente' },
    { id: 4, tipo: 'receber', descricao: 'Prestação de Serviços - Contrato', valor: 6200, vencimento: '10/11/2026', status: 'pendente' }
  ]);

  // Formulário de Novo Título
  const [formTipo, setFormTipo] = useState('receber');
  const [formDescricao, setFormDescricao] = useState('');
  const [formValorStr, setFormValorStr] = useState('');
  const [formVencimento, setFormVencimento] = useState(new Date().toLocaleDateString('pt-BR'));

  // Totais do Dashboard
  const [totais, setTotais] = useState({
    totalDisponivel: 0,
    totalReceber: 0,
    totalPagar: 0,
    saldoProjetado: 0
  });

  useEffect(() => {
    const disp = Number(saldoCaixa) + Number(saldoBanco);
    const pendReceber = titulos.filter(t => t.tipo === 'receber' && t.status === 'pendente').reduce((acc, cur) => acc + cur.valor, 0);
    const pendPagar = titulos.filter(t => t.tipo === 'pagar' && t.status === 'pendente').reduce((acc, cur) => acc + cur.valor, 0);

    setTotais({
      totalDisponivel: disp,
      totalReceber: pendReceber,
      totalPagar: pendPagar,
      saldoProjetado: disp + pendReceber - pendPagar
    });
  }, [saldoCaixa, saldoBanco, titulos]);

  const handleAddTitulo = (e) => {
    e.preventDefault();
    const val = parseFloat(formValorStr) || 0;
    if (!formDescricao || val <= 0) {
      return alert("Preencha a descrição e um valor válido.");
    }

    setTitulos([
      ...titulos,
      {
        id: Date.now(),
        tipo: formTipo,
        descricao: formDescricao,
        valor: val,
        vencimento: formVencimento,
        status: 'pendente'
      }
    ]);

    setFormDescricao('');
    setFormValorStr('');
    if (mostrarToast) mostrarToast('Título adicionado ao controle financeiro.', 'aviso');
  };

  const liquidarTitulo = (id, contaLiquidacao) => {
    const titulo = titulos.find(t => t.id === id);
    if (!titulo || titulo.status === 'pago') return;

    if (titulo.tipo === 'pagar') {
      if (contaLiquidacao === 'caixa') {
        if (saldoCaixa < titulo.valor) return alert("Saldo insuficiente em Caixa.");
        setSaldoCaixa(prev => prev - titulo.valor);
      } else {
        if (saldoBanco < titulo.valor) return alert("Saldo bancário insuficiente.");
        setSaldoBanco(prev => prev - titulo.valor);
      }
    } else {
      if (contaLiquidacao === 'caixa') {
        setSaldoCaixa(prev => prev + titulo.valor);
      } else {
        setSaldoBanco(prev => prev + titulo.valor);
      }
    }
    setTitulos(titulos.map(t => t.id === id ? { ...t, status: 'pago' } : t));

    if (typeof registrarFatoGerador === 'function') {
      const idCaixa = planoContas.find(c => c.codigo_contabil === '1.1.01.01' || c.nome_conta.toLowerCase().includes('caixa'))?.id;
      const idBanco = planoContas.find(c => c.codigo_contabil === '1.1.01.02' || c.nome_conta.toLowerCase().includes('banco'))?.id;
      const idClientes = planoContas.find(c => c.codigo_contabil === '1.1.02.01' || c.nome_conta.toLowerCase().includes('clientes'))?.id;
      const idFornecedores = planoContas.find(c => c.codigo_contabil === '2.1.01.01' || c.nome_conta.toLowerCase().includes('fornecedores') || c.nome_conta.toLowerCase().includes('contas a pagar'))?.id;

      const idContaDisponibilidade = contaLiquidacao === 'caixa' ? idCaixa : idBanco;
      const nomeContaDisp = contaLiquidacao === 'caixa' ? 'Caixa' : 'Banco';

      if (titulo.tipo === 'receber') {
        registrarFatoGerador(
          `Recebimento de Cliente - ${titulo.descricao}`,
          titulo.valor,
          'Tesouraria',
          [idContaDisponibilidade], 
          [idClientes]              
        );
      } else {
        registrarFatoGerador(
          `Pagamento de Obrigação - ${titulo.descricao}`,
          titulo.valor,
          'Tesouraria',
          [idFornecedores],         
          [idContaDisponibilidade]  
        );
      }

      if (mostrarToast) {
        mostrarToast(`Título liquidado via ${nomeContaDisp}! Baixa enviada ao Livro Diário.`, 'sucesso');
      }
    }
  };

  const excluirTitulo = (id) => {
    setTitulos(titulos.filter(t => t.id !== id));
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>💰</span> Gestão Financeira & Tesouraria
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Controle de Disponibilidades, Liquidação de Contas a Pagar/Receber e Projeção de Caixa.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxSizing: 'border-box' }}>
            Caixa: <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(saldoCaixa)}</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxSizing: 'border-box' }}>
            Banco: <strong style={{ color: '#2563eb', wordBreak: 'break-word' }}>{formatMoeda(saldoBanco)}</strong>
          </div>
        </div>
      </div>

      {/* DASHBOARDS DE DISPONIBILIDADE E LIQUIDEZ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Disponibilidades Atuais</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.totalDisponivel)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Caixa + Bancos</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Contas a Receber (Pendente)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.totalReceber)}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534', wordBreak: 'break-word' }}>Direitos Curto Prazo</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Contas a Pagar (Pendente)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.totalPagar)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b', wordBreak: 'break-word' }}>Obrigações Operacionais</span>
        </div>

        <div style={{ backgroundColor: totais.saldoProjetado >= 0 ? '#eff6ff' : '#fff1f2', padding: '16px', borderRadius: '16px', border: `1px solid ${totais.saldoProjetado >= 0 ? '#bfdbfe' : '#fecdd3'}`, borderLeft: `4px solid ${totais.saldoProjetado >= 0 ? '#2563eb' : '#e11d48'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: totais.saldoProjetado >= 0 ? '#1d4ed8' : '#9f1239', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Projetado de Caixa</span>
          <strong style={{ display: 'block', color: totais.saldoProjetado >= 0 ? '#1e40af' : '#be123c', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.saldoProjetado)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Disponível + Receber - Pagar</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* COLUNA ESQUERDA: NOVO LANÇAMENTO FINANCEIRO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          <form onSubmit={handleAddTitulo} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
              Novo Título Financeiro
            </h3>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Tipo de Operação:</label>
              <select value={formTipo} onChange={e => setFormTipo(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white', fontWeight: 'bold', color: formTipo === 'receber' ? '#059669' : '#dc2626' }}>
                <option value="receber">Entrada: Contas a Receber (Cliente)</option>
                <option value="pagar">Saída: Contas a Pagar (Fornecedor/Despesa)</option>
              </select>
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Descrição / Histórico:</label>
              <input type="text" value={formDescricao} onChange={e => setFormDescricao(e.target.value)} placeholder="Ex: Pagamento Boleto Fornecedor Y" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Valor (R$):</label>
                <input type="text" value={formValorStr} onChange={e => setFormValorStr(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0,00" style={inputStyle} />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Vencimento:</label>
                <input type="text" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: formTipo === 'receber' ? '#16a34a' : '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px', boxSizing: 'border-box', width: '100%' }}>
              {formTipo === 'receber' ? '➕ Registrar Conta a Receber' : '➕ Registrar Conta a Pagar'}
            </button>
          </form>

          {/* MAPA CONTÁBIL DE BAIXA */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span>🧭</span> Mecânica Contábil da Liquidação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '10px', borderLeft: '4px solid #059669', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ color: '#059669', display: 'block', wordBreak: 'break-word' }}>Recebimento de Cliente:</strong>
                <div style={{ wordBreak: 'break-word' }}>D: Banco / Caixa (Ativo)</div>
                <div style={{ wordBreak: 'break-word' }}>C: Clientes a Receber (Ativo)</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '10px', borderLeft: '4px solid #dc2626', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ color: '#dc2626', display: 'block', wordBreak: 'break-word' }}>Pagamento de Fornecedor:</strong>
                <div style={{ wordBreak: 'break-word' }}>D: Fornecedores a Pagar (Passivo)</div>
                <div style={{ wordBreak: 'break-word' }}>C: Banco / Caixa (Ativo)</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#3b82f6', fontStyle: 'italic', wordBreak: 'break-word' }}>
              💡 Dica: Ao clicar em "Banco" ou "Caixa" na tabela ao lado, o Fato Gerador será enviado para o Livro Diário.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: GRELHA DE TÍTULOS FINANCEIROS */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontSize: '15px', wordBreak: 'break-word' }}>Títulos Financeiros em Aberto e Baixas</h3>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              {titulos.filter(t => t.status === 'pendente').length} pendências
            </span>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 16px 16px', overflowX: 'auto', backgroundColor: 'white', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '500px' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Vencimento</th>
                  <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>Descrição</th>
                  <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Liquidação</th>
                </tr>
              </thead>
              <tbody>
                {titulos.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '25px', textAlign: 'center', color: '#64748b' }}>Nenhum título lançado na tesouraria.</td></tr>
                ) : (
                  titulos.map(item => (
                    <tr 
                      key={item.id} 
                      style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: item.status === 'pago' ? '#f8fafc' : 'white', opacity: item.status === 'pago' ? 0.6 : 1 }}
                    >
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{item.vencimento}</td>
                      <td style={{ padding: '12px 14px', minWidth: 0, wordBreak: 'break-word' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px', backgroundColor: item.tipo === 'receber' ? '#16a34a' : '#ef4444', flexShrink: 0 }}></span>
                        <strong style={{ wordBreak: 'break-word' }}>{item.descricao}</strong>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: item.tipo === 'receber' ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                        {item.tipo === 'receber' ? '+' : '-'} {formatMoeda(item.valor)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: item.status === 'pago' ? '#f1f5f9' : '#fffbeb', color: item.status === 'pago' ? '#64748b' : '#b45309', border: `1px solid ${item.status === 'pago' ? '#e2e8f0' : '#fde68a'}` }}>
                          {item.status === 'pago' ? 'LIQUIDADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {item.status === 'pendente' ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => liquidarTitulo(item.id, 'banco')} title="Liquidar via Banco" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 'bold' }}>Banco</button>
                            <button onClick={() => liquidarTitulo(item.id, 'caixa')} title="Liquidar via Caixa" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 'bold' }}>Caixa</button>
                            <button onClick={() => excluirTitulo(item.id)} title="Remover título" style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 'bold' }}>✓ Baixado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}