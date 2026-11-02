import React, { useState } from 'react';

export default function LaboratorioDFC() {
  // 12 Casos práticos do dia a dia financeiro de uma empresa
  const desafios = [
    { id: 1, nome: "Recebimento de Clientes", dica: "Dinheiro entrando pelas vendas da operação diária.", valor: 50000, impacto: "entrada", atividade: "operacional" },
    { id: 2, nome: "Pagamento de Fornecedores", dica: "Saída de caixa para pagar a mercadoria comprada.", valor: 20000, impacto: "saida", atividade: "operacional" },
    { id: 3, nome: "Compra de Nova Máquina (À Vista)", dica: "Gasto focado em aumentar a capacidade da empresa no longo prazo.", valor: 80000, impacto: "saida", atividade: "investimento" },
    { id: 4, nome: "Aporte de Capital dos Sócios", dica: "Os donos injetaram dinheiro novo na conta da empresa.", valor: 100000, impacto: "entrada", atividade: "financiamento" },
    { id: 5, nome: "Pagamento de Salários", dica: "Gasto com a folha de pagamento do mês.", valor: 15000, impacto: "saida", atividade: "operacional" },
    { id: 6, nome: "Empréstimo Bancário Recebido", dica: "O banco liberou crédito na conta da empresa (dinheiro de terceiros).", valor: 60000, impacto: "entrada", atividade: "financiamento" },
    { id: 7, nome: "Venda de Veículo Antigo", dica: "Entrada de dinheiro pela venda de um bem do Ativo Imobilizado.", valor: 30000, impacto: "entrada", atividade: "investimento" },
    { id: 8, nome: "Pagamento de Dividendos", dica: "Remuneração distribuída aos sócios pelo lucro obtido.", valor: 10000, impacto: "saida", atividade: "financiamento" },
    { id: 9, nome: "Pagamento de Energia e Água", dica: "Contas de consumo básicas para a empresa funcionar.", valor: 2000, impacto: "saida", atividade: "operacional" },
    { id: 10, nome: "Amortização (Pagamento) do Empréstimo", dica: "Devolução do dinheiro principal que havia sido pego no banco.", valor: 5000, impacto: "saida", atividade: "financiamento" },
    { id: 11, nome: "Compra de Ações de Outra Empresa", dica: "Uso do caixa excedente para adquirir participação noutro negócio.", valor: 12000, impacto: "saida", atividade: "investimento" },
    { id: 12, nome: "Pagamento de Impostos (Simples Nacional)", dica: "Saída de caixa para pagar tributos da operação mensal.", valor: 4000, impacto: "saida", atividade: "operacional" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0 = Impacto (Entrada/Saida), 1 = Atividade
  const [selecao, setSelecao] = useState({ impacto: null, atividade: null });
  const [historicoDFC, setHistoricoDFC] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  // Cálculos do Relatório DFC em tempo real
  const totalOperacional = historicoDFC.filter(h => h.atividade === 'operacional').reduce((acc, curr) => acc + (curr.impacto === 'entrada' ? curr.valor : -curr.valor), 0);
  const totalInvestimento = historicoDFC.filter(h => h.atividade === 'investimento').reduce((acc, curr) => acc + (curr.impacto === 'entrada' ? curr.valor : -curr.valor), 0);
  const totalFinanciamento = historicoDFC.filter(h => h.atividade === 'financiamento').reduce((acc, curr) => acc + (curr.impacto === 'entrada' ? curr.valor : -curr.valor), 0);
  const variacaoCaixa = totalOperacional + totalInvestimento + totalFinanciamento;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSelecao = (tipo, valor) => {
    if (tipo === 'impacto') {
      if (valor === desafioAtual.impacto) {
        setSelecao({ ...selecao, impacto: valor });
        setFeedback({ tipo: 'sucesso', msg: 'Correto! Agora, classifique a atividade desta movimentação.' });
        setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1000);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Atenção! Pense no sentido do dinheiro. O saldo bancário aumentou ou diminuiu?' });
      }
    } else if (tipo === 'atividade') {
      if (valor === desafioAtual.atividade) {
        const novoRegistro = { ...desafioAtual, impactoFinal: selecao.impacto, atividadeFinal: valor };
        setHistoricoDFC([...historicoDFC, novoRegistro]);
        setFeedback({ tipo: 'sucesso', msg: `Perfeito! O valor de ${formatarValor(desafioAtual.valor)} foi para a DFC.` });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ impacto: null, atividade: null });
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Erro de classificação. Lembre-se: Operacional (Dia a dia), Investimento (Bens/Ativos de LP), Financiamento (Sócios/Bancos).' });
      }
    }
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>LABORATÓRIO FINANCEIRO</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Demonstração dos Fluxos de Caixa (DFC) 🚰</h2>
          <p style={{ margin: 0, color: '#d1fae5', fontSize: '14px', maxWidth: '600px' }}>
            A DFC não segue o princípio da competência. Aqui só importa uma coisa: <strong>o dinheiro bateu na conta bancária ou saiu dela?</strong> Classifique os extratos para montar o relatório oficial.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: 'bold', textTransform: 'uppercase' }}>Fluxos Analisados</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>{historicoDFC.length} <span style={{fontSize:'14px'}}>/ 12</span></div>
        </div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: ANÁLISE BANCÁRIA */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>📄</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Fato Financeiro {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', color: '#f8fafc', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor do Extrato</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>{formatarValor(desafioAtual.valor)}</div>
              </div>
              <span style={{ fontSize: '32px' }}>💸</span>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', color: '#166534', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', borderLeft: '4px solid #4ade80' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica do Tutor:</strong> {desafioAtual.dica}
            </div>

            {/* FLUXO DE DECISÃO */}
            {etapaAtual === 0 ? (
              <div className="animacao-entrada">
                <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 1: Qual o impacto no saldo bancário?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <button onClick={() => handleSelecao('impacto', 'entrada')} className="btn-impacto btn-entrada">
                    <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📈</span>
                    <strong>Entrada de Caixa</strong>
                    <span style={{ fontSize: '10px', display: 'block', color: '#64748b', marginTop: '2px' }}>(+) Recebido</span>
                  </button>
                  <button onClick={() => handleSelecao('impacto', 'saida')} className="btn-impacto btn-saida">
                    <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📉</span>
                    <strong>Saída de Caixa</strong>
                    <span style={{ fontSize: '10px', display: 'block', color: '#64748b', marginTop: '2px' }}>(-) Pago</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="animacao-entrada">
                <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 2: Qual é a classificação da atividade?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => handleSelecao('atividade', 'operacional')} className="btn-atividade">
                    <strong>⚙️ Atividade Operacional</strong>
                    <span>Dia a dia: Receitas, despesas, clientes e fornecedores.</span>
                  </button>
                  <button onClick={() => handleSelecao('atividade', 'investimento')} className="btn-atividade">
                    <strong>🏗️ Atividade de Investimento</strong>
                    <span>Longo prazo: Imobilizado, Intangível e Ações.</span>
                  </button>
                  <button onClick={() => handleSelecao('atividade', 'financiamento')} className="btn-atividade">
                    <strong>🏦 Atividade de Financiamento</strong>
                    <span>Capital: Empréstimos, dividendos e aportes.</span>
                  </button>
                </div>
              </div>
            )}

            {feedback && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: O RELATÓRIO DFC */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>📊</span> DFC - Método Direto
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              {/* OPERACIONAIS */}
              <div>
                <strong style={{ color: '#38bdf8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>1. Atividades Operacionais</strong>
                {historicoDFC.filter(h => h.atividade === 'operacional').length === 0 ? <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '12px' }}>Sem registros...</span> : 
                  historicoDFC.filter(h => h.atividade === 'operacional').map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b', fontSize: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                      <span style={{ color: h.impacto === 'entrada' ? '#4ade80' : '#f87171' }}>{h.impacto === 'entrada' ? '+' : '-'} {formatarValor(h.valor)}</span>
                    </div>
                  ))
                }
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '6px', color: totalOperacional >= 0 ? '#4ade80' : '#f87171', fontSize: '12px' }}>
                  Líquido Operacional: {formatarValor(totalOperacional)}
                </div>
              </div>

              {/* INVESTIMENTOS */}
              <div>
                <strong style={{ color: '#c084fc', fontSize: '13px', display: 'block', marginBottom: '6px' }}>2. Atividades de Investimento</strong>
                {historicoDFC.filter(h => h.atividade === 'investimento').length === 0 ? <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '12px' }}>Sem registros...</span> : 
                  historicoDFC.filter(h => h.atividade === 'investimento').map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b', fontSize: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                      <span style={{ color: h.impacto === 'entrada' ? '#4ade80' : '#f87171' }}>{h.impacto === 'entrada' ? '+' : '-'} {formatarValor(h.valor)}</span>
                    </div>
                  ))
                }
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '6px', color: totalInvestimento >= 0 ? '#4ade80' : '#f87171', fontSize: '12px' }}>
                  Líquido Investimento: {formatarValor(totalInvestimento)}
                </div>
              </div>

              {/* FINANCIAMENTOS */}
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '13px', display: 'block', marginBottom: '6px' }}>3. Atividades de Financiamento</strong>
                {historicoDFC.filter(h => h.atividade === 'financiamento').length === 0 ? <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '12px' }}>Sem registros...</span> : 
                  historicoDFC.filter(h => h.atividade === 'financiamento').map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b', fontSize: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                      <span style={{ color: h.impacto === 'entrada' ? '#4ade80' : '#f87171' }}>{h.impacto === 'entrada' ? '+' : '-'} {formatarValor(h.valor)}</span>
                    </div>
                  ))
                }
                <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '6px', color: totalFinanciamento >= 0 ? '#4ade80' : '#f87171', fontSize: '12px' }}>
                  Líquido Financiamento: {formatarValor(totalFinanciamento)}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '12px', marginTop: '16px', border: `1px solid ${variacaoCaixa >= 0 ? '#059669' : '#b91c1c'}` }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Variação Líquida de Caixa</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: variacaoCaixa >= 0 ? '#4ade80' : '#f87171' }}>
                {variacaoCaixa > 0 ? '+' : ''}{formatarValor(variacaoCaixa)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO */
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #10b981', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', display: 'block' }}>📈</span>
          <h2 style={{ color: '#064e3b', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '900' }}>Analista de Tesouraria!</h2>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '20px' }}>
            A DFC não tem mais segredos para si. O caixa da empresa aumentou em <strong>{formatarValor(variacaoCaixa)}</strong> no final do período. Agora entende perfeitamente como separar o dinheiro da operação diária dos investimentos e financiamentos.
          </p>
          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({impacto: null, atividade: null}); setHistoricoDFC([]); }}
            style={{ padding: '14px 32px', backgroundColor: '#047857', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(4,120,87,0.4)', width: '100%', maxWidth: '300px' }}
          >
            Refazer DFC Completa
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animacao-entrada { animation: fadeIn 0.4s ease-out; }
        
        .btn-impacto { padding: 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; text-align: center; }
        .btn-impacto:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .btn-entrada:hover { border-color: #4ade80; background: #f0fdf4; }
        .btn-saida:hover { border-color: #f87171; background: #fef2f2; }
        
        .btn-atividade { padding: 14px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; text-align: left; gap: 4px; }
        .btn-atividade strong { color: #0f172a; font-size: 14px; }
        .btn-atividade span { color: #64748b; font-size: 11px; }
        .btn-atividade:hover { border-color: #3b82f6; background: #eff6ff; padding-left: 16px; }
      `}</style>
    </div>
  );
}