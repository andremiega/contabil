import React, { useState, useMemo } from 'react';

export default function DemonstracoesContabeis({ historico = [], empresa = null, capitalSocial = 0 }) {
  const [aba, setAba] = useState('balanco');
  const [contaFiltro, setContaFiltro] = useState('');

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ==========================================
  // MOTOR CONTÁBIL: CLASSIFICAÇÃO E RAZONETES
  // ==========================================
  const relatorios = useMemo(() => {
    const contas = {};
    const dfc = { operacionais: [], investimentos: [], financiamentos: [], totalEntradas: 0, totalSaidas: 0 };
    let receitaTotal = 0;
    let deducoesTotal = 0;
    let custosTotal = 0;
    let despesasTotal = 0;

    // 1. Varredura do Livro Diário para montar Razonetes e DFC
    historico.forEach(lanc => {
      const valor = Number(lanc.valor);
      
      if (lanc.debito) {
        if (!contas[lanc.debito]) contas[lanc.debito] = { debitos: [], creditos: [], totalD: 0, totalC: 0 };
        contas[lanc.debito].debitos.push({ valor, hist: lanc.historico });
        contas[lanc.debito].totalD += valor;
      }
      if (lanc.credito) {
        if (!contas[lanc.credito]) contas[lanc.credito] = { debitos: [], creditos: [], totalD: 0, totalC: 0 };
        contas[lanc.credito].creditos.push({ valor, hist: lanc.historico });
        contas[lanc.credito].totalC += valor;
      }

      const isCaixaDebito = lanc.debito?.toLowerCase().includes('caixa') || lanc.debito?.toLowerCase().includes('banco');
      const isCaixaCredito = lanc.credito?.toLowerCase().includes('caixa') || lanc.credito?.toLowerCase().includes('banco');
      
      if (isCaixaDebito) {
        dfc.totalEntradas += valor;
        if (lanc.credito?.toLowerCase().includes('capital') || lanc.credito?.toLowerCase().includes('empréstimo')) {
          dfc.financiamentos.push({ tipo: 'Entrada', hist: lanc.historico, valor });
        } else {
          dfc.operacionais.push({ tipo: 'Entrada', hist: lanc.historico, valor });
        }
      }
      if (isCaixaCredito) {
        dfc.totalSaidas += valor;
        if (lanc.debito?.toLowerCase().includes('máquina') || lanc.debito?.toLowerCase().includes('equipamento') || lanc.debito?.toLowerCase().includes('móvel')) {
          dfc.investimentos.push({ tipo: 'Saída', hist: lanc.historico, valor });
        } else {
          dfc.operacionais.push({ tipo: 'Saída', hist: lanc.historico, valor });
        }
      }
    });

    // 2. Apuração de Saldos e Estruturação DRE / Balanço
    const balanco = { ativoCirculante: 0, ativoNaoCirculante: 0, passivoCirculante: 0, passivoNaoCirculante: 0, patrimonioLiquido: 0 };
    
    Object.keys(contas).forEach(nome => {
      const c = contas[nome];
      c.saldo = Math.abs(c.totalD - c.totalC);
      c.natureza = c.totalD >= c.totalC ? 'Devedor' : 'Credor';
      if (c.saldo === 0) c.natureza = 'Nulo';

      const nLower = nome.toLowerCase();
      
      if (nLower.includes('receita') || nLower.includes('venda')) receitaTotal += (c.totalC - c.totalD);
      else if (nLower.includes('imposto sobre') || nLower.includes('abatimento')) deducoesTotal += (c.totalD - c.totalC);
      else if (nLower.includes('cmv') || nLower.includes('csv') || nLower.includes('custo')) custosTotal += (c.totalD - c.totalC);
      else if (nLower.includes('despesa') || nLower.includes('salário') || nLower.includes('juro')) despesasTotal += (c.totalD - c.totalC);
      
      else if (nLower.includes('caixa') || nLower.includes('banco') || nLower.includes('estoque') || nLower.includes('cliente')) balanco.ativoCirculante += c.saldo;
      else if (nLower.includes('máquina') || nLower.includes('veículo') || nLower.includes('imóvel') || nLower.includes('móvel')) balanco.ativoNaoCirculante += c.saldo;
      else if (nLower.includes('fornecedor') || nLower.includes('a recolher') || nLower.includes('a pagar')) balanco.passivoCirculante += c.saldo;
      else if (nLower.includes('empréstimo longo')) balanco.passivoNaoCirculante += c.saldo;
    });

    const lucroBruto = receitaTotal - deducoesTotal - custosTotal;
    const lucroLiquido = lucroBruto - despesasTotal;
    balanco.patrimonioLiquido = (Number(capitalSocial) || 0) + lucroLiquido;

    return { contas, dfc, dre: { receitaTotal, deducoesTotal, custosTotal, lucroBruto, despesasTotal, lucroLiquido }, balanco };
  }, [historico, capitalSocial]);

  const contasNomes = Object.keys(relatorios.contas).sort();

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif', color: '#1e293b', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO EXECUTIVO DA EMPRESA SELECIONADA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>
            MÓDULO DE CONTROLADORIA
          </span>
          <h2 style={{ margin: '8px 0 4px 0', fontSize: '20px', color: '#0f172a', fontWeight: '900', wordBreak: 'break-word' }}>Relatórios Contábeis Oficiais</h2>
          <span style={{ fontSize: '12.5px', color: '#64748b', wordBreak: 'break-word' }}>Conformidade com as Normas Brasileiras de Contabilidade (NBC TG).</span>
        </div>
        
        <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', minWidth: '220px', flex: '1 1 220px', boxSizing: 'border-box' }}>
          {empresa ? (
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: '14.5px', color: '#0f172a', fontWeight: '900', wordBreak: 'break-word' }}>{empresa.nome_empresa || empresa.nome || 'Empresa em Análise'}</strong>
              <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>CNPJ: {empresa.cnpj || 'Não cadastrado'}</span>
              <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 'bold', wordBreak: 'break-word' }}>{empresa.regime_tributario || 'Regime Padrão'}</span>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', wordBreak: 'break-word' }}>Nenhuma entidade selecionada no Dashboard.</span>
          )}
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO DE RELATÓRIOS (TABS) */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
        {[
          { id: 'balanco', icone: '⚖️', label: 'Balanço' },
          { id: 'dre', icone: '📉', label: 'DRE' },
          { id: 'dfc', icone: '💵', label: 'DFC' },
          { id: 'dmpl', icone: '📈', label: 'DMPL' },
          { id: 'razonetes', icone: 'T', label: 'Razonetes' },
          { id: 'razao', icone: '📖', label: 'Razão' }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setAba(tab.id)} 
            style={{ 
              padding: '10px 12px', borderRadius: '8px', border: 'none', 
              backgroundColor: aba === tab.id ? '#0f172a' : 'transparent', 
              color: aba === tab.id ? 'white' : '#475569', 
              fontWeight: aba === tab.id ? 'bold' : '600', 
              cursor: 'pointer', transition: 'all 0.2s', flex: '1 1 min(100%, 100px)', fontSize: '12px',
              boxSizing: 'border-box', textAlign: 'center'
            }}
          >
            <span style={{ marginRight: '4px' }}>{tab.icone}</span> {tab.label}
          </button>
        ))}
      </div>

      {historico.length === 0 ? (
        <div style={{ padding: '50px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', color: '#64748b', border: '2px dashed #cbd5e1', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📭</span>
          <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>O Livro Diário está vazio.</strong>
          <span style={{ fontSize: '13px' }}>Realize lançamentos em partidas dobradas para o motor gerar os relatórios.</span>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          
          {/* ========================================================= */}
          {/* BALANÇO PATRIMONIAL */}
          {/* ========================================================= */}
          {aba === 'balanco' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              {/* LADO DO ATIVO */}
              <div style={{ border: '2px solid #2563eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '14px', fontWeight: '900', textAlign: 'center', fontSize: '15px', letterSpacing: '0.5px' }}>
                  ATIVO (Aplicações)
                </div>
                <div style={{ padding: '18px', fontSize: '13.5px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#1e40af', fontSize: '14.5px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Ativo Circulante</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.ativoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '8px', color: '#64748b', fontSize: '11.5px', fontStyle: 'italic', marginBottom: '14px', wordBreak: 'break-word' }}>
                    Disponibilidades, Direitos Curto Prazo, Estoques...
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#1e40af', fontSize: '14.5px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Ativo Não Circulante</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.ativoNaoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '8px', color: '#64748b', fontSize: '11.5px', fontStyle: 'italic', wordBreak: 'break-word' }}>
                    Imobilizado, Intangível, Investimentos...
                  </div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '14px 18px', borderTop: '2px solid #2563eb', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#1d4ed8', fontSize: '16.5px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                  <span>TOTAL DO ATIVO</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.ativoCirculante + relatorios.balanco.ativoNaoCirculante)}</span>
                </div>
              </div>

              {/* LADO DO PASSIVO E PL */}
              <div style={{ border: '2px solid #dc2626', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '14px', fontWeight: '900', textAlign: 'center', fontSize: '15px', letterSpacing: '0.5px' }}>
                  PASSIVO E P.L. (Origens)
                </div>
                <div style={{ padding: '18px', fontSize: '13.5px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#991b1b', fontSize: '14.5px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Passivo Circulante</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.passivoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '8px', color: '#64748b', fontSize: '11.5px', fontStyle: 'italic', marginBottom: '14px', wordBreak: 'break-word' }}>
                    Obrigações Trabalhistas, Fiscais, Fornecedores...
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '6px', color: '#991b1b', fontSize: '14.5px', borderTop: '1px dashed #cbd5e1', paddingTop: '14px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Passivo Não Circulante</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.passivoNaoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '8px', color: '#64748b', fontSize: '11.5px', fontStyle: 'italic', marginBottom: '14px', wordBreak: 'break-word' }}>
                    Empréstimos e Obrigações Longo Prazo...
                  </div>

                  <div style={{ borderTop: '2px solid #fca5a5', margin: '16px 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#166534', fontSize: '14.5px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Patrimônio Líquido</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.patrimonioLiquido)}</span>
                  </div>
                  <div style={{ paddingLeft: '8px', color: '#64748b', fontSize: '11.5px', fontStyle: 'italic', wordBreak: 'break-word' }}>
                    Capital, Reservas, Lucros Acumulados...
                  </div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '14px 18px', borderTop: '2px solid #dc2626', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#b91c1c', fontSize: '16.5px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                  <span>TOTAL PASSIVO + PL</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.balanco.passivoCirculante + relatorios.balanco.passivoNaoCirculante + relatorios.balanco.patrimonioLiquido)}</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* DRE - DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO */}
          {/* ========================================================= */}
          {aba === 'dre' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', fontWeight: '900', textAlign: 'center', fontSize: '17px', letterSpacing: '0.5px' }}>
                Demonstração do Resultado do Exercício (DRE)
              </div>
              <div style={{ padding: '24px', backgroundColor: '#ffffff', fontSize: '14px', lineHeight: '2.0', boxSizing: 'border-box' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', flexWrap: 'wrap', gap: '6px' }}>
                  <span>(+) Receita Bruta de Vendas / Serviços</span><span style={{ color: '#16a34a', wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.dre.receitaTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ paddingLeft: '12px' }}>(-) Deduções, Impostos e Devoluções</span><span style={{ wordBreak: 'break-word' }}>(R$ {formatMoeda(relatorios.dre.deducoesTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', color: '#0f172a', fontSize: '15px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>(=) RECEITA LÍQUIDA</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.dre.receitaTotal - relatorios.dre.deducoesTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ paddingLeft: '12px' }}>(-) Custo dos Produtos/Serviços (CMV/CSV)</span><span style={{ wordBreak: 'break-word' }}>(R$ {formatMoeda(relatorios.dre.custosTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', color: '#1e40af', fontSize: '15px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>(=) LUCRO BRUTO</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.dre.lucroBruto)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ paddingLeft: '12px' }}>(-) Despesas Operacionais / Adm. / Financeiras</span><span style={{ wordBreak: 'break-word' }}>(R$ {formatMoeda(relatorios.dre.despesasTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '4px solid #0f172a', paddingTop: '14px', marginTop: '14px', fontSize: '18px', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626', backgroundColor: relatorios.dre.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2', padding: '14px', borderRadius: '8px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                  <span style={{ wordBreak: 'break-word' }}>{relatorios.dre.lucroLiquido >= 0 ? '(=) LUCRO LÍQUIDO DO EXERCÍCIO' : '(=) PREJUÍZO LÍQUIDO DO EXERCÍCIO'}</span>
                  <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(relatorios.dre.lucroLiquido)}</span>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FLUXO DE CAIXA (DFC - MÉTODO DIRETO) */}
          {/* ========================================================= */}
          {aba === 'dfc' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              {/* OPERACIONAL */}
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #86efac', paddingBottom: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px' }}>⚙️</span>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '16px', wordBreak: 'break-word' }}>Atividades Operacionais</h4>
                </div>
                
                {relatorios.dfc.operacionais.length > 0 ? (
                  relatorios.dfc.operacionais.map((o, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: o.tipo === 'Entrada' ? '#15803d' : '#dc2626', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                      <span style={{ fontWeight: '500', wordBreak: 'break-word' }}>{o.hist}</span>
                      <strong style={{ whiteSpace: 'nowrap', wordBreak: 'break-word' }}>{o.tipo === 'Entrada' ? '+' : '-'} {formatMoeda(o.valor)}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontStyle: 'italic' }}>Sem fluxo de caixa operacional no período.</div>
                )}
              </div>
              
              {/* INVESTIMENTOS E FINANCIAMENTOS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #bfdbfe', paddingBottom: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '20px' }}>🏗️</span>
                    <h4 style={{ margin: 0, color: '#1e40af', fontSize: '16px', wordBreak: 'break-word' }}>Atividades de Invest. / Financ.</h4>
                  </div>
                  
                  {[...relatorios.dfc.investimentos, ...relatorios.dfc.financiamentos].length > 0 ? (
                    [...relatorios.dfc.investimentos, ...relatorios.dfc.financiamentos].map((o, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: o.tipo === 'Entrada' ? '#1d4ed8' : '#d97706', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                        <span style={{ fontWeight: '500', wordBreak: 'break-word' }}>{o.hist}</span>
                        <strong style={{ whiteSpace: 'nowrap', wordBreak: 'break-word' }}>{o.tipo === 'Entrada' ? '+' : '-'} {formatMoeda(o.valor)}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontStyle: 'italic' }}>Sem aquisição de imobilizado ou capital.</div>
                  )}
                </div>

                {/* RESULTADO LÍQUIDO DO CAIXA */}
                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>GERAÇÃO LÍQUIDA DE CAIXA</span>
                  <strong style={{ fontSize: '28px', color: (relatorios.dfc.totalEntradas - relatorios.dfc.totalSaidas) >= 0 ? '#4ade80' : '#f87171', wordBreak: 'break-word' }}>
                    R$ {formatMoeda(relatorios.dfc.totalEntradas - relatorios.dfc.totalSaidas)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MUTAÇÕES DO PATRIMÔNIO LÍQUIDO (DMPL) */}
          {/* ========================================================= */}
          {aba === 'dmpl' && (
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right', minWidth: '550px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'center' }}>
                    <th style={{ padding: '14px', textAlign: 'left', fontSize: '14px' }}>Eventos Patrimoniais (DMPL)</th>
                    <th style={{ padding: '14px' }}>Capital Social (R$)</th>
                    <th style={{ padding: '14px' }}>Lucros / Prejuízos Acum. (R$)</th>
                    <th style={{ padding: '14px', backgroundColor: '#1e40af', fontSize: '14px' }}>TOTAL DO P.L. (R$)</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px', textAlign: 'left', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word' }}>Saldos Iniciais / Integralização</td>
                    <td style={{ padding: '14px', color: '#16a34a', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatMoeda(capitalSocial)}</td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>—</td>
                    <td style={{ padding: '14px', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatMoeda(capitalSocial)}</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #94a3b8', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '14px', textAlign: 'left', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word' }}>Resultado Líquido do Período (Via DRE)</td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>—</td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                    <td style={{ padding: '14px', fontWeight: 'bold', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#eff6ff', fontWeight: '900', fontSize: '15px', color: '#1e40af' }}>
                    <td style={{ padding: '16px', textAlign: 'left', wordBreak: 'break-word' }}>SALDOS FINAIS APURADOS</td>
                    <td style={{ padding: '16px', wordBreak: 'break-word' }}>{formatMoeda(capitalSocial)}</td>
                    <td style={{ padding: '16px', wordBreak: 'break-word' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                    <td style={{ padding: '16px', backgroundColor: '#dbeafe', wordBreak: 'break-word' }}>{formatMoeda(capitalSocial + relatorios.dre.lucroLiquido)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* RAZONETES ANALÍTICOS ("EM T") */}
          {/* ========================================================= */}
          {aba === 'razonetes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              {contasNomes.map(conta => {
                const dados = relatorios.contas[conta];
                const maxLinhas = Math.max(dados.debitos.length, dados.creditos.length);
                const linhas = Array.from({ length: maxLinhas });

                return (
                  <div key={conta} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px', textAlign: 'center', fontWeight: '900', fontSize: '13.5px', borderBottom: '4px solid #3b82f6', letterSpacing: '0.5px', wordBreak: 'break-word' }}>
                      {conta}
                    </div>
                    
                    <div style={{ display: 'flex', fontSize: '12.5px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}>
                      <div style={{ flex: 1, borderRight: '2px solid #0f172a', minHeight: '90px', minWidth: 0 }}>
                        <div style={{ textAlign: 'center', fontWeight: '900', borderBottom: '2px solid #e2e8f0', padding: '6px', color: '#16a34a' }}>DÉBITO</div>
                        {linhas.map((_, i) => (
                          <div key={`d-${i}`} style={{ padding: '6px 8px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px dashed #e2e8f0', minHeight: '18px', wordBreak: 'break-word' }}>
                            <span style={{ fontWeight: '500' }}>{dados.debitos[i] ? formatMoeda(dados.debitos[i].valor) : ''}</span>
                          </div>
                        ))}
                        <div style={{ padding: '8px', fontWeight: '900', borderTop: '2px solid #0f172a', textAlign: 'right', color: '#16a34a', backgroundColor: '#f0fdf4', wordBreak: 'break-word' }}>{formatMoeda(dados.totalD)}</div>
                      </div>

                      <div style={{ flex: 1, minHeight: '90px', minWidth: 0 }}>
                        <div style={{ textAlign: 'center', fontWeight: '900', borderBottom: '2px solid #e2e8f0', padding: '6px', color: '#dc2626' }}>CRÉDITO</div>
                        {linhas.map((_, i) => (
                          <div key={`c-${i}`} style={{ padding: '6px 8px', display: 'flex', justifyContent: 'flex-start', borderBottom: '1px dashed #e2e8f0', minHeight: '18px', wordBreak: 'break-word' }}>
                            <span style={{ fontWeight: '500' }}>{dados.creditos[i] ? formatMoeda(dados.creditos[i].valor) : ''}</span>
                          </div>
                        ))}
                        <div style={{ padding: '8px', fontWeight: '900', borderTop: '2px solid #0f172a', color: '#dc2626', backgroundColor: '#fef2f2', wordBreak: 'break-word' }}>{formatMoeda(dados.totalC)}</div>
                      </div>
                    </div>
                    
                    <div style={{ backgroundColor: '#eff6ff', padding: '10px', textAlign: 'center', borderTop: '1px solid #cbd5e1', fontSize: '13px', wordBreak: 'break-word' }}>
                      Saldo: <strong style={{ color: dados.natureza === 'Devedor' ? '#16a34a' : '#dc2626' }}>R$ {formatMoeda(dados.saldo)} ({dados.natureza.charAt(0)})</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* LIVRO RAZÃO COMPLETO */}
          {/* ========================================================= */}
          {aba === 'razao' && (
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                <label style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#0f172a' }}>Filtrar Extrato por Conta:</label>
                <select value={contaFiltro} onChange={e => setContaFiltro(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13.5px', flex: '1', minWidth: '220px', cursor: 'pointer', boxSizing: 'border-box', backgroundColor: 'white' }}>
                  <option value="">-- Visualizar Todas as Contas do Razão --</option>
                  {contasNomes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '12px 14px', width: '70px' }}>Evento</th>
                      <th style={{ padding: '12px 14px', width: '220px' }}>Conta Analítica</th>
                      <th style={{ padding: '12px 14px' }}>Histórico do Fato Gerador</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px' }}>Débito (R$)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right', width: '120px' }}>Crédito (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.filter(h => !contaFiltro || h.debito === contaFiltro || h.credito === contaFiltro).map((lanc, i) => (
                      <React.Fragment key={i}>
                        {(!contaFiltro || lanc.debito === contaFiltro) && (
                          <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>L. {i+1}</td>
                            <td style={{ padding: '10px 14px', fontWeight: '900', color: '#0f172a', wordBreak: 'break-word' }}>{lanc.debito}</td>
                            <td style={{ padding: '10px 14px', color: '#475569', wordBreak: 'break-word' }}>{lanc.historico}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#16a34a', fontWeight: '900', whiteSpace: 'nowrap' }}>{formatMoeda(lanc.valor)}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', whiteSpace: 'nowrap' }}>—</td>
                          </tr>
                        )}
                        {(!contaFiltro || lanc.credito === contaFiltro) && (
                          <tr style={{ borderBottom: '2px solid #cbd5e1', backgroundColor: '#fef2f2' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>L. {i+1}</td>
                            <td style={{ padding: '10px 14px', fontWeight: '900', color: '#0f172a', wordBreak: 'break-word' }}><span style={{ color: '#dc2626', marginRight: '6px' }}>↳</span>{lanc.credito}</td>
                            <td style={{ padding: '10px 14px', color: '#475569', wordBreak: 'break-word' }}>{lanc.historico}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', whiteSpace: 'nowrap' }}>—</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#dc2626', fontWeight: '900', whiteSpace: 'nowrap' }}>{formatMoeda(lanc.valor)}</td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}