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
    // 1. Taxas Equivalentes (Mensais)
    const cdiAnual = Math.max(0, macro.selicAnual - 0.10); // CDI costuma ser Selic - 0.10%
    const cdiMensal = (Math.pow(1 + (cdiAnual / 100), 1 / 12) - 1);
    const spreadMensal = (Math.pow(1 + (micro.spreadBancarioAnual / 100), 1 / 12) - 1);
    const taxaEmprestimoMensal = cdiMensal + spreadMensal;

    // 2. Dívida Atrelada ao CDI (Apropriação Mensal)
    const jurosDividaMes = micro.dividaPrincipal * taxaEmprestimoMensal;
    const novoSaldoDevedor = micro.dividaPrincipal + jurosDividaMes;

    // 3. Choque de Inflação no Aluguel (Correção Monetária)
    const taxaIpca = macro.ipcaAcumulado / 100;
    const aumentoAluguel = micro.aluguelAtual * taxaIpca;
    const novoAluguel = micro.aluguelAtual + aumentoAluguel;

    // 4. Tesouraria (Renda Fixa)
    const rendimentoBrutoCDB = micro.caixaOcioso * cdiMensal * (micro.rendimentoCdbCdi / 100);
    const irrfSobraCDB = rendimentoBrutoCDB * 0.225; // 22.5% de IR para aplicações de curtíssimo prazo
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
      ['5.2.05.02'], // Débito: Despesa Financeira (Juros)
      ['2.1.04.01']  // Crédito: Empréstimos a Pagar (Aumenta a dívida)
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
      ['5.2.03.01'], // Débito: Despesa com Aluguel
      ['2.1.01.01']  // Crédito: Fornecedores a Pagar (Aumenta a obrigação)
    );
    setContabilizado(p => ({ ...p, inflacao: true }));
    mostrarToast('Contrato reajustado. A inflação corroeu a margem na DRE.', 'sucesso');
  };

  const handleContabilizarTesouraria = () => {
    if (contabilizado.tesouraria) return mostrarToast('Rendimento já apropriado.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    // Múltiplos débitos/créditos
    registrarFatoGerador(
      `Rendimento Aplicação Financeira (CDB ${micro.rendimentoCdbCdi}% CDI)`,
      calculos.rendimentoBrutoCDB,
      'Economia/Ativo',
      ['1.1.01.03', '1.1.03.04'], // Débito: Aplicações Financeiras (Valor Líquido), IRRF a Recuperar (Ativo)
      ['4.1.02.01', '4.1.02.01']  // Crédito: Receita Financeira (Pelo Bruto) -> Lógica simplificada no array do diário
    );
    // Para precisão no simulador sem refatorar o motor, faremos dois lançamentos:
    // 1. O Rendimento Líquido caindo na aplicação
    registrarFatoGerador(`Rendimento CDB (Líquido)`, calculos.rendimentoLiquidoCDB, 'Economia/Tesouraria', ['1.1.01.03'], ['4.1.02.01']);
    // 2. O IRRF Retido na Fonte (Ativo a Compensar)
    registrarFatoGerador(`IRRF Retido s/ Rendimento CDB`, calculos.irrfSobraCDB, 'Economia/Impostos', ['1.1.03.04'], ['4.1.02.01']);
    
    setContabilizado(p => ({ ...p, tesouraria: true }));
    mostrarToast('Rendimento reconhecido! O caixa ocioso gerou lucro financeiro.', 'sucesso');
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #4f46e5' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#4f46e5', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>AMBIENTE MACROECONÔMICO</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Impactos da Economia na Contabilidade</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Simule choques de juros (SELIC) e inflação (IPCA) correndo os Balanços e a DRE.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('cenario')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'cenario' ? '#4f46e5' : 'transparent', color: abaAtiva === 'cenario' ? 'white' : '#cbd5e1' }}>⚙️ Cenário Macro</button>
          <button onClick={() => setAbaAtiva('divida')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'divida' ? '#4f46e5' : 'transparent', color: abaAtiva === 'divida' ? 'white' : '#cbd5e1' }}>📉 Choque de Juros (Dívida)</button>
          <button onClick={() => setAbaAtiva('inflacao')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'inflacao' ? '#4f46e5' : 'transparent', color: abaAtiva === 'inflacao' ? 'white' : '#cbd5e1' }}>🔥 Inflação (IPCA)</button>
          <button onClick={() => setAbaAtiva('tesouraria')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'tesouraria' ? '#4f46e5' : 'transparent', color: abaAtiva === 'tesouraria' ? 'white' : '#cbd5e1' }}>📈 Tesouraria (Renda Fixa)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: CENÁRIO MACROECONÔMICO
            ======================================================== */}
        {abaAtiva === 'cenario' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🏦 Banco Central do Brasil (COPOM)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <label htmlFor="mSelic" style={{...labelStyle, color: '#1e40af'}}>Taxa SELIC Meta (% ao ano):</label>
                  <input id="mSelic" type="number" step="0.25" style={{...inputStyle, borderColor: '#93c5fd'}} value={macro.selicAnual} onChange={e => {setMacro({...macro, selicAnual: e.target.value}); setContabilizado({divida:false, inflacao:false, tesouraria:false});}} />
                  <span style={{ fontSize: '11px', color: '#1d4ed8', marginTop: '6px', display: 'block' }}>Taxa básica de juros da economia. Define o custo do dinheiro no tempo.</span>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <label htmlFor="mIpca" style={{...labelStyle, color: '#991b1b'}}>IPCA Acumulado 12 Meses (Inflação %):</label>
                  <input id="mIpca" type="number" step="0.1" style={{...inputStyle, borderColor: '#fca5a5'}} value={macro.ipcaAcumulado} onChange={e => {setMacro({...macro, ipcaAcumulado: e.target.value}); setContabilizado({divida:false, inflacao:false, tesouraria:false});}} />
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '6px', display: 'block' }}>Índice de Preços ao Consumidor. Mede a perda do poder de compra da moeda.</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>💼 Variáveis Internas da Empresa (Microeconomia)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Saldo Devedor de Empréstimos (Balanço):</label>
                  <input type="number" style={inputStyle} value={micro.dividaPrincipal} onChange={e => setMicro({...micro, dividaPrincipal: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Contrato de Aluguel Vigente (Reajuste Mês):</label>
                  <input type="number" style={inputStyle} value={micro.aluguelAtual} onChange={e => setMicro({...micro, aluguelAtual: e.target.value})} />
                </div>
                <div>
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>📉 O Efeito da SELIC no Passivo Financeiro</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Quando a empresa capta recursos com "Taxa Pós-Fixada", ela se torna refém do Banco Central. Uma Selic alta esmaga o lucro líquido através das Despesas Financeiras.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold' }}>Empréstimo Indexado (CDI + Spread)</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '5px 0' }}>{formatMoeda(micro.dividaPrincipal)}</div>
                  <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold' }}>Custo: CDI ({formatPct(calculos.cdiAnual)} a.a.) + {formatPct(micro.spreadBancarioAnual)} de Spread</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span>Taxa Total de Juros (Mensalizada):</span>
                  <strong style={{ color: '#1e40af' }}>{formatPct(calculos.taxaEmprestimoMensal)} a.m.</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#dc2626', fontWeight: 'bold' }}>
                  <span>Despesa com Juros (Acumulada no Mês):</span>
                  <span>{formatMoeda(calculos.jurosDividaMes)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px' }}>Partidas Dobradas (Apropriação CPC 08)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#f87171'}}>D</strong> 5.2.05.02 - Despesa de Juros (DRE)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.jurosDividaMes)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.04.01 - Empréstimos a Pagar (Passivo)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.jurosDividaMes)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '15px' }}>*Por Regime de Competência, o juro aumenta o passivo financeiro da empresa mensalmente, independente do pagamento da parcela ocorrer ou não.</p>
                </div>
                <button 
                  onClick={handleContabilizarDivida}
                  disabled={contabilizado.divida}
                  style={{ backgroundColor: contabilizado.divida ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.divida ? 'not-allowed' : 'pointer', marginTop: '20px' }}
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>🔥 Correção Monetária de Contratos (O Dragão da Inflação)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Quando a economia perde poder de compra, os contratos de longo prazo (como Aluguéis e Arrendamentos) possuem cláusulas de gatilho para correção pela inflação passada.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Efeito IPCA no Custo Fixo</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                  <span>Aluguel Histórico Defasado:</span>
                  <strong>{formatMoeda(micro.aluguelAtual)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#dc2626', marginBottom: '10px' }}>
                  <span>(+) Correção Monetária (IPCA Acum. {macro.ipcaAcumulado}%):</span>
                  <strong>{formatMoeda(calculos.aumentoAluguel)}</strong>
                </div>
                
                <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Novo Custo Operacional Corrigido</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626' }}>
                    {formatMoeda(calculos.novoAluguel)}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#991b1b' }}>Se a empresa não conseguir repassar esse aumento no preço dos seus produtos, a margem de lucro será diretamente corroída.</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px' }}>Partidas Dobradas (Diferença)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#f87171'}}>D</strong> 5.2.03.01 - Desp. com Aluguel (DRE)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.aumentoAluguel)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.01.01 - Forn. a Pagar (Passivo)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.aumentoAluguel)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={handleContabilizarInflacao}
                  disabled={contabilizado.inflacao}
                  style={{ backgroundColor: contabilizado.inflacao ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.inflacao ? 'not-allowed' : 'pointer', marginTop: '20px' }}
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>📈 Tesouraria Avançada (O lado bom da Selic Alta)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Para quem tem dinheiro em caixa, juros altos representam Custo de Oportunidade. Dinheiro na conta corrente física não rende nada; alocado em CBD (Renda Fixa), ele gera receita.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Capital Aplicado em CDB</span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{micro.rendimentoCdbCdi}% do CDI</span>
                </div>
                
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>{formatMoeda(micro.caixaOcioso)}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span>Rendimento Bruto (Mês):</span>
                  <strong style={{ color: '#16a34a' }}>+ {formatMoeda(calculos.rendimentoBrutoCDB)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#dc2626', marginTop: '6px' }}>
                  <span>Imposto de Renda (IRRF Retido 22,5%):</span>
                  <strong>- {formatMoeda(calculos.irrfSobraCDB)}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#16a34a', fontWeight: '900', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '10px' }}>
                  <span>Acréscimo Líquido ao Caixa:</span>
                  <span>{formatMoeda(calculos.rendimentoLiquidoCDB)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px' }}>Partidas Dobradas (Rendimentos e Tributos)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.01.03 - Aplicações Financeiras</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.rendimentoLiquidoCDB)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.04 - IRRF a Recuperar (Ativo)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.irrfSobraCDB)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', borderTop: '1px solid #334155', paddingTop: '10px' }}><strong style={{color:'#f87171'}}>C</strong> 4.1.02.01 - Receitas Financeiras (DRE)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', borderTop: '1px solid #334155', paddingTop: '10px' }}>{formatMoeda(calculos.rendimentoBrutoCDB)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', lineHeight: '1.4' }}>*O banco retém o imposto na fonte, mas o Controller inteligente registra ele no Ativo como "A Recuperar" para abater do IRPJ Anual a pagar.</p>
                </div>
                <button 
                  onClick={handleContabilizarTesouraria}
                  disabled={contabilizado.tesouraria}
                  style={{ backgroundColor: contabilizado.tesouraria ? '#166534' : '#4f46e5', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.tesouraria ? 'not-allowed' : 'pointer', marginTop: '15px' }}
                >
                  {contabilizado.tesouraria ? '✓ Rendimento Contabilizado' : 'Reconhecer Receita e IRRF no Diário'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}