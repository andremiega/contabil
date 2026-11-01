import React, { useState } from 'react';

export default function LaboratorioConciliacao() {
  // O Saldo Perfeito no final será R$ 20.000,00
  const saldoInicialERP = 20925; // O sistema acha que tem mais
  const saldoInicialBanco = 18900; // O banco mostra menos

  // 16 Casos Reais de Auditoria e Conciliação
  const desafios = [
    { id: 1, nome: "Tarifa de Manutenção de Conta", dica: "O banco cobrou 50 reais de madrugada e a empresa não sabia. O dinheiro já saiu do banco.", valor: 50, alvo: "erp", acao: "subtrair" },
    { id: 2, nome: "Cheque nº 101 não descontado", dica: "Você pagou o fornecedor e deu baixa no ERP, mas ele ainda não foi ao banco levantar o cheque.", valor: 1500, alvo: "banco", acao: "somar" }, // Historicamente tratamos como 'somar de volta ao banco' se estivermos a fazer a conciliação partindo do banco, mas na mecânica padrão: Banco não descontou, então para chegar no saldo real, precisamos deduzir do banco (porque o dinheiro já está comprometido). CORREÇÃO: "subtrair" do banco para igualar ao ERP.
    { id: 3, nome: "PIX recebido (Não Identificado)", dica: "Caiu dinheiro na conta, mas o financeiro não lançou no sistema porque não sabia de quem era.", valor: 2000, alvo: "erp", acao: "somar" },
    { id: 4, nome: "Depósito em Caixa Eletrônico (Pendente)", dica: "O funcionário depositou o dinheiro, o ERP já registou, mas o banco pede 24h para compensar o envelope.", valor: 3000, alvo: "banco", acao: "somar" },
    { id: 5, nome: "Cheque de Cliente Devolvido (Sem fundos)", dica: "A empresa achou que tinha recebido e registou no sistema, mas o banco devolveu o cheque.", valor: 800, alvo: "erp", acao: "subtrair" },
    { id: 6, nome: "Rendimento da Poupança/CDB", dica: "O dinheiro rendeu juros no banco, o extrato aumentou, mas a contabilidade ainda não registou.", valor: 150, alvo: "erp", acao: "somar" },
    { id: 7, nome: "Cobrança Duplicada por Erro do Banco", dica: "O banco errou e cobrou a mesma conta duas vezes no extrato. A empresa tem que exigir o estorno.", valor: 500, alvo: "banco", acao: "somar" },
    { id: 8, nome: "IOF sobre Empréstimo Automático", dica: "Imposto descontado automaticamente pelo banco no extrato. Falta atualizar o nosso sistema.", valor: 30, alvo: "erp", acao: "subtrair" },
    { id: 9, nome: "Cheque nº 102 não descontado", dica: "Outro cheque emitido e baixado no nosso sistema, mas o cliente guardou na gaveta e não foi ao banco.", valor: 1200, alvo: "banco", acao: "subtrair" },
    { id: 10, nome: "TED enviada esquecida pelo Financeiro", dica: "A transferência foi feita no banco, o dinheiro saiu, mas esqueceram de registar no ERP.", valor: 900, alvo: "erp", acao: "subtrair" },
    { id: 11, nome: "Juros do Cheque Especial cobrados", dica: "O banco cobrou juros por a conta ter ficado negativa. O extrato já reflete isso.", valor: 120, alvo: "erp", acao: "subtrair" },
    { id: 12, nome: "Débito Não Reconhecido (Fraude/Clonagem)", dica: "Alguém clonou o cartão e gastou dinheiro. O banco vai ter que devolver esse dinheiro ao extrato.", valor: 300, alvo: "banco", acao: "somar" },
    { id: 13, nome: "Cliente depositou na boca do caixa (Sem aviso)", dica: "O dinheiro entrou vivo no extrato, mas o sistema comercial da empresa não sabia.", valor: 1000, alvo: "erp", acao: "somar" },
    { id: 14, nome: "Duplicidade de Baixa no ERP (Erro nosso)", dica: "O assistente pagou um boleto de 400, mas registou duas vezes no sistema por engano.", valor: 400, alvo: "erp", acao: "somar" },
    { id: 15, nome: "Bloqueio Judicial de Valores", dica: "O juiz bloqueou dinheiro na conta bancária. O saldo do banco caiu, precisamos atualizar o sistema.", valor: 2500, alvo: "erp", acao: "subtrair" },
    { id: 16, nome: "Taxa da Maquininha de Cartão retida", dica: "A empresa vendeu 1000, mas o banco depositou com a taxa já descontada. Falta lançar a taxa no sistema.", valor: 75, alvo: "erp", acao: "subtrair" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0: Quem Ajustar?, 1: Somar ou Subtrair?
  const [selecao, setSelecao] = useState({ alvo: null });
  const [historicoConciliacao, setHistoricoConciliacao] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Motor de Saldos em Tempo Real
  const ajustesERP = historicoConciliacao.filter(h => h.alvo === 'erp').reduce((acc, curr) => acc + (curr.acao === 'somar' ? curr.valor : -curr.valor), 0);
  const saldoAtualERP = saldoInicialERP + ajustesERP;

  const ajustesBanco = historicoConciliacao.filter(h => h.alvo === 'banco').reduce((acc, curr) => acc + (curr.acao === 'somar' ? curr.valor : -curr.valor), 0);
  const saldoAtualBanco = saldoInicialBanco + ajustesBanco;

  const diferencaSaldos = Math.abs(saldoAtualERP - saldoAtualBanco);

  const handleSelecao = (tipo, valor) => {
    if (tipo === 'alvo') {
      if (valor === desafioAtual.alvo) {
        setSelecao({ alvo: valor });
        setFeedback({ tipo: 'sucesso', msg: `Exato! É o ${valor === 'erp' ? 'nosso Sistema' : 'Extrato do Banco'} que está desatualizado ou incorreto neste caso.` });
        setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Pense bem: Onde a informação JÁ ESTÁ correta ou definitiva? Você deve ajustar quem está DESATUALIZADO.' });
      }
    } else if (tipo === 'acao') {
      if (valor === desafioAtual.acao) {
        setHistoricoConciliacao([...historicoConciliacao, desafioAtual]);
        setFeedback({ tipo: 'sucesso', msg: `Lançamento de reconciliação efetuado com sucesso!` });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ alvo: null });
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Ação incorreta. Pense na lógica matemática: para igualar a realidade, esse valor precisa somar ou deduzir do saldo?' });
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)', color: 'white', padding: '24px 32px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ backgroundColor: '#475569', color: '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>AUDITORIA FINANCEIRA</span>
          <h2 style={{ margin: '8px 0', fontSize: '28px', fontWeight: '900' }}>Conciliação Bancária 🔍</h2>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
            O Saldo do Sistema (Livro Caixa) raramente bate com o Saldo do Banco (Extrato). 
            Descubra as pendências, faça os ajustes matemáticos corretos e <strong>feche a diferença a ZERO!</strong>
          </p>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)', border: `1px solid ${diferencaSaldos === 0 && concluido ? '#4ade80' : 'rgba(255,255,255,0.1)'}` }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Diferença Atual</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: diferencaSaldos === 0 && concluido ? '#4ade80' : '#f87171' }}>
            {diferencaSaldos === 0 && concluido ? 'CONCILIADO' : formatarValor(diferencaSaldos)}
          </div>
        </div>
      </div>

      {!concluido ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.2fr', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: O DETETIVE */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>🔎</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Investigação {indiceDesafio + 1} de 16:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', color: '#f8fafc', marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Valor da Pendência</span>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#fbbf24' }}>
                {formatarValor(desafioAtual.valor)}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', color: '#334155', fontSize: '13.5px', fontStyle: 'italic', marginBottom: '24px', borderLeft: '4px solid #64748b' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Pista do Auditor:</strong> {desafioAtual.dica}
            </div>

            {/* FLUXO DE DECISÃO */}
            <div style={{ flex: 1 }}>
              {etapaAtual === 0 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 1: Qual lado precisa ser ajustado?</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={() => handleSelecao('alvo', 'erp')} className="btn-concilia btn-erp">
                      <span style={{ fontSize: '20px' }}>💻</span>
                      <strong>Ajustar o Sistema (ERP)</strong>
                      <span>A falha/esquecimento foi na nossa contabilidade interna.</span>
                    </button>
                    <button onClick={() => handleSelecao('alvo', 'banco')} className="btn-concilia btn-banco">
                      <span style={{ fontSize: '20px' }}>🏦</span>
                      <strong>Ajustar o Banco (Extrato)</strong>
                      <span>O banco errou, ou algo ainda vai cair/compensar no futuro.</span>
                    </button>
                  </div>
                </div>
              )}

              {etapaAtual === 1 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 2: Qual a ação corretiva?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button onClick={() => handleSelecao('acao', 'somar')} className="btn-acao btn-somar">
                      <span style={{ fontSize: '24px' }}>➕</span>
                      <strong>Somar (+)</strong >
                      <span>Aumenta o saldo</span>
                    </button>
                    <button onClick={() => handleSelecao('acao', 'subtrair')} className="btn-acao btn-subtrair">
                      <span style={{ fontSize: '24px' }}>➖</span>
                      <strong>Subtrair (-)</strong>
                      <span>Diminui o saldo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {feedback && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: DEMONSTRATIVO DE CONCILIAÇÃO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* CARD ERP (SISTEMA) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #3b82f6', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                <strong style={{ color: '#1e3a8a', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💻 Livro Razão (ERP)</strong>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Saldo Inicial: {formatarValor(saldoInicialERP)}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {historicoConciliacao.filter(h => h.alvo === 'erp').map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: `3px solid ${h.acao === 'somar' ? '#4ade80' : '#f87171'}` }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={h.nome}>{h.nome}</span>
                    <strong style={{ color: h.acao === 'somar' ? '#16a34a' : '#dc2626' }}>{h.acao === 'somar' ? '+' : '-'} {formatarValor(h.valor)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Ajustado ERP:</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#1e3a8a' }}>{formatarValor(saldoAtualERP)}</span>
              </div>
            </div>

            {/* CARD BANCO (EXTRATO) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #8b5cf6', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                <strong style={{ color: '#4c1d95', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏦 Extrato Bancário</strong>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Saldo Inicial: {formatarValor(saldoInicialBanco)}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {historicoConciliacao.filter(h => h.alvo === 'banco').map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: `3px solid ${h.acao === 'somar' ? '#4ade80' : '#f87171'}` }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={h.nome}>{h.nome}</span>
                    <strong style={{ color: h.acao === 'somar' ? '#16a34a' : '#dc2626' }}>{h.acao === 'somar' ? '+' : '-'} {formatarValor(h.valor)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#faf5ff', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#5b21b6', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo Ajustado Banco:</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#4c1d95' }}>{formatarValor(saldoAtualBanco)}</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO ÉPICA */
        <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: '#0f172a', borderRadius: '24px', border: '4px solid #4ade80', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(74, 222, 128, 0.2)' }}>
          <span style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🎯</span>
          <h2 style={{ color: '#4ade80', margin: '0 0 16px 0', fontSize: '40px', fontWeight: '900' }}>Conciliação Perfeita!</h2>
          <p style={{ color: '#cbd5e1', fontSize: '18px', maxWidth: '650px', lineHeight: '1.6', marginBottom: '30px' }}>
            Trabalho brilhante! Você encontrou todas as pendências ocultas e provou matematicamente a veracidade das contas. O saldo real e oficial da empresa, auditado por si, é exatamente <strong>{formatarValor(saldoAtualERP)}</strong>.
          </p>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '24px 40px', borderRadius: '16px', border: '1px solid rgba(74,222,128,0.3)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>Livro Razão (ERP)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>{formatarValor(saldoAtualERP)}</div>
            </div>
            <span style={{ fontSize: '32px', color: '#4ade80', fontWeight: '900' }}>=</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>Extrato Bancário</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>{formatarValor(saldoAtualBanco)}</div>
            </div>
          </div>

          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({alvo: null}); setHistoricoConciliacao([]); }}
            style={{ marginTop: '40px', padding: '16px 40px', backgroundColor: '#4ade80', color: '#064e3b', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(74,222,128,0.4)', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Realizar Nova Auditoria
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animacao-entrada { animation: fadeIn 0.4s ease-out; }
        
        .btn-concilia { padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; text-align: left; gap: 4px; }
        .btn-concilia strong { color: #0f172a; font-size: 15px; }
        .btn-concilia span { color: #64748b; font-size: 12px; }
        .btn-concilia:hover { transform: translateX(4px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .btn-erp:hover { border-color: #3b82f6; background: #eff6ff; }
        .btn-banco:hover { border-color: #8b5cf6; background: #faf5ff; }

        .btn-acao { padding: 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
        .btn-acao strong { color: #0f172a; font-size: 15px; }
        .btn-acao span { color: #64748b; font-size: 11px; }
        .btn-acao:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .btn-somar:hover { border-color: #4ade80; background: #f0fdf4; }
        .btn-subtrair:hover { border-color: #f87171; background: #fef2f2; }
      `}</style>
    </div>
  );
}