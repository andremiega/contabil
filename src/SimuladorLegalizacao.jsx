import React, { useState } from 'react';

export default function SimuladorLegalizacao({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [secaoAtiva, setSecaoAtiva] = useState('societario');

  // ==========================================
  // 1. ATOS SOCIETÁRIOS / ESTATUTÁRIOS
  // ==========================================
  const [tipoSocietario, setTipoSocietario] = useState('abertura'); 
  const [naturezaJuridica, setNaturezaJuridica] = useState('ltda'); 
  const [razaoSocial, setRazaoSocial] = useState('Instituto de Apoio Social (Exemplo)');
  const [capitalSocialStr, setCapitalSocialStr] = useState('120000.00');
  const [capitalIntegralizadoStr, setCapitalIntegralizadoStr] = useState('80000.00');
  const [taxaJuntaStr, setTaxaJuntaStr] = useState('420.00'); 
  const [honorariosParalegalStr, setHonorariosParalegalStr] = useState('1500.00');

  const isTerceiroSetor = naturezaJuridica === 'ong' || naturezaJuridica === 'igreja';

  const [etapas, setEtapas] = useState([
    { id: 1, nome: 'Consulta de Viabilidade Locacional e Nome', orgao: 'Prefeitura / Órgão de Registro', status: 'concluido' },
    { id: 2, nome: 'DBE - Documento Básico de Entrada', orgao: 'Receita Federal do Brasil (Redesim)', status: 'concluido' },
    { id: 3, nome: 'Registro do Instrumento de Constituição', orgao: isTerceiroSetor ? 'Cartório de Registro Civil (RCPJ)' : 'Junta Comercial', status: 'em_andamento' },
    { id: 4, nome: 'Assinatura Digital / Vistos de Advogado', orgao: 'Portal do Integrador Estadual', status: 'pendente' },
    { id: 5, nome: 'Inscrição Municipal & Alvarás', orgao: 'Prefeitura Municipal', status: 'pendente' }
  ]);

  const [socios] = useState([
    { id: 1, nome: 'Andre Lopes', qualificacao: isTerceiroSetor ? 'Presidente Fundador' : 'Sócio-Administrador', quotas: 60, valorSubscrito: 72000, integralizado: 48000 },
    { id: 2, nome: 'Évelinn Castro', qualificacao: isTerceiroSetor ? 'Diretora Financeira' : 'Sócia Cotista', quotas: 40, valorSubscrito: 48000, integralizado: 32000 }
  ]);

  const [cnds, setCnds] = useState([
    { id: 'fed', nome: 'CND Conjunta Federal e Dívida Ativa', validade: '18/12/2026', situacao: 'regular', tipo: 'Negativa' },
    { id: 'fgts', nome: 'Certificado de Regularidade do FGTS', validade: '05/11/2026', situacao: 'regular', tipo: 'Negativa' },
    { id: 'mun', nome: 'Certidão Mobiliária Municipal (ISS/Taxas)', validade: '30/11/2026', situacao: 'efeito_negativa', tipo: 'Positiva c/ Efeito' },
    { id: 'trab', nome: 'Certidão Negativa Trabalhista (CNDT)', validade: '22/01/2027', situacao: 'regular', tipo: 'Negativa' }
  ]);

  const [licencas] = useState([
    { id: 1, nome: 'Alvará de Funcionamento e Localização', orgao: 'Prefeitura Municipal', status: 'vigente', validade: '31/12/2026', risco: 'Baixo Risco' },
    { id: 2, nome: 'Auto de Vistoria (AVCB / CLCB)', orgao: 'Corpo de Bombeiros', status: 'vigente', validade: '15/09/2027', risco: 'Simplificado' },
    { id: 4, nome: 'Certificado Digital (e-CNPJ)', orgao: 'ICP-Brasil', status: 'vigente', validade: '28/02/2027', risco: 'Assinatura' }
  ]);

  const alternarEtapa = (id) => {
    setEtapas(etapas.map(e => e.id === id ? { ...e, status: e.status === 'pendente' ? 'em_andamento' : e.status === 'em_andamento' ? 'concluido' : 'pendente' } : e));
  };

  const regularizarCnd = (id) => {
    setCnds(cnds.map(c => c.id === id ? { ...c, situacao: 'regular', tipo: 'Negativa', validade: '30/04/2027' } : c));
    if (typeof mostrarToast === 'function') mostrarToast('CND Regularizada com sucesso!', 'sucesso');
  };

  const capTotal = parseFloat(capitalSocialStr) || 0;
  const capInteg = parseFloat(capitalIntegralizadoStr) || 0;
  const capAIntegralizar = Math.max(0, capTotal - capInteg);
  const totalCustas = (parseFloat(taxaJuntaStr) || 0) + (parseFloat(honorariosParalegalStr) || 0);

  const handleContabilizarCapital = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    if (capTotal <= 0) return alert('Valor de fundo/capital inválido.');

    const cSafe = planoContas || [];
    const idBanco = cSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id || cSafe[0]?.id;
    const idPL_Subscrito = cSafe.find(c => c.codigo_contabil === '3.1.01.01' || (c.nome_conta || '').toLowerCase().includes('capital social'))?.id || cSafe[0]?.id;
    const idPL_AIntegralizar = cSafe.find(c => c.codigo_contabil === '3.1.01.02' || (c.nome_conta || '').toLowerCase().includes('integralizar'))?.id || cSafe[0]?.id;

    if (isTerceiroSetor) {
      registrarFatoGerador(`Dotação Inicial Fundo Patrimonial: ${razaoSocial}`, capTotal, 'Legalização (3º Setor)', [idPL_AIntegralizar], [idPL_Subscrito]);
      if (capInteg > 0) registrarFatoGerador(`Recebimento Doação/Fundo Inicial`, capInteg, 'Legalização (3º Setor)', [idBanco], [idPL_AIntegralizar]);
      if (typeof mostrarToast === 'function') mostrarToast('Fundo Patrimonial Estatutário contabilizado!', 'sucesso');
    } else {
      registrarFatoGerador(`Subscrição de Capital: ${razaoSocial}`, capTotal, 'Paralegal / Societário', [idPL_AIntegralizar], [idPL_Subscrito]);
      if (capInteg > 0) registrarFatoGerador(`Integralização de Capital Social`, capInteg, 'Paralegal / Societário', [idBanco], [idPL_AIntegralizar]);
      if (typeof mostrarToast === 'function') mostrarToast('Constituição do Capital contabilizada no Diário!', 'sucesso');
    }
  };

  const handleContabilizarTaxas = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    if (totalCustas <= 0) return alert('Sem despesas para contabilizar.');

    const cSafe = planoContas || [];
    const idBanco = cSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id || cSafe[0]?.id;
    const idDespesasOp = cSafe.find(c => c.codigo_contabil === '5.2.02.01' || (c.nome_conta || '').toLowerCase().includes('operacionais'))?.id || cSafe[0]?.id;

    registrarFatoGerador(`Pag. Custas e Honorários de Legalização: ${razaoSocial}`, totalCustas, isTerceiroSetor ? 'Legalização (3º Setor)' : 'Paralegal', [idDespesasOp], [idBanco]);
    if (typeof mostrarToast === 'function') mostrarToast('Taxas de legalização enviadas para o Diário!', 'sucesso');
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
            <span style={{ fontSize: '24px' }}>🏛️</span> Departamento Paralegal & Legalização
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Abertura de Sociedades, ONGs e Igrejas, Alvarás, CNDs e Regularización.
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
          <button onClick={() => setSecaoAtiva('societario')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: secaoAtiva === 'societario' ? (isTerceiroSetor ? '#831843' : '#0f172a') : 'transparent', color: secaoAtiva === 'societario' ? 'white' : '#64748b' }}>
            📋 Atos & Registro
          </button>
          <button onClick={() => setSecaoAtiva('qsa')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: secaoAtiva === 'qsa' ? (isTerceiroSetor ? '#831843' : '#0f172a') : 'transparent', color: secaoAtiva === 'qsa' ? 'white' : '#64748b' }}>
            👥 {isTerceiroSetor ? 'Diretoria' : 'Sócios'}
          </button>
          <button onClick={() => setSecaoAtiva('cnds')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: secaoAtiva === 'cnds' ? '#2563eb' : 'transparent', color: secaoAtiva === 'cnds' ? 'white' : '#64748b' }}>
            🛡️ CNDs
          </button>
          <button onClick={() => setSecaoAtiva('licencas')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: secaoAtiva === 'licencas' ? '#059669' : 'transparent', color: secaoAtiva === 'licencas' ? 'white' : '#64748b' }}>
            📜 Alvarás
          </button>
        </div>
      </div>

      {/* DASHBOARDS RÁPIDOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: isTerceiroSetor ? '#fdf2f8' : '#f8fafc', padding: '16px', borderRadius: '16px', border: `1px solid ${isTerceiroSetor ? '#fbcfe8' : '#e2e8f0'}`, borderLeft: `4px solid ${isTerceiroSetor ? '#be185d' : '#0f172a'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: isTerceiroSetor ? '#9d174d' : '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isTerceiroSetor ? 'Fundo Patrimonial' : 'Capital Social Subscrito'}
          </span>
          <strong style={{ display: 'block', color: isTerceiroSetor ? '#831843' : '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(capTotal)}</strong>
          <span style={{ fontSize: '11px', color: isTerceiroSetor ? '#be185d' : '#64748b', wordBreak: 'break-word' }}>
            {isTerceiroSetor ? 'Doações:' : 'Integralizado:'} {formatMoeda(capInteg)}
          </span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {isTerceiroSetor ? 'Compromissos a Receber' : 'Capital a Integralizar'}
          </span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(capAIntegralizar)}</strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Aporte futuro compromissado</span>
        </div>

        <div style={{ backgroundColor: cnds.some(c => c.situacao === 'vencida') ? '#fff5f5' : '#f0fdf4', padding: '16px', borderRadius: '16px', border: `1px solid ${cnds.some(c => c.situacao === 'vencida') ? '#fecaca' : '#86efac'}`, borderLeft: `4px solid ${cnds.some(c => c.situacao === 'vencida') ? '#ef4444' : '#16a34a'}`, boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: cnds.some(c => c.situacao === 'vencida') ? '#991b1b' : '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Regularidade Fiscal</span>
          <strong style={{ display: 'block', color: cnds.some(c => c.situacao === 'vencida') ? '#dc2626' : '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {cnds.filter(c => c.situacao !== 'vencida').length} / {cnds.length} CNDs
          </strong>
          <span style={{ fontSize: '11px', color: cnds.some(c => c.situacao === 'vencida') ? '#b91c1c' : '#15803d', wordBreak: 'break-word' }}>
            {cnds.some(c => c.situacao === 'vencida') ? '⚠️ Bloqueio detectado' : '✅ Habilitada / Regular'}
          </span>
        </div>
      </div>

      {secaoAtiva === 'societario' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            
            {/* PAINEL DE CONFIGURAÇÃO */}
            <div style={{ backgroundColor: isTerceiroSetor ? '#fdf2f8' : '#f8fafc', padding: '20px', borderRadius: '16px', border: `1px solid ${isTerceiroSetor ? '#fbcfe8' : '#cbd5e1'}`, display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: isTerceiroSetor ? '#831843' : '#0f172a', borderBottom: `1px solid ${isTerceiroSetor ? '#fbcfe8' : '#cbd5e1'}`, paddingBottom: '8px', wordBreak: 'break-word' }}>
                Instrumento {isTerceiroSetor ? 'Estatutário (Terceiro Setor)' : 'Societário Empresarial'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legTipo" style={labelStyle}>Ato de Registro:</label>
                  <select id="legTipo" value={tipoSocietario} onChange={e => setTipoSocietario(e.target.value)} style={{ ...inputStyle, borderColor: isTerceiroSetor ? '#f9a8d4' : '#cbd5e1', backgroundColor: 'white' }}>
                    <option value="abertura">{isTerceiroSetor ? 'Ata de Fundação' : 'Constituição (Contrato)'}</option>
                    <option value="alteracao">Alteração Consolidada</option>
                    <option value="baixa">Extinção e Distrato</option>
                  </select>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legNat" style={labelStyle}>Natureza Jurídica:</label>
                  <select id="legNat" value={naturezaJuridica} onChange={e => setNaturezaJuridica(e.target.value)} style={{ ...inputStyle, borderColor: isTerceiroSetor ? '#f9a8d4' : '#cbd5e1', backgroundColor: 'white', color: isTerceiroSetor ? '#831843' : 'black', fontWeight: isTerceiroSetor ? 'bold' : 'normal' }}>
                    <option value="ltda">Sociedade Limitada (LTDA)</option>
                    <option value="slu">Limitada Unipessoal (SLU)</option>
                    <option value="sa">Sociedade Anônima (S/A)</option>
                    <option value="ong">Associação Privada (ONG)</option>
                    <option value="igreja">Organização Religiosa (Igreja)</option>
                  </select>
                </div>
              </div>

              {isTerceiroSetor && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #f9a8d4', padding: '12px', borderRadius: '10px', color: '#be185d', fontSize: '12px', lineHeight: '1.4', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>💡</span> Norma ITG 2002</strong>
                  <div style={{ marginTop: '4px', wordBreak: 'break-word' }}>Entidades sem fins lucrativos possuem <em>Imunidade/Isenção Tributária</em> e registram-se em Cartório (RCPJ).</div>
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <label htmlFor="legRazao" style={labelStyle}>Denominação / Razão Social:</label>
                <input id="legRazao" autoComplete="off" type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legCapTotal" style={{ ...labelStyle, color: isTerceiroSetor ? '#831843' : '#0f172a' }}>
                    {isTerceiroSetor ? 'Fundo Patrimonial (R$):' : 'Capital Total (R$):'}
                  </label>
                  <input id="legCapTotal" autoComplete="off" type="text" value={capitalSocialStr} onChange={e => setCapitalSocialStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legCapInteg" style={{ ...labelStyle, color: '#059669' }}>
                    {isTerceiroSetor ? 'Doações (R$):' : 'Integralizado (R$):'}
                  </label>
                  <input id="legCapInteg" autoComplete="off" type="text" value={capitalIntegralizadoStr} onChange={e => setCapitalIntegralizadoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ ...inputStyle, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legJunta" style={labelStyle}>Taxas Órgão (R$):</label>
                  <input id="legJunta" autoComplete="off" type="text" value={taxaJuntaStr} onChange={e => setTaxaJuntaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="legHon" style={labelStyle}>Honorários (R$):</label>
                  <input id="legHon" autoComplete="off" type="text" value={honorariosParalegalStr} onChange={e => setHonorariosParalegalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* TRAMITAÇÃO REDESIM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>Workflow de Tramitação (Redesim)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                  {etapas.map(item => (
                    <div 
                      key={item.id} onClick={() => alternarEtapa(item.id)}
                      style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${item.status === 'concluido' ? '#86efac' : item.status === 'em_andamento' ? '#bfdbfe' : '#e2e8f0'}`, backgroundColor: item.status === 'concluido' ? '#f0fdf4' : item.status === 'em_andamento' ? '#eff6ff' : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>{item.nome}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>{item.orgao}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: item.status === 'concluido' ? '#16a34a' : item.status === 'em_andamento' ? '#2563eb' : '#94a3b8', color: 'white', flexShrink: 0 }}>
                        {item.status === 'concluido' ? 'CONCLUÍDO' : item.status === 'em_andamento' ? 'EM ANÁLISE' : 'PENDENTE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* MOTOR DE INTEGRAÇÃO CONTÁBIL NO DIÁRIO */}
          <div style={{ marginTop: '20px', backgroundColor: isTerceiroSetor ? '#fdf2f8' : '#eff6ff', borderRadius: '16px', border: `1px solid ${isTerceiroSetor ? '#fbcfe8' : '#bfdbfe'}`, padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: isTerceiroSetor ? '#831843' : '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span>🧭</span> Contabilização no Livro Diário {isTerceiroSetor ? '(ITG 2002)' : '(Norma Societária)'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: `4px solid ${isTerceiroSetor ? '#be185d' : '#2563eb'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: isTerceiroSetor ? '#9d174d' : '#1d4ed8', display: 'block', marginBottom: '8px' }}>Ato Constitutivo / Dotação Inicial:</span>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: {isTerceiroSetor ? 'Patrimônio a Receber' : 'Capital a Integralizar'} ... {formatMoeda(capTotal)}</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: {isTerceiroSetor ? 'Fundo Patrimonial (PL)' : 'Capital Subscrito (PL)'} ....... {formatMoeda(capTotal)}</div>
                  <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Banco Conta Movimento (Ativo) ..... {formatMoeda(capInteg)}</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: {isTerceiroSetor ? 'Patrimônio a Receber' : 'Capital a Integralizar'} ......... {formatMoeda(capInteg)}</div>
                </div>
                <button onClick={handleContabilizarCapital} style={{ marginTop: '14px', backgroundColor: isTerceiroSetor ? '#9d174d' : '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', fontSize: '12.5px' }}>
                  Lançar {isTerceiroSetor ? 'Fundo Patrimonial' : 'Capital Social'} 🏛️
                </button>
              </div>

              <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Pagamento das Custas de Legalização:</span>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Despesas c/ Legalização e Taxas ... {formatMoeda(parseFloat(taxaJuntaStr) || 0)}</div>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Despesas c/ Assessorias Técnicas .. {formatMoeda(parseFloat(honorariosParalegalStr) || 0)}</div>
                  <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0' }}></div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: Banco Conta Movimento (Ativo) ..... {formatMoeda(totalCustas)}</div>
                </div>
                <button onClick={handleContabilizarTaxas} style={{ marginTop: '14px', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', fontSize: '12.5px' }}>
                  Lançar Pagamento de Taxas 💸
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'qsa' && (
        <div style={{ animation: 'fadeIn 0.3s', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxSizing: 'border-box' }}>
          <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '550px' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>{isTerceiroSetor ? 'Diretor / Fundador' : 'Sócio / Administrador'}</th>
                  <th style={{ padding: '12px 14px' }}>Cargo</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>{isTerceiroSetor ? 'Voto (%)' : 'Quotas (%)'}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>{isTerceiroSetor ? 'Doação Prometida' : 'Subscrito'}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>{isTerceiroSetor ? 'Doação Realizada' : 'Integralizado'}</th>
                </tr>
              </thead>
              <tbody>
                {socios.map(socio => (
                  <tr key={socio.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{socio.nome}</td>
                    <td style={{ padding: '12px 14px', color: '#475569', wordBreak: 'break-word' }}>{isTerceiroSetor ? (socio.id === 1 ? 'Presidente' : 'Diretor(a)') : socio.qualificacao}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', color: isTerceiroSetor ? '#be185d' : '#2563eb', whiteSpace: 'nowrap' }}>{socio.quotas}%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(socio.valorSubscrito)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(socio.integralizado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {secaoAtiva === 'cnds' && (
        <div style={{ animation: 'fadeIn 0.3s', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxSizing: 'border-box' }}>
          <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '550px' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Certidão Negativa de Débitos (CND)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Validade</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Situação</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {cnds.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: row.situacao === 'vencida' ? '#fff5f5' : 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{row.nome}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#475569', whiteSpace: 'nowrap' }}>{row.validade}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: row.situacao === 'regular' ? '#f0fdf4' : row.situacao === 'efeito_negativa' ? '#eff6ff' : '#fef2f2', color: row.situacao === 'regular' ? '#166534' : row.situacao === 'efeito_negativa' ? '#1d4ed8' : '#991b1b', border: `1px solid ${row.situacao === 'regular' ? '#86efac' : row.situacao === 'efeito_negativa' ? '#bfdbfe' : '#fecaca'}` }}>
                        {row.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button onClick={() => regularizarCnd(row.id)} style={{ padding: '6px 12px', backgroundColor: row.situacao === 'regular' ? '#f1f5f9' : '#0f172a', color: row.situacao === 'regular' ? '#475569' : 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {row.situacao === 'regular' ? 'Baixar 2ª Via' : 'Parcelar Débitos'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {secaoAtiva === 'licencas' && (
        <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
            {licencas.map(lic => (
              <div key={lic.id} style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', wordBreak: 'break-word' }}>{lic.nome}</strong>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', backgroundColor: lic.status === 'vigente' ? '#dcfce7' : '#fef3c7', color: lic.status === 'vigente' ? '#166534' : '#92400e', flexShrink: 0 }}>
                    {lic.status === 'vigente' ? 'VIGENTE' : 'VENCE EM BREVE'}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Órgão: {lic.orgao}</span>
                <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 'bold', wordBreak: 'break-word' }}>Risco: {lic.risco}</span>
                <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 'bold', wordBreak: 'break-word' }}>Expira em: {lic.validade}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}