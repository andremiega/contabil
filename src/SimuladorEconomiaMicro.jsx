import React, { useState, useMemo } from 'react';

export default function SimuladorEconomiaMicro({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 0) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estados Microeconômicos
  const [paramsDemanda, setParamsDemanda] = useState({
    precoAtual: 100.00,
    precoNovo: 110.00, 
    custoUnitario: 40.00,
    volumeBase: 5000, 
    elasticidade: -1.5 
  });

  const [paramsCiclo, setParamsCiclo] = useState({
    faseCiclo: 'recessao', 
    contasAReceber: 850000.00, 
  });

  const [paramsFirma, setParamsFirma] = useState({
    demandaEstimada: 6000, 
    precoTerceirizado: 85.00, 
    custoVariavelInterno: 35.00, 
    custoFixoMaquinario: 250000.00 
  });

  const [abaAtiva, setAbaAtiva] = useState('demanda');
  const [contabilizado, setContabilizado] = useState({ demanda: false, pecld: false, firma: false });

  // ==========================================
  // MOTOR DE CÁLCULO MICROECONÔMICO
  // ==========================================
  
  // 1. Elasticidade-Preço da Demanda
  const calcDemanda = useMemo(() => {
    const variacaoPrecoPct = (paramsDemanda.precoNovo - paramsDemanda.precoAtual) / paramsDemanda.precoAtual;
    const variacaoVolumePct = variacaoPrecoPct * paramsDemanda.elasticidade; 
    
    const novoVolume = Math.max(0, paramsDemanda.volumeBase * (1 + variacaoVolumePct));
    
    const receitaAtual = paramsDemanda.precoAtual * paramsDemanda.volumeBase;
    const lucroBrutoAtual = receitaAtual - (paramsDemanda.custoUnitario * paramsDemanda.volumeBase);

    const receitaNova = paramsDemanda.precoNovo * novoVolume;
    const custoNovoTotal = paramsDemanda.custoUnitario * novoVolume;
    const lucroBrutoNovo = receitaNova - custoNovoTotal;

    const valeApena = lucroBrutoNovo > lucroBrutoAtual;

    return { 
      variacaoPrecoPct: variacaoPrecoPct * 100, 
      variacaoVolumePct: variacaoVolumePct * 100, 
      novoVolume, receitaAtual, lucroBrutoAtual, receitaNova, custoNovoTotal, lucroBrutoNovo, valeApena 
    };
  }, [paramsDemanda]);

  // 2. Ciclos Econômicos e Risco de Crédito (PECLD)
  const calcCiclo = useMemo(() => {
    let taxaInadimplencia = 0.02; 
    if (paramsCiclo.faseCiclo === 'estagflacao') taxaInadimplencia = 0.07; 
    if (paramsCiclo.faseCiclo === 'recessao') taxaInadimplencia = 0.12; 

    const provisaoPECLD = paramsCiclo.contasAReceber * taxaInadimplencia;
    const recebiveisLiquidos = paramsCiclo.contasAReceber - provisaoPECLD;

    return { taxaInadimplencia: taxaInadimplencia * 100, provisaoPECLD, recebiveisLiquidos };
  }, [paramsCiclo]);

  // 3. Teoria da Firma (Make or Buy)
  const calcFirma = useMemo(() => {
    const custoComprar = paramsFirma.demandaEstimada * paramsFirma.precoTerceirizado;
    const custoProduzir = paramsFirma.custoFixoMaquinario + (paramsFirma.demandaEstimada * paramsFirma.custoVariavelInterno);
    
    const pontoIndiferenca = paramsFirma.custoFixoMaquinario / (paramsFirma.precoTerceirizado - paramsFirma.custoVariavelInterno);

    const decisao = custoComprar < custoProduzir ? 'Comprar Terceirizado' : 'Produzir Internamente';
    const economia = Math.abs(custoComprar - custoProduzir);

    return { custoComprar, custoProduzir, pontoIndiferenca, decisao, economia };
  }, [paramsFirma]);

  // ==========================================
  // DISPAROS PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarVenda = () => {
    if (contabilizado.demanda) return mostrarToast('Venda já contabilizada.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    registrarFatoGerador(`Faturamento Otimizado (Preço R$ ${formatNum(paramsDemanda.precoNovo, 2)} | ${formatNum(calcDemanda.novoVolume)} un)`, calcDemanda.receitaNova, 'Mercado/Vendas', ['1.1.02.01'], ['4.1.01.01']);
    registrarFatoGerador(`Baixa de Estoque (CMV)`, calcDemanda.custoNovoTotal, 'Mercado/Custos', ['5.1.01.01'], ['1.1.03.01']);
    
    setContabilizado(p => ({ ...p, demanda: true }));
    mostrarToast('Receita e CMV registrados no Diário com o novo volume elástico!', 'sucesso');
  };

  const handleContabilizarPECLD = () => {
    if (contabilizado.pecld) return mostrarToast('Provisão já registrada.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    registrarFatoGerador(
      `Provisão p/ Devedores Duvidosos (PECLD) - Risco de ${calcCiclo.taxaInadimplencia}%`,
      calcCiclo.provisaoPECLD,
      'Mercado/Risco',
      ['5.2.04.01'], 
      ['1.1.02.02']  
    );
    setContabilizado(p => ({ ...p, pecld: true }));
    mostrarToast('Risco blindado. A despesa de calote foi antecipada na DRE!', 'sucesso');
  };

  const handleContabilizarMakeBuy = () => {
    if (contabilizado.firma) return mostrarToast('Operação já registrada.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    if (calcFirma.decisao === 'Produzir Internamente') {
      registrarFatoGerador(
        `Aquisição de Maquinário (Estratégia Make or Buy)`,
        paramsFirma.custoFixoMaquinario,
        'Mercado/Operações',
        ['1.2.03.01'], 
        ['1.1.01.02']  
      );
      mostrarToast('Máquina comprada e Ativada! A empresa optou por Produzir.', 'sucesso');
    } else {
      registrarFatoGerador(
        `Compra de Lote Terceirizado (Estratégia Make or Buy)`,
        calcFirma.custoComprar,
        'Mercado/Operações',
        ['1.1.03.01'], 
        ['2.1.01.01']  
      );
      mostrarToast('Mercadoria adquirida do fornecedor. A empresa optou por Comprar.', 'sucesso');
    }
    setContabilizado(p => ({ ...p, firma: true }));
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #0284c7', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#0284c7', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>MICROECONOMIA</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Dinâmica de Mercado & Teoria da Firma</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Simule elasticidade de preços, proteja-se contra a recessão e decida entre fabricar ou terceirizar.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('demanda')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'demanda' ? '#0284c7' : 'transparent', color: abaAtiva === 'demanda' ? 'white' : '#cbd5e1' }}>📊 Elasticidade</button>
          <button onClick={() => setAbaAtiva('ciclos')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'ciclos' ? '#0284c7' : 'transparent', color: abaAtiva === 'ciclos' ? 'white' : '#cbd5e1' }}>📉 Ciclos & PECLD</button>
          <button onClick={() => setAbaAtiva('firma')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'firma' ? '#0284c7' : 'transparent', color: abaAtiva === 'firma' ? 'white' : '#cbd5e1' }}>🏭 Make or Buy</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: ELASTICIDADE DA DEMANDA E PRECIFICAÇÃO
            ======================================================== */}
        {abaAtiva === 'demanda' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>⚖️ Lei da Oferta e Demanda</h3>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>Se você aumentar o preço, o volume de vendas cai. Mas será que a margem de lucro compensa a queda no volume?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dPrecoAtual" style={labelStyle}>Preço Atual (R$):</label>
                    <input id="dPrecoAtual" type="number" style={inputStyle} value={paramsDemanda.precoAtual} onChange={e => {setParamsDemanda({...paramsDemanda, precoAtual: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dPrecoNovo" style={{...labelStyle, color: '#0284c7'}}>Novo Preço (R$):</label>
                    <input id="dPrecoNovo" type="number" style={{...inputStyle, borderColor: '#7dd3fc', backgroundColor: '#f0f9ff'}} value={paramsDemanda.precoNovo} onChange={e => {setParamsDemanda({...paramsDemanda, precoNovo: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dCusto" style={labelStyle}>Custo Unit. Variável (R$):</label>
                    <input id="dCusto" type="number" style={inputStyle} value={paramsDemanda.custoUnitario} onChange={e => {setParamsDemanda({...paramsDemanda, custoUnitario: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dVolume" style={labelStyle}>Volume Atual (Un.):</label>
                    <input id="dVolume" type="number" style={inputStyle} value={paramsDemanda.volumeBase} onChange={e => {setParamsDemanda({...paramsDemanda, volumeBase: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="dElasticidade" style={{...labelStyle, color: '#991b1b'}}>Elasticidade-Preço da Demanda:</label>
                  <select id="dElasticidade" style={{...inputStyle, borderColor: '#fca5a5', backgroundColor: 'white'}} value={paramsDemanda.elasticidade} onChange={e => {setParamsDemanda({...paramsDemanda, elasticidade: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}}>
                    <option value="-0.5">Inelástica (-0.5) - Remédios, Energia</option>
                    <option value="-1.0">Unitária (-1.0) - Proporcional</option>
                    <option value="-1.5">Elástica (-1.5) - Roupas, Eletrônicos</option>
                    <option value="-2.5">Super Elástica (-2.5) - Supérfluos</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Mede o quanto o consumidor reage à mudança de preço.</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>📈 Impacto no Resultado (DRE)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span>Variação de Preço Sugerida:</span>
                <strong style={{ color: calcDemanda.variacaoPrecoPct >= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatNum(calcDemanda.variacaoPrecoPct, 1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
                <span>Queda/Aumento no Volume de Vendas:</span>
                <strong style={{ color: calcDemanda.variacaoVolumePct >= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatNum(calcDemanda.variacaoVolumePct, 1)}% ({formatNum(calcDemanda.novoVolume)} un)</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', textAlign: 'center', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Lucro Bruto Atual</span>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word', marginTop: '4px' }}>{formatMoeda(calcDemanda.lucroBrutoAtual)}</div>
                </div>
                <div style={{ backgroundColor: calcDemanda.valeApena ? '#f0fdf4' : '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${calcDemanda.valeApena ? '#bbf7d0' : '#fecaca'}`, boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: calcDemanda.valeApena ? '#166534' : '#991b1b', textTransform: 'uppercase', display: 'block' }}>Lucro Bruto Novo</span>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: calcDemanda.valeApena ? '#16a34a' : '#dc2626', wordBreak: 'break-word', marginTop: '4px' }}>{formatMoeda(calcDemanda.lucroBrutoNovo)}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '14px', borderRadius: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '12.5px' }}>Recomendação Microeconômica:</span>
                <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: calcDemanda.valeApena ? '#4ade80' : '#f87171', wordBreak: 'break-word' }}>
                  {calcDemanda.valeApena ? '✅ Aprovar Aumento' : '❌ Rejeitar (Perde Dinheiro)'}
                </span>
              </div>

              <button 
                onClick={handleContabilizarVenda}
                disabled={contabilizado.demanda}
                style={{ width: '100%', backgroundColor: contabilizado.demanda ? '#166534' : '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.demanda ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
              >
                {contabilizado.demanda ? '✓ Venda Projetada Lançada' : 'Contabilizar Receita e CMV (Novo Preço)'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: CICLOS ECONÔMICOS E PECLD
            ======================================================== */}
        {abaAtiva === 'ciclos' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📉 Ciclos Econômicos e Inadimplência</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Na fase de Recessão, o desemprego sobe e os clientes deixam de pagar. A contabilidade antecipa essa perda financeira reduzindo o Contas a Receber através da <strong>Provisão para Créditos de Liquidação Duvidosa (PECLD)</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ marginBottom: '16px', minWidth: 0 }}>
                  <label htmlFor="cFase" style={labelStyle}>Selecione o Clima Econômico (Ciclo de Mercado):</label>
                  <select id="cFase" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold', color: '#1e40af'}} value={paramsCiclo.faseCiclo} onChange={e => {setParamsCiclo({...paramsCiclo, faseCiclo: e.target.value}); setContabilizado(p=>({...p, pecld:false}));}}>
                    <option value="expansao">🟢 Expansão (PIB Crescente) - Risco 2%</option>
                    <option value="estagflacao">🟡 Estagflação (Estagnado + Inflação) - Risco 7%</option>
                    <option value="recessao">🔴 Recessão (Crise, Demissões) - Risco 12%</option>
                  </select>
                </div>
                
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cReceber" style={labelStyle}>Total de Contas a Receber (Balanço Ativo):</label>
                  <input id="cReceber" type="number" style={inputStyle} value={paramsCiclo.contasAReceber} onChange={e => {setParamsCiclo({...paramsCiclo, contasAReceber: e.target.value}); setContabilizado(p=>({...p, pecld:false}));}} />
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>Impacto Patrimonial (Auditoria)</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Clientes (Valor Bruto):</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(paramsCiclo.contasAReceber)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#f87171', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span>(-) PECLD (Risco {calcCiclo.taxaInadimplencia}%):</span>
                    <strong style={{ wordBreak: 'break-word' }}>- {formatMoeda(calcCiclo.provisaoPECLD)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#4ade80', fontWeight: 'bold', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Recebíveis Líquidos Reais:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calcCiclo.recebiveisLiquidos)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleContabilizarPECLD}
                  disabled={contabilizado.pecld}
                  style={{ width: '100%', backgroundColor: contabilizado.pecld ? '#166534' : '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.pecld ? 'not-allowed' : 'pointer', marginTop: '16px', boxSizing: 'border-box' }}
                >
                  {contabilizado.pecld ? '✓ Provisão de Risco Registrada' : 'Reconhecer Despesa de Calote na DRE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: TEORIA DA FIRMA (MAKE OR BUY)
            ======================================================== */}
        {abaAtiva === 'firma' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🏭 Teoria da Firma (Produzir vs Terceirizar)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Na Microeconomia, o <strong>Custo de Oportunidade</strong> dita que comprar uma máquina só compensa se o volume de produção diluir o custo fixo o suficiente para bater o preço do fornecedor.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="fDemanda" style={labelStyle}>Demanda Mensal Estimada (Unidades):</label>
                    <input id="fDemanda" type="number" style={inputStyle} value={paramsFirma.demandaEstimada} onChange={e => {setParamsFirma({...paramsFirma, demandaEstimada: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a', boxSizing: 'border-box', minWidth: 0 }}>
                      <label htmlFor="fTerceiro" style={{...labelStyle, color: '#b45309'}}>Preço Comprado Pronto (R$):</label>
                      <input id="fTerceiro" type="number" style={inputStyle} value={paramsFirma.precoTerceirizado} onChange={e => {setParamsFirma({...paramsFirma, precoTerceirizado: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                    </div>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', boxSizing: 'border-box', minWidth: 0 }}>
                      <label htmlFor="fVariavel" style={{...labelStyle, color: '#166534'}}>Custo Unit. Fabricado (R$):</label>
                      <input id="fVariavel" type="number" style={inputStyle} value={paramsFirma.custoVariavelInterno} onChange={e => {setParamsFirma({...paramsFirma, custoVariavelInterno: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="fFixo" style={{...labelStyle, color: '#1e40af'}}>Investimento Fixo p/ Fabricar (Capex):</label>
                    <input id="fFixo" type="number" style={{...inputStyle, borderColor: '#93c5fd', backgroundColor: '#eff6ff'}} value={paramsFirma.custoFixoMaquinario} onChange={e => {setParamsFirma({...paramsFirma, custoFixoMaquinario: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Análise de Fronteira Eficiente</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Custo Total se Comprar Tudo (OPEX):</span>
                  <strong style={{ color: calcFirma.decisao === 'Comprar Terceirizado' ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(calcFirma.custoComprar)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Custo Total se Fabricar (CAPEX + Var.):</span>
                  <strong style={{ color: calcFirma.decisao === 'Produzir Internamente' ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(calcFirma.custoProduzir)}</strong>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Ponto de Indiferença (Break-Even de Escala)</span>
                  <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word', marginTop: '4px' }}>{formatNum(calcFirma.pontoIndiferenca)} Unidades</div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-word' }}>A partir desse volume, vale a pena comprar a máquina.</span>
                </div>

                <button 
                  onClick={handleContabilizarMakeBuy}
                  disabled={contabilizado.firma}
                  style={{ width: '100%', backgroundColor: contabilizado.firma ? '#166534' : '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.firma ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
                >
                  {contabilizado.firma ? '✓ Decisão Executada' : `Decisão: ${calcFirma.decisao} no Diário`}
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