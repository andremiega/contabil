import React, { useState, useEffect } from 'react';

export default function SimuladorMalhaFina() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Dados Declarados pelo Contribuinte (DIRPF) - Inputs em texto para não travar o zero
  const [rendimentoTributavelStr, setRendimentoTributavelStr] = useState('75000');
  const [despesaMedicaStr, setDespesaMedicaStr] = useState('18000');
  const [rendimentoAluguelStr, setRendimentoAluguelStr] = useState('0');
  const [impostoRetidoFonteStr, setImpostoRetidoFonteStr] = useState('8500');

  // 2. Bases Oficiais Cruzadas pela Receita Federal
  const [dirfFontePagadoraStr, setDirfFontePagadoraStr] = useState('85000'); // Empregador informou 85k (omissão de 10k)
  const [dmedClinicasStr, setDmedClinicasStr] = useState('6000'); // Clínicas informaram apenas 6k (inconsistência médica)
  const [dimobImobiliariasStr, setDimobImobiliariasStr] = useState('12000'); // Imobiliária reportou aluguel recebido
  const [movimentacaoBancariaStr, setMovimentacaoBancariaStr] = useState('140000'); // e-Financeira

  // 3. Resultados da Auditoria Eletrônica
  const [resultadoAuditoria, setResultadoAuditoria] = useState({
    status: 'processando', // 'liberada', 'alerta', 'retida'
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

    // Cruzamento 1: DIRPF vs DIRF (Rendimentos da Fonte Pagadora)
    if (rendDirf > rendDeclarado) {
      const dif = rendDirf - rendDeclarado;
      baseOmitida += dif;
      inconsistencias.push({
        id: 'dirf',
        cruzamento: 'DIRPF × DIRF (Fontes Pagadoras)',
        descricao: `Omissão de rendimentos do trabalho assalariado. A fonte declarou ${formatMoeda(rendDirf)}, mas constam apenas ${formatMoeda(rendDeclarado)}.`,
        diferenca: dif,
        gravidade: 'alta'
      });
    }

    // Cruzamento 2: DIRPF × DMED (Despesas Médicas e Hospitalares)
    if (despMedDeclarada > dmedOficial) {
      const glosa = despMedDeclarada - dmedOficial;
      baseOmitida += glosa;
      inconsistencias.push({
        id: 'dmed',
        cruzamento: 'DIRPF × DMED (Clínicas e Planos de Saúde)',
        descricao: `Dedução médica sem correspondência. Foram lançados ${formatMoeda(despMedDeclarada)}, porém as clínicas comprovaram apenas ${formatMoeda(dmedOficial)}.`,
        diferenca: glosa,
        gravidade: 'alta'
      });
    }

    // Cruzamento 3: DIRPF × DIMOB (Aluguéis de Imóveis)
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

    // Cruzamento 4: Renda Declarada × e-Financeira (Sinais Exteriores de Riqueza)
    const totalRendaDeclarada = rendDeclarado + aluguelDeclarado;
    if (movBanco > (totalRendaDeclarada * 1.5) && totalRendaDeclarada > 0) {
      inconsistencias.push({
        id: 'efinanceira',
        cruzamento: 'DIRPF × e-Financeira (Movimentação Bancária)',
        descricao: `Movimentação bancária (${formatMoeda(movBanco)}) é desproporcional à renda declarada (${formatMoeda(totalRendaDeclarada)}). Risco de presunção de omissão de receita.`,
        diferenca: movBanco - totalRendaDeclarada,
        gravidade: 'critica'
      });
    }

    // Cálculo do Imposto Omitido (Alíquota marginal didática de 27,5%) e Multas
    const impostoDevido = baseOmitida * 0.275;
    const multa75 = impostoDevido * 0.75; // Multa de ofício padrão da RFB
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
    // Ajusta a DIRPF para espelhar as bases oficiais (retificação espontânea)
    setRendimentoTributavelStr(dirfFontePagadoraStr);
    setDespesaMedicaStr(dmedClinicasStr);
    setRendimentoAluguelStr(dimobImobiliariasStr);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🔍</span> Simulador de Malha Fina & Auditoria Fiscal (e-CAC)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Cruzamento automatizado da Receita Federal: DIRPF × DIRF × DMED × DIMOB × e-Financeira.
          </p>
        </div>

        <button 
          onClick={resolverInconsistencias}
          style={{ padding: '9px 15px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>✍️</span> Enviar Declaração Retificadora
        </button>
      </div>

      {/* DASHBOARDS DE STATUS E RISCO DE AUTUAÇÃO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        
        {/* Card Status do e-CAC */}
        <div style={{ 
          backgroundColor: resultadoAuditoria.status === 'retida' ? '#fef2f2' : resultadoAuditoria.status === 'alerta' ? '#fffbeb' : '#f0fdf4', 
          padding: '18px', 
          borderRadius: '12px', 
          border: `1px solid ${resultadoAuditoria.status === 'retida' ? '#fecaca' : resultadoAuditoria.status === 'alerta' ? '#fde68a' : '#86efac'}`, 
          borderLeft: `4px solid ${resultadoAuditoria.status === 'retida' ? '#dc2626' : resultadoAuditoria.status === 'alerta' ? '#d97706' : '#16a34a'}` 
        }}>
          <span style={{ color: resultadoAuditoria.status === 'retida' ? '#991b1b' : resultadoAuditoria.status === 'alerta' ? '#92400e' : '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Status no Portal e-CAC
          </span>
          <strong style={{ display: 'block', color: resultadoAuditoria.status === 'retida' ? '#dc2626' : resultadoAuditoria.status === 'alerta' ? '#b45309' : '#15803d', fontSize: '20px', marginTop: '4px' }}>
            {resultadoAuditoria.status === 'retida' ? '🚨 COM PENDÊNCIAS (MALHA)' : resultadoAuditoria.status === 'alerta' ? '⚠️ EM PROCESSAMENTO' : '✅ PROCESSADA / LIBERADA'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {resultadoAuditoria.inconsistencias.length} inconsistência(s) detectada(s)
          </span>
        </div>

        {/* Card Diferença de Imposto */}
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>IRPF Suprimido (27,5%)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px' }}>
            {formatMoeda(resultadoAuditoria.impostoOmitidoEstimado)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Imposto principal recalculado</span>
        </div>

        {/* Card Multa de Ofício */}
        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Multa de Ofício RFB (75%)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px' }}>
            {formatMoeda(resultadoAuditoria.multaOficio75)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>Penalidade por lançamento de ofício</span>
        </div>

        {/* Card Auto de Infração Total */}
        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Risco de Notificação Total</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px' }}>
            {formatMoeda(resultadoAuditoria.totalAutuacao)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Imposto + Multa (sem juros Selic)</span>
        </div>
      </div>

      {/* ÁREA DE ENTRADA: O QUE O CONTRIBUINTE DECLAROU VS O QUE OS TERCEIROS INFORMARAM */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* Painel Esquerdo: O que o Contribuinte Informou na DIRPF */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>1. Declarado pelo Contribuinte (DIRPF)</h3>
            <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Contribuinte</span>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Rendimentos Tributáveis (Salários/Pró-labore):
            <input 
              type="text" 
              value={rendimentoTributavelStr} 
              onChange={e => setRendimentoTributavelStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Despesas Médicas e Hospitalares (Deduções):
            <input 
              type="text" 
              value={despesaMedicaStr} 
              onChange={e => setDespesaMedicaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Rendimentos de Aluguéis Recebidos:
            <input 
              type="text" 
              value={rendimentoAluguelStr} 
              onChange={e => setRendimentoAluguelStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Imposto de Renda Retido na Fonte (IRRF):
            <input 
              type="text" 
              value={impostoRetidoFonteStr} 
              onChange={e => setImpostoRetidoFonteStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>
        </div>

        {/* Painel Direito: Bases de Terceiros da Receita Federal */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a' }}>2. Malha de Terceiros (Auditoria RFB)</h3>
            <span style={{ fontSize: '10px', backgroundColor: '#0f172a', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Cruzamento</span>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            DIRF - Informado pela Empresa Empregadora:
            <input 
              type="text" 
              value={dirfFontePagadoraStr} 
              onChange={e => setDirfFontePagadoraStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            DMED - Informado por Clínicas, Hospitais e Médicos:
            <input 
              type="text" 
              value={dmedClinicasStr} 
              onChange={e => setDmedClinicasStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            DIMOB - Informado por Imobiliárias:
            <input 
              type="text" 
              value={dimobImobiliariasStr} 
              onChange={e => setDimobImobiliariasStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            e-Financeira - Movimentação Bancária Global:
            <input 
              type="text" 
              value={movimentacaoBancariaStr} 
              onChange={e => setMovimentacaoBancariaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }} 
            />
          </label>
        </div>

      </div>

      {/* DETALHAMENTO DAS INCONSISTÊNCIAS IDENTIFICADAS */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Extrato de Pendências e Apontamentos do Fisco</h3>
          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Termo de Intimação / Malha Fiscal</span>
        </div>

        <div style={{ padding: '15px' }}>
          {resultadoAuditoria.inconsistencias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '25px', color: '#16a34a' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🎉</span>
              <strong>Parabéns! Nenhuma divergência detectada nos cruzamentos eletrônicos.</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                A declaração foi validada pelos robôs do SERPRO e está apta para liberação no próximo lote residual ou de restituição.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resultadoAuditoria.inconsistencias.map(item => (
                <div 
                  key={item.id} 
                  style={{ 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: `1px solid ${item.gravidade === 'critica' ? '#fecaca' : '#fed7aa'}`, 
                    backgroundColor: item.gravidade === 'critica' ? '#fff5f5' : '#fffaf5',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}
                >
                  <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: item.gravidade === 'critica' ? '#ef4444' : '#f97316', 
                        color: 'white', 
                        textTransform: 'uppercase' 
                      }}>
                        {item.gravidade}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.cruzamento}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                      {item.descricao}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Base Divergente</span>
                    <strong style={{ fontSize: '14px', color: '#dc2626' }}>{formatMoeda(item.diferenca)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROTEIRO DIDÁTICO */}
      <div style={{ marginTop: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px', fontSize: '12px', color: '#1e3a8a', lineHeight: '1.5' }}>
        <strong>💡 Orientações Contábeis & Procedimentais para o Aluno:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li><strong>Retificação Espontânea:</strong> Enquanto não for intimado pela Receita Federal, o contribuinte pode retificar a DIRPF sem incidência da multa punitiva de 75%.</li>
          <li><strong>Glosa de Despesas Médicas:</strong> Caso a despesa médica seja autêntica mas a clínica não tenha transmitido a DMED, o contribuinte deve apresentar notas fiscais, recibos e comprovantes de transferência bancária no e-CAC para homologação do auditor.</li>
        </ul>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}