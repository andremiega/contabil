import React, { useState, useMemo } from 'react';

export default function SimuladorEngenhariaTributaria({ mostrarToast, registrarFatoGerador }) {
  // Funções de formatação blindadas contra valores vazios (NaN) que causavam a tela branca
  const formatMoeda = (v) => {
    const val = Number(v) || 0;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  const formatPct = (v) => {
    const val = Number(v) || 0;
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  // Parâmetros Anuais para o Planejamento
  const [params, setParams] = useState({
    atividade: 'servico', // comercio ou servico
    rbt12: 1500000.00, // Receita Bruta últimos 12 meses
    receitaProjetada: 2000000.00, // Faturamento anual projetado
    folhaAnual: 400000.00, // Folha + Pró-labore (Não gera crédito de IVA)
    comprasInsumos: 250000.00, // Compras (Gera crédito de IVA)
    despesasOperacionais: 300000.00, // Energia, serviços (Gera crédito de IVA)
    despesasIndedutiveis: 50000.00, // Multas, brindes (Adição no LALUR)
  });

  const [abaAtiva, setAbaAtiva] = useState('setup');

  // ==========================================
  // MOTOR DE CÁLCULO TRIBUTÁRIO (REFORMA - IVA DUAL)
  // ==========================================
  const calculos = useMemo(() => {
    const p = {
      atividade: params.atividade,
      rbt12: Number(params.rbt12) || 0,
      receita: Number(params.receitaProjetada) || 0,
      folha: Number(params.folhaAnual) || 0,
      insumos: Number(params.comprasInsumos) || 0,
      op: Number(params.despesasOperacionais) || 0,
      indedutiveis: Number(params.despesasIndedutiveis) || 0,
    };

    const limiteIsencaoAdicionalIRPJ = 240000; // R$ 20.000 x 12 meses

    // -----------------------------------------------------
    // 1. SIMPLES NACIONAL (Fator R)
    // -----------------------------------------------------
    const fatorR = p.receita > 0 ? (p.folha / p.receita) * 100 : 0;
    const usaAnexoIII = p.atividade === 'servico' && fatorR >= 28;
    
    let aliquotaEfetivaSimples = 0;
    if (p.rbt12 <= 180000) {
      aliquotaEfetivaSimples = p.atividade === 'comercio' ? 0.04 : (usaAnexoIII ? 0.06 : 0.155);
    } else if (p.rbt12 <= 1800000) {
      aliquotaEfetivaSimples = p.atividade === 'comercio' ? 0.085 : (usaAnexoIII ? 0.11 : 0.18);
    } else if (p.rbt12 <= 3600000) {
      aliquotaEfetivaSimples = p.atividade === 'comercio' ? 0.105 : (usaAnexoIII ? 0.14 : 0.21);
    } else {
      aliquotaEfetivaSimples = p.atividade === 'comercio' ? 0.14 : (usaAnexoIII ? 0.17 : 0.24);
    }
    const impostoSimples = p.receita * aliquotaEfetivaSimples;

    // -----------------------------------------------------
    // 2. O NOVO IVA DUAL (CBS + IBS) - Comum para Presumido e Real
    // -----------------------------------------------------
    // A reforma extingue PIS/COFINS/ICMS/ISS. O IVA é não-cumulativo pleno.
    const aliquotaCBS = 0.088; // 8,8% Federal
    const aliquotaIBS = 0.177; // 17,7% Estados/Municípios
    const aliquotaIVA = aliquotaCBS + aliquotaIBS; // 26,5%
    
    const debitoIVA = p.receita * aliquotaIVA;
    // Tudo que a empresa compra de outras empresas gera crédito, exceto Folha de Pagamento.
    const baseCreditoIVA = p.insumos + p.op; 
    const creditoIVA = baseCreditoIVA * aliquotaIVA;
    const ivaDualEfetivo = Math.max(0, debitoIVA - creditoIVA);

    // -----------------------------------------------------
    // 3. LUCRO PRESUMIDO (IRPJ/CSLL)
    // -----------------------------------------------------
    const presuncaoIRPJ = p.atividade === 'comercio' ? 0.08 : 0.32;
    const presuncaoCSLL = p.atividade === 'comercio' ? 0.12 : 0.32;

    const baseIRPJPresumido = p.receita * presuncaoIRPJ;
    const baseCSLLPresumido = p.receita * presuncaoCSLL;

    const irpjNormalPres = baseIRPJPresumido * 0.15;
    const irpjAdicionalPres = Math.max(0, baseIRPJPresumido - limiteIsencaoAdicionalIRPJ) * 0.10;
    const csllPresumido = baseCSLLPresumido * 0.09;
    
    const impostoPresumidoTotal = irpjNormalPres + irpjAdicionalPres + csllPresumido + ivaDualEfetivo;

    // -----------------------------------------------------
    // 4. LUCRO REAL (e-LALUR)
    // -----------------------------------------------------
    const lucroContabil = p.receita - p.folha - p.insumos - p.op - p.indedutiveis;
    const baseLalur = Math.max(0, lucroContabil + p.indedutiveis);

    const irpjNormalReal = baseLalur * 0.15;
    const irpjAdicionalReal = Math.max(0, baseLalur - limiteIsencaoAdicionalIRPJ) * 0.10;
    const csllReal = baseLalur * 0.09;

    const impostoRealTotal = irpjNormalReal + irpjAdicionalReal + csllReal + ivaDualEfetivo;

    // -----------------------------------------------------
    // DIAGNÓSTICO FINAL
    // -----------------------------------------------------
    let vencedor = 'Simples Nacional';
    let menorImposto = impostoSimples;

    if (impostoPresumidoTotal < menorImposto) {
      vencedor = 'Lucro Presumido';
      menorImposto = impostoPresumidoTotal;
    }
    if (impostoRealTotal < menorImposto) {
      vencedor = 'Lucro Real';
      menorImposto = impostoRealTotal;
    }

    return {
      fatorR, usaAnexoIII, aliquotaEfetivaSimples, impostoSimples,
      debitoIVA, creditoIVA, ivaDualEfetivo,
      baseIRPJPresumido, irpjNormalPres, irpjAdicionalPres, csllPresumido, impostoPresumidoTotal,
      lucroContabil, baseLalur, irpjNormalReal, irpjAdicionalReal, csllReal, impostoRealTotal,
      vencedor, menorImposto
    };
  }, [params]);

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #eab308' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#eab308', color: '#422006', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>REFORMA TRIBUTÁRIA</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Simulador IVA Dual, LALUR e Fator R</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Avalie o impacto da CBS/IBS não-cumulativa e as adições fiscais.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('setup')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'setup' ? '#eab308' : 'transparent', color: abaAtiva === 'setup' ? '#422006' : '#cbd5e1' }}>⚙️ Setup (Balanço)</button>
          <button onClick={() => setAbaAtiva('simples')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'simples' ? '#eab308' : 'transparent', color: abaAtiva === 'simples' ? '#422006' : '#cbd5e1' }}>📊 Simples (Fator R)</button>
          <button onClick={() => setAbaAtiva('presumido')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'presumido' ? '#eab308' : 'transparent', color: abaAtiva === 'presumido' ? '#422006' : '#cbd5e1' }}>🔵 L. Presumido</button>
          <button onClick={() => setAbaAtiva('real')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'real' ? '#eab308' : 'transparent', color: abaAtiva === 'real' ? '#422006' : '#cbd5e1' }}>🔴 L. Real (LALUR)</button>
          <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#22c55e' : 'transparent', color: abaAtiva === 'dashboard' ? 'white' : '#cbd5e1' }}>🏆 Relatório Final</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: SETUP DA EMPRESA
            ======================================================== */}
        {abaAtiva === 'setup' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>1. Receitas e Atividade</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Atividade Principal:</label>
                  <select style={{...inputStyle, backgroundColor: '#fef9c3', borderColor: '#fde047', fontWeight: 'bold'}} value={params.atividade} onChange={e => setParams({...params, atividade: e.target.value})}>
                    <option value="servico">Prestação de Serviços (Anexos III / IV / V)</option>
                    <option value="comercio">Comércio (Anexo I)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>RBT12 (Faturamento dos últimos 12 meses):</label>
                  <input type="number" style={inputStyle} value={params.rbt12} onChange={e => setParams({...params, rbt12: e.target.value})} />
                </div>
                <div>
                  <label style={{...labelStyle, color: '#166534'}}>Receita Anual Projetada para o Ano Atual:</label>
                  <input type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={params.receitaProjetada} onChange={e => setParams({...params, receitaProjetada: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>2. Estrutura de Custos (Base de Créditos IVA)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{...labelStyle, color: '#991b1b'}}>Folha de Pagamento Anual (Não gera crédito de IVA):</label>
                  <input type="number" style={inputStyle} value={params.folhaAnual} onChange={e => setParams({...params, folhaAnual: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Compras de Insumos/Mercadorias (Gera crédito CBS/IBS):</label>
                  <input type="number" style={inputStyle} value={params.comprasInsumos} onChange={e => setParams({...params, comprasInsumos: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Despesas Operacionais Comuns (Gera crédito CBS/IBS):</label>
                  <input type="number" style={inputStyle} value={params.despesasOperacionais} onChange={e => setParams({...params, despesasOperacionais: e.target.value})} />
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <label style={{...labelStyle, color: '#991b1b'}}>Despesas Indedutíveis (Multas, Brindes):</label>
                  <input type="number" style={{...inputStyle, borderColor: '#fca5a5'}} value={params.despesasIndedutiveis} onChange={e => setParams({...params, despesasIndedutiveis: e.target.value})} />
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', display: 'block' }}>*Serão ADICIONADAS no e-LALUR, aumentando o IRPJ.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: SIMPLES NACIONAL E FATOR R
            ======================================================== */}
        {abaAtiva === 'simples' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>📊 Auditoria do Simples Nacional</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', textTransform: 'uppercase' }}>Fator R (Folha / Receita)</h4>
                <div style={{ fontSize: '32px', fontWeight: '900', color: calculos.fatorR >= 28 ? '#16a34a' : '#dc2626' }}>
                  {formatPct(calculos.fatorR)}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                  {params.atividade === 'comercio' 
                    ? 'Comércio não está sujeito ao Fator R (Anexo I).' 
                    : (calculos.usaAnexoIII ? '✓ ≥ 28%: Empresa tributada no Anexo III (Mais barato).' : '⚠️ < 28%: Empresa caiu no Anexo V (Imposto alto).')}
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', textTransform: 'uppercase' }}>Alíquota Efetiva</h4>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#eab308' }}>
                  {formatPct(calculos.aliquotaEfetivaSimples * 100)}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                  Baseada no faturamento histórico (RBT12).
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>Imposto Total Anual (DAS)</span>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#facc15', margin: '10px 0' }}>
                {formatMoeda(calculos.impostoSimples)}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: LUCRO PRESUMIDO
            ======================================================== */}
        {abaAtiva === 'presumido' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>🔵 Apuração do Lucro Presumido (Com IVA Dual)</h2>

            <div style={cardStyle}>
              {/* O NOVO IVA DUAL (COMUM PARA PRESUMIDO E REAL) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>IVA Dual: CBS (Federal) + IBS (Regional) - 26,5%</h4>
                <p style={{fontSize: '12px', color: '#64748b', marginBottom: '10px', marginTop: 0}}>Na nova reforma, o PIS/COFINS e ICMS/ISS acabaram. O Presumido agora tem direito a crédito integral das compras.</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#dc2626' }}>Débito (26,5% s/ Receita):</span>
                  <strong>{formatMoeda(calculos.debitoIVA)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#16a34a' }}>(-) Crédito (26,5% s/ Compras e Despesas):</span>
                  <strong>- {formatMoeda(calculos.creditoIVA)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px' }}>
                  <span>IVA Dual Efetivo a Pagar:</span>
                  <span>{formatMoeda(calculos.ivaDualEfetivo)}</span>
                </div>
              </div>

              {/* IRPJ E CSLL (A ÚNICA DIFERENÇA AGORA) */}
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e40af', textTransform: 'uppercase' }}>IRPJ e CSLL (Por Presunção)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Base Presumida de IRPJ ({params.atividade === 'comercio' ? '8%' : '32%'}):</span>
                  <strong>{formatMoeda(calculos.baseIRPJPresumido)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '12px', marginBottom: '6px' }}>
                  <span>IRPJ Normal (15% s/ Base):</span>
                  <strong>{formatMoeda(calculos.irpjNormalPres)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: calculos.irpjAdicionalPres > 0 ? '#dc2626' : '#64748b', marginBottom: '6px' }}>
                  <span>Adicional de IRPJ (10% s/ excesso):</span>
                  <strong>{formatMoeda(calculos.irpjAdicionalPres)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>CSLL (9% s/ Base de 12% ou 32%):</span>
                  <strong>{formatMoeda(calculos.csllPresumido)}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#bfdbfe', textTransform: 'uppercase' }}>Carga Tributária Anual - Presumido</span>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginTop: '5px' }}>
                  {formatMoeda(calculos.impostoPresumidoTotal)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: LUCRO REAL E LALUR
            ======================================================== */}
        {abaAtiva === 'real' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>🔴 Apuração do Lucro Real e e-LALUR</h2>

            <div style={cardStyle}>
              {/* O NOVO IVA DUAL (IDÊNTICO AO PRESUMIDO) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>IVA Dual Efetivo a Pagar (Idêntico ao Presumido):</span>
                <span style={{ fontSize: '16px', fontWeight: '900' }}>{formatMoeda(calculos.ivaDualEfetivo)}</span>
              </div>

              {/* LALUR */}
              <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#991b1b', textTransform: 'uppercase' }}>O Livro de Apuração (e-LALUR)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Lucro Contábil (Receitas - Despesas):</span>
                  <strong>{formatMoeda(calculos.lucroContabil)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#dc2626' }}>(+) ADIÇÃO: Despesas Indedutíveis (Multas, etc):</span>
                  <strong>+ {formatMoeda(params.despesasIndedutiveis)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', borderTop: '1px dashed #fecaca', paddingTop: '8px', marginTop: '8px', color: '#991b1b' }}>
                  <span>Lucro Real Ajustado (Base do IRPJ/CSLL):</span>
                  <span>{formatMoeda(calculos.baseLalur)}</span>
                </div>
              </div>

              {/* IRPJ / CSLL (SOBRE O LUCRO REAL) */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>IRPJ (15%) + CSLL (9%) sobre o Lucro Real:</span>
                  <strong>{formatMoeda(calculos.irpjNormalReal + calculos.csllReal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: calculos.irpjAdicionalReal > 0 ? '#dc2626' : '#64748b' }}>
                  <span>Adicional de IRPJ (10% excedente a R$ 240k):</span>
                  <strong>{formatMoeda(calculos.irpjAdicionalReal)}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#991b1b', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#fecaca', textTransform: 'uppercase' }}>Carga Tributária Anual - Lucro Real</span>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginTop: '5px' }}>
                  {formatMoeda(calculos.impostoRealTotal)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 5: DASHBOARD FINAL
            ======================================================== */}
        {abaAtiva === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#0f172a', textAlign: 'center' }}>🏆 Veredito Pós-Reforma Tributária</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center', marginBottom: '30px' }}>
              
              <div style={{ backgroundColor: calculos.vencedor === 'Simples Nacional' ? '#f0fdf4' : 'white', padding: '20px', borderRadius: '12px', border: calculos.vencedor === 'Simples Nacional' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Simples Nacional' ? 1 : 0.6 }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#ca8a04', marginBottom: '10px', textTransform: 'uppercase' }}>Simples Nacional</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{formatMoeda(calculos.impostoSimples)}</div>
              </div>

              <div style={{ backgroundColor: calculos.vencedor === 'Lucro Presumido' ? '#f0fdf4' : 'white', padding: '20px', borderRadius: '12px', border: calculos.vencedor === 'Lucro Presumido' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Lucro Presumido' ? 1 : 0.6 }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#1d4ed8', marginBottom: '10px', textTransform: 'uppercase' }}>Lucro Presumido</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{formatMoeda(calculos.impostoPresumidoTotal)}</div>
              </div>

              <div style={{ backgroundColor: calculos.vencedor === 'Lucro Real' ? '#f0fdf4' : 'white', padding: '20px', borderRadius: '12px', border: calculos.vencedor === 'Lucro Real' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Lucro Real' ? 1 : 0.6 }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#b91c1c', marginBottom: '10px', textTransform: 'uppercase' }}>Lucro Real</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{formatMoeda(calculos.impostoRealTotal)}</div>
              </div>

            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#4ade80' }}>Parecer Estratégico (Controller)</h3>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                Na nova realidade do <strong>IVA Dual</strong>, o peso dos impostos sobre o consumo (CBS e IBS) empatou o jogo entre o Presumido e o Real, já que ambos aproveitam 100% de crédito das compras. 
                <br/><br/>
                O regime campeão foi o <strong>{calculos.vencedor}</strong> (R$ {formatMoeda(calculos.menorImposto)}). Essa vitória foi decidida puramente pela margem de lucro líquido apurada na DRE versus a margem presumida pelo Governo no IRPJ/CSLL.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}