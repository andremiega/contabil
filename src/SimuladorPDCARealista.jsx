import React, { useState } from 'react';

export default function SimuladorPDCARealista({ mostrarToast }) {
  const [cenarioAtivo, setCenarioAtivo] = useState(null);
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

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };
  const boxGuiaStyle = { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontSize: '13px', lineHeight: '1.6', boxSizing: 'border-box', wordBreak: 'break-word' };

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

  const moverCardKanban = (id, novoStatus) => {
    setAcoes5w2h(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a));
  };

  const removerAcao5w2h = (id) => {
    setAcoes5w2h(prev => prev.filter(a => a.id !== id));
  };

  const orcamento5w2hTotal = acoes5w2h.reduce((acc, a) => acc + Number(a.quanto || 0), 0);
  const horasAlocadasTotal = acoes5w2h.filter(a => a.status === 'doing' || a.status === 'done').reduce((acc, a) => acc + Number(a.horas || 0), 0);
  const horasExcedentesGargalo = Math.max(0, horasAlocadasTotal - capacidadeHorasMes);
  const multaGargaloHoraExtra = horasExcedentesGargalo * 45; 

  const processarFechamentoMes = () => {
    if (orcamento5w2hTotal > caixa) {
      if (typeof mostrarToast === 'function') mostrarToast('Orçamento do 5W2H excede o Saldo em Caixa!', 'erro');
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
      mostrarToast(`Mês ${mes} fechado! Resultado: R$ ${formatMoeda(resultadoLiquidoMes)}`, resultadoLiquidoMes >= 0 ? 'sucesso' : 'aviso');
    }
  };

  const totalPerdasPareto = Math.max(1, problemasOperacionais.reduce((acc, p) => acc + p.perdaMensal, 0));
  let acumuladoPct = 0;
  const dadosParetoOrdenados = [...problemasOperacionais].sort((a, b) => b.perdaMensal - a.perdaMensal).map(p => {
    const pctIndividual = +((p.perdaMensal / totalPerdasPareto) * 100).toFixed(1);
    acumuladoPct = +(acumuladoPct + pctIndividual).toFixed(1);
    return { ...p, pctIndividual, pctAcumulado: Math.min(100, acumuladoPct), scoreGut: p.g * p.u * p.t };
  });
  const problemaPrioritarioGUT = [...problemasOperacionais].map(p => ({ ...p, scoreGut: p.g * p.u * p.t })).sort((a, b) => b.scoreGut - a.scoreGut)[0];

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
    if (typeof mostrarToast === 'function') mostrarToast(`POP padronizado! Parâmetros atualizados para o Mês ${mes + 1}.`, 'sucesso');
  };

  // TELA DE SELEÇÃO DE CENÁRIOS
  if (!cenarioAtivo) {
    return (
      <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', borderBottom: '4px solid #10b981', boxSizing: 'border-box', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>LABORATÓRIO PDCA</span>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: '900', wordBreak: 'break-word' }}>Simulador Executivo de Gestão & Melhoria Contínua</h2>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5', wordBreak: 'break-word' }}>
            Escolha uma empresa para diagnosticar causas raízes (Ishikawa), cortar perdas (Pareto), priorizar crises (GUT) e executar planos (5W2H).
          </p>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxSizing: 'border-box', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
            {catalogoCenarios.map(c => (
              <div key={c.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>{c.perfil}</span>
                  <h3 style={{ margin: '12px 0 8px 0', fontSize: '15.5px', color: '#0f172a', fontWeight: '800', wordBreak: 'break-word' }}>{c.nome}</h3>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', marginBottom: '14px', wordBreak: 'break-word' }}>{c.descricao}</p>
                  
                  <div style={{ fontSize: '11.5px', color: '#334155', marginBottom: '14px', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '10px', lineHeight: '1.6', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><strong style={{ wordBreak: 'break-word' }}>Caixa:</strong> <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(c.caixaInicial)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><strong style={{ wordBreak: 'break-word' }}>Faturamento:</strong> <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(c.faturamentoInicial)}/mês</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><strong style={{ wordBreak: 'break-word' }}>Custo Fixo:</strong> <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(c.custoFixoInicial)}/mês</span></div>
                  </div>
                </div>
                <button type="button" onClick={() => selecionarCenario(c)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
                  🚀 Assumir Gestão deste Negócio
                </button>
              </div>
            ))}

            <div style={{ backgroundColor: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.05)', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>Meu Negócio • Customizado</span>
                <h3 style={{ margin: '12px 0 8px 0', fontSize: '15.5px', color: '#166534', fontWeight: '800', wordBreak: 'break-word' }}>🛠️ Criar Meu Próprio Cenário</h3>
                <p style={{ fontSize: '12px', color: '#15803d', lineHeight: '1.5', marginBottom: '14px', wordBreak: 'break-word' }}>
                  Insira seus dados financeiros, faturamento e dores operacionais para rodar o ciclo PDCA em tempo real.
                </p>
              </div>
              <button type="button" onClick={ativarModoCustomizado} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
                + Construir Minha Empresa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ultimoFechamento = historicoMensal[historicoMensal.length - 1];

  // TELA PRINCIPAL DO SIMULADOR PDCA ATIVO
  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO SUPERIOR EXECUTIVO */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #10b981', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>MÊS {mes}</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>{isCustom ? 'Meu Cenário Customizado' : cenarioAtivo.nome}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <span style={{ wordBreak: 'break-word' }}>Caixa: <strong style={{ color: caixa >= 0 ? '#4ade80' : '#f87171' }}>R$ {formatMoeda(caixa)}</strong></span>
            <span>|</span>
            <span style={{ wordBreak: 'break-word' }}>Faturamento: <strong>R$ {formatMoeda(faturamentoBruto)}</strong></span>
            <span>|</span>
            <span style={{ wordBreak: 'break-word' }}>Perdas: <strong style={{ color: '#fbbf24' }}>R$ {formatMoeda(totalPerdasPareto)}/mês</strong></span>
          </div>
        </div>

        {/* NAVEGAÇÃO PDCA */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px', boxSizing: 'border-box' }}>
          {[
            { id: 'dash', label: '📊 Dashboard' },
            { id: 'plan', label: '1. [P] Planejar' },
            { id: 'do', label: '2. [D] Fazer' },
            { id: 'check', label: '3. [C] Checar' },
            { id: 'act', label: '4. [A] Agir' }
          ].map(aba => (
            <button
              key={aba.id} onClick={() => setEtapaPdca(aba.id)}
              style={{
                backgroundColor: etapaPdca === aba.id ? '#10b981' : 'transparent', color: etapaPdca === aba.id ? '#0f172a' : '#cbd5e1',
                border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11.5px', transition: 'all 0.2s', boxSizing: 'border-box', wordBreak: 'break-word'
              }}
            >
              {aba.label}
            </button>
          ))}
          <button onClick={() => setCenarioAtivo(null)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11.5px', boxSizing: 'border-box' }}>
            ✖ Sair
          </button>
        </div>
      </div>

      {/* CORPO DO MÓDULO */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', boxSizing: 'border-box', minHeight: '500px', width: '100%' }}>

        {/* DASHBOARD */}
        {etapaPdca === 'dash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Painel de Controle Financeiro e Operacional (ERP + PDCA)</h3>
            <div style={boxGuiaStyle}>
              A <strong>SWOT</strong> revela vulnerabilidades; o <strong>5W2H</strong> transforma ideias em planos; o <strong>Kanban</strong> controla a execução; o <strong>Pareto</strong> aponta vazamento de dinheiro; o <strong>Ishikawa</strong> descobre a causa raiz; e a <strong>Matriz GUT</strong> prioriza a correção.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Saldo em Tesouraria</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: caixa >= 0 ? '#16a34a' : '#dc2626', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(caixa)}</div>
                <span style={{ fontSize: '11px', color: '#475569', wordBreak: 'break-word' }}>Inadimplência: {(inadimplenciaPct * 100).toFixed(1)}%</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Faturamento Bruto</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(faturamentoBruto)}</div>
                <span style={{ fontSize: '11px', color: '#dc2626', wordBreak: 'break-word' }}>Custo Fixo: R$ {formatMoeda(custoFixo)}/mês</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Vazamento Pareto (Perdas)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#d97706', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(totalPerdasPareto)}</div>
                <span style={{ fontSize: '11px', color: '#475569', wordBreak: 'break-word' }}>{problemasOperacionais.length} falhas ativas</span>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase' }}>CRISE N° 1 (Matriz GUT)</span>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', marginTop: '6px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  Score {problemaPrioritarioGUT?.scoreGut}: {problemaPrioritarioGUT?.causa.slice(0, 40)}...
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
              <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: '14.5px', wordBreak: 'break-word' }}>📈 Histórico Contábil Mensal (DRE & Caixa)</h4>
              {historicoMensal.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '12.5px', textAlign: 'center', boxSizing: 'border-box' }}>
                  Nenhum mês encerrado ainda. Planeje no <strong>[P]</strong>, execute no <strong>[D] Kanban</strong> e processe o Fechamento.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Mês</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Receita</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Impostos + Calote</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>CMV + Fixo</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>5W2H</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Perdas</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Economia</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoMensal.map((h, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Mês {h.mes}</td>
                          <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(h.faturamentoBruto)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#dc2626', whiteSpace: 'nowrap' }}>- R$ {formatMoeda(h.impostosVenda + h.perdaCaloteInadimplencia)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>- R$ {formatMoeda(h.custoMercadoriaCMV + h.custoFixo)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#2563eb', whiteSpace: 'nowrap' }}>- R$ {formatMoeda(h.investimento5w2h)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#d97706', whiteSpace: 'nowrap' }}>- R$ {formatMoeda(h.perdasOperacionaisPareto)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ R$ {formatMoeda(h.economiaGeradaPdca)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: h.resultadoLiquidoMes >= 0 ? '#16a34a' : '#dc2626', fontSize: '13px', whiteSpace: 'nowrap' }}>
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

        {/* ETAPA 1: PLANEJAR */}
        {etapaPdca === 'plan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>1️⃣ Etapa [P] Planejar — SWOT & Plano 5W2H</h3>
            
            {isCustom && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px', borderRadius: '16px', boxSizing: 'border-box' }}>
                <strong style={{ display: 'block', color: '#166534', marginBottom: '10px', fontSize: '13.5px', wordBreak: 'break-word' }}>⚙️ Configurações da sua Empresa:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Caixa (R$):</label><input type="number" style={inputStyle} value={caixa} onChange={e => setCaixa(e.target.value)} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Faturamento (R$):</label><input type="number" style={inputStyle} value={faturamentoBruto} onChange={e => setFaturamentoBruto(e.target.value)} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>CMV (%):</label><input type="number" step="0.01" style={inputStyle} value={cmvPct} onChange={e => setCmvPct(e.target.value)} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Custo Fixo (R$):</label><input type="number" style={inputStyle} value={custoFixo} onChange={e => setCustoFixo(e.target.value)} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Inadimplência (%):</label><input type="number" step="0.01" style={inputStyle} value={inadimplenciaPct} onChange={e => setInadimplenciaPct(e.target.value)} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Horas/mês:</label><input type="number" style={inputStyle} value={capacidadeHorasMes} onChange={e => setCapacidadeHorasMes(e.target.value)} /></div>
                </div>
              </div>
            )}

            <div style={boxGuiaStyle}>
              O planejamento analisa o ambiente (<strong>SWOT</strong>). Para cada problema real, crie uma ação no <strong>5W2H</strong>. Ações consomem dinheiro do Caixa e horas de trabalho.
            </div>

            {/* SWOT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: '4px solid #10b981', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#166534' }}>💪 Forças:</label>
                <textarea rows="3" style={inputStyle} value={swot.forcas} onChange={e => setSwot({...swot, forcas: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderTop: '4px solid #ef4444', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#991b1b' }}>⚠️ Fraquezas:</label>
                <textarea rows="3" style={inputStyle} value={swot.fraquezas} onChange={e => setSwot({...swot, fraquezas: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderTop: '4px solid #3b82f6', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#1e40af' }}>🚀 Oportunidades:</label>
                <textarea rows="3" style={inputStyle} value={swot.oportunidades} onChange={e => setSwot({...swot, oportunidades: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderTop: '4px solid #f59e0b', padding: '16px', borderRadius: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#92400e' }}>🛡️ Ameaças:</label>
                <textarea rows="3" style={inputStyle} value={swot.ameacas} onChange={e => setSwot({...swot, ameacas: e.target.value})} />
              </div>
            </div>

            {/* 5W2H */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', wordBreak: 'break-word' }}>📋 Plano de Ação 5W2H</strong>
                <span style={{ fontSize: '12px', color: orcamento5w2hTotal <= caixa ? '#16a34a' : '#dc2626', fontWeight: 'bold', backgroundColor: orcamento5w2hTotal <= caixa ? '#f0fdf4' : '#fef2f2', padding: '6px 12px', borderRadius: '8px', wordBreak: 'border-word' }}>
                  Orçamento: R$ {formatMoeda(orcamento5w2hTotal)} / Caixa: R$ {formatMoeda(caixa)}
                </span>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!novo5w2h.oQue || !novo5w2h.quanto) return;
                setAcoes5w2h([...acoes5w2h, { id: Date.now(), ...novo5w2h, quanto: Number(novo5w2h.quanto), horas: Number(novo5w2h.horas || 20), reducaoPerdaPct: Number(novo5w2h.reducaoPerdaPct || 35), status: 'backlog' }]);
                setNovo5w2h({ ...novo5w2h, oQue: '', porQue: '', quem: '', como: '', quanto: '' });
                if (typeof mostrarToast === 'function') mostrarToast('Plano 5W2H registrado e enviado para o Kanban!', 'sucesso');
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Problema Alvo:</label>
                  <select style={inputStyle} value={novo5w2h.problemaAlvoId} onChange={e => setNovo5w2h({...novo5w2h, problemaAlvoId: e.target.value})}>
                    {problemasOperacionais.map(p => (
                      <option key={p.id} value={p.id}>Alvo #{p.id}: {p.causa.slice(0, 40)}... (Perda: R$ {formatMoeda(p.perdaMensal)})</option>
                    ))}
                  </select>
                </div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>What (O quê?):</label><input style={inputStyle} type="text" required value={novo5w2h.oQue} onChange={e => setNovo5w2h({...novo5w2h, oQue: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Why (Por quê?):</label><input style={inputStyle} type="text" required value={novo5w2h.porQue} onChange={e => setNovo5w2h({...novo5w2h, porQue: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Who (Quem?):</label><input style={inputStyle} type="text" required value={novo5w2h.quem} onChange={e => setNovo5w2h({...novo5w2h, quem: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>When (Quando?):</label><input style={inputStyle} type="text" required value={novo5w2h.quando} onChange={e => setNovo5w2h({...novo5w2h, quando: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Where (Onde?):</label><input style={inputStyle} type="text" required value={novo5w2h.onde} onChange={e => setNovo5w2h({...novo5w2h, onde: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>How (Como?):</label><input style={inputStyle} type="text" required value={novo5w2h.como} onChange={e => setNovo5w2h({...novo5w2h, como: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>How Much (R$):</label><input style={inputStyle} type="number" required value={novo5w2h.quanto} onChange={e => setNovo5w2h({...novo5w2h, quanto: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Esforço (Horas):</label><input style={inputStyle} type="number" required min="5" max="150" value={novo5w2h.horas} onChange={e => setNovo5w2h({...novo5w2h, horas: e.target.value})} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1', boxSizing: 'border-box' }}>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box' }}>+ Adicionar ao 5W2H</button>
                </div>
              </form>

              <div style={{ overflowX: 'auto', marginTop: '16px', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '550px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px' }}>O Quê</th>
                      <th style={{ padding: '10px' }}>Problema Alvo</th>
                      <th style={{ padding: '10px' }}>Quem / Quando</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Custo</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Horas</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acoes5w2h.map(a => {
                      const alvo = problemasOperacionais.find(p => Number(p.id) === Number(a.problemaAlvoId));
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', wordBreak: 'break-word' }}>{a.oQue}</td>
                          <td style={{ padding: '10px', color: '#1e40af', wordBreak: 'break-word' }}>{alvo ? alvo.causa.slice(0, 30) + '...' : 'Geral'}</td>
                          <td style={{ padding: '10px', wordBreak: 'break-word' }}>{a.quem} ({a.quando})</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', whiteSpace: 'nowrap' }}>R$ {formatMoeda(a.quanto)}</td>
                          <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{a.horas}h</td>
                          <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button type="button" onClick={() => removerAcao5w2h(a.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => setEtapaPdca('do')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(16,185,129,0.2)', boxSizing: 'border-box' }}>
                Avançar para Etapa [D] Fazer (Kanban) →
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: FAZER (KANBAN) */}
        {etapaPdca === 'do' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>2️⃣ Etapa [D] Fazer — Execução (Kanban)</h3>
              <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: horasExcedentesGargalo > 0 ? '#fef2f2' : '#dcfce7', border: `1px solid ${horasExcedentesGargalo > 0 ? '#fca5a5' : '#86efac'}`, fontSize: '12px', fontWeight: 'bold', color: horasExcedentesGargalo > 0 ? '#991b1b' : '#166534', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                Equipe: {horasAlocadasTotal}h / {capacidadeHorasMes}h 
                {horasExcedentesGargalo > 0 && ` (⚠️ Gargalo: +R$ ${formatMoeda(multaGargaloHoraExtra)})`}
              </div>
            </div>

            <div style={boxGuiaStyle}>
              Mova os cartões para <em>Concluído</em>. Somente ações concluídas reduzem os prejuízos na auditoria contábil do mês.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              
              {/* BACKLOG */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '16px', minHeight: '260px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#475569', fontSize: '13.5px', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
                  📥 Backlog ({acoes5w2h.filter(a => a.status === 'backlog').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'backlog').map(a => (
                  <div key={a.id} style={cardStyle}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px', marginBottom: '6px', wordBreak: 'break-word' }}>{a.oQue}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', wordBreak: 'break-word' }}>Resp: {a.quem} • R$ {formatMoeda(a.quanto)}</div>
                    <button type="button" onClick={() => moverCardKanban(a.id, 'doing')} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}>
                      Iniciar Execução →
                    </button>
                  </div>
                ))}
              </div>

              {/* DOING */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '16px', minHeight: '260px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#1d4ed8', fontSize: '13.5px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px', wordBreak: 'break-word' }}>
                  ⏳ Em Andamento ({acoes5w2h.filter(a => a.status === 'doing').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'doing').map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderColor: '#93c5fd' }}>
                    <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '13px', marginBottom: '6px', wordBreak: 'break-word' }}>{a.oQue}</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '10px', wordBreak: 'border-word' }}>Esforço: {a.horas}h</div>
                    <div style={{ display: 'flex', gap: '8px', boxSizing: 'border-box' }}>
                      <button type="button" onClick={() => moverCardKanban(a.id, 'backlog')} style={{ flex: 1, backgroundColor: '#64748b', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>← Pausar</button>
                      <button type="button" onClick={() => moverCardKanban(a.id, 'done')} style={{ flex: 2, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold' }}>Concluir ✓</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DONE */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '16px', minHeight: '260px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '12px', color: '#166534', fontSize: '13.5px', borderBottom: '2px solid #86efac', paddingBottom: '8px', wordBreak: 'break-word' }}>
                  ✅ Concluído ({acoes5w2h.filter(a => a.status === 'done').length})
                </strong>
                {acoes5w2h.filter(a => a.status === 'done').map(a => (
                  <div key={a.id} style={{ ...cardStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4' }}>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '13px', wordBreak: 'break-word' }}>✓ {a.oQue}</div>
                    <div style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', wordBreak: 'break-word' }}>Pronto para abater a perda no fechamento!</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => setEtapaPdca('plan')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box' }}>
                ← Voltar ao Planejamento
              </button>
              <button type="button" onClick={processarFechamentoMes} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', boxSizing: 'border-box' }}>
                Processar Fechamento e Ir para [C] Checar →
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: CHECAR */}
        {etapaPdca === 'check' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>3️⃣ Etapa [C] Checar — Auditoria DRE, Pareto & GUT</h3>
            
            <div style={boxGuiaStyle}>
              Auditamos os números reais. <strong>Pareto (80/20)</strong> revela onde o dinheiro vaza. <strong>Ishikawa</strong> rastreia a causa raiz. A <strong>Matriz GUT</strong> prioriza a correção.
            </div>

            {ultimoFechamento && (
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '18px 20px', borderRadius: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', fontSize: '12.5px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}><span style={{ wordBreak: 'break-word' }}>Receita Líquida:</span> <strong style={{ color: '#38bdf8', fontSize: '15px', display: 'block', wordBreak: 'break-word' }}>R$ {formatMoeda(ultimoFechamento.faturamentoBruto - ultimoFechamento.impostosVenda - ultimoFechamento.perdaCaloteInadimplencia)}</strong></div>
                <div style={{ minWidth: 0 }}><span style={{ wordBreak: 'break-word' }}>Perdas Restantes:</span> <strong style={{ color: '#fbbf24', fontSize: '15px', display: 'block', wordBreak: 'break-word' }}>- R$ {formatMoeda(ultimoFechamento.perdasOperacionaisPareto)}</strong></div>
                <div style={{ minWidth: 0 }}><span style={{ wordBreak: 'break-word' }}>Economia (PDCA):</span> <strong style={{ color: '#4ade80', fontSize: '15px', display: 'block', wordBreak: 'break-word' }}>+ R$ {formatMoeda(ultimoFechamento.economiaGeradaPdca)}</strong></div>
                <div style={{ minWidth: 0 }}><span style={{ wordBreak: 'break-word' }}>Resultado:</span> <strong style={{ color: ultimoFechamento.resultadoLiquidoMes >= 0 ? '#4ade80' : '#f87171', fontSize: '15px', display: 'block', wordBreak: 'break-word' }}>R$ {formatMoeda(ultimoFechamento.resultadoLiquidoMes)}</strong></div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              {/* PARETO */}
              <div style={cardStyle}>
                <strong style={{ display: 'block', marginBottom: '14px', color: '#0f172a', fontSize: '14.5px', wordBreak: 'break-word' }}>📊 1. Análise de Pareto (Regra 80/20)</strong>
                {dadosParetoOrdenados.map((p, idx) => (
                  <div key={p.id} style={{ marginBottom: '12px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                      <span style={{ wordBreak: 'break-word' }}><strong>{idx + 1}º. {p.causa.slice(0,35)}...</strong> {p.pctAcumulado <= 85 && <span style={{ marginLeft: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>Crítico</span>}</span>
                      <span style={{ whiteSpace: 'nowrap' }}><strong style={{ color: '#dc2626' }}>R$ {formatMoeda(p.perdaMensal)}</strong> ({p.pctIndividual}%)</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '10px', borderRadius: '6px', overflow: 'hidden', boxSizing: 'border-box' }}>
                      <div style={{ width: `${p.pctIndividual}%`, backgroundColor: p.pctAcumulado <= 85 ? '#dc2626' : '#3b82f6', height: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ISHIKAWA */}
              <div style={cardStyle}>
                <strong style={{ color: '#0f172a', fontSize: '14.5px', display: 'block', marginBottom: '14px', wordBreak: 'break-word' }}>🐟 2. Espinha de Peixe (Ishikawa 6Ms)</strong>
                <div style={{ marginBottom: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="ishiEfeito" style={{...labelStyle, color: '#1e40af'}}>Efeito (Problema Central):</label>
                  <input id="ishiEfeito" name="ishiEfeito" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold'}} value={ishikawa.problemaCentral} onChange={e => setIshikawa({...ishikawa, problemaCentral: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}><label htmlFor="ishiMet" style={labelStyle}>⚙️ Método:</label><input id="ishiMet" name="ishiMet" style={inputStyle} value={ishikawa.metodo} onChange={e => setIshikawa({...ishikawa, metodo: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label htmlFor="ishiMao" style={labelStyle}>👥 Mão de Obra:</label><input id="ishiMao" name="ishiMao" style={inputStyle} value={ishikawa.maoDeObra} onChange={e => setIshikawa({...ishikawa, maoDeObra: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label htmlFor="ishiMat" style={labelStyle}>📦 Material:</label><input id="ishiMat" name="ishiMat" style={inputStyle} value={ishikawa.material} onChange={e => setIshikawa({...ishikawa, material: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label htmlFor="ishiMaq" style={labelStyle}>💻 Máquina:</label><input id="ishiMaq" name="ishiMaq" style={inputStyle} value={ishikawa.maquina} onChange={e => setIshikawa({...ishikawa, maquina: e.target.value})} /></div>
                </div>
              </div>
            </div>

            {/* GUT */}
            <div style={cardStyle}>
              <strong style={{ display: 'block', marginBottom: '14px', color: '#0f172a', fontSize: '14.5px', wordBreak: 'break-word' }}>🎯 3. Matriz de Priorização GUT (Notas 1 a 5)</strong>
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '550px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px 12px' }}>Problema Operacional</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '90px' }}>Gravidade</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '90px' }}>Urgência</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '90px' }}>Tendência</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', width: '100px' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemasOperacionais.map((p, idx) => {
                      const score = p.g * p.u * p.t;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: score >= 80 ? '#fef2f2' : 'white' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold', wordBreak: 'break-word' }}>{p.causa}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}><input id={`gut_g_${p.id}`} name={`gut_g_${p.id}`} type="number" min="1" max="5" value={p.g} onChange={e => { const c = [...problemasOperacionais]; c[idx].g = Math.min(5, Math.max(1, Number(e.target.value))); setProblemasOperacionais(c); }} style={{ width: '50px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '8px', textAlign: 'center' }}><input id={`gut_u_${p.id}`} name={`gut_u_${p.id}`} type="number" min="1" max="5" value={p.u} onChange={e => { const c = [...problemasOperacionais]; c[idx].u = Math.min(5, Math.max(1, Number(e.target.value))); setProblemasOperacionais(c); }} style={{ width: '50px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '8px', textAlign: 'center' }}><input id={`gut_t_${p.id}`} name={`gut_t_${p.id}`} type="number" min="1" max="5" value={p.t} onChange={e => { const c = [...problemasOperacionais]; c[idx].t = Math.min(5, Math.max(1, Number(e.target.value))); setProblemasOperacionais(c); }} style={{ width: '50px', textAlign: 'center', padding: '6px', borderRadius: '6px', border: '1px solid #94a3b8' }} /></td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: score >= 80 ? '#dc2626' : '#1e40af', fontSize: '13.5px', whiteSpace: 'nowrap' }}>{score} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => setEtapaPdca('act')} style={{ backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 6px rgba(16,185,129,0.2)', boxSizing: 'border-box' }}>
                Avançar para Etapa [A] Agir (Padronização) →
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: AGIR */}
        {etapaPdca === 'act' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>4️⃣ Etapa [A] Agir — Padronização (POP) e Correção no ERP</h3>
            
            <div style={boxGuiaStyle}>
              Decida se padroniza criando um <strong>POP</strong> e ajuste os parâmetros do ERP para girar o próximo ciclo com maior eficiência.
            </div>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '16px', color: '#991b1b', borderLeft: '6px solid #ef4444', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              <strong style={{ fontSize: '14.5px', wordBreak: 'break-word' }}>🔥 Foco no Gargalo Máximo (Score {problemaPrioritarioGUT?.scoreGut}/125):</strong>
              <div style={{ fontSize: '13px', marginTop: '4px', wordBreak: 'break-word' }}>{problemaPrioritarioGUT?.causa} (Prejuízo residual: R$ {formatMoeda(problemaPrioritarioGUT?.perdaMensal)}).</div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label htmlFor="actPop" style={labelStyle}>📄 Norma de Padronização (POP):</label>
                  <input id="actPop" name="actPop" style={inputStyle} value={padronizacaoPop.processoPadronizado} onChange={e => setPadronizacaoPop({...padronizacaoPop, processoPadronizado: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="actAuditor" style={labelStyle}>Responsável pela Auditoria:</label>
                  <input id="actAuditor" name="actAuditor" style={inputStyle} value={padronizacaoPop.responsavelAuditoria} onChange={e => setPadronizacaoPop({...padronizacaoPop, responsavelAuditoria: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="actCorteFixo" style={labelStyle}>Corte no Custo Fixo (R$):</label>
                  <input id="actCorteFixo" name="actCorteFixo" style={inputStyle} type="number" min="0" max="5000" value={padronizacaoPop.metaReduzirCustoFixo} onChange={e => setPadronizacaoPop({...padronizacaoPop, metaReduzirCustoFixo: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="actExpFat" style={labelStyle}>Expansão de Receita (Mês {mes + 1} - %):</label>
                  <input id="actExpFat" name="actExpFat" style={inputStyle} type="number" min="-10" max="25" value={padronizacaoPop.metaExpansaoReceitaPct} onChange={e => setPadronizacaoPop({...padronizacaoPop, metaExpansaoReceitaPct: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="button" onClick={concluirCicloAgir} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px', width: '100%', boxShadow: '0 6px 12px rgba(37,99,235,0.3)', boxSizing: 'border-box' }}>
              🔄 Gravar POP no ERP e Iniciar Ciclo do Mês {mes + 1} 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}