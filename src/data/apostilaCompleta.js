export const modulosApostila = [
  {
    id: 'modulo-1',
    categoria: 'contabil',
    categoriaNome: 'Contabilidade Geral & Avançada',
    titulo: 'Módulo 1: A Estrutura Patrimonial e as Partidas Dobradas',
    resumo: 'Fundamentos da equação patrimonial, regime de competência e a dinâmica do método veneziano.',
    leituraMinutos: 12,
    topicos: [
      {
        subtitulo: '1.1 A Equação Fundamental do Patrimônio',
        texto: 'O patrimônio da entidade é o conjunto de bens, direitos e obrigações. A equação básica da contabilidade rege que o ATIVO (bens e direitos) deve ser sempre igual à soma do PASSIVO EXIGÍVEL (obrigações com terceiros) com o PATRIMÔNIO LÍQUIDO (recursos próprios dos sócios).'
      },
      {
        subtitulo: '1.2 A Regra de Ouro das Partidas Dobradas',
        texto: 'Criada por Frei Luca Pacioli em 1494, estabelece que para todo lançamento a DÉBITO (aplicação de recursos) deve existir um ou mais lançamentos a CRÉDITO (origem de recursos) de igual valor. As contas do Ativo e Despesas aumentam a Débito; Passivo, PL e Receitas aumentam a Crédito.'
      }
    ]
  },
  {
    id: 'modulo-2',
    categoria: 'dp',
    categoriaNome: 'Departamento Pessoal & eSocial',
    titulo: 'Módulo 2: Rotinas Trabalhistas, Folha e Rescisões',
    resumo: 'Cálculo de encargos, tabela progressiva de INSS, FGTS patronal e obrigações no eSocial.',
    leituraMinutos: 15,
    topicos: [
      {
        subtitulo: '2.1 O Princípio da Competência na Folha',
        texto: 'A despesa com salários deve ser reconhecida no mês em que o trabalho foi efetivamente prestado pelo colaborador, gerando o passivo "Salários a Pagar" a ser liquidado até o 5º dia útil do mês subsequente.'
      },
      {
        subtitulo: '2.2 Encargos Patronais (FGTS e INSS)',
        texto: 'O FGTS de 8% é um encargo estritamente da empresa, não podendo ser descontado do salário do empregado.'
      }
    ]
  },
  {
    id: 'modulo-3',
    categoria: 'fiscal',
    categoriaNome: 'Fiscal & Tributário',
    titulo: 'Módulo 3: Regimes de Tributação e Apuração de Impostos',
    resumo: 'Simples Nacional, Lucro Presumido, Lucro Real e a mecânica da não-cumulatividade.',
    leituraMinutos: 14,
    topicos: [
      {
        subtitulo: '3.1 A Não-Cumulatividade no Lucro Real',
        texto: 'No regime não-cumulativo (PIS/COFINS e ICMS), a empresa aproveita créditos fiscais sobre os insumos e mercadorias adquiridas para abater o imposto gerado sobre as vendas.'
      }
    ]
  },
  {
    id: 'modulo-analise-balancos',
    categoria: 'contabil',
    categoriaNome: 'Contabilidade Geral & Avançada',
    titulo: 'Módulo 4: Análise de Balanços e Índices de Liquidez',
    resumo: 'Como interpretar a saúde financeira da empresa através de índices de liquidez, endividamento e rentabilidade.',
    leituraMinutos: 14,
    topicos: [
      {
        subtitulo: '4.1 Liquidez Corrente e Liquidez Seca',
        texto: 'A Liquidez Corrente mede a capacidade da empresa de honrar suas obrigações de curto prazo, sendo calculada dividindo o Ativo Circulante pelo Passivo Circulante. Já a Liquidez Seca retira os Estoques do cálculo, pois representam ativos de menor liquidez imediata em caso de crise operacional.'
      },
      {
        subtitulo: '4.2 Análise de Endividamento Geral',
        texto: 'O índice de endividamento geral compara o total de obrigações com terceiros (Passivo Circulante + Passivo Não Circulante) em relação ao Ativo Total. Ele revela o grau de dependência da empresa em relação a capital de terceiros.'
      }
    ]
  },
  {
    id: 'modulo-rescisao-trabalhista',
    categoria: 'dp',
    categoriaNome: 'Departamento Pessoal & eSocial',
    titulo: 'Módulo 5: Rotinas de Rescisão Contratual e Verbas Rescisórias',
    resumo: 'Cálculo de aviso prévio proporcional, 13º salário proporcional, férias vencidas/proporcionais e multa do FGTS.',
    leituraMinutos: 16,
    topicos: [
      {
        subtitulo: '5.1 Tipos de Rescisão e Direitos',
        texto: 'A rescisão pode ocorrer por iniciativa do empregador (sem justa causa, com justa causa), pedido de demissão, acordo entre as partes (Art. 484-A da CLT) ou término de contrato. Cada modalidade altera diretamente o direito ao saque do FGTS, seguro-desemprego e aviso prévio.'
      },
      {
        subtitulo: '5.2 Aviso Prévio Proporcional (Lei nº 12.506/2011)',
        texto: 'Além dos 30 dias constitucionais básicos, acrescentam-se 3 dias por ano de serviço prestado na mesma empresa, podendo chegar a um teto de 90 dias totais de aviso prévio indenizado ou trabalhado.'
      }
    ]
  },
  {
    id: 'modulo-fator-r-simples',
    categoria: 'fiscal',
    categoriaNome: 'Fiscal & Tributário',
    titulo: 'Módulo 6: O Fator R no Simples Nacional (Anexo III vs Anexo V)',
    resumo: 'Como funciona o cálculo da folha de salários para determinar a tributação de serviços no Simples Nacional.',
    leituraMinutos: 11,
    topicos: [
      {
        subtitulo: '6.1 O Conceito e a Fórmula do Fator R',
        texto: 'O Fator R é a razão entre a folha de salários (incluindo pró-labore e FGTS) dos últimos 12 meses e a receita bruta total do mesmo período. Se o resultado for igual ou superior a 28%, a atividade é tributada pelo Anexo III, que possui alíquotas significativamente menores.'
      },
      {
        subtitulo: '6.2 Impacto do Pró-Labore na Redução de Tributos',
        texto: 'Muitas empresas prestadoras de serviços (como TI, engenharia e consultoria) utilizam uma gestão estratégica do pró-labore dos sócios para atingir o limite de 28% do Fator R, gerando uma economia tributária expressiva na apuração mensal do PGDAS-D.'
      }
      
    ]
  },


  {
    id: 'mod-101',
    categoria: 'contabil',
    categoriaNome: 'Contabilidade Geral & Avançada',
    titulo: 'Estrutura Conceitual para Relatório Financeiro (CPC 00 / NBC TG Estrutura Conceitual)',
    resumo: 'Estudo aprofundado sobre as características qualitativas da informação contábil útil, reconhecimento e desreconhecimento de elementos patrimoniais.',
    leituraMinutos: 12,
    topicos: [
      {
        subtitulo: '1. O Propósito das Demonstrações Contábeis',
        texto: 'O objetivo das demonstrações contábeis de propósito geral é fornecer informação financeira sobre a entidade que reporta que seja útil para investidores, credores por empréstimo e outros credores existentes e em potencial na tomada de decisões referentes à oferta de recursos à entidade.'
      },
      {
        subtitulo: '2. Características Qualitativas da Informação Útil',
        texto: 'As características qualitativas fundamentais são a relevância e a representação fidedigna. \n\n• Relevância: Informação financeira relevante é aquela capaz de fazer diferença nas decisões tomadas pelos usuários. Possui valor preditivo, confirmatório ou ambos.\n\n• Representação Fidedigna: Para ser perfeitamente fidedigna, a representação deve ter três atributos: completa, neutra e livre de erro.'
      },
      {
        subtitulo: '3. Características Qualitativas de Melhoria',
        texto: 'São quatro as características de melhoria que aumentam a utilidade da informação:\n1. Comparabilidade: Permite aos usuários identificar e compreender similaridades e diferenças entre itens.\n2. Verificabilidade: Ajuda a assegurar aos usuários que a informação representa fidedignamente o fenômeno econômico.\n3. Tempestividade: Significa dispor de informação a tempo de poder influenciar decisões.\n4. Compreensibilidade: Classificar, caracterizar e apresentar a informação com clareza e concisão.'
      }
    ]
  },
  {
    id: 'mod-102',
    categoria: 'contabil',
    categoriaNome: 'Contabilidade Geral & Avançada',
    titulo: 'Apuração do Resultado do Exercício e Estrutura da DRE (Lei 6.404/76)',
    resumo: 'Passo a passo detalhado sobre a estrutura obrigatória da Demonstração do Resultado do Exercício, deduções da receita bruta e apuração do IRPJ/CSLL.',
    leituraMinutos: 15,
    topicos: [
      {
        subtitulo: '1. Da Receita Bruta ao Lucro Bruto',
        texto: 'A DRE inicia-se com a Receita Bruta de Vendas e Serviços. A partir dela, subtraem-se as deduções (vendas canceladas, abatimentos e impostos incidentes sobre a venda como ICMS, PIS, COFINS e ISS), chegando-se à Receita Líquida. Descontando o Custo das Mercadorias Vendidas (CMV) ou dos Serviços Prestados (CSV), apura-se o Lucro Bruto.'
      },
      {
        subtitulo: '2. Despesas Operacionais e o Resultado Operacional',
        texto: 'Após o Lucro Bruto, deduzem-se as despesas operacionais, que englobam:\n• Despesas de Vendas (comissões, fretes, marketing).\n• Despesas Gerais e Administrativas (salários da administração, aluguéis, sistemas).\n• Outras receitas e despesas operacionais.'
      },
      {
        subtitulo: '3. Resultado Antes do IR e Contribuição Social (LAIR)',
        texto: 'Somando-se ou subtraindo-se o resultado financeiro (receitas e despesas de juros e variações cambiais), obtém-se o LAIR (Lucro Antes do Imposto de Renda e da Contribuição Social). Após a provisão para o IRPJ e a CSLL, deduzem-se as participações (debêntures, empregados, administradores) para chegar ao Lucro Líquido do Exercício.'
      }
    ]
  },
  {
    id: 'mod-201',
    categoria: 'dp',
    categoriaNome: 'Departamento Pessoal & eSocial',
    titulo: 'Cálculo Avançado de Folha de Pagamento: Horas Extras, DSR e Encargos',
    resumo: 'Metodologia prática para apuração de proventos e descontos legais, reflexo de horas extraordinárias no Descanso Semanal Remunerado e encargos patronais (INSS/FGTS).',
    leituraMinutos: 14,
    topicos: [
      {
        subtitulo: '1. Composição da Base de Cálculo e Horas Extras',
        texto: 'O salário base é a referência para o cálculo de adicionais. Para calcular o valor da hora extra, divide-se o salário mensal pelo divisor contratual (ex: 220 horas para jornada de 44h semanais). Sobre o valor da hora normal, aplica-se o adicional constitucional mínimo de 50% (ou percentuais convencionados em acordo coletivo).'
      },
      {
        subtitulo: '2. Reflexo do DSR sobre Horas Extras',
        texto: 'O Descanso Semanal Remunerado (DSR) deve incidir sobre o total de horas extras prestadas no mês. A fórmula padrão no regime mensalista é:\n[ (Total de Horas Extras no Mês / Dias Úteis do Mês) * Dias de Repouso (Domingos e Feriados) ] * Valor da Hora Extra.'
      },
      {
        subtitulo: '3. Encargos Sociais e Obrigações (INSS e FGTS)',
        texto: '• INSS Empregado: Calculado de forma progressiva por faixas salariais aplicadas sobre a remuneração.\n• FGTS: Depósito obrigatório de 8% a cargo exclusivo do empregador, depositado em conta vinculada na Caixa Econômica Federal até o dia 7 do mês seguinte.\n• INSS Patronal (CPP): Alíquota devida pela empresa conforme o regime tributário (Simples Nacional vs. Lucro Real/Presumido).'
      }
    ]
  },
  {
    id: 'mod-301',
    categoria: 'fiscal',
    categoriaNome: 'Fiscal & Tributário',
    titulo: 'Reforma Tributária e o Novo Sistema de IVA Dual (CBS e IBS)',
    resumo: 'Compreenda a transição do modelo atual de tributação sobre o consumo (PIS, COFINS, IPI, ICMS e ISS) para o Imposto sobre Valor Agregado Dual.',
    leituraMinutos: 12,
    topicos: [
      {
        subtitulo: '1. O Conceito de Não-Cumulatividade Plena',
        texto: 'O principal objetivo da Reforma Tributária é eliminar a cumulatividade em cascata que encarece a cadeia produtiva nacional. O novo modelo garante o aproveitamento de créditos amplos sobre praticamente todas as aquisições de insumos, bens e serviços utilizados pela empresa.'
      },
      {
        subtitulo: '2. A Estrutura do IVA Dual',
        texto: 'O sistema divide-se em duas instâncias:\n• CBS (Contribuição sobre Bens e Serviços): De competência federal, substituindo o PIS, a COFINS e o IPI.\n• IBS (Imposto sobre Bens e Serviços): De competência compartilhada entre Estados e Municípios, substituindo o ICMS e o ISS.'
      },
      {
        subtitulo: '3. Período de Transição e Impactos Gerenciais',
        texto: 'A implementação será gradual ao longo dos próximos anos, exigindo das empresas um rigor técnico absoluto na classificação fiscal de notas de entrada e saída, apuração digital cruzada e ajustes estruturais no planejamento tributário corporativo.'
      }
    ]
  },
  {
    id: 'mod-401',
    categoria: 'design',
    categoriaNome: 'Ergonomia & Design de Interiores',
    titulo: 'Ergonomia Aplicada e Normas de Acessibilidade (NBR 9050)',
    resumo: 'Diretrizes técnicas para dimensionamento de espaços corporativos e industriais, antropometria e conforto ambiental conforme a ABNT.',
    leituraMinutos: 10,
    topicos: [
      {
        subtitulo: '1. Antropometria e Postura no Mobiliário',
        texto: 'A antropometria estuda as medidas físicas do corpo humano. No design de mobiliário de apoio e estações de trabalho, o dimensionamento deve contemplar o percentil 5 ao 95 da população atendida, garantindo ajustes de altura de assento, apoio lombar e planos de trabalho inclinados ou horizontais.'
      },
      {
        subtitulo: '2. Parâmetros de Acessibilidade (NBR 9050)',
        texto: 'A norma estabelece critérios para áreas de circulação, desníveis, rampas e dimensões de portas e sanitários acessíveis. O módulo de referência (M_R) para giro e manobra de cadeira de rodas é fundamental para o projeto de layouts comerciais e industriais inclusivos.'
      }
    ]
  },
];