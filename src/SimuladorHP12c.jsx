import React, { useState } from 'react';

export default function SimuladorHP12c({ mostrarToast }) {
  const [modo, setModo] = useState('trilha'); // 'trilha' ou 'livre'
  
  // ==========================================
  // ESTADOS DA CALCULADORA E MEMÓRIA
  // ==========================================
  const [visor, setVisor] = useState('0.00');
  const [inputando, setInputando] = useState(false);
  
  const [pilha, setPilha] = useState({ x: 0, y: 0, z: 0, t: 0 });
  const [fin, setFin] = useState({ n: 0, i: 0, pv: 0, pmt: 0, fv: 0 });
  const [memoriaAux, setMemoriaAux] = useState(0);

  // ==========================================
  // AS 12 MISSÕES GAMIFICADAS (MODO TRILHA BÁSICO)
  // ==========================================
  const missoes = [
    { id: 0, titulo: '1. O Básico da RPN (Soma)', contexto: 'Na HP 12c não existe "=". Guarde o 1º número com ENTER, digite o 2º e opere.', missao: 'Calcule: 150 + 350', dica: '150 ➔ ENTER ➔ 350 ➔ +', alvo: 500 },
    { id: 1, titulo: '2. O Poder da Pilha RPN', contexto: 'A pilha guarda o histórico para você não precisar de parênteses.', missao: 'Calcule: (10 + 20) x 5', dica: '10 ➔ ENTER ➔ 20 ➔ + ➔ 5 ➔ x', alvo: 150 },
    { id: 2, titulo: '3. Expressões Contínuas', contexto: 'Mande os números para a pilha e depois resolva tudo de trás pra frente.', missao: 'Calcule: (1000 - 200) ÷ 4', dica: '1000 ➔ ENTER ➔ 200 ➔ - ➔ 4 ➔ ÷', alvo: 200 },
    { id: 3, titulo: '4. Inversão de Sinal (CHS)', contexto: 'O CHS inverte o sinal. Em finanças, se você investe (tira do bolso), o valor é negativo.', missao: 'Deixe o visor com o valor de -500', dica: '500 ➔ CHS ➔ ENTER', alvo: -500 },
    { id: 4, titulo: '5. Juros Compostos (FV)', contexto: 'Investimos R$ 1.000 a 2% ao mês. Quanto teremos em 12 meses?', missao: 'Descubra o Valor Futuro (FV)', dica: '1000 ➔ CHS ➔ PV | 2 ➔ i | 12 ➔ n | ➔ FV', alvo: 1268.24 },
    { id: 5, titulo: '6. Juros Compostos (Taxa)', contexto: 'Um cliente investiu R$ 1.000 e resgatou R$ 1.500 após 10 meses.', missao: 'Descubra a Taxa (i)', dica: '1000 ➔ CHS ➔ PV | 1500 ➔ FV | 10 ➔ n | ➔ i', alvo: 4.14 },
    { id: 6, titulo: '7. Tabela Price (PMT)', contexto: 'Financiamento de um carro de R$ 50.000 em 48 vezes, com juros de 1.5% ao mês.', missao: 'Descubra a Parcela Mensal (PMT)', dica: '50000 ➔ CHS ➔ PV | 1.5 ➔ i | 48 ➔ n | ➔ PMT', alvo: 1468.75 },
    { id: 7, titulo: '8. Porcentagem Simples (%)', contexto: 'Você quer calcular 15% de R$ 2.000,00.', missao: 'Ache o valor da porcentagem', dica: '2000 ➔ ENTER ➔ 15 ➔ %', alvo: 300 },
    { id: 8, titulo: '9. Variação Percentual (Δ%)', contexto: 'Uma ação subiu de R$ 25 para R$ 32. Quantos % ela cresceu?', missao: 'Ache a variação (Δ%)', dica: '25 ➔ ENTER ➔ 32 ➔ Δ%', alvo: 28 },
    { id: 9, titulo: '10. Inverso (1/x)', contexto: 'O atalho 1/x serve para cálculos rápidos de proporção. Qual o inverso de 4?', missao: 'Calcule 1 ÷ 4', dica: '4 ➔ 1/x', alvo: 0.25 },
    { id: 10, titulo: '11. Armazenar na Memória (STO)', contexto: 'Guarde um número para usar depois sem poluir a pilha.', missao: 'Guarde o número 888 na memória auxiliar.', dica: '888 ➔ STO', alvo: 888 },
    { id: 11, titulo: '12. Recuperar Memória (RCL)', contexto: 'Traga de volta o número que você guardou.', missao: 'Recupere o 888, some com 12 e chegue a 900.', dica: '12 ➔ ENTER ➔ RCL ➔ +', alvo: 900 }
  ];

  const [missaoAtual, setMissaoAtual] = useState(0);
  const m = missoes[missaoAtual];

  // ==========================================
  // FUNÇÕES BASE DO MOTOR HP 12C
  // ==========================================
  const formatarVisor = (num) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const pressNum = (num) => {
    if (!inputando) {
      setVisor(num);
      setInputando(true);
    } else {
      setVisor(visor === '0' || visor === '0.00' ? num : visor + num);
    }
  };

  const pressEnter = () => {
    const val = Number(visor);
    setPilha({ x: val, y: val, z: pilha.y, t: pilha.z });
    setInputando(false);
    validarMissao(val);
  };

  const pressOp = (op) => {
    const valX = Number(visor);
    const valY = pilha.y;
    let res = 0;

    if (op === '+') res = valY + valX;
    else if (op === '-') res = valY - valX;
    else if (op === 'x') res = valY * valX;
    else if (op === '/') res = valX !== 0 ? valY / valX : 0;
    else if (op === 'y^x') res = Math.pow(valY, valX);
    else if (op === '%') res = valY * (valX / 100);
    else if (op === 'Δ%') res = valY !== 0 ? ((valX - valY) / valY) * 100 : 0;
    else if (op === '%T') res = valY !== 0 ? (valX / valY) * 100 : 0;

    setVisor(res.toString());
    setPilha({ x: res, y: pilha.z, z: pilha.t, t: pilha.t });
    setInputando(false);
    validarMissao(res);
  };

  const press1x = () => {
    const res = Number(visor) !== 0 ? 1 / Number(visor) : 0;
    setVisor(res.toString());
    setPilha({ ...pilha, x: res });
    setInputando(false);
    validarMissao(res);
  };

  const pressCHS = () => {
    const val = Number(visor) * -1;
    setVisor(val.toString());
    setInputando(true); 
  };

  const pressSTO = () => {
    setMemoriaAux(Number(visor));
    mostrarToast('Valor salvo na Memória (STO).', 'sucesso');
    setInputando(true);
    validarMissao(Number(visor)); 
  };

  const pressRCL = () => {
    setVisor(memoriaAux.toString());
    setPilha({ ...pilha, x: memoriaAux });
    setInputando(false);
    mostrarToast('Valor recuperado da Memória (RCL).', 'sucesso');
  };

  const clearX = () => {
    setVisor('0.00');
    setPilha({ x: 0, y: 0, z: 0, t: 0 }); 
    setInputando(false);
    mostrarToast('Pilha operacional limpa!', 'sucesso');
  };

  const clearFin = () => {
    setFin({ n: 0, i: 0, pv: 0, pmt: 0, fv: 0 });
    mostrarToast('Memória Financeira limpa!', 'sucesso');
  };

  const pressFin = (reg) => {
    const valX = Number(visor);
    const taxa = fin.i / 100;
    
    if (inputando) {
      setFin({ ...fin, [reg]: valX });
      setInputando(false);
      setPilha({ ...pilha, x: valX });
      return;
    }

    let res = 0;
    if (reg === 'fv') {
      const pt1 = fin.pv * Math.pow(1 + taxa, fin.n);
      const pt2 = taxa === 0 ? (fin.pmt * fin.n) : (fin.pmt * ((Math.pow(1 + taxa, fin.n) - 1) / taxa));
      res = -(pt1 + pt2);
    } 
    else if (reg === 'pv') {
      const pt1 = taxa === 0 ? (fin.pmt * fin.n) : (fin.pmt * ((Math.pow(1 + taxa, fin.n) - 1) / taxa));
      res = -(fin.fv + pt1) / Math.pow(1 + taxa, fin.n);
    }
    else if (reg === 'pmt') {
      if (taxa === 0) res = -(fin.pv + fin.fv) / fin.n;
      else {
        const num = (fin.pv * Math.pow(1 + taxa, fin.n) + fin.fv) * taxa;
        const den = Math.pow(1 + taxa, fin.n) - 1;
        res = -(num / den);
      }
    }
    else if (reg === 'n') {
      if (taxa === 0) res = -(fin.pv + fin.fv) / fin.pmt;
      else {
        const pmtOverI = fin.pmt / taxa;
        const num = -fin.fv + pmtOverI;
        const den = fin.pv + pmtOverI;
        if (den === 0 || num / den <= 0) return mostrarToast("Erro: PV e FV precisam de sinais opostos.", "erro");
        res = Math.log(num / den) / Math.log(1 + taxa);
      }
    }
    else if (reg === 'i') {
      if (fin.pmt !== 0) return mostrarToast("Laboratório calcula 'i' apenas se PMT = 0.", "erro");
      const ratio = fin.fv / -fin.pv;
      if (ratio <= 0) return mostrarToast("Erro: PV e FV precisam de sinais opostos.", "erro");
      res = (Math.pow(ratio, 1 / fin.n) - 1) * 100;
    }

    setVisor(res.toString());
    setFin({ ...fin, [reg]: res });
    setPilha({ ...pilha, x: res });
    setInputando(false);
    validarMissao(res);
  };

  const validarMissao = (resultadoAtual) => {
    if (modo !== 'trilha') return; 

    if (m && Math.abs(resultadoAtual - m.alvo) < 0.10) { 
      setTimeout(() => {
        mostrarToast(`🎯 Correto!`, 'sucesso');
        if (missaoAtual < missoes.length - 1) {
          setMissaoAtual(missaoAtual + 1);
          clearX();
          clearFin();
        } else {
          mostrarToast('🏆 Parabéns! Você concluiu a trilha básica!', 'sucesso');
          setModo('livre');
        }
      }, 300);
    }
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      
      {/* HEADER & TOGGLE */}
      <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '38px' }}>🧮</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '900' }}>Simulador HP 12c & Sandbox</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Aprenda matemática financeira operando a calculadora padrão do mercado.</p>
          </div>
        </div>
        
        {/* Toggle Modo */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => {setModo('trilha'); clearX(); clearFin();}} style={toggleBtn(modo === 'trilha')}>🎮 Modo Guiado</button>
          <button onClick={() => {setModo('livre'); clearX(); clearFin();}} style={toggleBtn(modo === 'livre')}>📖 Exercícios (Modo Livre)</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center', alignItems: 'flex-start' }}>
        
        {/* ==========================================
            1. A CALCULADORA VIRTUAL (ESQUERDA)
            ========================================== */}
        <div style={{ flex: '1 1 350px', maxWidth: '480px', backgroundColor: '#1e293b', padding: '30px 20px', borderRadius: '16px', border: '4px solid #0f172a', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#d4d4d8', fontWeight: '900', fontStyle: 'italic', letterSpacing: '2px' }}>hp 12c</span>
            <span style={{ color: '#d4d4d8', fontSize: '10px' }}>Contábil Cloud Edition</span>
          </div>

          <div style={{ backgroundColor: '#b5ccad', padding: '15px', borderRadius: '6px', textAlign: 'right', border: 'inset 3px #64748b', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '32px', color: '#1e293b', fontWeight: 'bold' }}>
              {formatarVisor(visor)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            <Key label="n" onClick={() => pressFin('n')} />
            <Key label="i" onClick={() => pressFin('i')} />
            <Key label="PV" onClick={() => pressFin('pv')} />
            <Key label="PMT" onClick={() => pressFin('pmt')} />
            <Key label="FV" onClick={() => pressFin('fv')} />
            
            <Key label="y^x" onClick={() => pressOp('y^x')} />
            <Key label="1/x" onClick={press1x} />
            <Key label="%T" onClick={() => pressOp('%T')} />
            <Key label="Δ%" onClick={() => pressOp('Δ%')} />
            <Key label="%" onClick={() => pressOp('%')} />

            <Key label="7" onClick={() => pressNum('7')} />
            <Key label="8" onClick={() => pressNum('8')} />
            <Key label="9" onClick={() => pressNum('9')} />
            <Key label="÷" onClick={() => pressOp('/')} />
            <Key label="STO" onClick={pressSTO} bg="#8b5cf6" />

            <Key label="4" onClick={() => pressNum('4')} />
            <Key label="5" onClick={() => pressNum('5')} />
            <Key label="6" onClick={() => pressNum('6')} />
            <Key label="x" onClick={() => pressOp('x')} />
            <Key label="RCL" onClick={pressRCL} bg="#8b5cf6" />

            <Key label="1" onClick={() => pressNum('1')} />
            <Key label="2" onClick={() => pressNum('2')} />
            <Key label="3" onClick={() => pressNum('3')} />
            <Key label="-" onClick={() => pressOp('-')} />
            <Key label="CL Fin" onClick={clearFin} bg="#f59e0b" />

            <Key label="0" onClick={() => pressNum('0')} />
            <Key label="." onClick={() => pressNum('.')} />
            <Key label="CHS" onClick={pressCHS} />
            <Key label="+" onClick={() => pressOp('+')} />
            <Key label="CLx" onClick={clearX} bg="#ef4444" />
          </div>

          <button onClick={pressEnter} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '15px 0', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.5)', transition: 'all 0.1s', marginTop: '5px' }}>
            ENTER
          </button>
        </div>

        {/* ==========================================
            2. PAINEL CENTRAL (MISSÕES OU APOSTILA DE CARTÕES)
            ========================================== */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {modo === 'trilha' ? (
            /* COMPONENTE DA TRILHA */
            <div style={{ backgroundColor: '#eff6ff', padding: '25px', borderRadius: '12px', border: '1px solid #bfdbfe', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                  Missão {missaoAtual + 1} de {missoes.length}
                </span>
                <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 'bold' }}>Alvo: {formatarVisor(m.alvo)}</span>
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '20px' }}>{m.titulo}</h3>
              <p style={{ fontSize: '14px', color: '#1e293b', marginBottom: '20px', lineHeight: '1.5' }}>{m.contexto}</p>
              
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Seu Desafio:</strong>
                <span style={{ color: '#475569', fontSize: '15px' }}>{m.missao}</span>
              </div>

              <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>💡 Sequência na Calculadora:</span>
                <span style={{ backgroundColor: '#dbeafe', padding: '10px', borderRadius: '6px', textAlign: 'center', letterSpacing: '1px' }}>{m.dica}</span>
              </div>
            </div>
          ) : (
            /* COMPONENTE APOSTILA NATIVA DE CARTÕES (SUBSTITUI O PDF) */
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s', maxHeight: '700px', overflowY: 'auto' }}>
              <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '25px', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span>📑</span> Exercícios de Mercado (CPA-20 / CEA)
              </h2>
              
              <CartaoExercicio num="1" cat="Matemática Básica" titulo="Taxas Equivalentes (a.a. p/ a.m.)" 
                texto="Um CDB rende 15% ao ano (a.a.). Qual é a taxa equivalente ao mês (a.m.) considerando juros compostos? (Fórmula: [(1 + i)^(1/12) - 1] * 100)"
                teclas="1.15 [ENTER] 1 [ENTER] 12 [÷] [y^x] 1 [-] 100 [x]" resp="1.17 % a.m." 
              />
              
              <CartaoExercicio num="2" cat="Mercado de Capitais" titulo="Variação Percentual (Δ%) de Ações" 
                texto="Você comprou um Fundo Imobiliário por R$ 115,00. Hoje a cota está R$ 138,50. Qual foi a rentabilidade dessa valorização?"
                teclas="115 [ENTER] 138.50 [Δ%]" resp="20.43 %" 
              />

              <CartaoExercicio num="3" cat="Gestão Empresarial" titulo="Market Share (%T)" 
                texto="Uma rede de franquias faturou R$ 450.000 (Total). A filial Sul foi responsável por R$ 112.500. Qual a participação (%) dessa filial no total?"
                teclas="450000 [ENTER] 112500 [%T]" resp="25.00 %" 
              />
              
              <CartaoExercicio num="4" cat="Técnica HP" titulo="Memória Auxiliar (STO/RCL)" 
                texto="Guarde o valor da Taxa Selic de 10.50 na memória da HP. Limpe a tela (CLx). Depois, puxe esse valor de volta e descubra quanto é 30% da Selic."
                teclas="10.50 [STO] [CLx] [RCL] [ENTER] 30 [%]" resp="3.15 %" 
              />

              <CartaoExercicio num="5" cat="Financiamentos" titulo="Cálculo de Tabela Price (PMT)" 
                texto="Qual o valor da prestação mensal de um financiamento imobiliário de R$ 300.000,00, a ser pago em 360 meses, com taxa de 0.8% a.m.?"
                teclas="300000 [CHS] [PV] 0.8 [i] 360 [n] [PMT]" resp="2,544.75" 
              />

              <CartaoExercicio num="6" cat="Empréstimos" titulo="Quitação Antecipada (PV)" 
                texto="Faltam 48 parcelas de R$ 1.500,00 para quitar o carro. A taxa original foi 1.2% a.m. Quanto o banco deve cobrar se você quiser pagar tudo à vista hoje?"
                teclas="1500 [CHS] [PMT] 1.2 [i] 48 [n] [PV]" resp="54,496.09" 
              />

              <CartaoExercicio num="7" cat="Investimentos" titulo="Acumulação de Capital (FV)" 
                texto="Você já tem R$ 10.000 investidos e vai poupar R$ 1.000 todos os meses por 10 anos (120 meses). Se a taxa for 1% a.m., quanto terá no final?"
                teclas="10000 [CHS] [PV] 1000 [CHS] [PMT] 1 [i] 120 [n] [FV]" resp="263,043.91" 
              />

              <CartaoExercicio num="8" cat="Avaliação" titulo="Custo Efetivo Total (CET)" 
                texto="Você pegou R$ 10.000 emprestados e vai pagar em 24 vezes de R$ 550,00. Qual é a taxa de juros (i) real escondida nesse parcelamento?"
                teclas="10000 [CHS] [PV] 550 [PMT] 24 [n] [i]" resp="2.35 %" 
              />

              <CartaoExercicio num="9" cat="Economia" titulo="Taxa Real (Descontando a Inflação)" 
                texto="Você ganhou 12% a.a. num CDB, mas a inflação (IPCA) foi 5% no ano. Qual foi seu Ganho Real? Fórmula: [(1+Inom) / (1+Iinf) - 1] * 100"
                teclas="1.12 [ENTER] 1.05 [÷] 1 [-] 100 [x]" resp="6.67 %" 
              />

              <CartaoExercicio num="10" cat="Técnica HP" titulo="Proporção Inversa (1/x)" 
                texto="Se um robô constrói 1 carro em 4 dias (4), qual a produtividade diária dele? (Use a tecla de inverso para descobrir carros/dia)."
                teclas="4 [1/x]" resp="0.25 carros por dia" 
              />
            </div>
          )}

          {/* ==========================================
              3. RAIO-X DA MEMÓRIA (DIREITA/INFERIOR)
              ========================================== */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px' }}>🔍 Raio-X da Memória Interna</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              {/* Pilha RPN */}
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' }}>PILHA OPERACIONAL (RPN)</div>
                <div style={memRow}><span>T (Top):</span> <span>{formatarVisor(pilha.t)}</span></div>
                <div style={memRow}><span>Z:</span> <span>{formatarVisor(pilha.z)}</span></div>
                <div style={memRow}><span>Y (Anterior):</span> <span>{formatarVisor(pilha.y)}</span></div>
                <div style={{...memRow, backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534', fontWeight: 'bold'}}>
                  <span>X (Visor):</span> <span>{formatarVisor(visor)}</span>
                </div>
              </div>
              
              {/* Finanças e STO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' }}>REGISTROS FINANCEIROS</div>
                  <div style={memRow}><span>n:</span> <span>{fin.n}</span></div>
                  <div style={memRow}><span>i:</span> <span>{fin.i}</span></div>
                  <div style={memRow}><span>PV:</span> <span>{formatarVisor(fin.pv)}</span></div>
                  <div style={memRow}><span>PMT:</span> <span>{formatarVisor(fin.pmt)}</span></div>
                  <div style={memRow}><span>FV:</span> <span>{formatarVisor(fin.fv)}</span></div>
                </div>
                
                <div style={{ backgroundColor: '#faf5ff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e9d5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7e22ce' }}>MEMÓRIA (STO/RCL)</span>
                  <span style={{ fontWeight: '900', color: '#9333ea' }}>{formatarVisor(memoriaAux)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES DE UI & ESTILOS REUSÁVEIS
// ==========================================
const Key = ({ label, onClick, bg = '#334155' }) => (
  <button 
    onClick={onClick} 
    style={{
      backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', padding: '12px 0',
      fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.6)',
      transition: 'transform 0.1s, box-shadow 0.1s', userSelect: 'none'
    }}
    onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0.6)'; }}
    onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 rgba(0,0,0,0.6)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 rgba(0,0,0,0.6)'; }}
  >
    {label}
  </button>
);

// O NOVO CARTÃO DE EXERCÍCIO INTERATIVO (Substitui o PDF)
const CartaoExercicio = ({ num, cat, titulo, texto, teclas, resp }) => {
  const [aberto, setAberto] = useState(false);
  
  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '15px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{cat}</span>
        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>Exercício {num}</span>
      </div>
      <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '16px' }}>{titulo}</h4>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{texto}</p>

      {!aberto ? (
        <button onClick={() => setAberto(true)} style={{ backgroundColor: '#f1f5f9', color: '#2563eb', border: '1px dashed #93c5fd', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13px' }}>
          👀 Ver Gabarito da Calculadora
        </button>
      ) : (
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s' }}>
          <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 'bold', marginBottom: '10px', wordBreak: 'break-word', letterSpacing: '1px' }}>
            ⌨️ Teclas: {teclas}
          </div>
          <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
            ✅ Resposta no Visor: {resp}
          </div>
          <button onClick={() => setAberto(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline' }}>Ocultar Gabarito</button>
        </div>
      )}
    </div>
  );
}

const toggleBtn = (ativo) => ({
  backgroundColor: ativo ? 'white' : 'transparent', color: ativo ? '#0f172a' : 'white',
  border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
});

const memRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' };