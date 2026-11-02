import React, { useState, useMemo } from 'react';

export default function SimuladorValuationOrcamento({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estado do Simulador de Valuation e Orçamento Base Zero (OBZ)
  const [params, setParams] = useState({
    receitaBaseAnual: 1200000.00, 
    margemFCL: 15, 
    crescimentoAnual: 10, 
    crescimentoPerpetuidade: 3, 
    wacc: 15, 
    percentualVenda: 10 
  });

  const [abaAtiva, setAbaAtiva] = useState('projecao');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO DE VALUATION (FCD)
  // ==========================================
  const calculos = useMemo(() => {
    const wacc = Math.max(params.wacc, params.crescimentoPerpetuidade + 1) / 100;
    const g = params.crescimentoAnual / 100;
    const gPerp = params.crescimentoPerpetuidade / 100;
    const margem = params.margemFCL / 100;

    const projecoes = [];
    let receitaAnterior = params.receitaBaseAnual;
    let somaFCLDescontado = 0;

    for (let ano = 1; ano <= 5; ano++) {
      const receitaProjetada = receitaAnterior * (1 + g);
      const fcl = receitaProjetada * margem; 
      const fatorDesconto = Math.pow(1 + wacc, ano);
      const fclDescontado = fcl / fatorDesconto;

      projecoes.push({
        ano,
        receita: receitaProjetada,
        fcl: fcl,
        fatorDesconto: fatorDesconto,
        fclDescontado: fclDescontado
      });

      somaFCLDescontado += fclDescontado;
      receitaAnterior = receitaProjetada;
    }

    const fclAno5 = projecoes[4].fcl;
    const valorTerminal = (fclAno5 * (1 + gPerp)) / (wacc - gPerp);
    const fatorDescontoAno5 = Math.pow(1 + wacc, 5);
    const valorTerminalDescontado = valorTerminal / fatorDescontoAno5;

    const valuation = somaFCLDescontado + valorTerminalDescontado;
    const valorAporte = valuation * (params.percentualVenda / 100);

    return {
      projecoes,
      somaFCLDescontado,
      valorTerminal,
      valorTerminalDescontado,
      valuation,
      valorAporte
    };
  }, [params]);

  // ==========================================
  // DISPARO PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarAporte = () => {
    if (!calculos) return;
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('Este aporte já foi contabilizado!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro de integração: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      registrarFatoGerador(
        `Aporte de Investidor (${params.percentualVenda}% Equity via Valuation FCD)`,
        calculos.valorAporte,
        'Estratégia/Valuation',
        ['1.1.01.02'], 
        ['3.1.01.01']  
      );

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Aporte milionário escriturado com sucesso no Livro Diário!', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setJaContabilizado(false);
    if (typeof mostrarToast === 'function') mostrarToast('Parâmetros resetados. Recalcule seu Valuation.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #7c3aed', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#7c3aed', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CONTROLADORIA ESTRATÉGICA</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Orçamento & Valuation (FCD)</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Projete o futuro, descubra o valor da empresa e capte investimentos.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('projecao')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'projecao' ? '#7c3aed' : 'transparent', color: abaAtiva === 'projecao' ? 'white' : '#cbd5e1' }}>⚙️ Parâmetros</button>
          <button onClick={() => setAbaAtiva('valuation')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'valuation' ? '#7c3aed' : 'transparent', color: abaAtiva === 'valuation' ? 'white' : '#cbd5e1' }}>📈 Valuation FCD</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#7c3aed' : 'transparent', color: abaAtiva === 'memoria' ? 'white' : '#cbd5e1' }}>🧠 Memória</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#7c3aed' : 'transparent', color: abaAtiva === 'contabilidade' ? 'white' : '#cbd5e1' }}>💰 Captação</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: PARÂMETROS E PROJEÇÃO
            ======================================================== */}
        {abaAtiva === 'projecao' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>📋 Premissas do Orçamento e Custo de Capital</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="valRecBase" style={labelStyle}>Receita Base Atual (R$ / Ano):</label>
                  <input id="valRecBase" name="valRecBase" type="number" style={{...inputStyle, borderColor: '#a78bfa', backgroundColor: '#faf5ff'}} value={params.receitaBaseAnual} onChange={e => {setParams({...params, receitaBaseAnual: e.target.value}); setJaContabilizado(false);}} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="valCresc" style={labelStyle}>Crescimento Anos 1 a 5 (% a.a):</label>
                    <input id="valCresc" name="valCresc" type="number" style={inputStyle} value={params.crescimentoAnual} onChange={e => {setParams({...params, crescimentoAnual: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="valMargem" style={labelStyle}>Margem FCL / EBITDA (%):</label>
                    <input id="valMargem" name="valMargem" type="number" style={inputStyle} value={params.margemFCL} onChange={e => {setParams({...params, margemFCL: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="valWacc" style={{ ...labelStyle, color: '#dc2626' }}>Risco do Negócio (WACC %):</label>
                    <input id="valWacc" name="valWacc" type="number" style={{ ...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2' }} value={params.wacc} onChange={e => {setParams({...params, wacc: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="valPerp" style={{ ...labelStyle, color: '#0d9488' }}>Cresc. Perpetuidade (%):</label>
                    <input id="valPerp" name="valPerp" type="number" style={{ ...inputStyle, borderColor: '#99f6e4', backgroundColor: '#f0fdfa' }} value={params.crescimentoPerpetuidade} onChange={e => {setParams({...params, crescimentoPerpetuidade: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f1f5f9', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="valFatia" style={{ ...labelStyle, color: '#1e40af' }}>Tamanho da Captação (% Equity):</label>
                  <input id="valFatia" name="valFatia" type="number" min="1" max="100" style={{...inputStyle, borderColor: '#93c5fd'}} value={params.percentualVenda} onChange={e => {setParams({...params, percentualVenda: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Fatia oferecida ao investidor em troca do aporte.</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE PROJEÇÃO DE 5 ANOS */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>🔭 Orçamento e Projeção (Anos 1 a 5)</h3>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right', minWidth: '340px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Ano</th>
                      <th style={{ padding: '10px 12px' }}>Receita Bruta</th>
                      <th style={{ padding: '10px 12px' }}>Fluxo Caixa Livre (FCL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculos.projecoes.map((p) => (
                      <tr key={p.ano} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold' }}>Ano {p.ano}</td>
                        <td style={{ padding: '10px 12px', color: '#1e40af', wordBreak: 'break-word' }}>{formatMoeda(p.receita)}</td>
                        <td style={{ padding: '10px 12px', color: '#16a34a', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatMoeda(p.fcl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', padding: '14px', borderRadius: '10px', marginTop: '16px', borderLeft: '4px solid #c026d3', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '12.5px', color: '#a21caf', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Entendendo a Projeção:</strong>
                <span style={{ fontSize: '12px', color: '#86198f', wordBreak: 'break-word' }}>
                  A receita cresce {params.crescimentoAnual}% ao ano. O FCL representa {params.margemFCL}% dessa receita. O investidor compra esse fluxo futuro.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: VALUATION (CÁLCULO DO ENTERPRISE VALUE)
            ======================================================== */}
        {abaAtiva === 'valuation' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📈 Cálculo do Enterprise Value (FCD)</h2>
            
            <div style={{ overflowX: 'auto', marginBottom: '20px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', minWidth: '500px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Período</th>
                    <th style={{ padding: '12px 14px' }}>FCL Projetado (R$)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Fator Desconto (WACC)</th>
                    <th style={{ padding: '12px 14px' }}>Valor Presente (VP)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculos.projecoes.map((p) => (
                    <tr key={p.ano} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>Ano {p.ano}</td>
                      <td style={{ padding: '10px 14px', color: '#16a34a', wordBreak: 'break-word' }}>{formatMoeda(p.fcl)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>÷ {formatNum(p.fatorDesconto, 4)}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#7c3aed', wordBreak: 'break-word' }}>{formatMoeda(p.fclDescontado)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>Perpetuidade (Ano 6 a ∞)</td>
                    <td style={{ padding: '10px 14px', color: '#16a34a', wordBreak: 'break-word' }}>Term: {formatMoeda(calculos.valorTerminal)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>÷ {formatNum(Math.pow(1 + (params.wacc/100), 5), 4)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '900', color: '#7c3aed', wordBreak: 'break-word' }}>{formatMoeda(calculos.valorTerminalDescontado)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enterprise Value (Valuation Total)</span>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80', margin: '8px 0', wordBreak: 'break-word' }}>
                  {formatMoeda(calculos.valuation)}
                </div>
                <span style={{ fontSize: '11.5px', color: '#cbd5e1', wordBreak: 'border-word' }}>Soma do VP dos 5 Anos + Perpetuidade. Valor de 100% da empresa hoje.</span>
              </div>

              <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '20px', borderRadius: '16px', borderLeft: '6px solid #9333ea', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket de Aporte ({params.percentualVenda}% Equity)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#9333ea', margin: '8px 0', wordBreak: 'break-word' }}>
                  {formatMoeda(calculos.valorAporte)}
                </div>
                <span style={{ fontSize: '11.5px', color: '#6b21a8', wordBreak: 'break-word' }}>Valor necessário que o investidor injetará no caixa pela fatia.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🧠 A Engenharia por trás do Valuation</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>⚖️</span> O que é o WACC?</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  <strong>Custo Médio Ponderado de Capital.</strong> Uma taxa de {params.wacc}% significa que o investidor exige, no mínimo, esse retorno ao ano para assumir o risco da empresa. O WACC desvaloriza os lucros futuros pelo tempo e pelo risco.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>♾️</span> A Mágica da Perpetuidade</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  A Perpetuidade de Gordon assume que após o Ano 5, a empresa crescerá a uma taxa constante ({params.crescimentoPerpetuidade}%).<br/><br/>
                  <strong>Fórmula:</strong> <code>Terminal = FCL 5 * (1 + g) / (WACC - g)</code>. Representa mais de 60% do valor total da empresa.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>💵</span> Fluxo de Caixa Livre (FCL)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  Lucro contábil não é dinheiro no caixa. O FCL é o EBITDA menos impostos, investimentos em CAPEX e capital de giro. Assume-se que {params.margemFCL}% da receita vira dinheiro livre.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO DO M&A
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>💰 A Captação de Capital e o Ágio (M&A)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              O investidor aceitou o Valuation. Ele transferirá <strong>{formatMoeda(calculos.valorAporte)}</strong> por {params.percentualVenda}% do negócio. Veja a escrituração contábil.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>
                Lançamento de Aumento de Capital Subscrito
              </div>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 0' }}>Conta Contábil (Plano de Contas)</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Débito</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Crédito</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 0', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>ATIVO</span>
                        <strong>1.1.01.02 - Banco Conta Movimento (Caixa)</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.valorAporte)}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>P. LÍQUIDO</span>
                        <strong>3.1.01.01 - Capital Social / Ágio</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.valorAporte)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px', borderTop: '2px solid #334155', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '14.5px' }}>Efeito Patrimonial:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '13.5px', wordBreak: 'break-word' }}>Injeção de liquidez sem geração de dívida (Passivo).</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #16a34a', flex: '1 1 300px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block', marginBottom: '6px' }}>Nota de Auditoria (CPC 39 / CVM)</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#15803d', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  A injeção de {formatMoeda(calculos.valorAporte)} não transita pela DRE (não é Receita). É uma transação puramente patrimonial (Capitalização).
                </p>
              </div>

              <button 
                onClick={handleContabilizarAporte}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#7c3aed', 
                  color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '14px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s', width: '100%', maxWidth: '360px', boxSizing: 'border-box'
                }}
              >
                {jaContabilizado ? '✓ Capital Injetado no ERP' : '💸 Assinar Contrato e Injetar Capital'}
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}