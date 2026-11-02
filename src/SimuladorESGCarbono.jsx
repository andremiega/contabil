import React, { useState, useMemo } from 'react';

export default function SimuladorESGCarbono({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estado do Simulador de Inventário de Carbono (GHG Protocol)
  const [params, setParams] = useState({
    frotaLitrosMes: 5000, // Escopo 1: Combustível fóssil consumido (Litros)
    energiaKwhMes: 45000, // Escopo 2: Energia elétrica adquirida (kWh)
    residuosToneladasMes: 12, // Escopo 3: Resíduos sólidos gerados (Toneladas)
    precoCreditoCarbono: 185.00, // Preço de 1 tonelada de CO2e no mercado (R$)
  });

  const [abaAtiva, setAbaAtiva] = useState('inventario');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO ESG (PEGADA DE CARBONO)
  // ==========================================
  const calculos = useMemo(() => {
    const fatorEscopo1 = 0.00268;
    const fatorEscopo2 = 0.00008;
    const fatorEscopo3 = 0.5;

    const emissaoEscopo1 = params.frotaLitrosMes * fatorEscopo1;
    const emissaoEscopo2 = params.energiaKwhMes * fatorEscopo2;
    const emissaoEscopo3 = params.residuosToneladasMes * fatorEscopo3;

    const pegadaTotalMensal = emissaoEscopo1 + emissaoEscopo2 + emissaoEscopo3;
    const pegadaTotalAnual = pegadaTotalMensal * 12;

    const custoNeutralizacaoMensal = pegadaTotalMensal * params.precoCreditoCarbono;
    const custoNeutralizacaoAnual = pegadaTotalAnual * params.precoCreditoCarbono;

    return {
      emissaoEscopo1,
      emissaoEscopo2,
      emissaoEscopo3,
      pegadaTotalMensal,
      pegadaTotalAnual,
      custoNeutralizacaoMensal,
      custoNeutralizacaoAnual
    };
  }, [params]);

  // ==========================================
  // DISPARO PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarNeutralizacao = () => {
    if (!calculos) return;
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('A compra de créditos deste mês já foi contabilizada!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro de integração: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      registrarFatoGerador(
        `Aquisição de Créditos de Carbono - Neutralização Mês Atual (${formatNum(calculos.pegadaTotalMensal)} tCO2e)`,
        calculos.custoNeutralizacaoMensal,
        'Compliance/ESG',
        ['5.2.04.05'], 
        ['1.1.01.02']  
      );

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Créditos de carbono adquiridos! Operação Net Zero escriturada.', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setJaContabilizado(false);
    if (typeof mostrarToast === 'function') mostrarToast('Inventário resetado para novo cálculo de emissões.', 'sucesso');
  };

  // Estilos Padronizados
  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #10b981', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#10b981', color: '#022c22', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>RELATO INTEGRADO & ESG</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Inventário de Carbono e Créditos Verdes</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Calcule a pegada climática da empresa, orce a neutralização e audite os critérios ESG.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('inventario')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'inventario' ? '#10b981' : 'transparent', color: abaAtiva === 'inventario' ? '#022c22' : '#cbd5e1' }}>⚙️ Inventário GEE</button>
          <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#10b981' : 'transparent', color: abaAtiva === 'dashboard' ? '#022c22' : '#cbd5e1' }}>📊 Relatório ESG</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#10b981' : 'transparent', color: abaAtiva === 'memoria' ? '#022c22' : '#cbd5e1' }}>🧠 Metodologia</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#10b981' : 'transparent', color: abaAtiva === 'contabilidade' ? '#022c22' : '#cbd5e1' }}>🌳 Neutralização (Diário)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: INVENTÁRIO (COLETA DE DADOS)
            ======================================================== */}
        {abaAtiva === 'inventario' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>📋 Consumo Operacional do Mês</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="esgFrota" style={{...labelStyle, color: '#991b1b'}}>Escopo 1: Combustíveis (Frota/Geradores)</label>
                  <input id="esgFrota" name="esgFrota" type="number" style={{...inputStyle, borderColor: '#fca5a5'}} value={params.frotaLitrosMes} onChange={e => {setParams({...params, frotaLitrosMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Litros de Diesel/Gasolina consumidos no mês.</span>
                </div>
                
                <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="esgEnergia" style={{...labelStyle, color: '#b45309'}}>Escopo 2: Eletricidade Comprada</label>
                  <input id="esgEnergia" name="esgEnergia" type="number" style={{...inputStyle, borderColor: '#fcd34d'}} value={params.energiaKwhMes} onChange={e => {setParams({...params, energiaKwhMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#92400e', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*kWh consumidos nas contas de luz do mês.</span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #64748b', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="esgResiduos" style={{...labelStyle, color: '#475569'}}>Escopo 3: Resíduos e Cadeia de Valor</label>
                  <input id="esgResiduos" name="esgResiduos" type="number" style={{...inputStyle, borderColor: '#cbd5e1'}} value={params.residuosToneladasMes} onChange={e => {setParams({...params, residuosToneladasMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#475569', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Toneladas de lixo descartadas em aterros.</span>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', marginTop: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="esgPreco" style={{ ...labelStyle, color: '#166534' }}>Cotação do Crédito de Carbono (R$ / tCO2e):</label>
                  <input id="esgPreco" name="esgPreco" type="number" step="0.1" style={{...inputStyle, borderColor: '#86efac'}} value={params.precoCreditoCarbono} onChange={e => {setParams({...params, precoCreditoCarbono: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Preço de mercado para compensar 1 tonelada de carbono.</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE RESULTADOS (DIAGNOSTICO) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>🌍 Extrato do Inventário (Pegada de Carbono)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Escopo 1 (Emissões Diretas):</span>
                  <strong style={{ color: '#ef4444', wordBreak: 'break-word' }}>{formatNum(calculos.emissaoEscopo1, 2)} tCO₂e</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Escopo 2 (Emissões Indiretas - Energia):</span>
                  <strong style={{ color: '#f59e0b', wordBreak: 'break-word' }}>{formatNum(calculos.emissaoEscopo2, 2)} tCO₂e</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Escopo 3 (Cadeia / Resíduos):</span>
                  <strong style={{ color: '#64748b', wordBreak: 'break-word' }}>{formatNum(calculos.emissaoEscopo3, 2)} tCO₂e</strong>
                </div>

                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '10px', marginTop: '6px', textAlign: 'center', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>PEGADA TOTAL DE CARBONO (MENSAL)</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#cbd5e1', wordBreak: 'break-word' }}>
                    {formatNum(calculos.pegadaTotalMensal, 2)} <span style={{ fontSize: '15px' }}>tCO₂e</span>
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', textAlign: 'center', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Orçamento Mensal para o "Net Zero"</div>
                  <div style={{ fontSize: '21px', fontWeight: '900', color: '#16a34a', wordBreak: 'break-word' }}>
                    {formatMoeda(calculos.custoNeutralizacaoMensal)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#15803d', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>Impacto projetado na DRE para neutralizar a operação do mês.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: DASHBOARD ESG
            ======================================================== */}
        {abaAtiva === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📊 Relatório Executivo ESG (Projeção Anual)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>Este relatório atende às normas do IFRS (ISSB) para divulgação climática corporativa, apresentando aos investidores a exposição da empresa ao risco de carbono.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Projeção Anual de Emissões</span>
                <div style={{ fontSize: '30px', fontWeight: '900', color: '#e2e8f0', margin: '8px 0', wordBreak: 'break-word' }}>
                  {formatNum(calculos.pegadaTotalAnual, 2)} <span style={{ fontSize: '16px' }}>tCO₂e</span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#cbd5e1', wordBreak: 'break-word' }}>Toneladas equivalentes de gás carbônico lançadas na atmosfera por ano.</span>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '16px', borderLeft: '6px solid #16a34a', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Passivo Climático Anualizado (Risco)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#15803d', margin: '8px 0', wordBreak: 'break-word' }}>
                  {formatMoeda(calculos.custoNeutralizacaoAnual)}
                </div>
                <span style={{ fontSize: '11.5px', color: '#14532d', wordBreak: 'break-word' }}>Custo anual projetado para a empresa adquirir certificados verdes (CBIOs) e se manter competitiva para fundos ESG.</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>Composição da Pegada (Gráfico Analítico)</h3>
              
              <div style={{ display: 'flex', height: '26px', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', boxSizing: 'border-box' }}>
                <div style={{ width: `${(calculos.emissaoEscopo1 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#ef4444' }}></div>
                <div style={{ width: `${(calculos.emissaoEscopo2 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#f59e0b' }}></div>
                <div style={{ width: `${(calculos.emissaoEscopo3 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#64748b' }}></div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12.5px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', flexShrink: 0 }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo1 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 1</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%', flexShrink: 0 }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo2 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 2</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#64748b', borderRadius: '50%', flexShrink: 0 }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo3 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 3</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO E METODOLOGIA
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🧠 Como o Inventário é Calculado? (GHG Protocol)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#059669', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>🏭</span> Os 3 Escopos do Carbono</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  A metodologia global classifica as emissões em 3 níveis:<br/><br/>
                  • <strong>Escopo 1:</strong> A fumaça que sai da chaminé ou do escapamento da frota (Emissões Diretas).<br/>
                  • <strong>Escopo 2:</strong> A poluição gerada pelas usinas para produzir a energia comprada.<br/>
                  • <strong>Escopo 3:</strong> Emissões de fornecedores, viagens e descarte de resíduos (Cadeia de Valor).
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>🌳</span> O que é um Crédito de Carbono?</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  É um certificado eletrônico provando que <strong>1 tonelada de CO₂</strong> deixou de ser emitida ou foi capturada da atmosfera.<br/><br/>
                  Quando a empresa polui {formatNum(calculos.pegadaTotalMensal, 0)} toneladas, ela compra e "aposenta" {formatNum(calculos.pegadaTotalMensal, 0)} créditos verdes. A conta matemática zera, tornando-a "Net Zero".
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO (NEUTRALIZAÇÃO)
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🌳 Contabilidade Ambiental (Neutralização)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              A diretoria aprovou a compra de créditos verdes para zerar a pegada de <strong>{formatNum(calculos.pegadaTotalMensal, 2)} tCO₂e</strong> deste mês. Desembolso previsto: <strong>{formatMoeda(calculos.custoNeutralizacaoMensal)}</strong>.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '1px' }}>
                Lançamento Contábil (Aquisição para Baixa Imediata)
              </div>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '450px' }}>
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
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>DRE</span>
                        <strong>5.2.04.05 - Sustentabilidade e ESG</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.custoNeutralizacaoMensal)}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>ATIVO</span>
                        <strong>1.1.01.02 - Banco Conta Movimento</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.custoNeutralizacaoMensal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px', borderTop: '2px solid #334155', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '14.5px' }}>Impacto da Operação:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '13.5px', wordBreak: 'break-word' }}>Reduz o Caixa no Ativo e reconhece despesa na DRE.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #16a34a', flex: '1 1 300px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block', marginBottom: '6px' }}>Nota de Controladoria (Compliance Verde)</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#15803d', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  Empresas sem neutralização de carbono perdem linhas de crédito ESG. Esta despesa garante competitividade corporativa global.
                </p>
              </div>

              <button 
                onClick={handleContabilizarNeutralizacao}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#10b981', 
                  color: jaContabilizado ? 'white' : '#022c22', border: 'none', padding: '14px 22px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '14px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s', width: '100%', maxWidth: '340px', boxSizing: 'border-box'
                }}
              >
                {jaContabilizado ? '✓ Empresa Net Zero Declarada' : '🌳 Comprar Créditos e Efetivar no Diário'}
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