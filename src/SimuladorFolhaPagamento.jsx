import React, { useState, useEffect } from 'react';

export default function SimuladorFolhaPagamento({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Dados Básicos do Colaborador
  const [nomeEmpregado, setNomeEmpregado] = useState('Carlos Eduardo Silveira');
  const [cargoEmpregado, setCargoEmpregado] = useState('Consultor Comercial & Contábil');
  const [salarioBaseStr, setSalarioBaseStr] = useState('5000.00');
  const [dependentesStr, setDependentesStr] = useState('1');

  // 2. Horas Extras e DSR
  const [horasExtras50Str, setHorasExtras50Str] = useState('8');
  const [horasExtras100Str, setHorasExtras100Str] = useState('0');
  const [diasUteisMesStr, setDiasUteisMesStr] = useState('25');
  const [domingosFeriadosStr, setDomingosFeriadosStr] = useState('5');

  // 3. Comissões e Prêmios
  const [comissoesStr, setComissoesStr] = useState('1500.00'); // Incide INSS, FGTS e IRRF
  const [premiosStr, setPremiosStr] = useState('800.00');       // Lei 13.467/2017: Não integra salário de contribuição previdenciária

  // 4. Módulo de Férias e Abono Pecuniário
  const [incluirFerias, setIncluirFerias] = useState(false);
  const [diasFeriasGozadasStr, setDiasFeriasGozadasStr] = useState('20');
  const [venderAbono10Dias, setVenderAbono10Dias] = useState(true); // Venda de 10 dias (isento de INSS/FGTS)

  // 5. Módulo de 13º Salário
  const [modalidade13, setModalidade13] = useState('nenhum'); // 'nenhum', 'primeira_parcela' (50% sem desconto), 'segunda_parcela' (integral c/ desconto da 1ª), 'provisao_mensal' (1/12)

  // 6. Adicional Especial e Faltas
  const [tipoAdicional, setTipoAdicional] = useState('nenhum'); // 'nenhum', 'periculosidade' (30%), 'insalubridade_min' (10%), 'insalubridade_med' (20%), 'insalubridade_max' (40%)
  const [salarioMinimo] = useState(1412.00);
  const [optanteVT, setOptanteVT] = useState(true);
  const [valorGastoVTStr, setValorGastoVTStr] = useState('280.00');
  const [diasFaltaStr, setDiasFaltaStr] = useState('0');

  // 7. Enquadramento da Empresa
  const [regimeEmpresa, setRegimeEmpresa] = useState('lucro_real_presumido'); // 'lucro_real_presumido' ou 'simples_anexo123'

  // Estados dos Resultados
  const [proventos, setProventos] = useState({
    salarioEfetivo: 0, valorHE50: 0, valorHE100: 0, valorDSRHE: 0, valorComissao: 0, valorDSRComissao: 0,
    valorPremio: 0, valorAdicional: 0, valorFeriasGozadas: 0, tercoConstitucional: 0, valorAbonoPecuniario: 0,
    tercoAbono: 0, valorDecimoTerceiro: 0, totalBruto: 0, basePrevidenciaria: 0, baseFGTS: 0
  });

  const [descontos, setDescontos] = useState({
    faltas: 0, inssEmpregado: 0, irrfEmpregado: 0, valeTransporte: 0, adiantamento13: 0, totalDescontos: 0, salarioLiquido: 0
  });

  const [encargosEmpresa, setEncargosEmpresa] = useState({
    fgtsMensal: 0, inssPatronal: 0, ratAjustado: 0, terceirosSistemaS: 0, custoTotalPatronal: 0, custoTotalGeral: 0
  });

  // Tabela Progressiva do INSS
  const calcularInssProgressivo = (baseInss) => {
    const teto = 7786.02;
    const base = Math.min(baseInss, teto);
    let inss = 0;
    if (base > 0) inss += Math.min(base, 1412.00) * 0.075;
    if (base > 1412.00) inss += (Math.min(base, 2666.68) - 1412.00) * 0.09;
    if (base > 2666.68) inss += (Math.min(base, 4000.03) - 2666.68) * 0.12;
    if (base > 4000.03) inss += (Math.min(base, 7786.02) - 4000.03) * 0.14;
    return inss;
  };

  // Tabela Progressiva do IRRF
  const calcularIrrfProgressivo = (baseIrrf) => {
    if (baseIrrf <= 2259.20) return 0;
    if (baseIrrf <= 2826.65) return (baseIrrf * 0.075) - 169.44;
    if (baseIrrf <= 3751.05) return (baseIrrf * 0.150) - 381.44;
    if (baseIrrf <= 4664.68) return (baseIrrf * 0.225) - 662.77;
    return (baseIrrf * 0.275) - 896.00;
  };

  useEffect(() => {
    const salBase = parseFloat(salarioBaseStr) || 0;
    const he50 = parseFloat(horasExtras50Str) || 0;
    const he100 = parseFloat(horasExtras100Str) || 0;
    const diasUteis = parseInt(diasUteisMesStr, 10) || 25;
    const domFeriados = parseInt(domingosFeriadosStr, 10) || 5;
    const comissao = parseFloat(comissoesStr) || 0;
    const premio = parseFloat(premiosStr) || 0;
    const diasFerias = incluirFerias ? (parseInt(diasFeriasGozadasStr, 10) || 0) : 0;
    const depQtd = parseInt(dependentesStr, 10) || 0;
    const faltasQtd = parseInt(diasFaltaStr, 10) || 0;
    const gastoVT = parseFloat(valorGastoVTStr) || 0;

    const valorHora = salBase > 0 ? (salBase / 220) : 0;
    const vHE50 = he50 * (valorHora * 1.5);
    const vHE100 = he100 * (valorHora * 2.0);
    const vDSRHE = diasUteis > 0 ? ((vHE50 + vHE100) / diasUteis) * domFeriados : 0;
    const vDSRComissao = diasUteis > 0 ? (comissao / diasUteis) * domFeriados : 0;

    let vAdicional = 0;
    if (tipoAdicional === 'periculosidade') vAdicional = salBase * 0.30;
    else if (tipoAdicional === 'insalubridade_min') vAdicional = salarioMinimo * 0.10;
    else if (tipoAdicional === 'insalubridade_med') vAdicional = salarioMinimo * 0.20;
    else if (tipoAdicional === 'insalubridade_max') vAdicional = salarioMinimo * 0.40;

    let vFerias = 0, vTercoFerias = 0, vAbono = 0, vTercoAbono = 0;
    let diasTrabalhadosMes = Math.max(0, 30 - diasFerias);
    const valorDiaSalario = salBase / 30;
    const salarioTrabalhado = valorDiaSalario * diasTrabalhadosMes;

    if (incluirFerias && diasFerias > 0) {
      vFerias = valorDiaSalario * diasFerias;
      vTercoFerias = vFerias / 3;
      if (venderAbono10Dias) {
        vAbono = valorDiaSalario * 10;
        vTercoAbono = vAbono / 3;
      }
    }

    let v13 = 0, descontoAdiantamento13 = 0;
    if (modalidade13 === 'primeira_parcela') v13 = salBase * 0.50;
    else if (modalidade13 === 'segunda_parcela') { v13 = salBase; descontoAdiantamento13 = salBase * 0.50; }
    else if (modalidade13 === 'provisao_mensal') v13 = salBase / 12;

    const totalBruto = salarioTrabalhado + vFerias + vTercoFerias + vAbono + vTercoAbono + vHE50 + vHE100 + vDSRHE + comissao + vDSRComissao + premio + vAdicional + (modalidade13 === 'primeira_parcela' || modalidade13 === 'segunda_parcela' ? v13 : 0);

    const baseINSS = Math.max(0, totalBruto - (vAbono + vTercoAbono) - premio - (modalidade13 === 'primeira_parcela' ? v13 : 0));
    const baseFGTS = Math.max(0, totalBruto - (vAbono + vTercoAbono) - premio);

    const vFaltas = faltasQtd * valorDiaSalario;
    const vInss = calcularInssProgressivo(baseINSS);
    const deducaoDependentes = depQtd * 189.59;
    const baseIRRF = Math.max(0, baseINSS - vInss - deducaoDependentes);
    const vIrrf = Math.max(0, calcularIrrfProgressivo(baseIRRF));
    const vVT = optanteVT ? Math.min(salBase * 0.06, gastoVT) : 0;

    const totalDescontos = vFaltas + vInss + vIrrf + vVT + descontoAdiantamento13;
    const salarioLiq = Math.max(0, totalBruto - totalDescontos);

    const fgts = baseFGTS * 0.08;
    let inssPatr = 0, rat = 0, terceiros = 0;

    if (regimeEmpresa === 'lucro_real_presumido') {
      inssPatr = baseINSS * 0.20;
      rat = baseINSS * 0.02;
      terceiros = baseINSS * 0.058;
    }

    const custoPatronal = fgts + inssPatr + rat + terceiros;

    setProventos({ salarioEfetivo: salarioTrabalhado, valorHE50: vHE50, valorHE100: vHE100, valorDSRHE: vDSRHE, valorComissao: comissao, valorDSRComissao: vDSRComissao, valorPremio: premio, valorAdicional: vAdicional, valorFeriasGozadas: vFerias, tercoConstitucional: vTercoFerias, valorAbonoPecuniario: vAbono, tercoAbono: vTercoAbono, valorDecimoTerceiro: v13, totalBruto, basePrevidenciaria: baseINSS, baseFGTS });
    setDescontos({ faltas: vFaltas, inssEmpregado: vInss, irrfEmpregado: vIrrf, valeTransporte: vVT, adiantamento13: descontoAdiantamento13, totalDescontos, salarioLiquido: salarioLiq });
    setEncargosEmpresa({ fgtsMensal: fgts, inssPatronal: inssPatr, ratAjustado: rat, terceirosSistemaS: terceiros, custoTotalPatronal: custoPatronal, custoTotalGeral: totalBruto + custoPatronal });

  }, [salarioBaseStr, horasExtras50Str, horasExtras100Str, diasUteisMesStr, domingosFeriadosStr, comissoesStr, premiosStr, incluirFerias, diasFeriasGozadasStr, venderAbono10Dias, modalidade13, tipoAdicional, dependentesStr, optanteVT, valorGastoVTStr, diasFaltaStr, regimeEmpresa]);

  // ==========================================================
  // FUNÇÃO DE INTEGRAÇÃO COM O LIVRO DIÁRIO
  // ==========================================================
  const fecharFolha = () => {
    if (typeof registrarFatoGerador !== 'function') return;

    // Busca rápida dos IDs das contas no plano de contas do banco
    const idDespSalario = planoContas.find(c => c.codigo_contabil === '5.2.01.01' || c.nome_conta.toLowerCase().includes('despesas com salário'))?.id;
    const idSalarioPagar = planoContas.find(c => c.codigo_contabil === '2.1.02.01' || c.nome_conta.toLowerCase().includes('salários a pagar'))?.id;
    const idInssRecolher = planoContas.find(c => c.nome_conta.toLowerCase().includes('inss a recolher'))?.id;
    const idFgtsDespesa = planoContas.find(c => c.nome_conta.toLowerCase().includes('fgts') && c.grupo.includes('Despesa'))?.id;
    const idFgtsRecolher = planoContas.find(c => c.nome_conta.toLowerCase().includes('fgts') && c.grupo.includes('Passivo'))?.id;

    const mesAtualFormatado = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Fato Gerador 1: Apropriação do Salário e Descontos (INSS/IRRF)
    registrarFatoGerador(
      `Apropriação da Folha de Pagamento de ${mesAtualFormatado} - ${nomeEmpregado}`,
      descontos.salarioLiquido,
      'RH / Folha',
      [idDespSalario], // Débito na DRE
      [idSalarioPagar] // Crédito no Passivo
    );

    // Fato Gerador 2: Retenção de INSS do Empregado
    if (descontos.inssEmpregado > 0) {
      registrarFatoGerador(
        `Retenção de INSS s/ Folha de Pagamento - ${nomeEmpregado}`,
        descontos.inssEmpregado,
        'RH / Folha',
        [idDespSalario],
        [idInssRecolher]
      );
    }

    // Fato Gerador 3: FGTS Patronal
    if (encargosEmpresa.fgtsMensal > 0) {
      registrarFatoGerador(
        `Apropriação de FGTS Patronal s/ Folha (8%) - ${nomeEmpregado}`,
        encargosEmpresa.fgtsMensal,
        'RH / Folha',
        [idFgtsDespesa],
        [idFgtsRecolher]
      );
    }

    // Fato Gerador 4: INSS Patronal (Se Lucro Presumido/Real)
    if (encargosEmpresa.inssPatronal > 0) {
      const inssTotalPatronal = encargosEmpresa.inssPatronal + encargosEmpresa.ratAjustado + encargosEmpresa.terceirosSistemaS;
      registrarFatoGerador(
        `Apropriação de Encargos Previdenciários Patronais (INSS/RAT/Terceiros) - ${nomeEmpregado}`,
        inssTotalPatronal,
        'RH / Folha',
        [idDespSalario], // Sugestão simplificada: agrupar em despesa com pessoal
        [idInssRecolher]
      );
    }

    if (mostrarToast) mostrarToast('Folha fechada! Fatos geradores enviados para o Livro Diário.', 'sucesso');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>💼</span> Folha de Pagamento Completa (DP & Encargos)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Férias com 1/3, Abono Pecuniário, 13º Salário, Comissões com DSR, Prêmios e Encargos Patronais.
          </p>
        </div>

        {/* REGIME TRIBUTÁRIO DA EMPRESA */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => setRegimeEmpresa('lucro_real_presumido')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: regimeEmpresa === 'lucro_real_presumido' ? '#0f172a' : 'transparent', color: regimeEmpresa === 'lucro_real_presumido' ? 'white' : '#64748b' }}
          >
            🏢 Regime Geral (27,8% Patronal + FGTS)
          </button>
          <button 
            onClick={() => setRegimeEmpresa('simples_anexo123')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: regimeEmpresa === 'simples_anexo123' ? '#2563eb' : 'transparent', color: regimeEmpresa === 'simples_anexo123' ? 'white' : '#64748b' }}
          >
            🏪 Simples Nacional (Isento Patronal)
          </button>
        </div>
      </div>

      {/* DASHBOARDS PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Remuneração Bruta Global</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(proventos.totalBruto)}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Base INSS: {formatMoeda(proventos.basePrevidenciaria)}</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Descontos</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(descontos.totalDescontos)}</strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>INSS + IRRF + VT + Faltas</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Salário Líquido (A Pagar)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(descontos.salarioLiquido)}</strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Crédito em conta do empregado</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Total da Empresa</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(encargosEmpresa.custoTotalGeral)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Inclui {formatMoeda(encargosEmpresa.custoTotalPatronal)} de tributos</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO MODULAR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* COLUNA 1: DADOS FIXOS, VARIÁVEIS E COMISSÕES */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Salário, Comissões & Prêmios</h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Salário Base Contratual (R$):
              <input type="text" value={salarioBaseStr} onChange={e => setSalarioBaseStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Dependentes IRRF:
              <input type="text" value={dependentesStr} onChange={e => setDependentesStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
              Comissões de Vendas (R$):
              <input type="text" value={comissoesStr} onChange={e => setComissoesStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', fontSize: '13px' }} />
              <span style={{ fontSize: '10px', color: '#065f46', marginTop: '2px' }}>Gera DSR reflexo e INSS</span>
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>
              Prêmios / Gratificações (R$):
              <input type="text" value={premiosStr} onChange={e => setPremiosStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', fontSize: '13px' }} />
              <span style={{ fontSize: '10px', color: '#1e40af', marginTop: '2px' }}>Isento de INSS e FGTS (CLT)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Horas Extras 50% (Qtd):
              <input type="text" value={horasExtras50Str} onChange={e => setHorasExtras50Str(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Faltas (Dias):
              <input type="text" value={diasFaltaStr} onChange={e => setDiasFaltaStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff5f5', fontSize: '13px' }} />
            </label>
          </div>
        </div>

        {/* COLUNA 2: FÉRIAS COM 1/3, ABONO E 13º SALÁRIO */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Férias, Abono & 13º</h3>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
              <input type="checkbox" checked={incluirFerias} onChange={e => setIncluirFerias(e.target.checked)} />
              Gozar Férias no Mês Atual (+ 1/3)
            </label>
            {incluirFerias && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Dias Gozados:<input type="text" value={diasFeriasGozadasStr} onChange={e => setDiasFeriasGozadasStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '6px', marginTop: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }} /></label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0f172a', cursor: 'pointer', marginTop: '16px' }}><input type="checkbox" checked={venderAbono10Dias} onChange={e => setVenderAbono10Dias(e.target.checked)} /> Vender 10 dias (Abono)</label>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Modalidade do 13º Salário:</label>
            <select value={modalidade13} onChange={e => setModalidade13(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc' }}>
              <option value="nenhum">Nenhum pagamento no mês</option>
              <option value="primeira_parcela">1ª Parcela (50% Adiantamento - sem descontos)</option>
              <option value="segunda_parcela">2ª Parcela (Quitação com dedução da 1ª e encargos)</option>
              <option value="provisao_mensal">Apenas Provisão Contábil Mensal (1/12)</option>
            </select>
          </div>
        </div>

        {/* COLUNA 3: HOLERITE COMPLETO */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>DEMONSTRATIVO DE PAGAMENTO</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{nomeEmpregado}</span>
              </div>
              <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>FOLHA</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '8px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Evento</th>
                  <th style={{ padding: '6px', textAlign: 'right', color: '#16a34a' }}>Proventos</th>
                  <th style={{ padding: '6px', textAlign: 'right', color: '#dc2626' }}>Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>001 - Dias Trabalhados</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(proventos.salarioEfetivo)}</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td></tr>
                {proventos.valorComissao > 0 && <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>005 - Comissões de Vendas</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(proventos.valorComissao)}</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td></tr>}
                {incluirFerias && proventos.valorFeriasGozadas > 0 && (
                  <>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>010 - Férias Gozadas</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(proventos.valorFeriasGozadas)}</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td></tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>011 - 1/3 de Férias</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(proventos.tercoConstitucional)}</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td></tr>
                  </>
                )}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>501 - INSS Empregado</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#dc2626' }}>{formatMoeda(descontos.inssEmpregado)}</td></tr>
                {descontos.irrfEmpregado > 0 && <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '5px 6px' }}>505 - IRRF s/ Salário</td><td style={{ padding: '5px 6px', textAlign: 'right' }}>-</td><td style={{ padding: '5px 6px', textAlign: 'right', color: '#dc2626' }}>{formatMoeda(descontos.irrfEmpregado)}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTÃO DE INTEGRAÇÃO CONTÁBIL (O SISTEMA NERVOSO) */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #2563eb', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚀</span> Integração Contábil (Fim do Mês)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', maxWidth: '600px' }}>
            Ao fechar a folha, o sistema envia os Fatos Geradores para o Livro Diário. Se estiver em Modo Manual, eles irão para a fila de pendências do Tutor Analítico.
          </p>
        </div>
        <button 
          onClick={fecharFolha}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', transition: 'transform 0.1s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Fechar Folha do Mês e Contabilizar ✍️
        </button>
      </div>

    </div>
  );
}