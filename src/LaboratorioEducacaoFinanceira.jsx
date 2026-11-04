import React, { useState } from 'react';

export default function LaboratorioEducacaoFinanceira({ mostrarToast }) {
  // ==========================================
  // ESTADOS DO MÓDULO
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState('despertar');
  const [perfil, setPerfil] = useState('pf'); 

  const [simulacao, setSimulacao] = useState({
    objetivoNome: 'Independência Financeira (Viver de Renda)',
    metaValor: 1000000,
    aporteMensal: 1500,
    taxaAnualPct: 11.5,
    inflacaoAnualPct: 4.5,
    anosSimulacao: 15,
    mesesCriseDesemprego: 6,
    custoVidaMensal: 5000
  });

  const [extratoAnalisado, setExtratoAnalisado] = useState(false);

  const [gastos, setGastos] = useState({
    moradia: 2000,
    alimentacaoMercado: 1200,
    transporte: 600,
    saudeEducacao: 800,
    lazerSaidas: 900,
    assinaturas: 250,
    comprasImpulso: 400
  });

  // ==========================================
  // FUNÇÕES MATEMÁTICAS
  // ==========================================
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
  const formatInteiro = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  // 1. Motor de Juros e Simulação
  const calcMotor = (() => {
    const aporte = Number(simulacao.aporteMensal) || 0;
    const taxaNominalMensal = Math.pow(1 + (Number(simulacao.taxaAnualPct) || 0) / 100, 1 / 12) - 1;
    const inflacaoMensal = Math.pow(1 + (Number(simulacao.inflacaoAnualPct) || 0) / 100, 1 / 12) - 1;
    const mesesTotal = (Number(simulacao.anosSimulacao) || 0) * 12;
    const mesesCrise = Number(simulacao.mesesCriseDesemprego) || 0;
    const custoVida = Number(simulacao.custoVidaMensal) || 1;

    let saldoNominal = 0;
    let totalDesembolsado = 0;
    let saldoRealPoderCompra = 0;

    for (let i = 1; i <= mesesTotal; i++) {
      const aporteNesteMes = i <= mesesCrise ? 0 : aporte;
      saldoNominal = (saldoNominal + aporteNesteMes) * (1 + taxaNominalMensal);
      totalDesembolsado += aporteNesteMes;
      saldoRealPoderCompra = (saldoRealPoderCompra + aporteNesteMes) * (1 + taxaNominalMensal) / (1 + inflacaoMensal);
    }

    const totalJurosGanhos = saldoNominal - totalDesembolsado;
    const rendaPassivaMensal = saldoNominal * taxaNominalMensal;
    const independenciaPct = custoVida > 0 ? (rendaPassivaMensal / custoVida) * 100 : 0;

    let nivelNome = ''; let nivelCor = ''; let nivelEmoji = '';
    if (independenciaPct < 20) { nivelNome = 'Sobrevivência'; nivelCor = '#ef4444'; nivelEmoji = '🧗'; }
    else if (independenciaPct < 60) { nivelNome = 'Segurança Básica'; nivelCor = '#f59e0b'; nivelEmoji = '🛡️'; }
    else if (independenciaPct < 100) { nivelNome = 'Conforto Financeiro'; nivelCor = '#38bdf8'; nivelEmoji = '🛋️'; }
    else if (independenciaPct < 200) { nivelNome = 'Independência'; nivelCor = '#10b981'; nivelEmoji = '🦅'; }
    else { nivelNome = 'Abundância Absoluta'; nivelCor = '#8b5cf6'; nivelEmoji = '👑'; }

    const pctSuor = saldoNominal > 0 ? (totalDesembolsado / saldoNominal) * 100 : 0;
    const pctJuros = saldoNominal > 0 ? (totalJurosGanhos / saldoNominal) * 100 : 0;
    const pctPoderCompra = saldoNominal > 0 ? (saldoRealPoderCompra / saldoNominal) * 100 : 0;
    const pctCorroido = Math.max(0, 100 - pctPoderCompra);

    return { 
      saldoNominal, totalDesembolsado, totalJurosGanhos, saldoRealPoderCompra, 
      rendaPassivaMensal, independenciaPct, nivelNome, nivelCor, nivelEmoji,
      pctSuor, pctJuros, pctPoderCompra, pctCorroido
    };
  })();

  // 2. Análise Regra 50/30/20
  const calcChecklist = (() => {
    const essencial = (Number(gastos.moradia)||0) + (Number(gastos.alimentacaoMercado)||0) + (Number(gastos.transporte)||0) + (Number(gastos.saudeEducacao)||0);
    const desejos = (Number(gastos.lazerSaidas)||0) + (Number(gastos.assinaturas)||0) + (Number(gastos.comprasImpulso)||0);
    const poupanca = Number(simulacao.aporteMensal) || 0;
    const rendaTotal = essencial + desejos + poupanca;
    
    const pctEssencial = rendaTotal > 0 ? (essencial / rendaTotal) * 100 : 0;
    const pctDesejos = rendaTotal > 0 ? (desejos / rendaTotal) * 100 : 0;
    const pctPoupanca = rendaTotal > 0 ? (poupanca / rendaTotal) * 100 : 0;

    return { essencial, desejos, poupanca, rendaTotal, pctEssencial, pctDesejos, pctPoupanca };
  })();

  // 3. Extrato e Otimização
  const desperdiciosPF = [
    { desc: 'Combos Streaming (Netflix+Disney+Max)', valor: 115.90 },
    { desc: 'Tarifa Pacote Banco (Poderia ser essencial)', valor: 79.90 },
    { desc: 'App de Exercícios / Academia não frequentada', valor: 120.00 },
    { desc: 'Delivery Fim de Semana (Ifood indiscriminado)', valor: 350.00 },
    { desc: 'Uber curto (Preguiça de andar/transporte)', valor: 180.00 },
    { desc: 'Compras por Impulso (Shopee/Shein)', valor: 250.00 },
    { desc: 'Anuidade de Cartão de Crédito', valor: 45.00 },
    { desc: 'Juros Rotativo / Atrasos pequenos', valor: 85.00 }
  ];
  const desperdiciosPJ = [
    { desc: 'Tarifas de TED/DOC e Manutenção de Conta', valor: 250.00 },
    { desc: 'SaaS / Softwares duplicados ou sem uso', valor: 650.00 },
    { desc: 'Juros de Cheque Especial / Antecipação', valor: 1250.00 },
    { desc: 'Multas por atraso em guias de impostos', valor: 350.00 },
    { desc: 'Compras sem pesquisa de fornecedor', valor: 900.00 }
  ];

  const listaDesperdicios = perfil === 'pf' ? desperdiciosPF : desperdiciosPJ;
  const totalDesperdicio = listaDesperdicios.reduce((acc, curr) => acc + curr.valor, 0);

  const calcOtimizado = (() => {
    const taxaNominalMensal = Math.pow(1 + (Number(simulacao.taxaAnualPct) || 0) / 100, 1 / 12) - 1;
    const mesesTotal = (Number(simulacao.anosSimulacao) || 0) * 12;
    let saldoOtimizado = 0;
    for (let i = 1; i <= mesesTotal; i++) {
      // Mesmo com crise, assumimos que cortou o desperdício para investir
      const aporteNesteMes = (i <= simulacao.mesesCriseDesemprego ? 0 : Number(simulacao.aporteMensal)) + totalDesperdicio;
      saldoOtimizado = (saldoOtimizado + aporteNesteMes) * (1 + taxaNominalMensal);
    }
    return { saldoOtimizado, ganhoExtra: saldoOtimizado - calcMotor.saldoNominal };
  })();

  // ==========================================
  // MOTOR DE IMPRESSÃO DO RELATÓRIO A4
  // ==========================================
  const imprimirRelatorioPDF = () => {
    if(typeof mostrarToast === 'function') mostrarToast('Gerando Relatório de Consultoria...', 'info');
    const janelaPrint = window.open('', '_blank', 'width=900,height=800');
    janelaPrint.document.write(`
      <html>
      <head>
        <title>Plano de Independência Financeira</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 10pt; }
          h1 { color: #0f172a; text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 5px; }
          h2 { color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; font-size: 14pt; margin-top: 25px; }
          h3 { color: #0f172a; font-size: 11pt; margin-bottom: 5px; }
          .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; font-size: 11pt; }
          .box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: right; }
          th { background-color: #f1f5f9; text-align: left; }
          td.label { text-align: left; font-weight: bold; }
          .highlight { color: #10b981; font-weight: bold; }
          .warning { color: #ef4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>PLANO MESTRE DE EDUCAÇÃO FINANCEIRA</h1>
        <div class="subtitle">Guia Prático para a Conquista dos Seus Sonhos e Metas</div>

        <div class="box" style="border-left: 5px solid #38bdf8;">
          <h3>1. O Seu Sonho (A Meta Principal)</h3>
          <p><strong>Objetivo:</strong> ${simulacao.objetivoNome}</p>
          <p>Para conquistar este sonho, definiu-se um aporte de <strong>${formatMoeda(simulacao.aporteMensal)}</strong> por mês durante <strong>${simulacao.anosSimulacao} anos</strong>. 
          O sucesso deste plano depende de três pilares: Pagar-se a si mesmo primeiro, proteger o dinheiro da inflação e cortar desperdícios.</p>
        </div>

        <h2>2. Diagnóstico Atual: O Ralo do Dinheiro (Regra 50/30/20)</h2>
        <table>
          <tbody>
            <tr><td class="label">Renda Total Analisada</td><td>${formatMoeda(calcChecklist.rendaTotal)}</td></tr>
            <tr><td class="label">Gastos Essenciais (Ideal: até 50%)</td><td>${formatMoeda(calcChecklist.essencial)} (${formatPct(calcChecklist.pctEssencial)})</td></tr>
            <tr><td class="label">Gastos com Desejos (Ideal: até 30%)</td><td>${formatMoeda(calcChecklist.desejos)} (${formatPct(calcChecklist.pctDesejos)})</td></tr>
            <tr style="background-color: #f0fdf4;"><td class="label">Investimentos para o Futuro (Ideal: min 20%)</td><td class="highlight">${formatMoeda(calcChecklist.poupanca)} (${formatPct(calcChecklist.pctPoupanca)})</td></tr>
          </tbody>
        </table>
        ${calcChecklist.pctEssencial > 50 || calcChecklist.pctDesejos > 30 ? '<p class="warning">Atenção: O seu padrão de vida está acima do recomendado. É necessário efetuar cortes inteligentes.</p>' : ''}

        <h2>3. Projeção de Investimentos (A Mágica dos Juros)</h2>
        <table>
          <tbody>
            <tr><td class="label">Taxa de Juros Anual Estimada</td><td>${formatPct(simulacao.taxaAnualPct)} a.a.</td></tr>
            <tr><td class="label">Total que sairá do seu bolso (O seu Esforço)</td><td>${formatMoeda(calcMotor.totalDesembolsado)}</td></tr>
            <tr style="background-color: #f0fdf4;"><td class="label">Total gerado pelos Juros Compostos (O seu Lucro)</td><td class="highlight">+ ${formatMoeda(calcMotor.totalJurosGanhos)}</td></tr>
            <tr><td class="label"><strong>SALDO FINAL ACUMULADO PROJETADO</strong></td><td style="font-size:12pt; font-weight:bold;">${formatMoeda(calcMotor.saldoNominal)}</td></tr>
            <tr><td class="label">Poder de Compra Real (Descontando ${formatPct(simulacao.inflacaoAnualPct)} de Inflação)</td><td>${formatMoeda(calcMotor.saldoRealPoderCompra)}</td></tr>
          </tbody>
        </table>

        <h2>4. A Renda Passiva e a Liberdade</h2>
        <div class="box" style="border-left: 5px solid ${calcMotor.nivelCor};">
          <p>Ao finalizar este plano, o seu patrimônio irá gerar uma <strong>Renda Passiva Mensal de ${formatMoeda(calcMotor.rendaPassivaMensal)}</strong>, sem que tenha de trabalhar.</p>
          <p>O seu Nível de Liberdade projetado é: <strong>${calcMotor.nivelNome}</strong> (cobre ${formatPct(calcMotor.independenciaPct)} do seu custo de vida atual).</p>
        </div>

        <h2>5. Dicas de Otimização e Cortes Inteligentes</h2>
        <ul style="font-size: 10pt;">
          <li><strong>Previdência Privada:</strong> Se faz a declaração Completa do IR, utilize um plano <strong>PGBL</strong> para abater até 12% da sua renda e receber restituição do governo. Caso faça a simplificada, opte pelo <strong>VGBL</strong>.</li>
          <li><strong>Cancele o Invisível:</strong> Ao limpar tarifas bancárias, assinaturas duplicadas e pequenos gastos por impulso, você pode redirecionar até ${formatMoeda(totalDesperdicio)} mensais a mais.</li>
          <li><strong>Teste dos 30 Dias:</strong> Adie compras impulsivas não essenciais por 30 dias. A maioria perde a importância.</li>
        </ul>

      </body>
      </html>
    `);
    janelaPrint.document.close();
    janelaPrint.focus();
    setTimeout(() => { janelaPrint.print(); }, 500);
  };

  // ==========================================
  // ESTILOS VISUAIS
  // ==========================================
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', backgroundColor: '#0f172a', color: '#38bdf8', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase' };
  const cardStyle = { backgroundColor: '#1e293b', padding: '18px', borderRadius: '14px', border: '1px solid #334155', boxSizing: 'border-box' };
  const boxMentorStyle = { backgroundColor: '#022c22', borderLeft: '4px solid #10b981', padding: '14px', borderRadius: '10px', color: '#a7f3d0', fontSize: '13px', lineHeight: '1.6' };

  return (
    <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '24px', border: '1px solid #334155', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER E MENU */}
      <div style={{ color: 'white', padding: '15px 20px', borderRadius: '16px 16px 0 0', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
          <div>
            <span style={{ backgroundColor: '#10b981', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>EDUCAÇÃO FINANCEIRA</span>
            <h2 style={{ margin: '8px 0 0 0', fontSize: '20px', color: '#f8fafc' }}>🧠 A Jornada da Riqueza</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPerfil('pf')} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: perfil === 'pf' ? '#38bdf8' : '#1e293b', color: perfil === 'pf' ? '#0f172a' : '#94a3b8' }}>👤 Pessoal</button>
            <button onClick={() => setPerfil('pj')} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: perfil === 'pj' ? '#8b5cf6' : '#1e293b', color: perfil === 'pj' ? '#ffffff' : '#94a3b8' }}>🏢 Empresa</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'despertar', label: '1. 🌅 O Despertar' },
            { id: 'motor', label: '2. ⚙️ Simular Metas' },
            { id: 'checklist', label: '3. 📋 Gastos e Cortes' },
            { id: 'previdencia', label: '4. 👵 Previdência (IR)' },
            { id: 'otimizador', label: '5. 💸 Analisar Extrato' },
            { id: 'niveis', label: '6. 👑 Resultado & PDF' }
          ].map(aba => (
            <button key={aba.id} onClick={() => setAbaAtiva(aba.id)} style={{ flex: '1 1 auto', backgroundColor: abaAtiva === aba.id ? '#f59e0b' : '#1e293b', color: abaAtiva === aba.id ? '#0f172a' : '#94a3b8', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', minHeight: '500px' }}>

        {/* ABA 1: O DESPERTAR (AGORA COM 8 CARDS) */}
        {abaAtiva === 'despertar' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>As 8 Leis do Dinheiro</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ ...cardStyle, borderTop: '4px solid #10b981' }}>
                <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '15px' }}>1. Pague-se Primeiro</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>O maior erro é investir o que sobra. Assim que receber, invista o seu percentual primeiro. Só depois pague os boletos.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #38bdf8' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '15px' }}>2. Ativos vs Passivos</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Ativos colocam dinheiro no seu bolso (ações, fundos). Passivos tiram dinheiro do seu bolso (carro caro, IPVA, juros).</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #f59e0b' }}>
                <h4 style={{ color: '#f59e0b', margin: '0 0 8px 0', fontSize: '15px' }}>3. Juros Compostos</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>A oitava maravilha. O juro sobre juro faz com que o tempo, e não a força do seu trabalho, crie a verdadeira fortuna.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #ef4444' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '15px' }}>4. A Corrosão da Inflação</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Dinheiro parado na conta perde valor todos os dias. O seu objetivo mínimo deve ser ganhar acima do índice IPCA.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #a855f7' }}>
                <h4 style={{ color: '#a855f7', margin: '0 0 8px 0', fontSize: '15px' }}>5. Reserva de Oportunidade</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Ter dinheiro em caixa durante uma crise não é só segurança, é a chance de comprar ativos e empresas a preço de saldo.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #ec4899' }}>
                <h4 style={{ color: '#ec4899', margin: '0 0 8px 0', fontSize: '15px' }}>6. O Preço do Tempo</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Começar a investir R$ 200 aos 20 anos gera mais dinheiro do que investir R$ 1000 por mês começando aos 45 anos.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #6366f1' }}>
                <h4 style={{ color: '#6366f1', margin: '0 0 8px 0', fontSize: '15px' }}>7. Fuga dos Maus Tratos</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Nenhum investimento vence o Juro Rotativo do Cartão ou do Cheque Especial. Pague dívidas caras antes de investir.</p>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #14b8a6' }}>
                <h4 style={{ color: '#14b8a6', margin: '0 0 8px 0', fontSize: '15px' }}>8. Diversificação Cega</h4>
                <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0 }}>Não coloque os ovos no mesmo cesto, mas não coloque cestos demais a ponto de não conseguir gerir. Mantenha simples.</p>
              </div>
            </div>
            <button onClick={() => setAbaAtiva('motor')} style={{ alignSelf: 'flex-end', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Avançar para Simulação →</button>
          </div>
        )}

        {/* ABA 2: SIMULAR METAS (AGORA COM O GRÁFICO INTEGRADO) */}
        {abaAtiva === 'motor' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Parâmetros da Jornada de Acumulação</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div><label style={labelStyle}>Seu Grande Sonho (Meta):</label><input type="text" style={{...inputStyle, color: 'white'}} value={simulacao.objetivoNome} onChange={e => setSimulacao({...simulacao, objetivoNome: e.target.value})} /></div>
                <div><label style={labelStyle}>Tempo p/ Conquistar (Anos):</label><input type="number" style={inputStyle} value={simulacao.anosSimulacao} onChange={e => setSimulacao({...simulacao, anosSimulacao: e.target.value})} /></div>
                <div><label style={labelStyle}>Aporte Mensal (R$):</label><input type="number" style={inputStyle} value={simulacao.aporteMensal} onChange={e => setSimulacao({...simulacao, aporteMensal: e.target.value})} /></div>
                <div><label style={labelStyle}>Taxa Juros Esp. (% a.a.):</label><input type="number" step="0.1" style={inputStyle} value={simulacao.taxaAnualPct} onChange={e => setSimulacao({...simulacao, taxaAnualPct: e.target.value})} /></div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #334155', paddingTop: '10px' }}></div>
                <div><label style={labelStyle}>Custo de Vida Atual Mensal:</label><input type="number" style={{...inputStyle, color: '#f59e0b'}} value={simulacao.custoVidaMensal} onChange={e => setSimulacao({...simulacao, custoVidaMensal: e.target.value})} /></div>
                <div><label style={labelStyle}>Inflação IPCA (% a.a.):</label><input type="number" step="0.1" style={{...inputStyle, color: '#f87171'}} value={simulacao.inflacaoAnualPct} onChange={e => setSimulacao({...simulacao, inflacaoAnualPct: e.target.value})} /></div>
                <div><label style={labelStyle}>Meses de Crise (Sem investir):</label><input type="number" style={{...inputStyle, color: '#ef4444'}} value={simulacao.mesesCriseDesemprego} onChange={e => setSimulacao({...simulacao, mesesCriseDesemprego: e.target.value})} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ ...cardStyle, borderLeft: '4px solid #38bdf8' }}>
                <span style={labelStyle}>Saldo Final Bruto (Corretora)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8' }}>{formatMoeda(calcMotor.saldoNominal)}</div>
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Renda Passiva Mensal: <strong>{formatMoeda(calcMotor.rendaPassivaMensal)}</strong></span>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #f87171' }}>
                <span style={labelStyle}>Poder de Compra (Líquido de Inflação)</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#f87171' }}>{formatMoeda(calcMotor.saldoRealPoderCompra)}</div>
                <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>O valor real no futuro a preços de hoje.</span>
              </div>
            </div>

            {/* O Gráfico Visual Agora Aqui */}
            <div style={{...cardStyle, backgroundColor: '#020617'}}>
              <h4 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '15px' }}>📈 Gráfico de Visualização Rápida</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#e2e8f0', marginBottom: '6px' }}><span>Esforço (O seu Bolso) vs Lucro dos Juros</span></div>
                  <div style={{ width: '100%', height: '24px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${calcMotor.pctSuor}%`, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '11px', color: 'white', fontWeight: 'bold' }}>{formatPct(calcMotor.pctSuor)}</div>
                    <div style={{ width: `${calcMotor.pctJuros}%`, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '11px', color: '#022c22', fontWeight: 'bold' }}>{formatPct(calcMotor.pctJuros)} Juros</div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#e2e8f0', marginBottom: '6px' }}><span>Inflação vs Realidade</span></div>
                  <div style={{ width: '100%', height: '18px', backgroundColor: '#334155', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${calcMotor.pctPoderCompra}%`, backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '10px', color: '#451a03', fontWeight: 'bold' }}>{formatMoeda(calcMotor.saldoRealPoderCompra)} Real</div>
                    <div style={{ width: `${calcMotor.pctCorroido}%`, backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>Inflação</div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setAbaAtiva('checklist')} style={{ alignSelf: 'flex-end', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Avançar para Checklist →</button>
          </div>
        )}

        {/* ABA 3: CHECKLIST DE GASTOS */}
        {abaAtiva === 'checklist' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={boxMentorStyle}><strong>📋 Análise do Orçamento (Regra 50/30/20):</strong> Preencha os seus gastos para diagnosticar fugas de dinheiro. A regra de ouro: 50% Essencial, 30% Desejos e 20% p/ Futuro.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <h4 style={{ color: 'white', margin: '0 0 15px 0' }}>Seus Gastos Mensais</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div><label style={labelStyle}>Moradia (Aluguel, Luz, Água):</label><input type="number" style={inputStyle} value={gastos.moradia} onChange={e => setGastos({...gastos, moradia: e.target.value})} /></div>
                  <div><label style={labelStyle}>Alimentação (Mercado):</label><input type="number" style={inputStyle} value={gastos.alimentacaoMercado} onChange={e => setGastos({...gastos, alimentacaoMercado: e.target.value})} /></div>
                  <div><label style={labelStyle}>Transporte / Combustível:</label><input type="number" style={inputStyle} value={gastos.transporte} onChange={e => setGastos({...gastos, transporte: e.target.value})} /></div>
                  <div><label style={labelStyle}>Lazer e Deliveries (Ifood):</label><input type="number" style={{...inputStyle, borderColor: '#f59e0b'}} value={gastos.lazerSaidas} onChange={e => setGastos({...gastos, lazerSaidas: e.target.value})} /></div>
                  <div><label style={labelStyle}>Assinaturas (Streaming/Apps):</label><input type="number" style={{...inputStyle, borderColor: '#f59e0b'}} value={gastos.assinaturas} onChange={e => setGastos({...gastos, assinaturas: e.target.value})} /></div>
                  <div><label style={labelStyle}>Compras por Impulso (Shopee):</label><input type="number" style={{...inputStyle, borderColor: '#f59e0b'}} value={gastos.comprasImpulso} onChange={e => setGastos({...gastos, comprasImpulso: e.target.value})} /></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid #10b981' }}>
                  <span style={labelStyle}>Essencial (Ideal: até 50%)</span>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{formatMoeda(calcChecklist.essencial)} <span style={{fontSize:'14px'}}>({formatPct(calcChecklist.pctEssencial)})</span></div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #f59e0b' }}>
                  <span style={labelStyle}>Desejos & Estilo de Vida (Ideal: até 30%)</span>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' }}>{formatMoeda(calcChecklist.desejos)} <span style={{fontSize:'14px'}}>({formatPct(calcChecklist.pctDesejos)})</span></div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #38bdf8', backgroundColor: '#022c22' }}>
                  <span style={{...labelStyle, color: '#a7f3d0'}}>Aporte p/ Investimento (Ideal: +20%)</span>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8' }}>{formatMoeda(calcChecklist.poupanca)} <span style={{fontSize:'14px'}}>({formatPct(calcChecklist.pctPoupanca)})</span></div>
                </div>
              </div>
            </div>
            <button onClick={() => setAbaAtiva('previdencia')} style={{ alignSelf: 'flex-end', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Avançar para Previdência & Cortes →</button>
          </div>
        )}

        {/* ABA 4: PREVIDÊNCIA & CORTES */}
        {abaAtiva === 'previdencia' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{...boxMentorStyle, backgroundColor: '#1e3a8a', borderLeftColor: '#3b82f6', color: '#bfdbfe'}}>
              <strong>👵 Previdência Privada e Benefícios Fiscais:</strong> A Previdência Privada oferece benefícios gigantes no Imposto de Renda. Entenda a diferença entre o PGBL e VGBL e como cortar despesas para sobrar dinheiro para o seu plano.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ ...cardStyle, borderTop: '4px solid #a855f7' }}>
                <h4 style={{ color: '#a855f7', margin: '0 0 10px 0', fontSize: '16px' }}>PGBL (Plano Gerador)</h4>
                <ul style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>Ideal para:</strong> Quem faz a declaração <em>Completa</em> do Imposto de Renda.</li>
                  <li><strong>Truque de Mestre:</strong> Pode abater até 12% da sua Renda Bruta Tributável Anual. O governo devolve parte do seu imposto pago!</li>
                  <li><strong>Atenção:</strong> No resgate, o IR incide sobre o <em>Valor Total</em> (Aporte + Juros).</li>
                </ul>
              </div>
              <div style={{ ...cardStyle, borderTop: '4px solid #ec4899' }}>
                <h4 style={{ color: '#ec4899', margin: '0 0 10px 0', fontSize: '16px' }}>VGBL (Vida Gerador)</h4>
                <ul style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>Ideal para:</strong> Quem faz a declaração <em>Simplificada</em> do IR ou é isento.</li>
                  <li><strong>Vantagem:</strong> No resgate, o IR incide <strong>apenas sobre o Lucro</strong>, e não sobre o dinheiro que você aportou.</li>
                  <li>Excelente ferramenta para sucessão patrimonial (passa para herdeiros rápido).</li>
                </ul>
              </div>
            </div>
            <div style={cardStyle}>
              <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>✂️ 3 Regras para Cortar Gastos com Inteligência</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8', fontSize: '13px' }}>
                <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}><strong>1. O Teste dos 30 Dias:</strong> Se quiser comprar algo não essencial, espere 30 dias. Em 90% das vezes, o desejo passa e o dinheiro fica.</div>
                <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}><strong>2. Rodízio de Assinaturas:</strong> Cancele TODOS os streamings. Assine apenas 1 por mês. Quando terminar a série que queria, troque pelo outro no mês seguinte.</div>
                <div style={{ padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}><strong>3. Renegociação Anual de Fixos:</strong> Ligue para a operadora de internet e banco uma vez por ano exigindo cancelamento. Sempre oferecem descontos de retenção gigantes.</div>
              </div>
            </div>
            <button onClick={() => setAbaAtiva('otimizador')} style={{ alignSelf: 'flex-end', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Avançar para Analisar Extrato →</button>
          </div>
        )}

        {/* ABA 5: ANALISADOR DE EXTRATO EXPANDIDO */}
        {abaAtiva === 'otimizador' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!extratoAnalisado ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', border: '2px dashed #475569' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📥</span>
                <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Varredura Inteligente de Extrato</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Simule o upload do seu extrato. O robô vai listar os seus ralos invisíveis de dinheiro.</p>
                <button onClick={() => { setExtratoAnalisado(true); if(typeof mostrarToast === 'function') mostrarToast('Extrato analisado! Dinheiro escondido encontrado.', 'sucesso'); }} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🔍 Analisar Ralos de Dinheiro</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <div style={{...cardStyle, overflowX: 'auto'}}>
                  <h4 style={{ color: '#f87171', margin: '0 0 15px 0' }}>⚠️ Desperdícios Ocultos Localizados</h4>
                  <table style={{ width: '100%', color: '#cbd5e1', fontSize: '12.5px', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <tbody>
                      {listaDesperdicios.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '8px 0' }}>{item.desc}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(item.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '15px', color: '#f87171', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <span>Total Sugerido para Otimização:</span> <span>{formatMoeda(totalDesperdicio)} /mês</span>
                  </div>
                </div>
                <div style={{ ...cardStyle, backgroundColor: '#022c22', border: '1px solid #10b981' }}>
                  <h4 style={{ color: '#a7f3d0', margin: '0 0 15px 0' }}>💰 O Poder do Redirecionamento</h4>
                  <p style={{ color: '#6ee7b7', fontSize: '13px', lineHeight: '1.6' }}>Se cortar estas futilidades (<strong>{formatMoeda(totalDesperdicio)}/mês</strong>) e as somar ao seu Aporte Mensal no simulador, a mágica acontece:</p>
                  <div style={{ backgroundColor: '#064e3b', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                    <span style={{ fontSize: '11px', color: '#a7f3d0' }}>SEU NOVO SALDO FINAL SERÁ:</span>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: '#10b981' }}>{formatMoeda(calcOtimizado.saldoOtimizado)}</div>
                    <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold', display: 'block', marginTop: '8px' }}>
                      Lucro Extra Pelo Corte: + {formatMoeda(calcOtimizado.ganhoExtra)} 🚀
                    </span>
                  </div>
                </div>
              </div>
            )}
            <button onClick={() => setAbaAtiva('niveis')} style={{ alignSelf: 'flex-end', backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>Ver Nível de Liberdade & Gerar Relatório →</button>
          </div>
        )}

        {/* ABA 6: NÍVEIS E BOTÃO DE PDF REFORMULADO */}
        {abaAtiva === 'niveis' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...cardStyle, borderLeft: `6px solid ${calcMotor.nivelCor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h4 style={{ color: '#94a3b8', margin: '0 0 5px 0', textTransform: 'uppercase', fontSize: '12px' }}>O Seu Nível Atual de Jogo:</h4>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: calcMotor.nivelCor }}>{calcMotor.nivelEmoji} {calcMotor.nivelNome}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Renda Passiva Mensal Gerada:</span>
                  <strong style={{ fontSize: '24px', color: 'white' }}>{formatMoeda(calcMotor.rendaPassivaMensal)} /mês</strong>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                  <span>Progresso para Cobrir o seu Custo de Vida ({formatMoeda(simulacao.custoVidaMensal)})</span>
                  <strong style={{ color: calcMotor.nivelCor }}>{formatPct(calcMotor.independenciaPct)} concluído</strong>
                </div>
                <div style={{ width: '100%', height: '14px', backgroundColor: '#334155', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, calcMotor.independenciaPct)}%`, height: '100%', backgroundColor: calcMotor.nivelCor, transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
            </div>

            {/* BOTÃO EXCLUSIVO DE PDF (RELATÓRIO ESTRATÉGICO) */}
            <div style={{ display: 'flex', marginTop: '10px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
              <button onClick={imprimirRelatorioPDF} style={{ width: '100%', backgroundColor: '#10b981', color: '#0f172a', border: 'none', padding: '16px 20px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                🖨️ Gerar Relatório A4: "Plano de Educação Financeira" (PDF)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}