import React, { useState } from 'react';

export default function SimuladorAtualizacaoJudiciaria({ mostrarToast }) {
  // ==========================================
  // 1. CATÁLOGO COMPLETO DE DOSSIÊS (CENÁRIOS)
  // ==========================================
  const catalogoDossies = [
    {
      id: 'bancario',
      codigo: 'PROC-CIV-01',
      nome: '🏦 Ação Revisional de Contrato Bancário & Capital de Giro',
      perfil: 'Perícia Financeira • Tabela Price, Venda Casada e Taxa BACEN',
      areaMotor: 'bancario',
      descricao: 'Empresa tomou R$ 80.000 de capital de giro, mas o banco embutiu R$ 6.000 de tarifas/seguros sem autorização (venda casada) e cobrou juros compostos de 2,85% a.m. (acima da média de mercado do BACEN de 1,65% a.m.).',
      dadosProcesso: {
        numero: '1045892-33.2025.8.26.0100', vara: '8ª Vara Cível Central', comarca: 'São Paulo - SP',
        autor: 'Metalúrgica Vanguarda Ltda.', reu: 'Banco Mercantil S.A.',
        objeto: 'Expurgo de tarifas capitalizadas, adequação à taxa média do BACEN e recálculo de saldo devedor.',
        valorCausa: 112400, dataDistribuicao: '2025-01-20', dataCitacao: '2025-02-15',
        resumoInicial: 'A Autora alega que contratou R$ 80.000,00, porém a Cédula de Crédito Bancário (CCB) partiu de R$ 86.000,00 devido à inclusão abusiva de TAC e Seguro Prestamista (Tema 972 STJ). Aponta capitalização de juros (anatocismo) acima da taxa média do BACEN.',
        resumoContestacao: 'O Banco Réu sustenta o princípio do pacta sunt servanda, afirmando que as taxas foram livremente pactuadas na CCB e que a Tabela Price é legal no Sistema Financeiro Nacional.',
        decisaoSaneadora: 'Defiro a prova pericial contábil. O Sr. Perito deverá apresentar cenários comparativos: (1) Evolução original do Banco; (2) Expurgo das tarifas ilegais + Taxa Média BACEN em Price; e (3) Método de Gauss (Juros Simples), apurando o indébito.'
      },
      honorarios: { horasLeitura: 4, horasDiligencias: 4, horasCalculos: 14, horasRedacao: 8, horasEsclarecimentos: 4, valorHoraTecnica: 420, despesasDeslocamento: 200, complexidadeFator: 1.0, prazoAceiteDias: 5, prazoEntregaDias: 30, JustificativaComplexidade: 'Recálculo de amortização em múltiplos sistemas financeiros (Price e Gauss) e conciliação de extratos.' },
      diligencias: [
        { id: 1, documento: 'Cédula de Crédito Bancário (CCB) original assinada e Quadro Resumo CET', responsavel: 'Réu', prazo: '10 dias', status: 'entregue', baseLegal: 'Art. 396 CPC' },
        { id: 2, documento: 'Extrato analítico da conta corrente demonstrando os débitos das 18 parcelas pagas', responsavel: 'Autor', prazo: '10 dias', status: 'entregue', baseLegal: 'Art. 473 §3º CPC' },
        { id: 3, documento: 'Apólice do Seguro Prestamista com opção de escolha de seguradora (Tema 972 STJ)', responsavel: 'Réu', prazo: '10 dias', status: 'recusado', baseLegal: 'Art. 400 CPC (Presunção de venda casada)' }
      ],
      quesitos: [
        { id: 1, origem: 'Juízo', pergunta: 'Qual o valor efetivamente disponibilizado em conta para a Autora e quais tarifas foram financiadas junto ao principal?', resposta: 'Conforme auditoria da CCB e extrato bancário, foi liberado o valor líquido de R$ 80.000,00. Entretanto, o Banco financiou o montante de R$ 86.000,00, embutindo R$ 3.500,00 de tarifas administrativas e R$ 2.500,00 de seguro prestamista sem apólice autônoma.', dicaEstrategica: 'Seja objetivo e aponte o documento exato (CCB vs Extrato de Crédito).' },
        { id: 2, origem: 'Autor', pergunta: 'Queira o Sr. Perito demonstrar a diferença cobrada a maior nas 18 parcelas já pagas considerando o expurgo das tarifas e a taxa média do BACEN (1,65% a.m.).', resposta: 'Reportando-se à Memória de Cálculo (Seção 4 deste Laudo), a prestação contratual de R$ 3.854,91 reduz-se para R$ 2.965,24 (Price Expurgada / BACEN) ou R$ 2.660,36 (Gauss), gerando crédito favorável à Autora.', dicaEstrategica: 'Responda apresentando os dois cenários técnicos para que o Juiz escolha a tese jurídica na sentença.' },
        { id: 3, origem: 'Réu', pergunta: 'O Sr. Perito concorda que o contrato é ato jurídico perfeito e que o Judiciário não pode revisar cláusulas livremente aceitas?', resposta: 'Quesito prejudicado. A análise da validade jurídica de cláusulas contratuais e do princípio do pacta sunt servanda constitui matéria estritamente de direito, extrapolando o escopo técnico-científico contábil, nos termos do Art. 473, inciso III do CPC e item 27 da NBC TP 01.', dicaEstrategica: 'Armadilha clássica de advogado! Nunca opine sobre lei ou justiça; invoque o Art. 473, III do CPC.' }
      ],
      conclusao: 'Conclui-se tecnicamente que houve capitalização sobre tarifas embutidas no principal (R$ 6.000,00) e aplicação de taxa efetiva de 2,85% a.m. em dissonância com a série histórica do BACEN (1,65% a.m.), resultando em excesso de execução detalhado nos quadros demonstrativos anexos.'
    },
    {
      id: 'trabalhista',
      codigo: 'PROC-TRAB-02',
      nome: '👷 Liquidação de Sentença Trabalhista & Reflexos em Cascata',
      perfil: 'Perícia Trabalhista • Horas Extras, Insalubridade, Súmula 264 e FGTS 40%',
      areaMotor: 'trabalhista',
      descricao: 'Reclamante obteve sentença favorável condenando a empresa ao pagamento de 28 horas extras mensais (50%), 8 horas em domingos/feriados (100%), adicional de insalubridade em grau médio (20%) e reflexos em DSR, Férias + 1/3, 13º Salário e FGTS + 40% durante 24 meses.',
      dadosProcesso: {
        numero: '0010845-77.2025.5.02.0044', vara: '44ª Vara do Trabalho', comarca: 'São Paulo - SP',
        autor: 'Marcos Antônio Oliveira', reu: 'Logística Rápida Transportes Ltda.',
        objeto: 'Liquidação de sentença por cálculos: apuração de horas suplementares, adicional de insalubridade, reflexos trabalhistas e cota previdenciária.',
        valorCausa: 68500, dataDistribuicao: '2025-03-10', dataCitacao: '2025-04-02',
        resumoInicial: 'O Reclamante comprovou que cumpria jornada suplementar sem a correta anotação nos controles de frequência ("ponto britânico" invalidado via Súmula 338 do TST) e laborava exposto a agentes químicos sem EPI eficaz.',
        resumoContestacao: 'A Reclamada impugna a média de horas extras alegada e requer que o adicional de insalubridade não integre a base de cálculo das horas extras, além da dedução dos valores pagos sob idêntica rubrica (OJ 415 SDI-1).',
        decisaoSaneadora: 'Transitada em julgado a sentença parcialmente procedente. Nomeio o Perito Contábil para apresentar os cálculos de liquidação (Art. 879 CLT), observando a Súmula 264 do TST para a base da hora extra e a evolução do FGTS + 40%.'
      },
      honorarios: { horasLeitura: 3, horasDiligencias: 3, horasCalculos: 12, horasRedacao: 6, horasEsclarecimentos: 4, valorHoraTecnica: 390, despesasDeslocamento: 150, complexidadeFator: 1.0, prazoAceiteDias: 5, prazoEntregaDias: 20, JustificativaComplexidade: 'Apuração mensal de cartões de ponto, recomposição da base salarial (Súmula 264 TST) e reflexos em cascata.' },
      diligencias: [
        { id: 1, documento: 'Fichas Financeiras e Holerites analíticos dos 24 meses do período imprescrito', responsavel: 'Réu', prazo: '8 dias', status: 'entregue', baseLegal: 'Art. 464 CLT' },
        { id: 2, documento: 'Espelhos de ponto eletrônicos (REP) e Acordo Coletivo da categoria', responsavel: 'Réu', prazo: '8 dias', status: 'entregue', baseLegal: 'Art. 74 §2º CLT' },
        { id: 3, documento: 'Extrato Analítico da Conta Vinculada do FGTS (Caixa Econômica Federal)', responsavel: 'Autor', prazo: '8 dias', status: 'entregue', baseLegal: 'Lei 8.036/90' }
      ],
      quesitos: [
        { id: 1, origem: 'Juízo', pergunta: 'Qual a base de cálculo utilizada para a apuração das horas extras deferidas na r. Sentença?', resposta: 'Em estrita observância à Súmula 264 do TST e ao comando sentencial, a base de cálculo das horas suplementares foi composta pelo salário base contratual acrescido do adicional de insalubridade apurado, aplicando-se o divisor 220.', dicaEstrategica: 'Fundamente sempre na Súmula 264 do TST (a hora extra incide sobre todas as parcelas de natureza salarial).' },
        { id: 2, origem: 'Autor', pergunta: 'Queira o Sr. Perito demonstrar o impacto dos reflexos das horas extras no DSR e, posteriormente, nas Férias + 1/3, 13º Salário e FGTS + 40%.', resposta: 'Os valores estão discriminados na Memória de Cálculo Trabalhista (Seção 4). As horas extras geraram reflexos diretos em DSR (Súmula 172 TST), Férias gozadas/indenizadas com terço constitucional, 13º salários e incidência de 8% de FGTS acrescido da multa rescisória de 40%.', dicaEstrategica: 'Atenção à OJ 394 da SDI-1 (Tema Repetitivo IRR-10169-57.2013.5.05.0024): verifique a data das horas extras para evitar bis in idem.' },
        { id: 3, origem: 'Réu', pergunta: 'Foram deduzidos os descontos fiscais (IRRF) e previdenciários (INSS cota parte do empregado) nos termos da Súmula 368 do TST?', resposta: 'Sim. Conforme demonstrado no quadro resumo da liquidação, foi apurada e retida a cota-parte previdenciária do Reclamante (observado o teto do INSS) sobre as verbas de natureza salarial (salários, HE, 13º e DSR), isentando-se as verbas indenizatórias (Férias Indenizatórias e FGTS + 40%).', dicaEstrategica: 'Mostre domínio tributário separando verbas salariais (incide INSS) de verbas indenizatórias (não incide INSS).' }
      ],
      conclusao: 'Apurou-se o crédito trabalhista bruto e líquido devido ao Reclamante, bem como os encargos previdenciários patronais e do segurado, tudo em fiel cumprimento à coisa julgada (Art. 879, §1º da CLT).'
    },
    {
      id: 'societario',
      codigo: 'PROC-SOC-03',
      nome: '🏢 Dissolução Parcial de Sociedade, Valuation & Balanço de Determinação',
      perfil: 'Perícia Societária • Art. 606 CPC, Passivo Oculto e Goodwill (Fundo de Comércio)',
      areaMotor: 'societario',
      descricao: 'Sócio detentor de 35% das quotas retirou-se da sociedade. A empresa apresentou um Balanço Contábil Histórico subavaliado para pagar menos, omitindo a valorização de imóveis/máquinas e o Fundo de Comércio (Goodwill), mas a auditoria também descobriu um passivo trabalhista oculto.',
      dadosProcesso: {
        numero: '1089312-11.2025.8.26.0100', vara: '2ª Vara Empresarial e de Conflitos de Arbitragem', comarca: 'São Paulo - SP',
        autor: 'Ricardo Almeida (Sócio Retirante - 35%)', reu: 'TechPlast Indústria de Polímeros Ltda. e Outros',
        objeto: 'Apuração de Haveres mediante levantamento de Balanço Especial de Determinação a valor de saída (mercado) e avaliação de intangíveis (Goodwill).',
        valorCausa: 850000, dataDistribuicao: '2025-02-05', dataCitacao: '2025-03-01',
        resumoInicial: 'O Sócio Retirante (35% do capital) notificou sua saída imotivada (Art. 1.029 CC). Alega que o Patrimônio Líquido contábil de R$ 900.000,00 está defasado a custo histórico e requer avaliação a preço de mercado mais o Fundo de Comércio (Goodwill).',
        resumoContestacao: 'A Sociedade Ré alega que os haveres devem se limitar ao Balanço Patrimonial contábil ordinário e aponta que existem contingências trabalhistas e fiscais não provisionadas que reduzem o valor da empresa.',
        decisaoSaneadora: 'Fixo a data da resolução da sociedade no 60º dia após a notificação. Nomeio Perito Contábil (Art. 604, III CPC) para levantar o Balanço de Determinação (Art. 606 CPC), avaliando bens corpóreos e incorpóreos a preço de saída, bem como auditando eventuais passivos contingentes.'
      },
      honorarios: { horasLeitura: 6, horasDiligencias: 10, horasCalculos: 24, horasRedacao: 12, horasEsclarecimentos: 6, valorHoraTecnica: 480, despesasDeslocamento: 450, complexidadeFator: 1.2, prazoAceiteDias: 5, prazoEntregaDias: 45, JustificativaComplexidade: 'Levantamento de Balanço Especial de Determinação, teste de recuperabilidade de ativos, auditoria de passivos ocultos e mensuração de Goodwill.' },
      diligencias: [
        { id: 1, documento: 'Escrituração Contábil Digital (SPED ECD - Livro Diário e Razão) dos últimos 3 exercícios', responsavel: 'Réu', prazo: '15 dias', status: 'entregue', baseLegal: 'Art. 1.179 CC e Art. 418 CPC' },
        { id: 2, documento: 'Laudo técnico de avaliação mercadológica do galpão industrial e maquinário', responsavel: 'Ambos', prazo: '15 dias', status: 'entregue', baseLegal: 'Art. 606 CPC' },
        { id: 3, documento: 'Relatório de circularização jurídica das ações trabalhistas e autuações fiscais em curso (Passivo Contingente)', responsavel: 'Réu', prazo: '15 dias', status: 'entregue', baseLegal: 'NBC TG 25 (Provisões)' }
      ],
      quesitos: [
        { id: 1, origem: 'Juízo', pergunta: 'Qual o valor do Patrimônio Líquido Contábil na data-base da resolução e qual o Patrimônio Líquido Ajustado após o Balanço de Determinação?', resposta: 'Na data-base da resolução, o PL Contábil histórico registrava R$ 900.000,00. Após os ajustes periciais a valor de mercado (mais-valia de imóveis/máquinas de R$ 420.000,00, baixa de créditos incobráveis de R$ 45.000,00 e reconhecimento de passivo trabalhista/fiscal provável de R$ 115.000,00), o PL Ajustado (Tangível) passou a R$ 1.160.000,00.', dicaEstrategica: 'Mostre imparcialidade: some a valorização dos ativos (bom para o autor), mas desconte a PCLD e os passivos ocultos (bom para o réu).' },
        { id: 2, origem: 'Autor', pergunta: 'Queira o Sr. Perito apurar o Fundo de Comércio (Goodwill) com base na rentabilidade superavitária da empresa.', resposta: 'Aplicando-se a metodologia de avaliação do Goodwill (excedente de lucros / múltiplos operacionais líquidos do custo de oportunidade do capital próprio), apurou-se o ativo intangível gerado internamente no montante demonstrado na Seção 4 deste Laudo, integrando a base de haveres conforme Art. 606 do CPC.', dicaEstrategica: 'O Art. 606 do CPC exige expressamente que os bens "incorpóreos" (Goodwill/Marca) entrem na conta de saída.' },
        { id: 3, origem: 'Réu', pergunta: 'Como deve ser feito o pagamento dos haveres para não quebrar o fluxo de caixa da empresa?', resposta: 'Nos termos do Art. 1.031, §2º do Código Civil (caso omisso o Contrato Social), a quota liquidada deve ser paga em dinheiro no prazo de 90 dias, salvo acordo ou estipulação contratual de parcelamento judicial.', dicaEstrategica: 'Cite o Art. 1.031 §2º do Código Civil, mas lembre que o contrato social pode prever parcelamento em 12, 24 ou 36 vezes.' }
      ],
      conclusao: 'O Balanço de Determinação evidenciou o Valor Econômico Total da sociedade (Patrimônio Líquido Ajustado a Preço de Saída + Goodwill), cabendo ao Sócio Retirante o equivalente à sua participação societária de 35%.'
    },
    {
      id: 'lucros_cessantes',
      codigo: 'PROC-IND-04',
      nome: '📉 Indenização por Lucros Cessantes, Dano Emergente & Atualização Judicial',
      perfil: 'Perícia Empresarial • Margem de Contribuição, Sazonalidade e Art. 523 CPC',
      areaMotor: 'lucros',
      descricao: 'Uma indústria gráfica ficou 4 meses totalmente paralisada devido ao rompimento de cabos e falha no transformador da concessionária de energia. O Perito precisa separar o que é Dano Emergente (prejuízo imediato) do que é Lucro Cessante (o que razoavelmente deixou de lucrar, descontando custos variáveis não incorridos).',
      dadosProcesso: {
        numero: '1011223-99.2025.8.26.0053', vara: '5ª Vara Cível', comarca: 'Campinas - SP',
        autor: 'Gráfica Expressa Editorial Ltda.', reu: 'Companhia Força e Luz S.A.',
        objeto: 'Quantificação de Danos Emergentes (equipamentos queimados e insumos perdidos) e Lucros Cessantes (Art. 402 CC) com atualização monetária.',
        valorCausa: 410000, dataDistribuicao: '2025-01-12', dataCitacao: '2025-02-10',
        resumoInicial: 'A Autora pleiteia o reembolso das placas eletrônicas queimadas (R$ 48.000,00) e R$ 320.000,00 de lucros cessantes (4 meses x R$ 80.000,00 de faturamento bruto médio que deixou de emitir).',
        resumoContestacao: 'A Concessionária Ré argumenta que a Autora está cobrando o "Faturamento Bruto" como se fosse "Lucro", enriquecendo ilicitamente, pois durante os 4 meses parada ela não gastou matéria-prima (papel/tinta), energia nem impostos sobre vendas (Simples/ICMS/PIS/COFINS).',
        decisaoSaneadora: 'Determino perícia contábil para apurar: (1) Os danos emergentes comprovados por notas fiscais; e (2) Os lucros cessantes reais baseados na média histórica da DRE, deduzindo os custos e despesas variáveis não realizados no período de inatividade.'
      },
      honorarios: { horasLeitura: 4, horasDiligencias: 5, horasCalculos: 15, horasRedacao: 8, horasEsclarecimentos: 4, valorHoraTecnica: 440, despesasDeslocamento: 300, complexidadeFator: 1.0, prazoAceiteDias: 5, prazoEntregaDias: 30, JustificativaComplexidade: 'Auditoria de notas fiscais de sinistro, análise vertical/horizontal de DRE de 12 meses e aplicação de índices do TJSP + Art. 523 CPC.' },
      diligencias: [
        { id: 1, documento: 'Balancetes mensais e DRE analítica dos 12 meses anteriores ao sinistro (Base Histórica)', responsavel: 'Autor', prazo: '10 dias', status: 'entregue', baseLegal: 'Art. 402 Código Civil' },
        { id: 2, documento: 'Notas Fiscais de conserto das máquinas impressoras e laudo técnico de engenharia elétrica', responsavel: 'Autor', prazo: '10 dias', status: 'entregue', baseLegal: 'Art. 373, I CPC' },
        { id: 3, documento: 'Extratos do PGDAS-D / EFD-Contribuições comprovando a alíquota efetiva de tributos sobre o faturamento', responsavel: 'Autor', prazo: '10 dias', status: 'entregue', baseLegal: 'NBC TP 01' }
      ],
      quesitos: [
        { id: 1, origem: 'Juízo', pergunta: 'Por que o Lucro Cessante não pode ser calculado simplesmente multiplicando o Faturamento Bruto mensal pelos 4 meses de paralisação?', resposta: 'Nos termos do Art. 402 do Código Civil e da doutrina contábil forense, indenizar o faturamento bruto geraria enriquecimento sem causa, visto que na paralisação a empresa não incorreu nos Custos Variáveis (matéria-prima, insumos) nem nos Tributos sobre Vendas. A recomposição patrimonial justa deve considerar a Margem de Contribuição / Lucro Operacional que deixou de ingressar para cobrir os custos fixos e remunerar o capital.', dicaEstrategica: 'Esta é a pergunta de ouro em perícias de indenização! Explique a diferença entre Faturamento Bruto e Margem de Contribuição / Lucro Cessante.' },
        { id: 2, origem: 'Autor', pergunta: 'Qual o montante atualizado da condenação somando Danos Emergentes e Lucros Cessantes, acrescidos de correção monetária e juros de mora desde a citação?', resposta: 'O cálculo consolidado na Seção 4 demonstra o valor histórico composto pelos Danos Emergentes + Lucros Cessantes auditados, devidamente atualizados pela Tabela Prática do Tribunal e acrescidos de juros moratórios e encargos de cumprimento de sentença.', dicaEstrategica: 'Separe claramente o valor histórico do valor corrigido e dos juros.' }
      ],
      conclusao: 'A auditoria contábil expurgou os custos variáveis não incorridos do pleito inicial, apurando com exatidão técnica o Lucro Cessante efetivo somado aos Danos Emergentes documentados, atualizados até a presente data.'
    }
  ];

  // ==========================================
  // 2. ESTADOS OPERACIONAIS DO SISTEMA
  // ==========================================
  const [dossieAtivo, setDossieAtivo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('autos');
  const [papelPericial, setPapelPericial] = useState('perito_juizo');
  const [motorAtivo, setMotorAtivo] = useState('bancario');
  const [tipoDocumentoImpressao, setTipoDocumentoImpressao] = useState('laudo_completo');

  const [proc, setProc] = useState({
    numero: '', vara: '', comarca: '', autor: '', reu: '', objeto: '', valorCausa: 0,
    dataDistribuicao: '', dataCitacao: '', resumoInicial: '', resumoContestacao: '', decisaoSaneadora: ''
  });

  const [peritoInfo, setPeritoInfo] = useState({
    nome: 'André Lopes da Silva', crc: '1SP-999999/O-0', cnpc: 'CNPC-8842', email: 'pericia@contabilcloud.com.br'
  });

  const [hon, setHon] = useState({
    horasLeitura: 4, horasDiligencias: 4, horasCalculos: 14, horasRedacao: 8, horasEsclarecimentos: 4,
    valorHoraTecnica: 420, despesasDeslocamento: 200, complexidadeFator: 1.0, prazoAceiteDias: 5, prazoEntregaDias: 30,
    JustificativaComplexidade: ''
  });

  const [listaDiligencias, setListaDiligencias] = useState([]);
  const [novaDiligencia, setNovaDiligencia] = useState({ documento: '', responsavel: 'Réu', prazo: '10 dias', baseLegal: 'Art. 396 CPC' });

  const [listaQuesitos, setListaQuesitos] = useState([]);
  const [novoQuesito, setNovoQuesito] = useState({ origem: 'Juízo', pergunta: '', resposta: '', dicaEstrategica: 'Responda com base nos documentos e cálculos da Seção 4.' });
  const [conclusaoTexto, setConclusaoTexto] = useState('');

  // Parâmetros dos 4 Motores
  const [paramBancario, setParamBancario] = useState({
    valorLiberado: 80000, tarifasIndevidas: 6000, taxaContratoMes: 2.85, taxaBacenMes: 1.65, prazoMeses: 36, parcelasPagas: 18
  });

  const [paramTrabalhista, setParamTrabalhista] = useState({
    salarioBase: 3200, salarioMinimo: 1518, grauInsalubridadePct: 20, periculosidadePct: 0,
    divisorJornada: 220, qtdHe50Mes: 28, qtdHe100Mes: 8, mesesApuracao: 24,
    incluirReflexoDsr: true, incluirFgtsMulta40: true
  });

  const [paramSocietario, setParamSocietario] = useState({
    plContabilHistorico: 900000, maisValiaImoveisMaquinas: 420000, baixaCreditosIncobraveis: 45000,
    passivoTrabalhistaFiscalOculto: 115000, lucroLiquidoMedioMensal: 45000, taxaRemuneracaoCapitalNormalAno: 12,
    anosMultiplicadorGoodwill: 3, participacaoSocioRetirantePct: 35
  });

  const [paramLucros, setParamLucros] = useState({
    faturamentoBrutoMensalMedio: 80000, custosVariaveisPct: 42, impostosSobreVendasPct: 11,
    mesesParalisacao: 4, danosEmergentesNotaFiscal: 48000,
    indiceCorrecaoAcumuladoPct: 8.4, mesesJurosMora1Pct: 12, aplicarMulta523Cpc: true
  });

  // ==========================================
  // 3. CARREGAMENTO DOS CENÁRIOS
  // ==========================================
  const carregarDossie = (dossie) => {
    setDossieAtivo(dossie);
    setProc({ ...dossie.dadosProcesso });
    setHon({ ...dossie.honorarios });
    setListaDiligencias(dossie.diligencias.map(d => ({ ...d })));
    setListaQuesitos(dossie.quesitos.map(q => ({ ...q })));
    setConclusaoTexto(dossie.conclusao);
    setMotorAtivo(dossie.areaMotor);
    setAbaAtiva('autos');
    if (typeof mostrarToast === 'function') {
      mostrarToast(`Dossiê "${dossie.codigo}" aberto! Analise os Autos na Etapa 1.`, 'sucesso');
    }
  };

  const iniciarConsultoriaEmBranco = () => {
    const custom = {
      id: 'custom', codigo: 'CONSULT-REAL', nome: '💼 Consultoria Pericial / Caso Real do Escritório',
      perfil: 'Modo Livre • Perícia Judicial ou Assistência Técnica Empresarial', areaMotor: 'bancario'
    };
    setDossieAtivo(custom);
    setProc({
      numero: '0000000-00.2026.8.26.0100', vara: '1ª Vara Cível / Empresarial', comarca: 'São Paulo - SP',
      autor: 'Empresa / Requerente A', reu: 'Instituição / Requerido B',
      objeto: 'Auditoria contábil e apuração técnica de valores controvertidos.',
      valorCausa: 100000, dataDistribuicao: '2026-02-01', dataCitacao: '2026-03-01',
      resumoInicial: 'Descreva aqui os pedidos da petição inicial ou o escopo da consultoria contratada.',
      resumoContestacao: 'Descreva aqui as teses de defesa da parte contrária.',
      decisaoSaneadora: 'Defina os pontos controvertidos fixados pelo Juiz ou solicitados pelo cliente.'
    });
    setListaDiligencias([
      { id: 1, documento: 'Contratos, Extratos e Escrituração Contábil (SPED)', responsavel: 'Réu', prazo: '10 dias', status: 'pendente', baseLegal: 'Art. 396 CPC' }
    ]);
    setListaQuesitos([
      { id: 1, origem: 'Juízo', pergunta: 'Queira o Sr. Perito demonstrar a evolução analítica do débito/crédito controvertido.', resposta: '', dicaEstrategica: 'Fundamente nos cálculos processados na Etapa 4.' }
    ]);
    setConclusaoTexto('Diante dos exames periciais realizados em estrita observância à NBC TP 01 (R1), submete-se o presente trabalho técnico à elevada apreciação.');
    setAbaAtiva('autos');
    if (typeof mostrarToast === 'function') {
      mostrarToast('Modo Escritório Ativado! Preencha os dados do seu cliente ou processo.', 'sucesso');
    }
  };

  // ==========================================
  // 4. CÁLCULOS MATEMÁTICOS EM TEMPO REAL
  // ==========================================
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 1. Motor Bancário
  const calcBancarioRes = (() => {
    const pvLiquido = Math.max(0, Number(paramBancario.valorLiberado) || 0);
    const tarifas = Math.max(0, Number(paramBancario.tarifasIndevidas) || 0);
    const pvBanco = pvLiquido + tarifas;
    const iBanco = (Math.max(0.01, Number(paramBancario.taxaContratoMes) || 0)) / 100;
    const iBacen = (Math.max(0.01, Number(paramBancario.taxaBacenMes) || 0)) / 100;
    const n = Math.max(1, Number(paramBancario.prazoMeses) || 1);
    const pagas = Math.min(n, Math.max(0, Number(paramBancario.parcelasPagas) || 0));

    const pmtBanco = pvBanco * ((iBanco * Math.pow(1 + iBanco, n)) / (Math.pow(1 + iBanco, n) - 1));
    const pmtPricePericia = pvLiquido * ((iBacen * Math.pow(1 + iBacen, n)) / (Math.pow(1 + iBacen, n) - 1));
    const pmtGauss = (2 * pvLiquido * (1 + (iBacen * n))) / (n * (2 + iBacen * (n - 1)));

    const totalContratoBanco = pmtBanco * n;
    const totalPricePericia = pmtPricePericia * n;
    const totalGauss = pmtGauss * n;

    const diferencaParcelaPrice = Math.max(0, pmtBanco - pmtPricePericia);
    const indebitoSimplesPagas = diferencaParcelaPrice * pagas;
    const indebitoDobroArt42CDC = indebitoSimplesPagas * 2;
    const economiaTotalGauss = Math.max(0, totalContratoBanco - totalGauss);

    return {
      pvLiquido, pvBanco, tarifas, pmtBanco, pmtPricePericia, pmtGauss,
      totalContratoBanco, totalPricePericia, totalGauss,
      indebitoSimplesPagas, indebitoDobroArt42CDC, economiaTotalGauss, pagas, n
    };
  })();

  // 2. Motor Trabalhista
  const calcTrabalhistaRes = (() => {
    const salBase = Math.max(0, Number(paramTrabalhista.salarioBase) || 0);
    const salMin = Math.max(0, Number(paramTrabalhista.salarioMinimo) || 0);
    const insalubMes = salMin * ((Number(paramTrabalhista.grauInsalubridadePct) || 0) / 100);
    const periculMes = salBase * ((Number(paramTrabalhista.periculosidadePct) || 0) / 100);
    
    const baseCompostaHora = salBase + insalubMes + periculMes;
    const divisor = Math.max(100, Number(paramTrabalhista.divisorJornada) || 220);
    const valorHoraNormal = baseCompostaHora / divisor;
    
    const valorHe50Mes = (valorHoraNormal * 1.5) * (Number(paramTrabalhista.qtdHe50Mes) || 0);
    const valorHe100Mes = (valorHoraNormal * 2.0) * (Number(paramTrabalhista.qtdHe100Mes) || 0);
    const totalHeMes = valorHe50Mes + valorHe100Mes;

    const dsrMes = paramTrabalhista.incluirReflexoDsr ? (totalHeMes / 6) : 0;
    const baseReflexos = totalHeMes + dsrMes + insalubMes + periculMes;
    const reflexo13Mes = baseReflexos / 12;
    const reflexoFeriasTercoMes = (baseReflexos / 12) * (4 / 3);

    const meses = Math.max(1, Number(paramTrabalhista.mesesApuracao) || 1);
    const subtotalBrutoPeriodo = (insalubMes + periculMes + totalHeMes + dsrMes + reflexo13Mes + reflexoFeriasTercoMes) * meses;

    const baseFgtsPeriodo = (insalubMes + periculMes + totalHeMes + dsrMes + reflexo13Mes) * meses;
    const fgts8Pct = baseFgtsPeriodo * 0.08;
    const multa40Fgts = paramTrabalhista.incluirFgtsMulta40 ? (fgts8Pct * 0.40) : 0;

    const inssEmpregado = Math.min(meses * 908.85, baseFgtsPeriodo * 0.095);
    const totalCondenacaoBruta = subtotalBrutoPeriodo + fgts8Pct + multa40Fgts;
    const liquidoReclamante = totalCondenacaoBruta - inssEmpregado;

    return {
      baseCompostaHora, valorHoraNormal, insalubMes, periculMes, valorHe50Mes, valorHe100Mes,
      totalHeMes, dsrMes, reflexo13Mes, reflexoFeriasTercoMes, meses,
      subtotalBrutoPeriodo, fgts8Pct, multa40Fgts, inssEmpregado, totalCondenacaoBruta, liquidoReclamante
    };
  })();

  // 3. Motor Societário
  const calcSocietarioRes = (() => {
    const plContabil = Number(paramSocietario.plContabilHistorico) || 0;
    const maisValia = Number(paramSocietario.maisValiaImoveisMaquinas) || 0;
    const baixaAtivos = Number(paramSocietario.baixaCreditosIncobraveis) || 0;
    const passivoOculto = Number(paramSocietario.passivoTrabalhistaFiscalOculto) || 0;

    const plAjustadoMercado = plContabil + maisValia - baixaAtivos - passivoOculto;
    const lucroAnual = (Number(paramSocietario.lucroLiquidoMedioMensal) || 0) * 12;
    const remuneracaoNormalCapital = plAjustadoMercado * ((Number(paramSocietario.taxaRemuneracaoCapitalNormalAno) || 12) / 100);
    const superLucroAnual = Math.max(0, lucroAnual - remuneracaoNormalCapital);
    const goodwillApurado = superLucroAnual * (Number(paramSocietario.anosMultiplicadorGoodwill) || 3);

    const valuationTotalEmpresa = plAjustadoMercado + goodwillApurado;
    const quotaPct = (Number(paramSocietario.participacaoSocioRetirantePct) || 0) / 100;
    const haveresPeloContabil = plContabil * quotaPct;
    const haveresBalançoDeterminacao = valuationTotalEmpresa * quotaPct;
    const ganhoPericialSocio = haveresBalançoDeterminacao - haveresPeloContabil;

    return {
      plContabil, maisValia, baixaAtivos, passivoOculto, plAjustadoMercado,
      lucroAnual, superLucroAnual, goodwillApurado, valuationTotalEmpresa,
      haveresPeloContabil, haveresBalançoDeterminacao, ganhoPericialSocio
    };
  })();

  // 4. Motor Lucros Cessantes & Cumprimento
  const calcLucrosRes = (() => {
    const fatMensal = Number(paramLucros.faturamentoBrutoMensalMedio) || 0;
    const meses = Math.max(1, Number(paramLucros.mesesParalisacao) || 1);
    const faturamentoPerdidoBruto = fatMensal * meses;

    const deducaoImpostos = faturamentoPerdidoBruto * ((Number(paramLucros.impostosSobreVendasPct) || 0) / 100);
    const deducaoCustosVariaveis = faturamentoPerdidoBruto * ((Number(paramLucros.custosVariaveisPct) || 0) / 100);
    const lucroCessanteLiquido = Math.max(0, faturamentoPerdidoBruto - deducaoImpostos - deducaoCustosVariaveis);
    const glosaExcessoPedido = faturamentoPerdidoBruto - lucroCessanteLiquido;

    const danosEmergentes = Number(paramLucros.danosEmergentesNotaFiscal) || 0;
    const principalHistoricoTotal = lucroCessanteLiquido + danosEmergentes;

    const correcaoMonetaria = principalHistoricoTotal * ((Number(paramLucros.indiceCorrecaoAcumuladoPct) || 0) / 100);
    const baseCorrigida = principalHistoricoTotal + correcaoMonetaria;
    const jurosMora = baseCorrigida * ((Number(paramLucros.mesesJurosMora1Pct) || 0) * 0.01);
    const subtotalAtualizado = baseCorrigida + jurosMora;

    const multaArt523 = paramLucros.aplicarMulta523Cpc ? (subtotalAtualizado * 0.10) : 0;
    const honorariosArt523 = paramLucros.aplicarMulta523Cpc ? (subtotalAtualizado * 0.10) : 0;
    const totalExecucaoJudicial = subtotalAtualizado + multaArt523 + honorariosArt523;

    return {
      faturamentoPerdidoBruto, deducaoImpostos, deducaoCustosVariaveis,
      lucroCessanteLiquido, glosaExcessoPedido, danosEmergentes, principalHistoricoTotal,
      correcaoMonetaria, jurosMora, subtotalAtualizado, multaArt523, honorariosArt523, totalExecucaoJudicial
    };
  })();

  const totalHorasPericia = Number(hon.horasLeitura || 0) + Number(hon.horasDiligencias || 0) + Number(hon.horasCalculos || 0) + Number(hon.horasRedacao || 0) + Number(hon.horasEsclarecimentos || 0);
  const subtotalHonorarios = totalHorasPericia * Number(hon.valorHoraTecnica || 0) * Number(hon.complexidadeFator || 1);
  const totalPropostaHonorarios = subtotalHonorarios + Number(hon.despesasDeslocamento || 0);

  // ==========================================
  // 5. MOTOR DE IMPRESSÃO A4 (PDF)
  // ==========================================
  const exportarDocumentoPDF = () => {
    const areaConteudo = document.getElementById('documento-forense-a4');
    if (!areaConteudo) {
      if (typeof mostrarToast === 'function') mostrarToast('Abra a Etapa 6 para pré-visualizar e imprimir o documento.', 'aviso');
      setAbaAtiva('emissao');
      return;
    }

    const janelaPrint = window.open('', '_blank', 'width=950,height=800');
    if (!janelaPrint) {
      alert('Por favor, permita pop-ups no navegador para gerar o PDF de impressão.');
      return;
    }

    janelaPrint.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Peça Técnica Pericial - Processo ${proc.numero}</title>
        <style>
          @page { size: A4; margin: 20mm 18mm 20mm 22mm; }
          body { font-family: 'Times New Roman', Georgia, serif; color: #0f172a; line-height: 1.6; font-size: 11.5pt; margin: 0; padding: 0; }
          h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 14px 0; font-family: Arial, sans-serif; font-size: 9.5pt; }
          th, td { border: 1px solid #64748b; padding: 7px 9px; text-align: left; }
          th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-weight: bold; }
          .no-break { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        ${areaConteudo.innerHTML}
      </body>
      </html>
    `);
    janelaPrint.document.close();
    janelaPrint.focus();
    setTimeout(() => {
      janelaPrint.print();
    }, 450);
  };

  // Estilos Padronizados
  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '11.5px', color: '#475569', display: 'block', marginBottom: '5px', wordBreak: 'break-word', textTransform: 'uppercase', letterSpacing: '0.3px' };
  const cardStyle = { backgroundColor: 'white', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };
  const boxMentorStyle = { backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px 16px', borderRadius: '12px', marginBottom: '18px', color: '#1e3a8a', fontSize: '12.5px', lineHeight: '1.6', boxSizing: 'border-box' };
  const boxAlertaLegalStyle = { backgroundColor: '#fefce8', borderLeft: '4px solid #eab308', padding: '14px 16px', borderRadius: '12px', marginBottom: '18px', color: '#713f12', fontSize: '12.5px', lineHeight: '1.6', boxSizing: 'border-box' };

  // ==========================================
  // TELA 0: HOME / CATÁLOGO DE DOSSIÊS
  // ==========================================
  if (!dossieAtivo) {
    return (
      <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '22px 24px', borderRadius: '16px 16px 0 0', borderBottom: '4px solid #2563eb', boxSizing: 'border-box', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>NBC TP 01 & NBC PP 01 • CPC ARTS. 464 A 480</span>
            <h2 style={{ margin: 0, fontSize: '19px', color: '#ffffff', fontWeight: '900' }}>⚖️ Laboratório Forense de Perícia Contábil & Consultoria</h2>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
            Simulador profissional completo: assuma processos judiciais reais como <strong>Perito Nomeado pelo Juiz</strong> ou como <strong>Assistente Técnico Contratado</strong>. Audite os autos, emita Termos de Diligência, processe os cálculos matemáticos e imprima Laudos e Pareceres em padrão A4.
          </p>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxSizing: 'border-box' }}>
          <div style={boxMentorStyle}>
            <strong>🎓 Guia para Alunos e Consultores:</strong> A perícia contábil segue um rito processual rigoroso. Escolha um dos <strong>4 Dossiês Judiciais Prontos</strong> abaixo para vivenciar um caso real passo a passo do início ao fim, ou clique em <strong>Modo Consultoria Real</strong> para usar os motores de cálculo com clientes do seu escritório.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 285px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
            {catalogoDossies.map(d => (
              <div key={d.id} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '800' }}>{d.perfil}</span>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{d.codigo}</span>
                  </div>
                  <h3 style={{ margin: '8px 0', fontSize: '15.5px', color: '#0f172a', fontWeight: '800', lineHeight: '1.35' }}>{d.nome}</h3>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', marginBottom: '14px' }}>{d.descricao}</p>
                  
                  <div style={{ fontSize: '11.5px', color: '#334155', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', lineHeight: '1.6', border: '1px solid #e2e8f0' }}>
                    <div><strong>Processo:</strong> {d.dadosProcesso.numero}</div>
                    <div><strong>Partes:</strong> {d.dadosProcesso.autor} × {d.dadosProcesso.reu}</div>
                    <div><strong>Valor da Causa:</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>R$ {formatMoeda(d.dadosProcesso.valorCausa)}</span></div>
                  </div>
                </div>

                <button type="button" onClick={() => carregarDossie(d)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
                  📂 Abrir Autos e Assumir Perícia →
                </button>
              </div>
            ))}
            {/* CARD MODO ESCRITÓRIO / CONSULTORIA REAL */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
              <div>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold' }}>Uso Profissional • Escritório Contábil</span>
                <h3 style={{ margin: '12px 0 8px 0', fontSize: '15.5px', color: '#166534', fontWeight: '800' }}>💼 Criar Perícia / Consultoria Real em Branco</h3>
                <p style={{ fontSize: '12px', color: '#15803d', lineHeight: '1.5', marginBottom: '14px' }}>
                  Precisa fazer um cálculo real para um cliente ou advogado parceiro? Abra um dossiê limpo, utilize os 4 motores matemáticos e imprima a Proposta de Honorários, o Parecer Técnico ou o Laudo Pericial pronto.
                </p>
              </div>
              <button type="button" onClick={iniciarConsultoriaEmBranco} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
                + Iniciar Novo Processo Real
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL DO LABORATÓRIO ATIVO (6 ABAS)
  // ==========================================
  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO EXECUTIVO DO PROCESSO */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 22px', borderRadius: '16px 16px 0 0', borderBottom: '4px solid #2563eb', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>{dossieAtivo.codigo}</span>
              <span style={{ backgroundColor: papelPericial === 'perito_juizo' ? '#10b981' : '#f59e0b', color: '#0f172a', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>
                {papelPericial === 'perito_juizo' ? '⚖️ PERITO DO JUÍZO (Art. 465 CPC)' : '🛡️ ASSISTENTE TÉCNICO DAS PARTES (Art. 466 CPC)'}
              </span>
              <strong style={{ fontSize: '16px', color: '#ffffff' }}>{dossieAtivo.nome}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span><strong>Autos nº:</strong> {proc.numero}</span>
              <span>•</span>
              <span><strong>Partes:</strong> {proc.autor} vs. {proc.reu}</span>
              <span>•</span>
              <span><strong>Honorários:</strong> <strong style={{ color: '#4ade80' }}>R$ {formatMoeda(totalPropostaHonorarios)}</strong> ({totalHorasPericia}h)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setAbaAtiva('emissao'); setTimeout(exportarDocumentoPDF, 200); }} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '9px 14px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>
              🖨️ Imprimir Peça A4 (PDF)
            </button>
            <button type="button" onClick={() => setDossieAtivo(null)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '9px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
              ✖ Trocar Dossiê
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGAÇÃO DAS 6 ETAPAS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px', borderRadius: '12px' }}>
          {[
            { id: 'autos', label: '1. 📂 Autos & Escopo' },
            { id: 'honorarios', label: '2. 💰 Honorários (CPC 465)' },
            { id: 'diligencias', label: '3. 🔎 Diligências & Provas' },
            { id: 'calculos', label: '4. 🧮 Motores de Cálculo' },
            { id: 'quesitos', label: '5. ❓ Quesitos (CPC 473)' },
            { id: 'emissao', label: '6. 📑 Laudo A4 & Legislação' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id)}
              style={{
                backgroundColor: abaAtiva === tab.id ? '#2563eb' : 'transparent',
                color: abaAtiva === tab.id ? '#ffffff' : '#cbd5e1',
                border: 'none', padding: '9px 13px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', flex: '1 1 auto', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO DO LABORATÓRIO */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxSizing: 'border-box', minHeight: '540px' }}>

        {/* ========================================================== */}
        {/* ETAPA 1: LEITURA DOS AUTOS E DEFINIÇÃO DE PAPEL PERICIAL   */}
        {/* ========================================================== */}
        {abaAtiva === 'autos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={boxMentorStyle}>
              <strong>🧭 Etapa 1 — Exame Preliminar dos Autos:</strong> Antes de digitar qualquer número, o perito lê a <em>Petição Inicial</em> (o que o Autor pede), a <em>Contestação</em> (a defesa do Réu) e a <strong>Decisão Saneadora do Juiz</strong> (que delimita exatamente o objeto da perícia). Escolha abaixo se você atuará como <strong>Perito do Juiz</strong> (imparcial) ou <strong>Assistente Técnico</strong> (contratado por uma das empresas).
            </div>

            {/* SELETOR DE PAPEL PROFISSIONAL */}
            <div style={cardStyle}>
              <label style={labelStyle}>Qual é a sua função neste processo?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px', marginTop: '8px' }}>
                {[
                  { id: 'perito_juizo', titulo: '⚖️ Perito Oficial do Juízo', desc: 'Nomeado pelo Juiz (Art. 465 CPC). Emite Laudo Pericial Contábil imparcial.' },
                  { id: 'assistente_autor', titulo: '🛡️ Assistente Técnico do Autor', desc: 'Contratado pela parte Autora (Art. 466 CPC). Formula quesitos e emite Parecer Técnico.' },
                  { id: 'assistente_reu', titulo: '🏢 Assistente Técnico do Réu', desc: 'Contratado pela empresa Ré para auditar e impugnar excessos de execução.' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setPapelPericial(p.id)}
                    style={{
                      padding: '12px', borderRadius: '12px', cursor: 'pointer',
                      border: papelPericial === p.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: papelPericial === p.id ? '#eff6ff' : '#f8fafc'
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{p.titulo}</strong>
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DADOS CADASTRAIS DO PROCESSO E DO PERITO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1e40af', borderBottom: '2px solid #bfdbfe', paddingBottom: '6px' }}>📋 Capa dos Autos Judiciais</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Nº dos Autos (Padrão CNJ):</label><input style={inputStyle} value={proc.numero} onChange={e => setProc({ ...proc, numero: e.target.value })} /></div>
                  <div><label style={labelStyle}>Vara / Juízo:</label><input style={inputStyle} value={proc.vara} onChange={e => setProc({ ...proc, vara: e.target.value })} /></div>
                  <div><label style={labelStyle}>Comarca / Foro:</label><input style={inputStyle} value={proc.comarca} onChange={e => setProc({ ...proc, comarca: e.target.value })} /></div>
                  <div><label style={labelStyle}>Parte Autora (Requerente):</label><input style={inputStyle} value={proc.autor} onChange={e => setProc({ ...proc, autor: e.target.value })} /></div>
                  <div><label style={labelStyle}>Parte Ré (Requerido):</label><input style={inputStyle} value={proc.reu} onChange={e => setProc({ ...proc, reu: e.target.value })} /></div>
                  <div><label style={labelStyle}>Valor da Causa (R$):</label><input type="number" style={inputStyle} value={proc.valorCausa} onChange={e => setProc({ ...proc, valorCausa: e.target.value })} /></div>
                  <div><label style={labelStyle}>Data da Citação (Mora):</label><input type="date" style={inputStyle} value={proc.dataCitacao} onChange={e => setProc({ ...proc, dataCitacao: e.target.value })} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Objeto da Perícia:</label><input style={inputStyle} value={proc.objeto} onChange={e => setProc({ ...proc, objeto: e.target.value })} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#166534', borderBottom: '2px solid #bbf7d0', paddingBottom: '6px' }}>🪪 Identificação do Perito / Consultor (NBC TP 01)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div><label style={labelStyle}>Nome Completo do Contador:</label><input style={inputStyle} value={peritoInfo.nome} onChange={e => setPeritoInfo({ ...peritoInfo, nome: e.target.value })} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div><label style={labelStyle}>Registro CRC Ativo:</label><input style={inputStyle} value={peritoInfo.crc} onChange={e => setPeritoInfo({ ...peritoInfo, crc: e.target.value })} /></div>
                    <div><label style={labelStyle}>Cadastro CNPC / CFC:</label><input style={inputStyle} value={peritoInfo.cnpc} onChange={e => setPeritoInfo({ ...peritoInfo, cnpc: e.target.value })} /></div>
                  </div>
                  <div><label style={labelStyle}>E-mail para Intimações (Art. 465 §2º III CPC):</label><input style={inputStyle} value={peritoInfo.email} onChange={e => setPeritoInfo({ ...peritoInfo, email: e.target.value })} /></div>
                </div>
              </div>
            </div>

            {/* RESUMO DAS PEÇAS DOS AUTOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
              <div style={{ ...cardStyle, borderTop: '4px solid #3b82f6' }}>
                <label style={{ ...labelStyle, color: '#1d4ed8' }}>📘 1. Síntese da Petição Inicial (Tese do Autor):</label>
                <textarea rows="4" style={inputStyle} value={proc.resumoInicial} onChange={e => setProc({ ...proc, resumoInicial: e.target.value })} />
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #ef4444' }}>
                <label style={{ ...labelStyle, color: '#b91c1c' }}>📕 2. Síntese da Contestação (Defesa do Réu):</label>
                <textarea rows="4" style={inputStyle} value={proc.resumoContestacao} onChange={e => setProc({ ...proc, resumoContestacao: e.target.value })} />
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #10b981' }}>
                <label style={{ ...labelStyle, color: '#15803d' }}>⚖️ 3. Decisão Saneadora do Juiz (Foco Técnico):</label>
                <textarea rows="4" style={inputStyle} value={proc.decisaoSaneadora} onChange={e => setProc({ ...proc, decisaoSaneadora: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setAbaAtiva('honorarios')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                Avançar para Etapa 2: Orçamento de Honorários →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ETAPA 2: PLANEJAMENTO E PROPOSTA DE HONORÁRIOS (NBC PP 01) */}
        {/* ========================================================== */}
        {abaAtiva === 'honorarios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={boxAlertaLegalStyle}>
              <strong>⏱️ Regra de Ouro do CPC (Art. 465, § 2º):</strong> Intimado da nomeação, o perito tem exatos <strong>5 (cinco) dias úteis</strong> para apresentar: (I) Proposta de Honorários fundamentada em horas; (II) Currículo comprovando especialização; e (III) Contatos eletrônicos. Nunca inicie o laudo antes do depósito judicial ou adiantamento (Art. 465, § 4º CPC), salvo se escolher atuar na Justiça Gratuita (AJG).
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#0f172a' }}>⏳ Quadro de Estimativa de Horas por Fase (NBC PP 01)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>1. Leitura e Carga dos Autos (h):</label><input type="number" style={inputStyle} value={hon.horasLeitura} onChange={e => setHon({ ...hon, horasLeitura: e.target.value })} /></div>
                  <div><label style={labelStyle}>2. Diligências e Coleta (h):</label><input type="number" style={inputStyle} value={hon.horasDiligencias} onChange={e => setHon({ ...hon, horasDiligencias: e.target.value })} /></div>
                  <div><label style={labelStyle}>3. Planilhas e Auditoria (h):</label><input type="number" style={inputStyle} value={hon.horasCalculos} onChange={e => setHon({ ...hon, horasCalculos: e.target.value })} /></div>
                  <div><label style={labelStyle}>4. Redação e Quesitos (h):</label><input type="number" style={inputStyle} value={hon.horasRedacao} onChange={e => setHon({ ...hon, horasRedacao: e.target.value })} /></div>
                  <div><label style={labelStyle}>5. Reserva p/ Esclarecimentos (Art. 477):</label><input type="number" style={inputStyle} value={hon.horasEsclarecimentos} onChange={e => setHon({ ...hon, horasEsclarecimentos: e.target.value })} /></div>
                  <div><label style={labelStyle}>Prazo Solicitado p/ Entrega (Dias):</label><input type="number" style={inputStyle} value={hon.prazoEntregaDias} onChange={e => setHon({ ...hon, prazoEntregaDias: e.target.value })} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#0f172a' }}>💵 Precificação da Hora Técnica e Complexidade</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div><label style={labelStyle}>Valor da Hora Técnica (R$):</label><input type="number" style={inputStyle} value={hon.valorHoraTecnica} onChange={e => setHon({ ...hon, valorHoraTecnica: e.target.value })} /></div>
                  <div><label style={labelStyle}>Despesas e Deslocamento (R$):</label><input type="number" style={inputStyle} value={hon.despesasDeslocamento} onChange={e => setHon({ ...hon, despesasDeslocamento: e.target.value })} /></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Fator de Relevância e Complexidade Técnica:</label>
                    <select style={inputStyle} value={hon.complexidadeFator} onChange={e => setHon({ ...hon, complexidadeFator: Number(e.target.value) })}>
                      <option value={1.0}>1.0x — Complexidade Normal (Cálculo Padrão)</option>
                      <option value={1.2}>1.2x — Complexidade Média-Alta (Múltiplos Contratos / Auditoria SPED)</option>
                      <option value={1.5}>1.5x — Alta Complexidade (Valuation Societário / Fraude Contábil)</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>ORÇAMENTO FUNDAMENTADO ({totalHorasPericia} HORAS TÉCNICAS)</span>
                    <strong style={{ fontSize: '24px', color: '#4ade80' }}>R$ {formatMoeda(totalPropostaHonorarios)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTipoDocumentoImpressao('peticao_honorarios'); setAbaAtiva('emissao'); }}
                    style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    📄 Ver / Imprimir Petição de Honorários
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" onClick={() => setAbaAtiva('autos')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>← Voltar aos Autos</button>
              <button type="button" onClick={() => setAbaAtiva('diligencias')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Avançar para Etapa 3: Diligências e Documentos →</button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ETAPA 3: TERMO DE DILIGÊNCIA E AUDITORIA DE PROVAS         */}
        {/* ========================================================== */}
        {abaAtiva === 'diligencias' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={boxMentorStyle}>
              <strong>🔎 Etapa 3 — Termo de Diligência (Itens 18 a 23 da NBC TP 01 e Art. 473 §3º do CPC):</strong> Quando faltam extratos, livros contábeis (SPED ECD) ou cartões de ponto no processo, o Perito intima as partes por meio do <strong>Termo de Diligência</strong>. Se a empresa se recusar a entregar um documento obrigatório, você marca como <strong>"Recusado/Omitido"</strong> para que o Juiz aplique a pena de confissão/presunção de veracidade (Art. 400 do CPC).
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14.5px', color: '#0f172a' }}>📋 Checklist de Documentos Requisitados na Diligência</h4>
                <button
                  type="button"
                  onClick={() => { setTipoDocumentoImpressao('termo_diligencia'); setAbaAtiva('emissao'); }}
                  style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  🖨️ Gerar Termo de Diligência Formal
                </button>
              </div>

              {/* FORMULÁRIO PARA ADICIONAR DOCUMENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Descrição do Documento Contábil / Fiscal / Bancário:</label>
                  <input style={inputStyle} placeholder="Ex: Livro Diário e Razão Analítico (SPED ECD) ou Extratos Bancários..." value={novaDiligencia.documento} onChange={e => setNovaDiligencia({ ...novaDiligencia, documento: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Parte Intimada:</label>
                  <select style={inputStyle} value={novaDiligencia.responsavel} onChange={e => setNovaDiligencia({ ...novaDiligencia, responsavel: e.target.value })}>
                    <option value="Réu">Parte Ré</option>
                    <option value="Autor">Parte Autora</option>
                    <option value="Ambos">Ambas as Partes</option>
                    <option value="Terceiros">Banco / Órgão Público</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Prazo Concedido:</label>
                  <input style={inputStyle} value={novaDiligencia.prazo} onChange={e => setNovaDiligencia({ ...novaDiligencia, prazo: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Fundamento Legal:</label>
                  <input style={inputStyle} value={novaDiligencia.baseLegal} onChange={e => setNovaDiligencia({ ...novaDiligencia, baseLegal: e.target.value })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!novaDiligencia.documento) return;
                      setListaDiligencias([...listaDiligencias, { id: Date.now(), ...novaDiligencia, status: 'pendente' }]);
                      setNovaDiligencia({ ...novaDiligencia, documento: '' });
                    }}
                    style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}
                  >
                    + Requisitar Prova
                  </button>
                </div>
              </div>

              {/* TABELA DE DILIGÊNCIAS */}
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px' }}>Documento Requisitado</th>
                      <th style={{ padding: '10px', width: '90px' }}>Intimado</th>
                      <th style={{ padding: '10px', width: '120px' }}>Base Legal</th>
                      <th style={{ padding: '10px', width: '160px', textAlign: 'center' }}>Status da Prova</th>
                      <th style={{ padding: '10px', width: '50px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaDiligencias.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: item.status === 'recusado' ? '#fef2f2' : 'white' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.documento}</td>
                        <td style={{ padding: '10px' }}>{item.responsavel}</td>
                        <td style={{ padding: '10px', color: '#475569' }}>{item.baseLegal}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <select
                            value={item.status}
                            onChange={e => {
                              const copia = [...listaDiligencias];
                              copia[idx].status = e.target.value;
                              setListaDiligencias(copia);
                            }}
                            style={{
                              padding: '5px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold',
                              backgroundColor: item.status === 'entregue' ? '#dcfce7' : item.status === 'recusado' ? '#fee2e2' : '#fef3c7',
                              color: item.status === 'entregue' ? '#166534' : item.status === 'recusado' ? '#991b1b' : '#92400e',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            <option value="entregue">✅ Juntado aos Autos</option>
                            <option value="pendente">⏳ Aguardando Prazo</option>
                            <option value="recusado">❌ Recusado / Omitido (Art. 400 CPC)</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button type="button" onClick={() => setListaDiligencias(listaDiligencias.filter(d => d.id !== item.id))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" onClick={() => setAbaAtiva('honorarios')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>← Voltar aos Honorários</button>
              <button type="button" onClick={() => setAbaAtiva('calculos')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Avançar para Etapa 4: Motores de Cálculo →</button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ETAPA 4: OS 4 MOTORES MATEMÁTICOS DE PERÍCIA CONTÁBIL      */}
        {/* ========================================================== */}
        {abaAtiva === 'calculos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* SELETOR DE MOTOR MATEMÁTICO */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '12px' }}>
              {[
                { id: 'bancario', label: '🏦 1. Revisão Bancária (Price vs. BACEN vs. Gauss)' },
                { id: 'trabalhista', label: '👷 2. Liquidação Trabalhista (Súmula 264 + Reflexos)' },
                { id: 'societario', label: '🏢 3. Apuração de Haveres (Balanço de Determinação)' },
                { id: 'lucros', label: '📉 4. Lucros Cessantes & Cumprimento (Art. 523 CPC)' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMotorAtivo(m.id)}
                  style={{
                    flex: '1 1 200px', padding: '10px 12px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                    backgroundColor: motorAtivo === m.id ? '#0f172a' : 'transparent',
                    color: motorAtivo === m.id ? '#ffffff' : '#334155'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* ---------------------------------------------------------- */}
            {/* MOTOR 1: REVISIONAL BANCÁRIA (FUNCIONANDO 100%)            */}
            {/* ---------------------------------------------------------- */}
            {motorAtivo === 'bancario' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={boxMentorStyle}>
                  <strong>🏦 Metodologia Pericial Bancária (STJ Temas 246 e 972):</strong> Na perícia financeira atual, o perito audita dois desvios clássicos: <strong>(1) Expurgo de Tarifas/Seguros casados</strong> embutidos no valor financiado; e <strong>(2) Confronto da Taxa Contratual com a Taxa Média de Mercado do BACEN</strong>, apresentando ao Juiz tanto o recálculo na <em>Tabela Price Expurgada</em> quanto no <em>Método de Gauss (Juros Simples)</em>.
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '12px' }}>
                    <div><label style={labelStyle}>Crédito Liberado Líquido (R$):</label><input type="number" style={inputStyle} value={paramBancario.valorLiberado} onChange={e => setParamBancario({ ...paramBancario, valorLiberado: e.target.value })} /></div>
                    <div><label style={labelStyle}>Tarifas/Seguros Embutidos (R$):</label><input type="number" style={inputStyle} value={paramBancario.tarifasIndevidas} onChange={e => setParamBancario({ ...paramBancario, tarifasIndevidas: e.target.value })} /></div>
                    <div><label style={labelStyle}>Taxa do Banco (% a.m.):</label><input type="number" step="0.05" style={inputStyle} value={paramBancario.taxaContratoMes} onChange={e => setParamBancario({ ...paramBancario, taxaContratoMes: e.target.value })} /></div>
                    <div><label style={labelStyle}>Taxa Média BACEN (% a.m.):</label><input type="number" step="0.05" style={inputStyle} value={paramBancario.taxaBacenMes} onChange={e => setParamBancario({ ...paramBancario, taxaBacenMes: e.target.value })} /></div>
                    <div><label style={labelStyle}>Prazo Total (Meses):</label><input type="number" style={inputStyle} value={paramBancario.prazoMeses} onChange={e => setParamBancario({ ...paramBancario, prazoMeses: e.target.value })} /></div>
                    <div><label style={labelStyle}>Parcelas já Pagas:</label><input type="number" style={inputStyle} value={paramBancario.parcelasPagas} onChange={e => setParamBancario({ ...paramBancario, parcelasPagas: e.target.value })} /></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                  <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444' }}>
                    <span style={labelStyle}>1. Cobrado pelo Banco (Price + Tarifas)</span>
                    <div style={{ fontSize: '21px', fontWeight: '900', color: '#dc2626' }}>R$ {formatMoeda(calcBancarioRes.pmtBanco)} /mês</div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Total Contrato: R$ {formatMoeda(calcBancarioRes.totalContratoBanco)}</span>
                  </div>
                  <div style={{ ...cardStyle, borderLeft: '4px solid #3b82f6' }}>
                    <span style={labelStyle}>2. Price Recalculada (Sem Tarifas + BACEN)</span>
                    <div style={{ fontSize: '21px', fontWeight: '900', color: '#2563eb' }}>R$ {formatMoeda(calcBancarioRes.pmtPricePericia)} /mês</div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Total Recalculado: R$ {formatMoeda(calcBancarioRes.totalPricePericia)}</span>
                  </div>
                  <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                    <span style={labelStyle}>3. Método de Gauss (Juros Simples + BACEN)</span>
                    <div style={{ fontSize: '21px', fontWeight: '900', color: '#16a34a' }}>R$ {formatMoeda(calcBancarioRes.pmtGauss)} /mês</div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Economia no Contrato: R$ {formatMoeda(calcBancarioRes.economiaTotalGauss)}</span>
                  </div>
                  <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: 'white' }}>
                    <span style={{ ...labelStyle, color: '#94a3b8' }}>Indébito nas {calcBancarioRes.pagas} Parcelas Pagas</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>Simples: R$ {formatMoeda(calcBancarioRes.indebitoSimplesPagas)}</div>
                    <span style={{ fontSize: '11.5px', color: '#fbbf24' }}>Em Dobro (Art. 42 CDC): R$ {formatMoeda(calcBancarioRes.indebitoDobroArt42CDC)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* MOTOR 2: LIQUIDAÇÃO TRABALHISTA (SÚMULA 264 + REFLEXOS)    */}
            {/* ---------------------------------------------------------- */}
            {motorAtivo === 'trabalhista' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={boxMentorStyle}>
                  <strong>👷 Metodologia de Liquidação Trabalhista (Art. 879 CLT):</strong> Pela <strong>Súmula 264 do TST</strong>, a base da hora extra soma o Salário Base + Adicional de Insalubridade/Periculosidade. As horas extras habituais refletem em <strong>DSR (1/6)</strong>, <strong>Férias + 1/3 (1/12)</strong>, <strong>13º Salário (1/12)</strong> e <strong>FGTS (8% + Multa de 40%)</strong>.
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 165px), 1fr))', gap: '12px' }}>
                    <div><label style={labelStyle}>Salário Base (R$):</label><input type="number" style={inputStyle} value={paramTrabalhista.salarioBase} onChange={e => setParamTrabalhista({ ...paramTrabalhista, salarioBase: e.target.value })} /></div>
                    <div><label style={labelStyle}>Salário Mínimo (Base Insalub.):</label><input type="number" style={inputStyle} value={paramTrabalhista.salarioMinimo} onChange={e => setParamTrabalhista({ ...paramTrabalhista, salarioMinimo: e.target.value })} /></div>
                    <div>
                      <label style={labelStyle}>Insalubridade (CLT Art. 192):</label>
                      <select style={inputStyle} value={paramTrabalhista.grauInsalubridadePct} onChange={e => setParamTrabalhista({ ...paramTrabalhista, grauInsalubridadePct: Number(e.target.value) })}>
                        <option value={0}>0% (Não há)</option>
                        <option value={10}>10% (Grau Mínimo)</option>
                        <option value={20}>20% (Grau Médio)</option>
                        <option value={40}>40% (Grau Máximo)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Periculosidade (CLT Art. 193):</label>
                      <select style={inputStyle} value={paramTrabalhista.periculosidadePct} onChange={e => setParamTrabalhista({ ...paramTrabalhista, periculosidadePct: Number(e.target.value) })}>
                        <option value={0}>0% (Não há)</option>
                        <option value={30}>30% sobre Salário Base</option>
                      </select>
                    </div>
                    <div><label style={labelStyle}>Divisor (220 ou 180):</label><input type="number" style={inputStyle} value={paramTrabalhista.divisorJornada} onChange={e => setParamTrabalhista({ ...paramTrabalhista, divisorJornada: e.target.value })} /></div>
                    <div><label style={labelStyle}>Horas Extras 50% /mês:</label><input type="number" style={inputStyle} value={paramTrabalhista.qtdHe50Mes} onChange={e => setParamTrabalhista({ ...paramTrabalhista, qtdHe50Mes: e.target.value })} /></div>
                    <div><label style={labelStyle}>Horas Extras 100% /mês:</label><input type="number" style={inputStyle} value={paramTrabalhista.qtdHe100Mes} onChange={e => setParamTrabalhista({ ...paramTrabalhista, qtdHe100Mes: e.target.value })} /></div>
                    <div><label style={labelStyle}>Meses Apurados:</label><input type="number" style={inputStyle} value={paramTrabalhista.mesesApuracao} onChange={e => setParamTrabalhista({ ...paramTrabalhista, mesesApuracao: e.target.value })} /></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                  <div style={cardStyle}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a' }}>📊 Memória Mensal do Reclamante</h4>
                    <div style={{ fontSize: '12.5px', lineHeight: '1.8', color: '#334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base Hora (Súmula 264 TST):</span><strong>R$ {formatMoeda(calcTrabalhistaRes.baseCompostaHora)} (Hora: R$ {formatMoeda(calcTrabalhistaRes.valorHoraNormal)})</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Adicionais (Insalub. + Pericul.):</span><strong>R$ {formatMoeda(calcTrabalhistaRes.insalubMes + calcTrabalhistaRes.periculMes)} /mês</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Horas Extras (50% + 100%):</span><strong>R$ {formatMoeda(calcTrabalhistaRes.totalHeMes)} /mês</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1d4ed8' }}><span>+ Reflexo em DSR (1/6):</span><strong>R$ {formatMoeda(calcTrabalhistaRes.dsrMes)} /mês</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1d4ed8' }}><span>+ Reflexo em Férias + 1/3 e 13º:</span><strong>R$ {formatMoeda(calcTrabalhistaRes.reflexoFeriasTercoMes + calcTrabalhistaRes.reflexo13Mes)} /mês</strong></div>
                    </div>
                  </div>

                  <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: 'white' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8' }}>⚖️ Resumo da Liquidação ({calcTrabalhistaRes.meses} Meses)</h4>
                    <div style={{ fontSize: '12.5px', lineHeight: '1.8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Principal + Reflexos Brutos:</span><strong>R$ {formatMoeda(calcTrabalhistaRes.subtotalBrutoPeriodo)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}><span>+ FGTS (8%) + Multa Rescisória (40%):</span><strong>R$ {formatMoeda(calcTrabalhistaRes.fgts8Pct + calcTrabalhistaRes.multa40Fgts)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}><span>(-) Retenção INSS Segurado (Súm. 368):</span><strong>- R$ {formatMoeda(calcTrabalhistaRes.inssEmpregado)}</strong></div>
                      <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                        <span>Líquido Devido ao Autor:</span><strong style={{ color: '#4ade80' }}>R$ {formatMoeda(calcTrabalhistaRes.liquidoReclamante)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* MOTOR 3: SOCIETÁRIO / APURAÇÃO DE HAVERES (ART. 606 CPC)   */}
            {/* ---------------------------------------------------------- */}
            {motorAtivo === 'societario' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={boxMentorStyle}>
                  <strong>🏢 Metodologia de Apuração de Haveres (Art. 606 CPC):</strong> O Balanço Contábil comum registra bens pelo custo histórico depreciado. Na saída de sócio, o perito levanta o <strong>Balanço de Determinação</strong>: soma a <em>Mais-Valia</em> de imóveis/máquinas a valor de mercado, desconta <em>Créditos Incobráveis e Passivos Ocultos</em> (trabalhistas/fiscais) e calcula o <strong>Goodwill (Fundo de Comércio)</strong> pelo método dos superlucros.
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '12px' }}>
                    <div><label style={labelStyle}>PL Contábil Histórico (R$):</label><input type="number" style={inputStyle} value={paramSocietario.plContabilHistorico} onChange={e => setParamSocietario({ ...paramSocietario, plContabilHistorico: e.target.value })} /></div>
                    <div><label style={labelStyle}>(+) Mais-Valia Ativos a Mercado:</label><input type="number" style={inputStyle} value={paramSocietario.maisValiaImoveisMaquinas} onChange={e => setParamSocietario({ ...paramSocietario, maisValiaImoveisMaquinas: e.target.value })} /></div>
                    <div><label style={labelStyle}>(-) Baixa Inadimplência (PCLD):</label><input type="number" style={inputStyle} value={paramSocietario.baixaCreditosIncobraveis} onChange={e => setParamSocietario({ ...paramSocietario, baixaCreditosIncobraveis: e.target.value })} /></div>
                    <div><label style={labelStyle}>(-) Passivo Trabalhista/Fiscal Oculto:</label><input type="number" style={inputStyle} value={paramSocietario.passivoTrabalhistaFiscalOculto} onChange={e => setParamSocietario({ ...paramSocietario, passivoTrabalhistaFiscalOculto: e.target.value })} /></div>
                    <div><label style={labelStyle}>Lucro Líquido Médio Mensal (R$):</label><input type="number" style={inputStyle} value={paramSocietario.lucroLiquidoMedioMensal} onChange={e => setParamSocietario({ ...paramSocietario, lucroLiquidoMedioMensal: e.target.value })} /></div>
                    <div><label style={labelStyle}>Multiplicador Goodwill (Anos):</label><input type="number" style={inputStyle} value={paramSocietario.anosMultiplicadorGoodwill} onChange={e => setParamSocietario({ ...paramSocietario, anosMultiplicadorGoodwill: e.target.value })} /></div>
                    <div><label style={labelStyle}>Quotas Sócio Retirante (%):</label><input type="number" style={inputStyle} value={paramSocietario.participacaoSocioRetirantePct} onChange={e => setParamSocietario({ ...paramSocietario, participacaoSocioRetirantePct: e.target.value })} /></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                  <div style={cardStyle}>
                    <span style={labelStyle}>PL Ajustado (Tangível a Mercado)</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>R$ {formatMoeda(calcSocietarioRes.plAjustadoMercado)}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>PL Histórico: R$ {formatMoeda(calcSocietarioRes.plContabil)}</span>
                  </div>
                  <div style={cardStyle}>
                    <span style={labelStyle}>Goodwill Apurado (Fundo Comércio)</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>+ R$ {formatMoeda(calcSocietarioRes.goodwillApurado)}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Superlucro: R$ {formatMoeda(calcSocietarioRes.superLucroAnual)}/ano</span>
                  </div>
                  <div style={cardStyle}>
                    <span style={labelStyle}>Valuation Econômico Total</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>R$ {formatMoeda(calcSocietarioRes.valuationTotalEmpresa)}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Ativos Tangíveis + Intangíveis</span>
                  </div>
                  <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: 'white' }}>
                    <span style={{ ...labelStyle, color: '#94a3b8' }}>Haveres do Sócio ({paramSocietario.participacaoSocioRetirantePct}%)</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>R$ {formatMoeda(calcSocietarioRes.haveresBalançoDeterminacao)}</div>
                    <span style={{ fontSize: '11px', color: '#38bdf8' }}>Ganho vs. Contábil: + R$ {formatMoeda(calcSocietarioRes.ganhoPericialSocio)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* MOTOR 4: LUCROS CESSANTES & ATUALIZAÇÃO (ART. 523 CPC)     */}
            {/* ---------------------------------------------------------- */}
            {motorAtivo === 'lucros' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={boxMentorStyle}>
                  <strong>📉 Metodologia de Lucros Cessantes (Art. 402 CC) e Cumprimento de Sentença (Art. 523 CPC):</strong> O perito nunca indeniza o Faturamento Bruto perdido; ele deduz os <em>Tributos sobre Vendas</em> e os <em>Custos Variáveis</em> economizados na paralisação para encontrar a <strong>Margem de Contribuição / Lucro Cessante Real</strong>. Ao final, aplica correção monetária, juros de mora de 1% a.m. e os acréscimos do Art. 523 do CPC (10% multa + 10% honorários).
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                    <div><label style={labelStyle}>Faturamento Mensal Médio (R$):</label><input type="number" style={inputStyle} value={paramLucros.faturamentoBrutoMensalMedio} onChange={e => setParamLucros({ ...paramLucros, faturamentoBrutoMensalMedio: e.target.value })} /></div>
                    <div><label style={labelStyle}>Meses Paralisados:</label><input type="number" style={inputStyle} value={paramLucros.mesesParalisacao} onChange={e => setParamLucros({ ...paramLucros, mesesParalisacao: e.target.value })} /></div>
                    <div><label style={labelStyle}>(-) Impostos s/ Vendas (%):</label><input type="number" style={inputStyle} value={paramLucros.impostosSobreVendasPct} onChange={e => setParamLucros({ ...paramLucros, impostosSobreVendasPct: e.target.value })} /></div>
                    <div><label style={labelStyle}>(-) Custos Variáveis / CMV (%):</label><input type="number" style={inputStyle} value={paramLucros.custosVariaveisPct} onChange={e => setParamLucros({ ...paramLucros, custosVariaveisPct: e.target.value })} /></div>
                    <div><label style={labelStyle}>(+) Danos Emergentes (NFs R$):</label><input type="number" style={inputStyle} value={paramLucros.danosEmergentesNotaFiscal} onChange={e => setParamLucros({ ...paramLucros, danosEmergentesNotaFiscal: e.target.value })} /></div>
                    <div><label style={labelStyle}>Correção INPC/IPCA Acum. (%):</label><input type="number" step="0.1" style={inputStyle} value={paramLucros.indiceCorrecaoAcumuladoPct} onChange={e => setParamLucros({ ...paramLucros, indiceCorrecaoAcumuladoPct: e.target.value })} /></div>
                    <div><label style={labelStyle}>Meses Juros Mora (1% a.m.):</label><input type="number" style={inputStyle} value={paramLucros.mesesJurosMora1Pct} onChange={e => setParamLucros({ ...paramLucros, mesesJurosMora1Pct: e.target.value })} /></div>
                    <div>
                      <label style={labelStyle}>Multa e Hon. Art. 523 CPC:</label>
                      <select style={inputStyle} value={paramLucros.aplicarMulta523Cpc ? 'sim' : 'nao'} onChange={e => setParamLucros({ ...paramLucros, aplicarMulta523Cpc: e.target.value === 'sim' })}>
                        <option value="sim">Aplicar (+10% Multa +10% Hon.)</option>
                        <option value="nao">Não aplicar (Fase de Conhecimento)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                  <div style={cardStyle}>
                    <span style={labelStyle}>Lucro Cessante Líquido Apurado</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>R$ {formatMoeda(calcLucrosRes.lucroCessanteLiquido)}</div>
                    <span style={{ fontSize: '11px', color: '#dc2626' }}>Glosa de Excesso: - R$ {formatMoeda(calcLucrosRes.glosaExcessoPedido)}</span>
                  </div>
                  <div style={cardStyle}>
                    <span style={labelStyle}>Principal (Lucros + Danos Emerg.)</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>R$ {formatMoeda(calcLucrosRes.principalHistoricoTotal)}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Danos NF: R$ {formatMoeda(calcLucrosRes.danosEmergentes)}</span>
                  </div>
                  <div style={cardStyle}>
                    <span style={labelStyle}>Correção + Juros de Mora (1% a.m.)</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#d97706' }}>+ R$ {formatMoeda(calcLucrosRes.correcaoMonetaria + calcLucrosRes.jurosMora)}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Subtotal: R$ {formatMoeda(calcLucrosRes.subtotalAtualizado)}</span>
                  </div>
                  <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: 'white' }}>
                    <span style={{ ...labelStyle, color: '#94a3b8' }}>Total da Execução (Com Art. 523)</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>R$ {formatMoeda(calcLucrosRes.totalExecucaoJudicial)}</div>
                    <span style={{ fontSize: '11px', color: '#fbbf24' }}>Encargos Art. 523: R$ {formatMoeda(calcLucrosRes.multaArt523 + calcLucrosRes.honorariosArt523)}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" onClick={() => setAbaAtiva('diligencias')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>← Voltar às Diligências</button>
              <button type="button" onClick={() => setAbaAtiva('quesitos')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Avançar para Etapa 5: Resposta aos Quesitos →</button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ETAPA 5: ARENA DE QUESITOS E BLINDAGEM TÉCNICA (ART. 473)  */}
        {/* ========================================================== */}
        {abaAtiva === 'quesitos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={boxAlertaLegalStyle}>
              <strong>🛡️ Blindagem Técnica do Perito (Art. 473, § 2º do CPC e NBC TP 01):</strong> É expressamente <strong>proibido ao perito emitir opiniões pessoais</strong> ou responder se uma lei é justa ou inconstitucional. Quando um advogado fizer uma "pergunta armadilha" sobre Direito, utilize o botão <strong>"Declarar Matéria de Direito (Art. 473 III)"</strong> abaixo!
            </div>

            {/* ADICIONAR NOVO QUESITO */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>➕ Cadastrar Novo Quesito nos Autos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Formulou o Quesito:</label>
                  <select style={inputStyle} value={novoQuesito.origem} onChange={e => setNovoQuesito({ ...novoQuesito, origem: e.target.value })}>
                    <option value="Juízo">Juízo (Magistrado)</option>
                    <option value="Autor">Parte Autora</option>
                    <option value="Réu">Parte Ré</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Texto da Pergunta (Quesito):</label>
                  <input style={inputStyle} placeholder="Digite a pergunta formulada pelo Juiz ou pelos advogados das partes..." value={novoQuesito.pergunta} onChange={e => setNovoQuesito({ ...novoQuesito, pergunta: e.target.value })} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!novoQuesito.pergunta) return;
                    setListaQuesitos([...listaQuesitos, { id: Date.now(), ...novoQuesito }]);
                    setNovoQuesito({ ...novoQuesito, pergunta: '' });
                  }}
                  style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '11px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}
                >
                  + Inserir Quesito
                </button>
              </div>
            </div>

            {/* LISTA DE QUESITOS COM RESPOSTAS RÁPIDAS */}
            {listaQuesitos.map((q, idx) => (
              <div key={q.id} style={{ ...cardStyle, borderLeft: q.origem === 'Juízo' ? '5px solid #10b981' : q.origem === 'Autor' ? '5px solid #3b82f6' : '5px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontWeight: '900', fontSize: '13.5px', color: '#0f172a' }}>Quesito nº {idx + 1} — Formulado pelo {q.origem}</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const c = [...listaQuesitos];
                        c[idx].resposta = 'Quesito prejudicado. A indagação versa sobre interpretação jurídica e legalidade contratual, matéria estritamente de direito que extrapola a competência técnico-contábil deste Perito, nos termos do Art. 473, inciso III do CPC e item 27 da NBC TP 01 (R1).';
                        setListaQuesitos(c);
                      }}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ⚖️ Declarar Matéria de Direito (Art. 473 III)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const c = [...listaQuesitos];
                        c[idx].resposta = 'Positivo. Reporta-se este Perito aos quadros demonstrativos e memórias de cálculo analíticas integrantes da Seção 4 deste trabalho pericial.';
                        setListaQuesitos(c);
                      }}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      📊 Remeter à Memória de Cálculo
                    </button>
                    <button
                      type="button"
                      onClick={() => setListaQuesitos(listaQuesitos.filter(item => item.id !== q.id))}
                      style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
                    >
                      ✕ Excluir
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f1f5f9', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  "{q.pergunta}"
                </div>

                {q.dicaEstrategica && (
                  <div style={{ fontSize: '11.5px', color: '#0369a1', marginBottom: '8px' }}>
                    💡 <strong>Orientação do Mentor Forense:</strong> {q.dicaEstrategica}
                  </div>
                )}

                <label style={labelStyle}>Resposta Fundamentada do Perito (NBC TP 01):</label>
                <textarea
                  rows="3"
                  style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                  value={q.resposta}
                  onChange={e => {
                    const c = [...listaQuesitos];
                    c[idx].resposta = e.target.value;
                    setListaQuesitos(c);
                  }}
                />
              </div>
            ))}

            <div style={cardStyle}>
              <label style={labelStyle}>Conclusão Técnica Síntese do Laudo / Parecer (Item 31 da NBC TP 01):</label>
              <textarea rows="3" style={inputStyle} value={conclusaoTexto} onChange={e => setConclusaoTexto(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" onClick={() => setAbaAtiva('calculos')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>← Voltar aos Cálculos</button>
              <button type="button" onClick={() => setAbaAtiva('emissao')} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '13.5px' }}>Ir para Etapa 6: Emissão do Laudo A4 e Impressão →</button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ETAPA 6: EMISSÃO FORENSE A4 (IMPRESSÃO PDF) + VADE MECUM   */}
        {/* ========================================================== */}
        {abaAtiva === 'emissao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* BARRA DE CONTROLE DE IMPRESSÃO */}
            <div style={{ ...cardStyle, backgroundColor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'laudo_completo', label: papelPericial === 'perito_juizo' ? '📑 1. Laudo Pericial Contábil (NBC TP 01)' : '📑 1. Parecer Técnico Crítico (Assistente)' },
                  { id: 'peticao_honorarios', label: '💰 2. Petição de Proposta de Honorários' },
                  { id: 'termo_diligencia', label: '🔎 3. Termo de Diligência Oficial' }
                ].map(doc => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setTipoDocumentoImpressao(doc.id)}
                    style={{
                      padding: '9px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                      backgroundColor: tipoDocumentoImpressao === doc.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={exportarDocumentoPDF}
                style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}
              >
                🖨️ Imprimir / Salvar em PDF (Formato A4)
              </button>
            </div>

            {/* FOLHA A4 VISUALIZÁVEL E IMPRIMÍVEL */}
            <div id="documento-forense-a4" style={{ backgroundColor: 'white', padding: '36px', borderRadius: '8px', border: '1px solid #94a3b8', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', maxWidth: '840px', margin: '0 auto', width: '100%', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#0f172a', lineHeight: '1.6' }}>
              
              {/* CABEÇALHO DO JUIZ */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {proc.vara} DA COMARCA DE {proc.comarca}
              </div>

              {/* QUADRO DE IDENTIFICAÇÃO DOS AUTOS */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px 16px', marginBottom: '22px', fontSize: '12.5px', fontFamily: 'Arial, sans-serif' }}>
                <div><strong>PROCESSO Nº:</strong> {proc.numero}</div>
                <div><strong>REQUERENTE (AUTOR):</strong> {proc.autor}</div>
                <div><strong>REQUERIDO (RÉU):</strong> {proc.reu}</div>
                <div><strong>OBJETO DA PROVA TÉCNICA:</strong> {proc.objeto}</div>
              </div>

              {/* OPÇÃO A: PETIÇÃO DE HONORÁRIOS */}
              {tipoDocumentoImpressao === 'peticao_honorarios' && (
                <div>
                  <h3 style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '15px', margin: '20px 0' }}>
                    ACEITE DO ENCARGO E PROPOSTA DE HONORÁRIOS PERICIAIS (ART. 465, § 2º DO CPC E NBC PP 01)
                  </h3>
                  <p style={{ textAlign: 'justify', fontSize: '13px' }}>
                    <strong>{peritoInfo.nome}</strong>, Contador devidamente registrado no Conselho Regional de Contabilidade sob o nº <strong>{peritoInfo.crc}</strong> e inscrito no Cadastro Nacional de Peritos Contábeis sob o nº <strong>{peritoInfo.cnpc}</strong>, endereço eletrônico <em>{peritoInfo.email}</em>, honrado com a nomeação nos autos em epígrafe, vem, respeitosamente, à presença de Vossa Excelência manifestar o <strong>ACEITE DO ENCARGO</strong> e apresentar sua estimativa de honorários:
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #64748b', padding: '8px' }}>Etapa do Trabalho Pericial (NBC PP 01)</th>
                        <th style={{ border: '1px solid #64748b', padding: '8px', textAlign: 'center' }}>Horas Estimadas</th>
                        <th style={{ border: '1px solid #64748b', padding: '8px', textAlign: 'right' }}>Subtotal (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={{ border: '1px solid #64748b', padding: '7px' }}>1. Exame preliminar e carga dos autos</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'center' }}>{hon.horasLeitura}h</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(hon.horasLeitura * hon.valorHoraTecnica)}</td></tr>
                      <tr><td style={{ border: '1px solid #64748b', padding: '7px' }}>2. Diligências técnicas e exame documental</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'center' }}>{hon.horasDiligencias}h</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(hon.horasDiligencias * hon.valorHoraTecnica)}</td></tr>
                      <tr><td style={{ border: '1px solid #64748b', padding: '7px' }}>3. Elaboração de memórias de cálculo e auditoria</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'center' }}>{hon.horasCalculos}h</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(hon.horasCalculos * hon.valorHoraTecnica)}</td></tr>
                      <tr><td style={{ border: '1px solid #64748b', padding: '7px' }}>4. Redação do Laudo e respostas aos quesitos</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'center' }}>{hon.horasRedacao}h</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(hon.horasRedacao * hon.valorHoraTecnica)}</td></tr>
                      <tr><td style={{ border: '1px solid #64748b', padding: '7px' }}>5. Esclarecimentos futuros em audiência/impugnação (Art. 477 CPC)</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'center' }}>{hon.horasEsclarecimentos}h</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(hon.horasEsclarecimentos * hon.valorHoraTecnica)}</td></tr>
                      <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                        <td style={{ border: '1px solid #64748b', padding: '8px' }}>TOTAL PROPOSTO ({totalHorasPericia}h x R$ {formatMoeda(hon.valorHoraTecnica)} x Fator {hon.complexidadeFator} + Despesas R$ {formatMoeda(hon.despesasDeslocamento)})</td>
                        <td style={{ border: '1px solid #64748b', padding: '8px', textAlign: 'center' }}>{totalHorasPericia}h</td>
                        <td style={{ border: '1px solid #64748b', padding: '8px', textAlign: 'right' }}>R$ {formatMoeda(totalPropostaHonorarios)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{ textAlign: 'justify', fontSize: '13px' }}>
                    Requer a intimação das partes para depósito judicial prévio dos honorários (Art. 95 CPC) e a concessão do prazo de <strong>{hon.prazoEntregaDias} dias</strong> para entrega do Laudo Pericial Contábil a contar do início das diligências.
                  </p>
                </div>
              )}

              {/* OPÇÃO B: TERMO DE DILIGÊNCIA */}
              {tipoDocumentoImpressao === 'termo_diligencia' && (
                <div>
                  <h3 style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '15px', margin: '20px 0' }}>
                    TERMO DE DILIGÊNCIA E REQUISIÇÃO DE DOCUMENTOS (NBC TP 01 E ART. 473 § 3º DO CPC)
                  </h3>
                  <p style={{ textAlign: 'justify', fontSize: '13px' }}>
                    Para o fiel cumprimento do encargo pericial determinado por este R. Juízo, intima-se os procuradores e representantes legais das partes para que apresentem os seguintes elementos comprobatórios:
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '12px', fontFamily: 'Arial, sans-serif' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ border: '1px solid #64748b', padding: '8px' }}>Documento Solicitado</th>
                        <th style={{ border: '1px solid #64748b', padding: '8px' }}>Responsável</th>
                        <th style={{ border: '1px solid #64748b', padding: '8px' }}>Base Legal</th>
                        <th style={{ border: '1px solid #64748b', padding: '8px' }}>Situação nos Autos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaDiligencias.map(d => (
                        <tr key={d.id}>
                          <td style={{ border: '1px solid #64748b', padding: '7px' }}>{d.documento}</td>
                          <td style={{ border: '1px solid #64748b', padding: '7px' }}>{d.responsavel}</td>
                          <td style={{ border: '1px solid #64748b', padding: '7px' }}>{d.baseLegal}</td>
                          <td style={{ border: '1px solid #64748b', padding: '7px', fontWeight: 'bold' }}>{d.status.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* OPÇÃO C: LAUDO PERICIAL CONTÁBIL / PARECER TÉCNICO COMPLETO */}
              {tipoDocumentoImpressao === 'laudo_completo' && (
                <div>
                  <h2 style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '16px', margin: '18px 0' }}>
                    {papelPericial === 'perito_juizo' ? 'LAUDO PERICIAL CONTÁBIL (ART. 473 DO CPC E NBC TP 01)' : 'PARECER TÉCNICO CONTÁBIL (ART. 477, § 1º DO CPC)'}
                  </h2>

                  <h4 style={{ fontSize: '13.5px', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', marginTop: '18px' }}>1. CONSIDERAÇÕES PRELIMINARES E SÍNTESE DA DEMANDA (ART. 473, I CPC)</h4>
                  <p style={{ fontSize: '12.5px', textAlign: 'justify' }}><strong>Tese Autoral:</strong> {proc.resumoInicial}</p>
                  <p style={{ fontSize: '12.5px', textAlign: 'justify' }}><strong>Tese Defensiva:</strong> {proc.resumoContestacao}</p>
                  <p style={{ fontSize: '12.5px', textAlign: 'justify' }}><strong>Delimitação Judicial:</strong> {proc.decisaoSaneadora}</p>

                  <h4 style={{ fontSize: '13.5px', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', marginTop: '18px' }}>2. METODOLOGIA TÉCNICO-CIENTÍFICA E DILIGÊNCIAS (ART. 473, II E III CPC)</h4>
                  <p style={{ fontSize: '12.5px', textAlign: 'justify' }}>
                    Os procedimentos periciais consistiram no exame documental, conciliação analítica, recálculo matemático-financeiro e auditoria contábil em estrita observância à <strong>NBC TP 01 (R1)</strong> do Conselho Federal de Contabilidade. Foram auditados {listaDiligencias.length} conjuntos probatórios descritos no quadro de diligências.
                  </p>

                  <h4 style={{ fontSize: '13.5px', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', marginTop: '18px' }}>3. MEMÓRIA DE CÁLCULO AUDITADA E QUADRO DEMONSTRATIVO</h4>
                  {motorAtivo === 'bancario' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #64748b', padding: '7px' }}>Cenário Técnico Pericial</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Base Financiada</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Prestação Mensal</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Total do Contrato ({calcBancarioRes.n}m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>1. Evolução Original do Banco (Price + Tarifas)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pvBanco)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pmtBanco)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.totalContratoBanco)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>2. Recálculo Price (Expurgo Tarifas + Taxa BACEN)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pvLiquido)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pmtPricePericia)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.totalPricePericia)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>3. Método de Gauss (Juros Simples + Taxa BACEN)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pvLiquido)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.pmtGauss)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.totalGauss)}</td></tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}><td colSpan="3" style={{ border: '1px solid #64748b', padding: '7px' }}>Indébito Apurado nas {calcBancarioRes.pagas} Parcelas Quitadas (Simples / Dobro Art. 42 CDC)</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(calcBancarioRes.indebitoSimplesPagas)} / R$ {formatMoeda(calcBancarioRes.indebitoDobroArt42CDC)}</td></tr>
                      </tbody>
                    </table>
                  )}

                  {motorAtivo === 'trabalhista' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #64748b', padding: '7px' }}>Rubrica da Liquidação Trabalhista ({calcTrabalhistaRes.meses} meses)</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Valor Mensal Médio</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Total Acumulado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>Adicionais Legais (Insalubridade / Periculosidade)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.insalubMes + calcTrabalhistaRes.periculMes)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda((calcTrabalhistaRes.insalubMes + calcTrabalhistaRes.periculMes) * calcTrabalhistaRes.meses)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>Horas Suplementares (50% e 100% - Súmula 264 TST)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.totalHeMes)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.totalHeMes * calcTrabalhistaRes.meses)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>Reflexos em DSR, Férias + 1/3 e 13º Salário</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.dsrMes + calcTrabalhistaRes.reflexoFeriasTercoMes + calcTrabalhistaRes.reflexo13Mes)}</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda((calcTrabalhistaRes.dsrMes + calcTrabalhistaRes.reflexoFeriasTercoMes + calcTrabalhistaRes.reflexo13Mes) * calcTrabalhistaRes.meses)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>FGTS (8%) + Multa Rescisória (40%)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>-</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.fgts8Pct + calcTrabalhistaRes.multa40Fgts)}</td></tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}><td colSpan="2" style={{ border: '1px solid #64748b', padding: '7px' }}>Crédito Líquido do Reclamante (Deduzido INSS R$ {formatMoeda(calcTrabalhistaRes.inssEmpregado)})</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(calcTrabalhistaRes.liquidoReclamante)}</td></tr>
                      </tbody>
                    </table>
                  )}

                  {motorAtivo === 'societario' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #64748b', padding: '7px' }}>Rubrica do Balanço de Determinação (Art. 606 CPC)</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Montante Apurado (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>1. Patrimônio Líquido Contábil Histórico</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcSocietarioRes.plContabil)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>2. (+) Ajustes de Avaliação a Mercado / (-) Passivos Contingentes e PCLD</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcSocietarioRes.plAjustadoMercado - calcSocietarioRes.plContabil)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>3. (=) Patrimônio Líquido Ajustado a Valor de Saída</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcSocietarioRes.plAjustadoMercado)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>4. (+) Fundo de Comércio / Goodwill Incorporado</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcSocietarioRes.goodwillApurado)}</td></tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}><td style={{ border: '1px solid #64748b', padding: '7px' }}>5. HAVERES LÍQUIDOS DO SÓCIO RETIRANTE ({paramSocietario.participacaoSocioRetirantePct}% do Valuation Total)</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(calcSocietarioRes.haveresBalançoDeterminacao)}</td></tr>
                      </tbody>
                    </table>
                  )}

                  {motorAtivo === 'lucros' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'Arial, sans-serif' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #64748b', padding: '7px' }}>Composição da Liquidação Judicial (Arts. 402 CC e 523 CPC)</th>
                          <th style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>Montante (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>Lucros Cessantes Líquidos (Faturamento Cessante menos Custos/Impostos Variáveis)</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcLucrosRes.lucroCessanteLiquido)}</td></tr>
                        <tr><td style={{ border: '1px solid #64748b', padding: '6px' }}>Danos Emergentes Documentados + Correção Monetária e Juros de Mora</td><td style={{ border: '1px solid #64748b', padding: '6px', textAlign: 'right' }}>R$ {formatMoeda(calcLucrosRes.danosEmergentes + calcLucrosRes.correcaoMonetaria + calcLucrosRes.jurosMora)}</td></tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}><td style={{ border: '1px solid #64748b', padding: '7px' }}>TOTAL ATUALIZADO DA EXECUÇÃO (Incluso Encargos Art. 523 CPC)</td><td style={{ border: '1px solid #64748b', padding: '7px', textAlign: 'right' }}>R$ {formatMoeda(calcLucrosRes.totalExecucaoJudicial)}</td></tr>
                      </tbody>
                    </table>
                  )}

                  <h4 style={{ fontSize: '13.5px', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', marginTop: '18px' }}>4. RESPOSTAS CONCLUSIVAS AOS QUESITOS (ART. 473, IV CPC)</h4>
                  {listaQuesitos.map((q, i) => (
                    <div key={q.id} className="no-break" style={{ marginBottom: '12px', fontSize: '12.5px' }}>
                      <div><strong>Quesito {i + 1} ({q.origem}):</strong> <em>"{q.pergunta}"</em></div>
                      <div style={{ marginTop: '3px', textAlign: 'justify' }}><strong>Resposta Técnica:</strong> {q.resposta || 'Reporta-se aos demonstrativos da Seção 3.'}</div>
                    </div>
                  ))}

                  <h4 style={{ fontSize: '13.5px', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', marginTop: '18px' }}>5. CONCLUSÃO PERICIAL E ENCERRAMENTO</h4>
                  <p style={{ fontSize: '12.5px', textAlign: 'justify' }}>{conclusaoTexto}</p>
                </div>
              )}

              {/* ASSINATURA SOLENE DO PERITO */}
              <div className="no-break" style={{ marginTop: '42px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                <div>{proc.comarca}, {new Date().toLocaleDateString('pt-BR')}.</div>
                <div style={{ marginTop: '36px', fontWeight: 'bold' }}>_______________________________________________________</div>
                <div style={{ fontWeight: '900', fontSize: '13px', marginTop: '4px' }}>{peritoInfo.nome}</div>
                <div>{papelPericial === 'perito_juizo' ? 'Perito Contábil Nomeado pelo Juízo' : 'Contador e Assistente Técnico'}</div>
                <div>CRC {peritoInfo.crc} • Cadastro Nacional de Peritos (CNPC) {peritoInfo.cnpc}</div>
              </div>
            </div>

            {/* VADE MECUM FORENSE DE CONSULTA RÁPIDA */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>📚 Vade Mecum de Bolso do Perito Contábil (Legislação Essencial)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px', fontSize: '12px', lineHeight: '1.6' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>⚖️ Código de Processo Civil (CPC/2015)</strong>
                  • <strong>Art. 465 §2º:</strong> Prazo de 5 dias para proposta de honorários e currículo.<br/>
                  • <strong>Art. 466 §2º:</strong> O perito deve avisar os Assistentes Técnicos com 5 dias de antecedência sobre o início dos trabalhos.<br/>
                  • <strong>Art. 473:</strong> Requisitos obrigatórios do laudo e proibição de emitir opinião pessoal ou jurídica.<br/>
                  • <strong>Art. 477:</strong> Prazo de 15 dias para esclarecer pontos divergentes.
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#15803d', display: 'block', marginBottom: '4px' }}>📘 Normas do CFC (NBC TP 01 e NBC PP 01)</strong>
                  • <strong>NBC TP 01 (R1):</strong> Regula os procedimentos técnico-científicos, o Termo de Diligência, a estrutura do Laudo e do Parecer.<br/>
                  • <strong>NBC PP 01 (R1):</strong> Dispõe sobre o zelo profissional, impedimento/suspeição, educação continuada (CNPC) e formação dos honorários periciais.
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>🏛️ Jurisprudência Chave (STJ, TST e CC)</strong>
                  • <strong>Súmula 264 TST:</strong> Base da hora extra soma todas as verbas salariais.<br/>
                  • <strong>Art. 606 CPC:</strong> Apuração de haveres societários exige Balanço de Determinação a preço de saída + bens incorpóreos (Goodwill).<br/>
                  • <strong>Art. 402 CC:</strong> Lucros cessantes correspondem ao que razoavelmente deixou de lucrar (líquido de custos variáveis).
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}