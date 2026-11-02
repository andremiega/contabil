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
  const [comissoesStr, setComissoesStr] = useState('1500.00'); 
  const [premiosStr, setPremiosStr] = useState('800.00');       

  // 4. Módulo de Férias e Abono Pecuniário
  const [incluirFerias, setIncluirFerias] = useState(false);
  const [diasFeriasGozadasStr, setDiasFeriasGozadasStr] = useState('20');
  const [venderAbono10Dias, setVenderAbono10Dias] = useState(true); 

  // 5. Módulo de 13º Salário
  const [modalidade13, setModalidade13] = useState('nenhum'); 

  // 6. Adicional Especial e Faltas
  const [tipoAdicional, setTipoAdicional] = useState('nenhum'); 
  const [salarioMinimo] = useState(1412.00);
  const [optanteVT, setOptanteVT] = useState(true);
  const [valorGastoVTStr, setValorGastoVTStr] = useState('280.00');
  const [diasFaltaStr, setDiasFaltaStr] = useState('0');

  // 7. Enquadramento da Empresa
  const [regimeEmpresa, setRegimeEmpresa] = useState('lucro_real_presumido'); 

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

  const fecharFolha = () => {
    if (typeof registrarFatoGerador !== 'function') return;

    const idDespSalario = planoContas.find(c => c.codigo_contabil === '5.2.01.01' || c.nome_conta.toLowerCase().includes('despesas com salário'))?.id;
    const idSalarioPagar = planoContas.find(c => c.codigo_contabil === '2.1.02.01' || c.nome_conta.toLowerCase().includes('salários a pagar'))?.id;
    const idInssRecolher = planoContas.find(c => c.nome_conta.toLowerCase().includes('inss a recolher'))?.id;
    const idFgtsDespesa = planoContas.find(c => c.nome_conta.toLowerCase().includes('fgts') && c.grupo.includes('Despesa'))?.id;
    const idFgtsRecolher = planoContas.find(c => c.nome_conta.toLowerCase().includes('fgts') && c.grupo.includes('Passivo'))?.id;

    const mesAtualFormatado = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    registrarFatoGerador(
      `Apropriação da Folha de Pagamento de ${mesAtualFormatado} - ${nomeEmpregado}`,
      descontos.salarioLiquido,
      'RH / Folha',
      [idDespSalario], 
      [idSalarioPagar] 
    );

    if (descontos.inssEmpregado > 0) {
      registrarFatoGerador(
        `Retenção de INSS s/ Folha de Pagamento - ${nomeEmpregado}`,
        descontos.inssEmpregado,
        'RH / Folha',
        [idDespSalario],
        [idInssRecolher]
      );
    }

    if (encargosEmpresa.fgtsMensal > 0) {
      registrarFatoGerador(
        `Apropriação de FGTS Patronal s/ Folha (8%) - ${nomeEmpregado}`,
        encargosEmpresa.fgtsMensal,
        'RH / Folha',
        [idFgtsDespesa],
        [idFgtsRecolher]
      );
    }

    if (encargosEmpresa.inssPatronal > 0) {
      const inssTotalPatronal = encargosEmpresa.inssPatronal + encargosEmpresa.ratAjustado + encargosEmpresa.terceirosSistemaS;
      registrarFatoGerador(
        `Apropriação de Encargos Previdenciários Patronais - ${nomeEmpregado}`,
        inssTotalPatronal,
        'RH / Folha',
        [idDespSalario], 
        [idInssRecolher]
      );
    }

    if (mostrarToast) mostrarToast('Folha fechada! Fatos geradores enviados para o Livro Diário.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>💼</span> Folha de Pagamento Completa (DP & Encargos)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Férias com 1/3, Abono Pecuniário, 13º Salário, Comissões com DSR, Prêmios e Encargos Patronais.
          </p>
        </div>

        {/* REGIME TRIBUTÁRIO DA EMPRESA */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setRegimeEmpresa('lucro_real_presumido')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: regimeEmpresa === 'lucro_real_presumido' ? '#0f172a' : 'transparent', color: regimeEmpresa === 'lucro_real_presumido' ? 'white' : '#64748b' }}
          >
            🏢 Regime Geral (27,8% + FGTS)
          </button>
          <button 
            onClick={() => setRegimeEmpresa('simples_anexo123')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: regimeEmpresa === 'simples_anexo123' ? '#2563eb' : 'transparent', color: regimeEmpresa === 'simples_anexo123' ? 'white' : '#64748b' }}
          >
            🏪 Simples (Isento Patronal)
          </button>
        </div>
      </div>

      {/* DASHBOARDS PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Remuneração Bruta Global</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(proventos.totalBruto)}</strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Base INSS: {formatMoeda(proventos.basePrevidenciaria)}</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Descontos</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(descontos.totalDescontos)}</strong>
          <span style={{ fontSize: '11px', color: '#991b1b', wordBreak: 'break-word' }}>INSS + IRRF + VT + Faltas</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Salário Líquido (A Pagar)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(descontos.salarioLiquido)}</strong>
          <span style={{ fontSize: '11px', color: '#166534', wordBreak: 'break-word' }}>Crédito em conta</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Total da Empresa</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(encargosEmpresa.custoTotalGeral)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Inclui encargos</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO MODULAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* COLUNA 1: DADOS FIXOS, VARIÁVEIS E COMISSÕES */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Salário, Comissões & Prêmios</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Salário Base (R$):</label>
              <input type="text" value={salarioBaseStr} onChange={e => setSalarioBaseStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Dependentes IRRF:</label>
              <input type="text" value={dependentesStr} onChange={e => setDependentesStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0', boxSizing: 'border-box', minWidth: 0 }}>
              <label style={{ ...labelStyle, color: '#059669' }}>Comissões (R$):</label>
              <input type="text" value={comissoesStr} onChange={e => setComissoesStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
              <span style={{ fontSize: '10.5px', color: '#065f46', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Gera DSR reflexo e INSS</span>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #bfdbfe', boxSizing: 'border-box', minWidth: 0 }}>
              <label style={{ ...labelStyle, color: '#2563eb' }}>Prêmios (R$):</label>
              <input type="text" value={premiosStr} onChange={e => setPremiosStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
              <span style={{ fontSize: '10.5px', color: '#1e40af', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Isento de INSS e FGTS</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Horas Extras 50% (Qtd):</label>
              <input type="text" value={horasExtras50Str} onChange={e => setHorasExtras50Str(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Faltas (Dias):</label>
              <input type="text" value={diasFaltaStr} onChange={e => setDiasFaltaStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ ...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fff5f5' }} />
            </div>
          </div>
        </div>

        {/* COLUNA 2: FÉRIAS COM 1/3, ABONO E 13º SALÁRIO */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Férias, Abono & 13º</h3>

          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', wordBreak: 'break-word' }}>
              <input type="checkbox" checked={incluirFerias} onChange={e => setIncluirFerias(e.target.checked)} style={{ flexShrink: 0 }} />
              Gozar Férias no Mês Atual (+ 1/3)
            </label>
            {incluirFerias && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', marginTop: '4px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ ...labelStyle, fontSize: '11px' }}>Dias Gozados:</label>
                  <input type="text" value={diasFeriasGozadasStr} onChange={e => setDiasFeriasGozadasStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <label style={{ fontSize: '11.5px', color: '#0f172a', cursor: 'pointer', wordBreak: 'break-word' }}>
                    <input type="checkbox" checked={venderAbono10Dias} onChange={e => setVenderAbono10Dias(e.target.checked)} style={{ marginRight: '6px' }} />
                    Vender 10 dias (Abono)
                  </label>
                </div>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box', minWidth: 0 }}>
            <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#0f172a' }}>Modalidade do 13º Salário:</label>
            <select value={modalidade13} onChange={e => setModalidade13(e.target.value)} style={{ ...inputStyle, backgroundColor: '#f8fafc' }}>
              <option value="nenhum">Nenhum pagamento no mês</option>
              <option value="primeira_parcela">1ª Parcela (50% Adiantamento)</option>
              <option value="segunda_parcela">2ª Parcela (Quitação c/ dedução)</option>
              <option value="provisao_mensal">Provisão Contábil Mensal (1/12)</option>
            </select>
          </div>
        </div>

        {/* COLUNA 3: HOLERITE COMPLETO */}
        <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ minWidth: 0 }}>
              <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>DEMONSTRATIVO DE PAGAMENTO</strong>
              <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>{nomeEmpregado}</span>
            </div>
            <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>FOLHA</span>
          </div>

          <div style={{ overflowX: 'auto', boxSizing: 'border-box', marginTop: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '320px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                  <th style={{ padding: '8px' }}>Evento</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#16a34a' }}>Proventos</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>001 - Dias Trabalhados</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(proventos.salarioEfetivo)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                </tr>
                {proventos.valorComissao > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>005 - Comissões de Vendas</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(proventos.valorComissao)}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                  </tr>
                )}
                {incluirFerias && proventos.valorFeriasGozadas > 0 && (
                  <>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>010 - Férias Gozadas</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(proventos.valorFeriasGozadas)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>011 - 1/3 de Férias</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(proventos.tercoConstitucional)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    </tr>
                  </>
                )}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>501 - INSS Empregado</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(descontos.inssEmpregado)}</td>
                </tr>
                {descontos.irrfEmpregado > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', wordBreak: 'break-word' }}>505 - IRRF s/ Salário</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(descontos.irrfEmpregado)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* BOTÃO DE INTEGRAÇÃO CONTÁBIL */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #2563eb', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 280px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
            <span>🚀</span> Integração Contábil (Fim do Mês)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', maxWidth: '600px', wordBreak: 'break-word' }}>
            Ao fechar a folha, o sistema envia os Fatos Geradores para o Livro Diário. Se estiver em Modo Manual, eles irão para a fila de pendências.
          </p>
        </div>
        <button 
          onClick={fecharFolha}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', transition: 'transform 0.1s', width: '100%', maxWidth: '340px', boxSizing: 'border-box' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Fechar Folha do Mês e Contabilizar ✍️
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}