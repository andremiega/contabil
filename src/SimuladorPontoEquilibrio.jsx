import React, { useState, useEffect } from 'react';

export default function SimuladorPontoEquilibrio() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Inputs em formato String (para permitir limpar com Backspace sem travar no zero)
  const [precoVendaUnitStr, setPrecoVendaUnitStr] = useState('250.00');
  const [custoVariavelUnitStr, setCustoVariavelUnitStr] = useState('110.00'); 
  const [despesaVariavelUnitStr, setDespesaVariavelUnitStr] = useState('25.00'); 
  
  // Estrutura de Fixos e Ajustes Financeiros/Econômicos
  const [custosFixosTotaisStr, setCustosFixosTotaisStr] = useState('60000.00'); 
  const [despesasFixasAdmStr, setDespesasFixasAdmStr] = useState('25000.00'); 
  const [depreciacaoNaoDesembolsavelStr, setDepreciacaoNaoDesembolsavelStr] = useState('12000.00'); 
  const [remuneracaoCapitalDesejadaStr, setRemuneracaoCapitalDesejadaStr] = useState('18000.00'); 

  // Volume Atual Realizado
  const [volumeVendidoAtualStr, setVolumeVendidoAtualStr] = useState('1000');

  // Estados dos Resultados
  const [resultados, setResultados] = useState({
    margemContribuicaoUnit: 0,
    indiceMargemContribuicao: 0,
    gastosFixosTotais: 0,
    pecQtd: 0,
    pecReceita: 0,
    pefQtd: 0,
    pefReceita: 0,
    peeQtd: 0,
    peeReceita: 0,
    margemSegurancaQtd: 0,
    margemSegurancaPerc: 0,
    grauAlavancagemOperacional: 0,
    lucroAtualRealizado: 0
  });

  useEffect(() => {
    const preco = parseFloat(precoVendaUnitStr) || 0;
    const custoVar = parseFloat(custoVariavelUnitStr) || 0;
    const despVar = parseFloat(despesaVariavelUnitStr) || 0;
    const cFixo = parseFloat(custosFixosTotaisStr) || 0;
    const dFixa = parseFloat(despesasFixasAdmStr) || 0;
    const deprec = parseFloat(depreciacaoNaoDesembolsavelStr) || 0;
    const lucroDesejado = parseFloat(remuneracaoCapitalDesejadaStr) || 0;
    const volAtual = parseFloat(volumeVendidoAtualStr) || 0;

    const mcUnit = Math.max(0, preco - (custoVar + despVar));
    const indiceMC = preco > 0 ? (mcUnit / preco) * 100 : 0;
    const totalFixos = cFixo + dFixa;

    const pecQtd = mcUnit > 0 ? Math.ceil(totalFixos / mcUnit) : 0;
    const pecReceita = pecQtd * preco;

    const fixosDesembolsaveis = Math.max(0, totalFixos - deprec);
    const pefQtd = mcUnit > 0 ? Math.ceil(fixosDesembolsaveis / mcUnit) : 0;
    const pefReceita = pefQtd * preco;

    const fixosMaisMeta = totalFixos + lucroDesejado;
    const peeQtd = mcUnit > 0 ? Math.ceil(fixosMaisMeta / mcUnit) : 0;
    const peeReceita = peeQtd * preco;

    const lucroOperacionalAtual = (volAtual * mcUnit) - totalFixos;
    const margemSegQtd = Math.max(0, volAtual - pecQtd);
    const margemSegPerc = volAtual > 0 ? (margemSegQtd / volAtual) * 100 : 0;

    const gao = lucroOperacionalAtual > 0 ? (volAtual * mcUnit) / lucroOperacionalAtual : 0;

    setResultados({
      margemContribuicaoUnit: mcUnit,
      indiceMargemContribuicao: indiceMC,
      gastosFixosTotais: totalFixos,
      pecQtd,
      pecReceita,
      pefQtd,
      pefReceita,
      peeQtd,
      peeReceita,
      margemSegurancaQtd: margemSegQtd,
      margemSegurancaPerc: margemSegPerc,
      grauAlavancagemOperacional: gao,
      lucroAtualRealizado: lucroOperacionalAtual
    });

  }, [precoVendaUnitStr, custoVariavelUnitStr, despesaVariavelUnitStr, custosFixosTotaisStr, despesasFixasAdmStr, depreciacaoNaoDesembolsavelStr, remuneracaoCapitalDesejadaStr, volumeVendidoAtualStr]);

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>⚖️</span> Ponto de Equilíbrio (Break-Even Analysis)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Controladoria Estratégica: Análise Comparativa do Ponto Contábil, Financeiro e Econômico com GAO.
          </p>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '8px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', boxSizing: 'border-box' }}>
          Margem Unitária: <span style={{ color: '#2563eb', wordBreak: 'break-word' }}>{formatMoeda(resultados.margemContribuicaoUnit)} ({resultados.indiceMargemContribuicao.toFixed(1)}%)</span>
        </div>
      </div>

      {/* DASHBOARDS COMPARATIVOS DOS TRÊS PONTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* Ponto Contábil */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#475569', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>1. Ponto Contábil (PEC)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {resultados.pecQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Faturamento: {formatMoeda(resultados.pecReceita)}</span>
          <div style={{ fontSize: '10.5px', color: '#0f172a', marginTop: '4px', fontWeight: 'bold', wordBreak: 'break-word' }}>Lucro Operacional: R$ 0,00</div>
        </div>

        {/* Ponto Financeiro */}
        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>2. Ponto Financeiro (PEF)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {resultados.pefQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Faturamento: {formatMoeda(resultados.pefReceita)}</span>
          <div style={{ fontSize: '10.5px', color: '#1e40af', marginTop: '4px', fontWeight: 'bold', wordBreak: 'break-word' }}>Sem Queima de Caixa</div>
        </div>

        {/* Ponto Econômico */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>3. Ponto Econômico (PEE)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {resultados.peeQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#166534', wordBreak: 'break-word' }}>Faturamento: {formatMoeda(resultados.peeReceita)}</span>
          <div style={{ fontSize: '10.5px', color: '#15803d', marginTop: '4px', fontWeight: 'bold', wordBreak: 'break-word' }}>Garante TMA</div>
        </div>

        {/* Margem de Segurança */}
        <div style={{ backgroundColor: resultados.margemSegurancaPerc > 0 ? '#f8fafc' : '#fff5f5', padding: '16px', borderRadius: '16px', border: `1px solid ${resultados.margemSegurancaPerc > 0 ? '#cbd5e1' : '#fecaca'}`, borderLeft: `4px solid ${resultados.margemSegurancaPerc > 0 ? '#f59e0b' : '#ef4444'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: resultados.margemSegurancaPerc > 0 ? '#b45309' : '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Margem de Segurança (MS)</span>
          <strong style={{ display: 'block', color: resultados.margemSegurancaPerc > 0 ? '#b45309' : '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {resultados.margemSegurancaPerc.toFixed(1)}%
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            {resultados.margemSegurancaQtd} un. acima
          </span>
          <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '4px', wordBreak: 'break-word' }}>
            GAO: <strong>{resultados.grauAlavancagemOperacional.toFixed(2)}x</strong>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E DRE COMPARATIVA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* PARÂMETROS OPERACIONAIS */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
            Parâmetros de Preço & Custos Variáveis
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Preço de Venda Unitário (R$):</label>
              <input type="text" value={precoVendaUnitStr} onChange={e => setPrecoVendaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Custo Variável Unit. (R$):</label>
                <input type="text" value={custoVariavelUnitStr} onChange={e => setCustoVariavelUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Despesa Variável Unit. (R$):</label>
                <input type="text" value={despesaVariavelUnitStr} onChange={e => setDespesaVariavelUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <h3 style={{ margin: '6px 0 0 0', fontSize: '14.5px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
              Estrutura Fixa e Custo de Capital
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#dc2626' }}>Custos Fixos (R$):</label>
                <input type="text" value={custosFixosTotaisStr} onChange={e => setCustosFixosTotaisStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#dc2626' }}>Despesas Fixas Adm (R$):</label>
                <input type="text" value={despesasFixasAdmStr} onChange={e => setDespesasFixasAdmStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#2563eb' }}>Depreciação (R$):</label>
                <input type="text" value={depreciacaoNaoDesembolsavelStr} onChange={e => setDepreciacaoNaoDesembolsavelStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
              </div>
              <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#059669' }}>Lucro Almejado / TMA (R$):</label>
                <input type="text" value={remuneracaoCapitalDesejadaStr} onChange={e => setRemuneracaoCapitalDesejadaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
              </div>
            </div>

            <div style={{ minWidth: 0, borderTop: '1px solid #e2e8f0', paddingTop: '10px', boxSizing: 'border-box' }}>
              <label style={labelStyle}>Volume Real / Projetado Atual (Unidades):</label>
              <input type="text" value={volumeVendidoAtualStr} onChange={e => setVolumeVendidoAtualStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* DRE GERENCIAL COMPARATIVA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <strong style={{ fontSize: '13.5px', color: '#0f172a', wordBreak: 'break-word' }}>DRE Gerencial por Ponto de Equilíbrio</strong>
              <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                CONTABILIDADE GERENCIAL
              </span>
            </div>

            <div style={{ overflowX: 'auto', boxSizing: 'border-box', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right', minWidth: '480px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Demonstrativo</th>
                    <th style={{ padding: '8px 10px' }}>PE Contábil</th>
                    <th style={{ padding: '8px 10px' }}>PE Financeiro</th>
                    <th style={{ padding: '8px 10px' }}>PE Econômico</th>
                    <th style={{ padding: '8px 10px', color: '#1d4ed8' }}>Cenário Real</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 'bold' }}>Volume (Un)</td>
                    <td style={{ padding: '6px 8px' }}>{resultados.pecQtd}</td>
                    <td style={{ padding: '6px 8px' }}>{resultados.pefQtd}</td>
                    <td style={{ padding: '6px 8px' }}>{resultados.peeQtd}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 'bold', color: '#1d4ed8' }}>{volumeVendidoAtualStr}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>(+) Receita Bruta</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pecReceita)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pefReceita)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.peeReceita)}</td>
                    <td style={{ padding: '6px 8px', color: '#16a34a', fontWeight: 'bold' }}>{formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * (parseFloat(precoVendaUnitStr) || 0))}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>(-) Gastos Variáveis</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pecQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pefQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.peeQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', color: '#2563eb' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>(=) Margem Contribuição</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pecQtd * resultados.margemContribuicaoUnit)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.pefQtd * resultados.margemContribuicaoUnit)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.peeQtd * resultados.margemContribuicaoUnit)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * resultados.margemContribuicaoUnit)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'left' }}>(-) Gastos Fixos Totais</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.gastosFixosTotais)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.gastosFixosTotais)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.gastosFixosTotais)}</td>
                    <td style={{ padding: '6px 8px' }}>{formatMoeda(resultados.gastosFixosTotais)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <td style={{ padding: '8px 6px', textAlign: 'left' }}>(=) Resultado Operacional</td>
                    <td style={{ padding: '8px 6px', color: '#475569' }}>R$ 0,00</td>
                    <td style={{ padding: '8px 6px', color: '#dc2626' }}>{formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}*</td>
                    <td style={{ padding: '8px 6px', color: '#16a34a' }}>+ {formatMoeda(parseFloat(remuneracaoCapitalDesejadaStr) || 0)}</td>
                    <td style={{ padding: '8px 6px', color: resultados.lucroAtualRealizado >= 0 ? '#16a34a' : '#dc2626' }}>
                      {formatMoeda(resultados.lucroAtualRealizado)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '10px', wordBreak: 'break-word' }}>
              * No PEF, o resultado contábil é negativo no valor da depreciação, mas o caixa operacional é R$ 0,00.
            </span>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '16px', fontSize: '12px', color: '#1e3a8a', lineHeight: '1.5', boxSizing: 'border-box', wordBreak: 'break-word' }}>
            💡 <strong>Interpretação do GAO ({resultados.grauAlavancagemOperacional.toFixed(2)}x):</strong> Indica que cada 1% de aumento no volume de vendas resultará em um acréscimo de <strong>{resultados.grauAlavancagemOperacional.toFixed(2)}%</strong> no lucro operacional.
          </div>
        </div>

      </div>

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
          <span>🧭</span> Reflexo das Estruturas Fixas e Variáveis no Livro Diário
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #2563eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '8px' }}>1. Reconhecimento dos Gastos Fixos Operacionais:</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Desp. c/ Aluguéis e Estrutura (DRE) ... {formatMoeda((parseFloat(custosFixosTotaisStr) || 0) - (parseFloat(depreciacaoNaoDesembolsavelStr) || 0))}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Desp. c/ Depreciação - CPC 27 (DRE) ... {formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Contas a Pagar / Fornecedores ........ {formatMoeda((parseFloat(custosFixosTotaisStr) || 0) - (parseFloat(depreciacaoNaoDesembolsavelStr) || 0))}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: Depreciação Acumulada (Ativo) ........ {formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #16a34a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '8px' }}>2. Destinação do Resultado (Ponto Econômico):</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Resultado do Exercício / Lucro (DRE) . {formatMoeda(parseFloat(remuneracaoCapitalDesejadaStr) || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Dividendos a Pagar (Passivo Circ.) ... {formatMoeda((parseFloat(remuneracaoCapitalDesejadaStr) || 0) * 0.25)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: Reserva de Lucros (PL) ............... {formatMoeda((parseFloat(remuneracaoCapitalDesejadaStr) || 0) * 0.75)}</div>
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