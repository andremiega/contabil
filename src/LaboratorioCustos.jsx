import React, { useState } from 'react';

export default function LaboratorioCustos() {
  // 10 Casos práticos vividos num "chão de fábrica" (Indústria de Móveis)
  const desafios = [
    { id: 1, nome: "Madeira MDF para os Móveis", dica: "Material principal que compõe fisicamente o produto final.", valor: 15000, classe: "custo", apropriacao: "direto", comportamento: "variavel" },
    { id: 2, nome: "Salário da Equipa de Vendas", dica: "Gasto com pessoal que vende o produto. Ocorre fora da fábrica (setor comercial).", valor: 6000, classe: "despesa" },
    { id: 3, nome: "Aluguer do Galpão da Fábrica", dica: "Gasto com o espaço de produção. O valor é igual todos os meses, independentemente da produção.", valor: 8000, classe: "custo", apropriacao: "indireto", comportamento: "fixo" },
    { id: 4, nome: "Madeira destruída por Inundação", dica: "Gasto anormal e imprevisível que não gerou nenhum benefício para a empresa.", valor: 3000, classe: "perda" },
    { id: 5, nome: "Energia Elétrica (Área de Produção)", dica: "Consumo das máquinas da fábrica. É difícil medir exatamente quanto cada móvel gasta de luz sem rateio. A conta sobe se produzir mais.", valor: 4500, classe: "custo", apropriacao: "indireto", comportamento: "variavel" },
    { id: 6, nome: "Compra de Nova Máquina de Corte", dica: "Gasto com um bem que vai durar anos na fábrica (vai para o Patrimônio, não para o resultado agora).", valor: 50000, classe: "investimento" },
    { id: 7, nome: "Salário dos Marceneiros", dica: "Mão de obra de quem põe a mão na massa. Têm ordenado fixo mensal em carteira.", valor: 12000, classe: "custo", apropriacao: "direto", comportamento: "fixo" },
    { id: 8, nome: "Campanha de Marketing (Google Ads)", dica: "Gasto para promover a marca, atrair clientes e vender.", valor: 2500, classe: "despesa" },
    { id: 9, nome: "Embalagens de Cartão Individuais", dica: "Caixa exata onde cada móvel é embalado. Fácil de contar 1 por produto.", valor: 1500, classe: "custo", apropriacao: "direto", comportamento: "variavel" },
    { id: 10, nome: "Depreciação das Máquinas (Linear)", dica: "Desgaste mensal dos equipamentos da fábrica. Valor constante pelo método linear.", valor: 2000, classe: "custo", apropriacao: "indireto", comportamento: "fixo" }
  ];

  const [indiceDesafio, setIndiceDesafio] = useState(0);
  const [etapaAtual, setEtapaAtual] = useState(0); // 0: Classe, 1: Apropriação (só se custo), 2: Comportamento (só se custo)
  const [selecao, setSelecao] = useState({ classe: null, apropriacao: null, comportamento: null });
  const [historicoCustos, setHistoricoCustos] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const desafioAtual = desafios[indiceDesafio];
  const concluido = indiceDesafio >= desafios.length;

  const formatarValor = (valor) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Cálculos do Mapa de Custos em Tempo Real
  const totais = historicoCustos.reduce((acc, curr) => {
    if (curr.classe === 'despesa') acc.despesas += curr.valor;
    if (curr.classe === 'perda') acc.perdas += curr.valor;
    if (curr.classe === 'investimento') acc.investimentos += curr.valor;
    if (curr.classe === 'custo') {
      acc.custos += curr.valor;
      if (curr.apropriacao === 'direto') acc.custosDiretos += curr.valor;
      if (curr.apropriacao === 'indireto') acc.custosIndiretos += curr.valor;
    }
    return acc;
  }, { custos: 0, despesas: 0, perdas: 0, investimentos: 0, custosDiretos: 0, custosIndiretos: 0 });

  const handleSelecao = (tipo, valor) => {
    if (tipo === 'classe') {
      if (valor === desafioAtual.classe) {
        setSelecao({ ...selecao, classe: valor });
        
        if (valor === 'custo') {
          // Se for custo, vai para o funil da indústria (etapa 1)
          setFeedback({ tipo: 'sucesso', msg: 'Correto! Sendo um Custo, precisamos descobrir se é Direto ou Indireto.' });
          setTimeout(() => { setEtapaAtual(1); setFeedback(null); }, 1200);
        } else {
          // Se não for custo, termina aqui e regista
          const novoRegistro = { ...desafioAtual, classeFinal: valor };
          setHistoricoCustos([...historicoCustos, novoRegistro]);
          setFeedback({ tipo: 'sucesso', msg: `Exato! Um(a) ${valor.toUpperCase()} não entra no custo do produto fabricado.` });
          
          setTimeout(() => {
            setIndiceDesafio(prev => prev + 1);
            setEtapaAtual(0);
            setSelecao({ classe: null, apropriacao: null, comportamento: null });
            setFeedback(null);
          }, 1800);
        }
      } else {
        setFeedback({ tipo: 'erro', msg: 'Atenção! Pense bem: Ocorreu na fábrica (Custo), na administração (Despesa), comprou um bem (Investimento) ou foi um desastre (Perda)?' });
      }
    } else if (tipo === 'apropriacao') {
      if (valor === desafioAtual.apropriacao) {
        setSelecao({ ...selecao, apropriacao: valor });
        setFeedback({ tipo: 'sucesso', msg: 'Perfeito! Agora, analise o comportamento deste gasto.' });
        setTimeout(() => { setEtapaAtual(2); setFeedback(null); }, 1200);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Lembre-se: Direto dá para medir por unidade (ex: 1 tábua por mesa). Indireto precisa de rateio matemático.' });
      }
    } else if (tipo === 'comportamento') {
      if (valor === desafioAtual.comportamento) {
        const novoRegistro = { ...desafioAtual, classeFinal: selecao.classe, apropriacaoFinal: selecao.apropriacao, comportamentoFinal: valor };
        setHistoricoCustos([...historicoCustos, novoRegistro]);
        setFeedback({ tipo: 'sucesso', msg: 'Excelente! Classificação industrial concluída e apropriada.' });
        
        setTimeout(() => {
          setIndiceDesafio(prev => prev + 1);
          setEtapaAtual(0);
          setSelecao({ classe: null, apropriacao: null, comportamento: null });
          setFeedback(null);
        }, 1800);
      } else {
        setFeedback({ tipo: 'erro', msg: 'Erro de comportamento. Fixo: não muda com a quantidade produzida. Variável: aumenta se eu produzir mais.' });
      }
    }
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '24px', animation: 'fadeIn 0.5s ease-out', minHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER EXPLICATIVO */}
      <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', color: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 280px' }}>
          <span style={{ backgroundColor: '#f59e0b', color: '#78350f', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>LABORATÓRIO INDUSTRIAL</span>
          <h2 style={{ margin: '8px 0', fontSize: '24px', fontWeight: '900' }}>Gestão de Custos e Fabrico 🏭</h2>
          <p style={{ margin: 0, color: '#fef3c7', fontSize: '14px', maxWidth: '650px' }}>
            Nem todo dinheiro que sai da empresa é custo. Passe pelo <strong>Funil da Produção</strong> e classifique corretamente os gastos para calcular o custo real dos produtos da nossa fábrica de móveis.
          </p>
        </div>
        <div style={{ flex: '1 1 auto', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#fde68a', fontWeight: 'bold', textTransform: 'uppercase' }}>Fatos Analisados</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>{historicoCustos.length} <span style={{fontSize:'14px'}}>/ 10</span></div>
        </div>
      </div>

      {!concluido ? (
        /* GRELHA INTELIGENTE: Adapta-se perfeitamente a telemóveis e tablets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', flex: 1 }}>
          
          {/* PAINEL ESQUERDO: O FUNIL DE DECISÃO */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>📋</span>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Analisar Gasto {indiceDesafio + 1}:</div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{desafioAtual.nome}</h3>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', color: '#f8fafc', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Valor do Gasto</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fcd34d' }}>{formatarValor(desafioAtual.valor)}</div>
              </div>
              <span style={{ fontSize: '28px' }}>💰</span>
            </div>

            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '12px', color: '#92400e', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
              <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal' }}>🦉 Dica do Engenheiro de Produção:</strong> {desafioAtual.dica}
            </div>

            {/* FLUXO DE DECISÃO (O FUNIL) */}
            <div style={{ flex: 1 }}>
              {etapaAtual === 0 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>Filtro 1: Terminologia Básica</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <button onClick={() => handleSelecao('classe', 'custo')} className="btn-classe btn-custo">
                      <span style={{ fontSize: '18px' }}>🏭</span> <strong>Custo</strong>
                      <span>Produção (Fábrica)</span>
                    </button>
                    <button onClick={() => handleSelecao('classe', 'despesa')} className="btn-classe btn-despesa">
                      <span style={{ fontSize: '18px' }}>🏢</span> <strong>Despesa</strong>
                      <span>Admin/Vendas</span>
                    </button>
                    <button onClick={() => handleSelecao('classe', 'investimento')} className="btn-classe btn-investimento">
                      <span style={{ fontSize: '18px' }}>🏗️</span> <strong>Investimento</strong>
                      <span>Bens duradouros</span>
                    </button>
                    <button onClick={() => handleSelecao('classe', 'perda')} className="btn-classe btn-perda">
                      <span style={{ fontSize: '18px' }}>🔥</span> <strong>Perda</strong>
                      <span>Consumo anormal</span>
                    </button>
                  </div>
                </div>
              )}

              {etapaAtual === 1 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>Filtro 2: Apropriação ao Produto</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => handleSelecao('apropriacao', 'direto')} className="btn-atividade">
                      <strong>🎯 Custo Direto (CD)</strong>
                      <span>Fácil de medir por unidade. Vai direto para o produto sem rateio.</span>
                    </button>
                    <button onClick={() => handleSelecao('apropriacao', 'indireto')} className="btn-atividade">
                      <strong>🧩 Custo Indireto (CIF)</strong>
                      <span>Difícil de medir por unidade. Exige cálculos e critérios de rateio.</span>
                    </button>
                  </div>
                </div>
              )}

              {etapaAtual === 2 && (
                <div className="animacao-entrada">
                  <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>Filtro 3: Comportamento com o Volume</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => handleSelecao('comportamento', 'fixo')} className="btn-atividade">
                      <strong>⚓ Custo Fixo</strong>
                      <span>Produzindo 0 ou 1000 móveis, o valor total no mês é o mesmo.</span>
                    </button>
                    <button onClick={() => handleSelecao('comportamento', 'variavel')} className="btn-atividade">
                      <strong>📈 Custo Variável</strong>
                      <span>Quanto mais móveis eu produzir, mais esse gasto aumenta.</span>
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

          {/* PAINEL DIREITO: MAPA DE CUSTOS E RESULTADOS */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)', color: '#e2e8f0', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <span style={{ fontSize: '18px' }}>📋</span> Mapa de Apuração Fabril
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              
              {/* CUSTOS DE PRODUÇÃO */}
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '6px' }}>
                  <strong style={{ color: '#60a5fa', fontSize: '14px' }}>Custos de Produção (CP)</strong>
                  <span style={{ color: '#bfdbfe', fontWeight: 'bold' }}>{formatarValor(totais.custos)}</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>↳ Custos Diretos:</span>
                    <span style={{ color: '#93c5fd' }}>{formatarValor(totais.custosDiretos)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>↳ Custos Indiretos (CIF):</span>
                    <span style={{ color: '#93c5fd' }}>{formatarValor(totais.custosIndiretos)}</span>
                  </div>
                </div>
              </div>

              {/* DESPESAS (DRE) */}
              <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#fb7185', fontSize: '14px' }}>Despesas do Período (DRE)</strong>
                  <span style={{ color: '#fecdd3', fontWeight: 'bold' }}>{formatarValor(totais.despesas)}</span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Afetam o lucro, mas não o produto.</span>
              </div>

              {/* PERDAS E INVESTIMENTOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                  <strong style={{ color: '#fb923c', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Perdas Anormais</strong>
                  <span style={{ color: '#fed7aa', fontWeight: 'bold', fontSize: '12px' }}>{formatarValor(totais.perdas)}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <strong style={{ color: '#34d399', fontSize: '11px', display: 'block', marginBottom: '4px' }}>CAPEX (Investimento)</strong>
                  <span style={{ color: '#a7f3d0', fontWeight: 'bold', fontSize: '12px' }}>{formatarValor(totais.investimentos)}</span>
                </div>
              </div>

              {/* LISTA DETALHADA */}
              {historicoCustos.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>Últimas Classificações</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {historicoCustos.slice().reverse().map((h, i) => (
                      <div key={i} style={{ backgroundColor: '#1e293b', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', fontSize: '11px' }}>{h.nome}</span>
                        <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {h.classeFinal === 'custo' ? `${h.apropriacaoFinal} / ${h.comportamentoFinal}` : h.classeFinal}
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
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #f59e0b', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '60px', marginBottom: '16px', display: 'block' }}>👷‍♂️</span>
          <h2 style={{ color: '#78350f', margin: '0 0 16px 0', fontSize: '28px', fontWeight: '900' }}>Gestor Industrial Aprovado!</h2>
          <p style={{ color: '#475569', fontSize: '15px', maxWidth: '600px', lineHeight: '1.6', marginBottom: '16px' }}>
            Parabéns! Você acaba de separar o joio do trigo. Entender que o <strong>Salário dos Vendedores</strong> é Despesa e a <strong>Energia da Máquina</strong> é Custo Indireto é o que separa empresas que dão lucro daquelas que calculam o preço de venda errado e vão à falência.
          </p>
          <div style={{ backgroundColor: '#fef3c7', padding: '12px 20px', borderRadius: '12px', color: '#92400e', marginBottom: '20px', fontWeight: 'bold' }}>
            Custo Total Fabricado: {formatarValor(totais.custos)}
          </div>
          <button 
            onClick={() => { setIndiceDesafio(0); setEtapaAtual(0); setSelecao({classe: null, apropriacao: null, comportamento: null}); setHistoricoCustos([]); }}
            style={{ padding: '14px 32px', backgroundColor: '#b45309', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(180,83,9,0.4)', width: '100%', maxWidth: '300px' }}
          >
            Refazer Mapa de Custos
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animacao-entrada { animation: fadeIn 0.4s ease-out; }
        
        .btn-classe { padding: 12px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
        .btn-classe strong { color: #0f172a; font-size: 14px; }
        .btn-classe span { color: #64748b; font-size: 10px; }
        .btn-classe:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        .btn-custo:hover { border-color: #3b82f6; background: #eff6ff; }
        .btn-despesa:hover { border-color: #f43f5e; background: #fff1f2; }
        .btn-investimento:hover { border-color: #10b981; background: #ecfdf5; }
        .btn-perda:hover { border-color: #f97316; background: #fff7ed; }
        
        .btn-atividade { padding: 14px; border-radius: 12px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; text-align: left; gap: 4px; }
        .btn-atividade strong { color: #0f172a; font-size: 14px; }
        .btn-atividade span { color: #64748b; font-size: 11px; }
        .btn-atividade:hover { border-color: #f59e0b; background: #fffbeb; padding-left: 16px; }
      `}</style>
    </div>
  );
}