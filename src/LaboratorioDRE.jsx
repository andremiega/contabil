import React, { useState } from 'react';

export default function LaboratorioDRE() {
  // 9 Blocos do Resultado para o aluno organizar na cascata correta
  const desafios = [
    { id: 1, nome: "Faturamento Total (Vendas de Balcão)", dica: "Tudo o que foi faturado no mês, o topo da pirâmide.", valor: 150000, etapa: "receita_bruta", sinal: "+" },
    { id: 2, nome: "ICMS e ISS sobre Vendas", dica: "Imposto gerado no momento da venda. O governo 'morde' logo no início.", valor: 27000, etapa: "deducoes", sinal: "-" },
    { id: 3, nome: "Custo da Mercadoria Vendida (CMV)", dica: "Quanto a empresa pagou ao fornecedor pelas exatas mercadorias que entregou aos clientes.", valor: 60000, etapa: "custos", sinal: "-" },
    { id: 4, nome: "Devolução de Mercadorias", dica: "Clientes que devolveram compras. Isto anula uma parte da venda original.", valor: 3000, etapa: "deducoes", sinal: "-" },
    { id: 5, nome: "Salário Administrativo e RH", dica: "Despesa geral da estrutura da empresa, não tem a ver com a fabricação.", valor: 15000, etapa: "despesas_operacionais", sinal: "-" },
    { id: 6, nome: "Conta de Energia, Água e Internet", dica: "Despesas fixas necessárias para manter as portas abertas.", valor: 4000, etapa: "despesas_operacionais", sinal: "-" },
    { id: 7, nome: "Rendimento de Aplicação (Poupança/CDB)", dica: "Dinheiro que rendeu no banco. É um ganho da operação, mas financeiro.", valor: 2000, etapa: "receitas_operacionais", sinal: "+" },
    { id: 8, nome: "Comissão dos Vendedores", dica: "Gasto com o esforço de vendas, calculado após a mercadoria sair.", valor: 7500, etapa: "despesas_operacionais", sinal: "-" },
    { id: 9, nome: "Provisão de IRPJ e CSLL", dica: "O Leão (Imposto de Renda) só ataca no final, caso exista lucro na operação.", valor: 8550, etapa: "impostos_lucro", sinal: "-" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [historicoDRE, setHistoricoDRE] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Motor de Cálculo da Cascata da DRE
  const sumEtapa = (etapaFilter) => historicoDRE.filter(h => h.etapa === etapaFilter).reduce((acc, curr) => acc + curr.valor, 0);

  const receitaBruta = sumEtapa('receita_bruta');
  const deducoes = sumEtapa('deducoes');
  const receitaLiquida = receitaBruta - deducoes;
  
  const custos = sumEtapa('custos');
  const lucroBruto = receitaLiquida - custos;
  
  const despesasOp = sumEtapa('despesas_operacionais');
  const receitasOp = sumEtapa('receitas_operacionais');
  const resultadoAntesIR = lucroBruto - despesasOp + receitasOp;
  
  const impostosLucro = sumEtapa('impostos_lucro');
  const lucroLiquido = resultadoAntesIR - impostosLucro;

  const handleSelecao = (etapaSelecionada) => {
    if (etapaSelecionada === desafioAtual.etapa) {
      setHistoricoDRE([...historicoDRE, desafioAtual]);
      setFeedback({ tipo: 'sucesso', msg: 'Perfeito! Encaixe estrutural correto na cascata.' });
      
      setTimeout(() => {
        setIndiceDesafio(prev => prev + 1);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ tipo: 'erro', msg: 'Posição incorreta. Lembre-se da ordem: Venda Bruta > Deduções > Custo (CMV) > Despesas/Receitas Diversas > Impostos sobre Lucro.' });
    }
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER DA DRE */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>LABORATÓRIO DE RESULTADOS</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Demonstração do Resultado (DRE) 📊</h2>
          <p style={{ margin: 0, color: '#bfdbfe', fontSize: '14px', maxWidth: '650px' }}>
            A DRE é uma cascata rigorosa governada pelo <strong>Regime de Competência</strong>. Encaixe os blocos financeiros na ordem exata para revelar se a operação deu Lucro ou Prejuízo.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 'bold', textTransform: 'uppercase' }}>Blocos Alocados</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>{historicoDRE.length} <span style={{fontSize:'14px'}}>/ 9</span></div>
        </div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: BLOCO A CLASSIFICAR */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>🧩</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Encaixe o Bloco {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', color: '#f8fafc', marginBottom: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Valor do Fato Contábil</span>
              <div style={{ fontSize: '24px', fontWeight: '900', color: desafioAtual.sinal === '+' ? '#4ade80' : '#f87171' }}>
                {desafioAtual.sinal} {formatarValor(desafioAtual.valor)}
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '12px', color: '#92400e', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica do Controller:</strong> {desafioAtual.dica}
            </div>

            {/* BOTÕES DE ENCAIXE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>Em qual degrau da DRE este valor entra?</div>
              
              <button onClick={() => handleSelecao('receita_bruta')} className="btn-degrau btn-receita">1. Receita Bruta (Faturamento)</button>
              <button onClick={() => handleSelecao('deducoes')} className="btn-degrau btn-deducao">2. Deduções (Impostos / Devoluções)</button>
              <button onClick={() => handleSelecao('custos')} className="btn-degrau btn-custo">3. Custos (CMV - Valor de compra)</button>
              <button onClick={() => handleSelecao('despesas_operacionais')} className="btn-degrau btn-despesa">4. Despesas Operacionais (Admin/Vendas)</button>
              <button onClick={() => handleSelecao('receitas_operacionais')} className="btn-degrau btn-receita-op">5. Outras Receitas Operacionais</button>
              <button onClick={() => handleSelecao('impostos_lucro')} className="btn-degrau btn-imposto">6. Impostos sobre o Lucro (IRPJ/CSLL)</button>
            </div>

            {feedback && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: feedback.tipo === 'sucesso' ? '#dcfce7' : '#fee2e2', border: `1px solid ${feedback.tipo === 'sucesso' ? '#86efac' : '#fca5a5'}`, color: feedback.tipo === 'sucesso' ? '#166534' : '#991b1b', animation: 'fadeIn 0.3s' }}>
                <span style={{ fontSize: '20px' }}>{feedback.tipo === 'sucesso' ? '✅' : '🚨'}</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{feedback.msg}</span>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO: A CASCATA DA DRE */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>📉</span> Cascata da DRE em Tempo Real
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontFamily: 'monospace' }}>
              
              {/* NÍVEL 1: RECEITA BRUTA */}
              <div className="dre-linha titulo">(=) Receita Bruta de Vendas</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'receita_bruta').map(h => <div key={h.id} className="dre-item positivo">{h.nome}: + {formatarValor(h.valor)}</div>)}
              </div>
              <div className="dre-subtotal">{formatarValor(receitaBruta)}</div>

              {/* NÍVEL 2: DEDUÇÕES */}
              <div className="dre-linha">(-) Deduções e Impostos sobre Venda</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'deducoes').map(h => <div key={h.id} className="dre-item negativo">{h.nome}: - {formatarValor(h.valor)}</div>)}
              </div>

              {/* SUBTOTAL: RECEITA LÍQUIDA */}
              <div className="dre-linha destaque">(=) Receita Líquida <span style={{ float: 'right', color: '#4ade80' }}>{formatarValor(receitaLiquida)}</span></div>

              {/* NÍVEL 3: CUSTOS */}
              <div className="dre-linha">(-) Custo da Mercadoria Vendida (CMV)</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'custos').map(h => <div key={h.id} className="dre-item negativo">{h.nome}: - {formatarValor(h.valor)}</div>)}
              </div>

              {/* SUBTOTAL: LUCRO BRUTO */}
              <div className="dre-linha destaque">(=) Lucro Bruto <span style={{ float: 'right', color: lucroBruto >= 0 ? '#4ade80' : '#f87171' }}>{formatarValor(lucroBruto)}</span></div>

              {/* NÍVEL 4: DESPESAS E RECEITAS OPERACIONAIS */}
              <div className="dre-linha">(-) Despesas Operacionais</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'despesas_operacionais').map(h => <div key={h.id} className="dre-item negativo">{h.nome}: - {formatarValor(h.valor)}</div>)}
              </div>
              
              <div className="dre-linha">(+) Outras Receitas Operacionais</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'receitas_operacionais').map(h => <div key={h.id} className="dre-item positivo">{h.nome}: + {formatarValor(h.valor)}</div>)}
              </div>

              {/* SUBTOTAL: LAIR */}
              <div className="dre-linha destaque">(=) Resultado Antes IR (LAIR) <span style={{ float: 'right', color: resultadoAntesIR >= 0 ? '#4ade80' : '#f87171' }}>{formatarValor(resultadoAntesIR)}</span></div>

              {/* NÍVEL 5: IMPOSTOS SOBRE LUCRO */}
              <div className="dre-linha">(-) Provisão para IRPJ e CSLL</div>
              <div className="dre-valores">
                {historicoDRE.filter(h => h.etapa === 'impostos_lucro').map(h => <div key={h.id} className="dre-item negativo">{h.nome}: - {formatarValor(h.valor)}</div>)}
              </div>

              {/* FINAL: LUCRO LÍQUIDO */}
              <div className="dre-linha super-destaque" style={{ backgroundColor: lucroLiquido >= 0 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)', borderColor: lucroLiquido >= 0 ? '#4ade80' : '#f87171' }}>
                (=) Resultado Líquido
                <span style={{ float: 'right', color: lucroLiquido >= 0 ? '#4ade80' : '#f87171', fontSize: '16px' }}>{formatarValor(lucroLiquido)}</span>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* TELA DE CONCLUSÃO */
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #3b82f6', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', display: 'block' }}>💼</span>
          <h2 style={{ color: '#1e3a8a', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '900' }}>Controller Financeiro Aprovado!</h2>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '20px' }}>
            Dominou a cascata da DRE. Entendeu perfeitamente que o <strong>Lucro Bruto</strong> é o que sobra após pagar o fornecedor, e que o <strong>Lucro Líquido</strong> é o que sobra no final de tudo para distribuir aos sócios.
          </p>
          <div style={{ backgroundColor: lucroLiquido >= 0 ? '#dcfce7' : '#fee2e2', padding: '14px 24px', borderRadius: '12px', color: lucroLiquido >= 0 ? '#166534' : '#991b1b', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px', border: `1px solid ${lucroLiquido >= 0 ? '#4ade80' : '#f87171'}` }}>
            {lucroLiquido >= 0 ? 'LUCRO APURADO: ' : 'PREJUÍZO APURADO: '} {formatarValor(lucroLiquido)}
          </div>
          <button 
            onClick={() => { setIndiceDesafio(0); setHistoricoDRE([]); }}
            style={{ padding: '14px 32px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(30,58,138,0.4)', width: '100%', maxWidth: '300px' }}
          >
            Refazer a DRE
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-degrau { padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; text-align: left; font-weight: bold; font-size: 12px; color: #334155; }
        .btn-degrau:hover { transform: translateX(4px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .btn-receita:hover { border-color: #3b82f6; background: #eff6ff; }
        .btn-deducao:hover { border-color: #f59e0b; background: #fffbeb; }
        .btn-custo:hover { border-color: #f97316; background: #fff7ed; }
        .btn-despesa:hover { border-color: #f43f5e; background: #fff1f2; }
        .btn-receita-op:hover { border-color: #10b981; background: #ecfdf5; }
        .btn-imposto:hover { border-color: #8b5cf6; background: #faf5ff; }

        /* Estilos da Cascata DRE */
        .dre-linha { padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 13px; margin-top: 6px; }
        .dre-linha.titulo { color: #f8fafc; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 4px; }
        .dre-linha.destaque { color: #f8fafc; border-top: 1px dashed #334155; border-bottom: 1px solid #334155; padding: 10px 0; background: rgba(255,255,255,0.02); }
        .dre-linha.super-destaque { margin-top: 16px; padding: 14px; border-radius: 8px; border: 1px solid transparent; font-size: 15px; font-weight: 900; color: white; }
        
        .dre-valores { padding-left: 12px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
        .dre-item { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.2); border-left: 2px solid; }
        .dre-item.positivo { color: #a7f3d0; border-color: #4ade80; }
        .dre-item.negativo { color: #fecaca; border-color: #f87171; }
        
        .dre-subtotal { text-align: right; font-weight: bold; color: #4ade80; padding: 6px 0; font-size: 14px; }
      `}</style>
    </div>
  );
}