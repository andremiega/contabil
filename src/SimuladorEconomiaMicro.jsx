import React, { useState, useMemo } from 'react';

export default function SimuladorEconomiaMicro({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 0) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estados Microeconômicos
  const [paramsDemanda, setParamsDemanda] = useState({
    precoAtual: 100.00,
    precoNovo: 110.00, // Simulação de aumento de 10%
    custoUnitario: 40.00,
    volumeBase: 5000, // Quantidade vendida atualmente
    elasticidade: -1.5 // Demanda Elástica (sensível a preço)
  });

  const [paramsCiclo, setParamsCiclo] = useState({
    faseCiclo: 'recessao', // expansao, estagflacao, recessao
    contasAReceber: 850000.00, // Total a receber de clientes
  });

  const [paramsFirma, setParamsFirma] = useState({
    demandaEstimada: 6000, // Quantidade que a empresa precisa
    precoTerceirizado: 85.00, // Custo se comprar pronto
    custoVariavelInterno: 35.00, // Custo variável se fabricar
    custoFixoMaquinario: 250000.00 // Custo do Capex para fabricar
  });

  const [abaAtiva, setAbaAtiva] = useState('demanda');
  const [contabilizado, setContabilizado] = useState({ demanda: false, pecld: false, firma: false });

  // ==========================================
  // MOTOR DE CÁLCULO MICROECONÔMICO
  // ==========================================
  
  // 1. Elasticidade-Preço da Demanda
  const calcDemanda = useMemo(() => {
    const variacaoPrecoPct = (paramsDemanda.precoNovo - paramsDemanda.precoAtual) / paramsDemanda.precoAtual;
    const variacaoVolumePct = variacaoPrecoPct * paramsDemanda.elasticidade; // Ex: +10% Preço * -1.5 = -15% Volume
    
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
    let taxaInadimplencia = 0.02; // Expansão (2%)
    if (paramsCiclo.faseCiclo === 'estagflacao') taxaInadimplencia = 0.07; // Estagflação (7%)
    if (paramsCiclo.faseCiclo === 'recessao') taxaInadimplencia = 0.12; // Recessão (12%)

    const provisaoPECLD = paramsCiclo.contasAReceber * taxaInadimplencia;
    const recebiveisLiquidos = paramsCiclo.contasAReceber - provisaoPECLD;

    return { taxaInadimplencia: taxaInadimplencia * 100, provisaoPECLD, recebiveisLiquidos };
  }, [paramsCiclo]);

  // 3. Teoria da Firma (Make or Buy)
  const calcFirma = useMemo(() => {
    const custoComprar = paramsFirma.demandaEstimada * paramsFirma.precoTerceirizado;
    const custoProduzir = paramsFirma.custoFixoMaquinario + (paramsFirma.demandaEstimada * paramsFirma.custoVariavelInterno);
    
    // Ponto de Indiferença: Quantidade onde Custo de Comprar = Custo de Produzir
    // Q * Terceirizado = Custo Fixo + (Q * Custo Variavel)
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

    // Reconhece a Receita e a Baixa do Estoque (CMV)
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
      ['5.2.04.01'], // Débito: Despesa com PECLD (DRE)
      ['1.1.02.02']  // Crédito: PECLD (Conta Redutora do Ativo Circulante - Clientes)
    );
    setContabilizado(p => ({ ...p, pecld: true }));
    mostrarToast('Risco blindado. A despesa de calote foi antecipada na DRE!', 'sucesso');
  };

  const handleContabilizarMakeBuy = () => {
    if (contabilizado.firma) return mostrarToast('Operação já registrada.', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Motor Diário ausente.', 'erro');

    if (calcFirma.decisao === 'Produzir Internamente') {
      // Compra do maquinário (CAPEX)
      registrarFatoGerador(
        `Aquisição de Maquinário (Estratégia Make or Buy)`,
        paramsFirma.custoFixoMaquinario,
        'Mercado/Operações',
        ['1.2.03.01'], // Débito: Máquinas e Equipamentos (Ativo)
        ['1.1.01.02']  // Crédito: Banco Conta Movimento
      );
      mostrarToast('Máquina comprada e Ativada! A empresa optou por Produzir.', 'sucesso');
    } else {
      // Compra de estoque pronto (OPEX)
      registrarFatoGerador(
        `Compra de Lote Terceirizado (Estratégia Make or Buy)`,
        calcFirma.custoComprar,
        'Mercado/Operações',
        ['1.1.03.01'], // Débito: Estoque de Mercadorias (Ativo)
        ['2.1.01.01']  // Crédito: Fornecedores (Passivo)
      );
      mostrarToast('Mercadoria adquirida do fornecedor. A empresa optou por Comprar.', 'sucesso');
    }
    setContabilizado(p => ({ ...p, firma: true }));
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #0284c7' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#0284c7', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>AMBIENTE MICROECONÔMICO</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Dinâmica de Mercado & Teoria da Firma</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Simule elasticidade de preços, proteja-se contra a recessão e decida entre fabricar ou terceirizar.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('demanda')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'demanda' ? '#0284c7' : 'transparent', color: abaAtiva === 'demanda' ? 'white' : '#cbd5e1' }}>📊 Elasticidade Preço</button>
          <button onClick={() => setAbaAtiva('ciclos')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'ciclos' ? '#0284c7' : 'transparent', color: abaAtiva === 'ciclos' ? 'white' : '#cbd5e1' }}>📉 Ciclos & PECLD</button>
          <button onClick={() => setAbaAtiva('firma')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'firma' ? '#0284c7' : 'transparent', color: abaAtiva === 'firma' ? 'white' : '#cbd5e1' }}>🏭 Make or Buy</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: ELASTICIDADE DA DEMANDA E PRECIFICAÇÃO
            ======================================================== */}
        {abaAtiva === 'demanda' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>⚖️ Lei da Oferta e Demanda</h3>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>Se você aumentar o preço, o volume de vendas cai. Mas será que a margem de lucro compensa a queda no volume?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="dPrecoAtual" style={labelStyle}>Preço Atual (R$):</label>
                    <input id="dPrecoAtual" type="number" style={inputStyle} value={paramsDemanda.precoAtual} onChange={e => {setParamsDemanda({...paramsDemanda, precoAtual: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                  <div>
                    <label htmlFor="dPrecoNovo" style={{...labelStyle, color: '#0284c7'}}>Novo Preço (R$):</label>
                    <input id="dPrecoNovo" type="number" style={{...inputStyle, borderColor: '#7dd3fc', backgroundColor: '#f0f9ff'}} value={paramsDemanda.precoNovo} onChange={e => {setParamsDemanda({...paramsDemanda, precoNovo: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="dCusto" style={labelStyle}>Custo Unit. Variável (R$):</label>
                    <input id="dCusto" type="number" style={inputStyle} value={paramsDemanda.custoUnitario} onChange={e => {setParamsDemanda({...paramsDemanda, custoUnitario: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                  <div>
                    <label htmlFor="dVolume" style={labelStyle}>Volume Atual (Un.):</label>
                    <input id="dVolume" type="number" style={inputStyle} value={paramsDemanda.volumeBase} onChange={e => {setParamsDemanda({...paramsDemanda, volumeBase: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <label htmlFor="dElasticidade" style={{...labelStyle, color: '#991b1b'}}>Elasticidade-Preço da Demanda:</label>
                  <select id="dElasticidade" style={{...inputStyle, borderColor: '#fca5a5'}} value={paramsDemanda.elasticidade} onChange={e => {setParamsDemanda({...paramsDemanda, elasticidade: e.target.value}); setContabilizado(p=>({...p, demanda:false}));}}>
                    <option value="-0.5">Inelástica (-0.5) - Remédios, Energia</option>
                    <option value="-1.0">Unitária (-1.0) - Proporcional</option>
                    <option value="-1.5">Elástica (-1.5) - Roupas, Eletrônicos</option>
                    <option value="-2.5">Super Elástica (-2.5) - Supérfluos</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '6px', display: 'block' }}>Mede o quanto o consumidor reage à mudança de preço.</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>📈 Impacto no Resultado (DRE)</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                <span>Variação de Preço Sugerida:</span>
                <strong style={{ color: calcDemanda.variacaoPrecoPct >= 0 ? '#16a34a' : '#dc2626' }}>{formatNum(calcDemanda.variacaoPrecoPct, 1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '20px' }}>
                <span>Queda/Aumento no Volume de Vendas:</span>
                <strong style={{ color: calcDemanda.variacaoVolumePct >= 0 ? '#16a34a' : '#dc2626' }}>{formatNum(calcDemanda.variacaoVolumePct, 1)}% ({formatNum(calcDemanda.novoVolume)} un)</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Lucro Bruto Atual</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>{formatMoeda(calcDemanda.lucroBrutoAtual)}</div>
                </div>
                <div style={{ backgroundColor: calcDemanda.valeApena ? '#f0fdf4' : '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${calcDemanda.valeApena ? '#bbf7d0' : '#fecaca'}` }}>
                  <span style={{ fontSize: '11px', color: calcDemanda.valeApena ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>Lucro Bruto Novo</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: calcDemanda.valeApena ? '#16a34a' : '#dc2626' }}>{formatMoeda(calcDemanda.lucroBrutoNovo)}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>Recomendação Microeconômica:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: calcDemanda.valeApena ? '#4ade80' : '#f87171' }}>
                  {calcDemanda.valeApena ? '✅ Aprovar Aumento' : '❌ Rejeitar (Perde Dinheiro)'}
                </span>
              </div>

              <button 
                onClick={handleContabilizarVenda}
                disabled={contabilizado.demanda}
                style={{ width: '100%', backgroundColor: contabilizado.demanda ? '#166534' : '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.demanda ? 'not-allowed' : 'pointer' }}
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>📉 Ciclos Econômicos e Inadimplência</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Na fase de Recessão, o desemprego sobe e os clientes deixam de pagar. A contabilidade antecipa essa perda financeira reduzindo o Contas a Receber através da <strong>Provisão para Créditos de Liquidação Duvidosa (PECLD)</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="cFase" style={labelStyle}>Selecione o Clima Econômico (Ciclo de Mercado):</label>
                  <select id="cFase" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold', color: '#1e40af'}} value={paramsCiclo.faseCiclo} onChange={e => {setParamsCiclo({...paramsCiclo, faseCiclo: e.target.value}); setContabilizado(p=>({...p, pecld:false}));}}>
                    <option value="expansao">🟢 Expansão (PIB Crescendo, Pleno Emprego) - Risco 2%</option>
                    <option value="estagflacao">🟡 Estagflação (PIB Estagnado + Inflação) - Risco 7%</option>
                    <option value="recessao">🔴 Recessão (Crise, Demissões em Massa) - Risco 12%</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="cReceber" style={labelStyle}>Total de Contas a Receber (Balanço Ativo):</label>
                  <input id="cReceber" type="number" style={inputStyle} value={paramsCiclo.contasAReceber} onChange={e => {setParamsCiclo({...paramsCiclo, contasAReceber: e.target.value}); setContabilizado(p=>({...p, pecld:false}));}} />
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px' }}>Impacto Patrimonial (Auditoria)</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Clientes (Valor Bruto a Receber):</span>
                    <strong>{formatMoeda(paramsCiclo.contasAReceber)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#f87171', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span>(-) PECLD (Risco de Inadimplência {calcCiclo.taxaInadimplencia}%):</span>
                    <strong>- {formatMoeda(calcCiclo.provisaoPECLD)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#4ade80', fontWeight: 'bold' }}>
                    <span>Recebíveis Líquidos Reais:</span>
                    <span>{formatMoeda(calcCiclo.recebiveisLiquidos)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleContabilizarPECLD}
                  disabled={contabilizado.pecld}
                  style={{ backgroundColor: contabilizado.pecld ? '#166534' : '#ef4444', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.pecld ? 'not-allowed' : 'pointer', marginTop: '20px' }}
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>🏭 Teoria da Firma (Produzir vs Terceirizar)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Na Microeconomia, o <strong>Custo de Oportunidade</strong> dita que comprar uma máquina só compensa se o volume de produção diluir o custo fixo o suficiente para bater o preço do fornecedor chinês.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="fDemanda" style={labelStyle}>Demanda Mensal Estimada (Unidades):</label>
                    <input id="fDemanda" type="number" style={inputStyle} value={paramsFirma.demandaEstimada} onChange={e => {setParamsFirma({...paramsFirma, demandaEstimada: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <label htmlFor="fTerceiro" style={{...labelStyle, color: '#b45309'}}>Preço Unit. Comprado Pronto (R$):</label>
                      <input id="fTerceiro" type="number" style={inputStyle} value={paramsFirma.precoTerceirizado} onChange={e => {setParamsFirma({...paramsFirma, precoTerceirizado: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                    </div>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <label htmlFor="fVariavel" style={{...labelStyle, color: '#166534'}}>Custo Unit. Fabricado (R$):</label>
                      <input id="fVariavel" type="number" style={inputStyle} value={paramsFirma.custoVariavelInterno} onChange={e => {setParamsFirma({...paramsFirma, custoVariavelInterno: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fFixo" style={{...labelStyle, color: '#1e40af'}}>Investimento Fixo p/ Fabricar (Capex Máquina):</label>
                    <input id="fFixo" type="number" style={{...inputStyle, borderColor: '#93c5fd', backgroundColor: '#eff6ff'}} value={paramsFirma.custoFixoMaquinario} onChange={e => {setParamsFirma({...paramsFirma, custoFixoMaquinario: e.target.value}); setContabilizado(p=>({...p, firma:false}));}} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Análise de Fronteira Eficiente</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '8px' }}>
                  <span>Custo Total se Comprar Tudo (OPEX):</span>
                  <strong style={{ color: calcFirma.decisao === 'Comprar Terceirizado' ? '#16a34a' : '#dc2626' }}>{formatMoeda(calcFirma.custoComprar)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '16px' }}>
                  <span>Custo Total se Fabricar Tudo (CAPEX + Var.):</span>
                  <strong style={{ color: calcFirma.decisao === 'Produzir Internamente' ? '#16a34a' : '#dc2626' }}>{formatMoeda(calcFirma.custoProduzir)}</strong>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Ponto de Indiferença (Break-Even de Escala)</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{formatNum(calcFirma.pontoIndiferenca)} Unidades</div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>A partir desse volume, vale a pena comprar a máquina.</span>
                </div>

                <button 
                  onClick={handleContabilizarMakeBuy}
                  disabled={contabilizado.firma}
                  style={{ width: '100%', backgroundColor: contabilizado.firma ? '#166534' : '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: contabilizado.firma ? 'not-allowed' : 'pointer' }}
                >
                  {contabilizado.firma ? '✓ Decisão Estratégica Executada' : `Decisão: ${calcFirma.decisao} no Diário`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}