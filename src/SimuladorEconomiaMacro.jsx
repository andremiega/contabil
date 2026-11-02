import React, { useState, useMemo } from 'react';

export default function SimuladorEconomiaMacro({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // Estados Macro e Microeconômicos
  const [macro, setMacro] = useState({
    selicAnual: 13.75, // Choque de Juros (Crise)
    ipcaAcumulado: 8.50, // Inflação Alta
  });

  const [micro, setMicro] = useState({
    dividaPrincipal: 500000.00, // Passivo em CDI
    spreadBancarioAnual: 3.50, // CDI + 3.5%
    aluguelAtual: 15000.00, // Despesa fixa indexada ao IPCA
    caixaOcioso: 250000.00, // Dinheiro parado no banco
    rendimentoCdbCdi: 100 // 100% do CDI
  });

  const [abaAtiva, setAbaAtiva] = useState('cenario');
  const [contabilizado, setContabilizado] = useState({ divida: false, inflacao: false, tesouraria: false });

  // ==========================================
  // MOTOR DE CÁLCULO ECONÔMICO-FINANCEIRO
  // ==========================================
  const calculos = useMemo(() => {
    const cdiAnual = Math.max(0, macro.selicAnual - 0.10); 
    const cdiMensal = (Math.pow(1 + (cdiAnual / 100), 1 / 12) - 1);
    const spreadMensal = (Math.pow(1 + (micro.spreadBancarioAnual / 100), 1 / 12) - 1);
    const taxaEmprestimoMensal = cdiMensal + spreadMensal;

    const jurosDividaMes = micro.dividaPrincipal * taxaEmprestimoMensal;
    const novoSaldoDevedor = micro.dividaPrincipal + jurosDividaMes;

    const taxaIpca = macro.ipcaAcumulado / 100;
    const aumentoAluguel = micro.aluguelAtual * taxaIpca;
    const novoAluguel = micro.aluguelAtual + aumentoAluguel;

    const rendimentoBrutoCDB = micro.caixaOcioso * cdiMensal * (micro.rendimentoCdbCdi / 100);
    const irrfSobraCDB = rendimentoBrutoCDB * 0.225; 
    const rendimentoLiquidoCDB = rendimentoBrutoCDB - irrfSobraCDB;

    return {
      cdiAnual, cdiMensal: cdiMensal * 100, taxaEmprestimoMensal: taxaEmprestimoMensal * 100,
      jurosDividaMes, novoSaldoDevedor,
      aumentoAluguel, novoAluguel,
      rendimentoBrutoCDB, irrfSobraCDB, rendimentoLiquidoCDB
    };
  }, [macro, micro]);

  // ==========================================
  // DISPAROS PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarDivida = () => {
    if (contabilizado.divida) return mostrarToast('Apropriação de juros já realizada.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    registrarFatoGerador(
      `Apropriação de Juros (Empréstimo CDI + Spread) - Selic a ${macro.selicAnual}%`,
      calculos.jurosDividaMes,
      'Economia/Passivo',
      ['5.2.05.02'], 
      ['2.1.04.01']  
    );
    setContabilizado(p => ({ ...p, divida: true }));
    mostrarToast('Juros apropriados! A dívida no Passivo aumentou.', 'sucesso');
  };

  const handleContabilizarInflacao = () => {
    if (contabilizado.inflacao) return mostrarToast('Reajuste de IPCA já contabilizado.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    registrarFatoGerador(
      `Atualização Monetária de Aluguel (IPCA ${macro.ipcaAcumulado}%)`,
      calculos.aumentoAluguel,
      'Economia/Custos',
      ['5.2.03.01'], 
      ['2.1.01.01']  
    );
    setContabilizado(p => ({ ...p, inflacao: true }));
    mostrarToast('Contrato reajustado. A inflação corroeu a margem na DRE.', 'sucesso');
  };

  const handleContabilizarTesouraria = () => {
    if (contabilizado.tesouraria) return mostrarToast('Rendimento já apropriado.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    registrarFatoGerador(`Rendimento CDB (Líquido)`, calculos.rendimentoLiquidoCDB, 'Economia/Tesouraria', ['1.1.01.03'], ['4.1.02.01']);
    registrarFatoGerador(`IRRF Retido s/ Rendimento CDB`, calculos.irrfSobraCDB, 'Economia/Impostos', ['1.1.03.04'], ['4.1.02.01']);
    
    setContabilizado(p => ({ ...p, tesouraria: true }));
    mostrarToast('Rendimento reconhecido! O caixa ocioso gerou lucro financeiro.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #4f46e5', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#4f46e5', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>MACROECONOMIA</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Impactos da Economia na Contabilidade</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Simule choques de juros (SELIC) e inflação (IPCA) correndo os Balanços e a DRE.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('cenario')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'cenario' ? '#4f46e5' : 'transparent', color: abaAtiva === 'cenario' ? 'white' : '#cbd5e1' }}>⚙️ Cenário</button>
          <button onClick={() => setAbaAtiva('divida')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'divida' ? '#4f46e5' : 'transparent', color: abaAtiva === 'divida' ? 'white' : '#cbd5e1' }}>📉 Juros</button>
          <button onClick={() => setAbaAtiva('inflacao')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'inflacao' ? '#4f46e5' : 'transparent', color: abaAtiva === 'inflacao' ? 'white' : '#cbd5e1' }}>🔥 Inflação</button>
          <button onClick={() => setAbaAtiva('tesouraria')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'tesouraria' ? '#4f46e5' : 'transparent', color: abaAtiva === 'tesouraria' ? 'white' : '#cbd5e1' }}>📈 Tesouraria</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: CENÁRIO MACROECONÔMICO
            ======================================================== */}
        {abaAtiva === 'cenario' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>🏦 Banco Central do Brasil (COPOM)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="mSelic" style={{...labelStyle, color: '#1e40af'}}>Taxa SELIC Meta (% ao ano):</label>
                  <input id="mSelic" type="number" step="0.25" style={{...inputStyle, borderColor: '#93c5fd'}} value={macro.selicAnual} onChange={e => {setMacro({...macro, selicAnual: e.target.value}); setContabilizado({divida:false, inflacao:false, tesouraria:false});}} />
                  <span style={{ fontSize: '11px', color: '#1d4ed8', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Taxa básica de juros da economia. Define o custo do dinheiro no tempo.</span>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="mIpca" style={{...labelStyle, color: '#991b1b'}}>IPCA Acumulado 12 Meses (Inflação %):</label>
                  <input id="mIpca" type="number" step="0.1" style={{...inputStyle, borderColor: '#fca5a5'}} value={macro.ipcaAcumulado} onChange={e => {setMacro({...macro, ipcaAcumulado: e.target.value}); setContabilizado({divida:false, inflacao:false, tesouraria:false});}} />
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Índice de Preços ao Consumidor. Mede a perda do poder de compra da moeda.</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>💼 Variáveis Internas da Empresa (Microeconomia)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Saldo Devedor de Empréstimos (Balanço):</label>
                  <input type="number" style={inputStyle} value={micro.dividaPrincipal} onChange={e => setMicro({...micro, dividaPrincipal: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Contrato de Aluguel Vigente (Reajuste Mês):</label>
                  <input type="number" style={inputStyle} value={micro.aluguelAtual} onChange={e => setMicro({...micro, aluguelAtual: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Caixa e Equivalentes (Dinheiro Ocioso Banco):</label>
                  <input type="number" style={inputStyle} value={micro.caixaOcioso} onChange={e => setMicro({...micro, caixaOcioso: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: DÍVIDA E CHOQUE DE JUROS (PASSIVO)
            ======================================================== */}
        {abaAtiva === 'divida' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📉 O Efeito da SELIC no Passivo Financeiro</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Quando a empresa capta recursos com "Taxa Pós-Fixada", ela se torna refém do Banco Central. Uma Selic alta esmaga o lucro líquido através das Despesas Financeiras.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11.5px', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold', wordBreak: 'break-word' }}>Empréstimo Indexado (CDI + Spread)</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '4px 0', wordBreak: 'break-word' }}>{formatMoeda(micro.dividaPrincipal)}</div>
                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>Custo: CDI ({formatPct(calculos.cdiAnual)} a.a.) + {formatPct(micro.spreadBancarioAnual)} de Spread</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Taxa Total de Juros (Mensalizada):</span>
                  <strong style={{ color: '#1e40af', wordBreak: 'break-word' }}>{formatPct(calculos.taxaEmprestimoMensal)} a.m.</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', fontWeight: 'bold', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Despesa com Juros (Acumulada no Mês):</span>
                  <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.jurosDividaMes)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>Partidas Dobradas (Apropriação CPC 08)</div>
                  <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '380px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>D</strong> 5.2.05.02 - Despesa de Juros (DRE)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.jurosDividaMes)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.04.01 - Empréstimos a Pagar</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.jurosDividaMes)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '12px', lineHeight: '1.4', wordBreak: 'break-word' }}>*Por Regime de Competência, o juro aumenta o passivo financeiro da empresa mensalmente.</p>
                </div>
                <button 
                  onClick={handleContabilizarDivida}
                  disabled={contabilizado.divida}
                  style={{ backgroundColor: contabilizado.divida ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.divida ? 'not-allowed' : 'pointer', marginTop: '16px', boxSizing: 'border-box', width: '100%' }}
                >
                  {contabilizado.divida ? '✓ Juros Apropriados' : 'Apropriar Juros no Passivo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: INFLAÇÃO E CORREÇÃO (CUSTOS)
            ======================================================== */}
        {abaAtiva === 'inflacao' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🔥 Correção Monetária de Contratos (O Dragão da Inflação)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Quando a economia perde poder de compra, os contratos de longo prazo (como Aluguéis e Arrendamentos) possuem cláusulas de gatilho para correção pela inflação passada.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Efeito IPCA no Custo Fixo</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Aluguel Histórico Defasado:</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(micro.aluguelAtual)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>(+) Correção (IPCA {macro.ipcaAcumulado}%):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.aumentoAluguel)}</strong>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444', marginTop: '16px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', wordBreak: 'break-word' }}>Novo Custo Operacional Corrigido</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626', wordBreak: 'break-word', marginTop: '4px' }}>
                    {formatMoeda(calculos.novoAluguel)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#991b1b', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>Se não houver repasse no preço, a margem será corroída.</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>Partidas Dobradas (Diferença)</div>
                  <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '380px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>D</strong> 5.2.03.01 - Desp. com Aluguel (DRE)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.aumentoAluguel)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.01.01 - Forn. a Pagar</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.aumentoAluguel)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <button 
                  onClick={handleContabilizarInflacao}
                  disabled={contabilizado.inflacao}
                  style={{ backgroundColor: contabilizado.inflacao ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.inflacao ? 'not-allowed' : 'pointer', marginTop: '16px', boxSizing: 'border-box', width: '100%' }}
                >
                  {contabilizado.inflacao ? '✓ Inflação Reconhecida' : 'Contabilizar Aumento de Custo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: TESOURARIA E INVESTIMENTOS (ATIVO)
            ======================================================== */}
        {abaAtiva === 'tesouraria' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📈 Tesouraria Avançada (O lado bom da Selic Alta)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Para quem tem dinheiro em caixa, juros altos representam Custo de Oportunidade. Dinheiro na conta corrente física não rende nada; alocado em CBD (Renda Fixa), ele gera receita.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Capital Aplicado em CDB</span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{micro.rendimentoCdbCdi}% do CDI</span>
                </div>
                
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', wordBreak: 'break-word' }}>{formatMoeda(micro.caixaOcioso)}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Rendimento Bruto (Mês):</span>
                  <strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>+ {formatMoeda(calculos.rendimentoBrutoCDB)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Imposto de Renda (IRRF Retido 22,5%):</span>
                  <strong style={{ wordBreak: 'break-word' }}>- {formatMoeda(calculos.irrfSobraCDB)}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', color: '#16a34a', fontWeight: '900', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Acréscimo Líquido ao Caixa:</span>
                  <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.rendimentoLiquidoCDB)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>Partidas Dobradas (Rendimentos e Tributos)</div>
                  <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '380px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.01.03 - Aplicações Financeiras</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.rendimentoLiquidoCDB)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.04 - IRRF a Recuperar (Ativo)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.irrfSobraCDB)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>C</strong> 4.1.02.01 - Receitas Financeiras (DRE)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.rendimentoBrutoCDB)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', lineHeight: '1.4', wordBreak: 'break-word' }}>*O banco retém o imposto na fonte, mas o Controller inteligente registra ele no Ativo como "A Recuperar".</p>
                </div>
                <button 
                  onClick={handleContabilizarTesouraria}
                  disabled={contabilizado.tesouraria}
                  style={{ backgroundColor: contabilizado.tesouraria ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.tesouraria ? 'not-allowed' : 'pointer', marginTop: '16px', boxSizing: 'border-box', width: '100%' }}
                >
                  {contabilizado.tesouraria ? '✓ Rendimento Contabilizado' : 'Reconhecer Receita e IRRF no Diário'}
                </button>
              </div>
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