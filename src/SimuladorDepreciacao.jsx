import React, { useState, useEffect } from 'react';

export default function SimuladorDepreciacao({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Método de Depreciação
  const [metodoDepreciacao, setMetodoDepreciacao] = useState('linear');

  // Parâmetros do Imobilizado
  const [nomeAtivo, setNomeAtivo] = useState('Centro de Usinagem CNC Industrial');
  const [contaContabil, setContaContabil] = useState('1.2.03.01 - Máquinas e Equipamentos');
  const [custoAquisicaoStr, setCustoAquisicaoStr] = useState('250000.00');
  const [valorResidualStr, setValorResidualStr] = useState('25000.00');
  const [vidaUtilAnosStr, setVidaUtilAnosStr] = useState('5');

  // Totais e Cronograma Calculado
  const [resumo, setResumo] = useState({
    valorDepreciavel: 0,
    depreciacaoAnualMedia: 0,
    depreciacaoMensal: 0,
    valorContabilFinal: 0,
    cronogramaAnual: []
  });

  useEffect(() => {
    const custo = parseFloat(custoAquisicaoStr) || 0;
    const residual = parseFloat(valorResidualStr) || 0;
    const anos = parseInt(vidaUtilAnosStr, 10) || 0;

    const valorDepreciavel = Math.max(0, custo - residual);

    if (custo <= 0 || anos <= 0 || valorDepreciavel <= 0) {
      setResumo({ valorDepreciavel: 0, depreciacaoAnualMedia: 0, depreciacaoMensal: 0, valorContabilFinal: custo, cronogramaAnual: [] });
      return;
    }

    let cronograma = [];
    let acumulado = 0;

    if (metodoDepreciacao === 'linear') {
      const quotaAnual = valorDepreciavel / anos;
      const quotaMensal = quotaAnual / 12;
      for (let ano = 1; ano <= anos; ano++) {
        acumulado += quotaAnual;
        cronograma.push({ ano, quotaAnual, depreciacaoAcumulada: acumulado, valorContabilFim: Math.max(residual, custo - acumulado) });
      }
      setResumo({ valorDepreciavel, depreciacaoAnualMedia: quotaAnual, depreciacaoMensal: quotaMensal, valorContabilFinal: residual, cronogramaAnual: cronograma });
    } else {
      const somaDigitos = (anos * (anos + 1)) / 2;
      let acumuladoSDA = 0;
      for (let ano = 1; ano <= anos; ano++) {
        const anosRestantes = anos - ano + 1;
        const quotaAnual = (anosRestantes / somaDigitos) * valorDepreciavel;
        acumuladoSDA += quotaAnual;
        cronograma.push({ ano, quotaAnual, depreciacaoAcumulada: acumuladoSDA, valorContabilFim: Math.max(residual, custo - acumuladoSDA) });
      }
      setResumo({ valorDepreciavel, depreciacaoAnualMedia: valorDepreciavel / anos, depreciacaoMensal: (valorDepreciavel / anos) / 12, valorContabilFinal: residual, cronogramaAnual: cronograma });
    }
  }, [metodoDepreciacao, custoAquisicaoStr, valorResidualStr, vidaUtilAnosStr]);

  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL (O SISTEMA NERVOSO)
  // ==========================================================
  
  const handleRegistrarAquisicao = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    
    const custo = parseFloat(custoAquisicaoStr) || 0;
    if (custo <= 0) return alert('O custo de aquisição deve ser maior que zero.');

    const idAtivoImobilizado = planoContas.find(c => c.codigo_contabil === '1.2.03.01' || c.nome_conta.toLowerCase().includes('máquinas e equipamentos'))?.id;
    const idBanco = planoContas.find(c => c.codigo_contabil === '1.1.01.02' || c.nome_conta.toLowerCase().includes('banco'))?.id;

    registrarFatoGerador(
      `Aquisição de Ativo Imobilizado (CAPEX) - ${nomeAtivo}`,
      custo,
      'Gestão de Ativos',
      [idAtivoImobilizado], // Débito (Aumenta o Ativo)
      [idBanco]             // Crédito (Diminui o Banco)
    );

    if (mostrarToast) mostrarToast('Aquisição enviada para a Contabilidade!', 'sucesso');
  };

  const handleRodarDepreciacao = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    
    const depMensal = resumo.depreciacaoMensal;
    if (depMensal <= 0) return alert('Não há quota de depreciação mensal calculada.');

    const idDespesaDepreciacao = planoContas.find(c => c.codigo_contabil === '5.2.02.01' || c.nome_conta.toLowerCase().includes('despesas com depreciação'))?.id;
    const idDepreciacaoAcumulada = planoContas.find(c => c.codigo_contabil === '1.2.03.09' || c.nome_conta.toLowerCase().includes('depreciação acumulada'))?.id;

    registrarFatoGerador(
      `Apropriação da Quota de Depreciação Mensal - ${nomeAtivo}`,
      depMensal,
      'Gestão de Ativos',
      [idDespesaDepreciacao],   // Débito (Aumenta Despesa na DRE)
      [idDepreciacaoAcumulada]  // Crédito (Aumenta Conta Redutora no Ativo)
    );

    if (mostrarToast) mostrarToast('Quota de depreciação lançada no Diário!', 'sucesso');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏢</span> Gestão de Ativo Imobilizado & Depreciação (CPC 27)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Contabilização de Imobilizado, Valor Residual, Quotas Constantes (Linear) e Soma dos Dígitos (SDA).
          </p>
        </div>

        {/* SELETOR DE MÉTODO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button onClick={() => setMetodoDepreciacao('linear')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoDepreciacao === 'linear' ? '#0f172a' : 'transparent', color: metodoDepreciacao === 'linear' ? 'white' : '#64748b' }}>
            📈 Quotas Constantes (Linear)
          </button>
          <button onClick={() => setMetodoDepreciacao('soma_digitos')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: metodoDepreciacao === 'soma_digitos' ? '#2563eb' : 'transparent', color: metodoDepreciacao === 'soma_digitos' ? 'white' : '#64748b' }}>
            ⚡ Soma dos Dígitos (Acelerada)
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo de Aquisição (CAPEX)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(parseFloat(custoAquisicaoStr) || 0)}</strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Ativo Não Circulante Imobilizado</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Base Depreciável (Custo - Residual)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(resumo.valorDepreciavel)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Valor Residual: {formatMoeda(parseFloat(valorResidualStr) || 0)}</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Despesa de Depreciação Mensal</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(resumo.depreciacaoMensal)}</strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>Apropriação mensal na DRE (1º Ano)</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Contábil Residual Final</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(resumo.valorContabilFinal)}</strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Garantido ao término da vida útil</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E CRONOGRAMA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* PARÂMETROS DO BEM */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Parâmetros do Ativo Imobilizado (CPC 27)
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Descrição do Bem:
            <input type="text" value={nomeAtivo} onChange={e => setNomeAtivo(e.target.value)} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Conta Contábil do Plano de Contas:
            <input type="text" value={contaContabil} onChange={e => setContaContabil(e.target.value)} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Custo de Aquisição (R$):
              <input type="text" value={custoAquisicaoStr} onChange={e => setCustoAquisicaoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Valor Residual (R$):
              <input type="text" value={valorResidualStr} onChange={e => setValorResidualStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Vida Útil Econômica (Anos):
            <input type="text" value={vidaUtilAnosStr} onChange={e => setVidaUtilAnosStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </label>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
            📌 <strong>Regra CPC 27:</strong> A depreciação começa quando o ativo está disponível para uso e não cessa quando o ativo está ocioso.
          </div>
        </div>

        {/* TABELA DE CRONOGRAMA DE DEPRECIAÇÃO */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
            <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px' }}>Cronograma Anual de Depreciação</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{metodoDepreciacao === 'linear' ? 'Quotas Constantes' : 'Soma dos Dígitos'}</span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                <thead style={{ backgroundColor: '#f8fafc', color: '#475569', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Ano</th>
                    <th style={{ padding: '10px', color: '#dc2626' }}>Quota Anual</th>
                    <th style={{ padding: '10px' }}>Deprec. Acumulada</th>
                    <th style={{ padding: '10px', color: '#1e40af' }}>Valor Contábil Fim</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.cronogramaAnual.map(row => (
                    <tr key={row.ano} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>{row.ano}º Ano</td>
                      <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 'bold' }}>{formatMoeda(row.quotaAnual)}</td>
                      <td style={{ padding: '8px 10px' }}>{formatMoeda(row.depreciacaoAcumulada)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#1e40af' }}>{formatMoeda(row.valorContabilFim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO COM BOTÕES DE AÇÃO */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Integração com Livro Diário (Partidas Dobradas)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
          
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '8px' }}>1. Aquisição Inicial do Imobilizado (CAPEX):</span>
              <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Ativo Não Circulante (Imobilizado) .. {formatMoeda(parseFloat(custoAquisicaoStr) || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Banco Conta Movimento (Ativo) ....... {formatMoeda(parseFloat(custoAquisicaoStr) || 0)}</div>
            </div>
            <button onClick={handleRegistrarAquisicao} style={{ marginTop: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Registrar Compra no Diário 📥
            </button>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '8px' }}>2. Apropriação Mensal da Depreciação (Competência):</span>
              <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesa de Depreciação (DRE) ........ {formatMoeda(resumo.depreciacaoMensal)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: (-) Depreciação Acumulada (Ativo) ... {formatMoeda(resumo.depreciacaoMensal)}</div>
            </div>
            <button onClick={handleRodarDepreciacao} style={{ marginTop: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Rodar Quota Mensal de Depreciação 📉
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}