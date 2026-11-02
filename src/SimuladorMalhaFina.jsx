import React, { useState, useEffect } from 'react';

export default function SimuladorMalhaFina() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Dados Declarados pelo Contribuinte (DIRPF)
  const [rendimentoTributavelStr, setRendimentoTributavelStr] = useState('75000');
  const [despesaMedicaStr, setDespesaMedicaStr] = useState('18000');
  const [rendimentoAluguelStr, setRendimentoAluguelStr] = useState('0');
  const [impostoRetidoFonteStr, setImpostoRetidoFonteStr] = useState('8500');

  // 2. Bases Oficiais Cruzadas pela Receita Federal
  const [dirfFontePagadoraStr, setDirfFontePagadoraStr] = useState('85000'); 
  const [dmedClinicasStr, setDmedClinicasStr] = useState('6000'); 
  const [dimobImobiliariasStr, setDimobImobiliariasStr] = useState('12000'); 
  const [movimentacaoBancariaStr, setMovimentacaoBancariaStr] = useState('140000'); 

  // 3. Resultados da Auditoria Eletrônica
  const [resultadoAuditoria, setResultadoAuditoria] = useState({
    status: 'processando', 
    inconsistencias: [],
    impostoOmitidoEstimado: 0,
    multaOficio75: 0,
    totalAutuacao: 0
  });

  useEffect(() => {
    const rendDeclarado = parseFloat(rendimentoTributavelStr) || 0;
    const despMedDeclarada = parseFloat(despesaMedicaStr) || 0;
    const aluguelDeclarado = parseFloat(rendimentoAluguelStr) || 0;

    const rendDirf = parseFloat(dirfFontePagadoraStr) || 0;
    const dmedOficial = parseFloat(dmedClinicasStr) || 0;
    const dimobOficial = parseFloat(dimobImobiliariasStr) || 0;
    const movBanco = parseFloat(movimentacaoBancariaStr) || 0;

    const inconsistencias = [];
    let baseOmitida = 0;

    if (rendDirf > rendDeclarado) {
      const dif = rendDirf - rendDeclarado;
      baseOmitida += dif;
      inconsistencias.push({
        id: 'dirf',
        cruzamento: 'DIRPF × DIRF (Fontes Pagadoras)',
        descricao: `Omissão de rendimentos do trabalho. A fonte declarou ${formatMoeda(rendDirf)}, mas constam apenas ${formatMoeda(rendDeclarado)}.`,
        diferenca: dif,
        gravidade: 'alta'
      });
    }

    if (despMedDeclarada > dmedOficial) {
      const glosa = despMedDeclarada - dmedOficial;
      baseOmitida += glosa;
      inconsistencias.push({
        id: 'dmed',
        cruzamento: 'DIRPF × DMED (Clínicas e Planos de Saúde)',
        descricao: `Dedução médica sem correspondência. Lançados ${formatMoeda(despMedDeclarada)}, clínicas comprovaram ${formatMoeda(dmedOficial)}.`,
        diferenca: glosa,
        gravidade: 'alta'
      });
    }

    if (dimobOficial > aluguelDeclarado) {
      const aluguelOmitido = dimobOficial - aluguelDeclarado;
      baseOmitida += aluguelOmitido;
      inconsistencias.push({
        id: 'dimob',
        cruzamento: 'DIRPF × DIMOB (Imobiliárias e Locações)',
        descricao: `Rendimentos de aluguel não informados. A imobiliária declarou repasse de ${formatMoeda(dimobOficial)}.`,
        diferenca: aluguelOmitido,
        gravidade: 'media'
      });
    }

    const totalRendaDeclarada = rendDeclarado + aluguelDeclarado;
    if (movBanco > (totalRendaDeclarada * 1.5) && totalRendaDeclarada > 0) {
      inconsistencias.push({
        id: 'efinanceira',
        cruzamento: 'DIRPF × e-Financeira (Movimentação Bancária)',
        descricao: `Movimentação bancária (${formatMoeda(movBanco)}) é desproporcional à renda declarada (${formatMoeda(totalRendaDeclarada)}). Risco de presunção de omissão.`,
        diferenca: movBanco - totalRendaDeclarada,
        gravidade: 'critica'
      });
    }

    const impostoDevido = baseOmitida * 0.275;
    const multa75 = impostoDevido * 0.75; 
    const totalPagar = impostoDevido + multa75;

    let statusCalculado = 'liberada';
    if (inconsistencias.length > 0) {
      statusCalculado = inconsistencias.some(i => i.gravidade === 'critica' || i.gravidade === 'alta') ? 'retida' : 'alerta';
    }

    setResultadoAuditoria({
      status: statusCalculado,
      inconsistencias,
      impostoOmitidoEstimado: impostoDevido,
      multaOficio75: multa75,
      totalAutuacao: totalPagar
    });
  }, [rendimentoTributavelStr, despesaMedicaStr, rendimentoAluguelStr, dirfFontePagadoraStr, dmedClinicasStr, dimobImobiliariasStr, movimentacaoBancariaStr]);

  const resolverInconsistencias = () => {
    setRendimentoTributavelStr(dirfFontePagadoraStr);
    setDespesaMedicaStr(dmedClinicasStr);
    setRendimentoAluguelStr(dimobImobiliariasStr);
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🔍</span> Simulador de Malha Fina & Auditoria Fiscal (e-CAC)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Cruzamento automatizado da Receita Federal: DIRPF × DIRF × DMED × DIMOB × e-Financeira.
          </p>
        </div>

        <button 
          onClick={resolverInconsistencias}
          style={{ padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxSizing: 'border-box' }}
        >
          <span>✍️</span> Enviar Declaração Retificadora
        </button>
      </div>

      {/* DASHBOARDS DE STATUS E RISCO DE AUTUAÇÃO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* Card Status do e-CAC */}
        <div style={{ 
          backgroundColor: resultadoAuditoria.status === 'retida' ? '#fef2f2' : resultadoAuditoria.status === 'alerta' ? '#fffbeb' : '#f0fdf4', 
          padding: '16px', 
          borderRadius: '16px', 
          border: `1px solid ${resultadoAuditoria.status === 'retida' ? '#fecaca' : resultadoAuditoria.status === 'alerta' ? '#fde68a' : '#86efac'}`, 
          borderLeft: `4px solid ${resultadoAuditoria.status === 'retida' ? '#dc2626' : resultadoAuditoria.status === 'alerta' ? '#d97706' : '#16a34a'}`,
          boxSizing: 'border-box',
          minWidth: 0
        }}>
          <span style={{ color: resultadoAuditoria.status === 'retida' ? '#991b1b' : resultadoAuditoria.status === 'alerta' ? '#92400e' : '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Status no Portal e-CAC
          </span>
          <strong style={{ display: 'block', color: resultadoAuditoria.status === 'retida' ? '#dc2626' : resultadoAuditoria.status === 'alerta' ? '#b45309' : '#15803d', fontSize: '17px', marginTop: '4px', wordBreak: 'break-word' }}>
            {resultadoAuditoria.status === 'retida' ? '🚨 RETIDA EM MALHA' : resultadoAuditoria.status === 'alerta' ? '⚠️ EM PROCESSAMENTO' : '✅ LIBERADA / SEM PENDÊNCIAS'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            {resultadoAuditoria.inconsistencias.length} inconsistência(s) detectada(s)
          </span>
        </div>

        {/* Card Diferença de Imposto */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>IRPF Suprimido (27,5%)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(resultadoAuditoria.impostoOmitidoEstimado)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Imposto principal recalculado</span>
        </div>

        {/* Card Multa de Ofício */}
        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Multa de Ofício RFB (75%)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(resultadoAuditoria.multaOficio75)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b', wordBreak: 'break-word' }}>Penalidade por lançamento</span>
        </div>

        {/* Card Auto de Infração Total */}
        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Risco de Notificação Total</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(resultadoAuditoria.totalAutuacao)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Imposto + Multa (sem Selic)</span>
        </div>
      </div>

      {/* ÁREA DE ENTRADA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* Painel Esquerdo: O que o Contribuinte Informou na DIRPF */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>Declarado pelo Contribuinte (DIRPF)</h3>
            <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Contribuinte</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Rendimentos Tributáveis (Salários):</label>
              <input type="text" value={rendimentoTributavelStr} onChange={e => setRendimentoTributavelStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Despesas Médicas (Deduções):</label>
              <input type="text" value={despesaMedicaStr} onChange={e => setDespesaMedicaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Rendimentos de Aluguéis Recebidos:</label>
              <input type="text" value={rendimentoAluguelStr} onChange={e => setRendimentoAluguelStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Imposto de Renda Retido na Fonte (IRRF):</label>
              <input type="text" value={impostoRetidoFonteStr} onChange={e => setImpostoRetidoFonteStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Painel Direito: Bases de Terceiros da Receita Federal */}
        <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>Malha de Terceiros (Auditoria RFB)</h3>
            <span style={{ fontSize: '10px', backgroundColor: '#0f172a', color: 'white', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Cruzamento</span>
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>DIRF - Informado pela Empresa Empregadora:</label>
            <input type="text" value={dirfFontePagadoraStr} onChange={e => setDirfFontePagadoraStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>DMED - Informado por Clínicas e Médicos:</label>
            <input type="text" value={dmedClinicasStr} onChange={e => setDmedClinicasStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>DIMOB - Informado por Imobiliárias:</label>
            <input type="text" value={dimobImobiliariasStr} onChange={e => setDimobImobiliariasStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>e-Financeira - Movimentação Bancária Global:</label>
            <input type="text" value={movimentacaoBancariaStr} onChange={e => setMovimentacaoBancariaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, backgroundColor: 'white' }} />
          </div>
        </div>

      </div>

      {/* DETALHAMENTO DAS INCONSISTÊNCIAS IDENTIFICADAS */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, fontSize: '15px', wordBreak: 'break-word' }}>Extrato de Pendências e Apontamentos do Fisco</h3>
          <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Termo de Intimação / Malha Fiscal</span>
        </div>

        <div style={{ padding: '16px', boxSizing: 'border-box' }}>
          {resultadoAuditoria.inconsistencias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#16a34a', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🎉</span>
              <strong style={{ wordBreak: 'break-word' }}>Parabéns! Nenhuma divergência detectada nos cruzamentos eletrônicos.</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b', wordBreak: 'break-word' }}>
                A declaração foi validada pelos robôs do SERPRO e está apta para liberação.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
              {resultadoAuditoria.inconsistencias.map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: `1px solid ${item.gravidade === 'critica' ? '#fecaca' : '#fed7aa'}`, 
                    backgroundColor: item.gravidade === 'critica' ? '#fff5f5' : '#fffaf5',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '12px',
                    boxSizing: 'border-box',
                    minWidth: 0
                  }}
                >
                  <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        backgroundColor: item.gravidade === 'critica' ? '#ef4444' : '#f97316', 
                        color: 'white', 
                        textTransform: 'uppercase' 
                      }}>
                        {item.gravidade}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{item.cruzamento}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {item.descricao}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 0, flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', wordBreak: 'break-word' }}>Base Divergente</span>
                    <strong style={{ fontSize: '14.5px', color: '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(item.diferenca)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROTEIRO DIDÁTICO */}
      <div style={{ marginTop: '20px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '16px', fontSize: '12px', color: '#1e3a8a', lineHeight: '1.5', boxSizing: 'border-box', wordBreak: 'break-word' }}>
        <strong style={{ wordBreak: 'break-word' }}>💡 Orientações Contábeis & Procedimentais para o Aluno:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', wordBreak: 'break-word' }}>
          <li><strong>Retificação Espontânea:</strong> Enquanto não intimado pela Receita Federal, o contribuinte pode retificar a DIRPF sem multa punitiva de 75%.</li>
          <li><strong>Glosa de Despesas Médicas:</strong> Caso a despesa seja autêntica mas a clínica não tenha transmitido a DMED, o contribuinte deve apresentar notas fiscais e comprovantes no e-CAC.</li>
        </ul>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}