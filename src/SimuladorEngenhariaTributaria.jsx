import React, { useState, useMemo } from 'react';

export default function SimuladorEngenhariaTributaria({ mostrarToast, registrarFatoGerador }) {
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
    atividade: 'servico', 
    rbt12: 1500000.00, 
    receitaProjetada: 2000000.00, 
    folhaAnual: 400000.00, 
    comprasInsumos: 250000.00, 
    despesasOperacionais: 300000.00, 
    despesasIndedutiveis: 50000.00, 
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

    const limiteIsencaoAdicionalIRPJ = 240000; 

    // 1. SIMPLES NACIONAL (Fator R)
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

    // 2. O NOVO IVA DUAL (CBS + IBS)
    const aliquotaCBS = 0.088; 
    const aliquotaIBS = 0.177; 
    const aliquotaIVA = aliquotaCBS + aliquotaIBS; 
    
    const debitoIVA = p.receita * aliquotaIVA;
    const baseCreditoIVA = p.insumos + p.op; 
    const creditoIVA = baseCreditoIVA * aliquotaIVA;
    const ivaDualEfetivo = Math.max(0, debitoIVA - creditoIVA);

    // 3. LUCRO PRESUMIDO
    const presuncaoIRPJ = p.atividade === 'comercio' ? 0.08 : 0.32;
    const presuncaoCSLL = p.atividade === 'comercio' ? 0.12 : 0.32;

    const baseIRPJPresumido = p.receita * presuncaoIRPJ;
    const baseCSLLPresumido = p.receita * presuncaoCSLL;

    const irpjNormalPres = baseIRPJPresumido * 0.15;
    const irpjAdicionalPres = Math.max(0, baseIRPJPresumido - limiteIsencaoAdicionalIRPJ) * 0.10;
    const csllPresumido = baseCSLLPresumido * 0.09;
    
    const impostoPresumidoTotal = irpjNormalPres + irpjAdicionalPres + csllPresumido + ivaDualEfetivo;

    // 4. LUCRO REAL (e-LALUR)
    const lucroContabil = p.receita - p.folha - p.insumos - p.op - p.indedutiveis;
    const baseLalur = Math.max(0, lucroContabil + p.indedutiveis);

    const irpjNormalReal = baseLalur * 0.15;
    const irpjAdicionalReal = Math.max(0, baseLalur - limiteIsencaoAdicionalIRPJ) * 0.10;
    const csllReal = baseLalur * 0.09;

    const impostoRealTotal = irpjNormalReal + irpjAdicionalReal + csllReal + ivaDualEfetivo;

    // DIAGNÓSTICO FINAL
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

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #eab308', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#eab308', color: '#422006', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>REFORMA TRIBUTÁRIA</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Simulador IVA Dual, LALUR e Fator R</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#cbd5e1', wordBreak: 'break-word' }}>Avalie o impacto da CBS/IBS não-cumulativa e as adições fiscais.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('setup')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'setup' ? '#eab308' : 'transparent', color: abaAtiva === 'setup' ? '#422006' : '#cbd5e1' }}>⚙️ Setup</button>
          <button onClick={() => setAbaAtiva('simples')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'simples' ? '#eab308' : 'transparent', color: abaAtiva === 'simples' ? '#422006' : '#cbd5e1' }}>📊 Simples</button>
          <button onClick={() => setAbaAtiva('presumido')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'presumido' ? '#eab308' : 'transparent', color: abaAtiva === 'presumido' ? '#422006' : '#cbd5e1' }}>🔵 Presumido</button>
          <button onClick={() => setAbaAtiva('real')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'real' ? '#eab308' : 'transparent', color: abaAtiva === 'real' ? '#422006' : '#cbd5e1' }}>🔴 Real</button>
          <button onClick={() => setAbaAtiva('dashboard')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'dashboard' ? '#22c55e' : 'transparent', color: abaAtiva === 'dashboard' ? 'white' : '#cbd5e1' }}>🏆 Veredito</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: SETUP DA EMPRESA
            ======================================================== */}
        {abaAtiva === 'setup' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>Receitas e Atividade</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Atividade Principal:</label>
                  <select style={{...inputStyle, backgroundColor: '#fef9c3', borderColor: '#fde047', fontWeight: 'bold'}} value={params.atividade} onChange={e => setParams({...params, atividade: e.target.value})}>
                    <option value="servico">Prestação de Serviços (Anexos III / V)</option>
                    <option value="comercio">Comércio (Anexo I)</option>
                  </select>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>RBT12 (Faturamento últimos 12 meses):</label>
                  <input type="number" style={inputStyle} value={params.rbt12} onChange={e => setParams({...params, rbt12: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={{...labelStyle, color: '#166534'}}>Receita Anual Projetada:</label>
                  <input type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={params.receitaProjetada} onChange={e => setParams({...params, receitaProjetada: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>Estrutura de Custos (Créditos IVA)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{...labelStyle, color: '#991b1b'}}>Folha de Pagamento Anual:</label>
                  <input type="number" style={inputStyle} value={params.folhaAnual} onChange={e => setParams({...params, folhaAnual: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Compras de Insumos/Mercadorias:</label>
                  <input type="number" style={inputStyle} value={params.comprasInsumos} onChange={e => setParams({...params, comprasInsumos: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Despesas Operacionais Comuns:</label>
                  <input type="number" style={inputStyle} value={params.despesasOperacionais} onChange={e => setParams({...params, despesasOperacionais: e.target.value})} />
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', boxSizing: 'border-box', minWidth: 0 }}>
                  <label style={{...labelStyle, color: '#991b1b'}}>Despesas Indedutíveis (Multas):</label>
                  <input type="number" style={{...inputStyle, borderColor: '#fca5a5', backgroundColor: 'white'}} value={params.despesasIndedutiveis} onChange={e => setParams({...params, despesasIndedutiveis: e.target.value})} />
                  <span style={{ fontSize: '10.5px', color: '#991b1b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Adicionadas no e-LALUR, aumentando o IRPJ.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: SIMPLES NACIONAL E FATOR R
            ======================================================== */}
        {abaAtiva === 'simples' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📊 Auditoria do Simples Nacional</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase', wordBreak: 'break-word' }}>Fator R (Folha / Receita)</h4>
                <div style={{ fontSize: '30px', fontWeight: '900', color: calculos.fatorR >= 28 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>
                  {formatPct(calculos.fatorR)}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', wordBreak: 'break-word' }}>
                  {params.atividade === 'comercio' 
                    ? 'Comércio não está sujeito ao Fator R.' 
                    : (calculos.usaAnexoIII ? '✓ Anexo III (Mais vantajoso).' : '⚠️ < 28%: Caiu no Anexo V (Imposto alto).')}
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', textTransform: 'uppercase', wordBreak: 'break-word' }}>Alíquota Efetiva</h4>
                <div style={{ fontSize: '30px', fontWeight: '900', color: '#eab308', wordBreak: 'break-word' }}>
                  {formatPct(calculos.aliquotaEfetivaSimples * 100)}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', wordBreak: 'break-word' }}>
                  Baseada no faturamento histórico (RBT12).
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', wordBreak: 'break-word' }}>Imposto Total Anual (DAS)</span>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#facc15', margin: '8px 0', wordBreak: 'break-word' }}>
                {formatMoeda(calculos.impostoSimples)}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: LUCRO PRESUMIDO
            ======================================================== */}
        {abaAtiva === 'presumido' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🔵 Apuração do Lucro Presumido (Com IVA Dual)</h2>

            <div style={cardStyle}>
              {/* O NOVO IVA DUAL */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#475569', textTransform: 'uppercase', wordBreak: 'break-word' }}>IVA Dual: CBS + IBS (26,5%)</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#dc2626', wordBreak: 'break-word' }}>Débito (26,5% s/ Receita):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.debitoIVA)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#16a34a', wordBreak: 'break-word' }}>(-) Crédito (Compras/Despesas):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.creditoIVA)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 'bold', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>IVA Dual Efetivo a Pagar:</span>
                  <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.ivaDualEfetivo)}</span>
                </div>
              </div>

              {/* IRPJ E CSLL */}
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', marginBottom: '16px', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#1e40af', textTransform: 'uppercase', wordBreak: 'border-box' }}>IRPJ e CSLL (Por Presunção)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>Base Presumida IRPJ:</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.baseIRPJPresumido)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>IRPJ Normal (15%):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.irpjNormalPres)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>CSLL (9%):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.csllPresumido)}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '18px', borderRadius: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '11px', color: '#bfdbfe', textTransform: 'uppercase', wordBreak: 'break-word' }}>Carga Tributária Anual - Presumido</span>
                <div style={{ fontSize: '30px', fontWeight: '900', color: 'white', marginTop: '4px', wordBreak: 'break-word' }}>
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
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🔴 Apuração do Lucro Real e e-LALUR</h2>

            <div style={cardStyle}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #cbd5e1', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 'bold', wordBreak: 'break-word' }}>IVA Dual Efetivo a Pagar:</span>
                <span style={{ fontSize: '15px', fontWeight: '900', wordBreak: 'break-word' }}>{formatMoeda(calculos.ivaDualEfetivo)}</span>
              </div>

              {/* LALUR */}
              <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', marginBottom: '16px', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#991b1b', textTransform: 'uppercase', wordBreak: 'break-word' }}>Livro de Apuração (e-LALUR)</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>Lucro Contábil:</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.lucroContabil)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ color: '#dc2626', wordBreak: 'break-word' }}>(+) ADIÇÃO (Despesas Indedutíveis):</span>
                  <strong style={{ wordBreak: 'break-word' }}>+ {formatMoeda(params.despesasIndedutiveis)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', fontWeight: 'bold', borderTop: '1px dashed #fecaca', paddingTop: '8px', marginTop: '8px', color: '#991b1b', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ wordBreak: 'break-word' }}>Lucro Real Ajustado:</span>
                  <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.baseLalur)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#991b1b', color: 'white', padding: '18px', borderRadius: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '11px', color: '#fecaca', textTransform: 'uppercase', wordBreak: 'break-word' }}>Carga Tributária Anual - Lucro Real</span>
                <div style={{ fontSize: '30px', fontWeight: '900', color: 'white', marginTop: '4px', wordBreak: 'break-word' }}>
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
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', color: '#0f172a', textAlign: 'center', wordBreak: 'break-word' }}>🏆 Veredito Pós-Reforma Tributária</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', textAlign: 'center', marginBottom: '24px', boxSizing: 'border-box' }}>
              
              <div style={{ backgroundColor: calculos.vencedor === 'Simples Nacional' ? '#f0fdf4' : 'white', padding: '16px', borderRadius: '16px', border: calculos.vencedor === 'Simples Nacional' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Simples Nacional' ? 1 : 0.6, boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#ca8a04', marginBottom: '8px', textTransform: 'uppercase', wordBreak: 'break-word' }}>Simples Nacional</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.impostoSimples)}</div>
              </div>

              <div style={{ backgroundColor: calculos.vencedor === 'Lucro Presumido' ? '#f0fdf4' : 'white', padding: '16px', borderRadius: '16px', border: calculos.vencedor === 'Lucro Presumido' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Lucro Presumido' ? 1 : 0.6, boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#1d4ed8', marginBottom: '8px', textTransform: 'uppercase', wordBreak: 'break-word' }}>Lucro Presumido</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.impostoPresumidoTotal)}</div>
              </div>

              <div style={{ backgroundColor: calculos.vencedor === 'Lucro Real' ? '#f0fdf4' : 'white', padding: '16px', borderRadius: '16px', border: calculos.vencedor === 'Lucro Real' ? '3px solid #22c55e' : '1px solid #cbd5e1', opacity: calculos.vencedor === 'Lucro Real' ? 1 : 0.6, boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#b91c1c', marginBottom: '8px', textTransform: 'uppercase', wordBreak: 'break-word' }}>Lucro Real</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.impostoRealTotal)}</div>
              </div>

            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4ade80', wordBreak: 'break-word' }}>Parecer Estratégico (Controller)</h3>
              <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: 0, wordBreak: 'break-word' }}>
                Na nova realidade do <strong>IVA Dual</strong>, o peso dos impostos sobre o consumo (CBS e IBS) equilibra o jogo entre Presumido e Real, já que ambos aproveitam 100% de crédito das compras. 
                <br/><br/>
                O regime campeão foi o <strong>{calculos.vencedor}</strong> (R$ {formatMoeda(calculos.menorImposto)}). Essa vitória foi decidida pela margem de lucro líquido na DRE versus a margem presumida pelo Governo.
              </p>
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