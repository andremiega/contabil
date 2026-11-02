import React, { useState } from 'react';

export default function LaboratorioPlanoContas() {
  // A Jornada Expandida: 16 Casos Reais de uma Empresa
  const desafios = [
    { id: 1, nome: "Dinheiro no Banco", dica: "Onde fica o dinheiro líquido da empresa?", gabarito: ["1", "1.1", "1.1.1"], descricoes: ["1. Ativo", "1.1 Circulante", "1.1.1 Disponibilidades"] },
    { id: 2, nome: "Vendas a Prazo (Fiado)", dica: "Direito de receber o dinheiro dos clientes que compraram a prazo.", gabarito: ["1", "1.1", "1.1.2"], descricoes: ["1. Ativo", "1.1 Circulante", "1.1.2 Direitos (Clientes)"] },
    { id: 3, nome: "Mercadorias no Galpão", dica: "Bens comprados que vão gerar receita futura na venda.", gabarito: ["1", "1.1", "1.1.3"], descricoes: ["1. Ativo", "1.1 Circulante", "1.1.3 Estoques"] },
    { id: 4, nome: "Prateleiras e Computadores", dica: "Bens físicos de uso duradouro que não são para venda.", gabarito: ["1", "1.2", "1.2.3"], descricoes: ["1. Ativo", "1.2 Não Circulante", "1.2.3 Imobilizado"] },
    { id: 5, nome: "Software e Marca Registrada", dica: "Bens que não têm corpo físico, mas têm grande valor para o negócio.", gabarito: ["1", "1.2", "1.2.4"], descricoes: ["1. Ativo", "1.2 Não Circulante", "1.2.4 Intangível"] },
    { id: 6, nome: "Contas a Pagar (Fornecedores)", dica: "Dívidas de curto prazo pelas compras de estoque.", gabarito: ["2", "2.1", "2.1.1"], descricoes: ["2. Passivo", "2.1 Circulante", "2.1.1 Fornecedores"] },
    { id: 7, nome: "Empréstimo Bancário (12 meses)", dica: "Dinheiro pego no banco que deve ser pago no curto prazo.", gabarito: ["2", "2.1", "2.1.2"], descricoes: ["2. Passivo", "2.1 Circulante", "2.1.2 Empréstimos CP"] },
    { id: 8, nome: "Simples Nacional a Pagar", dica: "Obrigações com o governo geradas pelas vendas do mês.", gabarito: ["2", "2.1", "2.1.3"], descricoes: ["2. Passivo", "2.1 Circulante", "2.1.3 Obrigações Fiscais"] },
    { id: 9, nome: "Financiamento de Veículo (48x)", dica: "Dívida longa, que vai ultrapassar o exercício seguinte.", gabarito: ["2", "2.2", "2.2.1"], descricoes: ["2. Passivo", "2.2 Não Circulante", "2.2.1 Financiamentos LP"] },
    { id: 10, nome: "Investimento Inicial do Dono", dica: "O capital colocado pelo proprietário para abrir a empresa.", gabarito: ["3", "3.1", "3.1.1"], descricoes: ["3. Patrimônio Líquido", "3.1 Capital e Reservas", "3.1.1 Capital Social"] },
    { id: 11, nome: "Lucros Retidos na Empresa", dica: "O dinheiro que sobrou de anos anteriores e não foi distribuído.", gabarito: ["3", "3.1", "3.1.2"], descricoes: ["3. Patrimônio Líquido", "3.1 Capital e Reservas", "3.1.2 Lucros Acumulados"] },
    { id: 12, nome: "Vendas do Mês no Balcão", dica: "O ganho principal com a operação de comércio da empresa.", gabarito: ["4", "4.1", "4.1.1"], descricoes: ["4. Receitas", "4.1 Receitas Operacionais", "4.1.1 Receita Bruta de Vendas"] },
    { id: 13, nome: "Rendimento da Aplicação", dica: "Dinheiro que gerou mais dinheiro no banco (não é da operação principal).", gabarito: ["4", "4.2", "4.2.1"], descricoes: ["4. Receitas", "4.2 Receitas Financeiras", "4.2.1 Receita de Juros"] },
    { id: 14, nome: "Custo das Mercadorias (CMV)", dica: "O valor exato que a empresa pagou pelos itens que acabaram de ser vendidos.", gabarito: ["5", "5.1", "5.1.1"], descricoes: ["5. Custos e Despesas", "5.1 Custos das Vendas", "5.1.1 Custo da Mercadoria (CMV)"] },
    { id: 15, nome: "Salários dos Funcionários", dica: "Gasto com o esforço humano necessário para a empresa funcionar.", gabarito: ["5", "5.2", "5.2.1"], descricoes: ["5. Custos e Despesas", "5.2 Despesas Operacionais", "5.2.1 Despesas c/ Pessoal"] },
    { id: 16, nome: "Conta de Luz, Internet e Aluguel", dica: "Gastos gerais de estrutura para manter as portas abertas.", gabarito: ["5", "5.2", "5.2.2"], descricoes: ["5. Custos e Despesas", "5.2 Despesas Operacionais", "5.2.2 Despesas Administrativas"] }
  ];

  // Matriz Lógica Expansiva (Nível 1, 2 e 3)
  const opcoesNivel1 = [
    { cod: '1', label: '1. Ativo (Bens e Direitos)' },
    { cod: '2', label: '2. Passivo (Obrigações)' },
    { cod: '3', label: '3. Patrimônio Líquido (Capital/Reservas)' },
    { cod: '4', label: '4. Receitas (Ganhos)' },
    { cod: '5', label: '5. Custos e Despesas (Gastos)' }
  ];

  const opcoesNivel2 = {
    '1': [{ cod: '1.1', label: '1.1 Circulante (Curto Prazo)' }, { cod: '1.2', label: '1.2 Não Circulante (Longo Prazo)' }],
    '2': [{ cod: '2.1', label: '2.1 Circulante (Curto Prazo)' }, { cod: '2.2', label: '2.2 Não Circulante (Longo Prazo)' }],
    '3': [{ cod: '3.1', label: '3.1 Capital e Reservas' }],
    '4': [{ cod: '4.1', label: '4.1 Receitas Operacionais' }, { cod: '4.2', label: '4.2 Receitas Financeiras' }],
    '5': [{ cod: '5.1', label: '5.1 Custos das Vendas' }, { cod: '5.2', label: '5.2 Despesas Operacionais' }]
  };

  const opcoesNivel3 = {
    '1.1': [{ cod: '1.1.1', label: '1.1.1 Disponibilidades (Caixa/Bancos)' }, { cod: '1.1.2', label: '1.1.2 Direitos (Clientes a Receber)' }, { cod: '1.1.3', label: '1.1.3 Estoques' }],
    '1.2': [{ cod: '1.2.3', label: '1.2.3 Imobilizado (Bens Físicos)' }, { cod: '1.2.4', label: '1.2.4 Intangível (Softwares/Marcas)' }],
    '2.1': [{ cod: '2.1.1', label: '2.1.1 Fornecedores' }, { cod: '2.1.2', label: '2.1.2 Empréstimos CP' }, { cod: '2.1.3', label: '2.1.3 Obrigações Fiscais/Trabalhistas' }],
    '2.2': [{ cod: '2.2.1', label: '2.2.1 Financiamentos LP (Longo Prazo)' }],
    '3.1': [{ cod: '3.1.1', label: '3.1.1 Capital Social' }, { cod: '3.1.2', label: '3.1.2 Lucros Acumulados' }],
    '4.1': [{ cod: '4.1.1', label: '4.1.1 Receita Bruta de Vendas' }],
    '4.2': [{ cod: '4.2.1', label: '4.2.1 Receita de Juros (Rendimentos)' }],
    '5.1': [{ cod: '5.1.1', label: '5.1.1 Custo da Mercadoria Vendida (CMV)' }],
    '5.2': [{ cod: '5.2.1', label: '5.2.1 Despesas c/ Pessoal' }, { cod: '5.2.2', label: '5.2.2 Despesas Administrativas / Estrutura' }]
  };

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaCodigo, setEtapaCodigo] = useState(0); 
  const [codigoAtual, setCodigoAtual] = useState([]); 
  const [contasConcluidas, setContasConcluidas] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const handleSelecao = (codigoSelecionado) => {
    const gabaritoFase = desafioAtual.gabarito[etapaCodigo];
    
    if (codigoSelecionado === gabaritoFase) {
      const novoCodigo = [...codigoAtual, codigoSelecionado];
      setCodigoAtual(novoCodigo);
      setFeedback({ tipo: 'sucesso', msg: 'Correto! Continue a destrinchar o código.' });
      
      if (etapaCodigo === 2) {
        setFeedback({ tipo: 'sucesso', msg: `Sensacional! Você mapeou a conta ${novoCodigo[2]} corretamente.` });
        setContasConcluidas([...contasConcluidas, { ...desafioAtual, codigoFinal: novoCodigo[2] }]);
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaCodigo(0);
          setCodigoAtual([]);
          setFeedback(null);
        }, 1800);
      } else {
        setTimeout(() => {
          setEtapaCodigo(prev => prev + 1);
          setFeedback(null);
        }, 800);
      }
    } else {
      setFeedback({ tipo: 'erro', msg: 'Análise incorreta. Pense bem: qual a essência deste item para a empresa?' });
    }
  };

  const getOpcoesAtuais = () => {
    if (etapaCodigo === 0) return opcoesNivel1;
    if (etapaCodigo === 1) return opcoesNivel2[codigoAtual[0]] || [];
    if (etapaCodigo === 2) return opcoesNivel3[codigoAtual[1]] || [];
    return [];
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>CERTIFICAÇÃO CONTÁBIL: NÍVEL 16</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Engenharia do Plano de Contas 🧩</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', maxWidth: '600px' }}>
            Domine a lógica dos números! Ajude a organizar a contabilidade de uma <strong>Pequena Empresa</strong> montando o código exato (Grupo, Subgrupo e Conta) para 16 situações reais.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase' }}>Progresso Total</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>{contasConcluidas.length} <span style={{fontSize:'14px', color:'#64748b'}}>/ 16</span></div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO GLOBAL */}
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${(contasConcluidas.length / desafios.length) * 100}%`, backgroundColor: '#3b82f6', height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: O CONSTRUTOR DE CÓDIGOS */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>🏢</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Desafio {indiceDesafio + 1} de 16:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '12px', color: '#92400e', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica do Tutor:</strong> {desafioAtual.dica}
            </div>

            {/* MOSTRADOR DO CÓDIGO (VISUAL) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '20px', fontWeight: '900', backgroundColor: codigoAtual[0] ? '#dcfce7' : '#f8fafc', color: codigoAtual[0] ? '#166534' : '#cbd5e1', border: `2px solid ${codigoAtual[0] ? '#4ade80' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
                {codigoAtual[0] ? codigoAtual[0] : 'X'}
              </div>
              <span style={{ fontSize: '20px', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>.</span>
              <div style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '20px', fontWeight: '900', backgroundColor: codigoAtual[1] ? '#dcfce7' : '#f8fafc', color: codigoAtual[1] ? '#166534' : '#cbd5e1', border: `2px solid ${codigoAtual[1] ? '#4ade80' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
                {codigoAtual[1] ? codigoAtual[1].split('.')[1] : 'X'}
              </div>
              <span style={{ fontSize: '20px', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>.</span>
              <div style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '20px', fontWeight: '900', backgroundColor: codigoAtual[2] ? '#dcfce7' : '#f8fafc', color: codigoAtual[2] ? '#166534' : '#cbd5e1', border: `2px solid ${codigoAtual[2] ? '#4ade80' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
                {codigoAtual[2] ? codigoAtual[2].split('.')[2] : 'X'}
              </div>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>
              {etapaCodigo === 0 && 'Passo 1: Selecione o Grupo Principal'}
              {etapaCodigo === 1 && 'Passo 2: Defina o Prazo/Categoria (Subgrupo)'}
              {etapaCodigo === 2 && 'Passo 3: Identifique a Conta Específica'}
            </div>

            {/* BOTÕES DE SELEÇÃO DINÂMICOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {getOpcoesAtuais().map(opcao => (
                <button 
                  key={opcao.cod}
                  onClick={() => handleSelecao(opcao.cod)}
                  style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: '10px', alignItems: 'center' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>{opcao.cod}</span>
                  {opcao.label.replace(/^[0-9.]+\s/, '')}
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: A ÁRVORE CONTÁBIL (RESULTADO VISUAL) */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', position: 'sticky', top: 0, backgroundColor: '#0f172a', paddingBottom: '10px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: '18px' }}>🌳</span> Árvore Oficial Mapeada
            </h3>
            
            {contasConcluidas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontStyle: 'italic', fontSize: '13px' }}>
                O Plano de Contas será ramificado aqui à medida que você acerta os desafios.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                {contasConcluidas.map((conta, idx) => (
                  <div key={idx} style={{ backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #4ade80', animation: 'fadeIn 0.5s' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '2px', fontSize: '11px' }}>{conta.descricoes[0]} &gt; {conta.descricoes[1]}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{conta.codigoFinal} {conta.nome}</strong>
                      <span style={{ fontSize: '10px', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Mapeada</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO ÉPICA */
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #4ade80', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', animation: 'bounce 2s infinite' }}>🏆</span>
          <h2 style={{ color: '#064e3b', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '900' }}>Mestre do Plano de Contas!</h2>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '20px' }}>
            Fabuloso! Você mapeou com sucesso os <strong>16 pilares principais</strong> de uma empresa. 
            Agora você entende na prática que o código <strong>2.2.1</strong> não é apenas um número, mas sim o DNA de uma obrigação: <strong>Passivo &gt; Não Circulante &gt; Financiamento a Longo Prazo</strong>.
          </p>
          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaCodigo(0); setCodigoAtual([]); setContasConcluidas([]); }}
            style={{ padding: '14px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)', transition: 'transform 0.2s', width: '100%', maxWidth: '300px' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Refazer Simulação Completa
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}