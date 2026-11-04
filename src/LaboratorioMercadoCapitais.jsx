import React, { useState, useEffect } from 'react';

export default function LaboratorioMercadoCapitais({ mostrarToast }) {
  // ==========================================
  // 1. CATÁLOGO DE CENÁRIOS (EMPRESAS B3)
  // ==========================================
  const catalogoCasos = [
    {
      id: 'cash_cow', ticker: 'ENGI11', nome: '⚡ Transmissora Elétrica (Cash Cow)', perfil: 'Dividend Yield Alto • Baixa Alavancagem Operacional',
      setup: () => {
        setParamGerais({ lucroLiquido: 50000000, acoesEmitidas: 10000000, caixaDisponivel: 40000000, aliquotaMarginalPct: 34 });
        setParamAlavancagem({ precoVenda: 100, custoVariavel: 30, custoFixo: 15000000, quantidadeVendida: 500000, valorMercadoDivida: 120000000, custoDividaKdPct: 8.0 });
        setParamValuation({ taxaLivreRiscoRfPct: 10.5, premioRiscoMercadoPct: 6.0, beta: 0.7, taxaCrescimentoGPct: 3.0, investimentoInicialVPL: 20000000, fluxoCaixaFuturoPV: 25000000 });
        setParamPayout({ payoutTargetPct: 80, fazerRecompra: false });
        setParamIPO({ valuationPreMoney: 800000000, captacaoDesejada: 200000000, totalAcoesDesejadas: 10000000, cotaFundadoresPct: 60, cotaInvestidoresPrivadosPct: 15 });
      }
    },
    {
      id: 'tech_growth', ticker: 'TECH3', nome: '💻 Startup de Software em Hyper-Growth', perfil: 'Growth • Zero Payout & Recompra',
      setup: () => {
        setParamGerais({ lucroLiquido: 12000000, acoesEmitidas: 5000000, caixaDisponivel: 50000000, aliquotaMarginalPct: 34 });
        setParamAlavancagem({ precoVenda: 50, custoVariavel: 5, custoFixo: 20000000, quantidadeVendida: 800000, valorMercadoDivida: 20000000, custoDividaKdPct: 12.0 });
        setParamValuation({ taxaLivreRiscoRfPct: 10.5, premioRiscoMercadoPct: 6.0, beta: 1.5, taxaCrescimentoGPct: 12.0, investimentoInicialVPL: 15000000, fluxoCaixaFuturoPV: 35000000 });
        setParamPayout({ payoutTargetPct: 0, fazerRecompra: true });
        setParamIPO({ valuationPreMoney: 200000000, captacaoDesejada: 50000000, totalAcoesDesejadas: 5000000, cotaFundadoresPct: 40, cotaInvestidoresPrivadosPct: 40 });
      }
    }
  ];

  // ==========================================
  // 2. ESTADOS OPERACIONAIS E TICKER DO DÓLAR
  // ==========================================
  const [cenarioAtivo, setCenarioAtivo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('dash');
  const [cotacaoDolar, setCotacaoDolar] = useState(5.42);

  // Simula a flutuação do dólar a cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setCotacaoDolar(prev => {
        const variacao = (Math.random() - 0.5) * 0.02;
        return Number((prev + variacao).toFixed(3));
      });
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // ==========================================
  // 3. PARÂMETROS DOS MOTORES FINANCEIROS
  // ==========================================
  const [paramGerais, setParamGerais] = useState({ lucroLiquido: 0, acoesEmitidas: 1, caixaDisponivel: 0, aliquotaMarginalPct: 34 });
  const [paramIPO, setParamIPO] = useState({ valuationPreMoney: 0, captacaoDesejada: 0, totalAcoesDesejadas: 1000000, cotaFundadoresPct: 70, cotaInvestidoresPrivadosPct: 30 });
  const [paramAlavancagem, setParamAlavancagem] = useState({ precoVenda: 0, custoVariavel: 0, custoFixo: 0, quantidadeVendida: 0, valorMercadoDivida: 0, custoDividaKdPct: 0 });
  const [paramValuation, setParamValuation] = useState({ taxaLivreRiscoRfPct: 0, premioRiscoMercadoPct: 0, beta: 1, taxaCrescimentoGPct: 0, investimentoInicialVPL: 0, fluxoCaixaFuturoPV: 0 });
  const [paramPayout, setParamPayout] = useState({ payoutTargetPct: 50, fazerRecompra: false });

  // ==========================================
  // 4. LÓGICA MATEMÁTICA E CÁLCULOS
  // ==========================================
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  const formatNum = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatInteiro = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  // --- 4.1 IPO & CAP TABLE (Precificação e Divisão Societária) ---
  const calcIPO = (() => {
    const preMoney = Number(paramIPO.valuationPreMoney) || 0;
    const captacao = Number(paramIPO.captacaoDesejada) || 0;
    const acoesTotal = Number(paramIPO.totalAcoesDesejadas) || 1;
    const fundPctBase = (Number(paramIPO.cotaFundadoresPct) || 0) / 100;
    const invPctBase = (Number(paramIPO.cotaInvestidoresPrivadosPct) || 0) / 100;
    
    // O Valor Total da Empresa PÓS Injeção de Capital da Bolsa
    const postMoney = preMoney + captacao;
    
    // O Preço exato de lançamento da ação no Mercado (IPO Price)
    const precoPorAcao = postMoney > 0 ? postMoney / acoesTotal : 0;
    
    // Divisão das Ações (Diluição Pós-IPO)
    // O mercado (Free Float) fica com o percentual correspondente ao dinheiro que injetou (Captação / PostMoney)
    const freeFloatPct = postMoney > 0 ? captacao / postMoney : 0;
    const acoesFreeFloat = acoesTotal * freeFloatPct;
    
    // O que sobra do Post-Money (Pre-Money) é dividido entre Fundadores e Antigos Investidores Anjo/VC
    const participacaoAntigaPct = 1 - freeFloatPct; 
    
    // Normaliza a divisão entre os antigos sócios
    const totalBaseAntiga = fundPctBase + invPctBase;
    const cotaFundRealPct = totalBaseAntiga > 0 ? (fundPctBase / totalBaseAntiga) * participacaoAntigaPct : 0;
    const cotaInvRealPct = totalBaseAntiga > 0 ? (invPctBase / totalBaseAntiga) * participacaoAntigaPct : 0;
    
    const acoesFundadores = acoesTotal * cotaFundRealPct;
    const acoesInvestidores = acoesTotal * cotaInvRealPct;

    return { 
      postMoney, precoPorAcao, 
      freeFloatPct, acoesFreeFloat, 
      cotaFundRealPct, acoesFundadores, 
      cotaInvRealPct, acoesInvestidores 
    };
  })();

  // --- 4.2 ALAVANCAGEM & MODIGLIANI-MILLER ---
  const calcAlavancagem = (() => {
    const P = Number(paramAlavancagem.precoVenda) || 0;
    const CV = Number(paramAlavancagem.custoVariavel) || 0;
    const CF = Number(paramAlavancagem.custoFixo) || 0;
    const Q = Number(paramAlavancagem.quantidadeVendida) || 0;
    const D = Number(paramAlavancagem.valorMercadoDivida) || 0;
    const Kd = (Number(paramAlavancagem.custoDividaKdPct) || 0) / 100;
    const T = (Number(paramGerais.aliquotaMarginalPct) || 0) / 100;
    
    const jurosR$ = D * Kd;
    const receitaTotal = P * Q;
    const margemContribuicao = receitaTotal - (CV * Q);
    const ebit = margemContribuicao - CF;
    const ebt = ebit - jurosR$;

    const gol = ebit !== 0 ? margemContribuicao / ebit : 0;
    const gfl = ebt !== 0 ? ebit / ebt : 0;
    const gcl = gol * gfl;

    const custoAlavancagemKdLiquido = Kd * (1 - T);
    const Vu = (ebit * (1 - T)) / 0.12; // Valor Empresa S/ Dívida
    const beneficioFiscalDivida = D * T; 
    const Vl = Vu + beneficioFiscalDivida; // Modigliani-Miller

    return { receitaTotal, ebit, jurosR$, ebt, gol, gfl, gcl, custoAlavancagemKdLiquido, Vu, beneficioFiscalDivida, Vl, T, D };
  })();

  // --- 4.3 VALUATION, CAPM & VPL ---
  const calcValuation = (() => {
    const Rf = (Number(paramValuation.taxaLivreRiscoRfPct) || 0) / 100;
    const PRM = (Number(paramValuation.premioRiscoMercadoPct) || 0) / 100;
    const Beta = Number(paramValuation.beta) || 0;
    const g = (Number(paramValuation.taxaCrescimentoGPct) || 0) / 100;

    const retornoEsperadoKe = Rf + (Beta * PRM);

    const D = calcAlavancagem.D;
    const E = calcAlavancagem.Vl - D;
    const V = D + E;
    const Wd = V > 0 ? D / V : 0;
    const We = V > 0 ? E / V : 0;
    const wacc = (We * retornoEsperadoKe) + (Wd * calcAlavancagem.custoAlavancagemKdLiquido);

    const inv = Number(paramValuation.investimentoInicialVPL) || 0;
    const fcf = Number(paramValuation.fluxoCaixaFuturoPV) || 0;
    const presentValuePV = fcf / (1 + wacc);
    const netPresentValueNPV = presentValuePV - inv;

    return { Rf, Beta, retornoEsperadoKe, Wd, We, wacc, g, presentValuePV, netPresentValueNPV };
  })();

  // --- 4.4 PAYOUT, DIVIDENDOS E RECOMPRA ---
  const calcPayout = (() => {
    const LL = Number(paramGerais.lucroLiquido) || 0;
    const acoes = Number(paramGerais.acoesEmitidas) || 1;
    const payoutPct = (Number(paramPayout.payoutTargetPct) || 0) / 100;

    const lpa = LL / acoes;
    const montanteDividendos = LL * payoutPct;
    const dividendoPorAcaoDPA = montanteDividendos / acoes;

    let precoAcaoBase = 0;
    if (calcValuation.retornoEsperadoKe > calcValuation.g) {
      precoAcaoBase = (lpa) / (calcValuation.retornoEsperadoKe - calcValuation.g);
    }

    const precoCumDividend = precoAcaoBase;
    const precoExDividend = precoCumDividend - dividendoPorAcaoDPA;

    const acoesRecompradas = paramPayout.fazerRecompra && precoAcaoBase > 0 ? montanteDividendos / precoAcaoBase : 0;
    const novasAcoesEmitidas = acoes - acoesRecompradas;
    const novoLpaComRecompra = LL / novasAcoesEmitidas;

    return { lpa, montanteDividendos, dividendoPorAcaoDPA, precoCumDividend, precoExDividend, acoesRecompradas, novasAcoesEmitidas, novoLpaComRecompra };
  })();

  // ==========================================
  // 5. MOTOR DE IMPRESSÃO A4 (RELATÓRIO DE RI)
  // ==========================================
  const imprimirRelatorioRI = () => {
    const areaConteudo = document.getElementById('relatorio-ri-a4');
    if (!areaConteudo) return;
    const janelaPrint = window.open('', '_blank', 'width=900,height=800');
    janelaPrint.document.write(`
      <html>
      <head>
        <title>Relatório de RI - ${cenarioAtivo.ticker}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; font-size: 10pt; }
          h1, h2, h3 { color: #0f172a; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: right; }
          th { background-color: #f1f5f9; text-align: left; }
          td.label { text-align: left; font-weight: bold; }
        </style>
      </head>
      <body>${areaConteudo.innerHTML}</body>
      </html>
    `);
    janelaPrint.document.close();
    janelaPrint.focus();
    setTimeout(() => { janelaPrint.print(); }, 400);
  };

  const ativarCenario = (cenario) => {
    cenario.setup();
    setCenarioAtivo(cenario);
    setAbaAtiva('dash');
    if(typeof mostrarToast === 'function') mostrarToast(`Terminal B3 aberto: ${cenario.ticker}`, 'sucesso');
  };

  // ==========================================
  // ESTILOS (RESPONSIVIDADE E DARK MODE)
  // ==========================================
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', backgroundColor: '#0f172a', color: '#38bdf8', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase' };
  const cardStyle = { backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', boxSizing: 'border-box' };
  const boxMentorStyle = { backgroundColor: '#022c22', borderLeft: '4px solid #10b981', padding: '14px', borderRadius: '8px', marginBottom: '16px', color: '#a7f3d0', fontSize: '12.5px', lineHeight: '1.6', boxSizing: 'border-box' };

  // ==========================================
  // TELA 0: HOME / SELEÇÃO
  // ==========================================
  if (!cenarioAtivo) {
    return (
      <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '24px', border: '1px solid #334155', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div style={{ color: 'white', padding: '24px', borderBottom: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'inline-block' }}>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>TERMINAL FINANCEIRO C-LEVEL</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>📈 Masterclass: Mercado de Capitais, IPO & Valuation</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Aprenda desde o nascimento da ação (IPO/Cap Table), precificação, estrutura de dívida e distribuição de lucro.</p>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {catalogoCasos.map(c => (
              <div key={c.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{c.ticker}</span>
                </div>
                <h3 style={{ fontSize: '16px', margin: '0', color: 'white' }}>{c.nome}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, flexGrow: 1 }}>{c.descricao}</p>
                <button onClick={() => ativarCenario(c)} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' }}>Acessar Terminal →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL (WORKFLOW DO TERMINAL)
  // ==========================================
  return (
    <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '24px', border: '1px solid #334155', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER: TICKER DO DÓLAR E MENU */}
      <div style={{ color: 'white', padding: '15px 20px', borderRadius: '16px 16px 0 0', borderBottom: '1px solid #334155' }}>
        
        {/* TOP BAR: Dolar e Ticker - Responsivo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #1e293b', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>USD/BRL</span>
            <span style={{ color: '#f8fafc', fontSize: '16px', fontFamily: 'monospace' }}>R$ {cotacaoDolar.toFixed(3)}</span>
            <span style={{ color: '#10b981', fontSize: '11px', whiteSpace: 'nowrap' }}>▲ Ao vivo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{cenarioAtivo.ticker}</span>
            <strong style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>{cenarioAtivo.nome}</strong>
            <button onClick={() => setCenarioAtivo(null)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', marginLeft: 'auto' }}>Sair</button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS RESPONSIVA */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'dash', label: '📊 Dashboard CFO' },
            { id: 'educacao', label: '🎓 Escola da Bolsa' },
            { id: 'ipo', label: '🏢 IPO & Cap Table' },
            { id: 'alavancagem', label: '⚡ Dívida (GFL)' },
            { id: 'valuation', label: '📈 CAPM & VPL' },
            { id: 'payout', label: '💰 Payout & Recompra' },
            { id: 'emissao', label: '🖨️ Relatório RI' }
          ].map(aba => (
            <button key={aba.id} onClick={() => setAbaAtiva(aba.id)} style={{ flex: '1 1 auto', backgroundColor: abaAtiva === aba.id ? '#38bdf8' : '#1e293b', color: abaAtiva === aba.id ? '#0f172a' : '#94a3b8', border: '1px solid #334155', padding: '10px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', minHeight: '500px' }}>

        {/* ========================================== */}
        {/* ABA 1: DASHBOARD GERAL                     */}
        {/* ========================================== */}
        {abaAtiva === 'dash' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>Visão Global da Empresa</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <span style={labelStyle}>Lucro por Ação (LPA / EPS)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>R$ {formatNum(calcPayout.lpa)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Ações: {formatInteiro(paramGerais.acoesEmitidas)}</span>
              </div>
              <div style={cardStyle}>
                <span style={labelStyle}>Custo Médio de Capital (WACC)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{formatPct(calcValuation.wacc * 100)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Taxa de desconto da empresa</span>
              </div>
              <div style={cardStyle}>
                <span style={labelStyle}>Valor da Empresa Alavancada (Vl)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{formatMoeda(calcAlavancagem.Vl)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Modigliani-Miller (Com Dívida)</span>
              </div>
              <div style={cardStyle}>
                <span style={labelStyle}>Preço da Ação na B3 (Cum-Dividend)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc' }}>R$ {formatNum(calcPayout.precoCumDividend)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Modelo de Gordon Perpétuo</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: ESCOLA DA BOLSA (EXPANDIDA)         */}
        {/* ========================================== */}
        {abaAtiva === 'educacao' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>🎓 Escola de Investidores: Enciclopédia do Mercado</h3>
            <div style={boxMentorStyle}>O mercado financeiro possui um idioma próprio. Aprenda os conceitos fundamentais para compreender como o dinheiro muda de mãos na Bolsa de Valores.</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <h4 style={{ color: '#38bdf8', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>1. O que é uma Ação?</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>Uma ação é a menor "fatia" do capital social de uma S/A. Ao comprá-la através do <em>Home Broker</em> de uma corretora (com Taxa de Corretagem geralmente zero), você torna-se oficialmente sócio minoritário, assumindo os riscos do negócio em troca de lucros futuros.</p>
              </div>
              
              <div style={cardStyle}>
                <h4 style={{ color: '#10b981', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>2. Ações ON vs. PN e Tag Along</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>
                  <strong>ON (Ordinárias - Final 3):</strong> Dão direito a voto nas assembleias.<br/>
                  <strong>PN (Preferenciais - Final 4):</strong> Não têm voto, mas têm preferência no recebimento de dividendos.<br/>
                  <strong>Tag Along:</strong> Se a empresa for vendida, garante que o minoritário (você) receba o mesmo preço (ou 80%) por ação que o dono (majoritário) recebeu.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ color: '#f59e0b', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>3. Dividendos vs. JCP</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>
                  <strong>Dividendos:</strong> São isentos de Imposto de Renda para o acionista pessoa física.<br/>
                  <strong>JCP (Juros s/ Capital Próprio):</strong> Retém 15% de IR na fonte para você, mas a empresa adora pagar JCP porque ela abate esse valor no imposto dela (IRPJ/CSLL), gerando economia fiscal.
                </p>
              </div>
              
              <div style={cardStyle}>
                <h4 style={{ color: '#ec4899', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>4. Desdobramento (Split) e Grupamento</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>
                  <strong>Split (Desdobramento):</strong> A ação ficou cara demais (R$ 100). A empresa divide 1 ação em 10 de R$ 10. Você passa a ter 10 ações, mas seu dinheiro total não muda. Aumenta a liquidez.<br/>
                  <strong>Inplit (Grupamento):</strong> A ação virou "Pó" (R$ 0,50). A empresa junta 10 ações para formar 1 de R$ 5,00 para não ser expulsa da Bolsa.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ color: '#a855f7', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>5. Blue Chips, Mid Caps e Small Caps</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>
                  <strong>Blue Chips:</strong> Gigantes seguras e consolidadas (ex: Itaú, Petrobras, Vale). Muita liquidez, pagam bons dividendos.<br/>
                  <strong>Small Caps:</strong> Empresas menores, alto risco, mas com enorme potencial de se multiplicarem 5x, 10x de tamanho.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ color: '#f43f5e', marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '6px' }}>6. Liquidez e Free Float</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', lineHeight: '1.6' }}>
                  <strong>Free Float:</strong> É a porcentagem de ações que está "solta" no mercado para os investidores negociarem livremente, fora das mãos dos donos.<br/>
                  <strong>Liquidez:</strong> Capacidade de vender a ação rápido sem jogar o preço no chão. Fuja de ações que não têm liquidez!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: IPO & CAP TABLE (NOVO MOTOR)        */}
        {/* ========================================== */}
        {abaAtiva === 'ipo' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={boxMentorStyle}>
              <strong>🏢 Como uma empresa nasce na Bolsa (IPO e Cap Table):</strong> Quando uma empresa decide abrir capital (IPO), ela avalia quanto o seu negócio vale <strong>antes</strong> do dinheiro novo entrar (<em>Valuation Pre-Money</em>). Depois, ela define quanto quer <strong>captar</strong>. O dinheiro da captação entra no caixa e a empresa emite <strong>novas ações</strong> para o mercado (Free Float), diluindo percentualmente os fundadores, mas aumentando o bolo total (<em>Post-Money</em>). O preço da ação na estreia é matematicamente: Valuation Post-Money ÷ Total de Ações.
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 15px 0', color: 'white', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Parâmetros da Oferta Pública Inicial (IPO)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div><label style={labelStyle}>Valuation PRE-Money (R$):</label><input type="number" style={inputStyle} value={paramIPO.valuationPreMoney} onChange={e => setParamIPO({...paramIPO, valuationPreMoney: e.target.value})} /></div>
                <div><label style={labelStyle}>Captação Desejada (Injeção R$):</label><input type="number" style={inputStyle} value={paramIPO.captacaoDesejada} onChange={e => setParamIPO({...paramIPO, captacaoDesejada: e.target.value})} /></div>
                <div><label style={labelStyle}>Total de Ações Desejadas (Milhões):</label><input type="number" style={inputStyle} value={paramIPO.totalAcoesDesejadas} onChange={e => setParamIPO({...paramIPO, totalAcoesDesejadas: e.target.value})} /></div>
                <div><label style={labelStyle}>Cota Original dos Fundadores (%):</label><input type="number" style={inputStyle} value={paramIPO.cotaFundadoresPct} onChange={e => setParamIPO({...paramIPO, cotaFundadoresPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Cota Original dos Anjos/VC (%):</label><input type="number" style={inputStyle} value={paramIPO.cotaInvestidoresPrivadosPct} onChange={e => setParamIPO({...paramIPO, cotaInvestidoresPrivadosPct: e.target.value})} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ ...cardStyle, borderLeft: '4px solid #38bdf8' }}>
                <span style={labelStyle}>Valuation POST-Money</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>{formatMoeda(calcIPO.postMoney)}</div>
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>O novo tamanho da empresa (Pre-Money + Caixa)</span>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#022c22' }}>
                <span style={{ ...labelStyle, color: '#a7f3d0' }}>Preço de Lançamento (IPO Price)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#10b981' }}>R$ {formatNum(calcIPO.precoPorAcao)} <span style={{fontSize:'12px', fontWeight:'normal'}}>/ação</span></div>
                <span style={{ fontSize: '11.5px', color: '#6ee7b7' }}>Calculado via Bookbuilding Institucional</span>
              </div>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 15px 0', color: 'white', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>Cap Table: Divisão do Capital Pós-IPO (Efeito da Diluição)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '12.5px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Acionista</th>
                      <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' }}>% Participação Atual</th>
                      <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Quantidade de Ações</th>
                      <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #334155', color: '#94a3b8' }}>Valor da Posição (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b' }}>👑 Fundadores (Controladores)</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right', color: '#f59e0b', fontWeight: 'bold' }}>{formatPct(calcIPO.cotaFundRealPct * 100)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right' }}>{formatInteiro(calcIPO.acoesFundadores)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right' }}>{formatMoeda(calcIPO.acoesFundadores * calcIPO.precoPorAcao)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b' }}>💼 Investidores Privados (VC/PE)</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right', color: '#38bdf8', fontWeight: 'bold' }}>{formatPct(calcIPO.cotaInvRealPct * 100)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right' }}>{formatInteiro(calcIPO.acoesInvestidores)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right' }}>{formatMoeda(calcIPO.acoesInvestidores * calcIPO.precoPorAcao)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#0f172a' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', fontWeight: 'bold' }}>📊 Free Float (Público da B3)</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>{formatPct(calcIPO.freeFloatPct * 100)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right', fontWeight: 'bold' }}>{formatInteiro(calcIPO.acoesFreeFloat)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #1e293b', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatMoeda(calcIPO.acoesFreeFloat * calcIPO.precoPorAcao)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <button onClick={() => setAbaAtiva('alavancagem')} style={{ alignSelf: 'flex-end', padding: '12px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Avançar para Estrutura da Dívida →</button>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 4: ALAVANCAGEM & MODIGLIANI-MILLER     */}
        {/* ========================================== */}
        {abaAtiva === 'alavancagem' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={boxMentorStyle}>
              <strong>⚡ Teoria de Modigliani-Miller (Valor da Empresa com Alavancagem):</strong> A dívida tem um benefício mágico: os juros reduzem o lucro tributável, poupando impostos (Tax Shield). O Valor da Empresa Alavancada ($V_L$) é igual ao Valor da Empresa Não Alavancada ($V_U$) mais a (Dívida x Alíquota Marginal).<br/>
              <strong>Perigo (Grau de Alavancagem):</strong> Custos fixos altos (GOL) destroem margens em crises. Se a alavancagem financeira (GFL) for menor que 1, a dívida corrói o patrimônio.
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 15px 0', color: '#f8fafc' }}>Parâmetros de Custeio e Dívida</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div><label style={labelStyle}>Valor de Mercado da Dívida (D):</label><input type="number" style={inputStyle} value={paramAlavancagem.valorMercadoDivida} onChange={e => setParamAlavancagem({...paramAlavancagem, valorMercadoDivida: e.target.value})} /></div>
                <div><label style={labelStyle}>Custo Bruto da Dívida (Kd %):</label><input type="number" step="0.1" style={inputStyle} value={paramAlavancagem.custoDividaKdPct} onChange={e => setParamAlavancagem({...paramAlavancagem, custoDividaKdPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Alíquota Marginal de Imposto (T %):</label><input type="number" step="1" style={inputStyle} value={paramGerais.aliquotaMarginalPct} onChange={e => setParamGerais({...paramGerais, aliquotaMarginalPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Custo Fixo Operacional (R$):</label><input type="number" style={inputStyle} value={paramAlavancagem.custoFixo} onChange={e => setParamAlavancagem({...paramAlavancagem, custoFixo: e.target.value})} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
                <span style={labelStyle}>Custo da Alavancagem Pós-Imposto</span>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>{formatPct(calcAlavancagem.custoAlavancagemKdLiquido * 100)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fórmula: Kd x (1 - T)</span>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #38bdf8' }}>
                <span style={labelStyle}>Valor da Empresa S/ Alavancagem (Vu)</span>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8' }}>{formatMoeda(calcAlavancagem.Vu)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Se não tivesse dívida.</span>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#022c22' }}>
                <span style={{ ...labelStyle, color: '#a7f3d0' }}>Valor da Empresa Alavancada (Vl)</span>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{formatMoeda(calcAlavancagem.Vl)}</div>
                <span style={{ fontSize: '11px', color: '#6ee7b7' }}>Benefício Fiscal da Dívida: + {formatMoeda(calcAlavancagem.beneficioFiscalDivida)}</span>
              </div>
            </div>

            <div style={cardStyle}>
               <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc' }}>Análise de Riscos Operacionais</h4>
               <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                 • <strong>GOL (Grau Alavancagem Operacional): {formatNum(calcAlavancagem.gol)}x</strong>.<br/>
                 • <strong>GFL (Grau Alavancagem Financeira): {formatNum(calcAlavancagem.gfl)}x</strong>. {calcAlavancagem.gfl < 1 ? <span style={{color: '#ef4444', fontWeight:'bold'}}>⚠️ RISCO DE INSOLVÊNCIA! A dívida consome o patrimônio (Efeito Tesoura).</span> : <span style={{color: '#10b981'}}>✅ Alavancagem positiva e saudável.</span>}
               </p>
            </div>
            
            <button onClick={() => setAbaAtiva('valuation')} style={{ alignSelf: 'flex-end', padding: '12px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Avançar para Valuation e WACC →</button>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 5: VALUATION (CAPM E VPL)              */}
        {/* ========================================== */}
        {abaAtiva === 'valuation' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={boxMentorStyle}>
              <strong>📈 Modelo CAPM (Capital Asset Pricing Model):</strong> Como o acionista decide se vale a pena investir? Ele exige a <strong>Taxa Livre de Risco (Selic)</strong> mais um <em>Prêmio pelo Risco</em> multiplicado pelo <strong>Beta</strong> da empresa (volatilidade). O resultado é o Retorno Esperado (Ke). Se o <strong>VPL / NPV</strong> de um projeto for positivo ao ser descontado pelo WACC, o projeto cria valor!
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div><label style={labelStyle}>Taxa Livre Risco - Rf (% Selic):</label><input type="number" step="0.1" style={inputStyle} value={paramValuation.taxaLivreRiscoRfPct} onChange={e => setParamValuation({...paramValuation, taxaLivreRiscoRfPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Prêmio de Risco Mercado (%):</label><input type="number" step="0.1" style={inputStyle} value={paramValuation.premioRiscoMercadoPct} onChange={e => setParamValuation({...paramValuation, premioRiscoMercadoPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Beta da Empresa (Risco B3):</label><input type="number" step="0.1" style={inputStyle} value={paramValuation.beta} onChange={e => setParamValuation({...paramValuation, beta: e.target.value})} /></div>
                <div><label style={labelStyle}>Crescimento Perpétuo (g %):</label><input type="number" step="0.1" style={inputStyle} value={paramValuation.taxaCrescimentoGPct} onChange={e => setParamValuation({...paramValuation, taxaCrescimentoGPct: e.target.value})} /></div>
                
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '5px' }}><strong style={{color:'white', fontSize:'13px'}}>Simulador de Projeto de Investimento (VPL)</strong></div>
                <div><label style={labelStyle}>Investimento Inicial (Inv):</label><input type="number" style={inputStyle} value={paramValuation.investimentoInicialVPL} onChange={e => setParamValuation({...paramValuation, investimentoInicialVPL: e.target.value})} /></div>
                <div><label style={labelStyle}>Fluxo de Caixa Futuro (FCF):</label><input type="number" style={inputStyle} value={paramValuation.fluxoCaixaFuturoPV} onChange={e => setParamValuation({...paramValuation, fluxoCaixaFuturoPV: e.target.value})} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
                <span style={labelStyle}>Retorno Esperado Acionista (CAPM Ke)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{formatPct(calcValuation.retornoEsperadoKe * 100)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>E(R) = Rf + Beta * [E(Rm) - Rf]</span>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #38bdf8' }}>
                <span style={labelStyle}>Valor Presente do Projeto (PV)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>{formatMoeda(calcValuation.presentValuePV)}</div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>PV = FCF / (1 + WACC)</span>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#022c22', borderLeft: '4px solid #10b981' }}>
                <span style={{ ...labelStyle, color: '#a7f3d0' }}>Valor Presente Líquido (NPV / VPL)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: calcValuation.netPresentValueNPV > 0 ? '#10b981' : '#ef4444' }}>
                  {formatMoeda(calcValuation.netPresentValueNPV)}
                </div>
                <span style={{ fontSize: '11px', color: '#6ee7b7' }}>{calcValuation.netPresentValueNPV > 0 ? '✅ VPL Positivo. Projeto cria valor!' : '❌ VPL Negativo. Rejeitar.'}</span>
              </div>
            </div>
            
            <button onClick={() => setAbaAtiva('payout')} style={{ alignSelf: 'flex-end', padding: '12px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Avançar para Payout e Recompra →</button>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 6: PAYOUT E RECOMPRA DE AÇÕES          */}
        {/* ========================================== */}
        {abaAtiva === 'payout' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={boxMentorStyle}>
              <strong>💰 Política de Payout (Dividendos vs. Recompra):</strong> O preço da ação na Bolsa engloba o direito de receber o próximo dividendo (<strong>Preço Cum-Dividend</strong>). No dia seguinte ao pagamento (Data Ex), o preço cai matematicamente o valor do dividendo, formando o <strong>Preço Ex-Dividend</strong>. Se a empresa não pagar dividendos e fizer <strong>Recompra de Ações (Share Buyback)</strong>, as ações em circulação diminuem, e o Lucro Por Ação (LPA) sobe!
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div><label style={labelStyle}>Lucro Líquido (R$):</label><input type="number" style={inputStyle} value={paramGerais.lucroLiquido} onChange={e => setParamGerais({...paramGerais, lucroLiquido: e.target.value})} /></div>
                <div><label style={labelStyle}>Ações em Circulação:</label><input type="number" style={inputStyle} value={paramGerais.acoesEmitidas} onChange={e => setParamGerais({...paramGerais, acoesEmitidas: e.target.value})} /></div>
                <div><label style={labelStyle}>Payout (Distribuir %):</label><input type="number" style={inputStyle} value={paramPayout.payoutTargetPct} onChange={e => setParamPayout({...paramPayout, payoutTargetPct: e.target.value})} /></div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" checked={paramPayout.fazerRecompra} onChange={e => setParamPayout({...paramPayout, fazerRecompra: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>Fazer Recompra de Ações (Share Buyback) em vez de pagar Dividendos.</span>
                </div>
              </div>
            </div>

            {!paramPayout.fazerRecompra ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
                  <span style={labelStyle}>Preço CUM-DIVIDEND (Hoje)</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>R$ {formatNum(calcPayout.precoCumDividend)}</div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Direito a Dividendo de R$ {formatNum(calcPayout.dividendoPorAcaoDPA)}/ação</span>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
                  <span style={labelStyle}>Preço EX-DIVIDEND (Data Corte)</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>R$ {formatNum(calcPayout.precoExDividend)}</div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>O preço cai matematicamente na abertura da B3.</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                  <span style={labelStyle}>Ações Recompradas & Canceladas</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{formatInteiro(calcPayout.acoesRecompradas)} Ações</div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ações sobraram no mercado: {formatInteiro(calcPayout.novasAcoesEmitidas)}</span>
                </div>
                <div style={{ ...cardStyle, backgroundColor: '#022c22', borderLeft: '4px solid #38bdf8' }}>
                  <span style={{ ...labelStyle, color: '#a7f3d0' }}>Novo Lucro Por Ação (LPA)</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>R$ {formatNum(calcPayout.novoLpaComRecompra)}</div>
                  <span style={{ fontSize: '11px', color: '#6ee7b7' }}>O LPA era R$ {formatNum(calcPayout.lpa)}. Aumentou sem a empresa lucrar mais!</span>
                </div>
              </div>
            )}
            <button onClick={() => setAbaAtiva('emissao')} style={{ alignSelf: 'flex-end', padding: '12px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Avançar para Relatório RI →</button>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 7: EMISSÃO DO RELATÓRIO RI (A4)        */}
        {/* ========================================== */}
        {abaAtiva === 'emissao' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Relatório Executivo de RI (A4 Print-ready)</span>
              <button onClick={imprimirRelatorioRI} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>🖨️ Imprimir / Salvar PDF</button>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
              {/* O ID abaixo é capturado pelo script de impressão */}
              <div id="relatorio-ri-a4" style={{ backgroundColor: 'white', padding: '30px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '700px', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
                
                <h1 style={{ textAlign: 'center', margin: '0 0 5px 0', fontSize: '18pt', color: '#0f172a' }}>RELATÓRIO DE RELAÇÕES COM INVESTIDORES (RI)</h1>
                <h3 style={{ textAlign: 'center', margin: '0 0 30px 0', color: '#64748b' }}>{cenarioAtivo.nome} ({cenarioAtivo.ticker})</h3>

                <h2 style={{ color: '#0f172a', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '14pt' }}>1. Cap Table e Valuation do IPO</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10pt', color: '#333' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Valuation Pre-Money</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatMoeda(paramIPO.valuationPreMoney)}</td></tr>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Captação (Dinheiro em Caixa)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatMoeda(paramIPO.captacaoDesejada)}</td></tr>
                    <tr style={{ backgroundColor: '#f1f5f9' }}><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Valuation Post-Money</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoeda(calcIPO.postMoney)}</td></tr>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Preço de Lançamento por Ação (IPO)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>R$ {formatNum(calcIPO.precoPorAcao)}</td></tr>
                  </tbody>
                </table>

                <h2 style={{ color: '#0f172a', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '14pt' }}>2. Estrutura de Capital, CAPM e Dívida</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10pt', color: '#333' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Custo de Capital Próprio (Ke)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatPct(calcValuation.retornoEsperadoKe * 100)}</td></tr>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Custo da Dívida Pós-Impostos (Kd)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatPct(calcAlavancagem.custoAlavancagemKdLiquido * 100)}</td></tr>
                    <tr style={{ backgroundColor: '#f1f5f9' }}><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Custo Médio Ponderado (WACC)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatPct(calcValuation.wacc * 100)}</td></tr>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Valor da Empresa Alavancada (Modigliani-Miller)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatMoeda(calcAlavancagem.Vl)}</td></tr>
                  </tbody>
                </table>

                <h2 style={{ color: '#0f172a', borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '14pt' }}>3. Política de Payout (Remuneração ao Acionista)</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10pt', color: '#333' }}>
                  <tbody>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Lucro Líquido do Exercício</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>{formatMoeda(paramGerais.lucroLiquido)}</td></tr>
                    <tr><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Lucro Por Ação Atual (LPA)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>R$ {formatNum(calcPayout.lpa)}</td></tr>
                    {paramPayout.fazerRecompra ? (
                      <tr style={{ backgroundColor: '#dcfce7' }}><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Novo LPA após Recompra de Ações (Buyback)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatNum(calcPayout.novoLpaComRecompra)}</td></tr>
                    ) : (
                      <>
                        <tr style={{ backgroundColor: '#fef3c7' }}><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Preço Cum-Dividend (Com Direito)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatNum(calcPayout.precoCumDividend)}</td></tr>
                        <tr style={{ backgroundColor: '#fee2e2' }}><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Preço Ex-Dividend (Data de Corte)</td><td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatNum(calcPayout.precoExDividend)}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>

                <div style={{ marginTop: '40px', fontSize: '9pt', color: '#64748b', textAlign: 'center' }}>
                  Relatório gerado pelo Módulo C-Level de Finanças Corporativas do Contábil Cloud.<br/>
                  As projeções de Valuation são baseadas no Modelo de Gordon / WACC e não constituem recomendação de compra.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}