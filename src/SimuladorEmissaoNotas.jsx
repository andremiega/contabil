import React, { useState } from 'react';

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
    // Matriz Antiga (Em extinção gradual)
    aliqIcms: 18.0,
    aliqIss: 5.0,
    aliqPis: 1.65,
    aliqCofins: 7.60,
    aliqIpi: 5.0,
    // Matriz Nova (IVA Dual - Reforma Tributária)
    cClassTrib: '000001 - Tributação Integral Padrão (Bens e Serviços)',
    cstIbsCbs: '00 - Tributação Integral',
    incideImpostoSeletivo: false,
    aliqIs: 0.0, // Imposto Seletivo (Regra 8)
    aliqCbsPadrao: 8.80,
    aliqIbsPadrao: 17.70,
    redutorAliquotaPct: 0.0, // Ex: 60% para saúde/educação/cesta básica
    aliqCreditoSimplesIbs: 2.50,
    aliqCreditoSimplesCbs: 1.25
  });

  // 3. Estado do Livro de Apuração Assistida (Histórico de Notas Emitidas na Sessão)
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

  // Estilos Reutilizáveis Padronizados do ERP
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #94a3b8',
    fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', backgroundColor: '#ffffff'
  };
  const labelStyle = { fontWeight: 'bold', fontSize: '12px', color: '#334155', display: 'block', marginBottom: '4px' };

  // =========================================================================
  // CATÁLOGO DAS 8 REGRAS DE NEGÓCIO (PRESETS AUTOMÁTICOS)
  // =========================================================================
  const catalogoRegras = [
    {
      id: 'regra1', badge: 'Regra 1', titulo: '🏢 Comércio: Lucro Real / Presumido',
      desc: 'Calcula ICMS/PIS/COFINS "por dentro" + IPI e destaca IBS/CBS cheios "por fora".',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '9403.60.00', descricaoItem: 'Móvel de Apoio Industrial em Aço e Madeira', quantidade: 10, valorUnitarioLiquido: 1000, valorFreteLiquido: 200 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 5.0, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral' }));
      }
    },
    {
      id: 'regra2', badge: 'Regra 2', titulo: '🏪 Comércio: Simples Tradicional (DAS)',
      desc: 'Impostos antigos e novos zerados no destaque principal. Transfere apenas crédito reduzido do DAS.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_TRADICIONAL', codigoItem: '9403.60.00', descricaoItem: 'Kit Organizador de Escritório Minimalista', quantidade: 5, valorUnitarioLiquido: 400, valorFreteLiquido: 50 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '41 - Simples Nacional (Recolhimento no DAS)' }));
      }
    },
    {
      id: 'regra3', badge: 'Regra 3', titulo: '⚡ Comércio: Simples Nacional Híbrido',
      desc: 'Impostos antigos no DAS, mas destaca IBS + CBS cheios por fora (~26,5%) para gerar crédito B2B total.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_HIBRIDO', codigoItem: '9403.60.00', descricaoItem: 'Estante Modular Estilo Industrial', quantidade: 8, valorUnitarioLiquido: 850, valorFreteLiquido: 120 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral (Opção Híbrida B2B)' }));
      }
    },
    {
      id: 'regra4', badge: 'Regra 4', titulo: '🔄 Estorno / Devolução de Comércio',
      desc: 'Exige Chave Referenciada (DFeReferenciado). Anula débitos de IBS/CBS e estorna impostos antigos.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'DEVOLUCAO_ESTORNO', perfilEmissor: 'LUCRO_REAL', codigoItem: '9403.60.00', descricaoItem: 'Devolução: Móvel de Apoio Industrial', quantidade: 2, valorUnitarioLiquido: 1000, valorFreteLiquido: 40 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 5.0, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '90 - Estorno / Devolução Referenciada' }));
      }
    },
    {
      id: 'regra5', badge: 'Regra 5', titulo: '📄 Serviços (NFS-e): Lucro Real / Presumido',
      desc: 'Calcula ISS Municipal + PIS/COFINS antigos e destaca IBS + CBS por fora com código NBS.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '1.0201.10.00', descricaoItem: 'Assessoria Contábil, Ergonomia Corporativa e Planejamento Tributário', quantidade: 1, valorUnitarioLiquido: 5000, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, aliqIss: 5.0, aliqPis: 1.65, aliqCofins: 7.60, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral Serviços (NBS)' }));
      }
    },
    {
      id: 'regra6', badge: 'Regra 6', titulo: '📄 Serviços (NFS-e): Simples Tradicional',
      desc: 'ISS e IVA Dual recolhidos dentro do DAS. Sem destaque de IBS/CBS por fora na NFS-e.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_TRADICIONAL', codigoItem: '1.1403.20.00', descricaoItem: 'Projeto de Design de Interiores e Layout AutoCAD 2D', quantidade: 1, valorUnitarioLiquido: 3200, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '41 - Simples Nacional (Guia Unificada DAS)' }));
      }
    },
    {
      id: 'regra7', badge: 'Regra 7', titulo: '📄 Serviços (NFS-e): Simples Híbrido',
      desc: 'Antigos no DAS, mas destaca IBS e CBS por fora na NFS-e para transferir crédito ao tomador PJ.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: 'NFSE', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'SIMPLES_HIBRIDO', codigoItem: '1.0201.10.00', descricaoItem: 'Auditoria Contábil e Laudo Ergonômico NBR 9050', quantidade: 1, valorUnitarioLiquido: 4500, valorFreteLiquido: 0 }));
        setParametrosFiscais(p => ({ ...p, incideImpostoSeletivo: false, aliqIs: 0, cstIbsCbs: '00 - Tributação Integral (Simples Híbrido)' }));
      }
    },
    {
      id: 'regra8', badge: 'Regra 8', titulo: '⚠️ Imposto Seletivo (IS) + IVA Dual',
      desc: 'Produto sobretaxado: Calcula o Imposto Seletivo primeiro, integrando a base de cálculo do IBS e da CBS.',
      apply: () => {
        setDadosGerais(d => ({ ...d, modeloDoc: '55', tipoOperacao: 'SAIDA_VENDA', perfilEmissor: 'LUCRO_REAL', codigoItem: '2202.10.00', descricaoItem: 'Lote de Bebidas Açucaradas / Veículo a Combustão (Sujeito ao IS)', quantidade: 10, valorUnitarioLiquido: 800, valorFreteLiquido: 200 }));
        setParametrosFiscais(p => ({ ...p, aliqIcms: 18.0, aliqPis: 1.65, aliqCofins: 7.60, aliqIpi: 0.0, incideImpostoSeletivo: true, aliqIs: 12.0, cstIbsCbs: '00 - Tributação Integral c/ Base Ampliada pelo IS' }));
      }
    }
  ];

  const selecionarRegra = (regraObj) => {
    setRegraAtiva(regraObj.id);
    regraObj.apply();
    if (mostrarToast) mostrarToast(`${regraObj.badge} carregada no motor de cálculo!`, 'sucesso');
  };

  // =========================================================================
  // MOTOR DE CÁLCULO TRIBUTÁRIO DE TRANSIÇÃO (2026 A 2033)
  // =========================================================================
  const ano = Number(dadosGerais.anoFiscal);
  const isServico = dadosGerais.modeloDoc === 'NFSE';
  const isSimplesTrad = dadosGerais.perfilEmissor === 'SIMPLES_TRADICIONAL';
  const isSimplesHib = dadosGerais.perfilEmissor === 'SIMPLES_HIBRIDO';
  const isLucroRealPresumido = dadosGerais.perfilEmissor === 'LUCRO_REAL';

  // Fatores de Transição conforme Cronograma Oficial (EC 132/23 e LC 214/25)
  // Peso dos Impostos Antigos Estaduais/Municipais (ICMS/ISS):
  const fatorAntigosIcmsIss =
    ano <= 2028 ? 1.0 :
    ano === 2029 ? 0.90 :
    ano === 2030 ? 0.80 :
    ano === 2031 ? 0.70 :
    ano === 2032 ? 0.60 : 0.0; // Extinto em 2033

  // Peso de PIS/COFINS Antigos (Extintos em 2027 quando entra a CBS cheia)
  const fatorPisCofinsAntigo = ano === 2026 ? 1.0 : 0.0;

  // Alíquotas Efetivas do Ano para CBS e IBS (Considerando redutor de cClassTrib)
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

  // PASSO 1: Base Líquida da Operação (B0)
  const qtd = Math.max(1, Number(dadosGerais.quantidade || 1));
  const vUnit = Number(dadosGerais.valorUnitarioLiquido || 0);
  const vFrete = isServico ? 0 : Number(dadosGerais.valorFreteLiquido || 0);
  const baseLiquidaOperacaoB0 = +(qtd * vUnit + vFrete).toFixed(2);

  // PASSO 2: Cálculo dos Impostos Antigos ("Por Dentro" - Gross Up)
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

    // Exclusão do ICMS da BC do PIS/COFINS (Tese do Século STF)
    const bcPisCofins = +(bcImpostosAntigos - valorIcms).toFixed(2);
    valorPis = +(bcPisCofins * (aliqPisEfetivaAntiga / 100)).toFixed(2);
    valorCofins = +(bcPisCofins * (aliqCofinsEfetivaAntiga / 100)).toFixed(2);

    if (!isServico && ano === 2026) {
      valorIpi = +(bcImpostosAntigos * (Number(parametrosFiscais.aliqIpi) / 100)).toFixed(2);
    }
  }

  // PASSO 3: Cálculo do Imposto Seletivo - IS (Regra 8: Precede o IVA e entra na Base do IBS/CBS)
  const aliqIsAplicada = (parametrosFiscais.incideImpostoSeletivo && !isServico) ? Number(parametrosFiscais.aliqIs) : 0;
  const valorImpostoSeletivo = +(baseLiquidaOperacaoB0 * (aliqIsAplicada / 100)).toFixed(2);

  // PASSO 4: Cálculo do IVA Dual ("Por Fora" Puro - Expurgando todos os impostos antigos)
  const baseCalculoIvaDual = +(baseLiquidaOperacaoB0 + valorImpostoSeletivo).toFixed(2);

  let valorCbsDestacado = 0;
  let valorIbsDestacado = 0;
  let creditoSimplesCbsTransferido = 0;
  let creditoSimplesIbsTransferido = 0;

  if (isLucroRealPresumido || isSimplesHib) {
    // Regra 1, 3, 4, 5, 7, 8: Destaca IBS e CBS por fora integralmente
    valorCbsDestacado = +(baseCalculoIvaDual * (aliqCbsEfetiva / 100)).toFixed(2);
    valorIbsDestacado = +(baseCalculoIvaDual * (aliqIbsEfetiva / 100)).toFixed(2);
  } else if (isSimplesTrad) {
    // Regra 2 e 6: Simples Tradicional zera destaque por fora e informa crédito reduzido no Bloco D
    valorCbsDestacado = 0;
    valorIbsDestacado = 0;
    creditoSimplesCbsTransferido = +(baseCalculoIvaDual * (Number(parametrosFiscais.aliqCreditoSimplesCbs) / 100)).toFixed(2);
    creditoSimplesIbsTransferido = +(baseCalculoIvaDual * (Number(parametrosFiscais.aliqCreditoSimplesIbs) / 100)).toFixed(2);
  }

  const totalIvaPorFora = +(valorCbsDestacado + valorIbsDestacado).toFixed(2);

  // PASSO 5: Formação do Valor Total do Documento Fiscal (Cobrança ao Destinatário)
  const valorTotalNotaFiscal = +(bcImpostosAntigos + valorIpi + valorImpostoSeletivo + totalIvaPorFora).toFixed(2);
  const valorLiquidoCaixaPosSplit = dadosGerais.splitPayment
    ? +(valorTotalNotaFiscal - totalIvaPorFora).toFixed(2)
    : valorTotalNotaFiscal;

  // Payload JSON Estruturado em Tempo Real
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
        ? `DOCUMENTO EMITIDO POR OPTANTE PELO SIMPLES NACIONAL. PERMITE APROVEITAMENTO DE CRÉDITO DE IBS (R$ ${formatMoeda(creditoSimplesIbsTransferido)} - ${parametrosFiscais.aliqCreditoSimplesIbs}%) E CBS (R$ ${formatMoeda(creditoSimplesCbsTransferido)} - ${parametrosFiscais.aliqCreditoSimplesCbs}%).`
        : null
    }
  };

// Função para Emitir a Nota e Gravar no Livro de Apuração Assistida
  const handleEmitirDocumento = (e) => {
    e.preventDefault();
    
    // 1. Cria o registro para o Livro de Apuração (Módulo Interno)
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

    // 2. NOVO BLOCO: Gatilho de Integração Contábil com o Cérebro do ERP
    if (typeof registrarFatoGerador === 'function') {
      // Localiza os IDs das contas no plano de contas (ajuste se necessário)
      const idCaixa = planoContas.find(c => c.codigo_contabil === '1.1.01.01' || c.codigo_contabil === '1.1.1.01')?.id;
      const idReceita = planoContas.find(c => c.codigo_contabil === '4.1.01.01' || c.codigo_contabil === '3.1.1.01')?.id;
      
      const descOperacao = `NF-e ${dadosGerais.tipoOperacao === 'SAIDA_VENDA' ? 'Venda' : 'Operação'} - ${dadosGerais.descricaoItem} (IVA Dual)`;
      
      // Envia o Fato Gerador para o Cérebro do ERP
      registrarFatoGerador(
        descOperacao,
        valorTotalNotaFiscal,
        'Emissão de Notas',
        [idCaixa], // Sugestão de Débito (Ativo)
        [idReceita] // Sugestão de Crédito (Resultado)
      );
    }

    // 3. Grava no histórico interno e muda para a aba do DANFE
    setHistoricoNotas(prev => [novoRegistro, ...prev]);
    setAbaInterna('danfe');
    
    if (mostrarToast) {
      mostrarToast('Documento autorizado e enviado para a Contabilidade!', 'sucesso');
    }
  };
  // =========================================================================
  // TOTAIS DO LIVRO DE APURAÇÃO ASSISTIDA (CBS & IBS)
  // =========================================================================
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
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', width: '100%', boxSizing: 'border-box' }}>
      
      {/* =====================================================================
          CABEÇALHO EXECUTIVO DO MOTOR DA REFORMA TRIBUTÁRIA
         ===================================================================== */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', borderBottom: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 14px', borderRadius: '10px', fontWeight: '900', fontSize: '20px' }}>
              🏛️ IVA DUAL
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px' }}>
                Simulador da Reforma Tributária & Motor de Coexistência (2026–2033)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#93c5fd' }}>
                Engenharia de Dados Tributários • EC 132/2023 & LC 214/2025 • Cálculo Por Dentro vs. Por Fora + Split Payment
              </p>
            </div>
          </div>

          {/* KPI RÁPIDO NO TOPO */}
          <div style={{ display: 'flex', gap: '12px', backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155', fontSize: '12px', flexWrap: 'wrap' }}>
            <div>Ano Simulado: <strong style={{ color: '#38bdf8', fontSize: '14px' }}>{ano}</strong></div>
            <div>Base Líquida: <strong>R$ {formatMoeda(baseLiquidaOperacaoB0)}</strong></div>
            <div>IVA Por Fora: <strong style={{ color: '#fbbf24' }}>R$ {formatMoeda(totalIvaPorFora)}</strong></div>
            <div>Total NF: <strong style={{ color: '#4ade80', fontSize: '14px' }}>R$ {formatMoeda(valorTotalNotaFiscal)}</strong></div>
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE OS 5 MÓDULOS TÉCNICOS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'emissor', label: '⚙️ 1. Motor & 8 Regras de Cálculo' },
            { id: 'danfe', label: '🧾 2. Espelho Fiscal Dual (DANFE / NFS-e)' },
            { id: 'contabil', label: '⚖️ 3. Mapa Contábil & Split Payment' },
            { id: 'apuracao', label: `📘 4. Livro de Apuração Assistida (${historicoNotas.length})` },
            { id: 'json', label: '💻 5. Payload JSON (API / SEFAZ)' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaInterna(tab.id)}
              style={{
                padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer',
                border: abaInterna === tab.id ? '2px solid #60a5fa' : '1px solid #334155',
                backgroundColor: abaInterna === tab.id ? '#2563eb' : '#1e293b', color: 'white',
                boxShadow: abaInterna === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                flex: '1 1 auto', textAlign: 'center', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', borderTop: 'none', boxSizing: 'border-box' }}>

        {/* ===================================================================
            ABA 1: MOTOR DE PARAMETRIZAÇÃO E MATRIZ DAS 8 REGRAS DE NEGÓCIO
           =================================================================== */}
        {abaInterna === 'emissor' && (
          <div>
            {/* VITRINE HORIZONTAL DAS 8 REGRAS DE NEGÓCIO */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎯 Matriz de 8 Regras de Negócio (Clique para carregar o cenário fiscal):
                </strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Deslize horizontalmente ou clique nos cards abaixo</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '12px', paddingTop: '4px', paddingLeft: '4px', paddingBottom: '14px', scrollbarWidth: 'thin' }}>
                {catalogoRegras.map(r => {
                  const ativo = regraAtiva === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => selecionarRegra(r)}
                      style={{
                        flex: '0 0 250px', backgroundColor: ativo ? '#eff6ff' : '#f8fafc',
                        border: `2px solid ${ativo ? '#2563eb' : '#cbd5e1'}`, borderRadius: '10px', padding: '14px',
                        cursor: 'pointer', transition: 'all 0.2s', transform: ativo ? 'translateY(-2px)' : 'none',
                        boxShadow: ativo ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ backgroundColor: ativo ? '#2563eb' : '#e2e8f0', color: ativo ? 'white' : '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '900' }}>
                          {r.badge}
                        </span>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', margin: '8px 0 4px 0' }}>{r.titulo}</strong>
                        <p style={{ margin: 0, fontSize: '11.5px', color: '#475569', lineHeight: '1.4' }}>{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BARRA DA LINHA DO TEMPO DA REFORMA (2026 A 2033) */}
            <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '18px 20px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>
                    ⏳ CRONOGRAMA DE TRANSIÇÃO (2026–2033)
                  </span>
                  <strong style={{ fontSize: '15px', marginLeft: '10px' }}>Ano Fiscal Simulado: {ano}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#93c5fd' }}>
                  Peso ICMS/ISS Antigo: <strong>{(fatorAntigosIcmsIss * 100).toFixed(0)}%</strong> • Alíquota Efetiva CBS: <strong>{aliqCbsEfetiva.toFixed(2)}%</strong> • Alíquota Efetiva IBS: <strong>{aliqIbsEfetiva}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDadosGerais({ ...dadosGerais, anoFiscal: a })}
                    style={{
                      flex: 1, minWidth: '75px', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px',
                      border: ano === a ? '2px solid #38bdf8' : '1px solid #475569',
                      backgroundColor: ano === a ? '#0284c7' : '#1e293b', color: 'white'
                    }}
                  >
                    {a} {a === 2026 ? '(Teste)' : a === 2027 ? '(CBS)' : a === 2033 ? '(Pleno)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleEmitirDocumento}>
              {/* 4 BLOCOS OBRIGATÓRIOS DA ARQUITETURA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                
                {/* BLOCO A: DADOS GERAIS E CADASTRAIS */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #cbd5e1', borderTop: '4px solid #0f172a' }}>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    📋 BLOCO A: Dados Gerais e Operação
                  </strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Modelo do Documento:</label>
                      <select style={inputStyle} value={dadosGerais.modeloDoc} onChange={e => setDadosGerais({ ...dadosGerais, modeloDoc: e.target.value })}>
                        <option value="55">55 - NF-e (B2B / E-commerce)</option>
                        <option value="65">65 - NFC-e (Varejo Consumidor)</option>
                        <option value="NFSE">NFS-e (Padrão Nacional Serviços)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo de Operação:</label>
                      <select style={inputStyle} value={dadosGerais.tipoOperacao} onChange={e => setDadosGerais({ ...dadosGerais, tipoOperacao: e.target.value })}>
                        <option value="SAIDA_VENDA">Saída / Faturamento (Venda)</option>
                        <option value="ENTRADA_COMPRA">Entrada / Aquisição (Gera Crédito)</option>
                        <option value="DEVOLUCAO_ESTORNO">Devolução / Estorno Fiscal</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Perfil Tributário do Emissor:</label>
                      <select style={inputStyle} value={dadosGerais.perfilEmissor} onChange={e => setDadosGerais({ ...dadosGerais, perfilEmissor: e.target.value })}>
                        <option value="LUCRO_REAL">Lucro Real / Presumido (Regime Regular Pleno)</option>
                        <option value="SIMPLES_TRADICIONAL">Simples Nacional Tradicional (Recolhe no DAS)</option>
                        <option value="SIMPLES_HIBRIDO">Simples Nacional Híbrido (Destaca IBS/CBS por fora)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>{isServico ? 'Código NBS (Serviço):' : 'Código NCM (Produto):'}</label>
                      <input style={inputStyle} type="text" value={dadosGerais.codigoItem} onChange={e => setDadosGerais({ ...dadosGerais, codigoItem: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>UF Origem → UF Destino:</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input style={inputStyle} type="text" maxLength="2" value={dadosGerais.ufOrigem} onChange={e => setDadosGerais({ ...dadosGerais, ufOrigem: e.target.value.toUpperCase() })} />
                        <input style={inputStyle} type="text" maxLength="2" value={dadosGerais.ufDestino} onChange={e => setDadosGerais({ ...dadosGerais, ufDestino: e.target.value.toUpperCase() })} />
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Descrição do Produto ou Serviço:</label>
                      <input style={inputStyle} type="text" value={dadosGerais.descricaoItem} onChange={e => setDadosGerais({ ...dadosGerais, descricaoItem: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantidade:</label>
                      <input style={inputStyle} type="number" min="1" value={dadosGerais.quantidade} onChange={e => setDadosGerais({ ...dadosGerais, quantidade: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor Unit. Líquido s/ Impostos (R$):</label>
                      <input style={inputStyle} type="number" step="10" value={dadosGerais.valorUnitarioLiquido} onChange={e => setDadosGerais({ ...dadosGerais, valorUnitarioLiquido: e.target.value })} />
                    </div>
                    {!isServico && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Frete Líquido (Integra Base de Cálculo - R$):</label>
                        <input style={inputStyle} type="number" value={dadosGerais.valorFreteLiquido} onChange={e => setDadosGerais({ ...dadosGerais, valorFreteLiquido: e.target.value })} />
                      </div>
                    )}
                    {dadosGerais.tipoOperacao === 'DEVOLUCAO_ESTORNO' && (
                      <div style={{ gridColumn: 'span 2', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                        <label style={{ ...labelStyle, color: '#991b1b' }}>🔗 Chave Referenciada Obrigatória (DFeReferenciado):</label>
                        <input style={{ ...inputStyle, fontFamily: 'monospace' }} type="text" value={dadosGerais.chaveReferenciada} onChange={e => setDadosGerais({ ...dadosGerais, chaveReferenciada: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* BLOCO B & C: MATRIZES TRIBUTÁRIAS (ANTIGA vs. NOVA) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* BLOCO B: IMPOSTOS ANTIGOS */}
                  <div style={{ backgroundColor: '#fffbeb', padding: '18px', borderRadius: '10px', border: '1px solid #fde68a', borderTop: '4px solid #d97706' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '14px', color: '#92400e' }}>🏛️ BLOCO B: Matriz Antiga ("Por Dentro")</strong>
                      <span style={{ fontSize: '11.5px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px' }}>
                        BC Gross-Up: R$ {formatMoeda(bcImpostosAntigos)}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {!isServico ? (
                        <div>
                          <label style={labelStyle}>ICMS (%):</label>
                          <input style={inputStyle} type="number" step="0.5" value={parametrosFiscais.aliqIcms} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIcms: e.target.value })} />
                        </div>
                      ) : (
                        <div>
                          <label style={labelStyle}>ISS Mun. (%):</label>
                          <input style={inputStyle} type="number" step="0.5" value={parametrosFiscais.aliqIss} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIss: e.target.value })} />
                        </div>
                      )}
                      <div>
                        <label style={labelStyle}>PIS (%):</label>
                        <input style={inputStyle} type="number" step="0.05" value={parametrosFiscais.aliqPis} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqPis: e.target.value })} />
                      </div>
                      <div>
                        <label style={labelStyle}>COFINS (%):</label>
                        <input style={inputStyle} type="number" step="0.1" value={parametrosFiscais.aliqCofins} onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqCofins: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#92400e', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #fcd34d', paddingTop: '8px' }}>
                      <span>ICMS/ISS: <strong>R$ {formatMoeda(valorIcms + valorIss)}</strong></span>
                      <span>PIS/COFINS: <strong>R$ {formatMoeda(valorPis + valorCofins)}</strong></span>
                      <span>IPI: <strong>R$ {formatMoeda(valorIpi)}</strong></span>
                    </div>
                  </div>

                  {/* BLOCO C: IMPOSTOS NOVOS (IVA DUAL + SELETIVO) */}
                  <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '10px', border: '1px solid #bfdbfe', borderTop: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '14px', color: '#1e40af' }}>✨ BLOCO C: Matriz IVA Dual ("Por Fora")</strong>
                      <span style={{ fontSize: '11.5px', fontWeight: 'bold', backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                        BC IVA: R$ {formatMoeda(baseCalculoIvaDual)}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={labelStyle}>cClassTrib (Classificação):</label>
                        <select style={inputStyle} value={parametrosFiscais.redutorAliquotaPct} onChange={e => setParametrosFiscais({ ...parametrosFiscais, redutorAliquotaPct: e.target.value, cClassTrib: e.target.value === 60 ? '000201 - Alíquota Reduzida em 60%' : '000001 - Tributação Integral Padrão' })}>
                          <option value={0}>000001 - Padrão Integral (Redutor 0%)</option>
                          <option value={60}>000201 - Saúde/Educação/Agro (Redutor 60%)</option>
                          <option value={30}>000305 - Profissões Regulamentadas (Redutor 30%)</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Imposto Seletivo - IS (%):</label>
                        <input
                          style={{ ...inputStyle, borderColor: parametrosFiscais.incideImpostoSeletivo ? '#dc2626' : '#94a3b8' }}
                          type="number" min="0" max="50"
                          value={parametrosFiscais.aliqIs}
                          onChange={e => setParametrosFiscais({ ...parametrosFiscais, aliqIs: e.target.value, incideImpostoSeletivo: e.target.value > 0 })}
                        />
                      </div>
                    </div>

                    {/* BLOCO D EMBUTIDO: SPLIT PAYMENT */}
                    <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #93c5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block' }}>⚡ Liquidação via Split Payment (PIX / Cartão)</strong>
                        <span style={{ fontSize: '11px', color: '#475569' }}>Retém R$ {formatMoeda(totalIvaPorFora)} automaticamente no ato do pagamento</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={dadosGerais.splitPayment}
                        onChange={e => setDadosGerais({ ...dadosGerais, splitPayment: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ fontSize: '12px', color: '#1e3a8a', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #93c5fd', paddingTop: '8px' }}>
                      <span>IS: <strong>R$ {formatMoeda(valorImpostoSeletivo)}</strong></span>
                      <span>CBS ({aliqCbsEfetiva.toFixed(1)}%): <strong>R$ {formatMoeda(valorCbsDestacado)}</strong></span>
                      <span>IBS ({aliqIbsEfetiva}%): <strong>R$ {formatMoeda(valorIbsDestacado)}</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                🚀 Processar Motor Tributário, Gerar DANFE Dual e Escriturar no Livro de Apuração →
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
            ABA 2: ESPELHO FISCAL DUAL (DANFE / NFS-e NACIONAL)
           =================================================================== */}
        {abaInterna === 'danfe' && (
          <div style={{ border: '2px solid #0f172a', padding: '28px', borderRadius: '10px', backgroundColor: '#ffffff', maxWidth: '920px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>
                  DOCUMENTO AUXILIAR DA REFORMA TRIBUTÁRIA • ANO {ano}
                </span>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '20px', color: '#0f172a' }}>
                  {isServico ? 'NFS-e PADRÃO NACIONAL (IVA DUAL)' : `DANFE DUAL - MODELO ${dadosGerais.modeloDoc}`}
                </h3>
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Destinatário: <strong>{dadosGerais.destinatarioNome}</strong> ({dadosGerais.destinatarioDoc}) • {dadosGerais.enderecoEntrega}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>ID SIMULAÇÃO / PROTOCOLO</div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{dadosGerais.idSimulacao}</strong>
              </div>
            </div>

            {/* QUADRO COMPARATIVO DE BASES E TRIBUTOS NO DOCUMENTO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#92400e', display: 'block', marginBottom: '8px' }}>
                  BLOCO B: TRIBUTOS ANTIGOS (POR DENTRO)
                </span>
                <div style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#78350f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base de Cálculo (Gross-up):</span><strong>R$ {formatMoeda(bcImpostosAntigos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ICMS / ISS Destacado:</span><strong>R$ {formatMoeda(valorIcms + valorIss)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PIS / COFINS Débito:</span><strong>R$ {formatMoeda(valorPis + valorCofins)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IPI (Por Fora Antigo):</span><strong>R$ {formatMoeda(valorIpi)}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#1e40af', display: 'block', marginBottom: '8px' }}>
                  BLOCO C: IVA DUAL & SELETIVO (POR FORA)
                </span>
                <div style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#1e3a8a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base Líquida + IS:</span><strong>R$ {formatMoeda(baseCalculoIvaDual)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Imposto Seletivo (IS):</span><strong>R$ {formatMoeda(valorImpostoSeletivo)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CBS Federal ({aliqCbsEfetiva.toFixed(1)}%):</span><strong>R$ {formatMoeda(valorCbsDestacado)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IBS Est./Mun. ({aliqIbsEfetiva}%):</span><strong>R$ {formatMoeda(valorIbsDestacado)}</strong></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #16a34a', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: '#166534', display: 'block', marginBottom: '4px' }}>
                    RESUMO FINANCEIRO DA NOTA
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                    R$ {formatMoeda(valorTotalNotaFiscal)}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#15803d' }}>
                    {dadosGerais.splitPayment ? `⚡ Split Payment Ativo: R$ ${formatMoeda(totalIvaPorFora)} retidos no pagamento` : 'Liquidação Tradicional via Guia'}
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #86efac', paddingTop: '8px', fontSize: '12px', color: '#166534' }}>
                  Líquido no Caixa: <strong>R$ {formatMoeda(valorLiquidoCaixaPosSplit)}</strong>
                </div>
              </div>

            </div>

            {/* BLOCO D: INFORMAÇÕES COMPLEMENTARES E TAGS DO SIMPLES */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '20px' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>BLOCO D: Informações Complementares de Interesse do Contribuinte:</strong>
              <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
                • Classificação Tributária: <strong>{parametrosFiscais.cClassTrib}</strong> | CST IBS/CBS: <strong>{parametrosFiscais.cstIbsCbs}</strong>.<br />
                {isSimplesTrad && (
                  <span style={{ color: '#b45309', fontWeight: 'bold' }}>
                    • TAG SIMPLES NACIONAL (REGRA 2/6): Documento emitido por optante pelo Simples Nacional (DAS). Transfere crédito reduzido ao adquirente B2B de IBS: R$ {formatMoeda(creditoSimplesIbsTransferido)} ({parametrosFiscais.aliqCreditoSimplesIbs}%) e CBS: R$ {formatMoeda(creditoSimplesCbsTransferido)} ({parametrosFiscais.aliqCreditoSimplesCbs}%).<br />
                  </span>
                )}
                {dadosGerais.tipoOperacao === 'DEVOLUCAO_ESTORNO' && (
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                    • ESTORNO REFERENCIADO (REGRA 4): Chave DFeReferenciado [{dadosGerais.chaveReferenciada}] — Motivo: {dadosGerais.motivoEstorno}.
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                🖨️ Imprimir DANFE Dual
              </button>
              <button type="button" onClick={() => setAbaInterna('contabil')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Ver Mapa Contábil e Split Payment →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 3: MAPA CONTÁBIL DE FATURAMENTO E LIQUIDAÇÃO (PARTIDAS DOBRADAS)
           =================================================================== */}
        {abaInterna === 'contabil' && (
          <div>
            <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px 18px', borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>
              <strong>📘 Engenharia Contábil (NBC TG 47 / Reforma Tributária):</strong> Observe como os tributos "por fora" (<strong>IBS, CBS, IS e IPI</strong>) são contabilizados diretamente como obrigação passiva na emissão da nota, não inflando a Receita Bruta de Vendas. Já no momento em que o cliente paga via PIX/Boleto com <strong>Split Payment</strong>, o banco quita o passivo de IBS e CBS automaticamente antes de o dinheiro tocar na conta corrente da empresa!
            </div>

            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a' }}>
              1º Momento: Emissão da Nota Fiscal e Apropriação Tributária (Regime de Competência)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 14px' }}>Conta Contábil (Plano de Contas)</th>
                    <th style={{ padding: '10px 14px' }}>Natureza / Grupo</th>
                    <th style={{ padding: '10px 14px' }}>Histórico Técnico</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Débito (R$)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Crédito (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>1.1.2.01 - Clientes Duplicatas a Receber</td>
                    <td style={{ padding: '10px 14px' }}>Ativo Circulante</td>
                    <td style={{ padding: '10px 14px' }}>Valor total faturado na NF ({dadosGerais.idSimulacao})</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{formatMoeda(valorTotalNotaFiscal)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>3.1.1.01 - Receita Bruta de Vendas / Serviços</td>
                    <td style={{ padding: '10px 14px' }}>Resultado (DRE)</td>
                    <td style={{ padding: '10px 14px' }}>Reconhecimento da receita base (s/ impostos por fora)</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{formatMoeda(bcImpostosAntigos)}</td>
                  </tr>
                  {(valorIpi + valorImpostoSeletivo) > 0 && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>2.1.4.01 - IPI / Imposto Seletivo (IS) a Recolher</td>
                      <td style={{ padding: '10px 14px' }}>Passivo Circulante</td>
                      <td style={{ padding: '10px 14px' }}>Tributos seletivos destacados por fora</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#dc2626' }}>{formatMoeda(valorIpi + valorImpostoSeletivo)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#eff6ff' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#1e40af' }}>2.1.4.10 - CBS a Recolher (IVA Federal)</td>
                    <td style={{ padding: '10px 14px' }}>Passivo Circulante</td>
                    <td style={{ padding: '10px 14px' }}>Débito de CBS destacado por fora ({aliqCbsEfetiva.toFixed(1)}%)</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#1e40af' }}>{formatMoeda(valorCbsDestacado)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#eff6ff' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#1e40af' }}>2.1.4.11 - IBS a Recolher (Comitê Gestor)</td>
                    <td style={{ padding: '10px 14px' }}>Passivo Circulante</td>
                    <td style={{ padding: '10px 14px' }}>Débito de IBS destacado por fora ({aliqIbsEfetiva}%)</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#1e40af' }}>{formatMoeda(valorIbsDestacado)}</td>
                  </tr>
                  {(valorIcms + valorIss + valorPis + valorCofins) > 0 && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#92400e' }}>3.1.2.01 - (-) Deduções: ICMS/ISS/PIS/COFINS</td>
                      <td style={{ padding: '10px 14px' }}>Dedução DRE / Passivo</td>
                      <td style={{ padding: '10px 14px' }}>Apropriação dos tributos antigos por dentro</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#d97706' }}>{formatMoeda(valorIcms + valorIss + valorPis + valorCofins)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#d97706' }}>{formatMoeda(valorIcms + valorIss + valorPis + valorCofins)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a' }}>
              2º Momento: Liquidação Financeira com Split Payment Automático (Regime de Caixa)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#166534', color: 'white' }}>
                    <th style={{ padding: '10px 14px' }}>Conta Contábil</th>
                    <th style={{ padding: '10px 14px' }}>Efeito do Split Payment Bancário</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Débito (R$)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Crédito (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>1.1.1.02 - Bancos Conta Movimento (Caixa Livre)</td>
                    <td style={{ padding: '10px 14px' }}>Entrada líquida na conta da empresa</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{formatMoeda(valorLiquidoCaixaPosSplit)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                  </tr>
                  {dadosGerais.splitPayment && totalIvaPorFora > 0 && (
                    <>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#15803d' }}>2.1.4.10 - CBS a Recolher (Baixa Automática)</td>
                        <td style={{ padding: '10px 14px' }}>Retido na liquidação PIX e enviado à Receita Federal</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>{formatMoeda(valorCbsDestacado)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#15803d' }}>2.1.4.11 - IBS a Recolher (Baixa Automática)</td>
                        <td style={{ padding: '10px 14px' }}>Retido na liquidação PIX e enviado ao Comitê Gestor</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>{formatMoeda(valorIbsDestacado)}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>1.1.2.01 - Clientes Duplicatas a Receber</td>
                    <td style={{ padding: '10px 14px' }}>Baixa integral do título pago pelo cliente</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoeda(valorTotalNotaFiscal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 4: LIVRO DE APURAÇÃO ASSISTIDA DO IVA DUAL (CBS & IBS)
           =================================================================== */}
        {abaInterna === 'apuracao' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* SUBCONTA FEDERAL: CBS */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb', borderRadius: '10px', padding: '18px' }}>
                <strong style={{ fontSize: '15px', color: '#1e40af', display: 'block', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                  🏛️ 1. Apuração Assistida CBS (Receita Federal)
                </strong>
                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(+) Débitos pelas Saídas:</span><strong style={{ color: '#dc2626' }}>R$ {formatMoeda(apuracaoCbs.debitos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Estornos de Débitos (Devoluções):</span><strong style={{ color: '#16a34a' }}>R$ {formatMoeda(apuracaoCbs.estornos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Créditos pelas Entradas Quitadas:</span><strong style={{ color: '#16a34a' }}>R$ {formatMoeda(apuracaoCbs.creditos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Amortizado via Split Payment:</span><strong style={{ color: '#2563eb' }}>R$ {formatMoeda(apuracaoCbs.retidoSplit)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: '8px', paddingTop: '8px', fontSize: '14px', fontWeight: '900', color: saldoFinalCbs <= 0 ? '#16a34a' : '#dc2626' }}>
                    <span>(=) {saldoFinalCbs <= 0 ? 'SALDO CREDOR (A RESSARCIR):' : 'SALDO DEVEDOR A RECOLHER:'}</span>
                    <span>R$ {formatMoeda(Math.abs(saldoFinalCbs))}</span>
                  </div>
                </div>
              </div>

              {/* SUBCONTA SUBNACIONAL: IBS */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #0f172a', borderRadius: '10px', padding: '18px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                  🌎 2. Apuração Assistida IBS (Comitê Gestor UF/Mun.)
                </strong>
                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(+) Débitos pelas Saídas (Destino):</span><strong style={{ color: '#dc2626' }}>R$ {formatMoeda(apuracaoIbs.debitos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Estornos de Débitos (Devoluções):</span><strong style={{ color: '#16a34a' }}>R$ {formatMoeda(apuracaoIbs.estornos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Créditos pelas Entradas Quitadas:</span><strong style={{ color: '#16a34a' }}>R$ {formatMoeda(apuracaoIbs.creditos)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>(-) Amortizado via Split Payment:</span><strong style={{ color: '#2563eb' }}>R$ {formatMoeda(apuracaoIbs.retidoSplit)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', marginTop: '8px', paddingTop: '8px', fontSize: '14px', fontWeight: '900', color: saldoFinalIbs <= 0 ? '#16a34a' : '#dc2626' }}>
                    <span>(=) {saldoFinalIbs <= 0 ? 'SALDO CREDOR (CASHBACK PJ):' : 'SALDO DEVEDOR A RECOLHER:'}</span>
                    <span>R$ {formatMoeda(Math.abs(saldoFinalIbs))}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* TABELA DE DOCUMENTOS ESCRITURADOS NA APURAÇÃO ASSISTIDA */}
            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14px' }}>
              📑 Razão Auxiliar de Documentos Fiscais Escriturados no Período
            </h4>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px' }}>ID Doc</th>
                    <th style={{ padding: '10px 12px' }}>Operação</th>
                    <th style={{ padding: '10px 12px' }}>Regra Aplicada</th>
                    <th style={{ padding: '10px 12px' }}>Participante / Regime</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Base IVA</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>CBS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>IBS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status Split</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoNotas.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 'bold' }}>{h.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10.5px',
                          backgroundColor: h.tipo === 'SAIDA_VENDA' ? '#fee2e2' : '#dcfce7',
                          color: h.tipo === 'SAIDA_VENDA' ? '#991b1b' : '#166534'
                        }}>
                          {h.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{h.regra}</td>
                      <td style={{ padding: '10px 12px' }}>{h.parceiro}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>R$ {formatMoeda(h.baseIva)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatMoeda(h.cbsValor)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatMoeda(h.ibsValor)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {h.splitQuitado ? '🟢 Quitado no Split' : '🟡 Guia Manual'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 5: PAYLOAD JSON COMPLETO PARA ENGENHARIA DE DADOS
           =================================================================== */}
        {abaInterna === 'json' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                💻 Payload JSON Oficial da Simulação (Estrutura de 4 Blocos da Reforma Tributária)
              </strong>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(payloadJsonGerado, null, 2));
                  if (mostrarToast) mostrarToast('Payload JSON copiado para a área de transferência!', 'sucesso');
                }}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 Copiar JSON
              </button>
            </div>
            <pre style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '12.5px', lineHeight: '1.5', fontFamily: 'monospace', margin: 0 }}>
              {JSON.stringify(payloadJsonGerado, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}