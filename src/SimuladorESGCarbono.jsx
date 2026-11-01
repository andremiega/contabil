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
    // Fatores de Emissão (Valores ilustrativos baseados no GHG Protocol Brasil)
    // 1 Litro de Diesel = ~0,00268 tCO2e
    // 1 kWh no Brasil (Matriz limpa) = ~0,00008 tCO2e
    // 1 Tonelada de Resíduo Orgânico em Aterro = ~0,5 tCO2e

    const fatorEscopo1 = 0.00268;
    const fatorEscopo2 = 0.00008;
    const fatorEscopo3 = 0.5;

    const emissaoEscopo1 = params.frotaLitrosMes * fatorEscopo1;
    const emissaoEscopo2 = params.energiaKwhMes * fatorEscopo2;
    const emissaoEscopo3 = params.residuosToneladasMes * fatorEscopo3;

    const pegadaTotalMensal = emissaoEscopo1 + emissaoEscopo2 + emissaoEscopo3;
    const pegadaTotalAnual = pegadaTotalMensal * 12;

    // Para neutralizar (Net Zero), a empresa precisa comprar 1 crédito de carbono para cada 1 tCO2e emitida.
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
      // Reconhecimento da Despesa Ambiental para atingir o Net Zero
      registrarFatoGerador(
        `Aquisição de Créditos de Carbono - Neutralização Mês Atual (${formatNum(calculos.pegadaTotalMensal)} tCO2e)`,
        calculos.custoNeutralizacaoMensal,
        'Compliance/ESG',
        ['5.2.04.05'], // Débito: Despesas com Sustentabilidade e ESG (Conta Genérica de Despesa Administrativa)
        ['1.1.01.02']  // Crédito: Banco Conta Movimento (Saída de Caixa)
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
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #10b981' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#10b981', color: '#022c22', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>RELATO INTEGRADO & ESG</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Inventário de Carbono e Créditos Verdes</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Calcule a pegada climática da empresa, orce a neutralização e audite os critérios ESG.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('inventario')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'inventario' ? '#10b981' : 'transparent', color: abaAtiva === 'inventario' ? '#064e3b' : '#cbd5e1' }}>⚙️ Inventário GEE</button>
          <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#10b981' : 'transparent', color: abaAtiva === 'dashboard' ? '#064e3b' : '#cbd5e1' }}>📊 Relatório ESG</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#10b981' : 'transparent', color: abaAtiva === 'memoria' ? '#064e3b' : '#cbd5e1' }}>🧠 Metodologia</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#10b981' : 'transparent', color: abaAtiva === 'contabilidade' ? '#064e3b' : '#cbd5e1' }}>🌳 Neutralização (Diário)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: INVENTÁRIO (COLETA DE DADOS)
            ======================================================== */}
        {abaAtiva === 'inventario' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📋 Consumo Operacional do Mês</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <label htmlFor="esgFrota" style={{...labelStyle, color: '#991b1b'}}>Escopo 1: Combustíveis (Frota/Geradores)</label>
                  <input id="esgFrota" name="esgFrota" type="number" style={{...inputStyle, borderColor: '#fca5a5'}} value={params.frotaLitrosMes} onChange={e => {setParams({...params, frotaLitrosMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '6px', display: 'block' }}>*Litros de Diesel/Gasolina consumidos no mês.</span>
                </div>
                
                <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <label htmlFor="esgEnergia" style={{...labelStyle, color: '#b45309'}}>Escopo 2: Eletricidade Comprada</label>
                  <input id="esgEnergia" name="esgEnergia" type="number" style={{...inputStyle, borderColor: '#fcd34d'}} value={params.energiaKwhMes} onChange={e => {setParams({...params, energiaKwhMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#92400e', marginTop: '6px', display: 'block' }}>*kWh consumidos nas contas de luz do mês.</span>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #64748b' }}>
                  <label htmlFor="esgResiduos" style={{...labelStyle, color: '#475569'}}>Escopo 3: Resíduos e Cadeia de Valor</label>
                  <input id="esgResiduos" name="esgResiduos" type="number" style={{...inputStyle, borderColor: '#cbd5e1'}} value={params.residuosToneladasMes} onChange={e => {setParams({...params, residuosToneladasMes: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#475569', marginTop: '6px', display: 'block' }}>*Toneladas de lixo descartadas em aterros.</span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
                  <label htmlFor="esgPreco" style={{ ...labelStyle, color: '#166534' }}>Cotação do Crédito de Carbono (R$ / tCO2e):</label>
                  <input id="esgPreco" name="esgPreco" type="number" step="0.1" style={{...inputStyle, borderColor: '#86efac'}} value={params.precoCreditoCarbono} onChange={e => {setParams({...params, precoCreditoCarbono: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', display: 'block' }}>*Preço de mercado para compensar 1 tonelada de carbono.</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE RESULTADOS (DIAGNOSTICO) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🌍 Extrato do Inventário (Pegada de Carbono)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                  <span>Escopo 1 (Emissões Diretas):</span>
                  <strong style={{ color: '#ef4444' }}>{formatNum(calculos.emissaoEscopo1, 2)} tCO₂e</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                  <span>Escopo 2 (Emissões Indiretas - Energia):</span>
                  <strong style={{ color: '#f59e0b' }}>{formatNum(calculos.emissaoEscopo2, 2)} tCO₂e</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                  <span>Escopo 3 (Cadeia / Resíduos):</span>
                  <strong style={{ color: '#64748b' }}>{formatNum(calculos.emissaoEscopo3, 2)} tCO₂e</strong>
                </div>

                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>PEGADA TOTAL DE CARBONO (MENSAL)</div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#cbd5e1' }}>
                    {formatNum(calculos.pegadaTotalMensal, 2)} <span style={{ fontSize: '16px' }}>tCO₂e</span>
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Orçamento Mensal para o "Net Zero"</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a' }}>
                    {formatMoeda(calculos.custoNeutralizacaoMensal)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#15803d', display: 'block', marginTop: '4px' }}>Impacto projetado na DRE para neutralizar a operação do mês.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: DASHBOARD ESG
            ======================================================== */}
        {abaAtiva === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>📊 Relatório Executivo ESG (Projeção Anual)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '24px' }}>Este relatório atende às normas do IFRS (ISSB) para divulgação climática corporativa, apresentando aos investidores a exposição da empresa ao risco de carbono.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Projeção Anual de Emissões</span>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#e2e8f0', margin: '10px 0' }}>
                  {formatNum(calculos.pegadaTotalAnual, 2)} <span style={{ fontSize: '18px' }}>tCO₂e</span>
                </div>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Toneladas equivalentes de gás carbônico lançadas na atmosfera por ano.</span>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '12px', borderLeft: '6px solid #16a34a', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Passivo Climático Anualizado (Risco)</span>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#15803d', margin: '10px 0' }}>
                  {formatMoeda(calculos.custoNeutralizacaoAnual)}
                </div>
                <span style={{ fontSize: '12px', color: '#14532d' }}>Custo anual projetado para a empresa adquirir certificados verdes (CBIOs) e se manter competitiva para fundos ESG.</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Composição da Pegada (Gráfico Analítico)</h3>
              
              <div style={{ display: 'flex', height: '30px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: `${(calculos.emissaoEscopo1 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#ef4444' }}></div>
                <div style={{ width: `${(calculos.emissaoEscopo2 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#f59e0b' }}></div>
                <div style={{ width: `${(calculos.emissaoEscopo3 / calculos.pegadaTotalMensal) * 100}%`, backgroundColor: '#64748b' }}></div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo1 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 1 (Diretas)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo2 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 2 (Energia)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', backgroundColor: '#64748b', borderRadius: '50%' }}></span> <strong style={{ color: '#0f172a' }}>{formatNum((calculos.emissaoEscopo3 / calculos.pegadaTotalMensal) * 100, 1)}%</strong> Escopo 3 (Cadeia)</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO E METODOLOGIA
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>🧠 Como o Inventário é Calculado? (GHG Protocol)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', color: '#059669', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🏭</span> Os 3 Escopos do Carbono</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  A metodologia global classifica as emissões em 3 níveis:<br/><br/>
                  • <strong>Escopo 1:</strong> A fumaça que sai da sua chaminé ou do escapamento da sua frota (Emissões Diretas).<br/>
                  • <strong>Escopo 2:</strong> A poluição gerada pelas hidrelétricas/termoelétricas para produzir a energia que sua empresa comprou.<br/>
                  • <strong>Escopo 3:</strong> Emissões dos seus fornecedores, das viagens de avião da equipe e do lixo (Cadeia de Valor).
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#166534', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🌳</span> O que é um Crédito de Carbono?</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#15803d', lineHeight: '1.6' }}>
                  É um certificado eletrônico provando que <strong>1 tonelada de CO₂</strong> deixou de ser emitida (ex: proteção da Amazônia) ou foi capturada da atmosfera (ex: plantio de árvores).<br/><br/>
                  Quando a sua empresa polui {formatNum(calculos.pegadaTotalMensal, 0)} toneladas, ela compra e "aposenta" {formatNum(calculos.pegadaTotalMensal, 0)} créditos verdes no mercado. A conta matemática zera. Isso é ser uma empresa "Net Zero" ou Carbono Neutro.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO (NEUTRALIZAÇÃO)
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>🌳 Contabilidade Ambiental (Neutralização)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              A diretoria aprovou a compra de créditos verdes para zerar a pegada de <strong>{formatNum(calculos.pegadaTotalMensal, 2)} tCO₂e</strong> deste mês. A empresa vai desembolsar <strong>{formatMoeda(calculos.custoNeutralizacaoMensal)}</strong>. Veja o impacto contábil.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px' }}>
                Lançamento Contábil (Aquisição para Baixa Imediata)
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
                      <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>DRE</span>
                      <strong>5.2.04.05 - Despesas com Sustentabilidade e ESG</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.custoNeutralizacaoMensal)}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 0', paddingLeft: '20px' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>ATIVO</span>
                      <strong>1.1.01.02 - Banco Conta Movimento (Pagamento)</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.custoNeutralizacaoMensal)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '20px', borderTop: '2px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>Impacto da Operação:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '15px' }}>Reduz o Caixa no Ativo e reduz o Lucro Operacional na DRE.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #16a34a', maxWidth: '600px' }}>
                <strong style={{ fontSize: '14px', color: '#166534', display: 'block', marginBottom: '8px' }}>Nota de Controladoria (Compliance Verde)</strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
                  Empresas que não neutralizam carbono correm o risco de perder financiamentos bancários (linhas de crédito ESG) e contratos B2B globais. A despesa de {formatMoeda(calculos.custoNeutralizacaoMensal)} é o prêmio de seguro para manter a empresa competitiva no século 21.
                </p>
              </div>

              <button 
                onClick={handleContabilizarNeutralizacao}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#10b981', 
                  color: jaContabilizado ? 'white' : '#022c22', border: 'none', padding: '16px 24px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '15px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {jaContabilizado ? '✓ Empresa Net Zero Declarada' : '🌳 Comprar Créditos e Efetivar no Diário'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}