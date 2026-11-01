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
    { id: 4, tipo: 'receber', descricao: 'Prestação de Serviços - Contrato Mensal', valor: 6200, vencimento: '10/11/2026', status: 'pendente' }
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

  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL: LIQUIDAÇÃO DE TÍTULOS (SISTEMA NERVOSO)
  // ==========================================================
  const liquidarTitulo = (id, contaLiquidacao) => {
    const titulo = titulos.find(t => t.id === id);
    if (!titulo || titulo.status === 'pago') return;

    // 1. Atualização do Dashboard Financeiro Local
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

    // 2. Disparo do Fato Gerador para o Livro Diário
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
          [idContaDisponibilidade], // Débito (Aumenta o Ativo/Caixa)
          [idClientes]              // Crédito (Baixa o Direito a Receber)
        );
      } else {
        registrarFatoGerador(
          `Pagamento de Obrigação - ${titulo.descricao}`,
          titulo.valor,
          'Tesouraria',
          [idFornecedores],         // Débito (Baixa a Obrigação a Pagar no Passivo)
          [idContaDisponibilidade]  // Crédito (Diminui o Ativo/Caixa)
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>💰</span> Gestão Financeira & Tesouraria
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Controle de Disponibilidades, Liquidação de Contas a Pagar/Receber e Projeção de Caixa.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
            Caixa: <strong style={{ color: '#0f172a' }}>{formatMoeda(saldoCaixa)}</strong>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
            Banco: <strong style={{ color: '#2563eb' }}>{formatMoeda(saldoBanco)}</strong>
          </div>
        </div>
      </div>

      {/* DASHBOARDS DE DISPONIBILIDADE E LIQUIDEZ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Disponibilidades Atuais</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalDisponivel)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Caixa + Bancos Conta Movimento</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Contas a Receber (Pendente)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalReceber)}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Direitos a Realizar no Curto Prazo</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Contas a Pagar (Pendente)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalPagar)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>Obrigações Operacionais</span>
        </div>

        <div style={{ backgroundColor: totais.saldoProjetado >= 0 ? '#eff6ff' : '#fff1f2', padding: '18px', borderRadius: '12px', border: `1px solid ${totais.saldoProjetado >= 0 ? '#bfdbfe' : '#fecdd3'}`, borderLeft: `4px solid ${totais.saldoProjetado >= 0 ? '#2563eb' : '#e11d48'}` }}>
          <span style={{ color: totais.saldoProjetado >= 0 ? '#1d4ed8' : '#9f1239', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Projetado de Caixa</span>
          <strong style={{ display: 'block', color: totais.saldoProjetado >= 0 ? '#1e40af' : '#be123c', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.saldoProjetado)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Disponível + Receber - Pagar</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* COLUNA ESQUERDA: NOVO LANÇAMENTO FINANCEIRO */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <form onSubmit={handleAddTitulo} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              Novo Título Financeiro
            </h3>

            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Tipo de Operação:
              <select value={formTipo} onChange={e => setFormTipo(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: 'bold', color: formTipo === 'receber' ? '#059669' : '#dc2626' }}>
                <option value="receber">Entrada: Contas a Receber (Cliente)</option>
                <option value="pagar">Saída: Contas a Pagar (Fornecedor/Despesa)</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Descrição / Histórico:
              <input type="text" value={formDescricao} onChange={e => setFormDescricao(e.target.value)} placeholder="Ex: Pagamento Boleto Fornecedor Y" style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                Valor (R$):
                <input type="text" value={formValorStr} onChange={e => setFormValorStr(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0,00" style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </label>

              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Vencimento:
                <input type="text" value={formVencimento} onChange={e => setFormVencimento(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              </label>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: formTipo === 'receber' ? '#16a34a' : '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
              {formTipo === 'receber' ? '➕ Registrar Conta a Receber' : '➕ Registrar Conta a Pagar'}
            </button>
          </form>

          {/* MAPA CONTÁBIL DE BAIXA */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧭</span> Mecânica Contábil da Liquidação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                <strong style={{ color: '#059669', display: 'block' }}>Recebimento de Cliente:</strong>
                <div>D: Banco / Caixa (Ativo Circulante)</div>
                <div>C: Clientes a Receber (Ativo Circulante)</div>
              </div>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '3px solid #dc2626' }}>
                <strong style={{ color: '#dc2626', display: 'block' }}>Pagamento de Fornecedor:</strong>
                <div>D: Fornecedores a Pagar (Passivo Circ.)</div>
                <div>C: Banco / Caixa (Ativo Circulante)</div>
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#3b82f6', fontStyle: 'italic' }}>
              💡 Dica: Ao clicar em "Banco" ou "Caixa" na tabela ao lado, o Fato Gerador será enviado imediatamente para a fila do Livro Diário.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: GRELHA DE TÍTULOS FINANCEIROS */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Títulos Financeiros em Aberto e Baixas</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {titulos.filter(t => t.status === 'pendente').length} pendências
            </span>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 12px 12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
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
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', marginRight: '6px', backgroundColor: item.tipo === 'receber' ? '#16a34a' : '#ef4444' }}></span>
                        <strong>{item.descricao}</strong>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: item.tipo === 'receber' ? '#16a34a' : '#dc2626' }}>
                        {item.tipo === 'receber' ? '+' : '-'} {formatMoeda(item.valor)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: item.status === 'pago' ? '#f1f5f9' : '#fffbeb', color: item.status === 'pago' ? '#64748b' : '#b45309', border: `1px solid ${item.status === 'pago' ? '#e2e8f0' : '#fde68a'}` }}>
                          {item.status === 'pago' ? 'LIQUIDADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {item.status === 'pendente' ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button onClick={() => liquidarTitulo(item.id, 'banco')} title="Liquidar via Banco Conta Movimento" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Banco</button>
                            <button onClick={() => liquidarTitulo(item.id, 'caixa')} title="Liquidar via Caixa em Dinheiro" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Caixa</button>
                            <button onClick={() => excluirTitulo(item.id)} title="Remover título" style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>✓ Baixado</span>
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