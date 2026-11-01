import React, { useState, useMemo } from 'react';

export default function SimuladorValuationOrcamento({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estado do Simulador de Valuation e Orçamento Base Zero (OBZ)
  const [params, setParams] = useState({
    receitaBaseAnual: 1200000.00, // R$ 1.2M
    margemFCL: 15, // Margem de Fluxo de Caixa Livre (%)
    crescimentoAnual: 10, // Crescimento projetado anos 1 a 5 (%)
    crescimentoPerpetuidade: 3, // Crescimento na perpetuidade (g) (%)
    wacc: 15, // Custo Médio Ponderado de Capital (%)
    percentualVenda: 10 // Venda de X% do Equity para o Investidor
  });

  const [abaAtiva, setAbaAtiva] = useState('projecao');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO DE VALUATION (FCD)
  // ==========================================
  const calculos = useMemo(() => {
    // Travas matemáticas para evitar erros (WACC deve ser maior que Perpetuidade)
    const wacc = Math.max(params.wacc, params.crescimentoPerpetuidade + 1) / 100;
    const g = params.crescimentoAnual / 100;
    const gPerp = params.crescimentoPerpetuidade / 100;
    const margem = params.margemFCL / 100;

    const projecoes = [];
    let receitaAnterior = params.receitaBaseAnual;
    let somaFCLDescontado = 0;

    // Projeção Explícita de 5 Anos
    for (let ano = 1; ano <= 5; ano++) {
      const receitaProjetada = receitaAnterior * (1 + g);
      const fcl = receitaProjetada * margem; // Fluxo de Caixa Livre
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

    // Cálculo da Valor Terminal (Perpetuidade) no Ano 5
    const fclAno5 = projecoes[4].fcl;
    const valorTerminal = (fclAno5 * (1 + gPerp)) / (wacc - gPerp);
    const fatorDescontoAno5 = Math.pow(1 + wacc, 5);
    const valorTerminalDescontado = valorTerminal / fatorDescontoAno5;

    // Valuation Total (Enterprise Value)
    const valuation = somaFCLDescontado + valorTerminalDescontado;
    
    // Valor do Aporte (Venda da fatia para o Investidor)
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
      // Entrada de Caixa pelo Aporte do Investidor baseado no Valuation
      registrarFatoGerador(
        `Aporte de Investidor (${params.percentualVenda}% Equity via Valuation FCD)`,
        calculos.valorAporte,
        'Estratégia/Valuation',
        ['1.1.01.02'], // Débito: Banco (Entrada do Dinheiro)
        ['3.1.01.01']  // Crédito: Capital Social Subscrito/Integralizado (PL)
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

  // Estilos Padronizados
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #7c3aed' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#7c3aed', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CONTROLADORIA ESTRATÉGICA</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Orçamento & Valuation (FCD)</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Projete o futuro, descubra o valor da empresa e capte investimentos.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('projecao')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'projecao' ? '#7c3aed' : 'transparent', color: abaAtiva === 'projecao' ? 'white' : '#cbd5e1' }}>⚙️ Parâmetros</button>
          <button onClick={() => setAbaAtiva('valuation')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'valuation' ? '#7c3aed' : 'transparent', color: abaAtiva === 'valuation' ? 'white' : '#cbd5e1' }}>📈 Valuation FCD</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#7c3aed' : 'transparent', color: abaAtiva === 'memoria' ? 'white' : '#cbd5e1' }}>🧠 Memória de Cálculo</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#7c3aed' : 'transparent', color: abaAtiva === 'contabilidade' ? 'white' : '#cbd5e1' }}>💰 Captação (M&A)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: PARÂMETROS E PROJEÇÃO
            ======================================================== */}
        {abaAtiva === 'projecao' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📋 Premissas do Orçamento e Custo de Capital</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="valRecBase" style={labelStyle}>Receita Base Atual (R$ / Ano):</label>
                  <input id="valRecBase" name="valRecBase" type="number" style={{...inputStyle, borderColor: '#a78bfa', backgroundColor: '#faf5ff'}} value={params.receitaBaseAnual} onChange={e => {setParams({...params, receitaBaseAnual: e.target.value}); setJaContabilizado(false);}} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="valCresc" style={labelStyle}>Crescimento Anos 1 a 5 (% a.a):</label>
                    <input id="valCresc" name="valCresc" type="number" style={inputStyle} value={params.crescimentoAnual} onChange={e => {setParams({...params, crescimentoAnual: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div>
                    <label htmlFor="valMargem" style={labelStyle}>Margem FCL / EBITDA (%):</label>
                    <input id="valMargem" name="valMargem" type="number" style={inputStyle} value={params.margemFCL} onChange={e => {setParams({...params, margemFCL: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div>
                    <label htmlFor="valWacc" style={{ ...labelStyle, color: '#dc2626' }}>Risco do Negócio (WACC %):</label>
                    <input id="valWacc" name="valWacc" type="number" style={{ ...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2' }} value={params.wacc} onChange={e => {setParams({...params, wacc: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div>
                    <label htmlFor="valPerp" style={{ ...labelStyle, color: '#0d9488' }}>Cresc. na Perpetuidade (%):</label>
                    <input id="valPerp" name="valPerp" type="number" style={{ ...inputStyle, borderColor: '#99f6e4', backgroundColor: '#f0fdfa' }} value={params.crescimentoPerpetuidade} onChange={e => {setParams({...params, crescimentoPerpetuidade: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}>
                  <label htmlFor="valFatia" style={{ ...labelStyle, color: '#1e40af' }}>Tamanho da Captação (Venda de % da Empresa):</label>
                  <input id="valFatia" name="valFatia" type="number" min="1" max="100" style={{...inputStyle, borderColor: '#93c5fd'}} value={params.percentualVenda} onChange={e => {setParams({...params, percentualVenda: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block' }}>*Esta é a fatia (Equity) que será oferecida ao investidor em troca do aporte.</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE PROJEÇÃO DE 5 ANOS */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🔭 Orçamento e Projeção (Anos 1 a 5)</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Ano</th>
                    <th style={{ padding: '10px' }}>Receita Bruta</th>
                    <th style={{ padding: '10px' }}>Fluxo Caixa Livre (FCL)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculos.projecoes.map((p) => (
                    <tr key={p.ano} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{p.ano}</td>
                      <td style={{ padding: '10px', color: '#1e40af' }}>{formatMoeda(p.receita)}</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>{formatMoeda(p.fcl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', padding: '16px', borderRadius: '8px', marginTop: '20px', borderLeft: '4px solid #c026d3' }}>
                <strong style={{ fontSize: '13px', color: '#a21caf', display: 'block', marginBottom: '4px' }}>Entendendo a Projeção:</strong>
                <span style={{ fontSize: '12px', color: '#86198f' }}>
                  A receita cresce {params.crescimentoAnual}% ao ano. O Fluxo de Caixa Livre (dinheiro real que sobra para os acionistas) representa {params.margemFCL}% dessa receita. O investidor não compra a receita atual, ele compra esse fluxo futuro.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: VALUATION (CÁLCULO DO ENTERPRISE VALUE)
            ======================================================== */}
        {abaAtiva === 'valuation' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>📈 Cálculo do Enterprise Value (FCD)</h2>
            
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Período</th>
                    <th style={{ padding: '14px' }}>FCL Projetado (R$)</th>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Fator Desconto (WACC)</th>
                    <th style={{ padding: '14px' }}>Valor Presente (VP)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculos.projecoes.map((p) => (
                    <tr key={p.ano} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Ano {p.ano}</td>
                      <td style={{ padding: '12px', color: '#16a34a' }}>{formatMoeda(p.fcl)}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>÷ {formatNum(p.fatorDesconto, 4)}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#7c3aed' }}>{formatMoeda(p.fclDescontado)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Perpetuidade (Anos 6 a ∞)</td>
                    <td style={{ padding: '12px', color: '#16a34a' }}>Valor Terminal: {formatMoeda(calculos.valorTerminal)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>÷ {formatNum(Math.pow(1 + (params.wacc/100), 5), 4)}</td>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#7c3aed' }}>{formatMoeda(calculos.valorTerminalDescontado)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Enterprise Value (Valuation Total)</span>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#4ade80', margin: '10px 0' }}>
                  {formatMoeda(calculos.valuation)}
                </div>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Soma do Valor Presente dos 5 Anos + Perpetuidade. Este é o valor de 100% da empresa hoje.</span>
              </div>

              <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '24px', borderRadius: '12px', borderLeft: '6px solid #9333ea', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#7e22ce', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Ticket de Aporte ({params.percentualVenda}% do Equity)</span>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#9333ea', margin: '10px 0' }}>
                  {formatMoeda(calculos.valorAporte)}
                </div>
                <span style={{ fontSize: '12px', color: '#6b21a8' }}>Valor que o investidor precisará injetar no caixa para ser dono de {params.percentualVenda}% do negócio.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO (DIDÁTICO)
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>🧠 A Engenharia por trás do Valuation</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', color: '#7c3aed', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>⚖️</span> O que é o WACC?</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  <strong>Custo Médio Ponderado de Capital.</strong> Dinheiro tem custo e risco. Uma taxa de {params.wacc}% significa que o investidor exige, no mínimo, esse retorno ao ano para assumir o risco da sua empresa. Se ele deixasse o dinheiro na Selic (Tesouro Direto), ganharia ~10% sem risco. O WACC é a taxa que "puxa" os lucros futuros de volta para o valor presente, desvalorizando-os pelo tempo e pelo risco.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', color: '#7c3aed', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>♾️</span> A Mágica da Perpetuidade</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  Não podemos calcular o fluxo ano a ano até o fim dos tempos. A Perpetuidade de Gordon assume que após o Ano 5, a empresa crescerá a uma taxa constante (geralmente próxima à inflação, ex: {params.crescimentoPerpetuidade}%).<br/><br/>
                  <strong>Fórmula:</strong> <code>Valor Terminal = FCL Ano 5 * (1 + g) / (WACC - g)</code>. A Perpetuidade geralmente representa mais de 60% do valor total da empresa!
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>💵</span> Fluxo de Caixa Livre (FCL)</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#15803d', lineHeight: '1.6' }}>
                  Lucro Contábil (DRE) não é Dinheiro no Caixa. O FCL é o EBITDA (Lucro Operacional) menos os Impostos (IRPJ/CSLL), menos o Reinvestimento em Máquinas (CAPEX) e Variação de Capital de Giro.<br/>
                  Neste laboratório, assumimos que {params.margemFCL}% do que a empresa fatura vira dinheiro livre e desimpedido para os sócios.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO DO M&A
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>💰 A Captação de Capital e o Ágio (M&A)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              O investidor aceitou o Valuation. Ele vai transferir <strong>{formatMoeda(calculos.valorAporte)}</strong> para comprar {params.percentualVenda}% do seu negócio. Veja como isso é escriturado na Contabilidade.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px' }}>
                Lançamento de Aumento de Capital Subscrito
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 0' }}>Conta Contábil (Plano de Contas)</th>
                    <th style={{ padding: '10px 0', textAlign: 'right' }}>Débito</th>
                    <th style={{ padding: '10px 0', textAlign: 'right' }}>Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 0' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>ATIVO</span>
                      <strong>1.1.01.02 - Banco Conta Movimento (Caixa do Aporte)</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.valorAporte)}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 0', paddingLeft: '20px' }}>
                      <span style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>P. LÍQUIDO</span>
                      <strong>3.1.01.01 - Capital Social / Ágio na Emissão de Ações</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.valorAporte)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '20px', borderTop: '2px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>Efeito Patrimonial:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '15px' }}>Injeção de liquidez sem geração de dívida (Passivo).</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #16a34a', maxWidth: '600px' }}>
                <strong style={{ fontSize: '14px', color: '#166534', display: 'block', marginBottom: '8px' }}>Nota de Auditoria (CPC 39 / CVM)</strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
                  A injeção de {formatMoeda(calculos.valorAporte)} não transita pela DRE (não é Receita e não paga impostos como IRPJ ou PIS/COFINS). É uma transação puramente patrimonial (Capitalização) entre a empresa e o novo sócio.
                </p>
              </div>

              <button 
                onClick={handleContabilizarAporte}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#7c3aed', 
                  color: 'white', border: 'none', padding: '16px 24px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '15px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {jaContabilizado ? '✓ Capital Injetado no ERP' : '💸 Assinar Contrato e Injetar Capital no Diário'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}