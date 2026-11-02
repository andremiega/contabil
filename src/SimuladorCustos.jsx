import React, { useState, useEffect } from 'react';

export default function SimuladorCustos({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Método de Custeio: 'absorcao' (Societário/Fiscal) ou 'variavel' (Gerencial)
  const [metodoCusteio, setMetodoCusteio] = useState('absorcao');

  // Parâmetros de Produção e Vendas (Inputs em String para não travar no zero com Backspace)
  const [volumeProduzidoStr, setVolumeProduzidoStr] = useState('1000'); 
  const [volumeVendidoStr, setVolumeVendidoStr] = useState('800');    
  const [precoVendaUnitStr, setPrecoVendaUnitStr] = useState('150.00');

  // Custos Diretos / Variáveis de Fabricação
  const [materiaPrimaUnitStr, setMateriaPrimaUnitStr] = useState('45.00'); 
  const [maoObraDiretaUnitStr, setMaoObraDiretaUnitStr] = useState('25.00'); 
  const [despesaVariavelUnitStr, setDespesaVariavelUnitStr] = useState('10.00'); 

  // Custos e Despesas Fixos Totais do Período
  const [custosIndiretosFixosStr, setCustosIndiretosFixosStr] = useState('25000.00'); 
  const [despesasFixasAdmStr, setDespesasFixasAdmStr] = useState('15000.00'); 
  const [custoOportunidadeStr, setCustoOportunidadeStr] = useState('5000.00'); 

  // Totais e Indicadores Calculados
  const [metricas, setMetricas] = useState({
    custoPrimarioUnit: 0,
    custoTransformacaoUnit: 0,
    custoUnitarioAbsorcao: 0,
    custoUnitarioVariavel: 0,
    receitaBrutaVendas: 0,
    cpvTotal: 0,
    margemContribuicaoUnit: 0,
    margemContribuicaoTotal: 0,
    lucroOperacional: 0,
    estoqueFinalValor: 0,
    estoqueFinalUnidades: 0,
    pontoEquilibrioContabilQtd: 0,
    pontoEquilibrioContabilVal: 0,
    pontoEquilibrioEconomicoQtd: 0
  });

  useEffect(() => {
    const qtdProd = parseFloat(volumeProduzidoStr) || 0;
    const qtdVend = parseFloat(volumeVendidoStr) || 0;
    const precoVenda = parseFloat(precoVendaUnitStr) || 0;

    const mpUnit = parseFloat(materiaPrimaUnitStr) || 0;
    const modUnit = parseFloat(maoObraDiretaUnitStr) || 0;
    const despVarUnit = parseFloat(despesaVariavelUnitStr) || 0;

    const cifFixoTotal = parseFloat(custosIndiretosFixosStr) || 0;
    const despFixaAdmTotal = parseFloat(despesasFixasAdmStr) || 0;
    const lucroDesejado = parseFloat(custoOportunidadeStr) || 0;

    // 1. Custos Unitários
    const cPrimario = mpUnit + modUnit;
    const cifUnitarioRateado = qtdProd > 0 ? (cifFixoTotal / qtdProd) : 0;
    const cTransformacao = modUnit + cifUnitarioRateado;

    const cUnitAbsorcao = mpUnit + modUnit + cifUnitarioRateado; 
    const cUnitVariavel = mpUnit + modUnit; 

    // 2. Faturamento e CPV
    const receitaTotal = qtdVend * precoVenda;
    const qtdEstoqueFinal = Math.max(0, qtdProd - qtdVend);

    const mcUnit = precoVenda - (mpUnit + modUnit + despVarUnit);
    const mcTotal = mcUnit * qtdVend;

    const custosEDespesasFixasTotais = cifFixoTotal + despFixaAdmTotal;
    const pecQtd = mcUnit > 0 ? Math.ceil(custosEDespesasFixasTotais / mcUnit) : 0;
    const pecValor = pecQtd * precoVenda;
    const peeQtd = mcUnit > 0 ? Math.ceil((custosEDespesasFixasTotais + lucroDesejado) / mcUnit) : 0;

    let cpvTotalCalculado = 0;
    let lucroResultado = 0;
    let valorEstoqueFinal = 0;

    if (metodoCusteio === 'absorcao') {
      cpvTotalCalculado = qtdVend * cUnitAbsorcao;
      const despesasPeriodo = (qtdVend * despVarUnit) + despFixaAdmTotal;
      lucroResultado = receitaTotal - cpvTotalCalculado - despesasPeriodo;
      valorEstoqueFinal = qtdEstoqueFinal * cUnitAbsorcao; 
    } else {
      const custoVariavelVendido = qtdVend * cUnitVariavel;
      const despesaVariavelTotal = qtdVend * despVarUnit;
      cpvTotalCalculado = custoVariavelVendido;
      lucroResultado = mcTotal - custosEDespesasFixasTotais;
      valorEstoqueFinal = qtdEstoqueFinal * cUnitVariavel; 
    }

    setMetricas({
      custoPrimarioUnit: cPrimario,
      custoTransformacaoUnit: cTransformacao,
      custoUnitarioAbsorcao: cUnitAbsorcao,
      custoUnitarioVariavel: cUnitVariavel,
      receitaBrutaVendas: receitaTotal,
      cpvTotal: cpvTotalCalculado,
      margemContribuicaoUnit: mcUnit,
      margemContribuicaoTotal: mcTotal,
      lucroOperacional: lucroResultado,
      estoqueFinalValor: valorEstoqueFinal,
      estoqueFinalUnidades: qtdEstoqueFinal,
      pontoEquilibrioContabilQtd: pecQtd,
      pontoEquilibrioContabilVal: pecValor,
      pontoEquilibrioEconomicoQtd: peeQtd
    });

  }, [metodoCusteio, volumeProduzidoStr, volumeVendidoStr, precoVendaUnitStr, materiaPrimaUnitStr, maoObraDiretaUnitStr, despesaVariavelUnitStr, custosIndiretosFixosStr, despesasFixasAdmStr, custoOportunidadeStr]);

  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL (CÉREBRO DO ERP)
  // ==========================================================
  const handleApropriarCustos = () => {
    if (typeof registrarFatoGerador !== 'function') return;

    const qtdProd = parseFloat(volumeProduzidoStr) || 0;
    if (qtdProd <= 0) {
      return mostrarToast('Informe uma quantidade de produção válida.', 'aviso');
    }

    const totalMP = qtdProd * (parseFloat(materiaPrimaUnitStr) || 0);
    const totalMOD = qtdProd * (parseFloat(maoObraDiretaUnitStr) || 0);
    const totalCIF = parseFloat(custosIndiretosFixosStr) || 0;

    const idEstoquePA = planoContas.find(c => c.nome_conta.toLowerCase().includes('produtos acabados') || c.nome_conta.toLowerCase().includes('estoque'))?.id;
    const idEstoqueMP = planoContas.find(c => c.nome_conta.toLowerCase().includes('matéria') || c.nome_conta.toLowerCase().includes('insumo'))?.id || idEstoquePA;
    const idSalariosPagar = planoContas.find(c => c.nome_conta.toLowerCase().includes('salários a pagar') || c.codigo_contabil === '2.1.02.01')?.id;
    const idContasPagar = planoContas.find(c => c.nome_conta.toLowerCase().includes('fornecedores') || c.codigo_contabil === '2.1.01.01')?.id;

    if (totalMP > 0) {
      registrarFatoGerador(`Consumo de Matéria Prima (Lote: ${qtdProd} un.)`, totalMP, 'Custos / Produção', [idEstoquePA], [idEstoqueMP]);
    }
    if (totalMOD > 0) {
      registrarFatoGerador(`Apropriação de MOD (Lote: ${qtdProd} un.)`, totalMOD, 'Custos / Produção', [idEstoquePA], [idSalariosPagar]);
    }
    if (totalCIF > 0) {
      registrarFatoGerador(`Rateio de CIF p/ Produtos Acabados (Lote: ${qtdProd} un.)`, totalCIF, 'Custos / Produção', [idEstoquePA], [idContasPagar]);
    }

    if (mostrarToast) mostrarToast('Custo de Produção finalizado! O Estoque de Produtos Acabados e as pendências foram enviados para o Diário.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🏭</span> Gestão e Contabilidade de Custos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Custeio por Absorção vs. Custeio Variável, Margem de Contribuição e Ponto de Equilíbrio (Break-Even).
          </p>
        </div>

        {/* SELETOR DE MÉTODO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setMetodoCusteio('absorcao')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoCusteio === 'absorcao' ? '#0f172a' : 'transparent', color: metodoCusteio === 'absorcao' ? 'white' : '#64748b' }}
          >
            📘 Absorção (Societário)
          </button>
          <button 
            onClick={() => setMetodoCusteio('variavel')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoCusteio === 'variavel' ? '#2563eb' : 'transparent', color: metodoCusteio === 'variavel' ? 'white' : '#64748b' }}
          >
            📊 Variável (Gerencial)
          </button>
        </div>
      </div>

      {/* DASHBOARDS PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Unitário de Produção</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(metodoCusteio === 'absorcao' ? metricas.custoUnitarioAbsorcao : metricas.custoUnitarioVariavel)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            {metodoCusteio === 'absorcao' ? 'MP + MOD + CIF Rateado' : 'Apenas Custos Variáveis'}
          </span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Margem Contribuição (Unit.)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(metricas.margemContribuicaoUnit)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>
            Total: {formatMoeda(metricas.margemContribuicaoTotal)}
          </span>
        </div>

        <div style={{ backgroundColor: metricas.lucroOperacional >= 0 ? '#f0fdf4' : '#fff5f5', padding: '16px', borderRadius: '16px', border: `1px solid ${metricas.lucroOperacional >= 0 ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${metricas.lucroOperacional >= 0 ? '#16a34a' : '#ef4444'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: metricas.lucroOperacional >= 0 ? '#166534' : '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Lucro Operacional Líquido</span>
          <strong style={{ display: 'block', color: metricas.lucroOperacional >= 0 ? '#15803d' : '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(metricas.lucroOperacional)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Método: {metodoCusteio === 'absorcao' ? 'Absorção' : 'Variável'}</span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#b45309', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ponto de Equilíbrio Contábil</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {metricas.pontoEquilibrioContabilQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Faturamento: {formatMoeda(metricas.pontoEquilibrioContabilVal)}</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E DRE GERENCIAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* PARÂMETROS OPERACIONAIS */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Volumes e Estrutura de Custos</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Produção (Unidades):</label>
              <input type="text" value={volumeProduzidoStr} onChange={e => setVolumeProduzidoStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Vendas (Unidades):</label>
              <input type="text" value={volumeVendidoStr} onChange={e => setVolumeVendidoStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={{ ...labelStyle, color: '#16a34a' }}>Preço de Venda Unitário (R$):</label>
            <input type="text" value={precoVendaUnitStr} onChange={e => setPrecoVendaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Matéria-Prima Unit. (R$):</label>
              <input type="text" value={materiaPrimaUnitStr} onChange={e => setMateriaPrimaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Mão de Obra Direta Unit. (R$):</label>
              <input type="text" value={maoObraDiretaUnitStr} onChange={e => setMaoObraDiretaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={{ ...labelStyle, color: '#dc2626' }}>Custos Indiretos Fixos (R$):</label>
              <input type="text" value={custosIndiretosFixosStr} onChange={e => setCustosIndiretosFixosStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Despesas Fixas Totais (R$):</label>
              <input type="text" value={despesasFixasAdmStr} onChange={e => setDespesasFixasAdmStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* DEMONSTRATIVO DE RESULTADO (DRE COMPARATIVA) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          
          <div style={cardStyle}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-word' }}>
                DRE: {metodoCusteio === 'absorcao' ? 'Custeio por Absorção' : 'Custeio Variável'}
              </strong>
              <span style={{ backgroundColor: metodoCusteio === 'absorcao' ? '#0f172a' : '#2563eb', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                {metodoCusteio === 'absorcao' ? 'FISCAL / SOCIETÁRIO' : 'GERENCIAL'}
              </span>
            </div>

            <div style={{ padding: '12px 0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span>(+) Receita Bruta ({volumeVendidoStr} un.):</span>
                <strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>{formatMoeda(metricas.receitaBrutaVendas)}</strong>
              </div>

              {metodoCusteio === 'absorcao' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) CPV (Custo dos Produtos Vendidos):</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '6px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(=) Lucro Bruto Operacional:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(metricas.receitaBrutaVendas - metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) Despesas Comerciais e Administrativas:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda((parseFloat(volumeVendidoStr) || 0) * (parseFloat(despesaVariavelUnitStr) || 0) + (parseFloat(despesasFixasAdmStr) || 0))}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) Custos Variáveis dos Produtos:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) Despesas Variáveis de Vendas:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda((parseFloat(volumeVendidoStr) || 0) * (parseFloat(despesaVariavelUnitStr) || 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '6px', color: '#2563eb', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(=) Margem de Contribuição Total:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(metricas.margemContribuicaoTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) Custos Fixos Totais (CIF Integral):</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(parseFloat(custosIndiretosFixosStr) || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span>(-) Despesas Fixas Administrativas:</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(parseFloat(despesasFixasAdmStr) || 0)}</span>
                  </div>
                </>
              )}

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                <span style={{ fontWeight: 'bold' }}>Resultado Operacional Final:</span>
                <strong style={{ fontSize: '15px', color: metricas.lucroOperacional >= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>
                  {formatMoeda(metricas.lucroOperacional)}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '11.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <span>Estoque Final: <strong>{metricas.estoqueFinalUnidades} un.</strong></span>
              <span>Valor em Balanço: <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(metricas.estoqueFinalValor)}</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* GUIA E BOTÃO DE INTEGRAÇÃO CONTÁBIL */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #2563eb', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 280px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
            <span>🧭</span> Integração com a Contabilidade Oficial (Absorção)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', maxWidth: '600px', wordBreak: 'break-word' }}>
            A contabilidade oficial (ITG 2000) exige o <strong>Custeio por Absorção</strong>. Ao finalizar a produção, o sistema alocará a Matéria-Prima, Mão de Obra e CIF no Estoque de Produtos Acabados.
          </p>
        </div>
        <button 
          onClick={handleApropriarCustos}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', transition: 'transform 0.1s', width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Apropriar Custos e Finalizar 🏭
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}