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
      
      // Montagem Razonetes
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

      // Montagem DFC (Método Direto - Analisando Caixa/Bancos)
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
      
      // Classificação DRE
      if (nLower.includes('receita') || nLower.includes('venda')) receitaTotal += (c.totalC - c.totalD);
      else if (nLower.includes('imposto sobre') || nLower.includes('abatimento')) deducoesTotal += (c.totalD - c.totalC);
      else if (nLower.includes('cmv') || nLower.includes('csv') || nLower.includes('custo')) custosTotal += (c.totalD - c.totalC);
      else if (nLower.includes('despesa') || nLower.includes('salário') || nLower.includes('juro')) despesasTotal += (c.totalD - c.totalC);
      
      // Classificação Balanço
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
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif', color: '#1e293b', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO EXECUTIVO DA EMPRESA SELECIONADA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>
            MÓDULO DE CONTROLADORIA
          </span>
          <h2 style={{ margin: '8px 0 4px 0', fontSize: '24px', color: '#0f172a', fontWeight: '900' }}>Relatórios Contábeis Oficiais</h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Conformidade com as Normas Brasileiras de Contabilidade (NBC TG).</span>
        </div>
        
        <div style={{ textAlign: 'right', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '250px' }}>
          {empresa ? (
            <>
              <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a', fontWeight: '900' }}>{empresa.nome_empresa || empresa.nome || 'Empresa em Análise'}</strong>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>CNPJ: {empresa.cnpj || 'Não cadastrado'}</span>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{empresa.regime_tributario || 'Regime Padrão'}</span>
            </>
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma entidade selecionada no Dashboard.</span>
          )}
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO DE RELATÓRIOS (TABS) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        {[
          { id: 'balanco', icone: '⚖️', label: 'Balanço Patrimonial' },
          { id: 'dre', icone: '📉', label: 'DRE' },
          { id: 'dfc', icone: '💵', label: 'Fluxo de Caixa (DFC)' },
          { id: 'dmpl', icone: '📈', label: 'Mutações PL (DMPL)' },
          { id: 'razonetes', icone: 'T', label: 'Razonetes Analíticos' },
          { id: 'razao', icone: '📖', label: 'Livro Razão' }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setAba(tab.id)} 
            style={{ 
              padding: '10px 14px', borderRadius: '6px', border: 'none', 
              backgroundColor: aba === tab.id ? '#0f172a' : 'transparent', 
              color: aba === tab.id ? 'white' : '#475569', 
              fontWeight: aba === tab.id ? 'bold' : '600', 
              cursor: 'pointer', transition: 'all 0.2s', flex: '1 1 auto', fontSize: '13px',
              boxShadow: aba === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ marginRight: '6px' }}>{tab.icone}</span> {tab.label}
          </button>
        ))}
      </div>

      {historico.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b', border: '2px dashed #cbd5e1' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📭</span>
          <strong style={{ fontSize: '16px', display: 'block', color: '#0f172a' }}>O Livro Diário está vazio.</strong>
          <span style={{ fontSize: '14px' }}>Realize lançamentos em partidas dobradas para o motor gerar os relatórios.</span>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {/* ========================================================= */}
          {/* BALANÇO PATRIMONIAL */}
          {/* ========================================================= */}
          {aba === 'balanco' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* LADO DO ATIVO */}
              <div style={{ border: '2px solid #2563eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)' }}>
                <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px', fontWeight: '900', textAlign: 'center', fontSize: '16px', letterSpacing: '1px' }}>
                  ATIVO (Aplicações)
                </div>
                <div style={{ padding: '20px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af', fontSize: '15px' }}>
                    <span>Ativo Circulante</span><span>R$ {formatMoeda(relatorios.balanco.ativoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
                    Disponibilidades, Direitos Curto Prazo, Estoques...
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', color: '#1e40af', fontSize: '15px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                    <span>Ativo Não Circulante</span><span>R$ {formatMoeda(relatorios.balanco.ativoNaoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                    Imobilizado, Intangível, Investimentos...
                  </div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px 20px', borderTop: '2px solid #2563eb', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#1d4ed8', fontSize: '18px' }}>
                  <span>TOTAL DO ATIVO</span><span>R$ {formatMoeda(relatorios.balanco.ativoCirculante + relatorios.balanco.ativoNaoCirculante)}</span>
                </div>
              </div>

              {/* LADO DO PASSIVO E PL */}
              <div style={{ border: '2px solid #dc2626', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)' }}>
                <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '16px', fontWeight: '900', textAlign: 'center', fontSize: '16px', letterSpacing: '1px' }}>
                  PASSIVO E P.L. (Origens)
                </div>
                <div style={{ padding: '20px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', color: '#991b1b', fontSize: '15px' }}>
                    <span>Passivo Circulante</span><span>R$ {formatMoeda(relatorios.balanco.passivoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
                    Obrigações Trabalhistas, Fiscais, Fornecedores...
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', color: '#991b1b', fontSize: '15px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                    <span>Passivo Não Circulante</span><span>R$ {formatMoeda(relatorios.balanco.passivoNaoCirculante)}</span>
                  </div>
                  <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
                    Empréstimos e Obrigações Longo Prazo...
                  </div>

                  <div style={{ borderTop: '2px solid #fca5a5', margin: '20px 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#166534', fontSize: '15px' }}>
                    <span>Patrimônio Líquido</span><span>R$ {formatMoeda(relatorios.balanco.patrimonioLiquido)}</span>
                  </div>
                  <div style={{ paddingLeft: '12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                    Capital, Reservas, Lucros Acumulados...
                  </div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '16px 20px', borderTop: '2px solid #dc2626', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#b91c1c', fontSize: '18px' }}>
                  <span>TOTAL PASSIVO + PL</span><span>R$ {formatMoeda(relatorios.balanco.passivoCirculante + relatorios.balanco.passivoNaoCirculante + relatorios.balanco.patrimonioLiquido)}</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* DRE - DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO */}
          {/* ========================================================= */}
          {aba === 'dre' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '18px', fontWeight: '900', textAlign: 'center', fontSize: '18px', letterSpacing: '1px' }}>
                Demonstração do Resultado do Exercício (DRE)
              </div>
              <div style={{ padding: '24px', backgroundColor: '#ffffff', fontSize: '15px', lineHeight: '2.2' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>(+) Receita Bruta de Vendas / Serviços</span><span style={{ color: '#16a34a' }}>R$ {formatMoeda(relatorios.dre.receitaTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ paddingLeft: '20px' }}>(-) Deduções, Impostos e Devoluções</span><span>(R$ {formatMoeda(relatorios.dre.deducoesTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', color: '#0f172a', fontSize: '16px' }}>
                  <span>(=) RECEITA LÍQUIDA</span><span>R$ {formatMoeda(relatorios.dre.receitaTotal - relatorios.dre.deducoesTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ paddingLeft: '20px' }}>(-) Custo dos Produtos/Serviços (CMV/CSV)</span><span>(R$ {formatMoeda(relatorios.dre.custosTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', color: '#1e40af', fontSize: '16px' }}>
                  <span>(=) LUCRO BRUTO</span><span>R$ {formatMoeda(relatorios.dre.lucroBruto)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ paddingLeft: '20px' }}>(-) Despesas Operacionais / Adm. / Financeiras</span><span>(R$ {formatMoeda(relatorios.dre.despesasTotal)})</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '4px solid #0f172a', paddingTop: '16px', marginTop: '16px', fontSize: '20px', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626', backgroundColor: relatorios.dre.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2', padding: '16px', borderRadius: '8px' }}>
                  <span>{relatorios.dre.lucroLiquido >= 0 ? '(=) LUCRO LÍQUIDO DO EXERCÍCIO' : '(=) PREJUÍZO LÍQUIDO DO EXERCÍCIO'}</span>
                  <span>R$ {formatMoeda(relatorios.dre.lucroLiquido)}</span>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FLUXO DE CAIXA (DFC - MÉTODO DIRETO) */}
          {/* ========================================================= */}
          {aba === 'dfc' && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {/* OPERACIONAL */}
              <div style={{ flex: '1 1 350px', backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #86efac', paddingBottom: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '24px' }}>⚙️</span>
                  <h4 style={{ margin: 0, color: '#166534', fontSize: '18px' }}>Atividades Operacionais</h4>
                </div>
                
                {relatorios.dfc.operacionais.length > 0 ? (
                  relatorios.dfc.operacionais.map((o, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '12px', color: o.tipo === 'Entrada' ? '#15803d' : '#dc2626', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '500' }}>{o.hist}</span>
                      <strong style={{ whiteSpace: 'nowrap' }}>{o.tipo === 'Entrada' ? '+' : '-'} {formatMoeda(o.valor)}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontStyle: 'italic' }}>Sem fluxo de caixa operacional no período.</div>
                )}
              </div>
              
              {/* INVESTIMENTOS E FINANCIAMENTOS */}
              <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #bfdbfe', paddingBottom: '12px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '24px' }}>🏗️</span>
                    <h4 style={{ margin: 0, color: '#1e40af', fontSize: '18px' }}>Atividades de Invest. / Financ.</h4>
                  </div>
                  
                  {[...relatorios.dfc.investimentos, ...relatorios.dfc.financiamentos].length > 0 ? (
                    [...relatorios.dfc.investimentos, ...relatorios.dfc.financiamentos].map((o, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '12px', color: o.tipo === 'Entrada' ? '#1d4ed8' : '#d97706', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                        <span style={{ fontWeight: '500' }}>{o.hist}</span>
                        <strong style={{ whiteSpace: 'nowrap' }}>{o.tipo === 'Entrada' ? '+' : '-'} {formatMoeda(o.valor)}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontStyle: 'italic' }}>Sem aquisição de imobilizado ou capital.</div>
                  )}
                </div>

                {/* RESULTADO LÍQUIDO DO CAIXA */}
                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>GERAÇÃO LÍQUIDA DE CAIXA</span>
                  <strong style={{ fontSize: '36px', color: (relatorios.dfc.totalEntradas - relatorios.dfc.totalSaidas) >= 0 ? '#4ade80' : '#f87171' }}>
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
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'center' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '15px' }}>Eventos Patrimoniais (DMPL)</th>
                    <th style={{ padding: '16px' }}>Capital Social (R$)</th>
                    <th style={{ padding: '16px' }}>Lucros / Prejuízos Acum. (R$)</th>
                    <th style={{ padding: '16px', backgroundColor: '#1e40af', fontSize: '15px' }}>TOTAL DO P.L. (R$)</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Saldos Iniciais / Integralização</td>
                    <td style={{ padding: '16px', color: '#16a34a', fontWeight: 'bold' }}>{formatMoeda(capitalSocial)}</td>
                    <td style={{ padding: '16px', color: '#94a3b8' }}>—</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{formatMoeda(capitalSocial)}</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #94a3b8', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Resultado Líquido do Período (Via DRE)</td>
                    <td style={{ padding: '16px', color: '#94a3b8' }}>—</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold', color: relatorios.dre.lucroLiquido >= 0 ? '#16a34a' : '#dc2626' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#eff6ff', fontWeight: '900', fontSize: '16px', color: '#1e40af' }}>
                    <td style={{ padding: '20px', textAlign: 'left' }}>SALDOS FINAIS APURADOS</td>
                    <td style={{ padding: '20px' }}>{formatMoeda(capitalSocial)}</td>
                    <td style={{ padding: '20px' }}>{formatMoeda(relatorios.dre.lucroLiquido)}</td>
                    <td style={{ padding: '20px', backgroundColor: '#dbeafe' }}>{formatMoeda(capitalSocial + relatorios.dre.lucroLiquido)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* RAZONETES ANALÍTICOS ("EM T") */}
          {/* ========================================================= */}
          {aba === 'razonetes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {contasNomes.map(conta => {
                const dados = relatorios.contas[conta];
                const maxLinhas = Math.max(dados.debitos.length, dados.creditos.length);
                const linhas = Array.from({ length: maxLinhas });

                return (
                  <div key={conta} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px', textAlign: 'center', fontWeight: '900', fontSize: '14px', borderBottom: '4px solid #3b82f6', letterSpacing: '0.5px' }}>
                      {conta}
                    </div>
                    
                    {/* O "T" DO RAZONETE */}
                    <div style={{ display: 'flex', fontSize: '13px', backgroundColor: '#f8fafc' }}>
                      <div style={{ flex: 1, borderRight: '2px solid #0f172a', minHeight: '100px' }}>
                        <div style={{ textAlign: 'center', fontWeight: '900', borderBottom: '2px solid #e2e8f0', padding: '8px', color: '#16a34a' }}>DÉBITO</div>
                        {linhas.map((_, i) => (
                          <div key={`d-${i}`} style={{ padding: '6px 10px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px dashed #e2e8f0', minHeight: '20px' }}>
                            <span style={{ fontWeight: '500' }}>{dados.debitos[i] ? formatMoeda(dados.debitos[i].valor) : ''}</span>
                          </div>
                        ))}
                        <div style={{ padding: '8px 10px', fontWeight: '900', borderTop: '2px solid #0f172a', textAlign: 'right', color: '#16a34a', backgroundColor: '#f0fdf4' }}>{formatMoeda(dados.totalD)}</div>
                      </div>

                      <div style={{ flex: 1, minHeight: '100px' }}>
                        <div style={{ textAlign: 'center', fontWeight: '900', borderBottom: '2px solid #e2e8f0', padding: '8px', color: '#dc2626' }}>CRÉDITO</div>
                        {linhas.map((_, i) => (
                          <div key={`c-${i}`} style={{ padding: '6px 10px', display: 'flex', justifyContent: 'flex-start', borderBottom: '1px dashed #e2e8f0', minHeight: '20px' }}>
                            <span style={{ fontWeight: '500' }}>{dados.creditos[i] ? formatMoeda(dados.creditos[i].valor) : ''}</span>
                          </div>
                        ))}
                        <div style={{ padding: '8px 10px', fontWeight: '900', borderTop: '2px solid #0f172a', color: '#dc2626', backgroundColor: '#fef2f2' }}>{formatMoeda(dados.totalC)}</div>
                      </div>
                    </div>
                    
                    <div style={{ backgroundColor: '#eff6ff', padding: '12px', textAlign: 'center', borderTop: '1px solid #cbd5e1', fontSize: '14px' }}>
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
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>Filtrar Extrato por Conta:</label>
                <select value={contaFiltro} onChange={e => setContaFiltro(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '14px', flex: '1', maxWidth: '400px', cursor: 'pointer' }}>
                  <option value="">-- Visualizar Todas as Contas do Razão --</option>
                  {contasNomes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '14px', width: '80px' }}>Evento</th>
                      <th style={{ padding: '14px', width: '250px' }}>Conta Analítica Movimentada</th>
                      <th style={{ padding: '14px' }}>Histórico do Fato Gerador</th>
                      <th style={{ padding: '14px', textAlign: 'right', width: '140px' }}>Débito (R$)</th>
                      <th style={{ padding: '14px', textAlign: 'right', width: '140px' }}>Crédito (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.filter(h => !contaFiltro || h.debito === contaFiltro || h.credito === contaFiltro).map((lanc, i) => (
                      <React.Fragment key={i}>
                        {(!contaFiltro || lanc.debito === contaFiltro) && (
                          <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#475569' }}>L. {i+1}</td>
                            <td style={{ padding: '12px 14px', fontWeight: '900', color: '#0f172a' }}>{lanc.debito}</td>
                            <td style={{ padding: '12px 14px', color: '#475569' }}>{lanc.historico}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a', fontWeight: '900' }}>{formatMoeda(lanc.valor)}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                          </tr>
                        )}
                        {(!contaFiltro || lanc.credito === contaFiltro) && (
                          <tr style={{ borderBottom: '2px solid #cbd5e1', backgroundColor: '#fef2f2' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#475569' }}>L. {i+1}</td>
                            <td style={{ padding: '12px 14px', fontWeight: '900', color: '#0f172a' }}><span style={{ color: '#dc2626', marginRight: '8px' }}>↳</span>{lanc.credito}</td>
                            <td style={{ padding: '12px 14px', color: '#475569' }}>{lanc.historico}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#94a3b8' }}>—</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#dc2626', fontWeight: '900' }}>{formatMoeda(lanc.valor)}</td>
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
    </div>
  );
}