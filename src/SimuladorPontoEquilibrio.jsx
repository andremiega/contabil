import React, { useState, useEffect } from 'react';

export default function SimuladorPontoEquilibrio() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Inputs em formato String (para permitir limpar com Backspace sem travar no zero)
  const [precoVendaUnitStr, setPrecoVendaUnitStr] = useState('250.00');
  const [custoVariavelUnitStr, setCustoVariavelUnitStr] = useState('110.00'); // Matéria-prima, insumos diretos
  const [despesaVariavelUnitStr, setDespesaVariavelUnitStr] = useState('25.00'); // Comissões, fretes, tributos variáveis sobre venda
  
  // Estrutura de Fixos e Ajustes Financeiros/Econômicos
  const [custosFixosTotaisStr, setCustosFixosTotaisStr] = useState('60000.00'); // Salários fixos, aluguel, seguros
  const [despesasFixasAdmStr, setDespesasFixasAdmStr] = useState('25000.00'); // Estrutura administrativa
  const [depreciacaoNaoDesembolsavelStr, setDepreciacaoNaoDesembolsavelStr] = useState('12000.00'); // Depreciação (não sai do caixa)
  const [remuneracaoCapitalDesejadaStr, setRemuneracaoCapitalDesejadaStr] = useState('18000.00'); // Custo de oportunidade (TMA / Meta de Lucro)

  // Volume Atual Realizado para Cálculo de Margem de Segurança e Alavancagem
  const [volumeVendidoAtualStr, setVolumeVendidoAtualStr] = useState('1000');

  // Estados dos Resultados
  const [resultados, setResultados] = useState({
    margemContribuicaoUnit: 0,
    indiceMargemContribuicao: 0,
    gastosFixosTotais: 0,
    // Ponto de Equilíbrio Contábil (PEC)
    pecQtd: 0,
    pecReceita: 0,
    // Ponto de Equilíbrio Financeiro (PEF)
    pefQtd: 0,
    pefReceita: 0,
    // Ponto de Equilíbrio Econômico (PEE)
    peeQtd: 0,
    peeReceita: 0,
    // Indicadores de Risco
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

    // 1. Margem de Contribuição
    const mcUnit = Math.max(0, preco - (custoVar + despVar));
    const indiceMC = preco > 0 ? (mcUnit / preco) * 100 : 0;
    const totalFixos = cFixo + dFixa;

    // 2. Ponto de Equilíbrio Contábil (PEC): Fixos Totais / MC Unit
    const pecQtd = mcUnit > 0 ? Math.ceil(totalFixos / mcUnit) : 0;
    const pecReceita = pecQtd * preco;

    // 3. Ponto de Equilíbrio Financeiro (PEF): (Fixos Totais - Depreciação) / MC Unit
    const fixosDesembolsaveis = Math.max(0, totalFixos - deprec);
    const pefQtd = mcUnit > 0 ? Math.ceil(fixosDesembolsaveis / mcUnit) : 0;
    const pefReceita = pefQtd * preco;

    // 4. Ponto de Equilíbrio Econômico (PEE): (Fixos Totais + Lucro Desejado) / MC Unit
    const fixosMaisMeta = totalFixos + lucroDesejado;
    const peeQtd = mcUnit > 0 ? Math.ceil(fixosMaisMeta / mcUnit) : 0;
    const peeReceita = peeQtd * preco;

    // 5. Análise do Volume Atual: Margem de Segurança & GAO
    const lucroOperacionalAtual = (volAtual * mcUnit) - totalFixos;
    const margemSegQtd = Math.max(0, volAtual - pecQtd);
    const margemSegPerc = volAtual > 0 ? (margemSegQtd / volAtual) * 100 : 0;

    // Grau de Alavancagem Operacional = Variação % Lucro / Variação % Vendas = (Qtd * MC) / Lucro Operacional
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚖️</span> Ponto de Equilíbrio (Break-Even Analysis)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Controladoria Estratégica: Análise Comparativa do Ponto Contábil, Financeiro e Econômico com GAO.
          </p>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>
          Margem Unitária: <span style={{ color: '#2563eb' }}>{formatMoeda(resultados.margemContribuicaoUnit)} ({resultados.indiceMargemContribuicao.toFixed(1)}%)</span>
        </div>
      </div>

      {/* DASHBOARDS COMPARATIVOS DOS TRÊS PONTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        
        {/* Ponto Contábil */}
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>1. Ponto Contábil (PEC)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {resultados.pecQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Faturamento: {formatMoeda(resultados.pecReceita)}</span>
          <div style={{ fontSize: '10px', color: '#0f172a', marginTop: '4px', fontWeight: 'bold' }}>Lucro Operacional: R$ 0,00</div>
        </div>

        {/* Ponto Financeiro */}
        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>2. Ponto Financeiro (PEF)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {resultados.pefQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Faturamento: {formatMoeda(resultados.pefReceita)}</span>
          <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '4px', fontWeight: 'bold' }}>Sem Queima de Caixa Operacional</div>
        </div>

        {/* Ponto Econômico */}
        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>3. Ponto Econômico (PEE)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {resultados.peeQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Faturamento: {formatMoeda(resultados.peeReceita)}</span>
          <div style={{ fontSize: '10px', color: '#15803d', marginTop: '4px', fontWeight: 'bold' }}>Garante TMA de {formatMoeda(parseFloat(remuneracaoCapitalDesejadaStr) || 0)}</div>
        </div>

        {/* Margem de Segurança */}
        <div style={{ backgroundColor: resultados.margemSegurancaPerc > 0 ? '#f8fafc' : '#fff5f5', padding: '18px', borderRadius: '12px', border: `1px solid ${resultados.margemSegurancaPerc > 0 ? '#cbd5e1' : '#fecaca'}`, borderLeft: `4px solid ${resultados.margemSegurancaPerc > 0 ? '#f59e0b' : '#ef4444'}` }}>
          <span style={{ color: resultados.margemSegurancaPerc > 0 ? '#b45309' : '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Margem de Segurança (MS)</span>
          <strong style={{ display: 'block', color: resultados.margemSegurancaPerc > 0 ? '#b45309' : '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {resultados.margemSegurancaPerc.toFixed(1)}%
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {resultados.margemSegurancaQtd} un. acima do equilíbrio
          </span>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
            GAO: <strong>{resultados.grauAlavancagemOperacional.toFixed(2)}x</strong>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E DRE COMPARATIVA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* PARÂMETROS OPERACIONAIS */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Parâmetros de Preço & Custos Variáveis
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
            Preço de Venda Unitário (R$):
            <input 
              type="text" 
              value={precoVendaUnitStr} 
              onChange={e => setPrecoVendaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontSize: '13px' }} 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Custo Variável Unit. (R$):
              <input 
                type="text" 
                value={custoVariavelUnitStr} 
                onChange={e => setCustoVariavelUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Despesa Variável Unit. (R$):
              <input 
                type="text" 
                value={despesaVariavelUnitStr} 
                onChange={e => setDespesaVariavelUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <h3 style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
            Estrutura Fixa e Custo de Capital
          </h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
              Custos Fixos Totais (R$):
              <input 
                type="text" 
                value={custosFixosTotaisStr} 
                onChange={e => setCustosFixosTotaisStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
              Despesas Fixas Adm (R$):
              <input 
                type="text" 
                value={despesasFixasAdmStr} 
                onChange={e => setDespesasFixasAdmStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>
              Depreciação Inclusa (R$):
              <input 
                type="text" 
                value={depreciacaoNaoDesembolsavelStr} 
                onChange={e => setDepreciacaoNaoDesembolsavelStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', fontSize: '13px' }} 
              />
              <span style={{ fontSize: '10px', color: '#1e40af', marginTop: '2px' }}>Deduzida no PEF</span>
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
              Lucro Almejado / TMA (R$):
              <input 
                type="text" 
                value={remuneracaoCapitalDesejadaStr} 
                onChange={e => setRemuneracaoCapitalDesejadaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', fontSize: '13px' }} 
              />
              <span style={{ fontSize: '10px', color: '#065f46', marginTop: '2px' }}>Adicionado no PEE</span>
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            Volume Real / Projetado Atual (Unidades):
            <input 
              type="text" 
              value={volumeVendidoAtualStr} 
              onChange={e => setVolumeVendidoAtualStr(e.target.value.replace(/[^0-9]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>
        </div>

        {/* DRE GERENCIAL COMPARATIVA */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>DRE Gerencial por Ponto de Equilíbrio</strong>
              <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                CONTABILIDADE GERENCIAL
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left' }}>Demonstrativo</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>PE Contábil</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>PE Financeiro</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>PE Econômico</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right', color: '#1d4ed8' }}>Cenário Real</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>Volume (Unidades)</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{resultados.pecQtd}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{resultados.pefQtd}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{resultados.peeQtd}</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#1d4ed8' }}>{volumeVendidoAtualStr}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px' }}>(+) Receita Bruta</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.pecReceita)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.pefReceita)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.peeReceita)}</td>
                  <td style={{ padding: '6px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>{formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * (parseFloat(precoVendaUnitStr) || 0))}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                  <td style={{ padding: '6px' }}>(-) Gastos Variáveis</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.pecQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.pefQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.peeQtd * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * ((parseFloat(custoVariavelUnitStr) || 0) + (parseFloat(despesaVariavelUnitStr) || 0)))}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', color: '#2563eb' }}>
                  <td style={{ padding: '6px' }}>(=) Margem Contribuição</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.pecQtd * resultados.margemContribuicaoUnit)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.pefQtd * resultados.margemContribuicaoUnit)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda(resultados.peeQtd * resultados.margemContribuicaoUnit)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{formatMoeda((parseFloat(volumeVendidoAtualStr) || 0) * resultados.margemContribuicaoUnit)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                  <td style={{ padding: '6px' }}>(-) Gastos Fixos Totais</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.gastosFixosTotais)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.gastosFixosTotais)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.gastosFixosTotais)}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>- {formatMoeda(resultados.gastosFixosTotais)}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px 6px' }}>(=) Resultado Operacional</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#475569' }}>R$ 0,00</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#dc2626' }}>- {formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}*</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#16a34a' }}>+ {formatMoeda(parseFloat(remuneracaoCapitalDesejadaStr) || 0)}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: resultados.lucroAtualRealizado >= 0 ? '#16a34a' : '#dc2626' }}>
                    {formatMoeda(resultados.lucroAtualRealizado)}
                  </td>
                </tr>
              </tbody>
            </table>

            <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
              * No PEF, o resultado contábil é negativo no valor exato da depreciação, mas o saldo de caixa operacional é exatamente R$ 0,00.
            </span>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '14px', fontSize: '11px', color: '#1e3a8a', lineHeight: '1.4' }}>
            💡 <strong>Interpretação do GAO ({resultados.grauAlavancagemOperacional.toFixed(2)}x):</strong> Indica que cada 1% de aumento no volume de vendas resultará em um acréscimo de <strong>{(resultados.grauAlavancagemOperacional * 1).toFixed(2)}%</strong> no lucro operacional da entidade.
          </div>

        </div>

      </div>

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Reflexo das Estruturas Fixas e Variáveis no Livro Diário
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
          
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>1. Pelo Reconhecimento dos Gastos Fixos Operacionais:</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesas c/ Aluguéis e Estrutura (DRE) ........... {formatMoeda((parseFloat(custosFixosTotaisStr) || 0) - (parseFloat(depreciacaoNaoDesembolsavelStr) || 0))}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesas c/ Depreciação Acumulada - CPC 27 (DRE) . {formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Contas a Pagar / Fornecedores (Passivo) ......... {formatMoeda((parseFloat(custosFixosTotaisStr) || 0) - (parseFloat(depreciacaoNaoDesembolsavelStr) || 0))}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Depreciação Acumulada (Ativo Não Circ. Redutora) . {formatMoeda(parseFloat(depreciacaoNaoDesembolsavelStr) || 0)}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontWeight: 'bold', color: '#16a34a', display: 'block', marginBottom: '4px' }}>2. Ao Atingir o Ponto Econômico (Destinação do Resultado):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Resultado do Exercício / Lucro Líquido (DRE) ..... {formatMoeda(parseFloat(remuneracaoCapitalDesejadaStr) || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Dividendos Obrigatórios a Pagar (Passivo Circ.) .. {formatMoeda((parseFloat(remuneracaoCapitalDesejadaStr) || 0) * 0.25)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Reserva de Lucros para Expansão (PL) ............. {formatMoeda((parseFloat(remuneracaoCapitalDesejadaStr) || 0) * 0.75)}</div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}