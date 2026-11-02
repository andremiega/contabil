import React, { useState, useEffect } from 'react';

export default function SimuladorViabilidade() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Aba ativa: 'financeira' (VPL/TIR/Payback) ou 'locacional' (Zoneamento/Redesim/Alvará)
  const [secaoAtiva, setSecaoAtiva] = useState('financeira');

  // ========================================================
  // 1. VIABILIDADE ECONÔMICO-FINANCEIRA (VPL, TIR & PAYBACK)
  // ========================================================
  const [investimentoInicialStr, setInvestimentoInicialStr] = useState('180000.00'); // CAPEX inicial
  const [taxaTmaStr, setTaxaTmaStr] = useState('12.0'); // Taxa Mínima de Atratividade (% a.a.)
  const [horizonteAnosStr, setHorizonteAnosStr] = useState('5'); // 5 anos

  // Fluxos Anuais Projetados (Caixa Líquido Operacional)
  const [fluxosAnuaisStr, setFluxosAnuaisStr] = useState(['50000.00', '65000.00', '75000.00', '80000.00', '90000.00']);

  // Métricas Calculadas
  const [indicadores, setIndicadores] = useState({
    vpl: 0,
    tir: 0,
    paybackSimples: 0,
    paybackDescontado: 0,
    indiceLucratividade: 0,
    statusProjeto: 'viavel',
    tabelaFluxos: []
  });

  // ========================================================
  // 2. VIABILIDADE LOCACIONAL & REDESIM (SOCIETÁRIO / ALVARÁ)
  // ========================================================
  const [nomeEmpresarial, setNomeEmpresarial] = useState('Lopes & Silva Soluções Industriais e Contábeis Ltda');
  const [zoneamentoUrbano, setZoneamentoUrbano] = useState('ZICS'); // 'ZICS', 'ZPR', 'ZI'
  const [cnaePrincipal, setCnaePrincipal] = useState('6920-6/01 - Atividades de Contabilidade');
  const [grauRiscoLiberdade, setGrauRiscoLiberdade] = useState('baixo'); // 'baixo', 'medio', 'alto'
  const [iptuInscricao, setIptuInscricao] = useState('042.891.0024-5');
  const [resultadoLocacional, setResultadoLocacional] = useState({
    nomeAprovado: true,
    usoSoloAprovado: true,
    exigeVistoriaPreviaBombeiros: false,
    dispensaAlvara: true
  });

  const handleAtualizarFluxo = (index, valor) => {
    const novos = [...fluxosAnuaisStr];
    novos[index] = valor.replace(/[^0-9.]/g, '');
    setFluxosAnuaisStr(novos);
  };

  const calcularTIR = (capex, fluxos) => {
    let tirMin = -0.99;
    let tirMax = 5.0; 
    let tirEstimada = 0.1;

    for (let iter = 0; iter < 100; iter++) {
      tirEstimada = (tirMin + tirMax) / 2;
      let vplTeste = -capex;
      for (let t = 0; t < fluxos.length; t++) {
        vplTeste += fluxos[t] / Math.pow(1 + tirEstimada, t + 1);
      }

      if (Math.abs(vplTeste) < 0.01) break;
      if (vplTeste > 0) {
        tirMin = tirEstimada;
      } else {
        tirMax = tirEstimada;
      }
    }
    return tirEstimada * 100;
  };

  useEffect(() => {
    const capex = parseFloat(investimentoInicialStr) || 0;
    const tma = (parseFloat(taxaTmaStr) || 0) / 100;
    const fluxosNumericos = fluxosAnuaisStr.map(f => parseFloat(f) || 0);

    let somaPresente = 0;
    let acumuladoSimples = -capex;
    let acumuladoDescontado = -capex;

    let pbSimplesAnos = 0;
    let pbDescontadoAnos = 0;
    let achouSimples = false;
    let achouDescontado = false;

    const tabela = fluxosNumericos.map((fluxo, idx) => {
      const ano = idx + 1;
      const fatorDesconto = Math.pow(1 + tma, ano);
      const valorPresente = fluxo / fatorDesconto;
      somaPresente += valorPresente;

      const anteriorSimples = acumuladoSimples;
      acumuladoSimples += fluxo;

      const anteriorDescontado = acumuladoDescontado;
      acumuladoDescontado += valorPresente;

      if (!achouSimples && acumuladoSimples >= 0) {
        const fracao = fluxo > 0 ? Math.abs(anteriorSimples) / fluxo : 0;
        pbSimplesAnos = (ano - 1) + fracao;
        achouSimples = true;
      }

      if (!achouDescontado && acumuladoDescontado >= 0) {
        const fracao = valorPresente > 0 ? Math.abs(anteriorDescontado) / valorPresente : 0;
        pbDescontadoAnos = (ano - 1) + fracao;
        achouDescontado = true;
      }

      return {
        ano,
        fluxoNominal: fluxo,
        valorPresente,
        acumuladoSimples,
        acumuladoDescontado
      };
    });

    const vpl = somaPresente - capex;
    const tir = calcularTIR(capex, fluxosNumericos);
    const il = capex > 0 ? somaPresente / capex : 0;

    setIndicadores({
      vpl,
      tir: isNaN(tir) ? 0 : tir,
      paybackSimples: achouSimples ? pbSimplesAnos : 0,
      paybackDescontado: achouDescontado ? pbDescontadoAnos : 0,
      indiceLucratividade: il,
      statusProjeto: vpl >= 0 && tir >= (tma * 100) ? 'viavel' : 'inviavel',
      tabelaFluxos: tabela
    });

  }, [investimentoInicialStr, taxaTmaStr, fluxosAnuaisStr]);

  useEffect(() => {
    const usoOk = zoneamentoUrbano !== 'ZPR'; 
    const vistoria = grauRiscoLiberdade === 'alto';
    const dispensa = grauRiscoLiberdade === 'baixo' && usoOk;

    setResultadoLocacional({
      nomeAprovado: nomeEmpresarial.trim().length > 8,
      usoSoloAprovado: usoOk,
      exigeVistoriaPreviaBombeiros: vistoria,
      dispensaAlvara: dispensa
    });
  }, [zoneamentoUrbano, grauRiscoLiberdade, nomeEmpresarial]);

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🎯</span> Simulador de Viabilidade de Negócios & Projetos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Engenharia Econômica (VPL, TIR, Payback) & Viabilidade Locacional / Zoneamento Redesim.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE VERTENTES */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setSecaoAtiva('financeira')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'financeira' ? '#0f172a' : 'transparent', 
              color: secaoAtiva === 'financeira' ? 'white' : '#64748b'
            }}
          >
            📊 Viabilidade Econômica (VPL/TIR)
          </button>
          <button 
            onClick={() => setSecaoAtiva('locacional')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'locacional' ? '#2563eb' : 'transparent', 
              color: secaoAtiva === 'locacional' ? 'white' : '#64748b'
            }}
          >
            📍 Viabilidade Locacional (Redesim)
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE INDICADORES PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* VPL */}
        <div style={{ backgroundColor: indicadores.vpl >= 0 ? '#f0fdf4' : '#fff5f5', padding: '16px', borderRadius: '16px', border: `1px solid ${indicadores.vpl >= 0 ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${indicadores.vpl >= 0 ? '#16a34a' : '#ef4444'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: indicadores.vpl >= 0 ? '#166534' : '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Valor Presente Líquido (VPL)
          </span>
          <strong style={{ display: 'block', color: indicadores.vpl >= 0 ? '#15803d' : '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(indicadores.vpl)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            {indicadores.vpl >= 0 ? 'Gera riqueza acima da TMA' : 'Destrói valor econômico'}
          </span>
        </div>

        {/* TIR */}
        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Taxa Interna de Retorno (TIR)
          </span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {indicadores.tir.toFixed(2)}% a.a.
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>
            TMA de corte: {parseFloat(taxaTmaStr) || 0}% a.a.
          </span>
        </div>

        {/* Payback Descontado */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#b45309', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Payback Descontado
          </span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {indicadores.paybackDescontado > 0 ? `${indicadores.paybackDescontado.toFixed(1)} anos` : 'Inatingível'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            Simples: {indicadores.paybackSimples.toFixed(1)} anos
          </span>
        </div>

        {/* Veredito do Projeto */}
        <div style={{ backgroundColor: indicadores.statusProjeto === 'viavel' ? '#f0fdf4' : '#fff5f5', padding: '16px', borderRadius: '16px', border: `1px solid ${indicadores.statusProjeto === 'viavel' ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${indicadores.statusProjeto === 'viavel' ? '#16a34a' : '#ef4444'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: indicadores.statusProjeto === 'viavel' ? '#166534' : '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Parecer de Viabilidade
          </span>
          <strong style={{ display: 'block', color: indicadores.statusProjeto === 'viavel' ? '#15803d' : '#dc2626', fontSize: '17px', marginTop: '4px', wordBreak: 'break-word' }}>
            {indicadores.statusProjeto === 'viavel' ? '✅ VIÁVEL' : '❌ REJEITADO'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            IL: {indicadores.indiceLucratividade.toFixed(2)}
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. ABA: VIABILIDADE ECONÔMICO-FINANCEIRA                  */}
      {/* ========================================================= */}
      {secaoAtiva === 'financeira' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            
            {/* Parâmetros do Investimento */}
            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
                Premissas de Investimento e Custo de Capital
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Investimento Inicial (CAPEX - Ano 0):</label>
                  <input type="text" value={investimentoInicialStr} onChange={e => setInvestimentoInicialStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={{ ...labelStyle, color: '#2563eb' }}>TMA (% a.a.):</label>
                    <input type="text" value={taxaTmaStr} onChange={e => setTaxaTmaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Horizonte (Anos):</label>
                    <input type="text" value={horizonteAnosStr} disabled style={{ ...inputStyle, backgroundColor: '#e2e8f0' }} />
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: '1.4', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  📌 <strong>Regra de Decisão do VPL:</strong> Se VPL &gt; 0, o investimento remunera o capital à taxa mínima (TMA) e ainda agrega valor econômico.
                </div>
              </div>
            </div>

            {/* Projeção de Fluxos Anuais */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>
                Fluxos de Caixa Líquidos (Anos 1 a 5)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                {fluxosAnuaisStr.map((fluxo, idx) => (
                  <div key={idx} style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Ano {idx + 1} (R$):</label>
                    <input type="text" value={fluxo} onChange={e => handleAtualizarFluxo(idx, e.target.value)} style={inputStyle} />
                  </div>
                ))}
              </div>

              {/* Tabela de Desconto dos Fluxos */}
              <div style={{ marginTop: '16px', overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Período</th>
                      <th style={{ padding: '8px' }}>Fluxo Nominal</th>
                      <th style={{ padding: '8px' }}>Valor Presente (VP)</th>
                      <th style={{ padding: '8px' }}>Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                      <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ano 0</td>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                    </tr>
                    {indicadores.tabelaFluxos.map(linha => (
                      <tr key={linha.ano} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>Ano {linha.ano}</td>
                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{formatMoeda(linha.fluxoNominal)}</td>
                        <td style={{ padding: '8px', color: '#2563eb', whiteSpace: 'nowrap' }}>{formatMoeda(linha.valorPresente)}</td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: linha.acumuladoDescontado >= 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                          {formatMoeda(linha.acumuladoDescontado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: VIABILIDADE LOCACIONAL & REDESIM                  */}
      {/* ========================================================= */}
      {secaoAtiva === 'locacional' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            
            {/* Parâmetros Locacionais */}
            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
                Dados da Consulta Prévia Locacional
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Nome Empresarial Pretendido:</label>
                  <input type="text" value={nomeEmpresarial} onChange={e => setNomeEmpresarial(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Zoneamento Urbano do Imóvel:</label>
                  <select value={zoneamentoUrbano} onChange={e => setZoneamentoUrbano(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
                    <option value="ZICS">ZICS - Comércio, Serviços e Indústria Não Poluente</option>
                    <option value="ZPR">ZPR - Zona Predominantemente Residencial</option>
                    <option value="ZI">ZI - Zona Estritamente Industrial</option>
                  </select>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Atividade Econômica (CNAE):</label>
                  <input type="text" value={cnaePrincipal} onChange={e => setCnaePrincipal(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Inscrição IPTU:</label>
                    <input type="text" value={iptuInscricao} onChange={e => setIptuInscricao(e.target.value)} style={inputStyle} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Risco Sanitário/Bombeiros:</label>
                    <select value={grauRiscoLiberdade} onChange={e => setGrauRiscoLiberdade(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
                      <option value="baixo">Baixo Risco (Nível 1)</option>
                      <option value="medio">Médio Risco (Nível 2)</option>
                      <option value="alto">Alto Risco (Nível 3 - Vistoria)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Espelho do Certificado de Viabilidade */}
            <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>CERTIFICADO DE VIABILIDADE TÉCNICA</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Redesim / Prefeitura Municipal</span>
                </div>
                <span style={{ backgroundColor: resultadoLocacional.usoSoloAprovado ? '#16a34a' : '#dc2626', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  {resultadoLocacional.usoSoloAprovado ? 'ADEQUADO' : 'INADEQUADO'}
                </span>
              </div>

              <div style={{ padding: '14px 0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Nome Empresarial:</span>
                  <strong style={{ color: resultadoLocacional.nomeAprovado ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>
                    {resultadoLocacional.nomeAprovado ? '✓ Disponível' : '✗ Inapto'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Zoneamento & Uso do Solo:</span>
                  <strong style={{ color: resultadoLocacional.usoSoloAprovado ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>
                    {resultadoLocacional.usoSoloAprovado ? `✓ Permitido (${zoneamentoUrbano})` : `✗ Proibido (${zoneamentoUrbano})`}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Vistoria Prévia Bombeiros:</span>
                  <strong style={{ wordBreak: 'break-word' }}>{resultadoLocacional.exigeVistoriaPreviaBombeiros ? 'Exigida (Alto Risco)' : 'Dispensada / PTL'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Alvará de Funcionamento:</span>
                  <strong style={{ color: resultadoLocacional.dispensaAlvara ? '#16a34a' : '#2563eb', wordBreak: 'break-word' }}>
                    {resultadoLocacional.dispensaAlvara ? 'Dispensado (Liberdade Econômica)' : 'Exigido Protocolo'}
                  </strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                Protocolo Eletrônico: <strong>SP-VRE-2026-0098412</strong> | Válido por 180 dias.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
          <span>🧭</span> Contabilização do Investimento Inicial (CAPEX) no Livro Diário
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #2563eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '8px' }}>1. Desembolso do CAPEX Inicial (Ativação):</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Imobilizado ... {formatMoeda((parseFloat(investimentoInicialStr) || 0) * 0.70)}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Intangível .... {formatMoeda((parseFloat(investimentoInicialStr) || 0) * 0.30)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Banco ........ {formatMoeda(parseFloat(investimentoInicialStr) || 0)}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #16a34a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '8px' }}>2. Realização do Caixa Operacional (Ano 1):</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Banco (Caixa) .. {formatMoeda(parseFloat(fluxosAnuaisStr[0]) || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Resultado (DRE) . {formatMoeda(parseFloat(fluxosAnuaisStr[0]) || 0)}</div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}