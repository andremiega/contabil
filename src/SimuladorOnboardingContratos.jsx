import React, { useState, useMemo } from 'react';

export default function SimuladorOnboardingContratos({ mostrarToast }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estados do Formulário de Onboarding
  const [cliente, setCliente] = useState({
    razaoSocial: '',
    cnpj: '',
    tipoEntidade: 'empresa', // empresa, ong, igreja
    representanteLegal: '',
    cpfRepresentante: '',
    endereco: '',
  });

  const [escopo, setEscopo] = useState({
    contabilidade: true,
    fiscal: true,
    folhaPagamento: true,
    bpoFinanceiro: false,
    impostoRendaPJ: true,
    qtdFuncionarios: 0
  });

  const [honorarios, setHonorarios] = useState(1500.00);
  const [abaAtiva, setAbaAtiva] = useState('dados');

  // ==========================================
  // LÓGICA DE CHECKLIST DINÂMICO (DOCUMENTOS INICIAIS)
  // ==========================================
  const checklistOnboarding = useMemo(() => {
    const docs = [
      { id: 1, doc: 'Cópia do RG e CPF dos Sócios/Diretores (Autenticados ou com CNH digital)' },
      { id: 2, doc: 'Comprovante de Endereço da Sede (Água, Luz ou Telefone)' },
      { id: 3, doc: 'Senha do Gov.br do Representante Legal (Para acesso e-CAC)' },
      { id: 4, doc: 'Certificado Digital e-CNPJ (A1 em arquivo .pfx ou A3 físico)' }
    ];

    if (cliente.tipoEntidade === 'empresa') {
      docs.push({ id: 5, doc: 'Contrato Social ou Requerimento de Empresário atualizado e consolidado' });
      docs.push({ id: 6, doc: 'Alvará de Funcionamento e Inscrição Municipal/Estadual' });
    } else if (cliente.tipoEntidade === 'ong' || cliente.tipoEntidade === 'igreja') {
      docs.push({ id: 5, doc: 'Estatuto Social devidamente registrado em Cartório de Títulos e Documentos' });
      docs.push({ id: 6, doc: 'Ata de Eleição e Posse da Diretoria Atual (Registrada)' });
      docs.push({ id: 7, doc: 'Certificado de Entidade Beneficente (CEBAS) - Cópia da Portaria (Se aplicável)' });
    }

    if (escopo.folhaPagamento && escopo.qtdFuncionarios > 0) {
      docs.push({ id: 8, doc: `Ficha de Registro / Documentos Pessoais dos ${escopo.qtdFuncionarios} Empregados Atuais` });
      docs.push({ id: 9, doc: 'Atestados de Saúde Ocupacional (PCMSO/PGR e LTCAT) vigentes' });
    }

    return docs;
  }, [cliente.tipoEntidade, escopo.folhaPagamento, escopo.qtdFuncionarios]);

  // ==========================================
  // LÓGICA DE CHECKLIST DINÂMICO (DOCUMENTOS MENSAIS)
  // ==========================================
  const checklistMensal = useMemo(() => {
    const docs = [];

    if (escopo.contabilidade || escopo.bpoFinanceiro) {
      docs.push({ id: 101, doc: 'Extratos Bancários Mensais de todas as contas (Formato OFX e PDF)' });
      docs.push({ id: 102, doc: 'Comprovantes de pagamento de despesas (Água, Luz, Telefone, Aluguéis, Internet)' });
      docs.push({ id: 103, doc: 'Recibos de pagamentos diversos e DARFs/Guias quitadas no mês' });
    }

    if (escopo.fiscal) {
      docs.push({ id: 104, doc: 'Arquivos XML das Notas Fiscais de SAÍDA (Vendas de Mercadorias ou Serviços)' });
      docs.push({ id: 105, doc: 'Arquivos XML das Notas Fiscais de ENTRADA (Compras, Insumos e Serviços Tomados)' });
      if (cliente.tipoEntidade === 'empresa') {
        docs.push({ id: 106, doc: 'Relatórios de Redução Z / Cupons Fiscais (NFC-e / SAT) se atuar no varejo' });
      }
    }

    if (escopo.folhaPagamento) {
      docs.push({ id: 107, doc: 'Folha de Ponto preenchida e assinada (com controle de faltas e horas extras)' });
      docs.push({ id: 108, doc: 'Atestados Médicos e Licenças recebidos no mês' });
      docs.push({ id: 109, doc: 'Recibos de entrega de Vale Transporte e Vale Refeição' });
      docs.push({ id: 110, doc: 'Avisos de Férias ou solicitações de Rescisão/Desligamento' });
    }

    return docs;
  }, [escopo, cliente.tipoEntidade]);

  const imprimirDocumento = () => {
    window.print();
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #3b82f6', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>GESTÃO DE CLIENTES</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Onboarding & Contratos Contábeis</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#cbd5e1', wordBreak: 'break-word' }}>Qualifique o cliente, defina o escopo e gere o contrato e os checklists.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('dados')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'dados' ? '#3b82f6' : 'transparent', color: abaAtiva === 'dados' ? 'white' : '#cbd5e1' }}>🏢 1. KYC</button>
          <button onClick={() => setAbaAtiva('escopo')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'escopo' ? '#3b82f6' : 'transparent', color: abaAtiva === 'escopo' ? 'white' : '#cbd5e1' }}>⚖️ 2. Escopo</button>
          <button onClick={() => setAbaAtiva('checklist')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'checklist' ? '#3b82f6' : 'transparent', color: abaAtiva === 'checklist' ? 'white' : '#cbd5e1' }}>📋 3. Checklist</button>
          <button onClick={() => setAbaAtiva('contrato')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'contrato' ? '#3b82f6' : 'transparent', color: abaAtiva === 'contrato' ? 'white' : '#cbd5e1' }}>📝 4. Contrato</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: DADOS DO CLIENTE (KYC)
            ======================================================== */}
        {abaAtiva === 'dados' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>Qualificação da Entidade (KYC - Know Your Client)</h3>
            
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cTipo" style={labelStyle}>Tipo Jurídico (Natureza da Entidade):</label>
                  <select id="cTipo" name="cTipo" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold', color: '#1e40af'}} value={cliente.tipoEntidade} onChange={e => setCliente({...cliente, tipoEntidade: e.target.value})}>
                    <option value="empresa">Empresa Comercial / Indústria / Serviços</option>
                    <option value="ong">Associação Sem Fins Lucrativos (ONG)</option>
                    <option value="igreja">Organização Religiosa (Igreja)</option>
                  </select>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cRazao" style={labelStyle}>Razão Social / Nome da Instituição:</label>
                  <input id="cRazao" name="cRazao" type="text" style={inputStyle} value={cliente.razaoSocial} onChange={e => setCliente({...cliente, razaoSocial: e.target.value})} placeholder="Ex: Tech Solutions Ltda" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cCNPJ" style={labelStyle}>CNPJ:</label>
                    <input id="cCNPJ" name="cCNPJ" type="text" style={inputStyle} value={cliente.cnpj} onChange={e => setCliente({...cliente, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cRep" style={labelStyle}>Representante Legal (Sócio/Presidente):</label>
                    <input id="cRep" name="cRep" type="text" style={inputStyle} value={cliente.representanteLegal} onChange={e => setCliente({...cliente, representanteLegal: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cCPF" style={labelStyle}>CPF do Representante:</label>
                    <input id="cCPF" name="cCPF" type="text" style={inputStyle} value={cliente.cpfRepresentante} onChange={e => setCliente({...cliente, cpfRepresentante: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cEnd" style={labelStyle}>Endereço Completo da Sede:</label>
                    <input id="cEnd" name="cEnd" type="text" style={inputStyle} value={cliente.endereco} onChange={e => setCliente({...cliente, endereco: e.target.value})} />
                  </div>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', boxSizing: 'border-box' }}>
              <button onClick={() => setAbaAtiva('escopo')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', fontSize: '13px' }}>
                Salvar Dados e Ir para Escopo →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: ESCOPO DE SERVIÇOS E PRECIFICAÇÃO
            ======================================================== */}
        {abaAtiva === 'escopo' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>2. Escopo Contratual & Honorários</h3>
            
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#1e40af', wordBreak: 'break-word' }}>Quais departamentos o escritório irá assumir?</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', backgroundColor: escopo.contabilidade ? '#eff6ff' : 'white', boxSizing: 'border-box', minWidth: 0 }}>
                  <input type="checkbox" checked={escopo.contabilidade} onChange={e => setEscopo({...escopo, contabilidade: e.target.checked})} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px', wordBreak: 'break-word' }}>Escrituração Contábil (Balanço/DRE)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', backgroundColor: escopo.fiscal ? '#eff6ff' : 'white', boxSizing: 'border-box', minWidth: 0 }}>
                  <input type="checkbox" checked={escopo.fiscal} onChange={e => setEscopo({...escopo, fiscal: e.target.checked})} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px', wordBreak: 'break-word' }}>Apuração Fiscal (Impostos/SPED)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', backgroundColor: escopo.bpoFinanceiro ? '#eff6ff' : 'white', boxSizing: 'border-box', minWidth: 0 }}>
                  <input type="checkbox" checked={escopo.bpoFinanceiro} onChange={e => setEscopo({...escopo, bpoFinanceiro: e.target.checked})} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px', wordBreak: 'break-word' }}>BPO Financeiro (Contas Pagar/Receber)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', backgroundColor: escopo.impostoRendaPJ ? '#eff6ff' : 'white', boxSizing: 'border-box', minWidth: 0 }}>
                  <input type="checkbox" checked={escopo.impostoRendaPJ} onChange={e => setEscopo({...escopo, impostoRendaPJ: e.target.checked})} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '13px', wordBreak: 'break-word' }}>Imposto de Renda PJ (ECF/DEFIS)</span>
                </label>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <input type="checkbox" checked={escopo.folhaPagamento} onChange={e => setEscopo({...escopo, folhaPagamento: e.target.checked})} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '14px', wordBreak: 'break-word' }}>Departamento Pessoal (Folha eSocial)</span>
                </div>
                {escopo.folhaPagamento && (
                  <div style={{ paddingLeft: '26px', boxSizing: 'border-box' }}>
                    <label htmlFor="qFunc" style={labelStyle}>Quantidade de Funcionários Ativos:</label>
                    <input id="qFunc" name="qFunc" type="number" min="0" style={{ ...inputStyle, width: '150px' }} value={escopo.qtdFuncionarios} onChange={e => setEscopo({...escopo, qtdFuncionarios: e.target.value})} />
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', wordBreak: 'break-word' }}>Honorários Contábeis Mensais</span>
                  <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px', wordBreak: 'break-word' }}>Valor cobrado pelos serviços selecionados.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>R$</span>
                  <input type="number" style={{ fontSize: '20px', fontWeight: '900', color: '#166534', backgroundColor: '#dcfce7', border: 'none', borderRadius: '8px', padding: '6px 10px', width: '150px', outline: 'none', boxSizing: 'border-box' }} value={honorarios} onChange={e => setHonorarios(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <button onClick={() => setAbaAtiva('dados')} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Voltar</button>
              <button onClick={() => setAbaAtiva('checklist')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', fontSize: '13px' }}>Gerar Checklist →</button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: CHECKLIST DE DOCUMENTOS
            ======================================================== */}
        {abaAtiva === 'checklist' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>3. Checklist de Documentos (Abertura e Rotina)</h3>
            
            <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '14px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <strong style={{ color: '#b45309', display: 'block', fontSize: '13.5px', marginBottom: '4px', wordBreak: 'break-word' }}>Nota do Controller (Inteligência do ERP):</strong>
              <p style={{ margin: 0, color: '#92400e', fontSize: '12.5px', lineHeight: '1.5', wordBreak: 'break-word' }}>
                O sistema gerou automaticamente as listas com base no Perfil Jurídico (<strong>{cliente.tipoEntidade.toUpperCase()}</strong>) e nos <strong>Módulos Contratados</strong>.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              {/* CHECKLIST DE ONBOARDING */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '18px' }}>📦</span>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e40af', wordBreak: 'break-word' }}>Fase 1: Onboarding Inicial</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                  {checklistOnboarding.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4', wordBreak: 'break-word' }}>{item.doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST DE ROTINA MENSAL */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '18px' }}>🔄</span>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#16a34a', wordBreak: 'break-word' }}>Fase 2: Rotina Mensal</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' }}>
                  {checklistMensal.length > 0 ? checklistMensal.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4', wordBreak: 'break-word' }}>{item.doc}</span>
                    </div>
                  )) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px', wordBreak: 'break-word' }}>Nenhum serviço de rotina selecionado.</span>
                  )}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <button onClick={() => setAbaAtiva('escopo')} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Voltar</button>
              <button onClick={() => setAbaAtiva('contrato')} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16,185,129,0.2)', fontSize: '13px' }}>Visualizar Contrato →</button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: VISUALIZADOR DE CONTRATO E ANEXOS
            ======================================================== */}
        {abaAtiva === 'contrato' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#e2e8f0', padding: '15px', borderRadius: '12px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', wordBreak: 'break-word' }}>4. Minuta de Contrato e Anexos</h3>
                <span style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-word' }}>Pronto para assinatura e envio ao cliente.</span>
              </div>
              <button onClick={imprimirDocumento} style={{ backgroundColor: '#0f172a', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', fontSize: '12.5px' }}>
                🖨️ Imprimir Contrato + Anexo (PDF)
              </button>
            </div>

            {/* DOCUMENTO DE CONTRATO (FORMATO A4 VIRTUAL) */}
            <div className="print-only-content" style={{ backgroundColor: 'white', padding: 'clamp(20px, 5vw, 50px)', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #cbd5e1', color: '#000', fontFamily: 'serif', lineHeight: '1.6', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '16px', boxSizing: 'border-box' }}>
                <h1 style={{ fontSize: '19px', margin: '0 0 8px 0', textTransform: 'uppercase', wordBreak: 'break-word' }}>Contrato de Prestação de Serviços Contábeis</h1>
                <h2 style={{ fontSize: '13px', margin: 0, fontWeight: 'normal', color: '#333', wordBreak: 'break-word' }}>Termo de Responsabilidade Técnica e Científica</h2>
              </div>

              <div style={{ textAlign: 'justify', fontSize: '13.5px', marginBottom: '16px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <p>Pelo presente instrumento particular, as partes abaixo qualificadas celebram entre si o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS, mediante as cláusulas e condições seguintes:</p>
                
                <h3 style={{ fontSize: '14.5px', marginTop: '16px', marginBottom: '8px', wordBreak: 'break-word' }}>CLÁUSULA PRIMEIRA - DAS PARTES</h3>
                <p style={{ wordBreak: 'break-word' }}>
                  <strong>CONTRATANTE:</strong> <strong>{cliente.razaoSocial || '[RAZÃO SOCIAL DO CLIENTE]'}</strong>, pessoa jurídica de direito privado sob a forma de {cliente.tipoEntidade.toUpperCase()}, inscrita no CNPJ sob o nº <strong>{cliente.cnpj || '[CNPJ]'}</strong>, com sede em <strong>{cliente.endereco || '[ENDEREÇO DA SEDE]'}</strong>, neste ato representada por seu representante legal, Sr(a). <strong>{cliente.representanteLegal || '[NOME DO REP. LEGAL]'}</strong>, inscrito(a) no CPF sob o nº <strong>{cliente.cpfRepresentante || '[CPF]'}</strong>.
                </p>
                <p style={{ wordBreak: 'break-word' }}>
                  <strong>CONTRATADA:</strong> CONTÁBIL CLOUD ERP ASSESSORIA E CONSULTORIA, inscrita no CNPJ 99.999.999/0001-99, registro no Conselho Regional de Contabilidade (CRC) sob o nº 12345/O, com sede virtual no ambiente educacional.
                </p>

                <h3 style={{ fontSize: '14.5px', marginTop: '16px', marginBottom: '8px', wordBreak: 'break-word' }}>CLÁUSULA SEGUNDA - DO OBJETO (ESCOPO)</h3>
                <p style={{ wordBreak: 'break-word' }}>O presente contrato tem por objeto a prestação de serviços profissionais nas áreas abaixo assinaladas, limitando-se a responsabilidade da CONTRATADA estritamente a estas tarefas:</p>
                <ul style={{ listStyleType: 'square', marginLeft: '20px', marginTop: '8px', wordBreak: 'break-word' }}>
                  {escopo.contabilidade && <li style={{ wordBreak: 'break-word' }}><strong>Departamento Contábil:</strong> Classificação e escrituração (Diário/Razão), Balanço e DRE (NBC TG).</li>}
                  {escopo.fiscal && <li style={{ wordBreak: 'break-word' }}><strong>Departamento Fiscal:</strong> Apuração de tributos, SPED e normas da Reforma Tributária (IVA Dual).</li>}
                  {escopo.folhaPagamento && <li style={{ wordBreak: 'break-word' }}><strong>Departamento Pessoal:</strong> Admissão, rescisão, folha para <strong>{escopo.qtdFuncionarios} funcionário(s)</strong> e eSocial/DCTFWeb.</li>}
                  {escopo.bpoFinanceiro && <li style={{ wordBreak: 'break-word' }}><strong>BPO Financeiro:</strong> Gestão de contas a pagar/receber e conciliação (OFX).</li>}
                  {escopo.impostoRendaPJ && <li style={{ wordBreak: 'break-word' }}><strong>Declarações Anuais:</strong> Elaboração e transmissão da ECF, ECD ou DEFIS.</li>}
                </ul>

                <h3 style={{ fontSize: '14.5px', marginTop: '16px', marginBottom: '8px', wordBreak: 'break-word' }}>CLÁUSULA TERCEIRA - DOS HONORÁRIOS</h3>
                <p style={{ wordBreak: 'break-word' }}>
                  Pelos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA honorários mensais no valor líquido de <strong>R$ {formatMoeda(honorarios)}</strong>, com vencimento todo dia 10 de cada mês subsequente.
                </p>

                <h3 style={{ fontSize: '14.5px', marginTop: '16px', marginBottom: '8px', wordBreak: 'break-word' }}>CLÁUSULA QUARTA - DAS OBRIGAÇÕES (DOCUMENTAÇÃO)</h3>
                <p style={{ wordBreak: 'break-word' }}>
                  A CONTRATANTE obriga-se a fornecer à CONTRATADA toda a documentação comprobatória listada integralmente no <strong>ANEXO I</strong> deste contrato.
                </p>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', flexWrap: 'wrap', gap: '20px', boxSizing: 'border-box' }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '8px', height: '35px' }}></div>
                    <strong style={{ fontSize: '12px', wordBreak: 'break-word' }}>{cliente.representanteLegal || 'REPRESENTANTE LEGAL'}</strong><br/>
                    <span style={{ fontSize: '11px', wordBreak: 'break-word' }}>CONTRATANTE</span>
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '8px', height: '35px' }}></div>
                    <strong style={{ fontSize: '12px', wordBreak: 'break-word' }}>CONTÁBIL CLOUD ERP</strong><br/>
                    <span style={{ fontSize: '11px', wordBreak: 'break-word' }}>CONTRATADA (CRC 12345/O)</span>
                  </div>
                </div>
              </div>
              
              {/* ANEXO I */}
              <div style={{ pageBreakBefore: 'always', marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #000', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px', boxSizing: 'border-box' }}>
                  <h2 style={{ fontSize: '17px', margin: '0 0 8px 0', textTransform: 'uppercase', wordBreak: 'break-word' }}>ANEXO I AO CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
                  <h3 style={{ fontSize: '13.5px', margin: 0, fontWeight: 'normal', color: '#333', wordBreak: 'break-word' }}>Termo de Solicitação e Responsabilidade Documental (Checklist)</h3>
                </div>

                <h3 style={{ fontSize: '14px', marginTop: '16px', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '4px', wordBreak: 'break-word' }}>
                  I. DOCUMENTAÇÃO DE ONBOARDING (ENTREGA IMEDIATA)
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '13px', marginBottom: '24px', boxSizing: 'border-box' }}>
                  {checklistOnboarding.map(item => (
                    <li key={item.id} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', wordBreak: 'break-word' }}>
                      <span style={{ border: '1px solid #000', minWidth: '14px', height: '14px', display: 'inline-block', marginTop: '2px', flexShrink: 0 }}></span>
                      <span>{item.doc}</span>
                    </li>
                  ))}
                </ul>

                <h3 style={{ fontSize: '14px', marginTop: '24px', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '4px', wordBreak: 'border-box' }}>
                  II. DOCUMENTAÇÃO DE ROTINA MENSAL (ATÉ O 5º DIA ÚTIL)
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '13px', marginBottom: '24px', boxSizing: 'border-box' }}>
                  {checklistMensal.length > 0 ? checklistMensal.map(item => (
                    <li key={item.id} style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', wordBreak: 'break-word' }}>
                      <span style={{ border: '1px solid #000', minWidth: '14px', height: '14px', display: 'inline-block', marginTop: '2px', flexShrink: 0 }}></span>
                      <span>{item.doc}</span>
                    </li>
                  )) : (
                    <li style={{ color: '#666', fontStyle: 'italic', wordBreak: 'break-word' }}>Nenhum documento mensal exigido.</li>
                  )}
                </ul>

                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', boxSizing: 'border-box' }}>
                  <p style={{ wordBreak: 'break-word' }}>Declaro ciência e me comprometo com o envio tempestivo dos documentos arrolados.</p>
                  <div style={{ width: '250px', borderBottom: '1px solid black', margin: '30px auto 8px auto' }}></div>
                  <strong style={{ wordBreak: 'break-word' }}>{cliente.representanteLegal || 'REPRESENTANTE LEGAL'}</strong><br/>
                  <span style={{ wordBreak: 'break-word' }}>CONTRATANTE</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}