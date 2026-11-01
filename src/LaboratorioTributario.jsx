import React, { useState } from 'react';

export default function LaboratorioTributario() {
  // 16 Casos Fiscais - Operações de Compra, Venda, Serviços e Imobilizado
  const desafios = [
    { id: 1, tributo: "IBS", operacao: "Compra de Lote de Mercadorias", dica: "Toda compra de itens para revenda dá direito a descontar o imposto pago. Isso gera um Direito (Ativo).", base: 10000, taxa: 10, valor: 1000, natureza: "credito", conta: "ibs_recuperar" },
    { id: 2, tributo: "CBS", operacao: "Compra de Lote de Mercadorias", dica: "Na mesma nota fiscal, a parcela federal (União) também gera um direito a recuperar.", base: 10000, taxa: 5, valor: 500, natureza: "credito", conta: "cbs_recuperar" },
    { id: 3, tributo: "IBS", operacao: "Venda de Mercadorias no Balcão", dica: "Vendeu? Faturou? Então você gerou uma dívida com o Governo. Isso é uma Obrigação (Passivo).", base: 20000, taxa: 10, valor: 2000, natureza: "debito", conta: "ibs_recolher" },
    { id: 4, tributo: "CBS", operacao: "Venda de Mercadorias no Balcão", dica: "A fatia federal da venda que acabou de realizar. Mais uma obrigação (Passivo) a ser registrada.", base: 20000, taxa: 5, valor: 1000, natureza: "debito", conta: "cbs_recolher" },
    { id: 5, tributo: "IBS", operacao: "Aquisição de Máquina Industrial", dica: "No novo IVA Dual, comprar bens para o Ativo Imobilizado dá direito a crédito imediato!", base: 50000, taxa: 10, valor: 5000, natureza: "credito", conta: "ibs_recuperar" },
    { id: 6, tributo: "CBS", operacao: "Fatura de Energia Elétrica (Fábrica)", dica: "Serviços essenciais para a operação também geram créditos tributários (Ativo).", base: 4000, taxa: 5, valor: 200, natureza: "credito", conta: "cbs_recuperar" },
    { id: 7, tributo: "IBS", operacao: "Prestação de Serviço de Manutenção", dica: "A Reforma Tributária unificou os impostos. Prestou serviço? Paga IBS (Passivo).", base: 8000, taxa: 10, valor: 800, natureza: "debito", conta: "ibs_recolher" },
    { id: 8, tributo: "CBS", operacao: "Prestação de Serviço de Manutenção", dica: "O mesmo serviço sofre a incidência da contribuição federal (Passivo).", base: 8000, taxa: 5, valor: 400, natureza: "debito", conta: "cbs_recolher" },
    { id: 9, tributo: "IBS", operacao: "Compra de Matéria-Prima (MDF)", dica: "Insumos de fabricação entram no caixa gerando direito a compensação futura (Ativo).", base: 15000, taxa: 10, valor: 1500, natureza: "credito", conta: "ibs_recuperar" },
    { id: 10, tributo: "CBS", operacao: "Compra de Matéria-Prima (MDF)", dica: "Direito de abater o imposto federal que você pagou ao fornecedor do MDF.", base: 15000, taxa: 5, valor: 750, natureza: "credito", conta: "cbs_recuperar" },
    { id: 11, tributo: "IBS", operacao: "Venda de Móveis Fabricados", dica: "A indústria vendeu o lote. Nasce a obrigação de pagar o imposto estadual/municipal.", base: 30000, taxa: 10, valor: 3000, natureza: "debito", conta: "ibs_recolher" },
    { id: 12, tributo: "CBS", operacao: "Venda de Móveis Fabricados", dica: "Obrigação federal gerada pela mesma nota de venda dos móveis recém-fabricados.", base: 30000, taxa: 5, valor: 1500, natureza: "debito", conta: "cbs_recolher" },
    { id: 13, tributo: "CBS", operacao: "Pagamento de Frete Terceirizado", dica: "O frete é um serviço essencial da cadeia produtiva e gera crédito tributário (Ativo).", base: 2000, taxa: 5, valor: 100, natureza: "credito", conta: "cbs_recuperar" },
    { id: 14, tributo: "IBS", operacao: "Licenciamento de Software de Gestão", dica: "A nova regra permite tomar crédito de softwares essenciais para a empresa (Ativo).", base: 1000, taxa: 10, valor: 100, natureza: "credito", conta: "ibs_recuperar" },
    { id: 15, tributo: "IBS", operacao: "Grande Faturamento de Fim de Ano", dica: "Uma mega venda! Vai gerar um passivo (imposto a pagar) muito elevado.", base: 60000, taxa: 10, valor: 6000, natureza: "debito", conta: "ibs_recolher" },
    { id: 16, tributo: "CBS", operacao: "Grande Faturamento de Fim de Ano", dica: "A parcela federal dessa mega venda que deverá ser recolhida ao governo.", base: 60000, taxa: 5, valor: 3000, natureza: "debito", conta: "cbs_recolher" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0: Natureza (Compra/Venda), 1: Conta (Recuperar/Recolher)
  const [selecao, setSelecao] = useState({ natureza: null });
  const [historicoTributos, setHistoricoTributos] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Motor de Apuração da Conta Corrente Fiscal (Não-Cumulatividade)
  const totalIbsRecuperar = historicoTributos.filter(h => h.conta === 'ibs_recuperar').reduce((acc, curr) => acc + curr.valor, 0);
  const totalIbsRecolher = historicoTributos.filter(h => h.conta === 'ibs_recolher').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoIbs = totalIbsRecolher - totalIbsRecuperar;

  const totalCbsRecuperar = historicoTributos.filter(h => h.conta === 'cbs_recuperar').reduce((acc, curr) => acc + curr.valor, 0);
  const totalCbsRecolher = historicoTributos.filter(h => h.conta === 'cbs_recolher').reduce((acc, curr) => acc + curr.valor, 0);
  const saldoCbs = totalCbsRecolher - totalCbsRecuperar;

  const handleSelecao = (tipo, valor) => {
    if (tipo === 'natureza') {
      if (valor === desafioAtual.natureza) {
        setSelecao({ natureza: valor });
        setFeedback({ tipo: 'sucesso', msg: 'Correto! Agora, qual é a Conta Contábil exata no Balanço?' });
        setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1200);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Atenção! Entradas/Compras geram DIREITOS (Crédito). Saídas/Vendas geram OBRIGAÇÕES (Débito).' });
      }
    } else if (tipo === 'conta') {
      if (valor === desafioAtual.conta) {
        setHistoricoTributos([...historicoTributos, desafioAtual]);
        setFeedback({ tipo: 'sucesso', msg: `Perfeito! O valor de ${formatarValor(desafioAtual.valor)} foi alocado na conta corrente fiscal.` });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ natureza: null });
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Erro de conta! Lembre-se: "A Recuperar" é sempre no Ativo (Direito). "A Recolher" é sempre no Passivo (Dívida) e respeite a sigla (IBS ou CBS)!' });
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #312e81 100%)', color: 'white', padding: '24px 32px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ backgroundColor: '#8b5cf6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>CERTIFICAÇÃO FISCAL: REFORMA TRIBUTÁRIA</span>
          <h2 style={{ margin: '8px 0', fontSize: '28px', fontWeight: '900' }}>Engenharia Tributária (IBS / CBS) ⚖️</h2>
          <p style={{ margin: 0, color: '#ddd6fe', fontSize: '14px', maxWidth: '650px' }}>
            Domine o conceito de <strong>Não-Cumulatividade (IVA Dual)</strong>. Desconte os impostos das suas compras e pague o imposto das suas vendas para apurar a guia líquida do mês.
          </p>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 'bold', textTransform: 'uppercase' }}>Notas Apuradas</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff' }}>{historicoTributos.length} <span style={{fontSize:'16px'}}>/ 16</span></div>
        </div>
      </div>

      {/* BARRA DE PROGRESSO GLOBAL */}
      <div style={{ backgroundColor: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${(historicoTributos.length / desafios.length) * 100}%`, backgroundColor: '#8b5cf6', height: '100%', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
      </div>

      {!concluido ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: AUDITORIA DA NOTA FISCAL */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#f3e8ff', borderRadius: '12px' }}>🧾</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Auditoria da Nota Fiscal {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>{desafioAtual.operacao}</h3>
              </div>
            </div>

            {/* RESUMO DA NOTA FISCAL */}
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', color: '#f8fafc', marginBottom: '20px', borderLeft: `6px solid ${desafioAtual.tributo === 'IBS' ? '#38bdf8' : '#fbbf24'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Base de Cálculo (Valor da Nota):</span>
                <strong>{formatarValor(desafioAtual.base)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Taxa do Tributo Destacado:</span>
                <strong>{desafioAtual.taxa}% de {desafioAtual.tributo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#c4b5fd', fontWeight: 'bold' }}>Valor Tributário a Classificar:</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#8b5cf6' }}>{formatarValor(desafioAtual.valor)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', color: '#166534', fontSize: '13.5px', fontStyle: 'italic', marginBottom: '24px', borderLeft: '4px solid #4ade80' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica do Auditor Fiscal:</strong> {desafioAtual.dica}
            </div>

            {/* FLUXO DE DECISÃO */}
            <div style={{ flex: 1 }}>
              {etapaAtual === 0 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 1: Qual é a Natureza desta operação?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button onClick={() => handleSelecao('natureza', 'credito')} className="btn-fiscal btn-credito">
                      <span style={{ fontSize: '20px' }}>🛒</span> <strong>Entrada / Compra</strong>
                      <span>Gera Crédito (Direito de Abater)</span>
                    </button>
                    <button onClick={() => handleSelecao('natureza', 'debito')} className="btn-fiscal btn-debito">
                      <span style={{ fontSize: '20px' }}>🏷️</span> <strong>Saída / Venda</strong>
                      <span>Gera Débito (Obrigação de Pagar)</span>
                    </button>
                  </div>
                </div>
              )}

              {etapaAtual === 1 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Passo 2: Destino Contábil (Conta)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {selecao.natureza === 'credito' ? (
                      <>
                        <button onClick={() => handleSelecao('conta', 'ibs_recuperar')} className="btn-conta">
                          <strong>IBS a Recuperar (Ativo)</strong>
                          <span>Imposto Estadual/Municipal</span>
                        </button>
                        <button onClick={() => handleSelecao('conta', 'cbs_recuperar')} className="btn-conta">
                          <strong>CBS a Recuperar (Ativo)</strong>
                          <span>Contribuição Federal</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleSelecao('conta', 'ibs_recolher')} className="btn-conta">
                          <strong>IBS a Recolher (Passivo)</strong>
                          <span>Imposto Estadual/Municipal</span>
                        </button>
                        <button onClick={() => handleSelecao('conta', 'cbs_recolher')} className="btn-conta">
                          <strong>CBS a Recolher (Passivo)</strong>
                          <span>Contribuição Federal</span>
                        </button>
                      </>
                    )}
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

          {/* PAINEL DIREITO: CONTA CORRENTE FISCAL (APURAÇÃO) */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '24px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>⚖️</span> Apuração do IVA Dual
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px' }}>
              
              {/* BLOCO IBS */}
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '8px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '15px' }}>Conta: IBS (Estados / Municípios)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>(+) Débitos pelas Vendas (A Recolher):</span>
                  <span style={{ color: '#f87171' }}>{formatarValor(totalIbsRecolher)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>(-) Créditos por Compras (A Recuperar):</span>
                  <span style={{ color: '#4ade80' }}>{formatarValor(totalIbsRecuperar)}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${saldoIbs > 0 ? '#f87171' : '#4ade80'}` }}>
                  <strong style={{ color: saldoIbs > 0 ? '#fca5a5' : '#86efac' }}>{saldoIbs > 0 ? 'SALDO A PAGAR' : 'SALDO CREDOR'}</strong>
                  <strong style={{ color: saldoIbs > 0 ? '#f87171' : '#4ade80' }}>{formatarValor(Math.abs(saldoIbs))}</strong>
                </div>
              </div>

              {/* BLOCO CBS */}
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(251,191,36,0.2)', paddingBottom: '8px' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '15px' }}>Conta: CBS (União / Federal)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>(+) Débitos pelas Vendas (A Recolher):</span>
                  <span style={{ color: '#f87171' }}>{formatarValor(totalCbsRecolher)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>(-) Créditos por Compras (A Recuperar):</span>
                  <span style={{ color: '#4ade80' }}>{formatarValor(totalCbsRecuperar)}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${saldoCbs > 0 ? '#f87171' : '#4ade80'}` }}>
                  <strong style={{ color: saldoCbs > 0 ? '#fca5a5' : '#86efac' }}>{saldoCbs > 0 ? 'SALDO A PAGAR' : 'SALDO CREDOR'}</strong>
                  <strong style={{ color: saldoCbs > 0 ? '#f87171' : '#4ade80' }}>{formatarValor(Math.abs(saldoCbs))}</strong>
                </div>
              </div>

              {/* LISTA DETALHADA */}
              {historicoTributos.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' }}>Registro Diário Fiscal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {historicoTributos.slice().reverse().map((h, i) => (
                      <div key={i} style={{ backgroundColor: '#1e293b', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${h.natureza === 'credito' ? '#4ade80' : '#f87171'}` }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', fontSize: '12px' }}>{h.operacao}</span>
                        <span style={{ fontSize: '10px', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {h.tributo} {h.natureza === 'credito' ? 'Recuperar' : 'Recolher'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO */
        <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #8b5cf6', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '72px', marginBottom: '20px' }}>🥇</span>
          <h2 style={{ color: '#4c1d95', margin: '0 0 16px 0', fontSize: '36px', fontWeight: '900' }}>Tributarista Aprovado!</h2>
          <p style={{ color: '#475569', fontSize: '16px', maxWidth: '650px', lineHeight: '1.6' }}>
            Sensacional! Você dominou o conceito mais importante da nova Reforma Tributária. Compras geram <strong>Direito (Ativo)</strong> e Vendas geram <strong>Obrigação (Passivo)</strong>. No final do mês, a empresa só paga ao governo a diferença líquida (Saldo a Pagar).
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '16px 24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Guia Final IBS:</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: saldoIbs > 0 ? '#dc2626' : '#16a34a' }}>{formatarValor(Math.abs(saldoIbs))}</div>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', padding: '16px 24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Guia Final CBS:</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: saldoCbs > 0 ? '#dc2626' : '#16a34a' }}>{formatarValor(Math.abs(saldoCbs))}</div>
            </div>
          </div>
          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({natureza: null}); setHistoricoTributos([]); }}
            style={{ marginTop: '30px', padding: '16px 36px', backgroundColor: '#6d28d9', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(109,40,217,0.4)', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Refazer Apuração de IVA
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animacao-entrada { animation: fadeIn 0.4s ease-out; }
        
        .btn-fiscal { padding: 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
        .btn-fiscal strong { color: #0f172a; font-size: 15px; }
        .btn-fiscal span { color: #64748b; font-size: 11px; }
        .btn-fiscal:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        .btn-credito:hover { border-color: #4ade80; background: #f0fdf4; }
        .btn-debito:hover { border-color: #f87171; background: #fef2f2; }
        
        .btn-conta { padding: 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; text-align: left; gap: 4px; }
        .btn-conta strong { color: #0f172a; font-size: 14px; }
        .btn-conta span { color: #64748b; font-size: 11px; }
        .btn-conta:hover { border-color: #8b5cf6; background: #faf5ff; padding-left: 20px; }
      `}</style>
    </div>
  );
}