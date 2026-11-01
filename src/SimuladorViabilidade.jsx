import React, { useState, useEffect } from 'react';

export default function SimuladorViabilidade() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Aba ativa: 'financeira' (VPL/TIR/Payback) ou 'locacional' (Zoneamento/Redesim/Alvará)
  const [secaoAtiva, setSecaoAtiva] = useState('financeira');

  // ========================================================
  // 1. VIABILIDADE ECONÔMICO-FINANCEIRA (VPL, TIR & PAYBACK)
  // ========================================================
  // Inputs em String para não travar o zero no Backspace
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
  const [zoneamentoUrbano, setZoneamentoUrbano] = useState('ZICS'); // 'ZICS' (Comercial/Serviço), 'ZPR' (Residencial), 'ZI' (Industrial)
  const [cnaePrincipal, setCnaePrincipal] = useState('6920-6/01 - Atividades de Contabilidade');
  const [grauRiscoLiberdade, setGrauRiscoLiberdade] = useState('baixo'); // 'baixo' (nível 1 - dispensado), 'medio' (nível 2), 'alto' (nível 3 - vistoria prévia)
  const [iptuInscricao, setIptuInscricao] = useState('042.891.0024-5');
  const [resultadoLocacional, setResultadoLocacional] = useState({
    nomeAprovado: true,
    usoSoloAprovado: true,
    exigeVistoriaPreviaBombeiros: false,
    dispensaAlvara: true
  });

  // Atualizar fluxo de um ano específico
  const handleAtualizarFluxo = (index, valor) => {
    const novos = [...fluxosAnuaisStr];
    novos[index] = valor.replace(/[^0-9.]/g, '');
    setFluxosAnuaisStr(novos);
  };

  // Cálculo da TIR por aproximação numérica (Newton-Raphson / Bisseção)
  const calcularTIR = (capex, fluxos) => {
    let tirMin = -0.99;
    let tirMax = 5.0; // Até 500%
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

  // Recálculo Financeiro Completo
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

  // Recálculo Locacional e Zoneamento
  useEffect(() => {
    const usoOk = zoneamentoUrbano !== 'ZPR'; // ZPR não aceita atividade comercial pesada
    const vistoria = grauRiscoLiberdade === 'alto';
    const dispensa = grauRiscoLiberdade === 'baixo' && usoOk;

    setResultadoLocacional({
      nomeAprovado: nomeEmpresarial.trim().length > 8,
      usoSoloAprovado: usoOk,
      exigeVistoriaPreviaBombeiros: vistoria,
      dispensaAlvara: dispensa
    });
  }, [zoneamentoUrbano, grauRiscoLiberdade, nomeEmpresarial]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span> Simulador de Viabilidade de Negócios & Projetos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Engenharia Econômica (VPL, TIR, Payback) & Viabilidade Locacional / Zoneamento Redesim.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE VERTENTES */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => setSecaoAtiva('financeira')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'financeira' ? '#0f172a' : 'transparent', 
              color: secaoAtiva === 'financeira' ? 'white' : '#64748b'
            }}
          >
            📊 Viabilidade Econômica (VPL/TIR)
          </button>
          <button 
            onClick={() => setSecaoAtiva('locacional')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'locacional' ? '#2563eb' : 'transparent', 
              color: secaoAtiva === 'locacional' ? 'white' : '#64748b'
            }}
          >
            📍 Viabilidade Locacional (Redesim)
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE INDICADORES PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        
        {/* VPL */}
        <div style={{ backgroundColor: indicadores.vpl >= 0 ? '#f0fdf4' : '#fff5f5', padding: '18px', borderRadius: '12px', border: `1px solid ${indicadores.vpl >= 0 ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${indicadores.vpl >= 0 ? '#16a34a' : '#ef4444'}` }}>
          <span style={{ color: indicadores.vpl >= 0 ? '#166534' : '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Valor Presente Líquido (VPL)
          </span>
          <strong style={{ display: 'block', color: indicadores.vpl >= 0 ? '#15803d' : '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(indicadores.vpl)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {indicadores.vpl >= 0 ? 'Gera riqueza acima da TMA' : 'Destrói valor econômico'}
          </span>
        </div>

        {/* TIR */}
        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Taxa Interna de Retorno (TIR)
          </span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {indicadores.tir.toFixed(2)}% a.a.
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>
            TMA de corte: {parseFloat(taxaTmaStr) || 0}% a.a.
          </span>
        </div>

        {/* Payback Descontado */}
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Payback Descontado
          </span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '24px', marginTop: '4px' }}>
            {indicadores.paybackDescontado > 0 ? `${indicadores.paybackDescontado.toFixed(1)} anos` : 'Inatingível no prazo'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Simples: {indicadores.paybackSimples.toFixed(1)} anos
          </span>
        </div>

        {/* Veredito do Projeto */}
        <div style={{ backgroundColor: indicadores.statusProjeto === 'viavel' ? '#f0fdf4' : '#fff5f5', padding: '18px', borderRadius: '12px', border: `1px solid ${indicadores.statusProjeto === 'viavel' ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${indicadores.statusProjeto === 'viavel' ? '#16a34a' : '#ef4444'}` }}>
          <span style={{ color: indicadores.statusProjeto === 'viavel' ? '#166534' : '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Parecer de Viabilidade
          </span>
          <strong style={{ display: 'block', color: indicadores.statusProjeto === 'viavel' ? '#15803d' : '#dc2626', fontSize: '20px', marginTop: '4px' }}>
            {indicadores.statusProjeto === 'viavel' ? '✅ PROJETO VIÁVEL' : '❌ PROJETO REJEITADO'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            IL: {indicadores.indiceLucratividade.toFixed(2)} (R$ gerado por R$ 1 investido)
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. ABA: VIABILIDADE ECONÔMICO-FINANCEIRA                  */}
      {/* ========================================================= */}
      {secaoAtiva === 'financeira' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            
            {/* Parâmetros do Investimento */}
            <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                Premissas de Investimento e Custo de Capital
              </h3>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                Investimento Inicial (CAPEX - Ano 0):
                <input 
                  type="text" 
                  value={investimentoInicialStr} 
                  onChange={e => setInvestimentoInicialStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>
                  TMA - Taxa Mínima (% a.a.):
                  <input 
                    type="text" 
                    value={taxaTmaStr} 
                    onChange={e => setTaxaTmaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Horizonte (Anos):
                  <input 
                    type="text" 
                    value={horizonteAnosStr} 
                    disabled
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', fontSize: '13px' }} 
                  />
                </label>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                📌 <strong>Regra de Decisão do VPL:</strong> Se VPL &gt; 0, o investimento remunera o capital à taxa mínima (TMA) e ainda agrega valor econômico ao patrimônio da empresa.
              </div>
            </div>

            {/* Projeção de Fluxos Anuais */}
            <div style={{ flex: '1 1 450px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>
                Fluxos de Caixa Líquidos Operacionais Projetados (Anos 1 a 5)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {fluxosAnuaisStr.map((fluxo, idx) => (
                  <label key={idx} style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
                    Ano {idx + 1} (R$):
                    <input 
                      type="text" 
                      value={fluxo} 
                      onChange={e => handleAtualizarFluxo(idx, e.target.value)} 
                      style={{ padding: '6px 8px', marginTop: '3px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
                    />
                  </label>
                ))}
              </div>

              {/* Tabela de Desconto dos Fluxos */}
              <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '6px', textAlign: 'center' }}>Período</th>
                      <th style={{ padding: '6px' }}>Fluxo Nominal</th>
                      <th style={{ padding: '6px' }}>Valor Presente (VP)</th>
                      <th style={{ padding: '6px' }}>Acumulado Descontado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                      <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Ano 0</td>
                      <td style={{ padding: '6px' }}>- {formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                      <td style={{ padding: '6px' }}>- {formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                      <td style={{ padding: '6px', fontWeight: 'bold' }}>- {formatMoeda(parseFloat(investimentoInicialStr) || 0)}</td>
                    </tr>
                    {indicadores.tabelaFluxos.map(linha => (
                      <tr key={linha.ano} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>Ano {linha.ano}</td>
                        <td style={{ padding: '6px' }}>{formatMoeda(linha.fluxoNominal)}</td>
                        <td style={{ padding: '6px', color: '#2563eb' }}>{formatMoeda(linha.valorPresente)}</td>
                        <td style={{ padding: '6px', fontWeight: 'bold', color: linha.acumuladoDescontado >= 0 ? '#16a34a' : '#dc2626' }}>
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
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
            
            {/* Parâmetros Locacionais */}
            <div style={{ flex: '1 1 350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                Dados da Consulta Prévia Locacional
              </h3>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Nome Empresarial Pretendido:
                <input 
                  type="text" 
                  value={nomeEmpresarial} 
                  onChange={e => setNomeEmpresarial(e.target.value)} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Zoneamento Urbano do Imóvel:
                <select 
                  value={zoneamentoUrbano} 
                  onChange={e => setZoneamentoUrbano(e.target.value)} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                >
                  <option value="ZICS">ZICS - Zona de Comércio, Serviços e Indústria Não Poluente</option>
                  <option value="ZPR">ZPR - Zona Predominantemente Residencial</option>
                  <option value="ZI">ZI - Zona Estritamente Industrial</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Atividade Econômica (CNAE):
                <input 
                  type="text" 
                  value={cnaePrincipal} 
                  onChange={e => setCnaePrincipal(e.target.value)} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Inscrição Cadastral / IPTU:
                  <input 
                    type="text" 
                    value={iptuInscricao} 
                    onChange={e => setIptuInscricao(e.target.value)} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                  />
                </label>

                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Grau de Risco Sanitário/Bombeiros:
                  <select 
                    value={grauRiscoLiberdade} 
                    onChange={e => setGrauRiscoLiberdade(e.target.value)} 
                    style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                  >
                    <option value="baixo">Baixo Risco (Nível 1 - Lei 13.874)</option>
                    <option value="medio">Médio Risco (Nível 2 - Licença Condicionada)</option>
                    <option value="alto">Alto Risco (Nível 3 - Vistoria Prévia)</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Espelho do Certificado de Viabilidade */}
            <div style={{ flex: '1 1 420px', backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>CERTIFICADO DE VIABILIDADE TÉCNICA E LOCACIONAL</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Redesim / Junta Comercial / Prefeitura Municipal</span>
                </div>
                <span style={{ backgroundColor: resultadoLocacional.usoSoloAprovado ? '#16a34a' : '#dc2626', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                  {resultadoLocacional.usoSoloAprovado ? 'ADEQUADO' : 'INADEQUADO'}
                </span>
              </div>

              <div style={{ padding: '14px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                  <span>Nome Empresarial:</span>
                  <strong style={{ color: resultadoLocacional.nomeAprovado ? '#16a34a' : '#dc2626' }}>
                    {resultadoLocacional.nomeAprovado ? '✓ Disponível para Registro' : '✗ Nome Inapto'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                  <span>Zoneamento & Uso do Solo:</span>
                  <strong style={{ color: resultadoLocacional.usoSoloAprovado ? '#16a34a' : '#dc2626' }}>
                    {resultadoLocacional.usoSoloAprovado ? `✓ Permitido em ${zoneamentoUrbano}` : `✗ Proibido em ${zoneamentoUrbano}`}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                  <span>Vistoria Prévia Corpo de Bombeiros:</span>
                  <strong>{resultadoLocacional.exigeVistoriaPreviaBombeiros ? 'Exigida (Alto Risco)' : 'Dispensada / PTL'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
                  <span>Alvará de Funcionamento:</span>
                  <strong style={{ color: resultadoLocacional.dispensaAlvara ? '#16a34a' : '#2563eb' }}>
                    {resultadoLocacional.dispensaAlvara ? 'Dispensado (Lei de Liberdade Econômica)' : 'Exigido Protocolo Formal'}
                  </strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                Protocolo Eletrônico: <strong>SP-VRE-2026-0098412</strong> | Válido por 180 dias para protocolo da documentação na Junta Comercial.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Contabilização do Investimento Inicial (CAPEX) no Livro Diário
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
          
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>1. Desembolso do CAPEX Inicial (Ativação dos Bens):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Máquinas, Equipamentos e Instalações (Imobilizado) .. {formatMoeda((parseFloat(investimentoInicialStr) || 0) * 0.70)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Licenças, Softwares e Projetos (Intangível) ........ {formatMoeda((parseFloat(investimentoInicialStr) || 0) * 0.30)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Banco Conta Movimento (Ativo Circulante) .......... {formatMoeda(parseFloat(investimentoInicialStr) || 0)}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontWeight: 'bold', color: '#16a34a', display: 'block', marginBottom: '4px' }}>2. Realização do Fluxo de Caixa Operacional (Ano 1):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Banco Conta Movimento (Geração de Caixa Líquido) .. {formatMoeda(parseFloat(fluxosAnuaisStr[0]) || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Resultado Operacional Líquido do Projeto (DRE) ... {formatMoeda(parseFloat(fluxosAnuaisStr[0]) || 0)}</div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}