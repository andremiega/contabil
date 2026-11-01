import React, { useState, useEffect } from 'react';

export default function SimuladorCustos({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Método de Custeio: 'absorcao' (Societário/Fiscal) ou 'variavel' (Gerencial)
  const [metodoCusteio, setMetodoCusteio] = useState('absorcao');

  // Parâmetros de Produção e Vendas (Inputs em String para não travar no zero com Backspace)
  const [volumeProduzidoStr, setVolumeProduzidoStr] = useState('1000'); // Unidades produzidas
  const [volumeVendidoStr, setVolumeVendidoStr] = useState('800');    // Unidades vendidas
  const [precoVendaUnitStr, setPrecoVendaUnitStr] = useState('150.00');

  // Custos Diretos / Variáveis de Fabricação
  const [materiaPrimaUnitStr, setMateriaPrimaUnitStr] = useState('45.00'); // MP por unidade
  const [maoObraDiretaUnitStr, setMaoObraDiretaUnitStr] = useState('25.00'); // MOD por unidade
  const [despesaVariavelUnitStr, setDespesaVariavelUnitStr] = useState('10.00'); // Comissões/fretes variáveis

  // Custos e Despesas Fixos Totais do Período
  const [custosIndiretosFixosStr, setCustosIndiretosFixosStr] = useState('25000.00'); // Aluguel fábrica, depreciação, supervisão
  const [despesasFixasAdmStr, setDespesasFixasAdmStr] = useState('15000.00'); // Salários adm, contabilidade, marketing
  const [custoOportunidadeStr, setCustoOportunidadeStr] = useState('5000.00'); // Lucro desejado para Ponto de Equilíbrio Econômico

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

    const cUnitAbsorcao = mpUnit + modUnit + cifUnitarioRateado; // Absorção leva CIF para o produto
    const cUnitVariavel = mpUnit + modUnit; // Variável considera apenas custos variáveis no produto

    // 2. Faturamento e CPV
    const receitaTotal = qtdVend * precoVenda;
    const qtdEstoqueFinal = Math.max(0, qtdProd - qtdVend);

    // Margem de Contribuição Unitária = Preço - (Custos Variáveis + Despesas Variáveis)
    const mcUnit = precoVenda - (mpUnit + modUnit + despVarUnit);
    const mcTotal = mcUnit * qtdVend;

    // Pontos de Equilíbrio (em unidades e receita)
    const custosEDespesasFixasTotais = cifFixoTotal + despFixaAdmTotal;
    const pecQtd = mcUnit > 0 ? Math.ceil(custosEDespesasFixasTotais / mcUnit) : 0;
    const pecValor = pecQtd * precoVenda;
    const peeQtd = mcUnit > 0 ? Math.ceil((custosEDespesasFixasTotais + lucroDesejado) / mcUnit) : 0;

    // DRE comparativa conforme método
    let cpvTotalCalculado = 0;
    let lucroResultado = 0;
    let valorEstoqueFinal = 0;

    if (metodoCusteio === 'absorcao') {
      cpvTotalCalculado = qtdVend * cUnitAbsorcao;
      const despesasPeriodo = (qtdVend * despVarUnit) + despFixaAdmTotal;
      lucroResultado = receitaTotal - cpvTotalCalculado - despesasPeriodo;
      valorEstoqueFinal = qtdEstoqueFinal * cUnitAbsorcao; // CIF retido no estoque
    } else {
      // Custeio Variável
      const custoVariavelVendido = qtdVend * cUnitVariavel;
      const despesaVariavelTotal = qtdVend * despVarUnit;
      cpvTotalCalculado = custoVariavelVendido;
      // CIF fixo e Despesas fixas vão diretamente para o resultado como custo do período
      lucroResultado = mcTotal - custosEDespesasFixasTotais;
      valorEstoqueFinal = qtdEstoqueFinal * cUnitVariavel; // Nenhum CIF no estoque
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

    // A contabilidade oficial (Livro Diário) usa Custeio por Absorção
    const totalMP = qtdProd * (parseFloat(materiaPrimaUnitStr) || 0);
    const totalMOD = qtdProd * (parseFloat(maoObraDiretaUnitStr) || 0);
    const totalCIF = parseFloat(custosIndiretosFixosStr) || 0;

    const idEstoquePA = planoContas.find(c => c.nome_conta.toLowerCase().includes('produtos acabados') || c.nome_conta.toLowerCase().includes('estoque'))?.id;
    const idEstoqueMP = planoContas.find(c => c.nome_conta.toLowerCase().includes('matéria') || c.nome_conta.toLowerCase().includes('insumo'))?.id || idEstoquePA;
    const idSalariosPagar = planoContas.find(c => c.nome_conta.toLowerCase().includes('salários a pagar') || c.codigo_contabil === '2.1.02.01')?.id;
    const idContasPagar = planoContas.find(c => c.nome_conta.toLowerCase().includes('fornecedores') || c.codigo_contabil === '2.1.01.01')?.id;

    // Gera pendências na ordem da produção
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏭</span> Gestão e Contabilidade de Custos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Custeio por Absorção vs. Custeio Variável, Margem de Contribuição e Ponto de Equilíbrio (Break-Even).
          </p>
        </div>

        {/* SELETOR DE MÉTODO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => setMetodoCusteio('absorcao')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoCusteio === 'absorcao' ? '#0f172a' : 'transparent', color: metodoCusteio === 'absorcao' ? 'white' : '#64748b' }}
          >
            📘 Custeio por Absorção (Societário / IRPJ)
          </button>
          <button 
            onClick={() => setMetodoCusteio('variavel')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoCusteio === 'variavel' ? '#2563eb' : 'transparent', color: metodoCusteio === 'variavel' ? 'white' : '#64748b' }}
          >
            📊 Custeio Variável (Decisão / Gerencial)
          </button>
        </div>
      </div>

      {/* DASHBOARDS PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Unitário de Produção</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(metodoCusteio === 'absorcao' ? metricas.custoUnitarioAbsorcao : metricas.custoUnitarioVariavel)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {metodoCusteio === 'absorcao' ? 'MP + MOD + CIF Rateado' : 'Apenas Custos Variáveis (MP + MOD)'}
          </span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Margem de Contribuição (Unit.)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(metricas.margemContribuicaoUnit)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>
            Total: {formatMoeda(metricas.margemContribuicaoTotal)}
          </span>
        </div>

        <div style={{ backgroundColor: metricas.lucroOperacional >= 0 ? '#f0fdf4' : '#fff5f5', padding: '18px', borderRadius: '12px', border: `1px solid ${metricas.lucroOperacional >= 0 ? '#86efac' : '#fecaca'}`, borderLeft: `4px solid ${metricas.lucroOperacional >= 0 ? '#16a34a' : '#ef4444'}` }}>
          <span style={{ color: metricas.lucroOperacional >= 0 ? '#166534' : '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Lucro Operacional Líquido</span>
          <strong style={{ display: 'block', color: metricas.lucroOperacional >= 0 ? '#15803d' : '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(metricas.lucroOperacional)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Método: {metodoCusteio === 'absorcao' ? 'Absorção' : 'Variável'}</span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ponto de Equilíbrio Contábil</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '24px', marginTop: '4px' }}>
            {metricas.pontoEquilibrioContabilQtd} un.
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Faturamento mínimo: {formatMoeda(metricas.pontoEquilibrioContabilVal)}</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E DRE GERENCIAL */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* PARÂMETROS OPERACIONAIS */}
        <div style={{ flex: '1 1 350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Volumes e Estrutura de Custos</h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Produção (Unidades):
              <input type="text" value={volumeProduzidoStr} onChange={e => setVolumeProduzidoStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Vendas (Unidades):
              <input type="text" value={volumeVendidoStr} onChange={e => setVolumeVendidoStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>
            Preço de Venda Unitário (R$):
            <input type="text" value={precoVendaUnitStr} onChange={e => setPrecoVendaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #86efac', backgroundColor: '#f0fdf4', fontSize: '13px' }} />
          </label>

          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Matéria-Prima Unit. (R$):
              <input type="text" value={materiaPrimaUnitStr} onChange={e => setMateriaPrimaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Mão de Obra Direta Unit. (R$):
              <input type="text" value={maoObraDiretaUnitStr} onChange={e => setMaoObraDiretaUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
              Custos Indiretos Fixos Totais (R$):
              <input type="text" value={custosIndiretosFixosStr} onChange={e => setCustosIndiretosFixosStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Despesas Fixas Totais (R$):
              <input type="text" value={despesasFixasAdmStr} onChange={e => setDespesasFixasAdmStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>
        </div>

        {/* DEMONSTRATIVO DE RESULTADO (DRE COMPARATIVA) */}
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                DRE: {metodoCusteio === 'absorcao' ? 'Custeio por Absorção' : 'Custeio Variável'}
              </strong>
              <span style={{ backgroundColor: metodoCusteio === 'absorcao' ? '#0f172a' : '#2563eb', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                {metodoCusteio === 'absorcao' ? 'FISCAL / SOCIETÁRIO' : 'GERENCIAL'}
              </span>
            </div>

            <div style={{ padding: '10px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>(+) Receita Bruta de Vendas ({volumeVendidoStr} un.):</span>
                <strong style={{ color: '#16a34a' }}>{formatMoeda(metricas.receitaBrutaVendas)}</strong>
              </div>

              {metodoCusteio === 'absorcao' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) CPV (Custo dos Produtos Vendidos):</span>
                    <span>{formatMoeda(metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
                    <span>(=) Lucro Bruto Operacional:</span>
                    <span>{formatMoeda(metricas.receitaBrutaVendas - metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) Despesas Comerciais e Administrativas:</span>
                    <span>{formatMoeda((parseFloat(volumeVendidoStr) || 0) * (parseFloat(despesaVariavelUnitStr) || 0) + (parseFloat(despesasFixasAdmStr) || 0))}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) Custos Variáveis dos Produtos Vendidos:</span>
                    <span>{formatMoeda(metricas.cpvTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) Despesas Variáveis de Vendas:</span>
                    <span>{formatMoeda((parseFloat(volumeVendidoStr) || 0) * (parseFloat(despesaVariavelUnitStr) || 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '4px', color: '#2563eb' }}>
                    <span>(=) Margem de Contribuição Total:</span>
                    <span>{formatMoeda(metricas.margemContribuicaoTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) Custos Fixos Totais (CIF Integral):</span>
                    <span>{formatMoeda(parseFloat(custosIndiretosFixosStr) || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>(-) Despesas Fixas Administrativas:</span>
                    <span>{formatMoeda(parseFloat(despesasFixasAdmStr) || 0)}</span>
                  </div>
                </>
              )}

              <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>Resultado Operacional Final:</span>
                <strong style={{ fontSize: '16px', color: metricas.lucroOperacional >= 0 ? '#16a34a' : '#dc2626' }}>
                  {formatMoeda(metricas.lucroOperacional)}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Estoque de Acabados Final: <strong>{metricas.estoqueFinalUnidades} un.</strong></span>
              <span>Valor em Balanço: <strong>{formatMoeda(metricas.estoqueFinalValor)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* GUIA E BOTÃO DE INTEGRAÇÃO CONTÁBIL */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #2563eb', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧭</span> Integração com a Contabilidade Oficial (Absorção)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', maxWidth: '600px' }}>
            A contabilidade oficial (ITG 2000) exige o <strong>Custeio por Absorção</strong>. Ao finalizar a produção, o sistema alocará a Matéria-Prima, Mão de Obra e CIF no Estoque de Produtos Acabados.
          </p>
        </div>
        <button 
          onClick={handleApropriarCustos}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', transition: 'transform 0.1s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Apropriar Custos e Finalizar Produção 🏭
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}