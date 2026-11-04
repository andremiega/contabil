import React, { useState, useEffect } from 'react';

export default function LaboratorioGamesContabeis({ mostrarToast }) {
  const [jogoAtivo, setJogoAtivo] = useState('hub'); // hub, cfo, tetris, tycoon, detetive, quiz

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ==========================================
  // JOGO 1: CFO SIMULATOR (DILEMAS)
  // ==========================================
  const dilemasIniciais = [
    {
      id: 1,
      texto: "O cliente da Fazenda Ouro Verde comprou uma caminhonete Hilux para a esposa ir ao shopping e pagou com o cartão corporativo do CAEPF. O que você faz?",
      opA: { texto: "Lançar como despesa da fazenda (Investimento).", cliente: 20, lucro: 0, risco: 40 },
      opB: { texto: "Glosar a nota e lançar como retirada de lucro/mútuo.", cliente: -30, lucro: 0, risco: -20 }
    },
    {
      id: 2,
      texto: "Um novo cliente quer te contratar pagando o triplo, mas exige que você declare R$ 1 Milhão de 'caixa 2' como venda de safra para lavar dinheiro. Você aceita?",
      opA: { texto: "Recusar o cliente e reportar ao COAF.", cliente: -10, lucro: -10, risco: -30 },
      opB: { texto: "Aceitar o dinheiro, mas avisar que é 'por conta e risco' dele.", cliente: 30, lucro: 50, risco: 80 }
    },
    {
      id: 3,
      texto: "Dia 14, véspera do eSocial. O sistema da Contmatic/Domínio caiu no país todo. Os clientes estão furiosos. O que fazer?",
      opA: { texto: "Mandar e-mail culpando a Receita Federal e o sistema.", cliente: -20, lucro: 0, risco: 10 },
      opB: { texto: "Assumir a frente, fazer plantão noturno e garantir as entregas no dia 15.", cliente: 40, lucro: -20, risco: -10 }
    }
  ];

  const [dilemas, setDilemas] = useState(dilemasIniciais);
  const [statsCFO, setStatsCFO] = useState({ cliente: 50, lucro: 50, risco: 10 });
  
  const jogarDilema = (opcao) => {
    const novosStats = {
      cliente: Math.max(0, Math.min(100, statsCFO.cliente + opcao.cliente)),
      lucro: Math.max(0, Math.min(100, statsCFO.lucro + opcao.lucro)),
      risco: Math.max(0, Math.min(100, statsCFO.risco + opcao.risco))
    };
    setStatsCFO(novosStats);
    
    if (novosStats.risco >= 100) {
      dispararToast('GAME OVER! A Polícia Federal bateu no seu escritório.', 'erro');
      setJogoAtivo('hub');
    } else if (novosStats.cliente <= 0 || novosStats.lucro <= 0) {
      dispararToast('GAME OVER! Você faliu seu escritório.', 'erro');
      setJogoAtivo('hub');
    } else {
      const novosDilemas = [...dilemas];
      novosDilemas.shift();
      if (novosDilemas.length === 0) {
        dispararToast('PARABÉNS! Você sobreviveu ao fechamento do mês!', 'sucesso');
        setJogoAtivo('hub');
      } else {
        setDilemas(novosDilemas);
      }
    }
  };

  // ==========================================
  // JOGO 2: TETRIS DAS PARTIDAS DOBRADAS
  // ==========================================
  const fatosContabeis = [
    { id: 1, fato: "Compra de Trator à Vista", deb: "Ativo Imobilizado", cred: "Ativo Circulante (Caixa)" },
    { id: 2, fato: "Pagamento de Salários (Folha)", deb: "Despesa (Resultado)", cred: "Ativo Circulante (Caixa)" },
    { id: 3, fato: "Venda de Safra a Prazo", deb: "Ativo Circulante (Clientes)", cred: "Receita (Resultado)" },
    { id: 4, fato: "Apropriação de Custo da Semente na Lavoura", deb: "Ativo Biológico (Formação)", cred: "Ativo Circulante (Estoque)" }
  ];
  const opcoesContas = ["Ativo Circulante (Caixa)", "Ativo Circulante (Clientes)", "Ativo Circulante (Estoque)", "Ativo Biológico (Formação)", "Ativo Imobilizado", "Passivo Circulante (Fornecedor)", "Receita (Resultado)", "Despesa (Resultado)"];
  
  const [fatoAtual, setFatoAtual] = useState(0);
  const [escolhaDebito, setEscolhaDebito] = useState('');
  const [escolhaCredito, setEscolhaCredito] = useState('');
  const [pontosTetris, setPontosTetris] = useState(0);

  const validarPartida = () => {
    if (escolhaDebito === fatosContabeis[fatoAtual].deb && escolhaCredito === fatosContabeis[fatoAtual].cred) {
      setPontosTetris(pontosTetris + 100);
      dispararToast('Lançamento Perfeito! Balanço fechou.', 'sucesso');
    } else {
      setPontosTetris(pontosTetris - 50);
      dispararToast(`Erro! Correto seria D: ${fatosContabeis[fatoAtual].deb} / C: ${fatosContabeis[fatoAtual].cred}`, 'erro');
    }
    setEscolhaDebito(''); setEscolhaCredito('');
    if (fatoAtual + 1 < fatosContabeis.length) {
      setFatoAtual(fatoAtual + 1);
    } else {
      dispararToast(`Fim de Jogo! Pontuação: ${pontosTetris}`, 'info');
      setJogoAtivo('hub');
    }
  };

  // ==========================================
  // JOGO 3: OFFICE TYCOON
  // ==========================================
  const [diaTycoon, setDiaTycoon] = useState(1);
  const [caixaTycoon, setCaixaTycoon] = useState(5000);
  const [tarefasTycoon, setTarefasTycoon] = useState([
    { id: 1, nome: "Folha de Pagamento", prazo: 7, recompensa: 1000, feita: false },
    { id: 2, nome: "SPED Fiscal", prazo: 15, recompensa: 1500, feita: false },
    { id: 3, nome: "DAS Simples Nacional", prazo: 20, recompensa: 800, feita: false }
  ]);

  const avancarDia = () => {
    const novoDia = diaTycoon + 1;
    setDiaTycoon(novoDia);
    let multa = 0;
    tarefasTycoon.forEach(t => {
      if (!t.feita && novoDia > t.prazo) {
        multa += 500;
        dispararToast(`Multa gerada! Atraso no envio do ${t.nome}`, 'erro');
      }
    });
    setCaixaTycoon(caixaTycoon - multa);
    if (caixaTycoon - multa <= 0) {
      dispararToast('Seu escritório faliu devido às multas do Fisco!', 'erro');
      setJogoAtivo('hub');
    }
  };

  const fazerTarefa = (id) => {
    const novasTarefas = tarefasTycoon.map(t => {
      if (t.id === id && !t.feita && diaTycoon <= t.prazo) {
        setCaixaTycoon(caixaTycoon + t.recompensa);
        dispararToast(`Honorário recebido! +R$ ${t.recompensa}`, 'sucesso');
        return { ...t, feita: true };
      }
      return t;
    });
    setTarefasTycoon(novasTarefas);
  };

  // ==========================================
  // JOGO 4: DETETIVE FISCAL (MALHA FINA)
  // ==========================================
  const [docsDetetive, setDocsDetetive] = useState([
    {
      id: 1, 
      contexto: "Livro Caixa Digital da PF (LCDPR) de Março.",
      itens: [
        { desc: "Pagamento Adubo NPK - NF 555 (Fornecedor Agrícola)", ilegal: false },
        { desc: "Manutenção Colheitadeira - NF 222 (Oficina)", ilegal: false },
        { desc: "Pagamento Colégio Internacional (Filhos) - Boleto", ilegal: true }
      ]
    },
    {
      id: 2, 
      contexto: "Análise de Despesas na DRE (Lucro Real).",
      itens: [
        { desc: "Depreciação de Máquinas do Parque Fabril", ilegal: false },
        { desc: "Provisão de 13º Salário e Férias", ilegal: false },
        { desc: "Multa de Trânsito do Diretor e Multa de Atraso de PIS", ilegal: true }
      ]
    }
  ]);
  const [docAtualDetetive, setDocAtualDetetive] = useState(0);

  const investigarItem = (ilegal) => {
    if (ilegal) {
      dispararToast('Malha Fina evitada! Você glosou a despesa indedutível.', 'sucesso');
      if (docAtualDetetive + 1 < docsDetetive.length) {
        setDocAtualDetetive(docAtualDetetive + 1);
      } else {
        dispararToast('Você é o mestre da auditoria!', 'sucesso');
        setJogoAtivo('hub');
      }
    } else {
      dispararToast('Erro de Auditoria! Você glosou uma despesa lícita e causou prejuízo tributário.', 'erro');
    }
  };

  // ==========================================
  // JOGO 5: ROLETA DOS TRIBUTOS
  // ==========================================
  const perguntasRoleta = [
    { p: "Qual o princípio contábil que obriga o registro do fato gerador na data em que ocorreu, independente do pagamento?", resp: "Competência", erradas: ["Caixa", "Prudência", "Entidade"] },
    { p: "Qual a alíquota base do Lucro Presumido para presunção de lucro em prestação de serviços (regra geral)?", resp: "32%", erradas: ["8%", "16%", "15%"] },
    { p: "No Balanço Patrimonial, onde as obrigações com prazo de vencimento superior a um ano são classificadas?", resp: "Passivo Não Circulante", erradas: ["Passivo Circulante", "Ativo Realizável a Longo Prazo", "Patrimônio Líquido"] }
  ];
  const [perguntaRoletaAtual, setPerguntaRoletaAtual] = useState(0);
  const [premioRoleta, setPremioRoleta] = useState(1000);

  const responderRoleta = (isCorreta) => {
    if (isCorreta) {
      setPremioRoleta(premioRoleta * 2);
      dispararToast('Exato! Prêmio Dobrado.', 'sucesso');
      if (perguntaRoletaAtual + 1 < perguntasRoleta.length) {
        setPerguntaRoletaAtual(perguntaRoletaAtual + 1);
      } else {
        dispararToast(`Você ganhou o Show do Contador! Prêmio: R$ ${premioRoleta * 2}`, 'sucesso');
        setJogoAtivo('hub');
      }
    } else {
      dispararToast('Errou! Você perdeu tudo e chamou o Fisco.', 'erro');
      setJogoAtivo('hub');
    }
  };


  // ==========================================
  // REINICIAR ESTADOS AO VOLTAR PRO HUB
  // ==========================================
  const voltarAoFliperama = () => {
    setDilemas(dilemasIniciais);
    setStatsCFO({ cliente: 50, lucro: 50, risco: 10 });
    setFatoAtual(0); setPontosTetris(0);
    setDiaTycoon(1); setCaixaTycoon(5000); setTarefasTycoon([{ id: 1, nome: "Folha de Pagamento", prazo: 7, recompensa: 1000, feita: false }, { id: 2, nome: "SPED Fiscal", prazo: 15, recompensa: 1500, feita: false }, { id: 3, nome: "DAS Simples Nacional", prazo: 20, recompensa: 800, feita: false }]);
    setDocAtualDetetive(0);
    setPerguntaRoletaAtual(0); setPremioRoleta(1000);
    setJogoAtivo('hub');
  };


  // ==========================================
  // ESTILOS GERAIS
  // ==========================================
  const bgEscuro = '#020617'; const bgCard = '#0f172a'; const borderC = '#1e293b';
  const textoMain = '#f8fafc'; const textoSec = '#94a3b8';
  const corA = '#10b981'; const corB = '#38bdf8'; const corC = '#f59e0b'; const corD = '#a855f7'; const corE = '#ef4444';

  const containerStyle = { backgroundColor: bgEscuro, color: textoMain, fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' };
  const navStyle = { backgroundColor: '#000', padding: '16px 24px', borderBottom: `2px solid ${borderC}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const contentStyle = { flex: 1, padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
  
  const gameCard = { backgroundColor: bgCard, border: `1px solid ${borderC}`, borderRadius: '16px', padding: '24px', transition: 'transform 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' };
  const btnGame = { padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' };
  
  const barraStats = (valor, cor) => ({ width: '100%', backgroundColor: bgEscuro, height: '12px', borderRadius: '6px', overflow: 'hidden' });
  const preenchimentoStats = (valor, cor) => ({ width: `${valor}%`, backgroundColor: cor, height: '100%', transition: 'width 0.3s' });

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div style={containerStyle}>
      <div style={navStyle}>
        <div>
          <span style={{ backgroundColor: corA, color: bgEscuro, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>ARCADE CONTÁBIL</span>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '20px' }}>🕹️ Gamificação em Finanças</h2>
        </div>
        {jogoAtivo !== 'hub' && (
          <button onClick={voltarAoFliperama} style={{ backgroundColor: 'transparent', border: `1px solid ${corE}`, color: corE, padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            🔙 Sair do Jogo (Voltar)
          </button>
        )}
      </div>

      <div style={contentStyle}>
        
        {/* ==================================== HUB (SELEÇÃO DE JOGOS) ==================================== */}
        {jogoAtivo === 'hub' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '10px' }}>Escolha o seu Desafio</h2>
            <p style={{ textAlign: 'center', color: textoSec, marginBottom: '40px' }}>Aprenda contabilidade, finanças e legislação tomando decisões sob pressão.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              
              <div style={{...gameCard, borderTop: `4px solid ${corA}`}} onClick={() => setJogoAtivo('cfo')}>
                <div style={{ fontSize: '40px' }}>⚖️</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: corA }}>CFO Simulator</h3>
                <p style={{ fontSize: '13px', color: textoSec, lineHeight: '1.5', flex: 1 }}>Sobreviva à corda bamba do escritório. Tome decisões rápidas em dilemas éticos que afetam a satisfação do cliente, o lucro e o risco de malha fina (Estilo Tinder/Reigns).</p>
                <button style={{...btnGame, backgroundColor: corA, color: bgEscuro}}>Jogar CFO</button>
              </div>

              <div style={{...gameCard, borderTop: `4px solid ${corB}`}} onClick={() => setJogoAtivo('tetris')}>
                <div style={{ fontSize: '40px' }}>🧩</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: corB }}>Partidas Dobradas (Arcade)</h3>
                <p style={{ fontSize: '13px', color: textoSec, lineHeight: '1.5', flex: 1 }}>O método das partidas dobradas sob pressão. Assuma a origem (crédito) e o destino (débito) de fatos contábeis reais para não deixar o balanço torto.</p>
                <button style={{...btnGame, backgroundColor: corB, color: bgEscuro}}>Jogar Débito & Crédito</button>
              </div>

              <div style={{...gameCard, borderTop: `4px solid ${corC}`}} onClick={() => setJogoAtivo('tycoon')}>
                <div style={{ fontSize: '40px' }}>🏢</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: corC }}>Office Tycoon</h3>
                <p style={{ fontSize: '13px', color: textoSec, lineHeight: '1.5', flex: 1 }}>Simulador de gestão de recursos e prazos. Entregue o SPED, a Folha e os Impostos antes que o calendário vire, senão as multas irão falir o seu negócio.</p>
                <button style={{...btnGame, backgroundColor: corC, color: bgEscuro}}>Jogar Tycoon</button>
              </div>

              <div style={{...gameCard, borderTop: `4px solid ${corD}`}} onClick={() => setJogoAtivo('detetive')}>
                <div style={{ fontSize: '40px' }}>🕵️</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: corD }}>O Detetive Fiscal</h3>
                <p style={{ fontSize: '13px', color: textoSec, lineHeight: '1.5', flex: 1 }}>Treine os seus olhos de auditor. Vasculhe livros caixas (LCDPR) e Demonstrações Financeiras para encontrar despesas ilegais que não são dedutíveis.</p>
                <button style={{...btnGame, backgroundColor: corD, color: bgEscuro}}>Jogar Detetive</button>
              </div>

              <div style={{...gameCard, borderTop: `4px solid ${corE}`}} onClick={() => setJogoAtivo('quiz')}>
                <div style={{ fontSize: '40px' }}>🎰</div>
                <h3 style={{ margin: 0, fontSize: '18px', color: corE }}>Roleta dos Tributos</h3>
                <p style={{ fontSize: '13px', color: textoSec, lineHeight: '1.5', flex: 1 }}>Um quiz show de alto risco focado em legislação pesada, DRE e Balanço. Responda certo para dobrar os honorários, ou erre e perca tudo para a Receita.</p>
                <button style={{...btnGame, backgroundColor: corE, color: bgEscuro}}>Girar a Roleta</button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== JOGO 1: CFO SIMULATOR ==================================== */}
        {jogoAtivo === 'cfo' && dilemas.length > 0 && (
          <div style={{ animation: 'fadeIn 0.5s', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ backgroundColor: bgCard, padding: '20px', borderRadius: '16px', border: `1px solid ${borderC}`, marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>📊 Status do Escritório</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}><span>😊 Satisfação do Cliente</span><span>{statsCFO.cliente}%</span></div>
                  <div style={barraStats()}><div style={preenchimentoStats(statsCFO.cliente, corB)}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}><span>💰 Lucro / Caixa</span><span>{statsCFO.lucro}%</span></div>
                  <div style={barraStats()}><div style={preenchimentoStats(statsCFO.lucro, corA)}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}><span>⚖️ Risco Fisco (Malha Fina)</span><span style={{ color: corE }}>{statsCFO.risco}%</span></div>
                  <div style={barraStats()}><div style={preenchimentoStats(statsCFO.risco, corE)}></div></div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '40px 30px', borderRadius: '24px', border: `2px solid ${corA}`, textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📨</div>
              <h2 style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>{dilemas[0].texto}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={() => jogarDilema(dilemas[0].opA)} style={{ ...btnGame, backgroundColor: '#334155', color: textoMain, border: `1px solid ${borderC}` }}>{dilemas[0].opA.texto}</button>
                <button onClick={() => jogarDilema(dilemas[0].opB)} style={{ ...btnGame, backgroundColor: '#334155', color: textoMain, border: `1px solid ${borderC}` }}>{dilemas[0].opB.texto}</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== JOGO 2: TETRIS PARTIDAS ==================================== */}
        {jogoAtivo === 'tetris' && (
          <div style={{ animation: 'fadeIn 0.5s', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: corB, marginBottom: '20px' }}>Pontuação: {pontosTetris}</div>
            
            <div style={{ backgroundColor: bgCard, padding: '40px', borderRadius: '16px', border: `1px dashed ${corB}`, marginBottom: '30px' }}>
              <h4 style={{ color: textoSec, textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>Fato Contábil</h4>
              <h2 style={{ fontSize: '28px', margin: 0, color: textoMain }}>{fatosContabeis[fatoAtual].fato}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#1e3a8a', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ color: '#93c5fd', margin: '0 0 15px 0' }}>DÉBITO (Destino)</h3>
                <select value={escolhaDebito} onChange={e => setEscolhaDebito(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#1e40af', color: 'white', border: 'none', outline: 'none' }}>
                  <option value="">Selecione a Conta...</option>
                  {opcoesContas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div style={{ backgroundColor: '#78350f', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ color: '#fcd34d', margin: '0 0 15px 0' }}>CRÉDITO (Origem)</h3>
                <select value={escolhaCredito} onChange={e => setEscolhaCredito(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#92400e', color: 'white', border: 'none', outline: 'none' }}>
                  <option value="">Selecione a Conta...</option>
                  {opcoesContas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button onClick={validarPartida} style={{ ...btnGame, backgroundColor: corA, color: bgEscuro, width: '100%', padding: '16px', fontSize: '18px' }}>
              Validar Lançamento (Registrar Diário)
            </button>
          </div>
        )}

        {/* ==================================== JOGO 3: OFFICE TYCOON ==================================== */}
        {jogoAtivo === 'tycoon' && (
          <div style={{ animation: 'fadeIn 0.5s', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: bgCard, padding: '20px', borderRadius: '12px', border: `1px solid ${borderC}`, marginBottom: '20px' }}>
              <div>
                <span style={{ color: textoSec, fontSize: '12px', textTransform: 'uppercase' }}>Caixa do Escritório</span>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: corA }}>{formatMoeda(caixaTycoon)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: textoSec, fontSize: '12px', textTransform: 'uppercase' }}>Calendário Fiscal</span>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: corB }}>Dia {diaTycoon}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Obrigações e Tarefas Pendentes</h3>
              <button onClick={avancarDia} style={{ backgroundColor: corC, color: bgEscuro, border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Avancar 1 Dia ⏳</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {tarefasTycoon.map(t => (
                <div key={t.id} style={{ backgroundColor: t.feita ? '#022c22' : bgCard, padding: '20px', borderRadius: '12px', border: `1px solid ${t.feita ? corA : borderC}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: t.feita ? corA : textoMain, textDecoration: t.feita ? 'line-through' : 'none' }}>{t.nome}</h4>
                    <span style={{ fontSize: '12px', color: diaTycoon > t.prazo && !t.feita ? corE : textoSec }}>
                      Vencimento: Dia {t.prazo} {diaTycoon > t.prazo && !t.feita && ' (ATRASADO - GERANDO MULTA!)'}
                    </span>
                  </div>
                  <button 
                    onClick={() => fazerTarefa(t.id)} 
                    disabled={t.feita || diaTycoon > t.prazo}
                    style={{ backgroundColor: t.feita ? 'transparent' : corB, color: t.feita ? corA : bgEscuro, border: t.feita ? `1px solid ${corA}` : 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: t.feita || diaTycoon > t.prazo ? 'not-allowed' : 'pointer' }}
                  >
                    {t.feita ? 'Concluído' : diaTycoon > t.prazo ? 'Perdido' : `Trabalhar (+R$ ${t.recompensa})`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================== JOGO 4: DETETIVE FISCAL ==================================== */}
        {jogoAtivo === 'detetive' && (
          <div style={{ animation: 'fadeIn 0.5s', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: corD, marginBottom: '5px' }}>Auditoria em Andamento</h2>
            <p style={{ textAlign: 'center', color: textoSec, marginBottom: '30px' }}>Identifique qual das operações abaixo é ILEGAL ou INDEDUTÍVEL neste contexto.</p>

            <div style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '16px', border: `1px solid ${corD}` }}>
              <div style={{ backgroundColor: '#4c1d95', color: '#ddd6fe', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>
                Contexto: {docsDetetive[docAtualDetetive].contexto}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {docsDetetive[docAtualDetetive].itens.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => investigarItem(item.ilegal)}
                    style={{ backgroundColor: bgEscuro, color: textoMain, border: `1px solid ${borderC}`, padding: '16px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'border 0.2s' }}
                    onMouseEnter={(e) => e.target.style.border = `1px solid ${corD}`}
                    onMouseLeave={(e) => e.target.style.border = `1px solid ${borderC}`}
                  >
                    🔍 {item.desc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================== JOGO 5: ROLETA DOS TRIBUTOS ==================================== */}
        {jogoAtivo === 'quiz' && (
          <div style={{ animation: 'fadeIn 0.5s', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#7f1d1d', padding: '10px 20px', borderRadius: '20px', display: 'inline-block', color: '#fca5a5', fontWeight: 'bold', marginBottom: '30px', border: '2px solid #ef4444' }}>
              PRÊMIO ACUMULADO: {formatMoeda(premioRoleta)}
            </div>

            <div style={{ backgroundColor: bgCard, padding: '40px', borderRadius: '16px', border: `1px solid ${corE}`, marginBottom: '30px' }}>
              <h2 style={{ margin: '0 0 30px 0', fontSize: '22px', lineHeight: '1.5' }}>{perguntasRoleta[perguntaRoletaAtual].p}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {/* Embaralhar de forma super simples apenas para o React não reclamar e funcionar o jogo. Num app real usaríamos um algoritmo de Fisher-Yates no estado. */}
                {[perguntasRoleta[perguntaRoletaAtual].resp, ...perguntasRoleta[perguntaRoletaAtual].erradas].sort().map((opcao, idx) => (
                  <button 
                    key={idx}
                    onClick={() => responderRoleta(opcao === perguntasRoleta[perguntaRoletaAtual].resp)}
                    style={{ backgroundColor: '#1e293b', color: textoMain, border: `1px solid ${borderC}`, padding: '16px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}