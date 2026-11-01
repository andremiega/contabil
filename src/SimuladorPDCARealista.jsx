import React, { useState } from 'react';

export default function SimuladorPDCARealista({ mostrarToast }) {
  const [cenarioAtivo, setCenarioAtivo] = useState(null);
  // Abas Superiores: 'dash' | 'plan' | 'do' | 'check' | 'act'
  const [etapaPdca, setEtapaPdca] = useState('plan');
  const [mes, setMes] = useState(1);

  // Parâmetros Financeiros e Operacionais do ERP
  const [caixa, setCaixa] = useState(0);
  const [faturamentoBruto, setFaturamentoBruto] = useState(0);
  const [cmvPct, setCmvPct] = useState(0.35); 
  const [custoFixo, setCustoFixo] = useState(0);
  const [inadimplenciaPct, setInadimplenciaPct] = useState(0.08);
  const [capacidadeHorasMes, setCapacidadeHorasMes] = useState(160);

  // Estados das Ferramentas Clássicas de Administração
  const [swot, setSwot] = useState({ forcas: '', fraquezas: '', oportunidades: '', ameacas: '' });
  const [acoes5w2h, setAcoes5w2h] = useState([]);
  const [novo5w2h, setNovo5w2h] = useState({
    oQue: '', porQue: '', problemaAlvoId: 1, quem: '', quando: 'Dias 1 a 15', onde: 'Operação / ERP', como: '', quanto: '', horas: 20, reducaoPerdaPct: 35
  });

  const [ishikawa, setIshikawa] = useState({
    problemaCentral: '', metodo: '', maoDeObra: '', material: '', maquina: '', medida: '', meioAmbiente: ''
  });

  const [problemasOperacionais, setProblemasOperacionais] = useState([]);
  const [historicoMensal, setHistoricoMensal] = useState([]);

  const [padronizacaoPop, setPadronizacaoPop] = useState({
    processoPadronizado: 'POP-01: Auditoria diária de qualidade e conciliação automática no ERP', responsavelAuditoria: 'Gerente Operacional / Controller', metaReduzirCustoFixo: 0, metaExpansaoReceitaPct: 5, horasExtrasContratadas: 0
  });

  const [isCustom, setIsCustom] = useState(false);

  // Catálogo Rico de Cenários Empresariais Reais
  const catalogoCenarios = [
    {
      id: 'cafeteria', nome: '☕ Cafeteria & Confeitaria Artesanal', perfil: 'Varejo Físico • Perecíveis & Atendimento',
      descricao: 'Sofre com desperdício de insumos frescos no fim do dia, fila lenta no horário de pico e margem corroída por compras mal planejadas.',
      caixaInicial: 35000, faturamentoInicial: 42000, cmvPctInicial: 0.38, custoFixoInicial: 14500, inadimplenciaInicial: 0.02, capacidadeHoras: 160,
      swotInicial: { forcas: 'Cafés especiais premiados, localização movimentada e clientes fiéis.', fraquezas: 'Perda de 18% em doces/leite vencidos e falta de ficha técnica no ERP.', oportunidades: 'Assinatura de café corporativo B2B e combos por aplicativo.', ameacas: 'Alta do preço do grão arábica e abertura de franquia concorrente.' },
      ishikawaInicial: { problemaCentral: 'Desperdício elevado de insumos e queda na margem líquida', metodo: 'Produção no "olhômetro" sem ficha técnica padrão', maoDeObra: 'Baristas sem treinamento em controle de porções', material: 'Leite e confeitaria com validade curta e compra em excesso', maquina: 'Geladeira expositora com oscilação térmica', medida: 'Falta de inventário diário de perdas no fim do turno', meioAmbiente: 'Dias chuvosos reduzem o fluxo presencial em 30%' },
      problemasIniciais: [
        { id: 1, causa: 'Desperdício de insumos perecíveis sem ficha técnica', perdaMensal: 4200, g: 5, u: 5, t: 5 },
        { id: 2, causa: 'Lentidão no caixa e perda de clientes na fila do almoço', perdaMensal: 2400, g: 4, u: 4, t: 4 },
        { id: 3, causa: 'Quebra e manutenção corretiva da máquina de espresso', perdaMensal: 950, g: 3, u: 3, t: 2 },
        { id: 4, causa: 'Erros de troco e divergência de fechamento de PDV', perdaMensal: 450, g: 2, u: 3, t: 2 }
      ],
      acoesIniciais: [
        { id: 101, oQue: 'Implantar Ficha Técnica e controle PEPS no estoque', porQue: 'Cortar desperdício de insumos', problemaAlvoId: 1, quem: 'Chef Confeiteiro', quando: 'Semana 1-2', onde: 'Cozinha / ERP', como: 'Padronizar gramaturas e alerta de validade', quanto: 1200, horas: 45, reducaoPerdaPct: 50, status: 'backlog' },
        { id: 102, oQue: 'Totem de autoatendimento e PIX QR Code na mesa', porQue: 'Eliminar fila no horário de pico', problemaAlvoId: 2, quem: 'Atendimento / TI', quando: 'Semana 2-3', onde: 'Salão / PDV', como: 'Cardápio digital integrado à cozinha', quanto: 1800, horas: 50, reducaoPerdaPct: 45, status: 'backlog' }
      ]
    },
    {
      id: 'ecommerce', nome: '📦 E-commerce de Moda & Vestuário', perfil: 'Varejo Digital • Logística Reversa & CAC',
      descricao: 'Fatura alto, mas vê o caixa sangrar com anúncios caros (CAC elevado), alto índice de devoluções por tamanho errado e atraso de transportadoras.',
      caixaInicial: 75000, faturamentoInicial: 95000, cmvPctInicial: 0.42, custoFixoInicial: 26000, inadimplenciaInicial: 0.06, capacidadeHoras: 180,
      swotInicial: { forcas: 'Marca forte no Instagram e catálogo próprio exclusivo.', fraquezas: 'Taxa de devolução de 15% por tabela de medidas confusa e frete caro.', oportunidades: 'Live commerce e parcerias com micro-influenciadores.', ameacas: 'Aumento do custo por clique (CPC) e fraudes em cartão (chargeback).' },
      ishikawaInicial: { problemaCentral: 'Margem corroída por logística reversa e CAC descontrolado', metodo: 'Campanhas de tráfego sem segmentação de público comprador', maoDeObra: 'Equipe de expedição sobrecarregada cometendo erros de envio', material: 'Embalagens frágeis gerando avarias no transporte', maquina: 'Site sem provador virtual ou guia exato de medidas', medida: 'Falta de cálculo de ROAS e LTV por canal de venda', meioAmbiente: 'Greves e atrasos recorrentes nas transportadoras terceirizadas' },
      problemasIniciais: [
        { id: 1, causa: 'Logística reversa (trocas por numeração/caimento incorreto)', perdaMensal: 9200, g: 5, u: 5, t: 4 },
        { id: 2, causa: 'Campanhas de tráfego pago com ROAS negativo', perdaMensal: 6500, g: 5, u: 4, t: 5 },
        { id: 3, causa: 'Chargeback e fraudes em pagamentos via cartão', perdaMensal: 2100, g: 4, u: 3, t: 3 },
        { id: 4, causa: 'Atraso de separação (Picking & Packing) no galpão', perdaMensal: 1100, g: 3, u: 2, t: 2 }
      ],
      acoesIniciais: [
        { id: 201, oQue: 'Instalar Provador Virtual IA e Tabela de Medidas Real', porQue: 'Reduzir devoluções e frete reverso', problemaAlvoId: 1, quem: 'E-commerce Manager', quando: 'Semana 1-2', onde: 'Página de Produto', como: 'Plugin de recomendação por peso/altura', quanto: 2500, horas: 60, reducaoPerdaPct: 55, status: 'backlog' },
        { id: 202, oQue: 'Auditoria de ROAS e funil de retenção via CRM/WhatsApp', porQue: 'Diminuir dependência de anúncios caros', problemaAlvoId: 2, quem: 'Gestor de Tráfego', quando: 'Semana 1-3', onde: 'Meta/Google Ads', como: 'Pausar anúncios ruins e focar em recompra', quanto: 2000, horas: 55, reducaoPerdaPct: 45, status: 'backlog' }
      ]
    },
    {
      id: 'industria', nome: '⚙️ Indústria Metalúrgica & Manufatura', perfil: 'B2B Industrial • OEE, Refugo & Capital de Giro',
      descricao: 'Enfrenta paradas não programadas de máquinas, alto índice de refugo metálico, prazos longos de recebimento B2B (60/90 dias) e pressão no caixa.',
      caixaInicial: 190000, faturamentoInicial: 240000, cmvPctInicial: 0.52, custoFixoInicial: 68000, inadimplenciaInicial: 0.14, capacidadeHoras: 240,
      swotInicial: { forcas: 'Parque fabril próprio e contratos com grandes montadoras.', fraquezas: 'Manutenção apenas corretiva e alto volume de sucata/retrabalho.', oportunidades: 'Venda de lotes padronizados com pagamento antecipado.', ameacas: 'Oscilação cambial do aço e inadimplência de clientes industriais.' },
      ishikawaInicial: { problemaCentral: 'Paradas de linha, refugo elevado e aperto severo de caixa', metodo: 'Falta de cronograma de Manutenção Preventiva (TPM)', maoDeObra: 'Operadores sem checklist de setup de torno CNC', material: 'Chapas de aço com variação de espessura do fornecedor', maquina: 'Prensas hidráulicas operando sem calibração preventiva', medida: 'Apontamento de produção em papel (sem controle OEE em tempo real)', meioAmbiente: 'Tarifa de energia de ponta encarecendo o turno vespertino' },
      problemasIniciais: [
        { id: 1, causa: 'Parada de máquina por falta de manutenção preventiva', perdaMensal: 18500, g: 5, u: 5, t: 5 },
        { id: 2, causa: 'Refugo e retrabalho de peças fora da tolerância de qualidade', perdaMensal: 11200, g: 5, u: 4, t: 4 },
        { id: 3, causa: 'Custo extra de energia elétrica em horário de ponta', perdaMensal: 4300, g: 3, u: 3, t: 3 },
        { id: 4, causa: 'Atraso de matéria-prima por falha no ponto de pedido', perdaMensal: 2000, g: 3, u: 2, t: 2 }
      ],
      acoesIniciais: [
        { id: 401, oQue: 'Implantar Manutenção Produtiva Total (TPM) e Setup Rápido', porQue: 'Zerar quebras repentinas na linha principal', problemaAlvoId: 1, quem: 'Eng. de Manutenção', quando: 'Semana 1-3', onde: 'Chão de Fábrica', como: 'Calibração quinzenal e sensores de desgaste', quanto: 6500, horas: 90, reducaoPerdaPct: 55, status: 'backlog' },
        { id: 402, oQue: 'Controle Estatístico de Processo (CEP) na inspeção de lotes', porQue: 'Reduzir sucata e devolução de clientes B2B', problemaAlvoId: 2, quem: 'Supervisor da Qualidade', quando: 'Semana 2-4', onde: 'Linha de Usinagem', como: 'Amostragem a cada 50 peças produzidas', quanto: 3500, horas: 65, reducaoPerdaPct: 50, status: 'backlog' }
      ]
    }
  ];

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Estilos UI/UX Enterprise
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'border-color 0.2s', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
  const boxGuiaStyle = { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#166534', fontSize: '13px', lineHeight: '1.6' };

  // Inicializar Cenário (Pre-definido ou Customizado)
  const selecionarCenario = (cenario) => {
    setIsCustom(false);
    if (!cenario) return;
    setCenarioAtivo(cenario);
    setCaixa(cenario.caixaInicial);
    setFaturamentoBruto(cenario.faturamentoInicial);
    setCmvPct(cenario.cmvPctInicial);
    setCustoFixo(cenario.custoFixoInicial);
    setInadimplenciaPct(cenario.inadimplenciaInicial);
    setCapacidadeHorasMes(cenario.capacidadeHoras);
    setSwot({ ...cenario.swotInicial });
    setIshikawa({ ...cenario.ishikawaInicial });
    setProblemasOperacionais(cenario.problemasIniciais.map(p => ({ ...p })));
    setAcoes5w2h(cenario.acoesIniciais.map(a => ({ ...a })));
    setHistoricoMensal([]);
    setMes(1);
    setEtapaPdca('plan');
    if (typeof mostrarToast === 'function') mostrarToast(`Cenário "${cenario.nome}" carregado! Inicie pelo [P] Planejar.`, 'sucesso');
  };

  const ativarModoCustomizado = () => {
    setIsCustom(true);
    const cenarioCustom = {
      id: 'custom', nome: '🛠️ Empresa Personalizada', perfil: 'Meu Próprio Negócio',
      descricao: 'Descreva aqui o cenário e as dores reais da sua empresa.',
      caixaInicial: 50000, faturamentoInicial: 80000, cmvPctInicial: 0.30, custoFixoInicial: 20000, inadimplenciaInicial: 0.05, capacidadeHoras: 160,
      swotInicial: { forcas: '', fraquezas: '', oportunidades: '', ameacas: '' },
      ishikawaInicial: { problemaCentral: '', metodo: '', maoDeObra: '', material: '', maquina: '', medida: '', meioAmbiente: '' },
      problemasIniciais: [
        { id: 1, causa: 'Problema Principal a resolver', perdaMensal: 5000, g: 5, u: 5, t: 5 }
      ],
      acoesIniciais: []
    };
    setCenarioAtivo(cenarioCustom);
    setCaixa(cenarioCustom.caixaInicial);
    setFaturamentoBruto(cenarioCustom.faturamentoInicial);
    setCmvPct(cenarioCustom.cmvPctInicial);
    setCustoFixo(cenarioCustom.custoFixoInicial);
    setInadimplenciaPct(cenarioCustom.inadimplenciaInicial);
    setCapacidadeHorasMes(cenarioCustom.capacidadeHoras);
    setSwot({ ...cenarioCustom.swotInicial });
    setIshikawa({ ...cenarioCustom.ishikawaInicial });
    setProblemasOperacionais(cenarioCustom.problemasIniciais.map(p => ({ ...p })));
    setAcoes5w2h([]);
    setHistoricoMensal([]);
    setMes(1);
    setEtapaPdca('plan');
    if (typeof mostrarToast === 'function') mostrarToast('Cenário Customizado Ativo! Configure os dados da sua empresa.', 'sucesso');
  };

  // Movimentação Kanban
  const moverCardKanban = (id, novoStatus) => {
    setAcoes5w2h(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a));
  };

  const removerAcao5w2h = (id) => {
    setAcoes5w2h(prev => prev.filter(a => a.id !== id));
  };

  // Cálculos Apoio à Decisão
  const orcamento5w2hTotal = acoes5w2h.reduce((acc, a) => acc + Number(a.quanto || 0), 0);
  const horasAlocadasTotal = acoes5w2h.filter(a => a.status === 'doing' || a.status === 'done').reduce((acc, a) => acc + Number(a.horas || 0), 0);
  const horasExcedentesGargalo = Math.max(0, horasAlocadasTotal - capacidadeHorasMes);
  const multaGargaloHoraExtra = horasExcedentesGargalo * 45; 

  // Fechamento Mensal (PDCA)
  const processarFechamentoMes = () => {
    if (orcamento5w2hTotal > caixa) {
      if (typeof mostrarToast === 'function') mostrarToast('Orçamento do 5W2H excede o Saldo em Caixa! Corte custos antes de executar.', 'erro');
      return;
    }

    const acoesConcluidas = acoes5w2h.filter(a => a.status === 'done');
    const problemasAtualizados = problemasOperacionais.map(prob => {
      const acoesDesseProblema = acoesConcluidas.filter(a => Number(a.problemaAlvoId) === Number(prob.id));
      const pctMitigado = Math.min(0.85, acoesDesseProblema.reduce((acc, a) => acc + (Number(a.reducaoPerdaPct || 30) / 100), 0));
      const perdaResidual = Math.round(prob.perdaMensal * (1 - pctMitigado));
      return { ...prob, perdaOriginalMes: prob.perdaMensal, perdaMensal: perdaResidual, economiaGerada: prob.perdaMensal - perdaResidual };
    });

    const totalPerdasOperacionais = problemasAtualizados.reduce((acc, p) => acc + p.perdaMensal, 0);
    const totalEconomiaPdca = problemasAtualizados.reduce((acc, p) => acc + (p.economiaGerada || 0), 0);

    const impostosVenda = +(faturamentoBruto * 0.08).toFixed(2);
    const perdaCaloteInadimplencia = +(faturamentoBruto * inadimplenciaPct).toFixed(2);
    const receitaLiquidaCaixa = +(faturamentoBruto - impostosVenda - perdaCaloteInadimplencia).toFixed(2);
    const custoMercadoriaCMV = +(faturamentoBruto * cmvPct).toFixed(2);
    const saidasOperacionaisTotais = +(custoMercadoriaCMV + custoFixo + orcamento5w2hTotal + totalPerdasOperacionais + multaGargaloHoraExtra).toFixed(2);
    const resultadoLiquidoMes = +(receitaLiquidaCaixa - saidasOperacionaisTotais).toFixed(2);
    const novoSaldoCaixa = +(caixa + resultadoLiquidoMes).toFixed(2);

    const fechamentoAtual = {
      mes, faturamentoBruto, impostosVenda, perdaCaloteInadimplencia, custoMercadoriaCMV, custoFixo, investimento5w2h: orcamento5w2hTotal,
      perdasOperacionaisPareto: totalPerdasOperacionais, economiaGeradaPdca: totalEconomiaPdca, custoGargaloKanban: multaGargaloHoraExtra,
      resultadoLiquidoMes, saldoFinalCaixa: novoSaldoCaixa, acoesConcluidasQtd: acoesConcluidas.length
    };

    setProblemasOperacionais(problemasAtualizados);
    setCaixa(novoSaldoCaixa);
    setHistoricoMensal(prev => [...prev, fechamentoAtual]);
    setEtapaPdca('check');

    if (typeof mostrarToast === 'function') {
      mostrarToast(`Mês ${mes} fechado! Resultado: R$ ${formatMoeda(resultadoLiquidoMes)}. Analise Pareto, Ishikawa e GUT.`, resultadoLiquidoMes >= 0 ? 'sucesso' : 'aviso');
    }
  };

  // Cálculos Pareto/GUT
  const totalPerdasPareto = Math.max(1, problemasOperacionais.reduce((acc, p) => acc + p.perdaMensal, 0));
  let acumuladoPct = 0;
  const dadosParetoOrdenados = [...problemasOperacionais].sort((a, b) => b.perdaMensal - a.perdaMensal).map(p => {
    const pctIndividual = +((p.perdaMensal / totalPerdasPareto) * 100).toFixed(1);
    acumuladoPct = +(acumuladoPct + pctIndividual).toFixed(1);
    return { ...p, pctIndividual, pctAcumulado: Math.min(100, acumuladoPct), scoreGut: p.g * p.u * p.t };
  });
  const problemaPrioritarioGUT = [...problemasOperacionais].map(p => ({ ...p, scoreGut: p.g * p.u * p.t })).sort((a, b) => b.scoreGut - a.scoreGut)[0];

  // Padronização POP
  const concluirCicloAgir = () => {
    const novoCustoFixo = Math.max(5000, custoFixo - Number(padronizacaoPop.metaReduzirCustoFixo || 0) + (Number(padronizacaoPop.horasExtrasContratadas || 0) * 35));
    const novoFaturamento = Math.round(faturamentoBruto * (1 + (Number(padronizacaoPop.metaExpansaoReceitaPct || 0) / 100)));
    const novaCapacidade = capacidadeHorasMes + Number(padronizacaoPop.horasExtrasContratadas || 0);

    setCustoFixo(novoCustoFixo);
    setFaturamentoBruto(novoFaturamento);
    setCapacidadeHorasMes(novaCapacidade);
    setInadimplenciaPct(prev => Math.max(0.01, +(prev * 0.85).toFixed(3)));

    setMes(m => m + 1);
    setAcoes5w2h([]);
    setEtapaPdca('plan');
    if (typeof mostrarToast === 'function') mostrarToast(`POP padronizado! Parâmetros do ERP atualizados para o Mês ${mes + 1}.`, 'sucesso');
  };

  // =========================================================================
  // TELA DE SELEÇÃO DE CENÁRIOS (NENHUM CENÁRIO ATIVO)
  // =========================================================================
  if (!cenarioAtivo) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '12px 12px 0 0', borderBottom: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>LABORATÓRIO PDCA</span>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '900' }}>Simulador Executivo de Gestão & Melhoria Contínua</h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
            Escolha uma empresa real para diagnosticar causas raízes (Ishikawa), cortar perdas (Pareto), priorizar crises (GUT) e executar planos estratégicos (5W2H / Kanban).
          </p>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', borderTop: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {catalogoCenarios.map(c => (
              <div key={c.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{c.perfil}</span>
                  <h3 style={{ margin: '12px 0 8px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>{c.nome}</h3>
                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>{c.descricao}</p>
                  
                  <div style={{ fontSize: '12px', color: '#334155', marginBottom: '16px', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', lineHeight: '1.6', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Caixa Inicial:</strong> <span>R$ {formatMoeda(c.caixaInicial)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Faturamento:</strong> <span>R$ {formatMoeda(c.faturamentoInicial)}/mês</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Custo Fixo:</strong> <span>R$ {formatMoeda(c.custoFixoInicial)}/mês</span></div>
                  </div>
                </div>
                <button type="button" onClick={() => selecionarCenario(c)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%', transition: 'all 0.2s' }}>
                  🚀 Assumir Gestão deste Negócio
                </button>
              </div>
            ))}

            {/* CARD PARA O ALUNO INSERIR SUA EMPRESA */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.05)' }}>
              <div>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Meu Negócio • Customizado</span>
                <h3 style={{ margin: '12px 0 8px 0', fontSize: '16px', color: '#166534', fontWeight: '800' }}>🛠️ Criar Meu Próprio Cenário</h3>
                <p style={{ fontSize: '12.5px', color: '#15803d', lineHeight: '1.5', marginBottom: '16px' }}>
                  Quer testar a metodologia na sua própria empresa ou TCC? Insira os seus dados financeiros, faturamento, caixa e dores operacionais e rode o ciclo PDCA em tempo real.
                </p>
              </div>
              <button type="button" onClick={ativarModoCustomizado} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%', transition: 'all 0.2s' }}>
                + Construir Minha Empresa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ultimoFechamento = historicoMensal[historicoMensal.length - 1];

  // =========================================================================
  // TELA PRINCIPAL DO SIMULADOR PDCA ATIVO
  // =========================================================================
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', fontSize: '13px', maxWidth: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO SUPERIOR EXECUTIVO */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #10b981' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CICLO ATIVO: MÊS {mes}</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>{isCustom ? 'Meu Cenário Customizado' : cenarioAtivo.nome}</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#cbd5e1', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span>Caixa: <strong style={{ color: caixa >= 0 ? '#4ade80' : '#f87171' }}>R$ {formatMoeda(caixa)}</strong></span>
            <span>|</span>
            <span>Faturamento: <strong>R$ {formatMoeda(faturamentoBruto)}</strong></span>
            <span>|</span>
            <span>Perdas Atuais: <strong style={{ color: '#fbbf24' }}>R$ {formatMoeda(totalPerdasPareto)}/mês</strong></span>
          </div>
        </div>

        {/* NAVEGAÇÃO PDCA (PILLS) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px' }}>
          {[
            { id: 'dash', label: '📊 Dashboard' },
            { id: 'plan', label: '1. [P] Planejar' },
            { id: 'do', label: '2. [D] Fazer (Kanban)' },
            { id: 'check', label: '3. [C] Checar (Auditoria)' },
            { id: 'act', label: '4. [A] Agir (POP)' }
          ].map(aba => (
            <button
              key={aba.id} onClick={() => setEtapaPdca(aba.id)}
              style={{
                backgroundColor: etapaPdca === aba.id ? '#10b981' : 'transparent', color: etapaPdca === aba.id ? '#0f172a' : '#cbd5e1',
                border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'
              }}
            >
              {aba.label}
            </button>
          ))}
          <button onClick={() => setCenarioAtivo(null)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', marginLeft: '4px' }}>
            ✖ Sair
          </button>
        </div>
      </div>

      {/* CORPO DO MÓDULO */}
      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', borderTop: 'none', boxSizing: 'border-box', minHeight: '600px' }}>

        {/* =================================================================
            VISÃO 0: DASHBOARD EXECUTIVO & FLUXO DO CICLO PDCA
           ================================================================= */}
        {etapaPdca === 'dash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>Painel de Controle Financeiro e Operacional (ERP + PDCA)</h3>
            <div style={boxGuiaStyle}>
              A <strong>SWOT</strong> revela vulnerabilidades; o <strong>5W2H</strong> transforma ideias em planos; o <strong>Kanban</strong> controla a execução; o <strong>Pareto</strong> aponta vazamento de dinheiro; o <strong>Ishikawa</strong> descobre a causa raiz; e a <strong>Matriz GUT</strong> prioriza a correção na etapa <strong>Agir</strong>.
            </div>

            {/* CARDS DE INDICADORES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Saldo em Tesouraria</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: caixa >= 0 ? '#16a34a' : '#dc2626', margin: '4px 0' }}>R$ {formatMoeda(caixa)}</div>
                <span style={{ fontSize: '12px', color: '#475569' }}>Inadimplência: {(inadimplenciaPct * 100).toFixed(1)}%</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Faturamento Bruto</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>R$ {formatMoeda(faturamentoBruto)}</div>
                <span style={{ fontSize: '12px', color: '#dc2626' }}>Custo Fixo: R$ {formatMoeda(custoFixo)}/mês</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Vazamento Pareto (Perdas)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#d97706', margin: '4px 0' }}>R$ {formatMoeda(totalPerdasPareto)}</div>
                <span style={{ fontSize: '12px', color: '#475569' }}>{problemasOperacionais.length} falhas operacionais ativas</span>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase' }}>CRISE N° 1 (Matriz GUT)</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e3a8a', marginTop: '6px', lineHeight: '1.4' }}>
                  Score {problemaPrioritarioGUT?.scoreGut}: {problemaPrioritarioGUT?.causa.slice(0, 50)}...
                </div>
              </div>
            </div>

            {/* HISTÓRICO DE DRE E FLUXO DE CAIXA */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '15px' }}>📈 Histórico Contábil Mensal (DRE & Fluxo de Caixa)</h4>
              {historicoMensal.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                  Nenhum mês encerrado ainda. Planeje no <strong>[P]</strong>, execute os cards no <strong>[D] Kanban</strong> e processe o Fechamento.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Mês</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Receita Bruta</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Impostos + Calote</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>CMV + Fixo</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Invest. 5W2H</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Perdas Pareto</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Economia PDCA</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoMensal.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>Mês {h.mes}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>R$ {formatMoeda(h.faturamentoBruto)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#dc2626' }}>- R$ {formatMoeda(h.impostosVenda + h.perdaCaloteInadimplencia)}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>- R$ {formatMoeda(h.custoMercadoriaCMV + h.custoFixo)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#2563eb' }}>- R$ {formatMoeda(h.investimento5w2h)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#d97706' }}>- R$ {formatMoeda(h.perdasOperacionaisPareto)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>+ R$ {formatMoeda(h.economiaGeradaPdca)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: h.resultadoLiquidoMes >= 0 ? '#16a34a' : '#dc2626', fontSize: '13.5px' }}>
                            R$ {formatMoeda(h.resultadoLiquidoMes)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            ETAPA 1: [P] PLANEJAR (DIAGNÓSTICO SWOT + PLANO TÁTICO 5W2H)
           ================================================================= */}
        {etapaPdca === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>1️⃣ Etapa [P] Planejar — Diagnóstico SWOT & Plano de Ação 5W2H</h3>
            
            {/* CONFIGURAÇÃO CUSTOMIZADA (MOSTRADA APENAS SE FOR CUSTOM) */}
            {isCustom && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', color: '#166534', marginBottom: '12px', fontSize: '14px' }}>⚙️ Configurações Iniciais da sua Empresa:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div><label htmlFor="cCaixa" style={labelStyle}>Caixa Inicial (R$):</label><input id="cCaixa" name="cCaixa" type="number" style={inputStyle} value={caixa} onChange={e => setCaixa(e.target.value)} /></div>
                  <div><label htmlFor="cFat" style={labelStyle}>Faturamento Mensal (R$):</label><input id="cFat" name="cFat" type="number" style={inputStyle} value={faturamentoBruto} onChange={e => setFaturamentoBruto(e.target.value)} /></div>
                  <div><label htmlFor="cCmv" style={labelStyle}>Custo Variável (CMV %):</label><input id="cCmv" name="cCmv" type="number" step="0.01" style={inputStyle} value={cmvPct} onChange={e => setCmvPct(e.target.value)} /></div>
                  <div><label htmlFor="cFixo" style={labelStyle}>Custo Fixo Mensal (R$):</label><input id="cFixo" name="cFixo" type="number" style={inputStyle} value={custoFixo} onChange={e => setCustoFixo(e.target.value)} /></div>
                  <div><label htmlFor="cInad" style={labelStyle}>Inadimplência Esperada (%):</label><input id="cInad" name="cInad" type="number" step="0.01" style={inputStyle} value={inadimplenciaPct} onChange={e => setInadimplenciaPct(e.target.value)} /></div>
                  <div><label htmlFor="cHoras" style={labelStyle}>Capacidade Equipe (Horas/mês):</label><input id="cHoras" name="cHoras" type="number" style={inputStyle} value={capacidadeHorasMes} onChange={e => setCapacidadeHorasMes(e.target.value)} /></div>
                </div>
                
                <strong style={{ display: 'block', color: '#166534', margin: '20px 0 8px 0', fontSize: '14px' }}>🚨 Cadastro da Dor Principal (Problema Alvo #1):</strong>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 3 }}><label htmlFor="cProbNome" style={labelStyle}>Causa do Problema:</label><input id="cProbNome" name="cProbNome" style={inputStyle} value={problemasOperacionais[0]?.causa || ''} onChange={e => { const p = [...problemasOperacionais]; p[0].causa = e.target.value; setProblemasOperacionais(p); }} placeholder="Ex: Falha no sistema gerando multas" /></div>
                  <div style={{ flex: 1 }}><label htmlFor="cProbValor" style={labelStyle}>Perda Financeira Mensal (R$):</label><input id="cProbValor" name="cProbValor" type="number" style={inputStyle} value={problemasOperacionais[0]?.perdaMensal || 0} onChange={e => { const p = [...problemasOperacionais]; p[0].perdaMensal = e.target.value; setProblemasOperacionais(p); }} /></div>
                </div>
              </div>
            )}

            <div style={boxGuiaStyle}>
              O planejamento começa analisando o ambiente interno (<strong>Forças e Fraquezas</strong>) e externo (<strong>Oportunidades e Ameaças</strong>) na Matriz SWOT. Em seguida, para cada problema real, crie uma ação no <strong>5W2H</strong>. <em>Atenção:</em> ações consomem dinheiro do Caixa e horas de trabalho!
            </div>

            {/* MATRIZ SWOT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: '4px solid #10b981', padding: '16px', borderRadius: '8px' }}>
                <label htmlFor="swotForcas" style={{ ...labelStyle, color: '#166534' }}>💪 Forças (Ambiente Interno):</label>
                <textarea id="swotForcas" name="swotForcas" rows="3" style={inputStyle} value={swot.forcas} onChange={e => setSwot({...swot, forcas: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderTop: '4px solid #ef4444', padding: '16px', borderRadius: '8px' }}>
                <label htmlFor="swotFraq" style={{ ...labelStyle, color: '#991b1b' }}>⚠️ Fraquezas (Gargalos Internos):</label>
                <textarea id="swotFraq" name="swotFraq" rows="3" style={inputStyle} value={swot.fraquezas} onChange={e => setSwot({...swot, fraquezas: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderTop: '4px solid #3b82f6', padding: '16px', borderRadius: '8px' }}>
                <label htmlFor="swotOport" style={{ ...labelStyle, color: '#1e40af' }}>🚀 Oportunidades (Mercado):</label>
                <textarea id="swotOport" name="swotOport" rows="3" style={inputStyle} value={swot.oportunidades} onChange={e => setSwot({...swot, oportunidades: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderTop: '4px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
                <label htmlFor="swotAmea" style={{ ...labelStyle, color: '#92400e' }}>🛡️ Ameaças (Riscos Externos):</label>
                <textarea id="swotAmea" name="swotAmea" rows="3" style={inputStyle} value={swot.ameacas} onChange={e => setSwot({...swot, ameacas: e.target.value})} />
              </div>
            </div>

            {/* 5W2H */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>📋 Construir Plano de Ação 5W2H (Vinculado ao Orçamento)</strong>
                <span style={{ fontSize: '13px', color: orcamento5w2hTotal <= caixa ? '#16a34a' : '#dc2626', fontWeight: 'bold', backgroundColor: orcamento5w2hTotal <= caixa ? '#f0fdf4' : '#fef2f2', padding: '6px 12px', borderRadius: '8px' }}>
                  Orçamento Planejado: R$ {formatMoeda(orcamento5w2hTotal)} / Caixa: R$ {formatMoeda(caixa)}
                </span>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!novo5w2h.oQue || !novo5w2h.quanto) return;
                setAcoes5w2h([...acoes5w2h, { id: Date.now(), ...novo5w2h, quanto: Number(novo5w2h.quanto), horas: Number(novo5w2h.horas || 20), reducaoPerdaPct: Number(novo5w2h.reducaoPerdaPct || 35), status: 'backlog' }]);
                setNovo5w2h({ ...novo5w2h, oQue: '', porQue: '', quem: '', como: '', quanto: '' });
                if (typeof mostrarToast === 'function') mostrarToast('Plano 5W2H registrado e enviado para o Kanban!', 'sucesso');
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="fAlvo" style={labelStyle}>Problema Alvo que esta ação vai combater:</label>
                  <select id="fAlvo" name="fAlvo" style={inputStyle} value={novo5w2h.problemaAlvoId} onChange={e => setNovo5w2h({...novo5w2h, problemaAlvoId: e.target.value})}>
                    {problemasOperacionais.map(p => (
                      <option key={p.id} value={p.id}>Alvo #{p.id}: {p.causa} (Perda: R$ {formatMoeda(p.perdaMensal)}/mês)</option>
                    ))}
                  </select>
                </div>
                <div><label htmlFor="fOque" style={labelStyle}>1. What (O quê?):</label><input id="fOque" name="fOque" style={inputStyle} type="text" required value={novo5w2h.oQue} onChange={e => setNovo5w2h({...novo5w2h, oQue: e.target.value})} /></div>
                <div><label htmlFor="fPorque" style={labelStyle}>2. Why (Por quê?):</label><input id="fPorque" name="fPorque" style={inputStyle} type="text" required value={novo5w2h.porQue} onChange={e => setNovo5w2h({...novo5w2h, porQue: e.target.value})} /></div>
                <div><label htmlFor="fQuem" style={labelStyle}>3. Who (Quem?):</label><input id="fQuem" name="fQuem" style={inputStyle} type="text" required value={novo5w2h.quem} onChange={e => setNovo5w2h({...novo5w2h, quem: e.target.value})} /></div>
                <div><label htmlFor="fQuando" style={labelStyle}>4. When (Quando?):</label><input id="fQuando" name="fQuando" style={inputStyle} type="text" required value={novo5w2h.quando} onChange={e => setNovo5w2h({...novo5w2h, quando: e.target.value})} /></div>
                <div><label htmlFor="fOnde" style={labelStyle}>5. Where (Onde?):</label><input id="fOnde" name="fOnde" style={inputStyle} type="text" required value={novo5w2h.onde} onChange={e => setNovo5w2h({...novo5w2h, onde: e.target.value})} /></div>
                <div><label htmlFor="fComo" style={labelStyle}>6. How (Como?):</label><input id="fComo" name="fComo" style={inputStyle} type="text" required value={novo5w2h.como} onChange={e => setNovo5w2h({...novo5w2h, como: e.target.value})} /></div>
                <div><label htmlFor="fQuanto" style={labelStyle}>7. How Much (R$):</label><input id="fQuanto" name="fQuanto" style={inputStyle} type="number" required value={novo5w2h.quanto} onChange={e => setNovo5w2h({...novo5w2h, quanto: e.target.value})} /></div>
                <div><label htmlFor="fHoras" style={labelStyle}>Esforço (Horas):</label><input id="fHoras" name="fHoras" style={inputStyle} type="number" required min="5" max="150" value={novo5w2h.horas} onChange={e => setNovo5w2h({...novo5w2h, horas: e.target.value})} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>+ Adicionar ao 5W2H</button>
                </div>
              </form>

              {/* TABELA 5W2H */}
              <div style={{ overflowX: 'auto', marginTop: '20px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px' }}>O Quê (What)</th>
                      <th style={{ padding: '10px' }}>Problema Alvo</th>
                      <th style={{ padding: '10px' }}>Quem / Quando</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Custo (R$)</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Horas</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acoes5w2h.map(a => {
                      const alvo = problemasOperacionais.find(p => Number(p.id) === Number(a.problemaAlvoId));
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{a.oQue}</td>
                          <td style={{ padding: '10px', color: '#1e40af' }}>{alvo ? alvo.causa.slice(0, 35) + '...' : 'Geral'}</td>
                          <td style={{ padding: '10px' }}>{a.quem} ({a.quando})</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>R$ {formatMoeda(a.quanto)}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{a.horas}h</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button type="button" onClick={() => removerAcao5w2h(a.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEtapaPdca('do')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
                Avançar para Etapa [D] Fazer (Execução no Kanban) →
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            ETAPA 2: [D] FAZER (KANBAN)
           ================================================================= */}
        {etapaPdca === 'do' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>2️⃣ Etapa [D] Fazer — Execução Operacional (Kanban)</h3>
              <div style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: horasExcedentesGargalo > 0 ? '#fef2f2' : '#dcfce7', border: `1px solid ${horasExcedentesGargalo > 0 ? '#fca5a5' : '#86efac'}`, fontSize: '13px', fontWeight: 'bold', color: horasExcedentesGargalo > 0 ? '#991b1b' : '#166534' }}>
                Carga Equipe: {horasAlocadasTotal}h / {capacidadeHorasMes}h 
                {horasExcedentesGargalo > 0 && ` (⚠️ Gargalo: +R$ ${formatMoeda(multaGargaloHoraExtra)} Hora Extra)`}
              </div>
            </div>

            <div style={boxGuiaStyle}>
              Mova os cartões de <em>Backlog</em> para <em>Em Execução</em> e finalize-os em <strong>✅ Concluído</strong>. Somente ações concluídas reduzem os prejuízos na auditoria contábil do mês. Cuidado para não estourar o limite de horas da sua equipe!
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              
              {/* BACKLOG */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '12px', minHeight: '300px' }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#475569', fontSize: '14px', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                  📥 Backlog ({acoes5w2h.filter(a => a.status === 'backlog').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'backlog').map(a => (
                  <div key={a.id} style={cardStyle}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px', marginBottom: '6px' }}>{a.oQue}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '10px' }}>Resp: {a.quem} • <strong>R$ {formatMoeda(a.quanto)}</strong> • {a.horas}h</div>
                    <button type="button" onClick={() => moverCardKanban(a.id, 'doing')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>
                      Iniciar Execução →
                    </button>
                  </div>
                ))}
              </div>

              {/* DOING */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px', minHeight: '300px' }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#1d4ed8', fontSize: '14px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  ⏳ Em Andamento ({acoes5w2h.filter(a => a.status === 'doing').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'doing').map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderColor: '#93c5fd' }}>
                    <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '13px', marginBottom: '6px' }}>{a.oQue}</div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '10px' }}>Alocadas: {a.horas}h</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => moverCardKanban(a.id, 'backlog')} style={{ flex: 1, backgroundColor: '#64748b', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>← Pausar</button>
                      <button type="button" onClick={() => moverCardKanban(a.id, 'done')} style={{ flex: 2, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Concluir ✓</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DONE */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', minHeight: '300px' }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#166534', fontSize: '14px', borderBottom: '2px solid #86efac', paddingBottom: '8px' }}>
                  ✅ Concluído ({acoes5w2h.filter(a => a.status === 'done').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'done').map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '13px' }}>✓ {a.oQue}</div>
                    <div style={{ fontSize: '11px', color: '#15803d', marginTop: '6px' }}>Pronto para abater a perda no fechamento!</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setEtapaPdca('plan')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                ← Voltar ao Planejamento 5W2H
              </button>
              <button type="button" onClick={processarFechamentoMes} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                📊 Processar Fechamento Contábil e Ir para [C] Checar →
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            ETAPA 3: [C] CHECAR (PARETO, ISHIKAWA E GUT)
           ================================================================= */}
        {etapaPdca === 'check' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>3️⃣ Etapa [C] Checar — Auditoria DRE, Pareto (80/20), Ishikawa e GUT</h3>
            
            <div style={boxGuiaStyle}>
              Aqui auditamos os números reais. <strong>Pareto (80/20)</strong> revela onde o prejuízo financeiro está concentrado. <strong>Ishikawa (6Ms)</strong> rastreia a causa raiz. A <strong>Matriz GUT</strong> prioriza matematicamente o problema mais crítico.
            </div>

            {ultimoFechamento && (
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px 20px', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontSize: '13px' }}>
                <div>Receita Líquida: <strong style={{ color: '#38bdf8', fontSize: '16px', display: 'block' }}>R$ {formatMoeda(ultimoFechamento.faturamentoBruto - ultimoFechamento.impostosVenda - ultimoFechamento.perdaCaloteInadimplencia)}</strong></div>
                <div>Perdas Restantes: <strong style={{ color: '#fbbf24', fontSize: '16px', display: 'block' }}>- R$ {formatMoeda(ultimoFechamento.perdasOperacionaisPareto)}</strong></div>
                <div>Economia (PDCA): <strong style={{ color: '#4ade80', fontSize: '16px', display: 'block' }}>+ R$ {formatMoeda(ultimoFechamento.economiaGeradaPdca)}</strong></div>
                <div>Lucro/Prejuízo: <strong style={{ color: ultimoFechamento.resultadoLiquidoMes >= 0 ? '#4ade80' : '#f87171', fontSize: '16px', display: 'block' }}>R$ {formatMoeda(ultimoFechamento.resultadoLiquidoMes)}</strong></div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              
              {/* PARETO */}
              <div style={cardStyle}>
                <strong style={{ display: 'block', marginBottom: '16px', color: '#0f172a', fontSize: '15px' }}>📊 1. Análise de Pareto (Regra 80/20)</strong>
                {dadosParetoOrdenados.map((p, idx) => (
                  <div key={p.id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span><strong>{idx + 1}º. {p.causa.slice(0,40)}...</strong> {p.pctAcumulado <= 85 && <span style={{ marginLeft: '6px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>Crítico 80/20</span>}</span>
                      <span><strong style={{ color: '#dc2626' }}>R$ {formatMoeda(p.perdaMensal)}</strong> ({p.pctIndividual}% | Acum: <strong>{p.pctAcumulado}%</strong>)</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.pctIndividual}%`, backgroundColor: p.pctAcumulado <= 85 ? '#dc2626' : '#3b82f6', height: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ISHIKAWA */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#0f172a', fontSize: '15px' }}>🐟 2. Espinha de Peixe (Ishikawa 6Ms)</strong>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label htmlFor="ishiEfeito" style={{...labelStyle, color: '#1e40af'}}>Efeito (Problema Central):</label>
                  <input id="ishiEfeito" name="ishiEfeito" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold'}} value={ishikawa.problemaCentral} onChange={e => setIshikawa({...ishikawa, problemaCentral: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label htmlFor="ishiMet" style={labelStyle}>⚙️ 1. Método:</label><input id="ishiMet" name="ishiMet" style={inputStyle} value={ishikawa.metodo} onChange={e => setIshikawa({...ishikawa, metodo: e.target.value})} /></div>
                  <div><label htmlFor="ishiMao" style={labelStyle}>👥 2. Mão de Obra:</label><input id="ishiMao" name="ishiMao" style={inputStyle} value={ishikawa.maoDeObra} onChange={e => setIshikawa({...ishikawa, maoDeObra: e.target.value})} /></div>
                  <div><label htmlFor="ishiMat" style={labelStyle}>📦 3. Material:</label><input id="ishiMat" name="ishiMat" style={inputStyle} value={ishikawa.material} onChange={e => setIshikawa({...ishikawa, material: e.target.value})} /></div>
                  <div><label htmlFor="ishiMaq" style={labelStyle}>💻 4. Máquina:</label><input id="ishiMaq" name="ishiMaq" style={inputStyle} value={ishikawa.maquina} onChange={e => setIshikawa({...ishikawa, maquina: e.target.value})} /></div>
                  <div><label htmlFor="ishiMed" style={labelStyle}>📏 5. Medida:</label><input id="ishiMed" name="ishiMed" style={inputStyle} value={ishikawa.medida} onChange={e => setIshikawa({...ishikawa, medida: e.target.value})} /></div>
                  <div><label htmlFor="ishiAmb" style={labelStyle}>🌍 6. Meio Ambiente:</label><input id="ishiAmb" name="ishiAmb" style={inputStyle} value={ishikawa.meioAmbiente} onChange={e => setIshikawa({...ishikawa, meioAmbiente: e.target.value})} /></div>
                </div>
              </div>
            </div>

            {/* GUT */}
            <div style={cardStyle}>
              <strong style={{ display: 'block', marginBottom: '16px', color: '#0f172a', fontSize: '15px' }}>🎯 3. Matriz de Priorização GUT (Altere as notas 1 a 5)</strong>
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '12px' }}>Problema Operacional</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '110px' }}>Gravidade (1-5)</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '110px' }}>Urgência (1-5)</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '110px' }}>Tendência (1-5)</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '120px' }}>Score GUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemasOperacionais.map((p, idx) => {
                      const score = p.g * p.u * p.t;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: score >= 80 ? '#fef2f2' : 'white' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{p.causa}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}><input id={`gut_g_${p.id}`} name={`gut_g_${p.id}`} type="number" min="1" max="5" value={p.g} onChange={e => { const c = [...problemasOperacionais]; c[idx].g = Math.min(5, Math.max(1, e.target.value)); setProblemasOperacionais(c); }} style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '10px', textAlign: 'center' }}><input id={`gut_u_${p.id}`} name={`gut_u_${p.id}`} type="number" min="1" max="5" value={p.u} onChange={e => { const c = [...problemasOperacionais]; c[idx].u = Math.min(5, Math.max(1, e.target.value)); setProblemasOperacionais(c); }} style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '10px', textAlign: 'center' }}><input id={`gut_t_${p.id}`} name={`gut_t_${p.id}`} type="number" min="1" max="5" value={p.t} onChange={e => { const c = [...problemasOperacionais]; c[idx].t = Math.min(5, Math.max(1, e.target.value)); setProblemasOperacionais(c); }} style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: score >= 80 ? '#dc2626' : '#1e40af', fontSize: '14px' }}>{score} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEtapaPdca('act')} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
                Avançar para Etapa [A] Agir (Padronização & Ajustes no ERP) →
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            ETAPA 4: [A] AGIR (PADRONIZAÇÃO POP & AJUSTE)
           ================================================================= */}
        {etapaPdca === 'act' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>4️⃣ Etapa [A] Agir — Padronização (POP) e Correção de Rota no ERP</h3>
            
            <div style={boxGuiaStyle}>
              O gestor toma duas decisões: se o plano funcionou, <strong>Padroniza (cria um POP)</strong>; se restaram gargalos, <strong>ajusta os parâmetros financeiros do ERP</strong> para girar o próximo ciclo num patamar de eficiência maior.
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px', color: '#991b1b', borderLeft: '6px solid #ef4444' }}>
              <strong style={{ fontSize: '15px' }}>🔥 Foco no Gargalo Máximo da Matriz GUT (Score {problemaPrioritarioGUT?.scoreGut}/125):</strong>
              <div style={{ fontSize: '14px', marginTop: '6px' }}>{problemaPrioritarioGUT?.causa} (Prejuízo residual: R$ {formatMoeda(problemaPrioritarioGUT?.perdaMensal)}).</div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="actPop" style={labelStyle}>📄 Norma de Padronização (POP - Proc. Operacional Padrão):</label>
                  <input id="actPop" name="actPop" style={inputStyle} value={padronizacaoPop.processoPadronizado} onChange={e => setPadronizacaoPop({...padronizacaoPop, processoPadronizado: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="actAuditor" style={labelStyle}>Responsável pela Auditoria do Padrão:</label>
                  <input id="actAuditor" name="actAuditor" style={inputStyle} value={padronizacaoPop.responsavelAuditoria} onChange={e => setPadronizacaoPop({...padronizacaoPop, responsavelAuditoria: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="actCorteFixo" style={labelStyle}>Corte Renegociado no Custo Fixo (R$):</label>
                  <input id="actCorteFixo" name="actCorteFixo" style={inputStyle} type="number" min="0" max="5000" value={padronizacaoPop.metaReduzirCustoFixo} onChange={e => setPadronizacaoPop({...padronizacaoPop, metaReduzirCustoFixo: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="actExpFat" style={labelStyle}>Meta de Expansão de Receita (Mês {mes + 1} - %):</label>
                  <input id="actExpFat" name="actExpFat" style={inputStyle} type="number" min="-10" max="25" value={padronizacaoPop.metaExpansaoReceitaPct} onChange={e => setPadronizacaoPop({...padronizacaoPop, metaExpansaoReceitaPct: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="actExpHoras" style={labelStyle}>Expandir Capacidade da Equipe (+Horas):</label>
                  <input id="actExpHoras" name="actExpHoras" style={inputStyle} type="number" min="0" max="160" value={padronizacaoPop.horasExtrasContratadas} onChange={e => setPadronizacaoPop({...padronizacaoPop, horasExtrasContratadas: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="button" onClick={concluirCicloAgir} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '16px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', width: '100%', boxShadow: '0 6px 12px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}>
              🔄 Gravar Padronização POP no ERP e Iniciar Ciclo do Mês {mes + 1} 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}