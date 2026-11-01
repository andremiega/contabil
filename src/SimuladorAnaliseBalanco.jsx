import React, { useState, useEffect } from 'react';

export default function SimuladorAnaliseBalanco() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (valor) => `${Number(valor || 0).toFixed(2)}%`;

  // Controle de Abas Internas
  const [abaAtiva, setAbaAtiva] = useState('diagnostico'); // 'diagnostico' ou 'dupont'

  // Inputs em String para não travar o zero no Backspace
  const [ativoCirculanteStr, setAtivoCirculanteStr] = useState('350000.00');
  const [estoquesStr, setEstoquesStr] = useState('120000.00');
  const [realizavelLongoPrazoStr, setRealizavelLongoPrazoStr] = useState('80000.00');
  const [ativoTotalStr, setAtivoTotalStr] = useState('850000.00');

  const [passivoCirculanteStr, setPassivoCirculanteStr] = useState('200000.00');
  const [passivoLongoPrazoStr, setPassivoLongoPrazoStr] = useState('250000.00');
  const [patrimonioLiquidoStr, setPatrimonioLiquidoStr] = useState('400000.00');

  const [receitaBrutaStr, setReceitaBrutaStr] = useState('1200000.00');
  const [lucroLiquidoStr, setLucroLiquidoStr] = useState('180000.00');

  // Indicadores Calculados
  const [indices, setIndices] = useState({
    liquidezCorrente: 0,
    liquidezSeca: 0,
    liquidezGeral: 0,
    endividamentoGeral: 0,
    composicaoEndividamento: 0,
    margemLiquida: 0,
    giroAtivo: 0,
    alavancagemFinanceira: 0,
    roa: 0,
    roe: 0
  });

  useEffect(() => {
    const ac = parseFloat(ativoCirculanteStr) || 0;
    const est = parseFloat(estoquesStr) || 0;
    const rlp = parseFloat(realizavelLongoPrazoStr) || 0;
    const at = parseFloat(ativoTotalStr) || 0;

    const pc = parseFloat(passivoCirculanteStr) || 0;
    const pnc = parseFloat(passivoLongoPrazoStr) || 0;
    const pl = parseFloat(patrimonioLiquidoStr) || 0;

    const rec = parseFloat(receitaBrutaStr) || 0;
    const ll = parseFloat(lucroLiquidoStr) || 0;

    // 1. Liquidez
    const liqCorrente = pc > 0 ? ac / pc : 0;
    const liqSeca = pc > 0 ? (ac - est) / pc : 0;
    const liqGeral = (pc + pnc) > 0 ? (ac + rlp) / (pc + pnc) : 0;

    // 2. Endividamento & Alavancagem
    const totalPassivoOnerosoEOperacional = pc + pnc;
    const endividamentoGeral = pl > 0 ? (totalPassivoOnerosoEOperacional / (pl + totalPassivoOnerosoEOperacional)) * 100 : 0;
    const composEndiv = totalPassivoOnerosoEOperacional > 0 ? (pc / totalPassivoOnerosoEOperacional) * 100 : 0;
    const alavancagemFinanceira = pl > 0 ? at / pl : 0; // Multiplicador de Alavancagem (Ativo Total / PL)

    // 3. Rentabilidade
    const margemLiq = rec > 0 ? (ll / rec) * 100 : 0;
    const giroAtivo = at > 0 ? rec / at : 0;
    const roa = at > 0 ? (ll / at) * 100 : 0;
    const roe = pl > 0 ? (ll / pl) * 100 : 0;

    setIndices({
      liquidezCorrente: liqCorrente,
      liquidezSeca: liqSeca,
      liquidezGeral: liqGeral,
      endividamentoGeral: endividamentoGeral,
      composicaoEndividamento: composEndiv,
      margemLiquida: margemLiq,
      giroAtivo: giroAtivo,
      alavancagemFinanceira: alavancagemFinanceira,
      roa: roa,
      roe: roe
    });

  }, [ativoCirculanteStr, estoquesStr, realizavelLongoPrazoStr, ativoTotalStr, passivoCirculanteStr, passivoLongoPrazoStr, patrimonioLiquidoStr, receitaBrutaStr, lucroLiquidoStr]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📊</span> Análise de Balanços & Indicadores Econômico-Financeiros
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Diagnóstico patrimonial: Índices de Liquidez, Endividamento, Rentabilidade (ROA/ROE) e Decomposição Du Pont.
          </p>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>
          Rentabilidade do Capital Próprio (ROE): <span style={{ color: '#2563eb' }}>{formatPct(indices.roe)}</span>
        </div>
      </div>

      {/* SELETOR DE ABAS INTERNAS */}
      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px', gap: '4px', width: 'fit-content' }}>
        <button
          onClick={() => setAbaAtiva('diagnostico')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: abaAtiva === 'diagnostico' ? '#0f172a' : 'transparent',
            color: abaAtiva === 'diagnostico' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          📋 Diagnóstico Consolidado
        </button>
        <button
          onClick={() => setAbaAtiva('dupont')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: abaAtiva === 'dupont' ? '#2563eb' : 'transparent',
            color: abaAtiva === 'dupont' ? 'white' : '#64748b',
            transition: 'all 0.2s'
          }}
        >
          🔬 Decomposição Du Pont & Alavancagem
        </button>
      </div>

      {/* DASHBOARDS DOS PRINCIPAIS ÍNDICES (SEMPRE VISÍVEIS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Liquidez Corrente</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {indices.liquidezCorrente.toFixed(2)}x
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Capacidade de pagamento de curto prazo</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Endividamento Geral</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {formatPct(indices.endividamentoGeral)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Participação de capitais de terceiros</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Margem Líquida</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {formatPct(indices.margemLiquida)}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Lucro líquido sobre vendas</span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Retorno sobre Ativo (ROA)</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '24px', marginTop: '4px' }}>
            {formatPct(indices.roa)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Eficiência operativa geral</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. ABA: DIAGNÓSTICO CONSOLIDADO (CONTEÚDO ORIGINAL INTACTO) */}
      {/* ========================================================= */}
      {abaAtiva === 'diagnostico' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            
            {/* ENTRADA DE CONTAS PATRIMONIAIS */}
            <div style={{ flex: '1 1 350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                Balanço Patrimonial & DRE Consolidada
              </h3>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Ativo Circulante (R$):
                  <input 
                    type="text" 
                    value={ativoCirculanteStr} 
                    onChange={e => setAtivoCirculanteStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Destes, Estoques (R$):
                  <input 
                    type="text" 
                    value={estoquesStr} 
                    onChange={e => setEstoquesStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Realizável a Longo Prazo:
                  <input 
                    type="text" 
                    value={realizavelLongoPrazoStr} 
                    onChange={e => setRealizavelLongoPrazoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                  Ativo Total (R$):
                  <input 
                    type="text" 
                    value={ativoTotalStr} 
                    onChange={e => setAtivoTotalStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                  Passivo Circulante (R$):
                  <input 
                    type="text" 
                    value={passivoCirculanteStr} 
                    onChange={e => setPassivoCirculanteStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                  Passivo Não Circulante:
                  <input 
                    type="text" 
                    value={passivoLongoPrazoStr} 
                    onChange={e => setPassivoLongoPrazoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
                  Patrimônio Líquido (R$):
                  <input 
                    type="text" 
                    value={patrimonioLiquidoStr} 
                    onChange={e => setPatrimonioLiquidoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
                  Receita Bruta Vendas:
                  <input 
                    type="text" 
                    value={receitaBrutaStr} 
                    onChange={e => setReceitaBrutaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
                Lucro Líquido do Exercício (R$):
                <input 
                  type="text" 
                  value={lucroLiquidoStr} 
                  onChange={e => setLucroLiquidoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontSize: '13px' }} 
                />
              </label>
            </div>

            {/* RELATÓRIO DE DIAGNÓSTICO DOS ÍNDICES */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Relatório Consolidado de Índices</strong>
                  <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                    CONTROLADORIA
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Indicador Financeiro</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Resultado</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Padrão / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Liquidez Corrente</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{indices.liquidezCorrente.toFixed(2)}x</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: indices.liquidezCorrente >= 1 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        {indices.liquidezCorrente >= 1 ? 'Saudável (>= 1.0)' : 'Alerta (< 1.0)'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Liquidez Seca</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{indices.liquidezSeca.toFixed(2)}x</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: indices.liquidezSeca >= 0.8 ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>
                        {indices.liquidezSeca >= 0.8 ? 'Bom' : 'Restrito'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Liquidez Geral</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{indices.liquidezGeral.toFixed(2)}x</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: indices.liquidezGeral >= 1 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        {indices.liquidezGeral >= 1 ? 'Solvente' : 'Insolvente a Longo Prazo'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Endividamento Geral</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{formatPct(indices.endividamentoGeral)}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: indices.endividamentoGeral <= 60 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                        {indices.endividamentoGeral <= 60 ? 'Endividamento Adequado' : 'Alavancagem Elevada'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>Giro do Ativo</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{indices.giroAtivo.toFixed(2)}x</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>Velocidade Operacional</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                      <td style={{ padding: '10px 8px' }}>Retorno sobre o PL (ROE)</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#16a34a' }}>{formatPct(indices.roe)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#16a34a' }}>Rentabilidade Acionista</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '14px', fontSize: '11px', color: '#1e3a8a', lineHeight: '1.4' }}>
                💡 <strong>Análise Du Pont:</strong> O ROE ({formatPct(indices.roe)}) é composto pelo produto da Margem Líquida ({formatPct(indices.margemLiquida)}) pelo Giro do Ativo ({indices.giroAtivo.toFixed(2)}x) e pela Alavancagem Financeira.
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: DECOMPOSIÇÃO DU PONT & ALAVANCAGEM FINANCEIRA    */}
      {/* ========================================================= */}
      {abaAtiva === 'dupont' && (
        <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FÓRMULA MATEMÁTICA VISUAL DU PONT */}
          <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '22px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#38bdf8' }}>
              Decomposição de 3 Estágios (DuPont Model)
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
              
              <div style={{ backgroundColor: '#1e293b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Margem Líquida</span>
                <strong style={{ fontSize: '18px', color: '#10b981' }}>{formatPct(indices.margemLiquida)}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>(Lucro / Receita)</span>
              </div>

              <span style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 'bold' }}>×</span>

              <div style={{ backgroundColor: '#1e293b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Giro do Ativo</span>
                <strong style={{ fontSize: '18px', color: '#38bdf8' }}>{indices.giroAtivo.toFixed(2)}x</strong>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>(Receita / Ativo)</span>
              </div>

              <span style={{ fontSize: '20px', color: '#38bdf8', fontWeight: 'bold' }}>×</span>

              <div style={{ backgroundColor: '#1e293b', padding: '12px 18px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Alavancagem (MAF)</span>
                <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{indices.alavancagemFinanceira.toFixed(2)}x</strong>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>(Ativo / PL)</span>
              </div>

              <span style={{ fontSize: '20px', color: 'white', fontWeight: 'bold' }}>=</span>

              <div style={{ backgroundColor: '#16a34a', padding: '12px 22px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#dcfce7', display: 'block' }}>ROE Final</span>
                <strong style={{ fontSize: '20px', color: 'white' }}>{formatPct(indices.roe)}</strong>
                <span style={{ fontSize: '10px', color: '#dcfce7', display: 'block' }}>(Lucro / PL)</span>
              </div>

            </div>
          </div>

          {/* CARDS COM OS PILARES EXECUTIVOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏷️</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>1. Eficiência Operacional (Margem)</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                A cada R$ 100 faturados, restam <strong>R$ {indices.margemLiquida.toFixed(2)}</strong> líquidos após todos os custos e tributos. Se este indicador cair, o Controller deve focar em precificação ou corte de custos fixos.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>2. Eficiência de Ativos (Giro)</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                O Ativo Total girou <strong>{indices.giroAtivo.toFixed(2)} vezes</strong> em relação à receita. Mostra a velocidade com que os recursos aplicados (máquinas, estoques, caixa) geram vendas.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚖️</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>3. Multiplicador de Alavancagem</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                O Multiplicador de Ativo sobre PL está em <strong>{indices.alavancagemFinanceira.toFixed(2)}x</strong>. Quanto maior, mais a empresa usa capital de terceiros para impulsionar o retorno dos acionistas (com maior risco de solvência).
              </p>
            </div>

          </div>

          {/* DIAGNÓSTICO ESTRATÉGICO PARA DIRETORIA */}
          <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '14px' }}>
              🎯 Parecer de Controladoria sobre o Retorno do Acionista
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: '1.6' }}>
              {indices.roe > indices.roa ? (
                <>
                  <strong>Alavancagem Financeira Favorável:</strong> O ROE ({formatPct(indices.roe)}) é superior ao ROA ({formatPct(indices.roa)}), comprovando que o uso de capitais de terceiros está gerando um efeito multiplicador positivo sobre o capital próprio dos acionistas.
                </>
              ) : (
                <>
                  <strong>Alerta de Retorno:</strong> O ROE está alinhado ou inferior ao ROA, indicando que o custo das dívidas com terceiros pode estar comprimindo o retorno final destinado aos proprietários.
                </>
              )}
            </p>
          </div>

        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}