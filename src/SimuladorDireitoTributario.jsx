import React, { useState, useMemo } from 'react';

export default function SimuladorDireitoTributario({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estados dos Laboratórios de Direito
  const [paramsJCP, setParamsJCP] = useState({
    patrimonioLiquido: 2000000.00,
    lucroExercicio: 800000.00,
    taxaTJLP: 9.50, // Taxa de Juros de Longo Prazo (%)
  });

  const [paramsMNA, setParamsMNA] = useState({
    lucroEmpresaA: 1000000.00, // Empresa que vai incorporar
    prejuizoEmpresaB: 600000.00, // Empresa que será incorporada
  });

  const [paramsRJ, setParamsRJ] = useState({
    caixaDisponivel: 150000.00,
    dividaTrabalhista: 80000.00, // Classe I
    dividaGarantiaReal: 100000.00, // Classe II
    dividaTributaria: 50000.00, // Classe III
    dividaQuirografaria: 120000.00 // Classe IV (Fornecedores)
  });

  const [abaAtiva, setAbaAtiva] = useState('jcp');
  const [contabilizado, setContabilizado] = useState({ jcp: false, mna: false, rj: false });

  // ==========================================
  // MOTOR DE CÁLCULO JURÍDICO-TRIBUTÁRIO
  // ==========================================
  
  // 1. Juros sobre Capital Próprio (Art. 9º, Lei 9.249/95)
  const calcJCP = useMemo(() => {
    // Limite legal: TJLP sobre o PL, não podendo exceder 50% do Lucro do Exercício ou 50% dos Lucros Acumulados.
    const limitePelaTJLP = paramsJCP.patrimonioLiquido * (paramsJCP.taxaTJLP / 100);
    const limitePeloLucro = paramsJCP.lucroExercicio * 0.50;
    
    const jcpPermitido = Math.min(limitePelaTJLP, limitePeloLucro);
    
    // Benefício PJ: JCP é despesa dedutível. Economiza 34% (25% IRPJ + 9% CSLL)
    const economiaPJ = jcpPermitido * 0.34;
    // Custo PF: O sócio paga 15% de IRRF na fonte ao receber
    const impostoRetidoPF = jcpPermitido * 0.15;
    
    const vantagemLiquida = economiaPJ - impostoRetidoPF;
    const jcpLiquidoSocio = jcpPermitido - impostoRetidoPF;

    return { jcpPermitido, economiaPJ, impostoRetidoPF, vantagemLiquida, jcpLiquidoSocio };
  }, [paramsJCP]);

  // 2. Trava dos 30% em Prejuízos Fiscais (Reorganização Societária)
  const calcMNA = useMemo(() => {
    // Ao fundir/incorporar, a empresa A pode usar o prejuízo da B para reduzir sua base de cálculo do IRPJ/CSLL, 
    // mas a lei limita a compensação a 30% do Lucro Líquido do exercício.
    const limiteCompensacao = paramsMNA.lucroEmpresaA * 0.30;
    const prejuizoUtilizado = Math.min(paramsMNA.prejuizoEmpresaB, limiteCompensacao);
    const saldoPrejuizoRestante = paramsMNA.prejuizoEmpresaB - prejuizoUtilizado;
    
    const novaBaseCalculo = paramsMNA.lucroEmpresaA - prejuizoUtilizado;
    const impostoSemMNA = paramsMNA.lucroEmpresaA * 0.34; // Simulação IRPJ/CSLL 34%
    const impostoComMNA = novaBaseCalculo * 0.34;
    const economiaImposto = impostoSemMNA - impostoComMNA;

    return { limiteCompensacao, prejuizoUtilizado, saldoPrejuizoRestante, novaBaseCalculo, economiaImposto };
  }, [paramsMNA]);

  // 3. Ordem de Pagamento na Recuperação Judicial (Art. 83, Lei 11.101)
  const calcRJ = useMemo(() => {
    let caixaRestante = paramsRJ.caixaDisponivel;
    
    const pagTrabalhista = Math.min(caixaRestante, paramsRJ.dividaTrabalhista);
    caixaRestante -= pagTrabalhista;
    
    const pagGarantiaReal = Math.min(caixaRestante, paramsRJ.dividaGarantiaReal);
    caixaRestante -= pagGarantiaReal;
    
    const pagTributario = Math.min(caixaRestante, paramsRJ.dividaTributaria);
    caixaRestante -= pagTributario;
    
    const pagQuirografaria = Math.min(caixaRestante, paramsRJ.dividaQuirografaria);
    caixaRestante -= pagQuirografaria;

    return { pagTrabalhista, pagGarantiaReal, pagTributario, pagQuirografaria, caixaFim: caixaRestante };
  }, [paramsRJ]);

  // ==========================================
  // DISPAROS PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarJCP = () => {
    if (contabilizado.jcp) return mostrarToast('JCP já deliberado!', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    // Múltiplas pernas: Debita Despesa (ou Lucros Acumulados), Credita JCP a Pagar e IRRF a Recolher
    registrarFatoGerador(
      `Deliberação de Juros s/ Capital Próprio (JCP)`,
      calcJCP.jcpPermitido,
      'Direito/Societário',
      ['3.2.01.01'], // Débito: Lucros/Prejuízos Acumulados (PL) ou Despesa
      ['2.1.05.02']  // Crédito: JCP a Pagar aos Sócios (Passivo) -> Vamos simplificar o IRRF aqui para não quebrar a partida dobrada simples do seu motor, ou fazemos 2 lançamentos.
    );
    // Reconhecimento da Retenção do Imposto
    registrarFatoGerador(
      `Retenção de IRRF sobre JCP dos Sócios`,
      calcJCP.impostoRetidoPF,
      'Direito/Tributário',
      ['2.1.05.02'], // Débito: JCP a Pagar (Reduz o que o sócio vai receber)
      ['2.1.03.01']  // Crédito: IRRF a Recolher (Obrigação com a Receita)
    );

    setContabilizado(p => ({ ...p, jcp: true }));
    mostrarToast('JCP Deliberado! Imposto retido e obrigação societária registrada.', 'sucesso');
  };

  const handlePagarRJ = () => {
    if (contabilizado.rj) return mostrarToast('Plano de pagamento já executado!', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    if (calcRJ.pagTrabalhista > 0) {
      registrarFatoGerador(`Pagamento RJ: Classe I (Trabalhista)`, calcRJ.pagTrabalhista, 'Direito/Falência', ['2.1.02.01'], ['1.1.01.02']);
    }
    if (calcRJ.pagGarantiaReal > 0) {
      registrarFatoGerador(`Pagamento RJ: Classe II (Bancos c/ Garantia)`, calcRJ.pagGarantiaReal, 'Direito/Falência', ['2.1.04.01'], ['1.1.01.02']);
    }
    
    setContabilizado(p => ({ ...p, rj: true }));
    mostrarToast('Alvará Judicial cumprido. Caixa distribuído conforme a lei de falências.', 'sucesso');
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #4338ca' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#4338ca', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>DIREITO E PLANEJAMENTO TRIBUTÁRIO</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Societário, Elisão Fiscal e Falências</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Use a lei a favor do caixa. Planeje distribuições (JCP), Fusões e Recuperações Judiciais.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('jcp')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'jcp' ? '#4338ca' : 'transparent', color: abaAtiva === 'jcp' ? 'white' : '#cbd5e1' }}>💰 1. Elisão Fiscal (JCP)</button>
          <button onClick={() => setAbaAtiva('mna')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'mna' ? '#4338ca' : 'transparent', color: abaAtiva === 'mna' ? 'white' : '#cbd5e1' }}>🏢 2. Cisão e Fusão (M&A)</button>
          <button onClick={() => setAbaAtiva('rj')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'rj' ? '#4338ca' : 'transparent', color: abaAtiva === 'rj' ? 'white' : '#cbd5e1' }}>⚖️ 3. Rec. Judicial (RJ)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: ELISÃO FISCAL (JCP vs DIVIDENDOS)
            ======================================================== */}
        {abaAtiva === 'jcp' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>⚖️ Juros sobre Capital Próprio (Lei 9.249/95)</h3>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>Em vez de distribuir o Lucro como Dividendos (que não dá crédito tributário para a empresa), distribua como JCP. Ele é considerado Despesa e deduz a base do IRPJ/CSLL.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Patrimônio Líquido (Capital Social + Reservas):</label>
                  <input type="number" style={inputStyle} value={paramsJCP.patrimonioLiquido} onChange={e => {setParamsJCP({...paramsJCP, patrimonioLiquido: e.target.value}); setContabilizado(p=>({...p, jcp:false}));}} />
                </div>
                <div>
                  <label style={labelStyle}>Lucro do Exercício (Apurado na DRE):</label>
                  <input type="number" style={inputStyle} value={paramsJCP.lucroExercicio} onChange={e => {setParamsJCP({...paramsJCP, lucroExercicio: e.target.value}); setContabilizado(p=>({...p, jcp:false}));}} />
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <label style={{...labelStyle, color: '#1e40af'}}>Taxa TJLP (% fixada pelo Bacen/CVM):</label>
                  <input type="number" step="0.1" style={{...inputStyle, borderColor: '#93c5fd'}} value={paramsJCP.taxaTJLP} onChange={e => {setParamsJCP({...paramsJCP, taxaTJLP: e.target.value}); setContabilizado(p=>({...p, jcp:false}));}} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>📉 Vantagem Tributária (Elisão)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                <span>Valor Máximo Permitido para JCP:</span>
                <strong>{formatMoeda(calcJCP.jcpPermitido)}</strong>
              </div>
              
              <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '16px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold' }}>(+) Economia de IRPJ/CSLL para a Empresa (34%):</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>{formatMoeda(calcJCP.economiaPJ)}</div>
              </div>

              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>(-) IRRF Cobrado do Sócio na Fonte (15%):</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>{formatMoeda(calcJCP.impostoRetidoPF)}</div>
              </div>

              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8' }}>Geração Livre de Caixa (Economia Líquida da Estratégia)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>
                  {formatMoeda(calcJCP.vantagemLiquida)}
                </div>
              </div>

              <button 
                onClick={handleContabilizarJCP}
                disabled={contabilizado.jcp}
                style={{ width: '100%', backgroundColor: contabilizado.jcp ? '#166534' : '#4338ca', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.jcp ? 'not-allowed' : 'pointer' }}
              >
                {contabilizado.jcp ? '✓ JCP Deliberado e IRRF Retido' : 'Deliberar JCP no Livro Diário'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: REORGANIZAÇÃO SOCIETÁRIA (M&A E TRAVA DE 30%)
            ======================================================== */}
        {abaAtiva === 'mna' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>🏢 Fusão Estratégica (Direito Societário e Fiscal)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Uma empresa lucrativa compra uma empresa que dá prejuízo. Pela lei, ela pode absorver os <strong>Prejuízos Fiscais Acumulados</strong> para não pagar impostos sobre o próprio lucro, mas há a "Trava de 30%".
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Lucro Apurado (Empresa A - Incorporadora):</label>
                  <input type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={paramsMNA.lucroEmpresaA} onChange={e => setParamsMNA({...paramsMNA, lucroEmpresaA: e.target.value})} />
                </div>
                <div>
                  <label style={{...labelStyle, color: '#dc2626'}}>Prejuízo Fiscal Acumulado (Empresa B - Comprada):</label>
                  <input type="number" style={{...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2'}} value={paramsMNA.prejuizoEmpresaB} onChange={e => setParamsMNA({...paramsMNA, prejuizoEmpresaB: e.target.value})} />
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '8px', textTransform: 'uppercase' }}>Auditoria da Trava (Art. 15, Lei 9.065/95)</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Limite Legal de Compensação (30% do Lucro):</span>
                  <strong>{formatMoeda(calcMNA.limiteCompensacao)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4ade80', marginBottom: '10px' }}>
                  <span>Prejuízo Efetivamente Utilizado neste Ano:</span>
                  <strong>- {formatMoeda(calcMNA.prejuizoUtilizado)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#94a3b8', borderBottom: '1px dashed #334155', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span>Saldo de Prejuízo Guardado para o Ano que Vem:</span>
                  <strong>{formatMoeda(calcMNA.saldoPrejuizoRestante)}</strong>
                </div>

                <div style={{ backgroundColor: '#1e40af', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#93c5fd', textTransform: 'uppercase' }}>Nova Base de IRPJ (Lucro Pós-Absorção)</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{formatMoeda(calcMNA.novaBaseCalculo)}</div>
                  <span style={{ fontSize: '12px', color: '#60a5fa', marginTop: '6px', display: 'block' }}>A engenharia societária economizou <strong>{formatMoeda(calcMNA.economiaImposto)}</strong> de caixa em impostos!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: RECUPERAÇÃO JUDICIAL E FALÊNCIA
            ======================================================== */}
        {abaAtiva === 'rj' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>⚖️ Falência e Quadro de Credores (Lei 11.101/05)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              A empresa quebrou e o juiz ordenou a liquidação dos bens. O caixa disponível é muito menor que a dívida. O Controller <strong>deve</strong> pagar respeitando a ordem legal de privilégios. Pagar um fornecedor antes de um funcionário é Crime Falimentar.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold' }}>Massa Falida: Total em Caixa (Bens Liquidados)</span>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#15803d' }}>
                    {formatMoeda(paramsRJ.caixaDisponivel)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{...labelStyle, color: '#dc2626'}}>1º Trabalhistas (Empregados e Acidentes):</label>
                    <input type="number" style={inputStyle} value={paramsRJ.dividaTrabalhista} onChange={e => {setParamsRJ({...paramsRJ, dividaTrabalhista: e.target.value}); setContabilizado(p=>({...p, rj:false}));}} />
                  </div>
                  <div>
                    <label style={labelStyle}>2º Garantia Real (Bancos c/ Imóvel Hipotecado):</label>
                    <input type="number" style={inputStyle} value={paramsRJ.dividaGarantiaReal} onChange={e => {setParamsRJ({...paramsRJ, dividaGarantiaReal: e.target.value}); setContabilizado(p=>({...p, rj:false}));}} />
                  </div>
                  <div>
                    <label style={labelStyle}>3º Créditos Tributários (Impostos):</label>
                    <input type="number" style={inputStyle} value={paramsRJ.dividaTributaria} onChange={e => {setParamsRJ({...paramsRJ, dividaTributaria: e.target.value}); setContabilizado(p=>({...p, rj:false}));}} />
                  </div>
                  <div>
                    <label style={labelStyle}>4º Créditos Quirografários (Fornecedores sem garantia):</label>
                    <input type="number" style={inputStyle} value={paramsRJ.dividaQuirografaria} onChange={e => {setParamsRJ({...paramsRJ, dividaQuirografaria: e.target.value}); setContabilizado(p=>({...p, rj:false}));}} />
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '8px', textTransform: 'uppercase' }}>Execução do Plano (Alvará do Juiz)</h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '8px 0' }}>Classe de Credor</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0' }}>1. Trabalhistas</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: calcRJ.pagTrabalhista > 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{formatMoeda(calcRJ.pagTrabalhista)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>2. Garantia Real (Bancos)</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: calcRJ.pagGarantiaReal > 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{formatMoeda(calcRJ.pagGarantiaReal)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>3. Fisco (Tributário)</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: calcRJ.pagTributario > 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{formatMoeda(calcRJ.pagTributario)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>4. Fornecedores</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', color: calcRJ.pagQuirografaria > 0 ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{formatMoeda(calcRJ.pagQuirografaria)}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ backgroundColor: calcRJ.caixaFim > 0 ? '#1e40af' : '#7f1d1d', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'white', textTransform: 'uppercase' }}>Sobras de Caixa após Liquidação:</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{formatMoeda(calcRJ.caixaFim)}</div>
                  {calcRJ.caixaFim === 0 && <span style={{ fontSize: '11px', color: '#fca5a5' }}>O caixa zerou. Os credores abaixo assumem o calote (loss).</span>}
                </div>

                <button 
                  onClick={handlePagarRJ}
                  disabled={contabilizado.rj}
                  style={{ width: '100%', backgroundColor: contabilizado.rj ? '#166534' : '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.rj ? 'not-allowed' : 'pointer', marginTop: '20px' }}
                >
                  {contabilizado.rj ? '✓ Baixas Realizadas no Diário' : 'Efetuar Pagamentos Judiciais'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}