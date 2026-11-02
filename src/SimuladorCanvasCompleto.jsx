import React, { useState } from 'react';
import InputCustomizado from './InputCustomizado'; 

export default function SimuladorCanvasCompleto({ mostrarToast }) {
  // Controle de Fases e Gamificação
  const [faseAtual, setFaseAtual] = useState(0);
  const [xp, setXp] = useState(100);
  const [nivel, setNivel] = useState(1);
  const [conquistas, setConquistas] = useState(['💡 Visão Empreendedora']);

  // Catálogo de Modelos de Negócio
  const modelosPreset = [
    {
      id: 'saas',
      titulo: '💻 EcoGestão SaaS Contábil',
      setor: 'Tecnologia B2B • Recorrência (MRR)',
      capitalInicial: 60000,
      precoConcorrencia: 320,
      canvas: {
        nomeNegocio: 'EcoGestão Contábil SaaS',
        descricao: 'Plataforma em nuvem de automação fiscal, contabilidade consultiva e relatórios ESG para PMEs.',
        problemaDor: 'Pequenas empresas pagam multas por erros fiscais e não têm visão financeira em tempo real.',
        segmentoClientes: 'Pequenas empresas do Simples Nacional, comércios e prestadores de serviços B2B.',
        propostaValor: 'Fechamento contábil automatizado em 5 minutos com painel de saúde de caixa e selo ESG.',
        canais: 'Inbound Marketing (SEO), Parcerias com Associações Comerciais e LinkedIn Outbound.',
        relacionamento: 'Onboarding guiado por Customer Success + Suporte via WhatsApp e IA 24/7.',
        fontesReceita: 'Assinatura Mensal Recorrente (Planos Essencial, Pro e Enterprise) + Taxa de Setup.',
        recursosChave: 'Engenheiros de Software, Contadores Especialistas, Servidores AWS e Base Tributária.',
        atividadesChave: 'Atualização de regras fiscais SEFAZ, desenvolvimento contínuo e retenção de clientes.',
        parceirosChave: 'Certificadoras Digitais (ICP-Brasil), Bancos PJ (Open Finance) e Sebrae.',
        estruturaCustos: 'Folha de Devs/Suporte, Servidores Cloud por cliente ativo, Tráfego Pago e Licenças.'
      },
      custosFixos: { folhaProLabore: 8500, aluguelInfra: 1200, sistemasContabilidade: 1100, administrativoOutros: 700 },
      custosVariaveis: { custoInsumoDireto: 22, custoEmbalagemLogistica: 8, custoSuporteServidorUnit: 15 },
      impostosTaxas: { aliquotaImpostoPct: 6.0, taxaCartaoBoletoPct: 2.5, comissaoVendasPct: 5.0, margemLucroDesejadaPct: 25.0 },
      precoPraticadoInicial: 299.00,
      clientesIniciais: 35
    },
    {
      id: 'cafeteria',
      titulo: '☕ Torrefação & Cafeteria Especial',
      setor: 'Alimentação & Varejo • Produto Físico',
      capitalInicial: 45000,
      precoConcorrencia: 48,
      canvas: {
        nomeNegocio: 'Origem Café & Confeitaria',
        descricao: 'Venda de pacotes de cafés especiais de torra própria (250g) e kits de degustação artesanal.',
        problemaDor: 'Consumidores tomam café queimado sem conhecer a doçura do grão 100% arábica.',
        segmentoClientes: 'Apreciadores de cafés especiais, home-offices e escritórios de alto padrão.',
        propostaValor: 'Café microlote torrado na semana do envio com rastreabilidade da fazenda à xícara.',
        canais: 'Loja Física Conceito, E-commerce próprio, Instagram Shop e Clubes de Assinatura.',
        relacionamento: 'Clube do Barista, degustações presenciais e receitas exclusivas via QR Code.',
        fontesReceita: 'Venda avulsa de pacotes de 250g, Kits Presente e Assinatura Mensal de Grãos.',
        recursosChave: 'Torrador industrial, Mestre de Torra, Embalagens valvuladas e Ponto Comercial.',
        atividadesChave: 'Curadoria de grãos verdes, controle de curva de torra, moagem e despacho rápido.',
        parceirosChave: 'Produtores da Serra da Mantiqueira, Correios/Transportadoras e Fornecedores.',
        estruturaCustos: 'Compra de sacas de café verde, embalagens, aluguel do ponto, energia/gás e baristas.'
      },
      custosFixos: { folhaProLabore: 6200, aluguelInfra: 3200, sistemasContabilidade: 600, administrativoOutros: 800 },
      custosVariaveis: { custoInsumoDireto: 14.50, custoEmbalagemLogistica: 4.50, custoSuporteServidorUnit: 1.00 },
      impostosTaxas: { aliquotaImpostoPct: 4.5, taxaCartaoBoletoPct: 3.5, comissaoVendasPct: 3.0, margemLucroDesejadaPct: 22.0 },
      precoPraticadoInicial: 46.00,
      clientesIniciais: 260
    }
  ];

  // Estados Base
  const [ideia, setIdeia] = useState(modelosPreset[0].canvas);
  const [precoConcorrencia, setPrecoConcorrencia] = useState(modelosPreset[0].precoConcorrencia);
  const [custosFixosDetalhe, setCustosFixosDetalhe] = useState(modelosPreset[0].custosFixos);
  const [custosVariaveisDetalhe, setCustosVariaveisDetalhe] = useState(modelosPreset[0].custosVariaveis);
  const [parametrosPreco, setParametrosPreco] = useState(modelosPreset[0].impostosTaxas);
  const [precoVendaEscolhido, setPrecoVendaEscolhido] = useState(modelosPreset[0].precoPraticadoInicial);

  // Estados da Simulação (ERP)
  const [mesVirtual, setMesVirtual] = useState(1);
  const [capitalSocialInicial, setCapitalSocialInicial] = useState(modelosPreset[0].capitalInicial);
  const [saldoCaixa, setSaldoCaixa] = useState(modelosPreset[0].capitalInicial);
  const [clientesAtivos, setClientesAtivos] = useState(modelosPreset[0].clientesIniciais);
  const [orcamentoMarketingMes, setOrcamentoMarketingMes] = useState(3000);
  const [custoAquisicaoCAC, setCustoAquisicaoCAC] = useState(150);
  const [taxaCancelamentoChurnPct, setTaxaCancelamentoChurnPct] = useState(5);
  const [historicoTurnos, setHistoricoTurnos] = useState([]);

  // ESTADOS DE INOVAÇÃO
  const [passoMaquinaTempo, setPassoMaquinaTempo] = useState(0); // Para a Fase 3
  const [cenarioStress, setCenarioStress] = useState(null); // Para a Fase 4

  const [eventoAtivo, setEventoAtivo] = useState({
    titulo: '🚀 Decisão de Go-to-Market e Canal de Vendas',
    descricao: 'O mercado está reagindo ao seu preço praticado. Escolha a tática operacional deste mês:',
    opcaoA: { texto: 'Campanha agressiva de conversão + Parceria Comercial', custoExtra: 2500, bonusClientes: 12 },
    opcaoB: { texto: 'Foco em indicação boca a boca (MGM) e retenção da base', custoExtra: 600, bonusClientes: 4 }
  });

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Estilos padronizados
  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', backgroundColor: '#ffffff', transition: 'all 0.2s ease' };
  const labelStyle = { fontWeight: 'bold', fontSize: '12px', color: '#334155', display: 'block', marginBottom: '4px', wordBreak: 'break-word' };
  const boxGuiaStyle = { backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', borderTop: '1px solid #bfdbfe', borderRight: '1px solid #bfdbfe', borderBottom: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '18px', color: '#1e3a8a', fontSize: '13px', lineHeight: '1.5', boxSizing: 'border-box' };

  const adicionarXp = (qtd, msg, novaConquista = null) => {
    const novoXp = xp + qtd;
    setXp(novoXp);
    if (novaConquista && !conquistas.includes(novaConquista)) {
      setConquistas(prev => [...prev, novaConquista]);
    }
    if (novoXp >= nivel * 350) {
      setNivel(n => n + 1);
      if (typeof mostrarToast === 'function') mostrarToast(`🎉 LEVEL UP! Empreendedor Nível ${nivel + 1}!`, 'sucesso');
    } else if (typeof mostrarToast === 'function') {
      mostrarToast(`+${qtd} XP: ${msg}`, 'sucesso');
    }
  };

  const carregarPreset = (preset) => {
    setIdeia({ ...preset.canvas }); setPrecoConcorrencia(preset.precoConcorrencia); setCustosFixosDetalhe({ ...preset.custosFixos }); setCustosVariaveisDetalhe({ ...preset.custosVariaveis }); setParametrosPreco({ ...preset.impostosTaxas }); setPrecoVendaEscolhido(preset.precoPraticadoInicial); setCapitalSocialInicial(preset.capitalInicial); setSaldoCaixa(preset.capitalInicial); setClientesAtivos(preset.clientesIniciais); setMesVirtual(1); setHistoricoTurnos([]); setPassoMaquinaTempo(0); setCenarioStress(null);
    if (typeof mostrarToast === 'function') mostrarToast(`Modelo "${preset.titulo}" carregado com sucesso!`, 'sucesso');
  };

  // Cálculos Base
  const parseVal = (val) => (val === '' || val === null || val === undefined) ? 0 : Number(val);

  const custoFixoTotalMensal = parseVal(custosFixosDetalhe.folhaProLabore) + parseVal(custosFixosDetalhe.aluguelInfra) + parseVal(custosFixosDetalhe.sistemasContabilidade) + parseVal(custosFixosDetalhe.administrativoOutros);
  
  const custoVariavelUnitario = parseVal(custosVariaveisDetalhe.custoInsumoDireto) + parseVal(custosVariaveisDetalhe.custoEmbalagemLogistica) + parseVal(custosVariaveisDetalhe.custoSuporteServidorUnit);
  
  const despesasVendaPctTotal = parseVal(parametrosPreco.aliquotaImpostoPct) + parseVal(parametrosPreco.taxaCartaoBoletoPct) + parseVal(parametrosPreco.comissaoVendasPct);
  
  const somaPercentuaisMarkup = despesasVendaPctTotal + parseVal(parametrosPreco.margemLucroDesejadaPct);
  const markupDivisor = Math.max(0.05, 1 - (somaPercentuaisMarkup / 100));
  const markupMultiplicador = +(1 / markupDivisor).toFixed(4);
  const precoTecnicoSugerido = +(custoVariavelUnitario / markupDivisor).toFixed(2);
  
  const precoPraticado = parseVal(precoVendaEscolhido) === 0 ? 0 : Math.max(0.01, parseVal(precoVendaEscolhido));
  
  const valorImpostoUnit = +(precoPraticado * (parseVal(parametrosPreco.aliquotaImpostoPct) / 100)).toFixed(2);
  const valorTaxaCartaoUnit = +(precoPraticado * (parseVal(parametrosPreco.taxaCartaoBoletoPct) / 100)).toFixed(2);
  const valorComissaoUnit = +(precoPraticado * (parseVal(parametrosPreco.comissaoVendasPct) / 100)).toFixed(2);
  const totalDespesasVendaUnit = +(valorImpostoUnit + valorTaxaCartaoUnit + valorComissaoUnit).toFixed(2);
  
  const margemContribuicaoUnit = +(precoPraticado - custoVariavelUnitario - totalDespesasVendaUnit).toFixed(2);
  const indiceMargemContribuicaoPct = precoPraticado > 0 ? +((margemContribuicaoUnit / precoPraticado) * 100).toFixed(1) : 0;
  
  const pontoEquilibrioUnidades = margemContribuicaoUnit > 0 ? Math.ceil(custoFixoTotalMensal / margemContribuicaoUnit) : 999999;
  const pontoEquilibrioFaturamento = +(pontoEquilibrioUnidades * precoPraticado).toFixed(2);
  const diferencaConcorrenciaPct = precoConcorrencia > 0 ? +(((precoPraticado - precoConcorrencia) / precoConcorrencia) * 100).toFixed(1) : 0;

  const processarTurnoMercado = (opcaoEscolhida) => {
    const dadosOpcao = opcaoEscolhida === 'A' ? eventoAtivo.opcaoA : eventoAtivo.opcaoB;
    const fatorElasticidade = diferencaConcorrenciaPct > 25 ? 0.6 : diferencaConcorrenciaPct < -10 ? 1.25 : 1.0;
    const clientesAdquiridosMkt = Math.round((orcamentoMarketingMes / Math.max(10, custoAquisicaoCAC)) * fatorElasticidade);
    const clientesCanceladosChurn = Math.round(clientesAtivos * (taxaCancelamentoChurnPct / 100));
    const novoTotalClientes = Math.max(1, clientesAtivos + clientesAdquiridosMkt + dadosOpcao.bonusClientes - clientesCanceladosChurn);

    const receitaBrutaMes = +(novoTotalClientes * precoPraticado).toFixed(2);
    const deducoesImpostosTaxasComissoes = +(novoTotalClientes * totalDespesasVendaUnit).toFixed(2);
    const receitaLiquidaMes = +(receitaBrutaMes - deducoesImpostosTaxasComissoes).toFixed(2);
    const custoVariavelTotalCMV = +(novoTotalClientes * custoVariavelUnitario).toFixed(2);
    const margemContribuicaoTotalMes = +(receitaLiquidaMes - custoVariavelTotalCMV).toFixed(2);

    const despesasFixasEMarketing = +(custoFixoTotalMensal + orcamentoMarketingMes + dadosOpcao.custoExtra).toFixed(2);
    const lucroLiquidoExercicio = +(margemContribuicaoTotalMes - despesasFixasEMarketing).toFixed(2);
    const novoSaldoCaixa = +(saldoCaixa + lucroLiquidoExercicio).toFixed(2);

    const registroMes = { mes: mesVirtual, clientes: novoTotalClientes, novosClientes: clientesAdquiridosMkt + dadosOpcao.bonusClientes, churn: clientesCanceladosChurn, precoPraticado, receitaBrutaMes, deducoesImpostosTaxasComissoes, custoVariavelTotalCMV, margemContribuicaoTotalMes, despesasFixasEMarketing, lucroLiquidoExercicio, saldoFinal: novoSaldoCaixa, estrategia: dadosOpcao.texto };

    setClientesAtivos(novoTotalClientes); setSaldoCaixa(novoSaldoCaixa);
    setHistoricoTurnos(prev => [...prev, registroMes]);
    setMesVirtual(m => m + 1);
    setCenarioStress(null);

    const bancoDilemas = [
      { titulo: '📈 Aumento no Custo de Insumos', descricao: 'Seu fornecedor reajustou a tabela. Como você protege a Margem?', opcaoA: { texto: 'Comprar em lote à vista com desconto', custoExtra: 2200, bonusClientes: 8 }, opcaoB: { texto: 'Manter operação e focar em upsell', custoExtra: 500, bonusClientes: 3 } },
      { titulo: '🤝 Proposta de Canal B2B', descricao: 'Uma rede quer divulgar a sua solução para a carteira deles.', opcaoA: { texto: 'Patrocinar evento de lançamento', custoExtra: 3200, bonusClientes: 16 }, opcaoB: { texto: 'Fazer webinar online gratuito', custoExtra: 400, bonusClientes: 5 } },
      { titulo: '⚡ Concorrente Baixou o Preço', descricao: 'Guerra de preços iniciada no mercado.', opcaoA: { texto: 'Investir em pós-venda VIP', custoExtra: 1800, bonusClientes: 10 }, opcaoB: { texto: 'Segurar caixa e focar nos mais rentáveis', custoExtra: 300, bonusClientes: 2 } }
    ];
    setEventoAtivo(bancoDilemas[mesVirtual % bancoDilemas.length]);
    adicionarXp(80, `Mês ${mesVirtual} fechado! Lucro Líquido: R$ ${formatMoeda(lucroLiquidoExercicio)}`);
  };

  const aplicarStressTest = (tipo) => {
    setCenarioStress(tipo);
    adicionarXp(20, 'Simulação de Crise ativada!');
  };

  let projecaoReceitaStress = precoPraticado * clientesAtivos;
  let projecaoCustosStress = custoFixoTotalMensal + (custoVariavelUnitario * clientesAtivos) + (totalDespesasVendaUnit * clientesAtivos);
  
  if (cenarioStress === 'pandemia') projecaoReceitaStress *= 0.2; 
  if (cenarioStress === 'inflacao') projecaoCustosStress += (custoVariavelUnitario * clientesAtivos * 0.35); 
  if (cenarioStress === 'guerra') projecaoReceitaStress *= 0.8; 
  
  const lucroProjetadoStress = projecaoReceitaStress - projecaoCustosStress;
  const mesesRunway = lucroProjetadoStress < 0 ? (saldoCaixa / Math.abs(lucroProjetadoStress)).toFixed(1) : '∞';

  const receitaBrutaAcumulada = historicoTurnos.reduce((a, b) => a + b.receitaBrutaMes, 0);
  const deducoesAcumuladas = historicoTurnos.reduce((a, b) => a + b.deducoesImpostosTaxasComissoes, 0);
  const cmvAcumulado = historicoTurnos.reduce((a, b) => a + b.custoVariavelTotalCMV, 0);
  const margemContribuicaoAcumulada = historicoTurnos.reduce((a, b) => a + b.margemContribuicaoTotalMes, 0);
  const despesasFixasAcumuladas = historicoTurnos.reduce((a, b) => a + b.despesasFixasEMarketing, 0);
  const lucroLiquidoAcumulado = historicoTurnos.reduce((a, b) => a + b.lucroLiquidoExercicio, 0);

  const tempoMedioRetencaoMeses = taxaCancelamentoChurnPct > 0 ? +(100 / taxaCancelamentoChurnPct).toFixed(1) : 24;
  const ltvEstimado = +(margemContribuicaoUnit * tempoMedioRetencaoMeses).toFixed(2);
  const relacaoLtvCac = custoAquisicaoCAC > 0 ? +(ltvEstimado / custoAquisicaoCAC).toFixed(1) : 0;

  return (
    <div translate="no" className="notranslate" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', fontSize: '13px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER E NAVEGAÇÃO DE FASES */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '4px solid #3b82f6', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ minWidth: 0, flex: '1 1 250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '11.5px', letterSpacing: '0.5px' }}>
                ⭐ NÍVEL {nivel} ({xp} XP)
              </span>
              <span style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>{ideia.nomeNegocio || 'Modelagem de Negócios'}</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span>Caixa: <strong style={{ color: saldoCaixa >= 0 ? '#4ade80' : '#f87171' }}>R$ {formatMoeda(saldoCaixa)}</strong></span>
              <span>Preço: <strong>R$ {formatMoeda(precoPraticado)}</strong></span>
              <span>Margem: <strong style={{ color: margemContribuicaoUnit > 0 ? '#38bdf8' : '#f87171' }}>R$ {formatMoeda(margemContribuicaoUnit)} ({indiceMargemContribuicaoPct}%)</strong></span>
              <span>Equilíbrio: <strong>{pontoEquilibrioUnidades} un.</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '8px', boxSizing: 'border-box' }}>
          {[
            { id: 0, label: '0. Ideia & Caso' },
            { id: 1, label: '1. Canvas (BMC)' },
            { id: 2, label: '2. Custos' },
            { id: 3, label: '3. Precificação' },
            { id: 4, label: '4. Tração & DRE' }
          ].map(f => (
            <button key={f.id} type="button" onClick={() => setFaseAtual(f.id)}
              style={{
                padding: '10px 12px', borderRadius: '8px',
                border: faseAtual === f.id ? '2px solid #60a5fa' : '1px solid #334155',
                fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
                backgroundColor: faseAtual === f.id ? '#2563eb' : '#1e293b', color: 'white',
                boxShadow: faseAtual === f.id ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all 0.2s ease', textAlign: 'center', boxSizing: 'border-box'
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #cbd5e1', borderTop: 'none', boxSizing: 'border-box', width: '100%' }}>

        {/* FASE 0: ESCOLHA DO CASO */}
        {faseAtual === 0 && (
          <div style={{ animation: 'fadeIn 0.4s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Passo 0: Escolha um Caso Empresarial ou Modele sua Própria Ideia</h3>
            <div style={boxGuiaStyle}>
              <strong>📘 Guia Pedagógico (Modelagem de Negócios):</strong> Antes de abrir uma empresa ou lançar um produto, valide <strong>qual dor real do mercado</strong> está resolvendo. Escolha um caso abaixo ou personalize a sua startup.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
              {modelosPreset.map(p => (
                <div key={p.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                  <div>
                    <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{p.setor}</span>
                    <h4 style={{ margin: '8px 0 6px 0', fontSize: '14.5px', color: '#0f172a', wordBreak: 'break-word' }}>{p.titulo}</h4>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.5', wordBreak: 'break-word' }}>{p.canvas.descricao}</p>
                  </div>
                  <button type="button" onClick={() => carregarPreset(p)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', width: '100%', boxSizing: 'border-box' }}>
                    📥 Carregar Dados
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>Nome da Empresa / Produto:</label><input style={inputStyle} type="text" value={ideia.nomeNegocio} onChange={e => setIdeia({...ideia, nomeNegocio: e.target.value})} /></div>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>Capital Social Inicial (R$):</label><input style={inputStyle} type="number" value={capitalSocialInicial} onChange={e => { const v = e.target.value; setCapitalSocialInicial(v); setSaldoCaixa(v); }} /></div>
              <div style={{ gridColumn: '1 / -1', minWidth: 0 }}><label style={labelStyle}>Dor / Problema Real que resolve:</label><input style={inputStyle} type="text" value={ideia.problemaDor} onChange={e => setIdeia({...ideia, problemaDor: e.target.value})} /></div>
              <div style={{ gridColumn: '1 / -1', minWidth: 0 }}><label style={labelStyle}>Descrição da Solução e Modelo de Negócio:</label><textarea rows="3" style={inputStyle} value={ideia.descricao} onChange={e => setIdeia({...ideia, descricao: e.target.value})} /></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => { setFaseAtual(1); adicionarXp(50, 'Tese de negócio definida!'); }} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', width: '100%', maxWidth: '280px', boxSizing: 'border-box' }}>
                Avançar para Fase 1: BMC →
              </button>
            </div>
          </div>
        )}

        {/* FASE 1: BMC */}
        {faseAtual === 1 && (
          <div style={{ animation: 'fadeIn 0.4s', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ minWidth: 0, flex: '1 1 250px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Fase 1: Business Model Canvas • {ideia.nomeNegocio}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>Lado Direito = Mercado (Receitas) | Lado Esquerdo = Operação (Custos).</p>
              </div>
              <button type="button" onClick={() => { setFaseAtual(2); adicionarXp(100, 'Canvas estruturado!'); }} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 12px rgba(22,163,74,0.3)', width: '100%', maxWidth: '280px', boxSizing: 'border-box' }}>
                Avançar para Fase 2: Custos →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #475569', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>🤝 1. Parceiros-Chave</label><textarea rows="4" style={inputStyle} value={ideia.parceirosChave} onChange={e => setIdeia({...ideia, parceirosChave: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #475569', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>⚙️ 2. Atividades-Chave</label><textarea rows="4" style={inputStyle} value={ideia.atividadesChave} onChange={e => setIdeia({...ideia, atividadesChave: e.target.value})} /></div>
              <div style={{ backgroundColor: '#eff6ff', border: '2px solid #3b82f6', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1d4ed8' }}>💎 3. Proposta de Valor</label><textarea rows="4" style={inputStyle} value={ideia.propostaValor} onChange={e => setIdeia({...ideia, propostaValor: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>❤️ 4. Relacionamento</label><textarea rows="4" style={inputStyle} value={ideia.relacionamento} onChange={e => setIdeia({...ideia, relacionamento: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>🎯 5. Segmento Clientes</label><textarea rows="4" style={inputStyle} value={ideia.segmentoClientes} onChange={e => setIdeia({...ideia, segmentoClientes: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #475569', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>🔑 6. Recursos-Chave</label><textarea rows="3" style={inputStyle} value={ideia.recursosChave} onChange={e => setIdeia({...ideia, recursosChave: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#1e40af' }}>📢 7. Canais Aquisição</label><textarea rows="3" style={inputStyle} value={ideia.canais} onChange={e => setIdeia({...ideia, canais: e.target.value})} /></div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderTop: '4px solid #dc2626', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#991b1b' }}>💸 8. Estrutura de Custos</label><textarea rows="3" style={inputStyle} value={ideia.estruturaCustos} onChange={e => setIdeia({...ideia, estruturaCustos: e.target.value})} /></div>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: '4px solid #16a34a', padding: '14px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}><label style={{ ...labelStyle, color: '#166534' }}>💰 9. Fontes de Receita</label><textarea rows="3" style={inputStyle} value={ideia.fontesReceita} onChange={e => setIdeia({...ideia, fontesReceita: e.target.value})} /></div>
            </div>
          </div>
        )}

        {/* FASE 2: ENGENHARIA DE CUSTOS */}
        {faseAtual === 2 && (
          <div style={{ animation: 'fadeIn 0.4s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Fase 2: Engenharia de Custos (Fixos vs Variáveis)</h3>
            <div style={boxGuiaStyle}>
              <strong>📘 Guia Pedagógico (Contabilidade):</strong> Custos Fixos acontecem mesmo se a empresa vender ZERO. O Custo Variável Unitário (CVu) só acontece quando uma unidade é produzida ou vendida.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '5px solid #dc2626', padding: '18px', borderRadius: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                  <strong style={{ color: '#991b1b', fontSize: '14px' }}>🏢 1. Custos Fixos Mensais</strong>
                  <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '12px' }}>Total: R$ {formatMoeda(custoFixoTotalMensal)}</span>
                </div>
                <div style={{ display: 'grid', gap: '12px', width: '100%' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Folha Fixa + Pró-Labore (R$):</label>
                    <input style={inputStyle} type="number" step="0.01" value={custosFixosDetalhe.folhaProLabore} onFocus={e => e.target.select()} onChange={e => setCustosFixosDetalhe({...custosFixosDetalhe, folhaProLabore: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Aluguel e Infraestrutura (R$):</label>
                    <input style={inputStyle} type="number" step="0.01" value={custosFixosDetalhe.aluguelInfra} onFocus={e => e.target.select()} onChange={e => setCustosFixosDetalhe({...custosFixosDetalhe, aluguelInfra: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Sistemas e Contabilidade (R$):</label>
                    <input style={inputStyle} type="number" step="0.01" value={custosFixosDetalhe.sistemasContabilidade} onFocus={e => e.target.select()} onChange={e => setCustosFixosDetalhe({...custosFixosDetalhe, sistemasContabilidade: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Outras Despesas Adm (R$):</label>
                    <input style={inputStyle} type="number" step="0.01" value={custosFixosDetalhe.administrativoOutros} onFocus={e => e.target.select()} onChange={e => setCustosFixosDetalhe({...custosFixosDetalhe, administrativoOutros: e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '5px solid #d97706', padding: '18px', borderRadius: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                  <strong style={{ color: '#92400e', fontSize: '14px' }}>📦 2. Custo Variável Unitário (CVu)</strong>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', fontWeight: '900', fontSize: '12px' }}>CVu: R$ {formatMoeda(custoVariavelUnitario)}</span>
                </div>
                <div style={{ display: 'grid', gap: '12px', width: '100%' }}>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Matéria-Prima ou Insumo Direto (R$):</label><input style={inputStyle} type="number" step="0.50" value={custosVariaveisDetalhe.custoInsumoDireto} onChange={e => setCustosVariaveisDetalhe({...custosVariaveisDetalhe, custoInsumoDireto: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Embalagem e Frete Unitário (R$):</label><input style={inputStyle} type="number" step="0.50" value={custosVariaveisDetalhe.custoEmbalagemLogistica} onChange={e => setCustosVariaveisDetalhe({...custosVariaveisDetalhe, custoEmbalagemLogistica: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Custo Servidor por Cliente (R$):</label><input style={inputStyle} type="number" step="0.50" value={custosVariaveisDetalhe.custoSuporteServidorUnit} onChange={e => setCustosVariaveisDetalhe({...custosVariaveisDetalhe, custoSuporteServidorUnit: e.target.value})} /></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => setFaseAtual(1)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Voltar ao Canvas</button>
              <button type="button" onClick={() => setFaseAtual(3)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>Ir para Fase 3: Precificação →</button>
            </div>
          </div>
        )}

        {/* FASE 3: PRECIFICAÇÃO + MÁQUINA DO TEMPO */}
        {faseAtual === 3 && (
          <div style={{ animation: 'fadeIn 0.4s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Fase 3: Laboratório de Precificação & Máquina do Tempo</h3>
            <div style={boxGuiaStyle}>
              <strong>📘 Aula Prática:</strong> A fórmula profissional do <strong>Markup Divisor</strong> garante que o preço cubra o Custo Variável (R$ {formatMoeda(custoVariavelUnitario)}), pague as taxas de venda e entregue a margem de lucro exata desejada.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '5px solid #2563eb', padding: '18px', borderRadius: '12px', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ color: '#1e40af', fontSize: '14px', display: 'block', marginBottom: '14px' }}>🧮 1. Taxas sobre a Venda e Meta de Lucro (%)</strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Imposto (%):</label><input style={inputStyle} type="number" step="0.5" min="0" value={parametrosPreco.aliquotaImpostoPct} onChange={e => setParametrosPreco({...parametrosPreco, aliquotaImpostoPct: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Taxa Cartão (%):</label><input style={inputStyle} type="number" step="0.5" min="0" value={parametrosPreco.taxaCartaoBoletoPct} onChange={e => setParametrosPreco({...parametrosPreco, taxaCartaoBoletoPct: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label style={labelStyle}>Comissão (%):</label><input style={inputStyle} type="number" step="0.5" min="0" value={parametrosPreco.comissaoVendasPct} onChange={e => setParametrosPreco({...parametrosPreco, comissaoVendasPct: e.target.value})} /></div>
                  <div style={{ minWidth: 0 }}><label style={{ ...labelStyle, color: '#16a34a' }}>Margem Desejada (%):</label><input style={inputStyle} type="number" step="1" min="1" max="60" value={parametrosPreco.margemLucroDesejadaPct} onChange={e => setParametrosPreco({...parametrosPreco, margemLucroDesejadaPct: e.target.value})} /></div>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', padding: '14px', borderRadius: '8px', fontSize: '12.5px', color: '#1e3a8a', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap' }}><span>Total Deduções + Margem:</span><strong>{somaPercentuaisMarkup.toFixed(1)}% do Preço</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap' }}><span>Markup Divisor:</span><strong>{markupDivisor.toFixed(3)} ({markupMultiplicador}x)</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bfdbfe', paddingTop: '10px', marginTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold' }}>🎯 Preço Sugerido:</span><strong style={{ fontSize: '15px', color: '#1d4ed8' }}>R$ {formatMoeda(precoTecnicoSugerido)}</strong>
                  </div>
                  <button type="button" onClick={() => setPrecoVendaEscolhido(precoTecnicoSugerido)} style={{ marginTop: '12px', width: '100%', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                    ✓ Aplicar Preço Técnico
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '5px solid #16a34a', padding: '18px', borderRadius: '12px', boxSizing: 'border-box' }}>
                  <strong style={{ color: '#166534', fontSize: '14px', display: 'block', marginBottom: '14px' }}>🏷️ 2. Preço Praticado vs Mercado</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}><label style={{ ...labelStyle, color: '#166534' }}>SEU PREÇO (R$):</label><input style={{ ...inputStyle, fontWeight: '900', fontSize: '14.5px', borderColor: '#16a34a' }} type="number" step="1" value={precoVendaEscolhido} onChange={e => setPrecoVendaEscolhido(e.target.value)} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Média Mercado (R$):</label><input style={inputStyle} type="number" value={precoConcorrencia} onChange={e => setPrecoConcorrencia(e.target.value)} /></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ backgroundColor: margemContribuicaoUnit > 0 ? '#f0fdf4' : '#fef2f2', padding: '16px', borderRadius: '12px', border: `1px solid ${margemContribuicaoUnit > 0 ? '#86efac' : '#fca5a5'}`, boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#166534', letterSpacing: '0.5px' }}>PONTO EQUILÍBRIO</span>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: '4px', wordBreak: 'break-word' }}>{margemContribuicaoUnit > 0 ? `${pontoEquilibrioUnidades} vendas` : '⚠️ Prejuízo!'}</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', letterSpacing: '0.5px' }}>COMPETITIVIDADE</span>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: diferencaConcorrenciaPct > 15 ? '#d97706' : '#2563eb', marginTop: '4px' }}>
                      {diferencaConcorrenciaPct > 0 ? `+${diferencaConcorrenciaPct}%` : `${diferencaConcorrenciaPct}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* A MÁQUINA DO TEMPO */}
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  ⏳ A Máquina do Tempo <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#94a3b8' }}>Para onde vai o dinheiro de 1 venda?</span>
                </h4>
                <button onClick={() => setPassoMaquinaTempo((passoMaquinaTempo + 1) % 4)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                  Avançar Fluxo ⏩
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                <div style={{ padding: '14px', backgroundColor: passoMaquinaTempo >= 0 ? '#1e293b' : 'transparent', border: passoMaquinaTempo >= 0 ? '2px solid #3b82f6' : '1px dashed #475569', borderRadius: '10px', textAlign: 'center', opacity: passoMaquinaTempo >= 0 ? 1 : 0.4, boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '24px', marginBottom: '6px' }}>💵</span>
                  <strong style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Entrada Bruta</strong>
                  <span style={{ color: '#60a5fa', fontWeight: '900', fontSize: '15px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>R$ {formatMoeda(precoPraticado)}</span>
                </div>
                
                <div style={{ padding: '14px', backgroundColor: passoMaquinaTempo >= 1 ? '#1e293b' : 'transparent', border: passoMaquinaTempo >= 1 ? '2px solid #ef4444' : '1px dashed #475569', borderRadius: '10px', textAlign: 'center', opacity: passoMaquinaTempo >= 1 ? 1 : 0.4, boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '24px', marginBottom: '6px' }}>🏛️</span>
                  <strong style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Impostos & Taxas</strong>
                  <span style={{ color: '#f87171', fontWeight: '900', fontSize: '15px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>- R$ {formatMoeda(totalDespesasVendaUnit)}</span>
                </div>
                
                <div style={{ padding: '14px', backgroundColor: passoMaquinaTempo >= 2 ? '#1e293b' : 'transparent', border: passoMaquinaTempo >= 2 ? '2px solid #f59e0b' : '1px dashed #475569', borderRadius: '10px', textAlign: 'center', opacity: passoMaquinaTempo >= 2 ? 1 : 0.4, boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '24px', marginBottom: '6px' }}>📦</span>
                  <strong style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Custo Variável</strong>
                  <span style={{ color: '#fbbf24', fontWeight: '900', fontSize: '15px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>- R$ {formatMoeda(custoVariavelUnitario)}</span>
                </div>
                
                <div style={{ padding: '14px', backgroundColor: passoMaquinaTempo >= 3 ? '#064e3b' : 'transparent', border: passoMaquinaTempo >= 3 ? '2px solid #10b981' : '1px dashed #475569', borderRadius: '10px', textAlign: 'center', opacity: passoMaquinaTempo >= 3 ? 1 : 0.4, boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '24px', marginBottom: '6px' }}>💎</span>
                  <strong style={{ color: '#a7f3d0', fontSize: '11px', display: 'block', textTransform: 'uppercase' }}>Margem Limpa</strong>
                  <span style={{ color: '#34d399', fontWeight: '900', fontSize: '16px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>R$ {formatMoeda(margemContribuicaoUnit)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <button type="button" onClick={() => setFaseAtual(2)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Voltar aos Custos</button>
              <button type="button" onClick={() => { if (margemContribuicaoUnit > 0) setFaseAtual(4); }} style={{ backgroundColor: margemContribuicaoUnit > 0 ? '#16a34a' : '#94a3b8', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: margemContribuicaoUnit > 0 ? 'pointer' : 'not-allowed', fontSize: '13px', boxShadow: margemContribuicaoUnit > 0 ? '0 4px 12px rgba(22,163,74,0.3)' : 'none' }}>
                Lançar Produto (Fase 4) 🚀 →
              </button>
            </div>
          </div>
        )}

        {/* FASE 4: TRAÇÃO & STRESS TEST */}
        {faseAtual === 4 && (
          <div style={{ animation: 'fadeIn 0.4s', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ minWidth: 0, flex: '1 1 250px' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>OPERAÇÃO ATIVA • MÊS {mesVirtual}</span>
                <h3 style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Simulação de Tração e Caos</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', backgroundColor: '#0f172a', color: 'white', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                <div>Clientes: <strong style={{ color: '#38bdf8' }}>{clientesAtivos}</strong></div>
                <div>LTV/CAC: <strong style={{ color: relacaoLtvCac >= 3 ? '#4ade80' : '#fbbf24' }}>{relacaoLtvCac}x</strong></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>Preço (R$):</label><input style={inputStyle} type="number" value={precoVendaEscolhido} onChange={e => setPrecoVendaEscolhido(e.target.value)} /></div>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>Mkt (R$):</label><input style={inputStyle} type="number" step="500" value={orcamentoMarketingMes} onChange={e => setOrcamentoMarketingMes(e.target.value)} /></div>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>CAC (R$):</label><input style={inputStyle} type="number" value={custoAquisicaoCAC} onChange={e => setCustoAquisicaoCAC(e.target.value)} /></div>
              <div style={{ minWidth: 0 }}><label style={labelStyle}>Churn (%):</label><input style={inputStyle} type="number" min="0" max="40" value={taxaCancelamentoChurnPct} onChange={e => setTaxaCancelamentoChurnPct(e.target.value)} /></div>
            </div>

            {/* STRESS TEST */}
            <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', border: '2px solid #fecaca', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '900' }}>🌪️ STRESS TEST</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#991b1b' }}>Injete um choque de mercado para testar o <strong>Runway (Meses de Caixa)</strong>.</p>
                </div>
                {cenarioStress && (
                  <button onClick={() => setCenarioStress(null)} style={{ background: 'white', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px' }}>
                    Desativar ✖
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: cenarioStress ? '16px' : '0' }}>
                <button onClick={() => aplicarStressTest('pandemia')} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '8px', border: cenarioStress === 'pandemia' ? '2px solid #b91c1c' : '1px solid #fca5a5', backgroundColor: cenarioStress === 'pandemia' ? '#fee2e2' : 'white', cursor: 'pointer', fontWeight: 'bold', color: '#991b1b', fontSize: '12px', boxSizing: 'border-box' }}>
                  🦠 Pandemia (-80%)
                </button>
                <button onClick={() => aplicarStressTest('inflacao')} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '8px', border: cenarioStress === 'inflacao' ? '2px solid #b91c1c' : '1px solid #fca5a5', backgroundColor: cenarioStress === 'inflacao' ? '#fee2e2' : 'white', cursor: 'pointer', fontWeight: 'bold', color: '#991b1b', fontSize: '12px', boxSizing: 'border-box' }}>
                  📈 Inflação (+35%)
                </button>
                <button onClick={() => aplicarStressTest('guerra')} style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '8px', border: cenarioStress === 'guerra' ? '2px solid #b91c1c' : '1px solid #fca5a5', backgroundColor: cenarioStress === 'guerra' ? '#fee2e2' : 'white', cursor: 'pointer', fontWeight: 'bold', color: '#991b1b', fontSize: '12px', boxSizing: 'border-box' }}>
                  ⚔️ Guerra (-20%)
                </button>
              </div>

              {cenarioStress && (
                <div style={{ backgroundColor: '#7f1d1d', color: 'white', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', marginBottom: '4px', color: '#fecaca' }}>Runway (Sobrevivência):</strong>
                    <span style={{ fontSize: '12px', opacity: 0.9 }}>Tempo estimado de suporte com o caixa atual:</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: lucroProjetadoStress >= 0 ? '#4ade80' : '#fca5a5', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '6px' }}>
                    {lucroProjetadoStress >= 0 ? 'Resiliente 🎉' : `${mesesRunway} Meses 🚨`}
                  </div>
                </div>
              )}
            </div>

            {/* DECISÃO DO MÊS */}
            <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1.5px solid #3b82f6', marginBottom: '20px', boxSizing: 'border-box' }}>
              <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                ⚡ DECISÃO DO MÊS {mesVirtual}
              </span>
              <h4 style={{ margin: '10px 0 6px 0', color: '#1e40af', fontSize: '15px', wordBreak: 'break-word' }}>{eventoAtivo.titulo}</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#1e3a8a', wordBreak: 'break-word' }}>{eventoAtivo.descricao}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                <button type="button" onClick={() => processarTurnoMercado('A')} style={{ backgroundColor: '#1d4ed8', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', fontSize: '13px', boxSizing: 'border-box' }}>
                  🚀 Opção A: {eventoAtivo.opcaoA.texto}
                  <div style={{ fontSize: '11px', color: '#bfdbfe', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px' }}>
                    Custo: R$ {formatMoeda(eventoAtivo.opcaoA.custoExtra)} | +{eventoAtivo.opcaoA.bonusClientes} clientes
                  </div>
                </button>
                <button type="button" onClick={() => processarTurnoMercado('B')} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', fontSize: '13px', boxSizing: 'border-box' }}>
                  🛡️ Opção B: {eventoAtivo.opcaoB.texto}
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px' }}>
                    Custo: R$ {formatMoeda(eventoAtivo.opcaoB.custoExtra)} | +{eventoAtivo.opcaoB.bonusClientes} clientes
                  </div>
                </button>
              </div>
            </div>

            {/* DRE E BALANÇO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', lineHeight: '1.6', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#0f172a', fontSize: '13.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>📑 DRE Gerencial Acumulada</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}><span>(+) Receita Bruta:</span><strong style={{ color: '#16a34a' }}>R$ {formatMoeda(receitaBrutaAcumulada)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap' }}><span>(-) Impostos e Tx:</span><span>R$ {formatMoeda(deducoesAcumuladas)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', flexWrap: 'wrap' }}><span>(-) Custos Var (CMV):</span><span>R$ {formatMoeda(cmvAcumulado)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '2px', flexWrap: 'wrap' }}><span>(=) Margem Total:</span><span>R$ {formatMoeda(margemContribuicaoAcumulada)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', flexWrap: 'wrap' }}><span>(-) Fixos e Mkt:</span><span>R$ {formatMoeda(despesasFixasAcumuladas)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '1px solid #0f172a', marginTop: '6px', paddingTop: '6px', fontSize: '13.5px', color: lucroLiquidoAcumulado >= 0 ? '#16a34a' : '#dc2626', flexWrap: 'wrap' }}>
                  <span>(=) Lucro/Prejuízo:</span><span>R$ {formatMoeda(lucroLiquidoAcumulado)}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', lineHeight: '1.6', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#0f172a', fontSize: '13.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>⚖️ Balanço Patrimonial (Simples)</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}><span><strong>ATIVO (Caixa):</strong></span><strong style={{ color: '#2563eb', fontSize: '13.5px' }}>R$ {formatMoeda(saldoCaixa)}</strong></div>
                <hr style={{ border: '0.5px dashed #cbd5e1', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}><span>Capital Social:</span><span>R$ {formatMoeda(capitalSocialInicial)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: lucroLiquidoAcumulado >= 0 ? '#16a34a' : '#dc2626', flexWrap: 'wrap' }}>
                  <span>Lucros Acumulados:</span><strong>R$ {formatMoeda(lucroLiquidoAcumulado)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '1px solid #0f172a', marginTop: '6px', paddingTop: '6px', fontSize: '13.5px', flexWrap: 'wrap' }}>
                  <span>(=) PATRIMÔNIO LÍQUIDO:</span><span>R$ {formatMoeda(capitalSocialInicial + lucroLiquidoAcumulado)}</span>
                </div>
              </div>
            </div>

            {historicoTurnos.length > 0 && (
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      <th style={{ padding: '10px 12px' }}>Mês</th>
                      <th style={{ padding: '10px 12px' }}>Clientes</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Receita</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Deduções+CMV</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Margem</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Fixos+Mkt</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Lucro</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Caixa Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoTurnos.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>Mês {h.mes}</td>
                        <td style={{ padding: '10px 12px' }}><strong>{h.clientes}</strong> <span style={{fontSize:'10px', color:'#64748b'}}>(+{h.novosClientes}/-{h.churn})</span></td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>R$ {formatMoeda(h.receitaBrutaMes)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#d97706' }}>R$ {formatMoeda(h.deducoesImpostosTaxasComissoes + h.custoVariavelTotalCMV)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatMoeda(h.margemContribuicaoTotalMes)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626' }}>R$ {formatMoeda(h.despesasFixasEMarketing)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: h.lucroLiquidoExercicio >= 0 ? '#16a34a' : '#dc2626' }}>R$ {formatMoeda(h.lucroLiquidoExercicio)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>R$ {formatMoeda(h.saldoFinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}