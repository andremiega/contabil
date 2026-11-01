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

  // Estilos Padronizados
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #3b82f6' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>GESTÃO DE CLIENTES</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Onboarding & Contratos Contábeis</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Qualifique o cliente, defina o escopo e gere o contrato e os checklists (KYC e Rotina).</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('dados')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'dados' ? '#3b82f6' : 'transparent', color: abaAtiva === 'dados' ? 'white' : '#cbd5e1' }}>🏢 1. KYC (Dados)</button>
          <button onClick={() => setAbaAtiva('escopo')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'escopo' ? '#3b82f6' : 'transparent', color: abaAtiva === 'escopo' ? 'white' : '#cbd5e1' }}>⚖️ 2. Escopo & Preço</button>
          <button onClick={() => setAbaAtiva('checklist')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'checklist' ? '#3b82f6' : 'transparent', color: abaAtiva === 'checklist' ? 'white' : '#cbd5e1' }}>📋 3. Checklist Docs</button>
          <button onClick={() => setAbaAtiva('contrato')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'contrato' ? '#3b82f6' : 'transparent', color: abaAtiva === 'contrato' ? 'white' : '#cbd5e1' }}>📝 4. Gerar Contrato</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: DADOS DO CLIENTE (KYC)
            ======================================================== */}
        {abaAtiva === 'dados' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>1. Qualificação da Entidade (KYC - Know Your Client)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label htmlFor="cTipo" style={labelStyle}>Tipo Jurídico (Natureza da Entidade):</label>
                    <select id="cTipo" name="cTipo" style={{...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', fontWeight: 'bold', color: '#1e40af'}} value={cliente.tipoEntidade} onChange={e => setCliente({...cliente, tipoEntidade: e.target.value})}>
                      <option value="empresa">Empresa Comercial / Indústria / Serviços</option>
                      <option value="ong">Associação Sem Fins Lucrativos (ONG)</option>
                      <option value="igreja">Organização Religiosa (Igreja)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cRazao" style={labelStyle}>Razão Social / Nome da Instituição:</label>
                    <input id="cRazao" name="cRazao" type="text" style={inputStyle} value={cliente.razaoSocial} onChange={e => setCliente({...cliente, razaoSocial: e.target.value})} placeholder="Ex: Tech Solutions Ltda" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="cCNPJ" style={labelStyle}>CNPJ:</label>
                      <input id="cCNPJ" name="cCNPJ" type="text" style={inputStyle} value={cliente.cnpj} onChange={e => setCliente({...cliente, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                      <label htmlFor="cRep" style={labelStyle}>Representante Legal (Sócio/Presidente):</label>
                      <input id="cRep" name="cRep" type="text" style={inputStyle} value={cliente.representanteLegal} onChange={e => setCliente({...cliente, representanteLegal: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    <div>
                      <label htmlFor="cCPF" style={labelStyle}>CPF do Representante:</label>
                      <input id="cCPF" name="cCPF" type="text" style={inputStyle} value={cliente.cpfRepresentante} onChange={e => setCliente({...cliente, cpfRepresentante: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="cEnd" style={labelStyle}>Endereço Completo da Sede:</label>
                      <input id="cEnd" name="cEnd" type="text" style={inputStyle} value={cliente.endereco} onChange={e => setCliente({...cliente, endereco: e.target.value})} />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setAbaAtiva('escopo')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                Salvar Dados e Ir para Escopo →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: ESCOPO DE SERVIÇOS E PRECIFICAÇÃO
            ======================================================== */}
        {abaAtiva === 'escopo' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>2. Escopo Contratual & Honorários</h3>
            
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1e40af' }}>Quais departamentos o escritório irá assumir?</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: escopo.contabilidade ? '#eff6ff' : 'white' }}>
                  <input type="checkbox" checked={escopo.contabilidade} onChange={e => setEscopo({...escopo, contabilidade: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>Escrituração Contábil (Balanço/DRE)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: escopo.fiscal ? '#eff6ff' : 'white' }}>
                  <input type="checkbox" checked={escopo.fiscal} onChange={e => setEscopo({...escopo, fiscal: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>Apuração Fiscal (Impostos/SPED)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: escopo.bpoFinanceiro ? '#eff6ff' : 'white' }}>
                  <input type="checkbox" checked={escopo.bpoFinanceiro} onChange={e => setEscopo({...escopo, bpoFinanceiro: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>BPO Financeiro (Contas a Pagar/Receber)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', backgroundColor: escopo.impostoRendaPJ ? '#eff6ff' : 'white' }}>
                  <input type="checkbox" checked={escopo.impostoRendaPJ} onChange={e => setEscopo({...escopo, impostoRendaPJ: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>Declaração de Imposto de Renda (ECF/DEFIS)</span>
                </label>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <input type="checkbox" checked={escopo.folhaPagamento} onChange={e => setEscopo({...escopo, folhaPagamento: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '15px' }}>Departamento Pessoal (Folha eSocial)</span>
                </div>
                {escopo.folhaPagamento && (
                  <div style={{ paddingLeft: '30px' }}>
                    <label htmlFor="qFunc" style={labelStyle}>Quantidade de Funcionários Ativos:</label>
                    <input id="qFunc" name="qFunc" type="number" min="0" style={{ ...inputStyle, width: '150px' }} value={escopo.qtdFuncionarios} onChange={e => setEscopo({...escopo, qtdFuncionarios: e.target.value})} />
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Honorários Contábeis Mensais</span>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>Valor cobrado pelos serviços selecionados.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>R$</span>
                  <input type="number" style={{ fontSize: '24px', fontWeight: '900', color: '#166534', backgroundColor: '#dcfce7', border: 'none', borderRadius: '8px', padding: '8px 12px', width: '180px', outline: 'none' }} value={honorarios} onChange={e => setHonorarios(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => setAbaAtiva('dados')} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>← Voltar</button>
              <button onClick={() => setAbaAtiva('checklist')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>Gerar Checklist →</button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: CHECKLIST DE DOCUMENTOS (ONBOARDING E MENSAL)
            ======================================================== */}
        {abaAtiva === 'checklist' && (
          <div className="no-print" style={{ animation: 'fadeIn 0.3s', maxWidth: '850px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>3. Checklist de Documentos (Abertura e Rotina)</h3>
            
            <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <strong style={{ color: '#b45309', display: 'block', fontSize: '14px', marginBottom: '6px' }}>Nota do Controller (Inteligência do ERP):</strong>
              <p style={{ margin: 0, color: '#92400e', fontSize: '13px', lineHeight: '1.5' }}>
                O sistema gerou automaticamente as listas abaixo com base no Perfil Jurídico (<strong>{cliente.tipoEntidade.toUpperCase()}</strong>) e nos <strong>Módulos Contratados</strong>. Se o cliente não entregar isto, é impossível processar a contabilidade.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              
              {/* CHECKLIST DE ONBOARDING */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px' }}>📦</span>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#1e40af' }}>Fase 1: Onboarding Inicial</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checklistOnboarding.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.4' }}>{item.doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHECKLIST DE ROTINA MENSAL */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px' }}>🔄</span>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#16a34a' }}>Fase 2: Rotina Mensal (Recorrente)</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checklistMensal.length > 0 ? checklistMensal.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.4' }}>{item.doc}</span>
                    </div>
                  )) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Nenhum serviço de rotina selecionado.</span>
                  )}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button onClick={() => setAbaAtiva('escopo')} style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>← Voltar</button>
              <button onClick={() => setAbaAtiva('contrato')} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>Visualizar Contrato Jurídico →</button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: VISUALIZADOR DE CONTRATO E ANEXOS (IMPRIMÍVEL)
            ======================================================== */}
        {abaAtiva === 'contrato' && (
          <div style={{ animation: 'fadeIn 0.3s', maxWidth: '850px', margin: '0 auto' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#e2e8f0', padding: '15px', borderRadius: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>4. Minuta de Contrato e Anexos</h3>
                <span style={{ fontSize: '12px', color: '#475569' }}>Pronto para assinatura e envio ao cliente.</span>
              </div>
              <button onClick={imprimirDocumento} style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                🖨️ Imprimir Contrato + Anexo (PDF)
              </button>
            </div>

            {/* DOCUMENTO DE CONTRATO (FORMATO A4 VIRTUAL) */}
            <div className="print-only-content" style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #cbd5e1', color: '#000', fontFamily: 'serif', lineHeight: '1.6' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '22px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Contrato de Prestação de Serviços Contábeis</h1>
                <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 'normal', color: '#333' }}>Termo de Responsabilidade Técnica e Científica</h2>
              </div>

              <div style={{ textAlign: 'justify', fontSize: '14px', marginBottom: '20px' }}>
                <p>Pelo presente instrumento particular, as partes abaixo qualificadas celebram entre si o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS, mediante as cláusulas e condições seguintes:</p>
                
                <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '10px' }}>CLÁUSULA PRIMEIRA - DAS PARTES</h3>
                <p>
                  <strong>CONTRATANTE:</strong> <strong>{cliente.razaoSocial || '[RAZÃO SOCIAL DO CLIENTE]'}</strong>, pessoa jurídica de direito privado sob a forma de {cliente.tipoEntidade.toUpperCase()}, inscrita no CNPJ sob o nº <strong>{cliente.cnpj || '[CNPJ]'}</strong>, com sede em <strong>{cliente.endereco || '[ENDEREÇO DA SEDE]'}</strong>, neste ato representada por seu representante legal, Sr(a). <strong>{cliente.representanteLegal || '[NOME DO REP. LEGAL]'}</strong>, inscrito(a) no CPF sob o nº <strong>{cliente.cpfRepresentante || '[CPF]'}</strong>.
                </p>
                <p>
                  <strong>CONTRATADA:</strong> CONTÁBIL CLOUD ERP ASSESSORIA E CONSULTORIA, inscrita no CNPJ 99.999.999/0001-99, registro no Conselho Regional de Contabilidade (CRC) sob o nº 12345/O, com sede virtual no ambiente educacional.
                </p>

                <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '10px' }}>CLÁUSULA SEGUNDA - DO OBJETO (ESCOPO)</h3>
                <p>O presente contrato tem por objeto a prestação de serviços profissionais nas áreas abaixo assinaladas, limitando-se a responsabilidade da CONTRATADA estritamente a estas tarefas:</p>
                <ul style={{ listStyleType: 'square', marginLeft: '20px', marginTop: '10px' }}>
                  {escopo.contabilidade && <li><strong>Departamento Contábil:</strong> Classificação e escrituração da contabilidade (Livro Diário e Razão), elaboração de Balanço Patrimonial e DRE de acordo com as normas NBC TG vigentes.</li>}
                  {escopo.fiscal && <li><strong>Departamento Fiscal/Tributário:</strong> Apuração de tributos, envio do SPED Fiscal/Contribuições e atendimento às normas da Reforma Tributária (IVA Dual).</li>}
                  {escopo.folhaPagamento && <li><strong>Departamento Pessoal:</strong> Admissão, rescisão (TRCT), elaboração de folha de pagamento para <strong>{escopo.qtdFuncionarios} funcionário(s)</strong> e transmissão ao eSocial/DCTFWeb.</li>}
                  {escopo.bpoFinanceiro && <li><strong>BPO Financeiro:</strong> Gestão de contas a pagar, contas a receber e conciliação bancária (OFX).</li>}
                  {escopo.impostoRendaPJ && <li><strong>Declarações Anuais:</strong> Elaboração e transmissão da ECF, ECD ou DEFIS.</li>}
                </ul>

                <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '10px' }}>CLÁUSULA TERCEIRA - DOS HONORÁRIOS</h3>
                <p>
                  Pelos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA os honorários contábeis mensais no valor líquido de <strong>R$ {formatMoeda(honorarios)}</strong>, com vencimento todo dia 10 de cada mês subsequente ao serviço prestado. Fica estipulado a cobrança de 13º salário contábil a ser faturado no mês de dezembro de cada exercício.
                </p>

                <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '10px' }}>CLÁUSULA QUARTA - DAS OBRIGAÇÕES DA CONTRATANTE (DOCUMENTAÇÃO)</h3>
                <p>
                  A CONTRATANTE (<strong>{cliente.razaoSocial || '[CLIENTE]'}</strong>) obriga-se a fornecer à CONTRATADA, de forma idônea e tempestiva, toda a documentação comprobatória dos fatos geradores listada integralmente no <strong>ANEXO I</strong> deste contrato. A CONTRATADA exime-se de responsabilidade criminal e administrativa por ocultação de receitas ou fraudes operadas pelos administradores da CONTRATANTE, ou pela falta de envio tempestivo dos documentos arrolados no Anexo I.
                </p>

                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                  <div style={{ width: '40%' }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '10px', height: '40px' }}></div>
                    <strong style={{ fontSize: '13px' }}>{cliente.representanteLegal || 'REPRESENTANTE LEGAL'}</strong><br/>
                    <span style={{ fontSize: '12px' }}>CONTRATANTE ({cliente.cnpj || 'CNPJ'})</span>
                  </div>
                  <div style={{ width: '40%' }}>
                    <div style={{ borderBottom: '1px solid black', marginBottom: '10px', height: '40px' }}></div>
                    <strong style={{ fontSize: '13px' }}>CONTÁBIL CLOUD ERP</strong><br/>
                    <span style={{ fontSize: '12px' }}>CONTRATADA (CRC 12345/O)</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', fontStyle: 'italic' }}>
                  Local e Data: ___________________________, _____/_____/2026.
                </div>
              </div>
              
              {/* =======================================================
                  NOVA PÁGINA: ANEXO I (LISTAS DE DOCUMENTOS ESPECÍFICAS)
                  ======================================================= */}
              <div style={{ pageBreakBefore: 'always', marginTop: '40px', paddingTop: '40px', borderTop: '2px solid #000' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '20px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>ANEXO I AO CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
                  <h3 style={{ fontSize: '16px', margin: 0, fontWeight: 'normal', color: '#333' }}>Termo de Solicitação e Responsabilidade Documental (Checklist)</h3>
                </div>

                <p style={{ textAlign: 'justify', fontSize: '14px', marginBottom: '20px' }}>
                  Para a correta execução dos serviços descritos na Cláusula Segunda deste contrato, a CONTRATANTE se obriga a fornecer os seguintes documentos:
                </p>

                {/* Bloco 1: Onboarding */}
                <h3 style={{ fontSize: '15px', marginTop: '20px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                  I. DOCUMENTAÇÃO DE ONBOARDING (ENTREGA IMEDIATA)
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '14px', marginBottom: '30px' }}>
                  {checklistOnboarding.map(item => (
                    <li key={item.id} style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ border: '1px solid #000', minWidth: '15px', height: '15px', display: 'inline-block', marginTop: '3px' }}></span>
                      <span>{item.doc}</span>
                    </li>
                  ))}
                </ul>

                {/* Bloco 2: Mensal Recorrente */}
                <h3 style={{ fontSize: '15px', marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                  II. DOCUMENTAÇÃO DE ROTINA MENSAL (ATÉ O 5º DIA ÚTIL)
                </h3>
                <p style={{ textAlign: 'justify', fontSize: '13px', fontStyle: 'italic', marginBottom: '15px' }}>
                  Documentos necessários para o processamento da Contabilidade, Apuração Fiscal e Folha de Pagamento do mês anterior:
                </p>
                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '14px', marginBottom: '30px' }}>
                  {checklistMensal.length > 0 ? checklistMensal.map(item => (
                    <li key={item.id} style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ border: '1px solid #000', minWidth: '15px', height: '15px', display: 'inline-block', marginTop: '3px' }}></span>
                      <span>{item.doc}</span>
                    </li>
                  )) : (
                    <li style={{ color: '#666', fontStyle: 'italic' }}>Nenhum documento mensal exigido com base no escopo atual.</li>
                  )}
                </ul>

                <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '13px' }}>
                  <p>Declaro ciência e me comprometo com o envio tempestivo dos documentos acima arrolados nos prazos estabelecidos.</p>
                  <div style={{ width: '40%', borderBottom: '1px solid black', margin: '40px auto 10px auto' }}></div>
                  <strong>{cliente.representanteLegal || 'REPRESENTANTE LEGAL'}</strong><br/>
                  <span>CONTRATANTE</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* CSS para Impressão */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}