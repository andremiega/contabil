import { useState } from 'react';

export default function SimuladorEmissaoNotas({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  // Controle de Abas Internas: 'emissor' | 'danfe' | 'contabil' | 'apuracao' | 'json'
  const [abaInterna, setAbaInterna] = useState('emissor');

  // Seletor das 8 Regras de Negócio da Reforma Tributária
  const [regraAtiva, setRegraAtiva] = useState('regra1');

  // 1. BLOCO A: Estado dos Dados Gerais e Parâmetros da Transição
  const [dadosGerais, setDadosGerais] = useState({
    idSimulacao: 'SIM-2026-99812A',
    anoFiscal: 2030,
    modeloDoc: '55', // '55' (NF-e), '65' (NFC-e), 'NFSE' (NFS-e Nacional)
    tipoOperacao: 'SAIDA_VENDA', // 'SAIDA_VENDA', 'ENTRADA_COMPRA', 'DEVOLUCAO_ESTORNO'
    perfilEmissor: 'LUCRO_REAL', // 'LUCRO_REAL', 'SIMPLES_TRADICIONAL', 'SIMPLES_HIBRIDO'
    ufOrigem: 'SP',
    ufDestino: 'SP',
    destinatarioDoc: '12.345.678/0001-90',
    destinatarioNome: 'INDÚSTRIA METALÚRGICA PAULISTA LTDA',
    enderecoEntrega: 'Rua Ponta Negra, 100 - Parque do Agreste, Vargem Grande Paulista/SP',
    codigoItem: '9403.60.00', // NCM ou NBS
    descricaoItem: 'Móvel de Apoio Industrial em Aço e Madeira',
    quantidade: 10,
    valorUnitarioLiquido: 1000.00,
    valorFreteLiquido: 200.00,
    chaveReferenciada: '3526024891234500018855001000039211839201928',
    motivoEstorno: '01 - Devolução de mercadoria / Anulação de débitos de IBS e CBS',
    splitPayment: true
  });

  // 2. BLOCO B & C: Alíquotas e Classificações Tributárias
  const [parametrosFiscais, setParametrosFiscais] = useState({
    aliqIcms: 18.0,
    aliqIss: 5.0,
    aliqPis: 1.65,
    aliqCofins: 7.60,
    aliqIpi: 5.0,
    cClassTrib: '000001 - Tributação Integral Padrão (Bens e Serviços)',
    cstIbsCbs: '00 - Tributação Integral',
    incideImpostoSeletivo: false,
    aliqIs: 0.0, 
    aliqCbsPadrao: 8.80,
    aliqIbsPadrao: 17.70,
    redutorAliquotaPct: 0.0, 
    aliqCreditoSimplesIbs: 2.50,
    aliqCreditoSimplesCbs: 1.25
  });

  // 3. Estado do Livro de Apuração Assistida
  const [historicoNotas, setHistoricoNotas] = useState([
    {
      id: 'DOC-INICIAL-01',
      tipo: 'ENTRADA_COMPRA',
      modelo: '55 - NF-e',
      parceiro: 'MADEIREIRA E AÇO FORTE LTDA (Lucro Real)',
      baseIva: 4000.00,
      cbsValor: 352.00,
      ibsValor: 708.00,
      splitQuitado: true,
      regra: 'Insumos c/ Crédito Pleno'
    },
    {
      id: 'DOC-INICIAL-02',
      tipo: 'ENTRADA_COMPRA',
      modelo: '55 - NF-e',
      parceiro: 'EMBALAGENS EXPRESS ME (Simples Tradicional)',
      baseIva: 1000.00,
      cbsValor: 12.50,
      ibsValor: 25.00,
      splitQuitado: true,
      regra: 'Crédito Reduzido (DAS)'
    }
  ]);

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  // =========================================================================
  // CATÁLOGO DAS 8 REGRAS DE NEGÓCIO (PRESETS AUTOMÁTICOS)
  // =========================================================================
  const catalogoRegras = [
    {
      id: 'regra1', badge: 'Regra 1', titulo: '🏢 Comércio: Lucro Real / Presumido',
      desc: 'Calcula ICMS/PIS/COFINS por dentro + IPI e destaca IBS/CBS cheios por fora.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '9403.60.00', descricaoItem: 'Móvel de Apoio Industrial em Aço e Madeira', quantidade: 10, valorUnitarioLiquido: 1000, valorFreteLiquido: 200 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 5.0, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral' }));
      }
    },
    {
      id: 'regra2', badge: 'Regra 2', titulo: '🏪 Comércio: Simples Tradicional (DAS)',
      desc: 'Impostos antigos e novos zerados no destaque principal. Transfere apenas crédito reduzido.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_TRADICIONAL', codigoItem: '9403.60.00', descricaoItem: 'Kit Organizador de Escritório Minimalista', quantidade: 5, valorUnitarioLiquido: 400, valorFreteLiquido: 50 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '41 - Simples Nacional (Recolhimento no DAS)' }));
      }
    },
    {
      id: 'regra3', badge: 'Regra 3', titulo: '⚡ Comércio: Simples Nacional Híbrido',
      desc: 'Impostos antigos no DAS, mas destaca IBS + CBS cheios por fora (~26,5%) para crédito B2B total.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_HIBRIDO', codigoItem: '9403.60.00', descricaoItem: 'Estante Modular Estilo Industrial', quantidade: 8, valorUnitarioLiquido: 850, valorFreteLiquido: 120 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral (Opção Híbrida B2B)' }));
      }
    },
    {
      id: 'regra4', badge: 'Regra 4', titulo: '🔄 Estorno / Devolução de Comércio',
      desc: 'Exige Chave Referenciada. Anula débitos de IBS/CBS e estorna impostos antigos.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'DEVOLUCAO_ESTORNO', perfilEmissor: 'LUCRO_REAL', codigoItem: '9403.60.00', descricaoItem: 'Devolução: Móvel de Apoio Industrial', quantidade: 2, valorUnitarioLiquido: 1000, valorFreteLiquido: 40 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 5.0, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '90 - Estorno / Devolução Referenciada' }));
      }
    },
    {
      id: 'regra5', badge: 'Regra 5', titulo: '📄 Serviços (NFS-e): Lucro Real / Presumido',
      desc: 'Calcula ISS + PIS/COFINS antigos e destaca IBS + CBS por fora com código NBS.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '1.0201.10.00', descricaoItem: 'Assessoria Contábil e Planejamento Tributário', quantidade: 1, valorUnitarioLiquido: 5000, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, aliqIss: 5.0, aliqPis: 1.65, aliqCofins: 7.60, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral Serviços (NBS)' }));
      }
    },
    {
      id: 'regra6', badge: 'Regra 6', titulo: '📄 Serviços (NFS-e): Simples Tradicional',
      desc: 'ISS e IVA Dual recolhidos dentro do DAS. Sem destaque de IBS/CBS por fora.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_TRADICIONAL', codigoItem: '1.1403.20.00', descricaoItem: 'Projeto de Design de Interiores', quantidade: 1, valorUnitarioLiquido: 3200, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '41 - Simples Nacional (Guia Unificada DAS)' }));
      }
    },
    {
      id: 'regra7', badge: 'Regra 7', titulo: '📄 Serviços (NFS-e): Simples Híbrido',
      desc: 'Antigos no DAS, mas destaca IBS e CBS por fora para transferir crédito ao tomador PJ.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_HIBRIDO', codigoItem: '1.0201.10.00', descricaoItem: 'Auditoria Contábil e Laudo Ergonômico', quantidade: 1, valorUnitarioLiquido: 4500, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral (Simples Híbrido)' }));
      }
    },
    {
      id: 'regra8', badge: 'Regra 8', titulo: '⚠️ Imposto Seletivo (IS) + IVA Dual',
      desc: 'Produto sobretaxado: Calcula o Imposto Seletivo integrado na base do IBS/CBS.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '2202.10.00', descricaoItem: 'Lote de Bebidas Açucaradas (Sujeito ao IS)', quantidade: 10, valorUnitarioLiquido: 800, valorFreteLiquido: 200 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 0.0, incideImpostoSeletivo: true, aliqIs: 12.0, cstIbsCbs: '00 - Tributação Integral c/ Base Ampliada pelo IS' }));
      }
    }
  ];

  const selecionarRegra = (regraObj) => {
    setRegraAtiva(regraObj.id);
    regraObj.apply();
    if (typeof mostrarToast === 'function') mostrarToast(`${regraObj.badge} carregada no motor de cálculo!`, 'sucesso');
  };

  // =========================================================================
  // MOTOR DE CÁLCULO TRIBUTÁRIO DE TRANSIÇÃO (2026 A 2033)
  // =========================================================================
  const ano = Number(dadosGerais.anoFiscal);
  const isServico = dadosGerais.modeloDoc === 'NFSE';
  const isSimplesTrad = dadosGerais.perfilEmissor === 'SIMPLES_TRADICIONAL';
  const isSimplesHib = dadosGerais.perfilEmissor === 'SIMPLES_HIBRIDO';
  const isLucroRealPresumido = dadosGerais.perfilEmissor === 'LUCRO_REAL';

  const fatorAntigosIcmsIss =
    ano <= 2028 ? 1.0 :
    ano === 2029 ? 0.90 :
    ano === 2030 ? 0.80 :
    ano === 2031 ? 0.70 :
    ano === 2032 ? 0.60 : 0.0; 

  const fatorPisCofinsAntigo = ano === 2026 ? 1.0 : 0.0;

  const fatorRedutorIva = 1 - (Number(parametrosFiscais.redutorAliquotaPct || 0) / 100);
  const aliqCbsEfetiva = (ano === 2026 ? 0.90 : Number(parametrosFiscais.aliqCbsPadrao)) * fatorRedutorIva;
  
  const pesoIbsTransicao =
    ano === 2026 ? (0.10 / 17.70) :
    ano <= 2028 ? (0.10 / 17.70) :
    ano === 2029 ? 0.10 :
    ano === 2030 ? 0.20 :
    ano === 2031 ? 0.30 :
    ano === 2032 ? 0.40 : 1.0;

  const aliqIbsEfetiva = +(Number(parametrosFiscais.aliqIbsPadrao) * pesoIbsTransicao * fatorRedutorIva).toFixed(2);

  const qtd = Math.max(1, Number(dadosGerais.quantidade || 1));
  const vUnit = Number(dadosGerais.valorUnitarioLiquido || 0);
  const vFrete = isServico ? 0 : Number(dadosGerais.valorFreteLiquido || 0);
  const baseLiquidaOperacaoB0 = +(qtd * vUnit + vFrete).toFixed(2);

  let bcImpostosAntigos = baseLiquidaOperacaoB0;
  let valorIcms = 0;
  let valorIss = 0;
  let valorPis = 0;
  let valorCofins = 0;
  let valorIpi = 0;

  if (isLucroRealPresumido) {
    const aliqIcmsEfetivaAntiga = isServico ? 0 : (Number(parametrosFiscais.aliqIcms) * fatorAntigosIcmsIss);
    const aliqIssEfetivaAntiga = isServico ? (Number(parametrosFiscais.aliqIss) * fatorAntigosIcmsIss) : 0;
    const aliqPisEfetivaAntiga = Number(parametrosFiscais.aliqPis) * fatorPisCofinsAntigo;
    const aliqCofinsEfetivaAntiga = Number(parametrosFiscais.aliqCofins) * fatorPisCofinsAntigo;

    const somaPorDentroPct = (aliqIcmsEfetivaAntiga + aliqIssEfetivaAntiga + aliqPisEfetivaAntiga + aliqCofinsEfetivaAntiga) / 100;
    const divisorGrossUp = Math.max(0.1, 1 - somaPorDentroPct);

    bcImpostosAntigos = +(baseLiquidaOperacaoB0 / divisorGrossUp).toFixed(2);
    valorIcms = +(bcImpostosAntigos * (aliqIcmsEfetivaAntiga / 100)).toFixed(2);
    valorIss = +(bcImpostosAntigos * (aliqIssEfetivaAntiga / 100)).toFixed(2);

    const bcPisCofins = +(bcImpostosAntigos - valorIcms).toFixed(2);
    valorPis = +(bcPisCofins * (aliqPisEfetivaAntiga / 100)).toFixed(2);
    valorCofins = +(bcPisCofins * (aliqCofinsEfetivaAntiga / 100)).toFixed(2);

    if (!isServico && ano === 2026) {
      valorIpi = +(bcImpostosAntigos * (Number(parametrosFiscais.aliqIpi) / 100)).toFixed(2);
    }
  }

  const aliqIsAplicada = (parametrosFiscais.incideImpostoSeletivo && !isServico) ? Number(parametrosFiscais.aliqIs) : 0;
  const valorImpostoSeletivo = +(baseLiquidaOperacaoB0 * (aliqIsAplicada / 100)).toFixed(2);

  const baseCalculoIvaDual = +(baseLiquidaOperacaoB0 + valorImpostoSeletivo).toFixed(2);

  let valorCbsDestacado = 0;
  let valorIbsDestacado = 0;
  let creditoSimplesCbsTransferido = 0;
  let creditoSimplesIbsTransferido = 0;

  if (isLucroRealPresumido || isSimplesHib) {
    valorCbsDestacado = +(baseCalculoIvaDual * (aliqCbsEfetiva / 100)).toFixed(2);
    valorIbsDestacado = +(baseCalculoIvaDual * (aliqIbsEfetiva / 100)).toFixed(2);
  } else if (isSimplesTrad) {
    valorCbsDestacado = 0;
    valorIbsDestacado = 0;
    creditoSimplesCbsTransferido = +(baseCalculoIvaDual * (Number(parametrosFiscais.aliqCreditoSimplesCbs) / 100)).toFixed(2);
    creditoSimplesIbsTransferido = +(baseCalculoIvaDual * (Number(parametrosFiscais.aliqCreditoSimplesIbs) / 100)).toFixed(2);
  }

  const totalIvaPorFora = +(valorCbsDestacado + valorIbsDestacado).toFixed(2);

  const valorTotalNotaFiscal = +(bcImpostosAntigos + valorIpi + valorImpostoSeletivo + totalIvaPorFora).toFixed(2);
  const valorLiquidoCaixaPosSplit = dadosGerais.splitPayment
    ? +(valorTotalNotaFiscal - totalIvaPorFora).toFixed(2)
    : valorTotalNotaFiscal;

  const payloadJsonGerado = {
    blocoA_dadosGerais: {
      idSimulacao: dadosGerais.idSimulacao,
      anoFiscalSimulado: ano,
      modeloDocumento: dadosGerais.modeloDoc === '55' ? '55 - NF-e' : dadosGerais.modeloDoc === '65' ? '65 - NFC-e' : 'NFS-e Padrão Nacional',
      tipoOperacao: dadosGerais.tipoOperacao,
      perfilEmissor: dadosGerais.perfilEmissor,
      ufOrigem: dadosGerais.ufOrigem,
      ufDestino: dadosGerais.ufDestino,
      codificacaoItem: {
        tipo: isServico ? 'NBS' : 'NCM',
        codigo: dadosGerais.codigoItem,
        descricao: dadosGerais.descricaoItem
      },
      Valor_Liquido_Itens: baseLiquidaOperacaoB0,
      Valor_Base_Com_Antigos_Por_Dentro: bcImpostosAntigos,
      Valor_Total_Nota: valorTotalNotaFiscal
    },
    blocoB_matrizImpostosAntigos: {
      pesoTransicaoAplicadoPct: +(fatorAntigosIcmsIss * 100).toFixed(0),
      BC_ICMS_ISS: isLucroRealPresumido ? bcImpostosAntigos : 0,
      Valor_ICMS_Destacado: valorIcms,
      Valor_ISS_Destacado: valorIss,
      Valor_PIS_Debito: valorPis,
      Valor_COFINS_Debito: valorCofins,
      Valor_IPI_PorFora: valorIpi
    },
    blocoC_matrizImpostosNovos: {
      cClassTrib: parametrosFiscais.cClassTrib,
      CST_IBS_CBS: parametrosFiscais.cstIbsCbs,
      BC_IBS_CBS_PorFora: baseCalculoIvaDual,
      Aliq_IS_Pct: aliqIsAplicada,
      Valor_IS_Calculado: valorImpostoSeletivo,
      Aliq_CBS_Efetiva_Pct: +aliqCbsEfetiva.toFixed(2),
      Aliq_IBS_Efetiva_Pct: aliqIbsEfetiva,
      Valor_CBS_Destacado: valorCbsDestacado,
      Valor_IBS_Destacado: valorIbsDestacado
    },
    blocoD_informacoesComplementares: {
      Indicador_Split_Payment: dadosGerais.splitPayment,
      Valor_Retido_Split_Payment: dadosGerais.splitPayment ? totalIvaPorFora : 0,
      Valor_Liquido_Acreditado_Conta_Empresa: valorLiquidoCaixaPosSplit,
      DFeReferenciado: dadosGerais.tipoOperacao === 'DEVOLUCAO_ESTORNO' ? dadosGerais.chaveReferenciada : null,
      Tags_Informativas_Simples: isSimplesTrad
        ? `DOCUMENTO EMITIDO POR OPTANTE PELO SIMPLES NACIONAL. PERMITE CRÉDITO DE IBS (R$ ${formatMoeda(creditoSimplesIbsTransferido)}) E CBS (R$ ${formatMoeda(creditoSimplesCbsTransferido)}).`
        : null
    }
  };

  const handleEmitirDocumento = (e) => {
    e.preventDefault();
    
    const novoRegistro = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo: dadosGerais.tipoOperacao,
      modelo: dadosGerais.modeloDoc === 'NFSE' ? 'NFS-e Nac.' : `Mod. ${dadosGerais.modeloDoc}`,
      parceiro: `${dadosGerais.destinatarioNome} (${dadosGerais.perfilEmissor})`,
      baseIva: baseCalculoIvaDual,
      cbsValor: isSimplesTrad ? creditoSimplesCbsTransferido : valorCbsDestacado,
      ibsValor: isSimplesTrad ? creditoSimplesIbsTransferido : valorIbsDestacado,
      splitQuitado: dadosGerais.splitPayment,
      regra: catalogoRegras.find(r => r.id === regraAtiva)?.badge || 'Personalizada'
    };

    if (typeof registrarFatoGerador === 'function') {
      const idCaixa = planoContas.find(c => c.codigo_contabil === '1.1.01.01' || c.codigo_contabil === '1.1.1.01')?.id;
      const idReceita = planoContas.find(c => c.codigo_contabil === '4.1.01.01' || c.codigo_contabil === '3.1.1.01')?.id;
      
      const descOperacao = `NF-e ${dadosGerais.tipoOperacao === 'SAIDA_VENDA' ? 'Venda' : 'Operação'} - ${dadosGerais.descricaoItem} (IVA Dual)`;
      
      registrarFatoGerador(
        descOperacao,
        valorTotalNotaFiscal,
        'Emissão de Notas',
        [idCaixa], 
        [idReceita] 
      );
    }

    setHistoricoNotas(prev => [novoRegistro, ...prev]);
    setAbaInterna('danfe');
    
    if (typeof mostrarToast === 'function') {
      mostrarToast('Documento autorizado e enviado para a Contabilidade!', 'sucesso');
    }
  };

  const apuracaoCbs = historicoNotas.reduce((acc, n) => {
    if (n.tipo === 'SAIDA_VENDA') {
      acc.debitos += n.cbsValor;
      if (n.splitQuitado) acc.retidoSplit += n.cbsValor;
    } else if (n.tipo === 'DEVOLUCAO_ESTORNO') {
      acc.estornos += n.cbsValor;
    } else if (n.tipo === 'ENTRADA_COMPRA') {
      acc.creditos += n.cbsValor;
    }
    return acc;
  }, { debitos: 0, estornos: 0, creditos: 0, retidoSplit: 0 });

  const apuracaoIbs = historicoNotas.reduce((acc, n) => {
    if (n.tipo === 'SAIDA_VENDA') {
      acc.debitos += n.ibsValor;
      if (n.splitQuitado) acc.retidoSplit += n.ibsValor;
    } else if (n.tipo === 'DEVOLUCAO_ESTORNO') {
      acc.estornos += n.ibsValor;
    } else if (n.tipo === 'ENTRADA_COMPRA') {
      acc.creditos += n.ibsValor;
    }
    return acc;
  }, { debitos: 0, estornos: 0, creditos: 0, retidoSplit: 0 });

  const saldoFinalCbs = +(apuracaoCbs.debitos - apuracaoCbs.estornos - apuracaoCbs.creditos - apuracaoCbs.retidoSplit).toFixed(2);
  const saldoFinalIbs = +(apuracaoIbs.debitos - apuracaoIbs.estornos - apuracaoIbs.creditos - apuracaoIbs.retidoSplit).toFixed(2);

  return (
    <div translate="no" className="notranslate" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO EXECUTIVO */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', borderBottom: '4px solid #3b82f6', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 250px' }}>
            <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 14px', borderRadius: '10px', fontWeight: '900', fontSize: '18px', flexShrink: 0 }}>
              🏛️ IVA
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>
                Simulador da Reforma Tributária & Motor de Coexistência
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#93c5fd', wordBreak: 'break-word' }}>
                Engenharia de Dados • EC 132/2023 • Por Dentro vs. Por Fora + Split Payment
              </p>
            </div>
          </div>

          {/* KPI RÁPIDO NO TOPO */}
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '12px', border: '1px solid #334155', fontSize: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <div style={{ wordBreak: 'break-word' }}>Ano: <strong style={{ color: '#38bdf8' }}>{ano}</strong></div>
            <div style={{ wordBreak: 'break-word' }}>Base: <strong>R$ {formatMoeda(baseLiquidaOperacaoB0)}</strong></div>
            <div style={{ wordBreak: 'break-word' }}>IVA: <strong style={{ color: '#fbbf24' }}>R$ {formatMoeda(totalIvaPorFora)}</strong></div>
            <div style={{ wordBreak: 'break-word' }}>Total: <strong style={{ color: '#4ade80' }}>R$ {formatMoeda(valorTotalNotaFiscal)}</strong></div>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE OS 5 MÓDULOS TÉCNICOS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          {[
            { id: 'emissor', label: '⚙️ 1. Motor & 8 Regras' },
            { id: 'danfe', label: '🧾 2. Espelho Fiscal' },
            { id: 'contabil', label: '⚖️ 3. Mapa Contábil' },
            { id: 'apuracao', label: `📘 4. Apuração (${historicoNotas.length})` },
            { id: 'json', label: '💻 5. Payload JSON' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaInterna(tab.id)}
              style={{
                padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer',
                border: abaInterna === tab.id ? '2px solid #60a5fa' : '1px solid #334155',
                backgroundColor: abaInterna === tab.id ? '#2563eb' : '#1e293b', color: 'white',
                boxShadow: abaInterna === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                flex: '1 1 auto', textAlign: 'center', transition: 'all 0.2s', boxSizing: 'border-box', wordBreak: 'break-word'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #cbd5e1', borderTop: 'none', boxSizing: 'border-box', width: '100%' }}>

        {/* ===================================================================
            ABA 1: MOTOR DE PARAMETRIZAÇÃO E MATRIZ DAS 8 REGRAS
            =================================================================== */}
        {abaInterna === 'emissor' && (
          <div style={{ boxSizing: 'border-box' }}>
            {/* VITRINE HORIZONTAL DAS 8 REGRAS */}
            <div style={{ marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '13.5px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', wordBreak: 'break-word' }}>
                  🎯 Matriz de 8 Regras de Negócio (Escolha um cenário):
                </strong>
                <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Deslize horizontalmente ou clique nos cards</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '12px', paddingTop: '4px', paddingLeft: '4px', paddingBottom: '12px', scrollbarWidth: 'thin', boxSizing: 'border-box' }}>
                {catalogoRegras.map(r => {
                  const ativo = regraAtiva === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => selecionarRegra(r)}
                      style={{
                        flex: '0 0 240px', backgroundColor: ativo ? '#eff6ff' : '#f8fafc',
                        border: `2px solid ${ativo ? '#2563eb' : '#cbd5e1'}`, borderRadius: '12px', padding: '14px',
                        cursor: 'pointer', transition: 'all 0.2s', transform: ativo ? 'translateY(-2px)' : 'none',
                        boxShadow: ativo ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span style={{ backgroundColor: ativo ? '#2563eb' : '#e2e8f0', color: ativo ? 'white' : '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', wordBreak: 'break-word' }}>
                          {r.badge}
                        </span>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', margin: '8px 0 4px 0', wordBreak: 'break-word' }}>{r.titulo}</strong>
                        <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.4', wordBreak: 'break-word' }}>{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BARRA DA LINHA DO TEMPO */}
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '900', wordBreak: 'break-word' }}>
                    ⏳ TRANSIÇÃO (2026–2033)
                  </span>
                  <strong style={{ fontSize: '14.5px', marginLeft: '8px', wordBreak: 'break-word' }}>Ano: {ano}</strong>
                </div>
                <div style={{ fontSize: '11.5px', color: '#93c5fd', wordBreak: 'break-word' }}>
                  Peso ICMS/ISS: <strong>{(fatorAntigosIcmsIss * 100).toFixed(0)}%</strong> | CBS: <strong>{aliqCbsEfetiva.toFixed(1)}%</strong> | IBS: <strong>{aliqIbsEfetiva}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDadosGerais({ ...dadosGerais, anoFiscal: a })}
                    style={{
                      flex: '1 1 65px', padding: '8px 6px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                      border: ano === a ? '2px solid #38bdf8' : '1px solid #475569',
                      backgroundColor: ano === a ? '#0284c7' : '#1e293b', color: 'white', boxSizing: 'border-box'
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleEmitirDocumento} style={{ boxSizing: 'border-box' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
                
                {/* BLOCO A: DADOS GERAIS */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', borderTop: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', wordBreak: 'break-word' }}>
                    📋 BLOCO A: Dados Gerais e Operação
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Modelo:</label>
                      <select style={inputStyle} value={dadosGerais.modeloDoc} onChange={e => setDadosGerais({ ...dadosGerais, modeloDoc: e.target.value })}>
                        <option value="55">55 - NF-e</option>
                        <option value="65">65 - NFC-e</option>
                        <option value="NFSE">NFS-e</option>
                      </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Operação:</label>
                      <select style={inputStyle} value={dadosGerais.tipoOperacao} onChange={e => setDadosGerais({ ...dadosGerais, tipoOperacao: e.target.value })}>
                        <option value="SAIDA_VENDA">Saída (Venda)</option>
                        <option value="ENTRADA_COMPRA">Entrada (Compra)</option>
                        <option value="DEVOLUCAO_ESTORNO">Devolução</option>
                      </select>
                    </div>
                    <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Perfil Emissor:</label>
                      <select style={inputStyle} value={dadosGerais.perfilEmissor} onChange={e => setDadosGerais({ ...dadosGerais, perfilEmissor: e.target.value })}>
                        <option value="LUCRO_REAL">Lucro Real / Presumido</option>
                        <option value="SIMPLES_TRADICIONAL">Simples Tradicional (DAS)</option>
                        <option value="SIMPLES_HIBRIDO">Simples Híbrido (Destaca IVA)</option>
                      </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>{isServico ? 'NBS:' : 'NCM:'}</label>
                      <input style={inputStyle} type="text" value={dadosGerais.codigoItem} onChange={e => setDadosGerais({ ...dadosGerais, codigoItem: e.target.value })} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>UF Origem → Dest:</label>
                      <div style={{ display: 'flex', gap: '6px', boxSizing: 'border-box' }}>
                        <input style={inputStyle} type="text" maxLength="2" value={dadosGerais.ufOrigem} onChange={e => setDadosGerais({ ...dadosGerais, ufOrigem: e.target.value.toUpperCase() })} />
                        <input style={inputStyle} type="text" maxLength="2" value={dadosGerais.ufDestino} onChange={e => setDadosGerais({ ...dadosGerais, ufDestino: e.target.value.toUpperCase() })} />
                      </div>
                    </div>
                    <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Descrição do Item:</label>
                      <input style={inputStyle} type="text" value={dadosGerais.descricaoItem} onChange={e => setDadosGerais({ ...dadosGerais, descricaoItem: e.target.value })} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Qtd:</label>
                      <input style={inputStyle} type="number" min="1" value={dadosGerais.quantidade} onChange={e => setDadosGerais({ ...dadosGerais, quantidade: e.target.value })} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Vlr Unit. (R$):</label>
                      <input style={inputStyle} type="number" step="10" value={dadosGerais.valorUnitarioLiquido} onChange={e => setDadosGerais({ ...dadosGerais, valorUnitarioLiquido: e.target.value })} />
                    </div>
                    {!isServico && (
                      <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Frete Líquido (R$):</label>
                        <input style={inputStyle} type="number" value={dadosGerais.valorFreteLiquido} onChange={e => setDadosGerais({ ...dadosGerais, valorFreteLiquido: e.target.value })} />
                      </div>
                    )}
                    {dadosGerais.tipoOperacao === 'DEVOLUCAO_ESTORNO' && (
                      <div style={{ minWidth: 0, gridColumn: '1 / -1', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', boxSizing: 'border-box' }}>
                        <label style={{ ...labelStyle, color: '#991b1b' }}>Chave Referenciada Obrigatória:</label>
                        <input style={{ ...inputStyle, fontFamily: 'monospace' }} type="text" value={dadosGerais.chaveReferenciada} onChange={e => setDadosGerais({ ...dadosGerais, chaveReferenciada: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* BLOCO B & C: MATRIZES TRIBUTÁRIAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
                  
                  {/* BLOCO B: ANTIGOS */}
                  <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '16px', border: '1px solid #fde68a', borderTop: '4px solid #d97706', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#92400e', wordBreak: 'break-word' }}>🏛️ BLOCO B: Matriz Antiga</strong>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px' }}>
                        Gross-Up: R$ {formatMoeda(bcImpostosAntigos)}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                      {!isServico ? (
                        <div style={{ minWidth: 0 }}>
                          <label style={labelStyle}>ICMS (%):</label>
                          <input style={inputStyle} type="number" step="0.5" value={parametrosFiscais.aliqIcms} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIcms: e.target.value })} />
                        </div>
                      ) : (
                        <div style={{ minWidth: 0 }}>
                          <label style={labelStyle}>ISS (%):</label>
                          <input style={inputStyle} type="number" step="0.5" value={parametrosFiscais.aliqIss} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIss: e.target.value })} />
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>PIS (%):</label>
                        <input style={inputStyle} type="number" step="0.05" value={parametrosFiscais.aliqPis} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqPis: e.target.value })} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>COFINS (%):</label>
                        <input style={inputStyle} type="number" step="0.1" value={parametrosFiscais.aliqCofins} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqCofins: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* BLOCO C: IVA DUAL */}
                  <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderTop: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#1e40af', wordBreak: 'break-word' }}>✨ BLOCO C: Matriz IVA Dual</strong>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px' }}>
                        BC IVA: R$ {formatMoeda(baseCalculoIvaDual)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', marginBottom: '10px', boxSizing: 'border-box' }}>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>Redutor:</label>
                        <select style={inputStyle} value={parametrosFiscais.redutorAliquotaPct} onChange={e => setParametrosFiscais({ ...parametrosFiscais, redutorAliquotaPct: e.target.value })}>
                          <option value={0}>Padrão (0%)</option>
                          <option value={60}>Saúde/Educação (60%)</option>
                        </select>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelStyle}>Imposto Seletivo - IS (%):</label>
                        <input style={inputStyle} type="number" min="0" max="50" value={parametrosFiscais.aliqIs} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIs: e.target.value, incideImpostoSeletivo: e.target.value > 0 })} />
                      </div>
                    </div>

                    {/* SPLIT PAYMENT */}
                    <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>⚡ Split Payment (PIX / Cartão)</strong>
                        <span style={{ fontSize: '11px', color: '#475569', wordBreak: 'break-word' }}>Retém R$ {formatMoeda(totalIvaPorFora)} no pagamento</span>
                      </div>
                      <input type="checkbox" checked={dadosGerais.splitPayment} onChange={e => setDadosGerais({ ...dadosGerais, splitPayment: e.target.checked })} style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }} />
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #93c5fd', paddingTop: '8px', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                      <span>IS: <strong>R$ {formatMoeda(valorImpostoSeletivo)}</strong></span>
                      <span>CBS: <strong>R$ {formatMoeda(valorCbsDestacado)}</strong></span>
                      <span>IBS: <strong>R$ {formatMoeda(valorIbsDestacado)}</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)', boxSizing: 'border-box' }}>
                🚀 Processar Motor Tributário & Gerar DANFE Dual →
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
            ABA 2: ESPELHO FISCAL DUAL (DANFE / NFS-e)
            =================================================================== */}
        {abaInterna === 'danfe' && (
          <div style={{ border: '2px solid #0f172a', padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', maxWidth: '920px', margin: '0 auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '900', wordBreak: 'break-word' }}>
                  DANFE REFORMA TRIBUTÁRIA • ANO {ano}
                </span>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>
                  {isServico ? 'NFS-e PADRÃO NACIONAL (IVA DUAL)' : `DANFE DUAL - MODELO ${dadosGerais.modeloDoc}`}
                </h3>
                <span style={{ fontSize: '11.5px', color: '#475569', wordBreak: 'break-word' }}>
                  Destinatário: <strong>{dadosGerais.destinatarioNome}</strong> ({dadosGerais.destinatarioDoc})
                </span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>PROTOCOLO</div>
                <strong style={{ fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{dadosGerais.idSimulacao}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
              
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '14px', borderRadius: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#92400e', display: 'block', marginBottom: '8px', wordBreak: 'break-word' }}>BLOCO B: TRIBUTOS ANTIGOS</span>
                <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#78350f', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>Base Gross-up:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(bcImpostosAntigos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>ICMS / ISS:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(valorIcms + valorIss)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>PIS / COFINS:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(valorPis + valorCofins)}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', padding: '14px', borderRadius: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#1e40af', display: 'block', marginBottom: '8px', wordBreak: 'break-word' }}>BLOCO C: IVA DUAL & SELETIVO</span>
                <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#1e3a8a', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>Base IVA:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(baseCalculoIvaDual)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>Imposto Seletivo:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(valorImpostoSeletivo)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>CBS ({aliqCbsEfetiva.toFixed(1)}%):</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(valorCbsDestacado)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>IBS ({aliqIbsEfetiva}%):</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(valorIbsDestacado)}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#166534', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>RESUMO DA NOTA</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', wordBreak: 'break-word' }}>
                    R$ {formatMoeda(valorTotalNotaFiscal)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#15803d', wordBreak: 'break-word' }}>
                    {dadosGerais.splitPayment ? `⚡ Split: R$ ${formatMoeda(totalIvaPorFora)} retidos` : 'Guia Manual'}
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #86efac', paddingTop: '8px', fontSize: '11.5px', color: '#166534', wordBreak: 'break-word' }}>
                  Líquido no Caixa: <strong>R$ {formatMoeda(valorLiquidoCaixaPosSplit)}</strong>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box', width: '100%', maxWidth: '240px' }}>
                🖨️ Imprimir DANFE Dual
              </button>
              <button type="button" onClick={() => setAbaInterna('contabil')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box', width: '100%', maxWidth: '260px' }}>
                Ver Mapa Contábil →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 3: MAPA CONTÁBIL DE FATURAMENTO E LIQUIDAÇÃO
            =================================================================== */}
        {abaInterna === 'contabil' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px 18px', borderRadius: '0 12px 12px 0', marginBottom: '20px', fontSize: '12.5px', color: '#1e3a8a', lineHeight: '1.5', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              <strong>📘 Engenharia Contábil (NBC TG 47):</strong> Tributos "por fora" (IBS, CBS e IS) são passivos imediatos na emissão da nota, sem inflar a Receita Bruta. No pagamento com Split Payment, o banco quita o passivo automaticamente!
            </div>

            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>
              1º Momento: Emissão da Nota Fiscal (Competência)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px' }}>Conta Contábil</th>
                    <th style={{ padding: '10px 12px' }}>Grupo</th>
                    <th style={{ padding: '10px 12px' }}>Histórico</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Débito</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>1.1.2.01 - Clientes a Receber</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Ativo Circulante</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Total faturado ({dadosGerais.idSimulacao})</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb', whiteSpace: 'nowrap' }}>{formatMoeda(valorTotalNotaFiscal)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>3.1.1.01 - Receita Bruta de Vendas</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Resultado (DRE)</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Receita base s/ impostos por fora</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(bcImpostosAntigos)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#eff6ff' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#1e40af', wordBreak: 'break-word' }}>2.1.4.10 - CBS a Recolher</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Passivo Circulante</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Débito de CBS ({aliqCbsEfetiva.toFixed(1)}%)</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#1e40af', whiteSpace: 'nowrap' }}>{formatMoeda(valorCbsDestacado)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#eff6ff' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#1e40af', wordBreak: 'break-word' }}>2.1.4.11 - IBS a Recolher</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Passivo Circulante</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Débito de IBS ({aliqIbsEfetiva}%)</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#1e40af', whiteSpace: 'nowrap' }}>{formatMoeda(valorIbsDestacado)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>
              2º Momento: Liquidação Financeira (Split Payment)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#166534', color: 'white' }}>
                    <th style={{ padding: '10px 12px' }}>Conta Contábil</th>
                    <th style={{ padding: '10px 12px' }}>Efeito do Split Payment</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Débito</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>1.1.1.02 - Bancos Conta Movimento</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Entrada líquida no caixa da empresa</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(valorLiquidoCaixaPosSplit)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                  </tr>
                  {dadosGerais.splitPayment && totalIvaPorFora > 0 && (
                    <>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#15803d', wordBreak: 'break-word' }}>2.1.4.10 - CBS a Recolher (Baixa)</td>
                        <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Retido via PIX e enviado à RFB</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#15803d', whiteSpace: 'nowrap' }}>{formatMoeda(valorCbsDestacado)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#15803d', wordBreak: 'break-word' }}>2.1.4.11 - IBS a Recolher (Baixa)</td>
                        <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Retido via PIX e enviado ao Comitê Gestor</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#15803d', whiteSpace: 'nowrap' }}>{formatMoeda(valorIbsDestacado)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>1.1.2.01 - Clientes a Receber</td>
                    <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>Baixa integral do título do cliente</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(valorTotalNotaFiscal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: LIVRO DE APURAÇÃO ASSISTIDA
            =================================================================== */}
        {abaInterna === 'apuracao' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
              
              {/* CBS */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb', borderRadius: '16px', padding: '18px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ fontSize: '14.5px', color: '#1e40af', display: 'block', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
                  🏛️ Apuração CBS (Receita Federal)
                </strong>
                <div style={{ fontSize: '12.5px', lineHeight: '1.8', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(+) Débitos:</span><strong style={{ color: '#dc2626', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoCbs.debitos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(-) Créditos:</span><strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoCbs.creditos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(-) Split:</span><strong style={{ color: '#2563eb', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoCbs.retidoSplit)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: '8px', paddingTop: '8px', fontSize: '13.5px', fontWeight: '900', color: saldoFinalCbs <= 0 ? '#16a34a' : '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ wordBreak: 'break-word' }}>{saldoFinalCbs <= 0 ? 'SALDO CREDOR:' : 'SALDO DEVEDOR:'}</span>
                    <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(Math.abs(saldoFinalCbs))}</span>
                  </div>
                </div>
              </div>

              {/* IBS */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #0f172a', borderRadius: '16px', padding: '18px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', display: 'block', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
                  🌎 Apuração IBS (Comitê Gestor)
                </strong>
                <div style={{ fontSize: '12.5px', lineHeight: '1.8', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(+) Débitos:</span><strong style={{ color: '#dc2626', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoIbs.debitos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(-) Créditos:</span><strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoIbs.creditos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span style={{ wordBreak: 'break-word' }}>(-) Split:</span><strong style={{ color: '#2563eb', wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoIbs.retidoSplit)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: '8px', paddingTop: '8px', fontSize: '13.5px', fontWeight: '900', color: saldoFinalIbs <= 0 ? '#16a34a' : '#dc2626', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ wordBreak: 'break-word' }}>{saldoFinalIbs <= 0 ? 'SALDO CREDOR:' : 'SALDO DEVEDOR:'}</span>
                    <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(Math.abs(saldoFinalIbs))}</span>
                  </div>
                </div>
              </div>

            </div>

            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14px', wordBreak: 'break-word' }}>
              📑 Razão Auxiliar de Documentos Fiscais Escriturados
            </h4>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '16px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px' }}>ID Doc</th>
                    <th style={{ padding: '10px 12px' }}>Operação</th>
                    <th style={{ padding: '10px 12px' }}>Regra</th>
                    <th style={{ padding: '10px 12px' }}>Parceiro</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Base IVA</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>CBS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>IBS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Split</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoNotas.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{h.id}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '10.5px',
                          backgroundColor: h.tipo === 'SAIDA_VENDA' ? '#fee2e2' : '#dcfce7',
                          color: h.tipo === 'SAIDA_VENDA' ? '#991b1b' : '#166534'
                        }}>
                          {h.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>{h.regra}</td>
                      <td style={{ padding: '10px 12px', wordBreak: 'break-word' }}>{h.parceiro}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(h.baseIva)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ {formatMoeda(h.cbsValor)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ {formatMoeda(h.ibsValor)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {h.splitQuitado ? '🟢 Quitado' : '🟡 Guia'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 5: PAYLOAD JSON
            =================================================================== */}
        {abaInterna === 'json' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
              <strong style={{ fontSize: '13.5px', color: '#0f172a', wordBreak: 'break-word' }}>
                💻 Payload JSON Oficial da Simulação (Estrutura de 4 Blocos)
              </strong>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(payloadJsonGerado, null, 2));
                  if (typeof mostrarToast === 'function') mostrarToast('Payload JSON copiado para a área de transferência!', 'sucesso');
                }}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                📋 Copiar JSON
              </button>
            </div>
            <pre style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '20px', borderRadius: '12px', overflowX: 'auto', fontSize: '12px', lineHeight: '1.5', fontFamily: 'monospace', margin: 0, boxSizing: 'border-box' }}>
              {JSON.stringify(payloadJsonGerado, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}