import React, { useState } from 'react';

export default function LaboratorioLancamentos() {
  const contasDisponiveis = [
    { id: 'caixa', nome: 'Caixa / Bancos', grupo: 'Ativo' },
    { id: 'clientes', nome: 'Clientes (A Receber)', grupo: 'Ativo' },
    { id: 'estoque', nome: 'Estoque de Mercadorias', grupo: 'Ativo' },
    { id: 'imobilizado', nome: 'Ativo Imobilizado', grupo: 'Ativo' },
    { id: 'fornecedores', nome: 'Fornecedores (A Pagar)', grupo: 'Passivo' },
    { id: 'emprestimos', nome: 'Empréstimos Bancários', grupo: 'Passivo' },
    { id: 'capital', nome: 'Capital Social', grupo: 'PL' },
    { id: 'receita', nome: 'Receita de Vendas', grupo: 'Resultado' },
    { id: 'cmv', nome: 'Custo da Mercadoria (CMV)', grupo: 'Resultado' },
    { id: 'despesa', nome: 'Despesas Diversas', grupo: 'Resultado' },
    { id: 'depreciacao_ac', nome: 'Depreciação Acumulada', grupo: 'Ativo Redutora' }
  ];

  const desafios = [
    { id: 1, fato: "Abertura da empresa com capital em dinheiro.", dica: "Dinheiro entra na empresa (Ativo sobe), originado pelos sócios (PL sobe).", debito: "caixa", credito: "capital", valor: 100000 },
    { id: 2, fato: "Compra de Mercadorias à vista.", dica: "Entra estoque, mas o dinheiro sai imediatamente da conta.", debito: "estoque", credito: "caixa", valor: 20000 },
    { id: 3, fato: "Compra de Mercadorias a prazo.", dica: "Entra estoque, mas a dívida fica pendente com quem nos vendeu.", debito: "estoque", credito: "fornecedores", valor: 15000 },
    { id: 4, fato: "Venda de mercadoria à vista.", dica: "Recebemos o dinheiro na hora. Isso é fruto da nossa operação principal.", debito: "caixa", credito: "receita", valor: 8000 },
    { id: 5, fato: "Baixa do Estoque pela venda (CMV).", dica: "A mercadoria que vendemos saiu do armazém e transformou-se num custo.", debito: "cmv", credito: "estoque", valor: 4000 },
    { id: 6, fato: "Pagamento do fornecedor (Dívida anterior).", dica: "O dinheiro sai do banco para liquidar a obrigação que tínhamos.", debito: "fornecedores", credito: "caixa", valor: 5000 },
    { id: 7, fato: "Compra de um Veículo financiado pelo Banco.", dica: "Ganhamos um bem durável, mas assumimos uma dívida com o banco.", debito: "imobilizado", credito: "emprestimos", valor: 60000 },
    { id: 8, fato: "Venda de mercadoria a prazo (Fiado).", dica: "A receita aconteceu, mas o dinheiro ainda não entrou, gerou um direito.", debito: "clientes", credito: "receita", valor: 12000 },
    { id: 9, fato: "Recebimento da dívida do cliente.", dica: "O cliente finalmente pagou! O direito some e o dinheiro entra.", debito: "caixa", credito: "clientes", valor: 12000 },
    { id: 10, fato: "Pagamento da Conta de Energia.", dica: "O dinheiro sai para pagar um gasto consumido no mês.", debito: "despesa", credito: "caixa", valor: 800 },
    { id: 11, fato: "Empréstimo recebido (Dinheiro na conta).", dica: "O saldo bancário sobe, mas a dívida com o banco também.", debito: "caixa", credito: "emprestimos", valor: 50000 },
    { id: 12, fato: "Pagamento de Salários aos funcionários.", dica: "O esforço humano consumido gera uma despesa paga com dinheiro.", debito: "despesa", credito: "caixa", valor: 15000 },
    { id: 13, fato: "Reconhecimento da Depreciação do Veículo.", dica: "O carro desgastou (Despesa), gerando um fundo redutor do seu valor.", debito: "despesa", credito: "depreciacao_ac", valor: 1000 },
    { id: 14, fato: "Pagamento de Juros sobre o empréstimo.", dica: "O banco cobrou juros. O dinheiro saiu da conta para pagar esse custo financeiro.", debito: "despesa", credito: "caixa", valor: 500 },
    { id: 15, fato: "Amortização (Pagamento) principal do empréstimo.", dica: "O dinheiro sai para reduzir o tamanho da dívida bancária.", debito: "emprestimos", credito: "caixa", valor: 2000 },
    { id: 16, fato: "Aquisição de Computadores à vista.", dica: "Trocamos dinheiro no banco por equipamentos para uso da empresa.", debito: "imobilizado", credito: "caixa", valor: 10000 }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0: Debito, 1: Credito
  const [selecao, setSelecao] = useState({ debito: null, credito: null });
  const [historico, setHistorico] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const getNomeConta = (id) => contasDisponiveis.find(c => c.id === id)?.nome || '???';

  const handleSelecao = (idConta) => {
    if (etapaAtual === 0) {
      if (idConta === desafioAtual.debito) {
        setSelecao({ ...selecao, debito: idConta });
        setFeedback({ tipo: 'sucesso', msg: 'Débito Correto! Qual a origem desse recurso (Crédito)?' });
        setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1200);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Débito Incorreto. Onde o recurso foi APLICADO (Destino)? Lembre-se: Ativo e Despesa aumentam a Débito.' });
      }
    } else {
      if (idConta === desafioAtual.credito) {
        setHistorico([...historico, { ...desafioAtual, debitoNome: getNomeConta(selecao.debito), creditoNome: getNomeConta(idConta) }]);
        setFeedback({ tipo: 'sucesso', msg: 'Partidas Dobradas perfeitamente equilibradas!' });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ debito: null, credito: null });
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Crédito Incorreto. Qual a ORIGEM do recurso? Lembre-se: Passivo, PL e Receita aumentam a Crédito.' });
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', color: 'white', padding: '24px 32px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ backgroundColor: '#1e3a8a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>MÓDULO DE ESCRITURAÇÃO</span>
          <h2 style={{ margin: '8px 0', fontSize: '28px', fontWeight: '900' }}>Partidas Dobradas (Débito & Crédito) ⚖️</h2>
          <p style={{ margin: 0, color: '#bfdbfe', fontSize: '14px', maxWidth: '650px' }}>Para todo recurso aplicado (Débito), existe uma origem correspondente (Crédito). Faça os lançamentos no Livro Diário.</p>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold' }}>Fatos Lançados</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff' }}>{historico.length} / 16</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', height: '8px' }}>
        <div style={{ width: `${(historico.length / desafios.length) * 100}%`, backgroundColor: '#3b82f6', height: '100%', transition: 'width 0.5s' }}></div>
      </div>

      {!concluido ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '24px', flex: 1 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>📝</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Fato Contábil {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.fato}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '12px', color: '#92400e', fontSize: '13.5px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ display: 'block' }}>🦉 Dica de Ouro:</strong> {desafioAtual.dica}
            </div>

            <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>
              {etapaAtual === 0 ? 'Passo 1: Qual conta recebe o DÉBITO (Aplicação)?' : 'Passo 2: Qual conta recebe o CRÉDITO (Origem)?'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {contasDisponiveis.map(conta => (
                <button 
                  key={conta.id} onClick={() => handleSelecao(conta.id)}
                  style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = etapaAtual === 0 ? '#3b82f6' : '#f59e0b'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>{conta.grupo}</span>
                  {conta.nome}
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '24px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', maxHeight: '700px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>📖 Livro Diário Oficial</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {historico.map((h, i) => (
                <div key={i} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Fato {h.id}: {h.fato}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontFamily: 'monospace', fontSize: '14px' }}>
                    <span>D - {h.debitoNome}</span> <span>R$ {h.valor}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontFamily: 'monospace', fontSize: '14px', marginLeft: '20px' }}>
                    <span>C - {h.creditoNome}</span> <span>R$ {h.valor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #3b82f6', flex: 1 }}>
          <span style={{ fontSize: '72px', marginBottom: '20px' }}>🎓</span>
          <h2 style={{ color: '#1e3a8a', fontSize: '36px', fontWeight: '900' }}>Mestre das Partidas Dobradas!</h2>
          <p style={{ color: '#475569', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Você provou que entende o coração da contabilidade. Sabe perfeitamente que o Ativo aumenta a Débito e o Passivo aumenta a Crédito!</p>
          <button onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({debito:null,credito:null}); setHistorico([]); }} style={{ marginTop: '30px', padding: '16px 36px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Refazer Exercícios</button>
        </div>
      )}
    </div>
  );
}