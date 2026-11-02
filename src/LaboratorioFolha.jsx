import React, { useState } from 'react';

export default function LaboratorioFolha() {
  // 16 Casos Reais de Departamento Pessoal / Folha de Pagamento
  const desafios = [
    { id: 1, nome: "Salário Base Nominal", dica: "A remuneração principal estipulada no contrato de trabalho.", valor: 3000, classe: "provento", destino: "trabalhador" },
    { id: 2, nome: "INSS (Previdência) Retido", dica: "A parte da aposentadoria que é tirada do salário do trabalhador.", valor: 280, classe: "desconto", destino: "governo" },
    { id: 3, nome: "Fundo de Garantia - FGTS (8%)", dica: "Poupança do trabalhador, mas quem paga essa conta é a EMPRESA, por fora do holerite.", valor: 240, classe: "encargo", destino: "governo" },
    { id: 4, nome: "Horas Extras (50%)", dica: "O trabalhador ficou além do expediente. Isso aumenta o seu ganho.", valor: 450, classe: "provento", destino: "trabalhador" },
    { id: 5, nome: "Imposto de Renda (IRRF) Retido", dica: "A Receita Federal morde uma parte do salário antes de ele cair na conta.", valor: 120, classe: "desconto", destino: "governo" },
    { id: 6, nome: "INSS Patronal (Cota Empresa - 20%)", dica: "A empresa paga 20% do próprio bolso para ajudar a financiar o INSS.", valor: 690, classe: "encargo", destino: "governo" },
    { id: 7, nome: "Desconto Vale Transporte (6%)", dica: "A lei permite descontar até 6% do salário base para custear os passes de ônibus.", valor: 180, classe: "desconto", destino: "terceiros" },
    { id: 8, nome: "Adicional de Insalubridade", dica: "Compensação financeira por trabalhar num ambiente nocivo à saúde.", valor: 300, classe: "provento", destino: "trabalhador" },
    { id: 9, nome: "Vale Refeição (Custo Patronal)", dica: "Valor que a empresa gasta pagando o ticket refeição à operadora de cartões.", valor: 500, classe: "encargo", destino: "terceiros" },
    { id: 10, nome: "Faltas Injustificadas", dica: "O funcionário não foi trabalhar. O valor é cortado, diminuindo o custo da empresa.", valor: 100, classe: "desconto", destino: "empresa" },
    { id: 11, nome: "Comissão sobre Vendas", dica: "Prémio pago pelo atingimento de metas. Aumenta o salário bruto.", valor: 650, classe: "provento", destino: "trabalhador" },
    { id: 12, nome: "Seguro Acidente de Trabalho (RAT)", dica: "Taxa paga pela empresa ao governo para cobrir riscos de acidentes na fábrica.", valor: 88, classe: "encargo", destino: "governo" },
    { id: 13, nome: "Adicional Noturno", dica: "Ganho extra por trabalhar no turno da noite (após as 22h).", valor: 200, classe: "provento", destino: "trabalhador" },
    { id: 14, nome: "Mensalidade Sindical", dica: "Valor autorizado pelo trabalhador para ser repassado ao sindicato da categoria.", valor: 50, classe: "desconto", destino: "terceiros" },
    { id: 15, nome: "Plano de Saúde (Cota Empresa)", dica: "A fatia da fatura do convénio médico que é paga exclusivamente pela empresa.", valor: 400, classe: "encargo", destino: "terceiros" },
    { id: 16, nome: "Salário Família", dica: "Benefício para quem tem filhos e recebe pouco. É somado ao holerite.", valor: 62, classe: "provento", destino: "trabalhador" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0: Classe (Provento/Desconto/Encargo), 1: Destino Final
  const [selecao, setSelecao] = useState({ classe: null });
  const [historicoDP, setHistoricoDP] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Motor de Apuração (Holerite e Custos)
  const totalProventos = historicoDP.filter(h => h.classe === 'provento').reduce((acc, curr) => acc + curr.valor, 0);
  const totalDescontos = historicoDP.filter(h => h.classe === 'desconto').reduce((acc, curr) => acc + curr.valor, 0);
  const salarioLiquido = totalProventos - totalDescontos;
  
  const totalEncargos = historicoDP.filter(h => h.classe === 'encargo').reduce((acc, curr) => acc + curr.valor, 0);
  const custoTotalEmpresa = totalProventos + totalEncargos;

  const handleSelecao = (tipo, valor) => {
    if (tipo === 'classe') {
      if (valor === desafioAtual.classe) {
        setSelecao({ classe: valor });
        setFeedback({ tipo: 'sucesso', msg: 'Correto! Agora identifique para onde (ou para quem) esse dinheiro vai.' });
        setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1200);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Erro! Lembre-se: Provento soma no Holerite. Desconto corta do Holerite. Encargo é um custo por fora pago pela Empresa.' });
      }
    } else if (tipo === 'destino') {
      if (valor === desafioAtual.destino) {
        setHistoricoDP([...historicoDP, desafioAtual]);
        setFeedback({ tipo: 'sucesso', msg: `Sensacional! Registado na folha de pagamento.` });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ classe: null });
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Destino incorreto. Pense bem: O dinheiro vai para o bolso do trabalhador, para guias do governo ou para um terceiro (plano, viação)?' });
      }
    }
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#14b8a6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>CERTIFICAÇÃO DE DP: 16 EVENTOS</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Departamento Pessoal e Folha 👥</h2>
          <p style={{ margin: 0, color: '#ccfbf1', fontSize: '14px', maxWidth: '650px' }}>
            Desmistifique o Holerite! Separe o que é <strong>Ganho do Funcionário</strong>, <strong>Descontos Retidos</strong> e o verdadeiro <strong>Custo Patronal</strong> que pesa nas contas da empresa.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#99f6e4', fontWeight: 'bold', textTransform: 'uppercase' }}>Eventos Processados</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>{historicoDP.length} <span style={{fontSize:'14px'}}>/ 16</span></div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO GLOBAL */}
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${(historicoDP.length / desafios.length) * 100}%`, backgroundColor: '#0d9488', height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: AUDITORIA DO EVENTO */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f0fdfa', borderRadius: '12px' }}>🧑‍💻</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Fato Trabalhista {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', color: '#f8fafc', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor a Processar</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#2dd4bf' }}>{formatarValor(desafioAtual.valor)}</div>
              </div>
              <span style={{ fontSize: '28px' }}>💵</span>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '12px', color: '#92400e', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica de RH:</strong> {desafioAtual.dica}
            </div>

            {/* FLUXO DE DECISÃO */}
            <div style={{ flex: 1 }}>
              {etapaAtual === 0 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 1: Qual o impacto deste evento?</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => handleSelecao('classe', 'provento')} className="btn-dp btn-provento">
                      <strong>📈 Provento (Vencimento)</strong>
                      <span>Aumenta o Salário Bruto do Empregado</span>
                    </button>
                    <button onClick={() => handleSelecao('classe', 'desconto')} className="btn-dp btn-desconto">
                      <strong>✂️ Desconto (Retenção)</strong>
                      <span>Diminui o Salário Líquido no Holerite</span>
                    </button>
                    <button onClick={() => handleSelecao('classe', 'encargo')} className="btn-dp btn-encargo">
                      <strong>🏢 Encargo Patronal</strong>
                      <span>Custo extra pago pela Empresa (fora do holerite)</span>
                    </button>
                  </div>
                </div>
              )}

              {etapaAtual === 1 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 2: Para quem o dinheiro será destinado?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <button onClick={() => handleSelecao('destino', 'trabalhador')} className="btn-destino">
                      <span style={{ fontSize: '20px' }}>👷‍♂️</span>
                      <strong>Empregado</strong>
                      <span>Vai para a conta dele</span>
                    </button>
                    <button onClick={() => handleSelecao('destino', 'governo')} className="btn-destino">
                      <span style={{ fontSize: '20px' }}>🏛️</span>
                      <strong>Governo</strong>
                      <span>Guia de imposto (INSS/FGTS)</span>
                    </button>
                    <button onClick={() => handleSelecao('destino', 'terceiros')} className="btn-destino">
                      <span style={{ fontSize: '20px' }}>🤝</span>
                      <strong>Terceiros</strong>
                      <span>Fornecedores (Viação, Sindicato)</span>
                    </button>
                    <button onClick={() => handleSelecao('destino', 'empresa')} className="btn-destino">
                      <span style={{ fontSize: '20px' }}>🏢</span>
                      <strong>Própria Empresa</strong>
                      <span>Dinheiro retido (Falta)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {feedback && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: HOLERITE VS CUSTO REAL */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>🧾</span> A Verdade sobre a Folha
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              
              {/* HOLERITE DO TRABALHADOR */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Holerite do Empregado
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '12px' }}>(+) Proventos (Ganhos)</span>
                  {historicoDP.filter(h => h.classe === 'provento').map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#a7f3d0', padding: '3px 0', borderBottom: '1px dashed #334155', fontSize: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                      <span>{formatarValor(h.valor)}</span>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#4ade80', paddingTop: '4px', fontSize: '12px' }}>Bruto: {formatarValor(totalProventos)}</div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '12px' }}>(-) Descontos (Retenções)</span>
                  {historicoDP.filter(h => h.classe === 'desconto').map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#fecaca', padding: '3px 0', borderBottom: '1px dashed #334155', fontSize: '12px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                      <span>{formatarValor(h.valor)}</span>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#f87171', paddingTop: '4px', fontSize: '12px' }}>Descontado: {formatarValor(totalDescontos)}</div>
                </div>

                <div style={{ backgroundColor: '#115e59', color: '#ccfbf1', padding: '10px', borderRadius: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>(=) Salário Líquido:</span>
                  <span>{formatarValor(salarioLiquido)}</span>
                </div>
              </div>

              {/* CUSTO PATRONAL */}
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '14px', borderRadius: '12px' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Encargos Patronais (Empresa)</div>
                
                {historicoDP.filter(h => h.classe === 'encargo').map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#fde68a', padding: '3px 0', borderBottom: '1px dashed #334155', fontSize: '12px' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{h.nome}</span>
                    <span>{formatarValor(h.valor)}</span>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#fbbf24', paddingTop: '6px', fontSize: '12px' }}>Total Encargos: {formatarValor(totalEncargos)}</div>
              </div>

              {/* GRANDE FINAL: CUSTO TOTAL DA EMPRESA */}
              <div style={{ backgroundColor: '#0f172a', border: '2px solid #38bdf8', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>Salário Bruto + Encargos Patronais</span>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>CUSTO TOTAL DO EMPREGADO:</span>
                <span style={{ color: '#e0f2fe', fontSize: '22px', fontWeight: '900' }}>{formatarValor(custoTotalEmpresa)}</span>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO */
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #0d9488', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', display: 'block' }}>🎖️</span>
          <h2 style={{ color: '#115e59', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '900' }}>Analista de RH Pleno!</h2>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '650px', lineHeight: '1.6', marginBottom: '20px' }}>
            Incrível! Conseguiu provar matematicamente que o <strong>Salário Bruto ({formatarValor(totalProventos)})</strong> é muito diferente do <strong>Salário Líquido ({formatarValor(salarioLiquido)})</strong> recebido pelo trabalhador, e que o verdadeiro <strong>Custo da Empresa ({formatarValor(custoTotalEmpresa)})</strong> é quase o dobro!
          </p>
          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({classe: null}); setHistoricoDP([]); }}
            style={{ padding: '14px 32px', backgroundColor: '#0d9488', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(13,148,136,0.4)', transition: 'transform 0.2s', width: '100%', maxWidth: '300px' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Refazer Folha de Pagamento
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animacao-entrada { animation: fadeIn 0.4s ease-out; }
        
        .btn-dp { padding: 14px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; text-align: left; gap: 4px; }
        .btn-dp strong { color: #0f172a; font-size: 14px; }
        .btn-dp span { color: #64748b; font-size: 11px; }
        .btn-dp:hover { transform: translateX(4px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        
        .btn-provento:hover { border-color: #4ade80; background: #f0fdf4; }
        .btn-desconto:hover { border-color: #f87171; background: #fef2f2; }
        .btn-encargo:hover { border-color: #fbbf24; background: #fffbeb; }

        .btn-destino { padding: 14px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
        .btn-destino strong { color: #0f172a; font-size: 13px; }
        .btn-destino span { color: #64748b; font-size: 10px; }
        .btn-destino:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #0d9488; background: #f0fdfa; }
      `}</style>
    </div>
  );
}