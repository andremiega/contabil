import React, { useState, useEffect } from 'react';

export default function SimuladorMotorMissoes() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ABAS: 'trilhas', 'arena', 'crises'
  const [abaAtiva, setAbaAtiva] = useState('trilhas');

  // Estado do Aluno / Jogador
  const [perfil, setPerfil] = useState({
    nivel: 'Controller Sênior (Nível 3)',
    xp: 950,
    proximoNivelXP: 2500,
    concluidas: 4
  });

  // Plano de Contas Completo para a Arena
  const contasDisponiveis = [
    { codigo: '1.1.01.02', nome: 'Banco Conta Movimento (Ativo Circulante)' },
    { codigo: '1.1.02.01', nome: 'Clientes a Receber (Ativo Circulante)' },
    { codigo: '1.1.03.01', nome: 'Estoque de Mercadorias (Ativo Circulante)' },
    { codigo: '1.2.03.01', nome: 'Máquinas e Equipamentos (Ativo Não Circulante)' },
    { codigo: '1.2.03.09', nome: '(-) Depreciação Acumulada (Ativo Redutora)' },
    { codigo: '2.1.01.01', nome: 'Fornecedores Nacionais (Passivo Circulante)' },
    { codigo: '2.1.02.01', nome: 'Salários e Encargos a Pagar (Passivo Circulante)' },
    { codigo: '2.1.04.01', nome: 'Empréstimos Bancários a Pagar (Passivo Circulante)' },
    { codigo: '3.1.01.01', nome: 'Capital Social Subscrito (Patrimônio Líquido)' },
    { codigo: '3.1.01.02', nome: '(-) Capital a Integralizar (PL Redutora)' },
    { codigo: '4.1.01.01', nome: 'Receita Bruta de Vendas (DRE - Receitas)' },
    { codigo: '5.1.01.01', nome: 'CPV - Custo dos Produtos Vendidos (DRE - Custos)' },
    { codigo: '5.2.01.01', nome: 'Despesas com Salários (DRE - Despesas)' },
    { codigo: '5.2.02.01', nome: 'Despesas com Depreciação (DRE - Despesas)' },
    { codigo: '5.2.03.01', nome: 'Despesas com Aluguéis (DRE - Despesas)' },
    { codigo: '5.2.04.01', nome: 'Despesas com Energia Elétrica (DRE - Despesas)' }
  ];

  // ==========================================================
  // 10 MISSÕES CONTÁBEIS PADRÃO COMPLETA
  // ==========================================================
  const [missoes, setMissoes] = useState([
    { id: 'MS-01', trilha: 'Societário', titulo: 'Subscrição de Capital', dificuldade: 'Iniciante', xp: 150, enunciado: 'Constituição com Capital Social subscrito de R$ 100.000, 50% integralizados em Banco e o restante a integralizar.', gabaritoDebito: '3.1.01.02', gabaritoCredito: '3.1.01.01', valorExigido: 50000, status: 'concluido', explicacao: 'Capital subscrito creditado no PL. A parte a integralizar é debitada na redutora do PL.' },
    { id: 'MS-02', trilha: 'Ativo Imobilizado', titulo: 'Compra de Máquina à Vista', dificuldade: 'Intermediário', xp: 200, enunciado: 'Aquisição de Centro de Usinagem por R$ 180.000, quitado via TED bancária.', gabaritoDebito: '1.2.03.01', gabaritoCredito: '1.1.01.02', valorExigido: 180000, status: 'concluido', explicacao: 'Aumenta o Imobilizado (Débito) e reduz Banco (Crédito).' },
    { id: 'MS-03', trilha: 'Folha Pagamento', titulo: 'Provisão de Salários', dificuldade: 'Intermediário', xp: 250, enunciado: 'Provisão da folha do mês (R$ 45.000) a ser paga no mês seguinte.', gabaritoDebito: '5.2.01.01', gabaritoCredito: '2.1.02.01', valorExigido: 45000, status: 'concluido', explicacao: 'Despesa no resultado (Débito) contra Passivo (Crédito).' },
    { id: 'MS-04', trilha: 'Vendas', titulo: 'Faturamento a Prazo', dificuldade: 'Intermediário', xp: 250, enunciado: 'Venda de mercadorias a prazo no valor de R$ 35.000.', gabaritoDebito: '1.1.02.01', gabaritoCredito: '4.1.01.01', valorExigido: 35000, status: 'disponivel', explicacao: 'Gera direito a receber (Débito) e reconhece Receita (Crédito).' },
    { id: 'MS-05', trilha: 'Compras', titulo: 'Aquisição de Estoque', dificuldade: 'Intermediário', xp: 200, enunciado: 'Compra de estoque por R$ 28.000, pagamento para 30 dias.', gabaritoDebito: '1.1.03.01', gabaritoCredito: '2.1.01.01', valorExigido: 28000, status: 'disponivel', explicacao: 'Aumenta estoque (Débito) e gera obrigação com Fornecedores (Crédito).' },
    { id: 'MS-06', trilha: 'Tesouraria', titulo: 'Empréstimo Bancário', dificuldade: 'Avançado', xp: 350, enunciado: 'Contratação de R$ 120.000 de capital de giro creditado em conta.', gabaritoDebito: '1.1.01.02', gabaritoCredito: '2.1.04.01', valorExigido: 120000, status: 'disponivel', explicacao: 'Ingresso em banco (Débito) e constituição de passivo financeiro (Crédito).' },
    { id: 'MS-07', trilha: 'Depreciação', titulo: 'Apropriação Mensal (CPC 27)', dificuldade: 'Intermediário', xp: 250, enunciado: 'Reconhecimento da quota mensal de depreciação do maquinário no valor de R$ 3.500.', gabaritoDebito: '5.2.02.01', gabaritoCredito: '1.2.03.09', valorExigido: 3500, status: 'disponivel', explicacao: 'Despesa na DRE (Débito) contra a conta redutora do Imobilizado (Crédito).' },
    { id: 'MS-08', trilha: 'Despesas', titulo: 'Pagamento de Energia Elétrica', dificuldade: 'Iniciante', xp: 150, enunciado: 'Quitada a fatura de energia de R$ 4.200 via débito em conta.', gabaritoDebito: '5.2.04.01', gabaritoCredito: '1.1.01.02', valorExigido: 4200, status: 'disponivel', explicacao: 'Despesa (Débito) com saída de Banco (Crédito).' },
    { id: 'MS-09', trilha: 'Despesas', titulo: 'Provisão de Aluguel', dificuldade: 'Iniciante', xp: 180, enunciado: 'Reconhecido o aluguel mensal de R$ 9.500 para pagamento futuro.', gabaritoDebito: '5.2.03.01', gabaritoCredito: '2.1.01.01', valorExigido: 9500, status: 'disponivel', explicacao: 'Despesa (Débito) gerando passivo de curto prazo (Crédito em Fornecedores/A pagar).' },
    { id: 'MS-10', trilha: 'Custos', titulo: 'Baixa do CPV', dificuldade: 'Avançado', xp: 400, enunciado: 'Baixa do custo dos produtos vendidos (CPV) referente às mercadorias entregues (R$ 16.000).', gabaritoDebito: '5.1.01.01', gabaritoCredito: '1.1.03.01', valorExigido: 16000, status: 'disponivel', explicacao: 'Débito em Custo (DRE) e crédito na conta de Estoques (Ativo).' }
  ]);

  const [missaoAtiva, setMissaoAtiva] = useState(null);
  const [inputDebito, setInputDebito] = useState(contasDisponiveis[0].codigo);
  const [inputCredito, setInputCredito] = useState(contasDisponiveis[5].codigo);
  const [inputValorStr, setInputValorStr] = useState('');
  const [resultadoTentativa, setResultadoTentativa] = useState(null);

  const abrirMissao = (missao) => {
    setMissaoAtiva(missao);
    setInputValorStr(missao.valorExigido.toString());
    setResultadoTentativa(null);
    setAbaAtiva('arena');
  };

  const validarLancamento = (e) => {
    e.preventDefault();
    const valorInformado = parseFloat(inputValorStr) || 0;
    if (Math.abs(valorInformado - missaoAtiva.valorExigido) > 0.01) return setResultadoTentativa('erro');

    if (inputDebito.includes(missaoAtiva.gabaritoDebito.substring(0, 9)) && inputCredito.includes(missaoAtiva.gabaritoCredito.substring(0, 9))) {
      setResultadoTentativa('sucesso');
      setPerfil(p => ({ ...p, xp: p.xp + missaoAtiva.xp, concluidas: p.concluidas + 1 }));
      setMissoes(missoes.map(m => m.id === missaoAtiva.id ? { ...m, status: 'concluido' } : m));
    } else {
      setResultadoTentativa('erro');
    }
  };

  // ==========================================================
  // MODO CRISE: 6 EMERGÊNCIAS CONTÁBEIS
  // ==========================================================
  const crisesLista = [
    {
      id: 'crise-01', icone: '💥', titulo: 'Briga de Sócios (Ruptura Societária)',
      descricao: 'Os sócios brigaram e exigem um Balanço de Determinação a valor de mercado para separar a empresa agora.',
      instrucao: 'O Livro mostra Imóveis por R$ 200.000 e Estoque por R$ 50.000. O laudo diz que os Imóveis valem R$ 500.000 e o Estoque está obsoleto, valendo apenas R$ 30.000. Ajuste os valores exatos a mercado!',
      tempoMaximo: 90, xp: 500, tipo: 'balanco_determinacao'
    },
    {
      id: 'crise-02', icone: '💻', titulo: 'Ataque Hacker (Ransomware)',
      descricao: 'O servidor foi criptografado! Reconstrua a contabilidade com as pistas que restaram.',
      instrucao: 'Você só tem uma anotação em papel: "Paguei o Fornecedor Nacional Silva hoje de manhã via PIX". Reconstrua essa partida dobrada AGORA antes que o caixa fique furado!',
      tempoMaximo: 120, xp: 800, tipo: 'ransomware'
    },
    {
      id: 'crise-03', icone: '🔥', titulo: 'O Backup Corrompido',
      descricao: 'O sistema apagou as classificações das contas! Restaure a lógica base no teste de digitação.',
      instrucao: 'Rápido, classifique a conta abaixo corretamente apertando o botão certo! Você precisa acertar 3 seguidas para recuperar o banco de dados!',
      tempoMaximo: 60, xp: 600, tipo: 'backup'
    },
    {
      id: 'crise-04', icone: '🕵️', titulo: 'Auditoria da Receita Federal',
      descricao: 'A Receita bloqueou as contas por um depósito não justificado de R$ 50.000.',
      instrucao: 'O sócio depositou R$ 50.000 na conta (Banco) e não avisou. A Receita exige a origem. Classifique a entrada no banco creditando a conta correta (Capital a Integralizar - Redutora do PL).',
      tempoMaximo: 80, xp: 700, tipo: 'receita_federal'
    },
    {
      id: 'crise-05', icone: '🦹', titulo: 'Desfalque no Caixa (Fraude)',
      descricao: 'Foi detectado um rombo de R$ 15.000 no caixa físico da tesouraria!',
      instrucao: 'A auditoria externa chega amanhã. Reconheça a perda do desfalque imediatamente como despesa contra o banco/caixa (Origem) para ajustar o balanço e assumir o prejuízo.',
      tempoMaximo: 60, xp: 650, tipo: 'fraude'
    },
    {
      id: 'crise-06', icone: '💸', titulo: 'Erro Fatal na Folha',
      descricao: 'O sistema enlouqueceu e pagou a folha de salários em duplicidade!',
      instrucao: 'O banco detectou a duplicidade e estornou o valor. Faça o lançamento de estorno: dê entrada no Banco, revertendo/creditando a Despesa com Salários.',
      tempoMaximo: 70, xp: 750, tipo: 'estorno_folha'
    }
  ];

  const [criseAtiva, setCriseAtiva] = useState(null);
  const [faseCrise, setFaseCrise] = useState('intro'); // 'intro', 'jogando', 'sucesso', 'gameover'
  const [tempoRestante, setTempoRestante] = useState(0);

  // Estados dos Mini-games da Crise
  const [mg1Imovel, setMg1Imovel] = useState('');
  const [mg1Estoque, setMg1Estoque] = useState('');
  const [mgSelectD, setMgSelectD] = useState(contasDisponiveis[0].codigo);
  const [mgSelectC, setMgSelectC] = useState(contasDisponiveis[5].codigo);
  const [mg3QtdCerta, setMg3QtdCerta] = useState(0);

  // INICIA A CRISE E O CRONÔMETRO
  const iniciarCrise = (crise) => {
    setCriseAtiva(crise);
    setAbaAtiva('crises');
    setTempoRestante(crise.tempoMaximo);
    setFaseCrise('jogando');
    // Reseta todos os campos
    setMg1Imovel(''); setMg1Estoque('');
    setMgSelectD(contasDisponiveis[0].codigo); setMgSelectC(contasDisponiveis[5].codigo);
    setMg3QtdCerta(0);
  };

  useEffect(() => {
    if (faseCrise === 'jogando' && tempoRestante > 0) {
      const timer = setTimeout(() => setTempoRestante(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tempoRestante === 0 && faseCrise === 'jogando') {
      setFaseCrise('gameover');
    }
  }, [tempoRestante, faseCrise]);

  const validarMiniGame = () => {
    let venceu = false;
    
    if (criseAtiva.tipo === 'balanco_determinacao') {
      if (mg1Imovel === '500000' && mg1Estoque === '30000') venceu = true;
    } else if (criseAtiva.tipo === 'ransomware') {
      if (mgSelectD.includes('2.1.01.01') && mgSelectC.includes('1.1.01.02')) venceu = true;
    } else if (criseAtiva.tipo === 'receita_federal') {
      if (mgSelectD.includes('1.1.01.02') && mgSelectC.includes('3.1.01.02')) venceu = true;
    } else if (criseAtiva.tipo === 'fraude') {
      if (mgSelectD.includes('5.2') && mgSelectC.includes('1.1.01.02')) venceu = true;
    } else if (criseAtiva.tipo === 'estorno_folha') {
      if (mgSelectD.includes('1.1.01.02') && mgSelectC.includes('5.2.01.01')) venceu = true;
    } else if (criseAtiva.tipo === 'backup') {
      if (mg3QtdCerta >= 3) venceu = true;
    }

    if (venceu) {
      setFaseCrise('sucesso');
      setPerfil(p => ({ ...p, xp: p.xp + criseAtiva.xp }));
    } else {
      alert("Resposta Incorreta! O tempo continua correndo!");
    }
  };

  const nivelPanicoPct = criseAtiva && faseCrise === 'jogando' 
    ? ((criseAtiva.tempoMaximo - tempoRestante) / criseAtiva.tempoMaximo) * 100 
    : 0;

  const btnAbaBase = { padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' };
  
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* CSS para Efeitos de Crise */}
      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .crisis-active { animation: pulse-red 1.5s infinite; border: 2px solid #ef4444 !important; background-color: #fff5f5 !important; }
        .crisis-header { background: linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%) !important; }
      `}</style>

      {/* CABEÇALHO & XP */}
      <div style={{ backgroundColor: faseCrise === 'jogando' ? '#7f1d1d' : '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '15px', transition: 'background-color 0.5s' }} className={faseCrise === 'jogando' ? 'crisis-header' : ''}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ backgroundColor: faseCrise === 'jogando' ? '#fca5a5' : '#3b82f6', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900' }}>
              {faseCrise === 'jogando' ? '🚨 MODO SOBREVIVÊNCIA' : 'SISTEMA DE TREINAMENTO'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Arena de Missões Contábeis</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Resolva os desafios práticos, acumule XP e evolua na carreira.</div>
        </div>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>{perfil.nivel}</span>
            <strong style={{ fontSize: '15px', color: '#ffffff' }}>{perfil.xp} / {perfil.proximoNivelXP} XP</strong>
          </div>
          <div style={{ backgroundColor: '#10b981', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#022c22' }}>
            🏆 {perfil.concluidas} Missões
          </div>
        </div>
      </div>

      {/* ABAS NAVEGAÇÃO */}
      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => {setAbaAtiva('trilhas'); setFaseCrise('intro');}} style={{ ...btnAbaBase, backgroundColor: abaAtiva === 'trilhas' ? '#0f172a' : 'transparent', color: abaAtiva === 'trilhas' ? 'white' : '#64748b' }}>
          🗺️ Trilha Padrão (10 Missões)
        </button>
        {missaoAtiva && abaAtiva === 'arena' && (
          <button style={{ ...btnAbaBase, backgroundColor: '#2563eb', color: 'white' }}>
            ⚡ Arena Diário ({missaoAtiva.id})
          </button>
        )}
        <button onClick={() => {setAbaAtiva('crises'); setFaseCrise('intro');}} style={{ ...btnAbaBase, backgroundColor: abaAtiva === 'crises' ? '#dc2626' : 'transparent', color: abaAtiva === 'crises' ? 'white' : '#ef4444', border: abaAtiva === 'crises' ? 'none' : '1px dashed #fca5a5' }}>
          🚨 Sala de Guerra (Modo Crise)
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. TRILHA DE MISSÕES PADRÃO */}
      {/* ========================================================= */}
      {abaAtiva === 'trilhas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', animation: 'fadeIn 0.4s' }}>
          {missoes.map(m => (
            <div key={m.id} style={{ backgroundColor: m.status === 'concluido' ? '#f0fdf4' : '#ffffff', padding: '20px', borderRadius: '12px', border: m.status === 'concluido' ? '1px solid #bbf7d0' : '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: 'white' }}>{m.id}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569' }}>{m.trilha}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: m.status === 'concluido' ? '#16a34a' : '#2563eb', backgroundColor: m.status === 'concluido' ? '#dcfce7' : '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>+{m.xp} XP</span>
                </div>
                <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{m.titulo}</strong>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{m.enunciado}</p>
              </div>
              <button onClick={() => abrirMissao(m)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', backgroundColor: m.status === 'concluido' ? '#16a34a' : '#0f172a', color: 'white', transition: 'all 0.2s' }}>
                {m.status === 'concluido' ? '✓ Missão Cumprida' : 'Resolver na Arena ➔'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ARENA DE RESOLUÇÃO (NORMAL) */}
      {/* ========================================================= */}
      {abaAtiva === 'arena' && missaoAtiva && (
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', animation: 'fadeIn 0.3s' }}>
          <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>{missaoAtiva.trilha}</span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#0f172a' }}>{missaoAtiva.titulo}</h3>
            </div>
            <button onClick={() => setAbaAtiva('trilhas')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✖ Fechar Arena</button>
          </div>

          <p style={{ fontSize: '14px', color: '#334155', marginBottom: '24px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
            {missaoAtiva.enunciado}
          </p>

          <form onSubmit={validarLancamento} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '6px' }}>DÉBITO (Aplicação de Recursos):</label>
                <select value={inputDebito} onChange={e => setInputDebito(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #bfdbfe', backgroundColor: 'white', fontSize: '13px', outline: 'none' }}>
                  {contasDisponiveis.map(c => <option key={c.codigo} value={`${c.codigo} - ${c.nome}`}>{c.codigo} - {c.nome}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#991b1b', display: 'block', marginBottom: '6px' }}>CRÉDITO (Origem de Recursos):</label>
                <select value={inputCredito} onChange={e => setInputCredito(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #fecaca', backgroundColor: 'white', fontSize: '13px', outline: 'none' }}>
                  {contasDisponiveis.map(c => <option key={c.codigo} value={`${c.codigo} - ${c.nome}`}>{c.codigo} - {c.nome}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ maxWidth: '300px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Valor da Operação (R$):</label>
              <input type="text" value={inputValorStr} onChange={e => setInputValorStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold' }} />
            </div>

            {resultadoTentativa === 'sucesso' && <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontSize: '14px' }}>🎉 <strong>Lançamento Correto! (+{missaoAtiva.xp} XP).</strong><br/><br/>{missaoAtiva.explicacao}</div>}
            {resultadoTentativa === 'erro' && <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}>❌ Lançamento Incorreto. Analise a origem e aplicação dos recursos!</div>}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" style={{ padding: '14px 28px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                Validar Partidas Dobradas ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SALA DE GUERRA: MODO CRISE (MINI-GAMES DE PRESSÃO) */}
      {/* ========================================================= */}
      {abaAtiva === 'crises' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          
          {/* FASE INTRO: LISTA DE CRISES */}
          {faseCrise === 'intro' && (
            <div>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '20px', borderRadius: '12px', marginBottom: '24px', borderLeft: '6px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '18px' }}>🚨 Sala de Guerra (Modo Sobrevivência)</h3>
                <p style={{ margin: 0, color: '#b91c1c', fontSize: '13.5px', lineHeight: '1.5' }}>
                  Aviso: Estes cenários simulam ambientes de alta pressão corporativa. Você correrá contra o relógio para salvar a contabilidade da empresa. Se o tempo esgotar ou você errar, o prejuízo é irreversível. Prepare-se!
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {crisesLista.map(c => (
                  <div key={c.id} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{c.icone}</div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>{c.titulo}</h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{c.descricao}</p>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>⏱️ Tempo: {c.tempoMaximo}s</span>
                        <span style={{ backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: '#b45309' }}>🏆 +{c.xp} XP</span>
                      </div>
                    </div>
                    <button onClick={() => iniciarCrise(c)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                      INICIAR CRISE ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FASE JOGANDO: A CRISE ESTÁ ACONTECENDO */}
          {faseCrise === 'jogando' && criseAtiva && (
            <div className="crisis-active" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
              
              {/* HEADER DO MINI-GAME */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #fecaca', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {criseAtiva.icone} {criseAtiva.titulo}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>ATENÇÃO: RESOLVA ANTES DO TEMPO ACABAR!</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: tempoRestante <= 15 ? '#dc2626' : '#0f172a', animation: tempoRestante <= 15 ? 'shake 0.5s infinite' : 'none' }}>
                    00:{tempoRestante < 10 ? `0${tempoRestante}` : tempoRestante}
                  </div>
                </div>
              </div>

              {/* BARRA DE PÂNICO */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
                  <span>Nível de Pânico da Diretoria</span>
                  <span>{nivelPanicoPct.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${nivelPanicoPct}%`, backgroundColor: nivelPanicoPct > 80 ? '#dc2626' : nivelPanicoPct > 50 ? '#f59e0b' : '#16a34a', height: '100%', transition: 'width 1s linear, background-color 0.5s' }} />
                </div>
              </div>

              {/* ============================================== */}
              {/* LÓGICA DO MINI-GAME 1: BALANÇO DE DETERMINAÇÃO */}
              {/* ============================================== */}
              {criseAtiva.tipo === 'balanco_determinacao' && (
                <div>
                  <p style={{ fontSize: '14px', color: '#334155', marginBottom: '20px', lineHeight: '1.6' }}>
                    {criseAtiva.instrucao}
                  </p>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <strong style={{ display: 'block', marginBottom: '12px' }}>Ajuste os valores para o Valor Justo (Mercado):</strong>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Valor do Imóvel (R$):</label>
                        <input type="number" value={mg1Imovel} onChange={e => setMg1Imovel(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #94a3b8' }} placeholder="Ex: 500000" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Valor do Estoque (R$):</label>
                        <input type="number" value={mg1Estoque} onChange={e => setMg1Estoque(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #94a3b8' }} placeholder="Ex: 30000" />
                      </div>
                    </div>
                    <button onClick={validarMiniGame} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>APLICAR AJUSTE DE AVALIAÇÃO PATRIMONIAL</button>
                  </div>
                </div>
              )}

              {/* ============================================== */}
              {/* LÓGICA DO MINI-GAME: ESCOLHA DE CONTAS (D/C)   */}
              {/* SERVE PARA CRISES 2, 4, 5 e 6                  */}
              {/* ============================================== */}
              {['ransomware', 'receita_federal', 'fraude', 'estorno_folha'].includes(criseAtiva.tipo) && (
                <div>
                  <p style={{ fontSize: '14px', color: '#334155', marginBottom: '20px', lineHeight: '1.6' }}>
                    {criseAtiva.instrucao}
                  </p>
                  <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', color: 'white' }}>
                    <strong style={{ display: 'block', marginBottom: '12px', color: '#38bdf8' }}>Terminal de Correção:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', display: 'block', marginBottom: '4px' }}>CONTA DEBITADA (D):</label>
                        <select value={mgSelectD} onChange={e => setMgSelectD(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #3b82f6' }}>
                          {contasDisponiveis.map(c => <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#fca5a5', display: 'block', marginBottom: '4px' }}>CONTA CREDITADA (C):</label>
                        <select value={mgSelectC} onChange={e => setMgSelectC(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #ef4444' }}>
                          {contasDisponiveis.map(c => <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nome}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={validarMiniGame} style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>EXECUTAR LANÇAMENTO DE EMERGÊNCIA</button>
                  </div>
                </div>
              )}

              {/* ============================================== */}
              {/* LÓGICA DO MINI-GAME 3: BACKUP CORROMPIDO       */}
              {/* ============================================== */}
              {criseAtiva.tipo === 'backup' && (
                <div>
                  <p style={{ fontSize: '14px', color: '#334155', marginBottom: '20px', lineHeight: '1.6' }}>
                    {criseAtiva.instrucao}
                  </p>
                  <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>
                      {mg3QtdCerta === 0 ? "Receita de Vendas de Mercadorias" : 
                       mg3QtdCerta === 1 ? "Salários a Pagar" : "Estoque de Mercadorias"}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      <button onClick={() => { if(mg3QtdCerta===2){setMg3QtdCerta(3); setTimeout(validarMiniGame, 100);} else {alert('Errou!')} }} style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>ATIVO</button>
                      <button onClick={() => { if(mg3QtdCerta===1){setMg3QtdCerta(2)} else {alert('Errou!')} }} style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>PASSIVO</button>
                      <button onClick={() => { if(mg3QtdCerta===0){setMg3QtdCerta(1)} else {alert('Errou!')} }} style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>RECEITA</button>
                    </div>
                    <div style={{ marginTop: '20px', fontWeight: 'bold', color: '#64748b' }}>Acertos: {mg3QtdCerta} / 3</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FASES DE FIM DE JOGO */}
          {faseCrise === 'sucesso' && (
            <div style={{ backgroundColor: '#f0fdf4', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '2px solid #4ade80' }}>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎖️</div>
              <h2 style={{ color: '#166534', margin: '0 0 10px 0' }}>Crise Neutralizada!</h2>
              <p style={{ color: '#15803d', fontSize: '16px' }}>Você salvou a empresa e provou seu valor sob pressão.</p>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', margin: '20px 0' }}>+{criseAtiva.xp} XP Adquiridos!</div>
              <button onClick={() => {setCriseAtiva(null); setFaseCrise('intro');}} style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Voltar para a Sala de Guerra</button>
            </div>
          )}

          {faseCrise === 'gameover' && (
            <div style={{ backgroundColor: '#fef2f2', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '2px solid #f87171' }}>
              <div style={{ fontSize: '60px', marginBottom: '10px' }}>💀</div>
              <h2 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>O Tempo Esgotou.</h2>
              <p style={{ color: '#b91c1c', fontSize: '16px' }}>A empresa sofreu perdas irrecuperáveis ou a fiscalização aplicou multas milionárias.</p>
              <button onClick={() => {setCriseAtiva(null); setFaseCrise('intro');}} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Tentar Novamente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}