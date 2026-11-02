import React, { useState, useMemo } from 'react';

export default function SimuladorConsultoriaContabil({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estados do Simulador Consultivo
  const [paramsBPO, setParamsBPO] = useState({ ativoCirculante: 150000, passivoCirculante: 180000, custosFixos: 30000, receitaMensal: 80000 });
  
  const [paramsTrib, setParamsTrib] = useState({ receitaAnual: 1200000, folhaAnual: 200000, comprasECustos: 400000, tipo: 'servico' });
  
  const [paramsPreco, setParamsPreco] = useState({ custoProduto: 50.00, impostosEComissaoPct: 20, margemDesejadaPct: 30 });
  
  const [honorarios, setHonorarios] = useState(5000.00);
  const [abaAtiva, setAbaAtiva] = useState('bpo');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // LÓGICAS DE CÁLCULO CONSULTIVO
  // ==========================================
  
  // 1. Diagnóstico BPO (Liquidez e Ponto de Equilíbrio)
  const calcBPO = useMemo(() => {
    const liquidezCorrente = paramsBPO.passivoCirculante > 0 ? (paramsBPO.ativoCirculante / paramsBPO.passivoCirculante) : 0;
    const capitalGiroLiq = paramsBPO.ativoCirculante - paramsBPO.passivoCirculante;
    const margemContribuicaoEstimada = 0.40; 
    const pontoEquilibrio = paramsBPO.custosFixos / margemContribuicaoEstimada;

    return { liquidezCorrente, capitalGiroLiq, pontoEquilibrio };
  }, [paramsBPO]);

  // 2. Planejamento Tributário (Simples x Presumido x Real)
  const calcTrib = useMemo(() => {
    const r = paramsTrib.receitaAnual;
    const folha = paramsTrib.folhaAnual;
    const custos = paramsTrib.comprasECustos;
    
    const fatorR = r > 0 ? (folha / r) * 100 : 0;
    const usaAnexoIII = fatorR >= 28;

    let aliquotaSimples = 0;
    if (paramsTrib.tipo === 'comercio') aliquotaSimples = 0.08;
    else aliquotaSimples = usaAnexoIII ? 0.10 : 0.15;
    
    const impostoSimples = r * aliquotaSimples;

    const presuncao = paramsTrib.tipo === 'comercio' ? 0.08 : 0.32;
    const basePresumida = r * presuncao;
    const irpjCsllPresumido = basePresumida * 0.24; 
    const pisCofinsIssIcms = r * (0.0365 + 0.10); 
    const impostoPresumido = irpjCsllPresumido + pisCofinsIssIcms;

    const lucroReal = Math.max(0, r - folha - custos);
    const irpjCsllReal = lucroReal * 0.24;
    const pisCofinsReal = Math.max(0, (r - custos) * 0.0925);
    const impostoReal = irpjCsllReal + pisCofinsReal;

    const recomendacao = impostoSimples < impostoPresumido && impostoSimples < impostoReal ? 'Simples Nacional' :
                         impostoPresumido < impostoSimples && impostoPresumido < impostoReal ? 'Lucro Presumido' : 'Lucro Real';

    return { fatorR, usaAnexoIII, impostoSimples, impostoPresumido, impostoReal, recomendacao };
  }, [paramsTrib]);

  // 3. Precificação (Markup x Margem de Contribuição)
  const calcPreco = useMemo(() => {
    const custo = paramsPreco.custoProduto;
    const taxas = (paramsPreco.impostosEComissaoPct + paramsPreco.margemDesejadaPct) / 100;
    
    const precoSugerido = taxas < 1 ? (custo / (1 - taxas)) : 0;
    const precoAmador = custo + (custo * (paramsPreco.impostosEComissaoPct / 100)) + (custo * (paramsPreco.margemDesejadaPct / 100));

    return { precoSugerido, precoAmador };
  }, [paramsPreco]);

  // ==========================================
  // INTEGRAÇÃO COM O LIVRO DIÁRIO
  // ==========================================
  const emitirNotaConsultoria = () => {
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('Nota Fiscal de Consultoria já foi emitida!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      registrarFatoGerador(
        `Pagamento de Honorários: Consultoria Estratégica & Tributária`,
        honorarios,
        'Consultoria/Estratégia',
        ['5.2.03.05'], 
        ['1.1.01.02']  
      );

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Honorários recebidos! Despesa reconhecida no Diário do cliente.', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  // Estilos Padronizados e Responsivos
  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };
  const boxGuiaStyle = { backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#1e40af', fontSize: '13.5px', lineHeight: '1.6', boxSizing: 'border-box', wordBreak: 'break-word' };

  return (
    <div translate="no" className="notranslate" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #8b5cf6', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CONSULTORIA CONTÁBIL</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>BPO Analítico & Planejamento Tributário</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Avalie a saúde da empresa, otimize os impostos e ensine o cliente a precificar.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('bpo')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'bpo' ? '#8b5cf6' : 'transparent', color: abaAtiva === 'bpo' ? 'white' : '#cbd5e1' }}>🏥 1. Saúde</button>
          <button onClick={() => setAbaAtiva('tributario')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'tributario' ? '#8b5cf6' : 'transparent', color: abaAtiva === 'tributario' ? 'white' : '#cbd5e1' }}>⚖️ 2. Tributário</button>
          <button onClick={() => setAbaAtiva('pricing')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'pricing' ? '#8b5cf6' : 'transparent', color: abaAtiva === 'pricing' ? 'white' : '#cbd5e1' }}>🏷️ 3. Pricing</button>
          <button onClick={() => setAbaAtiva('relatorio')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'relatorio' ? '#8b5cf6' : 'transparent', color: abaAtiva === 'relatorio' ? 'white' : '#cbd5e1' }}>📈 4. Relatório</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: DIAGNÓSTICO (SAÚDE FINANCEIRA)
            ======================================================== */}
        {abaAtiva === 'bpo' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>Diagnóstico de Saúde Financeira (BPO)</h3>
            <div style={boxGuiaStyle}>
              <strong>O Papel do Consultor:</strong> O cliente não quer ver DRE. Ele quer saber: <em>"Eu tenho dinheiro para pagar as contas do mês que vem?"</em>. Extraia os dados básicos do Balanço e faça o diagnóstico de Liquidez.
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="bpoAC" style={labelStyle}>Ativo Circulante (Caixa + Receber):</label>
                    <input id="bpoAC" type="number" style={inputStyle} value={paramsBPO.ativoCirculante} onChange={e => setParamsBPO({...paramsBPO, ativoCirculante: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="bpoPC" style={labelStyle}>Passivo Circulante (Dívidas de Curto Prazo):</label>
                    <input id="bpoPC" type="number" style={inputStyle} value={paramsBPO.passivoCirculante} onChange={e => setParamsBPO({...paramsBPO, passivoCirculante: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="bpoFixos" style={labelStyle}>Custos Fixos Mensais (Aluguel, Folha, Lixo):</label>
                    <input id="bpoFixos" type="number" style={inputStyle} value={paramsBPO.custosFixos} onChange={e => setParamsBPO({...paramsBPO, custosFixos: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Diagnóstico de Liquidez e Risco</h4>
                
                <div style={{ marginBottom: '16px', wordBreak: 'break-word' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Índice de Liquidez Corrente:</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: calcBPO.liquidezCorrente >= 1 ? '#16a34a' : '#dc2626' }}>
                    {formatNum(calcBPO.liquidezCorrente, 2)}
                  </div>
                  <span style={{ fontSize: '12px', color: calcBPO.liquidezCorrente >= 1 ? '#15803d' : '#991b1b', wordBreak: 'break-word' }}>
                    {calcBPO.liquidezCorrente >= 1 ? 'Bom. Para cada R$ 1,00 de dívida, há recursos suficientes para pagar.' : 'Perigo! Faltam recursos de curto prazo para honrar as dívidas do mês.'}
                  </span>
                </div>

                <div style={{ marginBottom: '16px', wordBreak: 'break-word' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Capital de Giro Líquido:</span>
                  <div style={{ fontSize: '19px', fontWeight: 'bold', color: calcBPO.capitalGiroLiq >= 0 ? '#1e40af' : '#b91c1c', wordBreak: 'break-word' }}>
                    {formatMoeda(calcBPO.capitalGiroLiq)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #64748b', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <span style={{ fontSize: '12px', color: '#475569', display: 'block' }}>Ponto de Equilíbrio Operacional (Meta Mínima de Vendas):</span>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{formatMoeda(calcBPO.pontoEquilibrio)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: PLANEJAMENTO TRIBUTÁRIO
            ================================================        */}
        {abaAtiva === 'tributario' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>2. Planejamento Tributário (Economia Legal)</h3>
            <div style={{ ...boxGuiaStyle, backgroundColor: '#fdf4ff', borderLeftColor: '#c026d3', color: '#86198f' }}>
              <strong>O Papel do Consultor:</strong> Muitos clientes acham que o "Simples Nacional" é sempre a melhor opção. Nem sempre! Insira os dados abaixo para simular a carga tributária anual nos 3 regimes vigentes.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '24px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Atividade Principal:</label>
                <select style={{ ...inputStyle, backgroundColor: 'white' }} value={paramsTrib.tipo} onChange={e => setParamsTrib({...paramsTrib, tipo: e.target.value})}>
                  <option value="servico">Prestação de Serviços (Clínicas, TI, etc)</option>
                  <option value="comercio">Comércio Varejista / Atacadista</option>
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Faturamento Anual (R$):</label>
                <input type="number" style={inputStyle} value={paramsTrib.receitaAnual} onChange={e => setParamsTrib({...paramsTrib, receitaAnual: e.target.value})} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Folha de Salários Anual (R$):</label>
                <input type="number" style={inputStyle} value={paramsTrib.folhaAnual} onChange={e => setParamsTrib({...paramsTrib, folhaAnual: e.target.value})} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Custos Operacionais Anuais (R$):</label>
                <input type="number" style={inputStyle} value={paramsTrib.comprasECustos} onChange={e => setParamsTrib({...paramsTrib, comprasECustos: e.target.value})} />
              </div>
            </div>

            {/* TABELA DE COMPARAÇÃO */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', textAlign: 'center', wordBreak: 'break-word' }}>Comparativo de Carga Tributária Anual</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
                
                <div style={{ backgroundColor: calcTrib.recomendacao === 'Simples Nacional' ? '#f0fdf4' : '#f8fafc', padding: '16px', borderRadius: '12px', border: calcTrib.recomendacao === 'Simples Nacional' ? '2px solid #22c55e' : '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#166534', marginBottom: '10px' }}>SIMPLES NACIONAL</div>
                  <div style={{ fontSize: '21px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calcTrib.impostoSimples)}</div>
                  {paramsTrib.tipo === 'servico' && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', wordBreak: 'break-word' }}>
                      Fator R: <strong>{formatNum(calcTrib.fatorR, 1)}%</strong> <br/>
                      {calcTrib.usaAnexoIII ? '(Anexo III - Mais Barato)' : '(Anexo V - Carga elevada, ajuste o pró-labore)'}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: calcTrib.recomendacao === 'Lucro Presumido' ? '#f0fdf4' : '#f8fafc', padding: '16px', borderRadius: '12px', border: calcTrib.recomendacao === 'Lucro Presumido' ? '2px solid #22c55e' : '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#1d4ed8', marginBottom: '10px' }}>LUCRO PRESUMIDO</div>
                  <div style={{ fontSize: '21px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calcTrib.impostoPresumido)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', wordBreak: 'break-word' }}>
                    Alíquota presuntiva + Encargos s/ Folha patronal pesam aqui.
                  </div>
                </div>

                <div style={{ backgroundColor: calcTrib.recomendacao === 'Lucro Real' ? '#f0fdf4' : '#f8fafc', padding: '16px', borderRadius: '12px', border: calcTrib.recomendacao === 'Lucro Real' ? '2px solid #22c55e' : '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#b91c1c', marginBottom: '10px' }}>LUCRO REAL</div>
                  <div style={{ fontSize: '21px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calcTrib.impostoReal)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', wordBreak: 'break-word' }}>
                    Ideal se a margem de lucro líquida for estreita e houver muitos custos dedutíveis.
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px', backgroundColor: '#0f172a', color: 'white', borderRadius: '10px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <span style={{ fontSize: '11.5px', color: '#94a3b8', textTransform: 'uppercase' }}>O Veredito do Consultor Tributário:</span>
                <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#4ade80', marginTop: '4px' }}>Migrar para o regime do {calcTrib.recomendacao}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: ENGENHARIA DE PRECIFICAÇÃO
            ======================================================== */}
        {abaAtiva === 'pricing' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>3. Engenharia de Precificação (Markup x Margem)</h3>
            <div style={{ ...boxGuiaStyle, backgroundColor: '#fef2f2', borderLeftColor: '#ef4444', color: '#991b1b' }}>
              <strong>O Erro Clássico do Empresário:</strong> O cliente compra algo por R$ 50, quer ganhar 30% de lucro, então ele faz "R$ 50 + 30% = R$ 65". <strong>ISSO ESTÁ ERRADO!</strong> Os impostos e comissões são cobrados sobre o preço final da venda, não sobre o custo. Ensine a ele a matemática correta (Cálculo por Dentro / Markup Divisor).
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Custo de Aquisição do Produto/Serviço (R$):</label>
                    <input type="number" style={inputStyle} value={paramsPreco.custoProduto} onChange={e => setParamsPreco({...paramsPreco, custoProduto: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Impostos (ICMS/PIS/COFINS) + Comissão (%):</label>
                    <input type="number" style={inputStyle} value={paramsPreco.impostosEComissaoPct} onChange={e => setParamsPreco({...paramsPreco, impostosEComissaoPct: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={{...labelStyle, color: '#16a34a'}}>Margem de Lucro Desejada (% LÍQUIDO):</label>
                    <input type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={paramsPreco.margemDesejadaPct} onChange={e => setParamsPreco({...paramsPreco, margemDesejadaPct: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Impacto Financeiro</h4>
                
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '6px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <span style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>Preço Errado (Feito pelo Cliente):</span>
                  <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#dc2626', textDecoration: 'line-through', wordBreak: 'break-word' }}>
                    {formatMoeda(calcPreco.precoAmador)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#7f1d1d' }}>Se ele vender por isso, quando tirar os impostos e comissões, a margem de lucro será destruída.</span>
                </div>

                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', borderRadius: '6px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <span style={{ fontSize: '12px', color: '#166534', display: 'block' }}>Preço Científico (Calculado pelo Contador):</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#15803d', wordBreak: 'break-word' }}>
                    {formatMoeda(calcPreco.precoSugerido)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#14532d' }}>Fórmula: Custo ÷ [ 100% - (Impostos + Margem) ]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: RELATÓRIO EXECUTIVO
            ======================================================== */}
        {abaAtiva === 'relatorio' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#e2e8f0', padding: '14px 18px', borderRadius: '12px', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', wordBreak: 'break-word' }}>4. Relatório Executivo e Faturamento</h3>
                <span style={{ fontSize: '11.5px', color: '#475569' }}>Pronto para apresentação em reunião gerencial.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Honorários R$:</span>
                  <input type="number" style={{ width: '70px', border: 'none', outline: 'none', fontWeight: 'bold', color: '#16a34a', fontSize: '13px' }} value={honorarios} onChange={e => setHonorarios(e.target.value)} />
                </div>
                <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  🖨️ PDF
                </button>
              </div>
            </div>

            {/* DOCUMENTO DO RELATÓRIO (FORMATO A4 VIRTUAL) */}
            <div className="print-only-content" style={{ backgroundColor: 'white', padding: 'clamp(20px, 5vw, 50px)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #cbd5e1', color: '#000', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
              
              <div style={{ borderBottom: '3px solid #0f172a', paddingBottom: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontSize: 'clamp(20px, 3vw, 24px)', margin: '0 0 5px 0', textTransform: 'uppercase', color: '#0f172a', wordBreak: 'break-word' }}>Relatório de Consultoria Estratégica</h1>
                  <h2 style={{ fontSize: '13.5px', margin: 0, fontWeight: 'normal', color: '#475569', wordBreak: 'break-word' }}>Diagnóstico, Planejamento Tributário e Pricing</h2>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b' }}>
                  Data: {new Date().toLocaleDateString('pt-BR')}<br/>
                  Consultor: Contábil Cloud ERP
                </div>
              </div>

              {/* Seção 1: BPO */}
              <h3 style={{ fontSize: '15px', color: '#1e40af', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '14px', wordBreak: 'break-word' }}>I. Parecer sobre Saúde Financeira</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '25px', boxSizing: 'border-box' }}>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: calcBPO.liquidezCorrente >= 1 ? '4px solid #16a34a' : '4px solid #dc2626', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Índice de Liquidez Corrente</span>
                  <div style={{ fontSize: '19px', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatNum(calcBPO.liquidezCorrente, 2)}</div>
                  <div style={{ fontSize: '11.5px', marginTop: '6px', wordBreak: 'break-word' }}>{calcBPO.liquidezCorrente >= 1 ? 'Empresa Saudável no Curto Prazo.' : 'Risco de Insolvência Imediato!'}</div>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Ponto de Equilíbrio Necessário</span>
                  <div style={{ fontSize: '19px', fontWeight: 'bold', wordBreak: 'break-word' }}>{formatMoeda(calcBPO.pontoEquilibrio)}</div>
                  <div style={{ fontSize: '11.5px', marginTop: '6px', wordBreak: 'break-word' }}>Faturamento mínimo exigido para cobrir custos fixos.</div>
                </div>
              </div>

              {/* Seção 2: Tributário */}
              <h3 style={{ fontSize: '15px', color: '#1e40af', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '14px', wordBreak: 'break-word' }}>II. Planejamento Tributário Anual</h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', marginBottom: '14px', wordBreak: 'break-word' }}>
                Avaliando o faturamento anual projetado de {formatMoeda(paramsTrib.receitaAnual)} e os custos operacionais informados, simulamos a carga tributária da entidade.
                {paramsTrib.tipo === 'servico' && ` Destaca-se que o Fator R atingiu ${formatNum(calcTrib.fatorR, 1)}%, permitindo a migração para o Anexo mais vantajoso caso opte pelo Simples.`}
              </p>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box', marginBottom: '25px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'center', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Simples Nacional</th>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Lucro Presumido</th>
                      <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Lucro Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: calcTrib.recomendacao === 'Simples Nacional' ? 'bold' : 'normal', color: calcTrib.recomendacao === 'Simples Nacional' ? '#16a34a' : '#333' }}>{formatMoeda(calcTrib.impostoSimples)}</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: calcTrib.recomendacao === 'Lucro Presumido' ? 'bold' : 'normal', color: calcTrib.recomendacao === 'Lucro Presumido' ? '#16a34a' : '#333' }}>{formatMoeda(calcTrib.impostoPresumido)}</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: calcTrib.recomendacao === 'Lucro Real' ? 'bold' : 'normal', color: calcTrib.recomendacao === 'Lucro Real' ? '#16a34a' : '#333' }}>{formatMoeda(calcTrib.impostoReal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '25px', fontWeight: 'bold', color: '#166534', fontSize: '13.5px', wordBreak: 'break-word', boxSizing: 'border-box' }}>
                Recomendação Oficial do Consultor: Adoção do regime de {calcTrib.recomendacao}.
              </div>

              {/* Seção 3: Pricing */}
              <h3 style={{ fontSize: '15px', color: '#1e40af', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '14px', wordBreak: 'break-word' }}>III. Adequação de Precificação (Markup)</h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', marginBottom: '14px', wordBreak: 'break-word' }}>
                Para garantir a margem líquida exigida ({paramsPreco.margemDesejadaPct}%), após o pagamento dos custos e variáveis ({paramsPreco.impostosEComissaoPct}%), o preço de venda deve ser cientificamente formatado via Markup Divisor.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #0f172a', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 'bold' }}>Preço Mínimo de Venda Sugerido:</span>
                <span style={{ fontSize: '17px', fontWeight: '900', color: '#1e40af', wordBreak: 'break-word' }}>{formatMoeda(calcPreco.precoSugerido)}</span>
              </div>

              <div style={{ marginTop: '40px', borderTop: '2px dashed #cbd5e1', paddingTop: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11.5px', color: '#64748b' }}>As informações constantes neste relatório possuem caráter consultivo e estratégico, baseadas nos dados fornecidos pela administração da empresa.</p>
              </div>

            </div>

            {/* BOTÃO DE CONTABILIZAÇÃO */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', boxSizing: 'border-box' }}>
              <button 
                onClick={emitirNotaConsultoria}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#2563eb', 
                  color: 'white', border: 'none', padding: '14px 24px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '14px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s', width: '100%', maxWidth: '380px', boxSizing: 'border-box'
                }}
              >
                {jaContabilizado ? '✓ NF Emitida e Diário Alimentado' : `Emitir NF de Consultoria (R$ ${formatNum(honorarios)})`}
              </button>
            </div>

          </div>
        )}

      </div>
      
      {/* CSS para Impressão */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}