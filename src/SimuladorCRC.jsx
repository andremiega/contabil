import React, { useState } from 'react';

export default function SimuladorCRC() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Navegação: 'exercicios', 'fichas', 'decore', 'pepc', 'contratos', 'anuidade'
  const [secaoAtiva, setSecaoAtiva] = useState('exercicios');

  // ==========================================
  // 1. DADOS DO PROFISSIONAL
  // ==========================================
  const [contadorNome] = useState('Andre Lopes da Silva');
  const [registroCrc] = useState('CRC-SP 1SP345890/O-2');

  // ==========================================
  // 2. BANCO DE 30 QUESTÕES DO EXAME CFC
  // ==========================================
  const questoesExame = [
    {
      id: 1,
      disciplina: 'Ética Profissional',
      enunciado: 'Um contador assumiu a responsabilidade técnica de uma sociedade limitada após a renúncia do colega anterior, mas não emitiu o Termo de Transferência nem comunicou previamente o profissional substituído. Conforme a NBC PG 01 e a Resolução CFC nº 1.590/2020:',
      opcoes: [
        { id: 'a', texto: 'A conduta é regular em virtude da livre iniciativa e concorrência comercial.' },
        { id: 'b', texto: 'A conduta constitui infração ética, sendo obrigatória a comunicação formal e a emissão do termo de transferência.' },
        { id: 'c', texto: 'Apenas o empresário contratante responde pela comunicação ao conselho regional.' },
        { id: 'd', texto: 'A transferência de responsabilidade só exige formalização se houver litígio judicial prévio.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: A NBC PG 01 veda a assunção de serviços sem comunicação formal prévia ao colega antecedente e exige o Termo de Transferência com o inventário dos documentos.'
    },
    {
      id: 2,
      disciplina: 'Perícia Contábil',
      enunciado: 'Segundo a NBC PP 01, o perito do juízo deve recusar a nomeação quando houver motivo de impedimento ou suspeição. Constitui causa inequívoca de impedimento:',
      opcoes: [
        { id: 'a', texto: 'Ser amigo íntimo ou inimigo capital de uma das partes em litígio.' },
        { id: 'b', texto: 'Ser herdeiro presuntivo, donatário ou empregador de uma das partes.' },
        { id: 'c', texto: 'Ter atuado como perito assistente técnico de uma das partes no mesmo processo.' },
        { id: 'd', texto: 'Todas as alternativas anteriores indicam impedimento ou suspeição legal.' }
      ],
      correta: 'd',
      comentario: 'Gabarito D: O CPC (art. 144 e 148) e a NBC PP 01 determinam que relações de parentesco, interesse na lide ou prévia atuação técnica geram suspeição ou impedimento taxativo.'
    },
    {
      id: 3,
      disciplina: 'DECORE Eletrônica',
      enunciado: 'Na emissão de DECORE eletrônica para comprovar rendimentos oriundos de distribuição de lucros acima do limite da presunção fiscal, o lastro probatório essencial exigido pelo CFC é:',
      opcoes: [
        { id: 'a', texto: 'Extrato de poupança pessoal do beneficiário.' },
        { id: 'b', texto: 'Declaração firmada de próprio punho pelo sócio.' },
        { id: 'c', texto: 'Escrituração contábil regular (Livro Diário / ECD) com apuração de lucros e ata/comprovante de transferência bancária.' },
        { id: 'd', texto: 'Apenas a DIRPF do exercício fiscal anterior.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: A Resolução CFC nº 1.364/2011 exige escrituração contábil idônea que comprove a existência do lucro líquido apurado para justificar a distribuição.'
    },
    {
      id: 4,
      disciplina: 'Normas Internacionais',
      enunciado: 'De acordo com o Pronunciamento Técnico CPC 27 (Ativo Imobilizado), o valor depreciável de um ativo deve ser apropriado de forma sistemática ao longo de sua vida útil. O valor depreciável corresponde a:',
      opcoes: [
        { id: 'a', texto: 'Custo histórico sem qualquer dedução.' },
        { id: 'b', texto: 'Custo de aquisição deduzido do seu valor residual estimado.' },
        { id: 'c', texto: 'Valor justo de mercado no encerramento do exercício.' },
        { id: 'd', texto: 'Valor de liquidação forçada determinado por laudo.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Conforme o CPC 27, Valor Depreciável = Custo de Aquisição/Produção (-) Valor Residual Estimado de Descarte.'
    },
    {
      id: 5,
      disciplina: 'Contabilidade de Custos',
      enunciado: 'No método de Custeio por Absorção, como são tratados os custos fixos indiretos de produção (CIF) e as despesas administrativas de vendas, respectivamente?',
      opcoes: [
        { id: 'a', texto: 'Ambos são levados integralmente ao resultado do exercício no momento em que ocorrem.' },
        { id: 'b', texto: 'Os CIF integram o custo dos produtos e vão para o estoque; as despesas são lançadas diretamente no resultado.' },
        { id: 'c', texto: 'Os CIF são deduzidos da receita bruta e as despesas são estocadas.' },
        { id: 'd', texto: 'Ambos integram o custo dos produtos vendidos sem distinção.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: O custeio por absorção incorpora todos os custos de produção (diretos e indiretos) aos produtos acabados e em elaboração; as despesas vão diretamente para o resultado.'
    },
    {
      id: 6,
      disciplina: 'Contabilidade Geral',
      enunciado: 'A aquisição de mercadorias para revenda por R$ 50.000 com incidência de ICMS recuperável de 18% gera qual registro contábil na adquirente?',
      opcoes: [
        { id: 'a', texto: 'D - Estoque de Mercadorias: R$ 50.000 / C - Fornecedores: R$ 50.000' },
        { id: 'b', texto: 'D - Estoque: R$ 41.000 / D - ICMS a Recuperar: R$ 9.000 / C - Fornecedores: R$ 50.000' },
        { id: 'c', texto: 'D - Estoque: R$ 50.000 / D - ICMS a Recolher: R$ 9.000 / C - Caixa: R$ 59.000' },
        { id: 'd', texto: 'D - Despesa com Mercadorias: R$ 41.000 / C - Banco: R$ 41.000' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Tributos recuperáveis não integram o custo de aquisição do estoque (CPC 16), sendo segregados em conta do Ativo Circulante (ICMS a Recuperar).'
    },
    {
      id: 7,
      disciplina: 'Educação Profissional',
      enunciado: 'Segundo a NBC PG 12 (R3), qual a pontuação mínima anual que os auditores independentes e peritos contábeis cadastrados no CFC devem cumprir no PEPC?',
      opcoes: [
        { id: 'a', texto: '20 pontos anuais.' },
        { id: 'b', texto: '30 pontos anuais.' },
        { id: 'c', texto: '40 pontos anuais homologados pelo conselho.' },
        { id: 'd', texto: '60 pontos a cada biênio.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: A NBC PG 12 fixa em 40 pontos anuais o cumprimento obrigatório de atividades de capacitação para a manutenção do registro no CNAI e CNPC.'
    },
    {
      id: 8,
      disciplina: 'Auditoria Independente',
      enunciado: 'Quando o auditor obtém evidência apropriada de que as demonstrações contêm distorções relevantes, mas que NÃO são generalizadas, ele deve emitir uma opinião:',
      opcoes: [
        { id: 'a', texto: 'Sem ressalva (opinião limpa).' },
        { id: 'b', texto: 'Com ressalva.' },
        { id: 'c', texto: 'Adversa.' },
        { id: 'd', texto: 'Abstenção de opinião.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Pela NBC TA 705, distorções relevantes mas não generalizadas demandam relatório com opinião com ressalva.'
    },
    {
      id: 9,
      disciplina: 'Legislação Societária',
      enunciado: 'De acordo com a Lei das S/A (Lei 6.404/76), a reserva legal deve ser constituída com a destinação de 5% do lucro líquido do exercício, com o teto de:',
      opcoes: [
        { id: 'a', texto: '10% do Capital Social.' },
        { id: 'b', texto: '20% do Capital Social realizado.' },
        { id: 'c', texto: '30% do Patrimônio Líquido total.' },
        { id: 'd', texto: '50% do Lucro Operacional.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: O art. 193 da Lei 6.404/76 estabelece que a reserva legal deixará de ser obrigatória quando atingir 20% do capital social.'
    },
    {
      id: 10,
      disciplina: 'Legislação Tributária',
      enunciado: 'No regime de tributação do Lucro Presumido, qual o percentual de presunção aplicado sobre a receita bruta para apuração da base de cálculo do IRPJ em serviços em geral (não hospitalares/transporte)?',
      opcoes: [
        { id: 'a', texto: '8%' },
        { id: 'b', texto: '16%' },
        { id: 'c', texto: '32%' },
        { id: 'd', texto: '38%' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: A presunção geral para prestadoras de serviços profissionais regulamentados no Lucro Presumido é de 32% sobre a receita bruta para fins de IRPJ e CSLL.'
    },
    {
      id: 11,
      disciplina: 'Contabilidade Geral',
      enunciado: 'A conta "Duplicatas Descontadas" deve ser classificada no Balanço Patrimonial como:',
      opcoes: [
        { id: 'a', texto: 'Conta redutora do Ativo Circulante (Clientes).' },
        { id: 'b', texto: 'Passivo Circulante (Empréstimos / Operações Financeiras com Instituições).' },
        { id: 'c', texto: 'Despesa Financeira Antecipada no Ativo Não Circulante.' },
        { id: 'd', texto: 'Conta de Patrimônio Líquido em reservas de capital.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Pela essência sobre a forma e NBC TG 38 / CPC 48, o desconto de duplicatas com direito de regresso constitui passivo de financiamento com o banco, não mais conta redutora de clientes.'
    },
    {
      id: 12,
      disciplina: 'Controladoria',
      enunciado: 'O Ponto de Equilíbrio Financeiro (PEF) difere do Ponto de Equilíbrio Contábil (PEC) porque:',
      opcoes: [
        { id: 'a', texto: 'Acrescenta uma taxa mínima de atratividade aos custos fixos.' },
        { id: 'b', texto: 'Exclui dos custos e despesas fixas os encargos não desembolsáveis, como a depreciação e amortização.' },
        { id: 'c', texto: 'Desconsidera as despesas variáveis de vendas.' },
        { id: 'd', texto: 'Calcula o faturamento com base no regime de caixa das duplicatas.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: O PEF apura o nível de atividade em que as receitas cobrem apenas os gastos fixos que exigem desembolso financeiro de caixa.'
    },
    {
      id: 13,
      disciplina: 'Normas Internacionais',
      enunciado: 'Segundo o CPC 01 (Redução ao Valor Recuperável de Ativos - Teste de Impairment), o valor recuperável de um ativo é definido como o MAIOR valor entre:',
      opcoes: [
        { id: 'a', texto: 'O custo histórico e o valor depreciável.' },
        { id: 'b', texto: 'O valor justo líquido de despesas de venda e o seu valor em uso.' },
        { id: 'c', texto: 'O valor contábil líquido e o valor residual de liquidação.' },
        { id: 'd', texto: 'O preço de reposição e o valor venal de IPTU.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Conforme o item 18 do CPC 01, Valor Recuperável = Maior entre (Valor Justo Líquido de Despesas de Alienação) e (Valor em Uso através do fluxo de caixa descontado).'
    },
    {
      id: 14,
      disciplina: 'Teoria da Contabilidade',
      enunciado: 'Qual princípio/pressuposto básico determina que os efeitos das transações e outros eventos sejam reconhecidos nos períodos a que se referem, independentemente de recebimento ou pagamento?',
      opcoes: [
        { id: 'a', texto: 'Continuidade.' },
        { id: 'b', texto: 'Entidade.' },
        { id: 'c', texto: 'Regime de Competência.' },
        { id: 'd', texto: 'Prudência.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: O regime de competência reconhece receitas e despesas quando satisfeitas as obrigações de desempenho ou incorridos os fatos geradores.'
    },
    {
      id: 15,
      disciplina: 'Contabilidade de Custos',
      enunciado: 'Se uma empresa possui Custos Fixos de R$ 80.000, Preço de Venda Unitário de R$ 100 e Custos Variáveis Unitários de R$ 60, qual é o Ponto de Equilíbrio Contábil em unidades?',
      opcoes: [
        { id: 'a', texto: '1.000 unidades' },
        { id: 'b', texto: '2.000 unidades' },
        { id: 'c', texto: '3.000 unidades' },
        { id: 'd', texto: '4.000 unidades' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Margem de Contribuição Unitária = R$ 100 - R$ 60 = R$ 40. PEC = Custos Fixos / MCU = R$ 80.000 / R$ 40 = 2.000 unidades.'
    },
    {
      id: 16,
      disciplina: 'Legislação Societária',
      enunciado: 'A demonstração contábil obrigatória para as companhias abertas que evidencia a riqueza gerada pela entidade e a forma como foi distribuída entre empregados, governo, financiadores e sócios é a:',
      opcoes: [
        { id: 'a', texto: 'DMPL (Demonstração das Mutações do Patrimônio Líquido).' },
        { id: 'b', texto: 'DVA (Demonstração do Valor Adicionado).' },
        { id: 'c', texto: 'DFC (Demonstração dos Fluxos de Caixa).' },
        { id: 'd', texto: 'DRA (Demonstração do Resultado Abrangente).' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Conforme a Lei 6.404/76 e o CPC 09, a DVA é obrigatória para S/A de capital aberto e ilustra a geração e destinação do valor adicionado.'
    },
    {
      id: 17,
      disciplina: 'Matemática Financeira',
      enunciado: 'Uma aplicação financeira de R$ 10.000 pelo prazo de 2 meses à taxa de juros compostos de 3% ao mês renderá um montante final de:',
      opcoes: [
        { id: 'a', texto: 'R$ 10.600,00' },
        { id: 'b', texto: 'R$ 10.609,00' },
        { id: 'c', texto: 'R$ 10.618,00' },
        { id: 'd', texto: 'R$ 10.700,00' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: M = C * (1 + i)^t = 10.000 * (1,03)^2 = 10.000 * 1,0609 = R$ 10.609,00.'
    },
    {
      id: 18,
      disciplina: 'Ética Profissional',
      enunciado: 'O profissional de contabilidade pode reter livros contábeis, documentos ou arquivos digitais do cliente em razão de inadimplemento de honorários acordados?',
      opcoes: [
        { id: 'a', texto: 'Sim, como garantia legítima até a purgação da mora.' },
        { id: 'b', texto: 'Sim, desde que autorizado por cláusula resolutiva no contrato.' },
        { id: 'c', texto: 'Não, a retenção de documentos é expressamente vedada pelo Código de Ética e configura infração disciplinar grave.' },
        { id: 'd', texto: 'Apenas os livros fiscais digitais podem ser retidos.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: A NBC PG 01 veda taxativamente a retenção abusiva de quaisquer livros, fichas ou comprovantes do cliente por cobrança de honorários.'
    },
    {
      id: 19,
      disciplina: 'Contabilidade Pública',
      enunciado: 'No Plano de Contas Aplicado ao Setor Público (PCASP), os fatos que afetam o patrimônio público de forma modificativa aumentativa ou diminutiva são registrados na classe:',
      opcoes: [
        { id: 'a', texto: 'Classes 1 e 2 (Ativo e Passivo).' },
        { id: 'b', texto: 'Classes 3 e 4 (Variações Patrimoniais Diminutivas e Aumentativas - VPD/VPA).' },
        { id: 'c', texto: 'Classes 5 e 6 (Orçamento).' },
        { id: 'd', texto: 'Classes 7 e 8 (Controles Devedores e Credores).' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: No subsistema patrimonial do PCASP, as contas de resultado do setor público são denominadas Variação Patrimonial Diminutiva (classe 3) e Aumentativa (classe 4).'
    },
    {
      id: 20,
      disciplina: 'Normas Internacionais',
      enunciado: 'Segundo o CPC 25 (Provisões, Passivos Contingentes e Ativos Contingentes), uma obrigação presente derivada de eventos passados cuja liquidação é PROVÁVEL e estimável com confiabilidade deve ser:',
      opcoes: [
        { id: 'a', texto: 'Apenas divulgada em notas explicativas.' },
        { id: 'b', texto: 'Reconhecida no Balanço Patrimonial como Provisão.' },
        { id: 'c', texto: 'Ignorada até o trânsito em julgado.' },
        { id: 'd', texto: 'Lançada diretamente como redução do Patrimônio Líquido.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Quando a obrigação for presente, a saída de recursos for provável (>50%) e puder ser mensurada confiavelmente, o CPC 25 exige o reconhecimento contábil da provisão no passivo.'
    },
    {
      id: 21,
      disciplina: 'Contabilidade Geral',
      enunciado: 'A Demonstração dos Fluxos de Caixa (DFC) elaborada pelo Método Indireto parte de qual saldo para reconciliar as atividades operacionais?',
      opcoes: [
        { id: 'a', texto: 'Receita Bruta Operacional.' },
        { id: 'b', texto: 'Saldo Inicial da conta Caixa.' },
        { id: 'c', texto: 'Lucro ou Prejuízo Líquido do Exercício ajustado pelos itens sem efeito no caixa.' },
        { id: 'd', texto: 'Patrimônio Líquido final.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: Pelo método indireto (CPC 03), o fluxo operacional é apurado a partir do Lucro Líquido, ajustado por despesas não desembolsáveis (como depreciação) e variações no capital de giro.'
    },
    {
      id: 22,
      disciplina: 'Legislação Tributária',
      enunciado: 'Qual das seguintes contribuições previdenciárias patronais incidentes sobre a folha de pagamento NÃO é devida pelas microempresas optantes pelo Simples Nacional enquadradas no Anexo III?',
      opcoes: [
        { id: 'a', texto: 'FGTS do empregado (8%).' },
        { id: 'b', texto: 'CPP (Contribuição Patronal Previdenciária de 20% do INSS).' },
        { id: 'c', texto: 'Retenção do INSS do trabalhador.' },
        { id: 'd', texto: 'IRRF retido na fonte dos salários.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Empresas dos Anexos I, II, III e V do Simples Nacional têm a CPP patronal unificada dentro da guia DAS, ficando isentas dos 20% avulsos na DCTFWeb.'
    },
    {
      id: 23,
      disciplina: 'Contabilidade de Custos',
      enunciado: 'O método de avaliação de estoques em que os primeiros produtos que entram são os primeiros a serem baixados para o CPV denomina-se:',
      opcoes: [
        { id: 'a', texto: 'UEPS (LIFO).' },
        { id: 'b', texto: 'Média Ponderada Móvel.' },
        { id: 'c', texto: 'PEPS (FIFO).' },
        { id: 'd', texto: 'Custo Padrão.' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: PEPS (Primeiro a Entrar, Primeiro a Sair) avalia o estoque remanescente com os custos mais recentes de aquisição.'
    },
    {
      id: 24,
      disciplina: 'Perícia Contábil',
      enunciado: 'O documento técnico formal por meio do qual o perito judicial apresenta suas conclusões fundamentadas aos quesitos formulados pelas partes e pelo juízo é denominado:',
      opcoes: [
        { id: 'a', texto: 'Parecer Pericial Contábil.' },
        { id: 'b', texto: 'Laudo Pericial Contábil.' },
        { id: 'c', texto: 'Termo de Diligência.' },
        { id: 'd', texto: 'Certidão Circunstanciada.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Pela NBC PP 01, o perito do juiz emite o "Laudo Pericial Contábil", enquanto o perito assistente técnico emite o "Parecer Pericial Contábil".'
    },
    {
      id: 25,
      disciplina: 'Normas Internacionais',
      enunciado: 'O CPC 06 (R2) / IFRS 16 eliminou a distinção entre arrendamento mercantil financeiro e operacional para os arrendatários. Como regra geral, o arrendatário deve reconhecer no balanço:',
      opcoes: [
        { id: 'a', texto: 'Apenas uma despesa linear de aluguel na DRE.' },
        { id: 'b', texto: 'Um ativo de Direito de Uso no Ativo Imobilizado e um Passivo de Arrendamento.' },
        { id: 'c', texto: 'Uma conta redutora do Patrimônio Líquido.' },
        { id: 'd', texto: 'Apenas nota explicativa sem lançamento contábil.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: O IFRS 16 obriga o arrendatário a contabilizar o ativo de "Direito de Uso" contra o passivo correspondente dos pagamentos futuros a valor presente.'
    },
    {
      id: 26,
      disciplina: 'Auditoria Independente',
      enunciado: 'A confirmação externa (circularização) solicitada formalmente a bancos, advogados e fornecedores tem como objetivo principal obter:',
      opcoes: [
        { id: 'a', texto: 'Comprovação de pagamento de honorários de auditoria.' },
        { id: 'b', texto: 'Evidência de auditoria direta e independente fornecida por terceiros (NBC TA 505).' },
        { id: 'c', texto: 'Aprovação do balanço pelo conselho fiscal.' },
        { id: 'd', texto: 'Recálculo das obrigações sindicais patronais.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: A NBC TA 505 trata das confirmações externas como uma das fontes mais confiáveis de evidência por sua origem de terceiros desvinculados.'
    },
    {
      id: 27,
      disciplina: 'Contabilidade Geral',
      enunciado: 'Uma máquina foi adquirida por R$ 120.000, com vida útil estimada de 5 anos e valor residual de R$ 20.000. Utilizando o método das cotas constantes, a depreciação acumulada ao final do 2º ano será de:',
      opcoes: [
        { id: 'a', texto: 'R$ 20.000' },
        { id: 'b', texto: 'R$ 24.000' },
        { id: 'c', texto: 'R$ 40.000' },
        { id: 'd', texto: 'R$ 48.000' }
      ],
      correta: 'c',
      comentario: 'Gabarito C: Valor depreciável = R$ 120.000 - R$ 20.000 = R$ 100.000. Depreciação anual = R$ 100.000 / 5 = R$ 20.000/ano. Em 2 anos = R$ 40.000.'
    },
    {
      id: 28,
      disciplina: 'Legislação Societária',
      enunciado: 'Nas sociedades anônimas, os dividendos propostos pelos órgãos de administração que ultrapassarem a parcela obrigatória prevista no estatuto social, antes da aprovação pela AGO, devem ser classificados como:',
      opcoes: [
        { id: 'a', texto: 'Passivo Circulante no ato da apuração.' },
        { id: 'b', texto: 'Conta específica no Patrimônio Líquido (Reserva de Dividendos / Lucros).' },
        { id: 'c', texto: 'Despesa Financeira Operacional.' },
        { id: 'd', texto: 'Adiantamento a Acionistas no Ativo Não Circulante.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: Conforme o CPC 25 e interpretações do CFC/CVM, a parcela adicional de dividendos que depende de deliberação da assembleia fica retida no PL até sua homologação.'
    },
    {
      id: 29,
      disciplina: 'Controladoria',
      enunciado: 'O Grau de Alavancagem Operacional (GAO) expressa:',
      opcoes: [
        { id: 'a', texto: 'A proporção de capital próprio em relação às dívidas financeiras de curto prazo.' },
        { id: 'b', texto: 'A sensibilidade da variação percentual do lucro operacional frente a uma variação percentual no volume de vendas.' },
        { id: 'c', texto: 'O percentual de dividendos distribuídos em relação ao capital social subscrito.' },
        { id: 'd', texto: 'O prazo médio de recebimento de vendas a prazo.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: GAO = Variação % no Lucro Operacional / Variação % nas Vendas. Mede o impacto dos custos fixos sobre o resultado.'
    },
    {
      id: 30,
      disciplina: 'Ética Profissional',
      enunciado: 'Caso um profissional da contabilidade seja processado disciplinarmente perante o Tribunal Regional de Ética (TRED) do CRC e sofra condenação em primeira instância, a quem caberá o recurso ordinário final?',
      opcoes: [
        { id: 'a', texto: 'Ao Tribunal de Justiça Estadual competente.' },
        { id: 'b', texto: 'Ao Plenário do Conselho Federal de Contabilidade (CFC).' },
        { id: 'c', texto: 'Ao Ministério Público Federal.' },
        { id: 'd', texto: 'À Junta Comercial do respectivo Estado.' }
      ],
      correta: 'b',
      comentario: 'Gabarito B: O CFC funciona como órgão recursal máximo de 2ª instância administrativa para recursos contra decisões dos Tribunais Regionais de Ética dos CRCs.'
    }
  ];

  const [respostasUsuario, setRespostasUsuario] = useState({});
  const [gabaritoRevelado, setGabaritoRevelado] = useState(false);
  const [filtroMateria, setFiltroMateria] = useState('todas');

  const selecionarOpcao = (questaoId, opcaoId) => {
    if (!gabaritoRevelado) {
      setRespostasUsuario({ ...respostasUsuario, [questaoId]: opcaoId });
    }
  };

  const calcularPontuacao = () => {
    let acertos = 0;
    questoesExame.forEach(q => {
      if (respostasUsuario[q.id] === q.correta) acertos++;
    });
    return acertos;
  };

  const totalAcertos = calcularPontuacao();
  const questoesFiltradas = questoesExame.filter(q => {
    if (filtroMateria === 'todas') return true;
    return q.disciplina === filtroMateria;
  });

  // ==========================================
  // 3. FICHAS TÉCNICAS E DIRETRIZES DO CFC
  // ==========================================
  const [fichaSelecionada, setFichaSelecionada] = useState('nbc_pg_01');
  const fichasTecnicas = {
    nbc_pg_01: {
      titulo: 'NBC PG 01 - Código de Ética Profissional do Contador',
      subtitulo: 'Deveres, vedações e honorários da profissão contábil',
      pontosChave: [
        'Dever de guardar sigilo profissional, mesmo após o término do vínculo contratual.',
        'Proibição de aviltamento de honorários ou captação desleal de clientela.',
        'Obrigatoriedade de termo de transferência de responsabilidade técnica perante novo colega.',
        'Renúncia a mandato que deve ser comunicada por escrito com antecedência mínima legal.'
      ],
      infracao: 'A quebra de sigilo ou retenção de documentos do cliente acarreta penalidades que vão de advertência reservada à cassação do exercício profissional.'
    },
    resolucao_1590: {
      titulo: 'Resolução CFC nº 1.590/2020 - Contrato de Prestação de Serviços',
      subtitulo: 'Formalização obrigatória da relação jurídica e escopo',
      pontosChave: [
        'Obrigatória celebração por escrito antes do início de qualquer trabalho contábil.',
        'Discriminação pormenorizada das obrigações principais (balanço, DRE) e acessórias (SPED, DCTFWeb).',
        'Definição expressa do valor dos honorários, índice de reajuste anual e prazo de pagamento.',
        'Fixação de cláusula de rescisão contratual com prazo mínimo de aviso prévio.'
      ],
      infracao: 'A prestação de serviços sem contrato formal constitui infração disciplinar passível de auto de infração e multa pelo setor de fiscalização do CRC.'
    },
    resolucao_1364: {
      titulo: 'Resolução CFC nº 1.364/2011 - DECORE Eletrônica',
      subtitulo: 'Regulamentação do lastro probatório para comprovação de renda',
      pontosChave: [
        'A DECORE é emitida exclusivamente via sistema eletrônico do CFC com certificação digital.',
        'Exige obrigatoriamente upload dos documentos que lastreiam o rendimento informado.',
        'Pró-labore requer GFIP/eSocial e comprovante bancário de transferência.',
        'Distribuição de lucros exige Balanço Patrimonial registrado ou Livro Diário com escrituração contábil regular.'
      ],
      infracao: 'Emitir DECORE sem lastro documental configura falsidade ideológica e falta ético-disciplinar gravíssima perante o Tribunal de Ética do CRC.'
    },
    nbc_pg_12: {
      titulo: 'NBC PG 12 (R3) - Educação Profissional Continuada (PEPC)',
      subtitulo: 'Manutenção de competência técnica para auditores e peritos',
      pontosChave: [
        'Exigência de cumprimento de no mínimo 40 pontos anuais homologados pelo CFC.',
        'Obrigatório para contadores de empresas reguladas pela CVM, Banco Central e SUSEP.',
        'Obrigatório para Peritos Contábeis inscritos no CNPC e Auditores no CNAI.',
        'Pontos auferidos em cursos credenciados, docência, pós-graduação e publicação de artigos técnicos.'
      ],
      infracao: 'O não cumprimento da pontuação anual acarreta a exclusão do cadastro nacional (CNAI/CNPC) e processo ético administrativo.'
    }
  };

  // ==========================================
  // 4. MÓDULO DECORE ELETRÔNICA
  // ==========================================
  const [clienteBeneficiario, setClienteBeneficiario] = useState('Mariana Vasconcelos Ribeiro');
  const [cpfBeneficiario, setCpfBeneficiario] = useState('345.890.123-45');
  const [naturezaRendimento, setNaturezaRendimento] = useState('pro_labore');
  const [rendimentoMensalStr, setRendimentoMensalStr] = useState('14500.00');
  const [mesReferencia, setMesReferencia] = useState('Setembro/2026');
  const [tipoDocumentoLastro, setTipoDocumentoLastro] = useState('GFIP/eSocial e Recibo de Transferência Bancária');
  const [decoreEmitidas, setDecoreEmitidas] = useState([
    {
      id: 'DEC-2026-0041',
      beneficiario: 'Roberto Nogueira',
      natureza: 'Distribuição de Lucros',
      valor: 28000,
      mesRef: 'Agosto/2026',
      codigoControle: 'A9B4.88C1.5F32.90E1'
    },
    {
      id: 'DEC-2026-0042',
      beneficiario: 'Juliana Ferreira ME',
      natureza: 'Livro Caixa / Autônomo',
      valor: 8200,
      mesRef: 'Agosto/2026',
      codigoControle: '77F2.33C9.00B5.11A4'
    }
  ]);

  const handleEmitirDecore = (e) => {
    e.preventDefault();
    const val = parseFloat(rendimentoMensalStr) || 0;
    if (!clienteBeneficiario || val <= 0) {
      return alert('Preencha o nome do beneficiário e um valor válido.');
    }

    const codRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    const novaDecore = {
      id: `DEC-2026-00${decoreEmitidas.length + 43}`,
      beneficiario: clienteBeneficiario,
      natureza: naturezaRendimento === 'pro_labore' ? 'Pró-Labore' : naturezaRendimento === 'distribuicao_lucros' ? 'Distribuição de Lucros' : 'Livro Caixa',
      valor: val,
      mesRef: mesReferencia,
      codigoControle: `${codRandom}.${codRandom}.4A21.9F00`
    };

    setDecoreEmitidas([novaDecore, ...decoreEmitidas]);
    setClienteBeneficiario('');
    alert('DECORE eletrônica transmitida ao sistema do CFC com sucesso!');
  };

  // ==========================================
  // 5. PEPC, CONTRATOS E ANUIDADE
  // ==========================================
  const [atividadesPepc] = useState([
    { id: 1, descricao: 'MBA em Normas Internacionais IFRS & CPC', tipo: 'Pós-Graduação', pontos: 20, maximo: 20 },
    { id: 2, descricao: 'Congresso Brasileiro de Contabilidade (CFC)', tipo: 'Eventos Credenciados', pontos: 12, maximo: 15 },
    { id: 3, descricao: 'Curso de Atualização na Reforma Tributária', tipo: 'Cursos', pontos: 8, maximo: 10 }
  ]);

  const [contratos] = useState([
    { id: 1, empresa: 'Lopes & Silva Soluções Contábeis Ltda', cnpj: '12.345.678/0001-90', honorariosMensais: 2800, vencimento: 'Dia 10' },
    { id: 2, empresa: 'Indústria e Comércio Bandeirantes S/A', cnpj: '44.555.666/0001-22', honorariosMensais: 7500, vencimento: 'Dia 15' }
  ]);

  const [valorAnuidadeStr, setValorAnuidadeStr] = useState('630.00');
  const [anuidadePaga, setAnuidadePaga] = useState(true);

  const totalPontosPepc = atividadesPepc.reduce((acc, cur) => acc + cur.pontos, 0);
  const totalDecoreValor = decoreEmitidas.reduce((acc, cur) => acc + cur.valor, 0);
  const totalHonorariosAtivos = contratos.reduce((acc, cur) => acc + cur.honorariosMensais, 0);
  const aproveitamentoPerc = questoesExame.length > 0 ? (totalAcertos / questoesExame.length) * 100 : 0;

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxSizing: 'border-box' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>EXAME DE SUFICIÊNCIA & CRC</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900', wordBreak: 'break-word' }}>Módulo CFC / CRC & Gabarito 📜</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', maxWidth: '650px' }}>
            Simulador completo de 30 questões comentadas, emissão de DECORE eletrônica homologada, controle de PEPC e contratos profissionais.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase' }}>Simulado CFC</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>{Object.keys(respostasUsuario).length} <span style={{fontSize:'14px', color:'#64748b'}}>/ 30</span></div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS */}
      <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '14px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
        <button onClick={() => setSecaoAtiva('exercicios')} style={{ flex: '1 1 130px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'exercicios' ? '#2563eb' : 'transparent', color: secaoAtiva === 'exercicios' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          📝 Simulado (30Q)
        </button>
        <button onClick={() => setSecaoAtiva('fichas')} style={{ flex: '1 1 110px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'fichas' ? '#0f172a' : 'transparent', color: secaoAtiva === 'fichas' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          📚 Fichas
        </button>
        <button onClick={() => setSecaoAtiva('decore')} style={{ flex: '1 1 110px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'decore' ? '#0f172a' : 'transparent', color: secaoAtiva === 'decore' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          📋 DECORE
        </button>
        <button onClick={() => setSecaoAtiva('pepc')} style={{ flex: '1 1 100px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'pepc' ? '#0f172a' : 'transparent', color: secaoAtiva === 'pepc' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          🎓 PEPC
        </button>
        <button onClick={() => setSecaoAtiva('contratos')} style={{ flex: '1 1 110px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'contratos' ? '#0f172a' : 'transparent', color: secaoAtiva === 'contratos' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          ✍️ Contratos
        </button>
        <button onClick={() => setSecaoAtiva('anuidade')} style={{ flex: '1 1 110px', padding: '10px 14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: secaoAtiva === 'anuidade' ? '#16a34a' : 'transparent', color: secaoAtiva === 'anuidade' ? 'white' : '#475569', transition: 'all 0.2s' }}>
          💳 Anuidade
        </button>
      </div>

      {/* PAINEL COM 6 CARDS ANALÍTICOS (Grelha Flexível Inteligente) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '14px' }}>
        
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Responsável Técnico</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contadorNome}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{registroCrc}</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Simulado CFC (30Q)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '15px', marginTop: '4px' }}>{Object.keys(respostasUsuario).length} / 30</strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>{gabaritoRevelado ? `Aprov: ${aproveitamentoPerc.toFixed(0)}%` : 'Em aberto'}</span>
        </div>

        <div style={{ backgroundColor: gabaritoRevelado ? (totalAcertos >= 15 ? '#f0fdf4' : '#fff5f5') : '#ffffff', padding: '16px', borderRadius: '16px', border: `1px solid ${gabaritoRevelado ? (totalAcertos >= 15 ? '#86efac' : '#fecaca') : '#e2e8f0'}`, borderLeft: `4px solid ${gabaritoRevelado ? (totalAcertos >= 15 ? '#16a34a' : '#ef4444') : '#64748b'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: gabaritoRevelado ? (totalAcertos >= 15 ? '#166534' : '#991b1b') : '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Resultado CFC</span>
          <strong style={{ display: 'block', color: gabaritoRevelado ? (totalAcertos >= 15 ? '#15803d' : '#dc2626') : '#0f172a', fontSize: '15px', marginTop: '4px' }}>{gabaritoRevelado ? (totalAcertos >= 15 ? '🎉 APROVADO' : '🚨 REPROVADO') : 'Em Andamento'}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{gabaritoRevelado ? `${totalAcertos} acertos` : 'Corte: 50%'}</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>PEPC (NBC PG 12)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '15px', marginTop: '4px' }}>{totalPontosPepc} / 40 Pts</strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Meta cumprida</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#047857', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Volume DECORE</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatMoeda(totalDecoreValor)}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{decoreEmitidas.length} certidões</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Honorários Mensais</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '14px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatMoeda(totalHonorariosAtivos)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>{contratos.length} contratos</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. ABA: SIMULADO DE 30 QUESTÕES DO EXAME DE SUFICIÊNCIA   */}
      {/* ========================================================= */}
      {secaoAtiva === 'exercicios' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', flexShrink: 0 }}>Disciplina:</span>
              <select 
                value={filtroMateria} 
                onChange={e => setFiltroMateria(e.target.value)} 
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: 'white', width: '100%', maxWidth: '260px', boxSizing: 'border-box' }}
              >
                <option value="todas">Todas as Disciplinas (30 Questões)</option>
                <option value="Contabilidade Geral">Contabilidade Geral</option>
                <option value="Normas Internacionais">Normas Internacionais (NBC TG/CPC)</option>
                <option value="Contabilidade de Custos">Contabilidade de Custos</option>
                <option value="Ética Profissional">Ética Profissional (NBC PG 01)</option>
                <option value="Auditoria Independente">Auditoria Independente</option>
                <option value="Perícia Contábil">Perícia Contábil (NBC PP 01)</option>
                <option value="Legislação Societária">Legislação Societária (Lei 6.404/76)</option>
                <option value="Legislação Tributária">Legislação Tributária</option>
                <option value="Controladoria">Controladoria</option>
                <option value="Matemática Financeira">Matemática Financeira</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setRespostasUsuario({})} style={{ padding: '8px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Limpar Respostas
              </button>
              <button onClick={() => setGabaritoRevelado(!gabaritoRevelado)} style={{ padding: '8px 14px', backgroundColor: gabaritoRevelado ? '#0f172a' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                {gabaritoRevelado ? 'Ocultar Gabarito' : 'Corrigir Prova'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questoesFiltradas.map((q) => {
              const respondida = respostasUsuario[q.id] !== undefined;
              const acertou = respostasUsuario[q.id] === q.correta;

              return (
                <div key={q.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: `1px solid ${gabaritoRevelado ? (acertou ? '#86efac' : '#fecaca') : '#e2e8f0'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                        Questão {q.id}
                      </span>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                        {q.disciplina}
                      </span>
                    </div>

                    {gabaritoRevelado && (
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: acertou ? '#16a34a' : '#dc2626' }}>
                        {acertou ? '✓ CERTO' : '✗ ERRADO'}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#0f172a', lineHeight: '1.5', fontWeight: '500', wordBreak: 'break-word' }}>
                    {q.enunciado}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.opcoes.map(op => {
                      const estaMarcada = respostasUsuario[q.id] === op.id;
                      const eACorreta = op.id === q.correta;

                      let bg = estaMarcada ? '#eff6ff' : '#f8fafc';
                      let borda = estaMarcada ? '#2563eb' : '#e2e8f0';

                      if (gabaritoRevelado) {
                        if (eACorreta) {
                          bg = '#f0fdf4';
                          borda = '#16a34a';
                        } else if (estaMarcada && !eACorreta) {
                          bg = '#fff5f5';
                          borda = '#ef4444';
                        }
                      }

                      return (
                        <div 
                          key={op.id}
                          onClick={() => selecionarOpcao(q.id, op.id)}
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '8px', 
                            border: `1px solid ${borda}`, 
                            backgroundColor: bg, 
                            cursor: gabaritoRevelado ? 'default' : 'pointer', 
                            fontSize: '12px', 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: '10px',
                            transition: 'all 0.15s',
                            boxSizing: 'border-box'
                          }}
                        >
                          <span style={{ fontWeight: 'bold', color: '#0f172a', flexShrink: 0 }}>({op.id.toUpperCase()})</span>
                          <span style={{ flex: 1, color: '#334155', wordBreak: 'break-word' }}>{op.texto}</span>
                          {gabaritoRevelado && eACorreta && <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '10px', flexShrink: 0 }}>CORRETA</span>}
                        </div>
                      );
                    })}
                  </div>

                  {gabaritoRevelado && (
                    <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb', fontSize: '12px', color: '#1e3a8a', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      <strong>Comentário do Professor:</strong> {q.comentario}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: FICHAS TÉCNICAS E DIRETRIZES DO CFC               */}
      {/* ========================================================= */}
      {secaoAtiva === 'fichas' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setFichaSelecionada('nbc_pg_01')} style={{ padding: '12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${fichaSelecionada === 'nbc_pg_01' ? '#0f172a' : '#cbd5e1'}`, backgroundColor: fichaSelecionada === 'nbc_pg_01' ? '#0f172a' : '#f8fafc', color: fichaSelecionada === 'nbc_pg_01' ? 'white' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ⚖️ NBC PG 01 (Código de Ética)
              </button>
              <button onClick={() => setFichaSelecionada('resolucao_1590')} style={{ padding: '12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${fichaSelecionada === 'resolucao_1590' ? '#0f172a' : '#cbd5e1'}`, backgroundColor: fichaSelecionada === 'resolucao_1590' ? '#0f172a' : '#f8fafc', color: fichaSelecionada === 'resolucao_1590' ? 'white' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ✍️ Resolução CFC 1.590 (Contratos)
              </button>
              <button onClick={() => setFichaSelecionada('resolucao_1364')} style={{ padding: '12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${fichaSelecionada === 'resolucao_1364' ? '#0f172a' : '#cbd5e1'}`, backgroundColor: fichaSelecionada === 'resolucao_1364' ? '#0f172a' : '#f8fafc', color: fichaSelecionada === 'resolucao_1364' ? 'white' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                📋 Resolução CFC 1.364 (DECORE)
              </button>
              <button onClick={() => setFichaSelecionada('nbc_pg_12')} style={{ padding: '12px', textAlign: 'left', borderRadius: '8px', border: `1px solid ${fichaSelecionada === 'nbc_pg_12' ? '#0f172a' : '#cbd5e1'}`, backgroundColor: fichaSelecionada === 'nbc_pg_12' ? '#0f172a' : '#f8fafc', color: fichaSelecionada === 'nbc_pg_12' ? 'white' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                🎓 NBC PG 12 (PEPC Continuado)
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', marginBottom: '14px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>
                  {fichasTecnicas[fichaSelecionada].titulo}
                </strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {fichasTecnicas[fichaSelecionada].subtitulo}
                </span>
              </div>

              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a' }}>Principais Diretrizes Normativas:</h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fichasTecnicas[fichaSelecionada].pontosChave.map((ponto, idx) => (
                  <li key={idx} style={{ lineHeight: '1.4', wordBreak: 'break-word' }}>{ponto}</li>
                ))}
              </ul>

              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', borderLeft: '4px solid #ef4444', fontSize: '11px', color: '#991b1b', lineHeight: '1.4', wordBreak: 'break-word' }}>
                <strong>🚨 Enquadramento de Infração & Penalidade:</strong> {fichasTecnicas[fichaSelecionada].infracao}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ABA: DECORE ELETRÔNICA (TOTALMENTE RESPONSIVO)        */}
      {/* ========================================================= */}
      {secaoAtiva === 'decore' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            
            <form onSubmit={handleEmitirDecore} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
                Emissão de DECORE com Certificação Digital
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Beneficiário / Cliente:
                </label>
                <input 
                  type="text" 
                  value={clienteBeneficiario} 
                  onChange={e => setClienteBeneficiario(e.target.value)} 
                  placeholder="Nome completo..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    CPF:
                  </label>
                  <input 
                    type="text" 
                    value={cpfBeneficiario} 
                    onChange={e => setCpfBeneficiario(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Mês de Referência:
                  </label>
                  <input 
                    type="text" 
                    value={mesReferencia} 
                    onChange={e => setMesReferencia(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Natureza do Rendimento:
                  </label>
                  <select 
                    value={naturezaRendimento} 
                    onChange={e => setNaturezaRendimento(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="pro_labore">Pró-Labore</option>
                    <option value="distribuicao_lucros">Distribuição de Lucros</option>
                    <option value="livro_caixa">Livro Caixa / Autônomo</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Rendimento Líquido (R$):
                  </label>
                  <input 
                    type="text" 
                    value={rendimentoMensalStr} 
                    onChange={e => setRendimentoMensalStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Documento de Lastro Legal:
                </label>
                <input 
                  type="text" 
                  value={tipoDocumentoLastro} 
                  onChange={e => setTipoDocumentoLastro(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>

              <button 
                type="submit" 
                style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px', boxSizing: 'border-box' }}
              >
                🔐 Assinar e Homologar no CFC
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 16px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '14px' }}>Extrato de DECOREs Homologadas</h3>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Validação CFC</span>
              </div>

              <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 12px 12px', overflowX: 'auto', backgroundColor: 'white', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '450px' }}>
                  <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                    <tr>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Beneficiário</th>
                      <th style={{ padding: '10px 14px' }}>Natureza</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Valor</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Código</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decoreEmitidas.map(dec => (
                      <tr key={dec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{dec.beneficiario}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{dec.id} • {dec.mesRef}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{dec.natureza}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                          {formatMoeda(dec.valor)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: '#2563eb' }}>
                          {dec.codigoControle}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ABA: PEPC (NBC PG 12)                                  */}
      {/* ========================================================= */}
      {secaoAtiva === 'pepc' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '450px' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Atividade / Evento Credenciado</th>
                  <th style={{ padding: '12px 14px' }}>Modalidade</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Teto Categoria</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Pontos Validados</th>
                </tr>
              </thead>
              <tbody>
                {atividadesPepc.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a' }}>{item.descricao}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{item.tipo}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>Até {item.maximo} pts</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>
                      {item.pontos} pontos
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                <tr>
                  <td colSpan="3" style={{ padding: '12px 14px', textAlign: 'right' }}>Total Acumulado:</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#16a34a', fontSize: '13px' }}>
                    {totalPontosPepc} Pontos (Meta 40 pts ✓)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ABA: CONTRATOS DE SERVIÇOS CONTÁBEIS                   */}
      {/* ========================================================= */}
      {secaoAtiva === 'contratos' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '500px' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Cliente / Empresa</th>
                  <th style={{ padding: '12px 14px' }}>CNPJ</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Honorários</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Vencimento</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Situação</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a' }}>{c.empresa}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{c.cnpj}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                      {formatMoeda(c.honorariosMensais)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{c.vencimento}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}>
                        REGULAR
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ABA: ANUIDADE E REGULARIDADE PROFISSIONAL              */}
      {/* ========================================================= */}
      {secaoAtiva === 'anuidade' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                Anuidade Institucional CRC (2026)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Valor da Anuidade (R$):
                </label>
                <input 
                  type="text" 
                  value={valorAnuidadeStr} 
                  onChange={e => setValorAnuidadeStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', display: 'block' }}>Situação Financeira:</span>
                  <span style={{ fontSize: '11px', color: anuidadePaga ? '#166534' : '#dc2626' }}>
                    {anuidadePaga ? 'Anuidade quitada integralmente' : 'Boleto pendente de pagamento'}
                  </span>
                </div>
                <button 
                  onClick={() => setAnuidadePaga(!anuidadePaga)}
                  style={{ padding: '6px 12px', backgroundColor: anuidadePaga ? '#ef4444' : '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {anuidadePaga ? 'Marcar Pendente' : 'Confirmar Baixa'}
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '10px', textAlign: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>CONSELHO REGIONAL DE CONTABILIDADE</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>CERTIDÃO DE REGULARIDADE PROFISSIONAL (CRP)</span>
              </div>
              <div style={{ padding: '14px 0', fontSize: '12px', lineHeight: '1.5', color: '#334155' }}>
                Certificamos que <strong>{contadorNome}</strong> ({registroCrc}) encontra-se <strong>HABILITADO E REGULAR</strong> para o exercício de suas funções contábeis em todo o território nacional.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ marginTop: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Lançamentos Contábeis no Livro Diário
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px', fontSize: '11px', fontFamily: 'monospace' }}>
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb', wordBreak: 'break-word', boxSizing: 'border-box' }}>
            <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>1. Pagamento da Anuidade do CRC:</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Anuidades a Apropriar ....... {formatMoeda(parseFloat(valorAnuidadeStr) || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Banco Conta Movimento ....... {formatMoeda(parseFloat(valorAnuidadeStr) || 0)}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a', wordBreak: 'break-word', boxSizing: 'border-box' }}>
            <span style={{ fontWeight: 'bold', color: '#16a34a', display: 'block', marginBottom: '4px' }}>2. Reconhecimento de Honorários:</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Clientes a Receber .......... {formatMoeda(totalHonorariosAtivos)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Receita de Serviços ......... {formatMoeda(totalHonorariosAtivos)}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}