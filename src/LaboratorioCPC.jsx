import React, { useState } from 'react';

export default function LaboratorioCPC() {
  const opcoesCPC = [
    { cod: 'CPC 00', nome: 'Estrutura Conceitual' },
    { cod: 'CPC 01', nome: 'Redução ao Valor Recuperável (Impairment)' },
    { cod: 'CPC 04', nome: 'Ativo Intangível' },
    { cod: 'CPC 16', nome: 'Estoques' },
    { cod: 'CPC 25', nome: 'Provisões e Contingências' },
    { cod: 'CPC 27', nome: 'Ativo Imobilizado' },
    { cod: 'CPC 47', nome: 'Receitas de Contratos' }
  ];

  const desafios = [
    { id: 1, caso: "A nossa máquina está avaliada no balanço por R$ 50 mil, mas se formos vender hoje ou usá-la até o fim, ela só gera R$ 30 mil de retorno.", cpc_correto: "CPC 01", regra_correta: "Reconhecer perda por Impairment de R$ 20 mil.", regras: ["Reconhecer perda por Impairment de R$ 20 mil.", "Manter R$ 50 mil pois o bem não foi vendido."] },
    { id: 2, caso: "Temos um processo trabalhista. O advogado diz que a chance de perdermos é 'Provável' e o valor estimado é R$ 100 mil.", cpc_correto: "CPC 25", regra_correta: "Reconhecer Provisão (Passivo) de R$ 100 mil e Despesa.", regras: ["Apenas colocar em Nota Explicativa.", "Reconhecer Provisão (Passivo) de R$ 100 mil e Despesa."] },
    { id: 3, caso: "Compramos um lote de tecidos. O custo de compra foi R$ 10 mil, mas o valor de mercado (venda líquida) caiu para R$ 8 mil.", cpc_correto: "CPC 16", regra_correta: "Ajustar o estoque para R$ 8 mil (Dos dois, o menor).", regras: ["Manter R$ 10 mil pelo custo histórico.", "Ajustar o estoque para R$ 8 mil (Dos dois, o menor)."] },
    { id: 4, caso: "Compramos um guindaste. O frete e a instalação custaram R$ 5 mil além do valor da nota fiscal.", cpc_correto: "CPC 27", regra_correta: "Somar os R$ 5 mil ao custo do Imobilizado.", regras: ["Lançar R$ 5 mil direto como despesa do mês.", "Somar os R$ 5 mil ao custo do Imobilizado."] },
    { id: 5, caso: "Desenvolvemos internamente a logomarca da nossa empresa, achamos que vale R$ 1 Milhão.", cpc_correto: "CPC 04", regra_correta: "Marcas geradas internamente NÃO devem ser reconhecidas no Ativo.", regras: ["Marcas geradas internamente NÃO devem ser reconhecidas no Ativo.", "Ativar R$ 1 Milhão no Intangível e amortizar."] },
    { id: 6, caso: "A informação contábil deve ter Valor Preditivo, Valor Confirmatório e Materialidade.", cpc_correto: "CPC 00", regra_correta: "Estes são atributos da Característica Qualitativa da Relevância.", regras: ["São regras exclusivas para cálculo de impostos.", "Estes são atributos da Característica Qualitativa da Relevância."] },
    { id: 7, caso: "Recebemos dinheiro do cliente antecipadamente, mas ainda não entregámos a mercadoria nem prestámos o serviço.", cpc_correto: "CPC 47", regra_correta: "Registrar como Passivo (Adiantamento) até cumprir a obrigação.", regras: ["Reconhecer imediatamente como Receita no DRE.", "Registrar como Passivo (Adiantamento) até cumprir a obrigação."] },
    { id: 8, caso: "A vida útil econômica de um veículo da empresa foi reavaliada de 5 para 3 anos devido ao uso intenso.", cpc_correto: "CPC 27", regra_correta: "Ajustar prospectivamente a taxa de depreciação anual.", regras: ["Ignorar e manter a regra fiscal de 5 anos.", "Ajustar prospectivamente a taxa de depreciação anual."] },
    { id: 9, caso: "Temos um processo fiscal onde a chance de perder é apenas 'Possível' (50/50).", cpc_correto: "CPC 25", regra_correta: "Não provisionar, divulgar apenas em Nota Explicativa.", regras: ["Não provisionar, divulgar apenas em Nota Explicativa.", "Reconhecer passivo imediatamente."] },
    { id: 10, caso: "O Goodwill (Ágio por expectativa de rentabilidade futura) adquirido na compra de outra empresa.", cpc_correto: "CPC 04", regra_correta: "Não é amortizado, apenas testado anualmente por Impairment.", regras: ["Amortizar linearmente em 10 anos.", "Não é amortizado, apenas testado anualmente por Impairment."] },
    { id: 11, caso: "Mercadorias avariadas e obsoletas presas no armazém que não podem ser vendidas pelo preço normal.", cpc_correto: "CPC 16", regra_correta: "Reconhecer perda para o Valor Realizável Líquido.", regras: ["Reconhecer perda para o Valor Realizável Líquido.", "Manter pelo custo original até o descarte."] },
    { id: 12, caso: "Troca de uma peça fundamental de um motor que vai aumentar a vida útil da máquina industrial.", cpc_correto: "CPC 27", regra_correta: "Ativar o valor da peça no Imobilizado (Melhoria).", regras: ["Ativar o valor da peça no Imobilizado (Melhoria).", "Lançar como Despesa de Manutenção comum."] },
    { id: 13, caso: "Os relatórios contábeis não podem ter viés, devem ser neutros e completos.", cpc_correto: "CPC 00", regra_correta: "Refere-se à Característica da Representação Fidedigna.", regras: ["Refere-se à Característica da Representação Fidedigna.", "Trata-se do princípio da Oportunidade."] },
    { id: 14, caso: "Indício forte de que a patente comprada pela nossa farmacêutica perdeu o valor porque um concorrente lançou algo melhor.", cpc_correto: "CPC 01", regra_correta: "Realizar o Teste de Recuperabilidade (Impairment Test).", regras: ["Manter a patente intocada até ela expirar.", "Realizar o Teste de Recuperabilidade (Impairment Test)."] },
    { id: 15, caso: "Venda de produto com garantia estendida cobrada separadamente.", cpc_correto: "CPC 47", regra_correta: "Alocar o preço da transação separando produto e serviço de garantia.", regras: ["Alocar o preço da transação separando produto e serviço de garantia.", "Registrar 100% da venda no ato da assinatura."] },
    { id: 16, caso: "A empresa tomou conhecimento de uma obrigação não formalizada, mas criou expectativa válida nos terceiros de que a cumpriria (Obrigação Não Formalizada).", cpc_correto: "CPC 25", regra_correta: "Reconhecer a Provisão se o desembolso for provável.", regras: ["Não fazer nada até o contrato ser assinado.", "Reconhecer a Provisão se o desembolso for provável."] }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); 
  const [historicoCPC, setHistoricoCPC] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const handleSelecaoCPC = (cpc) => {
    if (cpc === desafioAtual.cpc_correto) {
      setFeedback({ tipo: 'sucesso', msg: 'Norma identificada corretamente! Qual é a aplicação prática?' });
      setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1200);
    } else {
      setFeedback({ tipo: 'erro', msg: 'Norma incorreta. Analise o tema: trata-se de Bens, Estoque, Obrigações ou Receita?' });
    }
  };

  const handleSelecaoRegra = (regra) => {
    if (regra === desafioAtual.regra_correta) {
      setHistoricoCPC([...historicoCPC, { ...desafioAtual, concluido: true }]);
      setFeedback({ tipo: 'sucesso', msg: 'Compliance Atingido! Auditoria perfeita.' });
      
      setTimeout(() => {
        setIndiceDesafio(prev => prev + 1);
        setEtapaAtual(0);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ tipo: 'erro', msg: 'Tratamento incorreto segundo o IFRS. Risco de ressalva no balanço!' });
    }
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#4b5563', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>CERTIFICAÇÃO IFRS & AUDITORIA</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Auditor de Compliance (CPC) 📚</h2>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', maxWidth: '650px' }}>Para cada cenário complexo da empresa, indique a norma contábil aplicável (CPC) e o tratamento oficial (IFRS) para evitar multas da CVM.</p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>Casos Auditados</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>{historicoCPC.length} <span style={{fontSize:'14px'}}>/ 16</span></div>
        </div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: CENÁRIO E PERGUNTAS */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>🚨</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Cenário Corporativo {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#111827', fontSize: '16px', lineHeight: '1.4' }}>"{desafioAtual.caso}"</h3>
              </div>
            </div>

            {etapaAtual === 0 ? (
              <div>
                <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>PASSO 1: Qual Pronunciamento Contábil governa esta regra?</div>
                {/* Lista em 1 coluna vertical para garantir 100% de legibilidade em qualquer ecrã */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {opcoesCPC.map(cpc => (
                    <button 
                      key={cpc.cod} onClick={() => handleSelecaoCPC(cpc.cod)}
                      style={{ padding: '12px 14px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    >
                      <strong style={{ backgroundColor: '#e5e7eb', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', flexShrink: 0 }}>{cpc.cod}</strong>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '600' }}>{cpc.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>PASSO 2: Qual o tratamento exigido pelo {desafioAtual.cpc_correto}?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {desafioAtual.regras.map((regra, idx) => (
                    <button 
                      key={idx} onClick={() => handleSelecaoRegra(regra)}
                      style={{ padding: '16px', backgroundColor: '#f3f4f6', border: '2px solid #d1d5db', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', color: '#1f2937', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#4ade80'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    >
                      {regra}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {feedback && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: RELATÓRIO DE AUDITORIA */}
          <div style={{ backgroundColor: '#111827', borderRadius: '20px', padding: '20px', border: '1px solid #374151', maxHeight: '600px', overflowY: 'auto', color: 'white' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #374151', paddingBottom: '12px' }}>📑 Relatório de Auditoria</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historicoCPC.length === 0 ? (
                <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '12px' }}>Nenhum caso auditado ainda...</span>
              ) : (
                historicoCPC.map((h, i) => (
                  <div key={i} style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '10px', borderLeft: '4px solid #4ade80', fontSize: '12px' }}>
                    <div style={{ color: '#9ca3af', marginBottom: '6px' }}>Cenário: {h.caso}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: '#f3f4f6', fontWeight: 'bold' }}>Norma: {h.cpc_correto}</span>
                      <span style={{ color: '#4ade80' }}>Ação: {h.regra_correta}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO */
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #111827', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', display: 'block' }}>🏅</span>
          <h2 style={{ color: '#111827', fontSize: '28px', fontWeight: '900' }}>Especialista IFRS/CPC!</h2>
          <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '600px', margin: '0 auto 20px auto' }}>Você resolveu cenários complexos do mundo corporativo aplicando perfeitamente as normas contábeis brasileiras e internacionais.</p>
          <button onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setHistoricoCPC([]); }} style={{ padding: '14px 32px', backgroundColor: '#111827', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px' }}>Nova Auditoria</button>
        </div>
      )}
    </div>
  );
}