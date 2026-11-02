import React, { useState } from 'react';

export default function SimuladorPortaisGov({ mostrarToast }) {
  const [moduloAtivo, setModuloAtivo] = useState('mei'); // 'mei', 'pgmei', 'redesim'

  // ==========================================
  // 1. ABERTURA DE MEI (PORTAL DO EMPREENDEDOR)
  // ==========================================
  const [meiDados, setMeiDados] = useState({
    cpf: '',
    nomeCompleto: '',
    nomeMae: '',
    dataNascimento: '',
    rg: '',
    orgaoEmissor: 'SSP/SP',
    tituloEleitor: '',
    nomeFantasia: '',
    capitalSocial: '5000,00',
    cnaePrincipal: '6920-6/01 - Atividades de contabilidade (Exemplo Didático)',
    ocupacao: 'Comerciante de Artigos do Vestuário e Acessórios',
    naturezaAtividade: 'Comércio', 
    cep: '06730-000',
    logradouro: 'Rua Ponta Negra',
    numero: '100',
    bairro: 'Parque do Agreste',
    municipio: 'Vargem Grande Paulista',
    uf: 'SP',
    formaAtuacao: ['Estabelecimento fixo', 'Internet'],
    declaraDesimpedimento: false,
    declaraOpcaoSimples: false,
    declaraEnquadramento: false
  });
  const [ccmeiGerado, setCcmeiGerado] = useState(null);

  // ==========================================
  // 2. PGMEI (EMISSÃO DE DAS MEI)
  // ==========================================
  const [anoCalendarioDas, setAnoCalendarioDas] = useState('2026');
  const [mesSelecionadoDas, setMesSelecionadoDas] = useState('10/2026');
  const [guiaDasGerada, setGuiaDasGerada] = useState(null);

  // ==========================================
  // 3. REDESIM / JUNTA COMERCIAL (ME / EPP)
  // ==========================================
  const [redesimFase, setRedesimFase] = useState('viabilidade'); // 'viabilidade', 'dbe', 'junta'
  const [redesimDados, setRedesimDados] = useState({
    protocoloViabilidade: 'SP261026994810',
    protocoloDBE: 'SP8839201928',
    nire: '35.2.9984712-1',
    cnpjGerado: '48.912.345/0001-88',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada (LTDA)',
    porteEmpresa: 'ME - Microempresa (Faturamento até R$ 360.000,00)',
    razaoSocialOpcao1: 'SILVA & LOPES CONSULTORIA EMPRESARIAL LTDA',
    iptuInscricao: '445.112.0098-4',
    areaImovel: '85',
    cnaeCodigo: '7020-4/00',
    cnaeDescricao: 'Atividades de consultoria em gestão empresarial',
    capitalTotal: 50000,
    socio1Nome: 'Andre Lopes da Silva',
    socio1Cpf: '412.889.308-12',
    socio1Quotas: 35000,
    socio2Nome: 'Evelin Cristina',
    socio2Cpf: '398.112.408-90',
    socio2Quotas: 15000,
    statusViabilidade: 'Pendente'
  });

  const ocupacoesMei = [
    { nome: 'Comerciante de Artigos do Vestuário e Acessórios', cnae: '4781-4/00', tipo: 'Comércio' },
    { nome: 'Cabeleireiro(a), Manicure e Pedicure Independente', cnae: '9602-5/01', tipo: 'Serviço' },
    { nome: 'Digitador(a) / Preparador(a) de Documentos', cnae: '8219-9/99', tipo: 'Serviço' },
    { nome: 'Eletricista de Instalações e Manutenção', cnae: '4321-5/00', tipo: 'Comércio e Serviço' },
    { nome: 'Transportador(a) Autônomo(a) de Cargas (Caminhoneiro)', cnae: '4930-2/02', tipo: 'Caminhoneiro' },
    { nome: 'Fornecedor(a) de Alimentos Preparados', cnae: '5620-1/04', tipo: 'Comércio' }
  ];

  const calcularValoresDas = (tipo) => {
    const salarioMinimo = 1518.00;
    const inssPadrao = +(salarioMinimo * 0.05).toFixed(2); 
    const inssCaminhoneiro = +(salarioMinimo * 0.12).toFixed(2); 
    
    let inss = tipo === 'Caminhoneiro' ? inssCaminhoneiro : inssPadrao;
    let icms = (tipo === 'Comércio' || tipo === 'Comércio e Serviço') ? 1.00 : 0.00;
    let iss = (tipo === 'Serviço' || tipo === 'Comércio e Serviço' || tipo === 'Caminhoneiro') ? 5.00 : 0.00;

    return {
      inss,
      icms,
      iss,
      total: +(inss + icms + iss).toFixed(2)
    };
  };

  const handleConcluirMei = (e) => {
    e.preventDefault();
    if (!meiDados.declaraDesimpedimento || !meiDados.declaraOpcaoSimples || !meiDados.declaraEnquadramento) {
      if (typeof mostrarToast === 'function') mostrarToast("Você precisa assinalar todas as Declarações Obrigatórias.", "aviso");
      return;
    }
    const cnpjAleatorio = `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`;
    const nireAleatorio = `358${Math.floor(10000000 + Math.random() * 89999999)}`;
    
    setCcmeiGerado({
      cnpj: cnpjAleatorio,
      nire: nireAleatorio,
      dataAbertura: new Date().toLocaleDateString('pt-BR'),
      ...meiDados
    });
    if (typeof mostrarToast === 'function') mostrarToast("Inscrição MEI deferida! CCMEI e CNPJ gerados com sucesso.", "sucesso");
  };

  const handleGerarGuiaDas = () => {
    const valores = calcularValoresDas(meiDados.naturezaAtividade);
    setGuiaDasGerada({
      competencia: mesSelecionadoDas,
      vencimento: `20/${mesSelecionadoDas.split('/')[0] === '12' ? '01/' + (parseInt(anoCalendarioDas) + 1) : (String(parseInt(mesSelecionadoDas.split('/')[0]) + 1).padStart(2, '0')) + '/' + anoCalendarioDas}`,
      numeroDocumento: `07.20.${anoCalendarioDas.slice(2)}301.${Math.floor(1000000 + Math.random() * 8999999)}-${Math.floor(1 + Math.random() * 8)}`,
      codigoBarras: `85890000000-7 ${valores.total.toFixed(2).replace('.', '')}01092610-4 20261020991-2`,
      ...valores
    });
    if (typeof mostrarToast === 'function') mostrarToast("Documento de Arrecadação (DAS) gerado!", "sucesso");
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* BARRA SUPERIOR ESTILO PORTAL PÚBLICO */}
      <div style={{ backgroundColor: '#071d41', color: 'white', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '4px solid #ffbe00', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ backgroundColor: '#1351b4', padding: '8px 12px', borderRadius: '10px', fontWeight: '900', fontSize: '17px', letterSpacing: '-0.5px', border: '1px solid #38bdf8', flexShrink: 0 }}>
            gov<span style={{ color: '#ffbe00' }}>.simulador</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>Simulador Académico de Portais Públicos</div>
            <div style={{ fontSize: '11px', color: '#93c5fd', wordBreak: 'break-word' }}>REDESIM, Portal do Empreendedor e RFB</div>
          </div>
        </div>

        {/* SELETOR DE MÓDULOS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setModuloAtivo('mei')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px', backgroundColor: moduloAtivo === 'mei' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'mei' ? '#071d41' : 'white', boxSizing: 'border-box', wordBreak: 'break-word' }}
          >
            🏢 1. Abertura MEI
          </button>
          <button 
            onClick={() => setModuloAtivo('pgmei')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px', backgroundColor: moduloAtivo === 'pgmei' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'pgmei' ? '#071d41' : 'white', boxSizing: 'border-box', wordBreak: 'border-word' }}
          >
            📄 2. Emitir Guia DAS
          </button>
          <button 
            onClick={() => setModuloAtivo('redesim')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '11.5px', backgroundColor: moduloAtivo === 'redesim' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'redesim' ? '#071d41' : 'white', boxSizing: 'border-box', wordBreak: 'break-word' }}
          >
            ⚖️ 3. REDESIM (ME/EPP)
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO PORTAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', boxSizing: 'border-box', width: '100%' }}>

        {/* MÓDULO 1: PORTAL DO EMPREENDEDOR */}
        {moduloAtivo === 'mei' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                  Portal Empresas & Negócios • Formalização
                </span>
                <h2 style={{ margin: '6px 0 2px 0', color: '#071d41', fontSize: '19px', wordBreak: 'break-word' }}>Quero ser MEI - Inscrição de Microempreendedor</h2>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', wordBreak: 'break-word' }}>Preencha a ficha cadastral unificada (Lei Complementar nº 123/2006).</p>
              </div>
              {ccmeiGerado && (
                <button onClick={() => setCcmeiGerado(null)} style={{ backgroundColor: '#1351b4', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }}>
                  🔄 Nova Simulação MEI
                </button>
              )}
            </div>

            {!ccmeiGerado ? (
              <form onSubmit={handleConcluirMei} style={{ boxSizing: 'border-box' }}>
                
                {/* IDENTIFICAÇÃO */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14.5px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
                    1. Dados de Identificação Civil (Base CPF / Gov.br)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>CPF do Titular *</label>
                      <input type="text" required placeholder="000.000.000-00" value={meiDados.cpf} onChange={e => setMeiDados({...meiDados, cpf: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Nome Civil Completo *</label>
                      <input type="text" required placeholder="Ex: Andre Lopes da Silva" value={meiDados.nomeCompleto} onChange={e => setMeiDados({...meiDados, nomeCompleto: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Documento de Identidade (RG) *</label>
                      <input type="text" required placeholder="00.000.000-0" value={meiDados.rg} onChange={e => setMeiDados({...meiDados, rg: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Nome Fantasia do Negócio *</label>
                      <input type="text" required placeholder="Ex: AL Soluções" value={meiDados.nomeFantasia} onChange={e => setMeiDados({...meiDados, nomeFantasia: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Capital Social Inicial (R$) *</label>
                      <input type="text" required value={meiDados.capitalSocial} onChange={e => setMeiDados({...meiDados, capitalSocial: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                </div>

                {/* ATIVIDADES */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14.5px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
                    2. Atividades Econômicas (CGSN nº 140/2018)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Ocupação Principal Permitida *</label>
                      <select 
                        value={meiDados.ocupacao}
                        onChange={e => {
                          const selecionada = ocupacoesMei.find(o => o.nome === e.target.value);
                          if (selecionada) {
                            setMeiDados({
                              ...meiDados, 
                              ocupacao: selecionada.nome, 
                              cnaePrincipal: `${selecionada.cnae} - ${selecionada.nome}`,
                              naturezaAtividade: selecionada.tipo
                            });
                          }
                        }}
                        style={{ ...inputStyle, backgroundColor: 'white' }}
                      >
                        {ocupacoesMei.map((oc, i) => (
                          <option key={i} value={oc.nome}>{oc.nome} (CNAE {oc.cnae})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Enquadramento Tributário (DAS)</label>
                      <input type="text" readOnly value={`Modalidade: ${meiDados.naturezaAtividade} (R$ ${calcularValoresDas(meiDados.naturezaAtividade).total.toFixed(2).replace('.', ',')} /mês)`} style={{ ...inputStyle, backgroundColor: '#e2e8f0', fontWeight: 'bold' }} />
                    </div>
                  </div>
                </div>

                {/* ENDEREÇO */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '14.5px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
                    3. Endereço Comercial e Forma de Atuação
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>CEP *</label>
                      <input type="text" value={meiDados.cep} onChange={e => setMeiDados({...meiDados, cep: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0, gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Logradouro *</label>
                      <input type="text" value={meiDados.logradouro} onChange={e => setMeiDados({...meiDados, logradouro: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Bairro *</label>
                      <input type="text" value={meiDados.bairro} onChange={e => setMeiDados({...meiDados, bairro: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label style={labelStyle}>Município / UF *</label>
                      <input type="text" value={`${meiDados.municipio} - ${meiDados.uf}`} readOnly style={{ ...inputStyle, backgroundColor: '#e2e8f0' }} />
                    </div>
                  </div>
                </div>

                {/* TERMOS LEGAIS */}
                <div style={{ backgroundColor: '#fffbeb', padding: '18px', borderRadius: '16px', border: '1px solid #fde68a', marginBottom: '20px', boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#92400e', wordBreak: 'break-word' }}>
                    4. Declarações Obrigatórias (Dispensa de Alvará)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#451a03', boxSizing: 'border-box' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', wordBreak: 'break-word' }}>
                      <input type="checkbox" checked={meiDados.declaraDesimpedimento} onChange={e => setMeiDados({...meiDados, declaraDesimpedimento: e.target.checked})} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Desimpedimento:</strong> Declaro não estar impedido de exercer atividade empresarial.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', wordBreak: 'break-word' }}>
                      <input type="checkbox" checked={meiDados.declaraOpcaoSimples} onChange={e => setMeiDados({...meiDados, declaraOpcaoSimples: e.target.checked})} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Opção SIMEI:</strong> Opto pelo recolhimento em valores fixos mensais do SIMEI.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', wordBreak: 'break-word' }}>
                      <input type="checkbox" checked={meiDados.declaraEnquadramento} onChange={e => setMeiDados({...meiDados, declaraEnquadramento: e.target.checked})} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Enquadramento ME:</strong> O faturamento previsto não ultrapassa o limite legal.</span>
                    </label>
                  </div>
                </div>

                <button type="submit" style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)', boxSizing: 'border-box' }}>
                  ✅ Confirmar Inscrição e Emitir CCMEI + CNPJ
                </button>
              </form>
            ) : (
              /* CERTIFICADO CCMEI */
              <div style={{ border: '2px solid #0f172a', padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word' }}>REPÚBLICA FEDERATIVA DO BRASIL • REDESIM</div>
                  <h2 style={{ margin: '6px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>CERTIFICADO DA CONDIÇÃO DE MEI (CCMEI)</h2>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                    EFEITO DE ALVARÁ DE LICENÇA E FUNCIONAMENTO PROVISÓRIO
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', fontSize: '12.5px', marginBottom: '20px', boxSizing: 'border-box' }}>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>EMPRESÁRIO</span>
                    <strong style={{ wordBreak: 'break-word' }}>{ccmeiGerado.cpf.slice(0, 8)} {ccmeiGerado.nomeCompleto.toUpperCase()}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CNPJ</span>
                    <strong style={{ color: '#1351b4', fontSize: '14.5px', wordBreak: 'break-word' }}>{ccmeiGerado.cnpj}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>NIRE</span>
                    <strong style={{ wordBreak: 'break-word' }}>{ccmeiGerado.nire}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CAPITAL SOCIAL E SITUAÇÃO</span>
                    <strong style={{ wordBreak: 'break-word' }}>R$ {ccmeiGerado.capitalSocial} | ATIVO</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', gridColumn: '1 / -1', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CNAE E ENDEREÇO</span>
                    <strong style={{ wordBreak: 'break-word' }}>{ccmeiGerado.cnaePrincipal} • {ccmeiGerado.logradouro}, {ccmeiGerado.numero} - {ccmeiGerado.municipio}/{ccmeiGerado.uf}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box' }}>
                    🖨️ Imprimir CCMEI
                  </button>
                  <button onClick={() => setModuloAtivo('pgmei')} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box' }}>
                    Ir para Guia DAS (PGMEI) →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MÓDULO 2: PGMEI */}
        {moduloAtivo === 'pgmei' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ backgroundColor: '#166534', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', wordBreak: 'break-word' }}>SIMPLES NACIONAL • SIMEI</span>
                <h2 style={{ margin: '6px 0 2px 0', color: '#14532d', fontSize: '19px', wordBreak: 'break-word' }}>PGMEI - Programa Gerador de DAS</h2>
                <span style={{ fontSize: '12px', color: '#15803d', wordBreak: 'break-word' }}>Emita o Documento de Arrecadação com INSS, ICMS e ISS.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Tipo de Atividade:</label>
                <select 
                  value={meiDados.naturezaAtividade} 
                  onChange={e => setMeiDados({...meiDados, naturezaAtividade: e.target.value})}
                  style={{ ...inputStyle, backgroundColor: 'white', fontWeight: 'bold' }}
                >
                  <option value="Comércio">Comércio ou Indústria</option>
                  <option value="Serviço">Prestação de Serviços</option>
                  <option value="Comércio e Serviço">Comércio e Serviços</option>
                  <option value="Caminhoneiro">MEI Caminhoneiro</option>
                </select>
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Competência:</label>
                <select 
                  value={mesSelecionadoDas} 
                  onChange={e => setMesSelecionadoDas(e.target.value)}
                  style={{ ...inputStyle, backgroundColor: 'white' }}
                >
                  <option value="08/2026">Agosto/2026</option>
                  <option value="09/2026">Setembro/2026</option>
                  <option value="10/2026">Outubro/2026</option>
                  <option value="11/2026">Novembro/2026</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                <button onClick={handleGerarGuiaDas} style={{ width: '100%', padding: '11px', backgroundColor: '#15803d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxSizing: 'border-box' }}>
                  📄 Apurar e Emitir Guia DAS
                </button>
              </div>
            </div>

            {guiaDasGerada && (
              <div style={{ border: '2px solid #0f172a', borderRadius: '16px', padding: '20px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '14.5px', display: 'block', wordBreak: 'break-word' }}>Documento de Arrecadação (DAS)</strong>
                    <span style={{ fontSize: '11.5px', color: '#475569', wordBreak: 'break-word' }}>SIMEI • Nº: {guiaDasGerada.numeroDocumento}</span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 0 }}>
                    <span style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Competência</span>
                    <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{guiaDasGerada.competencia}</strong>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', boxSizing: 'border-box', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Tributo</th>
                        <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Destinação</th>
                        <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}><strong>INSS</strong></td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>Previdência Social</td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {guiaDasGerada.inss.toFixed(2).replace('.', ',')}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'border-word' }}><strong>ICMS</strong></td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>Estado de São Paulo</td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {guiaDasGerada.icms.toFixed(2).replace('.', ',')}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'border-word' }}><strong>ISS</strong></td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>Município</td>
                        <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {guiaDasGerada.iss.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan="2" style={{ padding: '10px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>TOTAL (Vencimento: {guiaDasGerada.vencimento})</td>
                        <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#15803d', whiteSpace: 'nowrap' }}>R$ {guiaDasGerada.total.toFixed(2).replace('.', ',')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px dashed #64748b', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', wordBreak: 'break-word' }}>CÓDIGO DE BARRAS SIMULADO</div>
                  <strong style={{ fontSize: '13px', letterSpacing: '1px', wordBreak: 'break-all' }}>{guiaDasGerada.codigoBarras}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MÓDULO 3: REDESIM */}
        {moduloAtivo === 'redesim' && (
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', wordBreak: 'border-word' }}>
                REDESIM • JUCESP • COLETOR NACIONAL RFB
              </span>
              <h2 style={{ margin: '6px 0 2px 0', color: '#071d41', fontSize: '19px', wordBreak: 'break-word' }}>Abertura de Empresa (ME / EPP) - Fluxo Completo</h2>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', wordBreak: 'break-word' }}>Viabilidade, DBE e Contrato Social.</p>
            </div>

            {/* BARRA DE PROGRESSO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div 
                onClick={() => setRedesimFase('viabilidade')}
                style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', border: redesimFase === 'viabilidade' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'viabilidade' ? '#eff6ff' : '#f8fafc', boxSizing: 'border-box', minWidth: 0 }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#1351b4', wordBreak: 'break-word' }}>ETAPA 1</div>
                <strong style={{ fontSize: '13px', wordBreak: 'border-word' }}>Viabilidade</strong>
              </div>
              <div 
                onClick={() => setRedesimFase('dbe')}
                style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', border: redesimFase === 'dbe' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'dbe' ? '#eff6ff' : '#f8fafc', boxSizing: 'border-box', minWidth: 0 }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#1351b4', wordBreak: 'border-word' }}>ETAPA 2</div>
                <strong style={{ fontSize: '13px', wordBreak: 'border-word' }}>DBE (RFB)</strong>
              </div>
              <div 
                onClick={() => setRedesimFase('junta')}
                style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', border: redesimFase === 'junta' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'junta' ? '#eff6ff' : '#f8fafc', boxSizing: 'border-box', minWidth: 0 }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#1351b4', wordBreak: 'border-word' }}>ETAPA 3</div>
                <strong style={{ fontSize: '13px', wordBreak: 'border-word' }}>Contrato Social</strong>
              </div>
            </div>

            {redesimFase === 'viabilidade' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 14px 0', color: '#071d41', fontSize: '15px', wordBreak: 'break-word' }}>Etapa 1: Consulta Prévia de Viabilidade e Nome</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Natureza Jurídica:</label>
                    <select value={redesimDados.naturezaJuridica} onChange={e => setRedesimDados({...redesimDados, naturezaJuridica: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                      <option value="206-2 - Sociedade Empresária Limitada (LTDA)">Sociedade Limitada (LTDA)</option>
                      <option value="206-2 - Sociedade Limitada Unipessoal (SLU)">Limitada Unipessoal (SLU)</option>
                    </select>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Porte:</label>
                    <select value={redesimDados.porteEmpresa} onChange={e => setRedesimDados({...redesimDados, porteEmpresa: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                      <option value="ME - Microempresa">ME - Microempresa</option>
                      <option value="EPP - Empresa de Pequeno Porte">EPP - Pequeno Porte</option>
                    </select>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Inscrição Imobiliária (IPTU):</label>
                    <input type="text" value={redesimDados.iptuInscricao} onChange={e => setRedesimDados({...redesimDados, iptuInscricao: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Razão Social:</label>
                    <input type="text" value={redesimDados.razaoSocialOpcao1} onChange={e => setRedesimDados({...redesimDados, razaoSocialOpcao1: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setRedesimDados({...redesimDados, statusViabilidade: 'Deferida'});
                    setRedesimFase('dbe');
                    if (typeof mostrarToast === 'function') mostrarToast("Viabilidade aprovada! Avance para o DBE.", "sucesso");
                  }}
                  style={{ backgroundColor: '#1351b4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxSizing: 'border-box' }}
                >
                  Transmitir Viabilidade e Avançar para o DBE →
                </button>
              </div>
            )}

            {redesimFase === 'dbe' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 14px 0', color: '#071d41', fontSize: '15px', wordBreak: 'break-word' }}>Etapa 2: DBE e Quadro Societário (QSA)</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px', wordBreak: 'break-word' }}>A soma das quotas deve fechar exatamente 100% do Capital Social.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Capital Social (R$):</label>
                    <input type="number" value={redesimDados.capitalTotal} onChange={e => setRedesimDados({...redesimDados, capitalTotal: Number(e.target.value)})} style={{ ...inputStyle, fontWeight: 'bold' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Sócio 1 (Administrador):</label>
                    <input type="text" value={redesimDados.socio1Nome} onChange={e => setRedesimDados({...redesimDados, socio1Nome: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Capital Sócio 1 (R$):</label>
                    <input type="number" value={redesimDados.socio1Quotas} onChange={e => setRedesimDados({...redesimDados, socio1Quotas: Number(e.target.value)})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Sócio 2 (Quotista):</label>
                    <input type="text" value={redesimDados.socio2Nome} onChange={e => setRedesimDados({...redesimDados, socio2Nome: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Capital Sócio 2 (R$):</label>
                    <input type="number" value={redesimDados.socio2Quotas} onChange={e => setRedesimDados({...redesimDados, socio2Quotas: Number(e.target.value)})} style={inputStyle} />
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', backgroundColor: (redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal ? '#dcfce7' : '#fee2e2', color: (redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal ? '#166534' : '#991b1b', fontWeight: 'bold', fontSize: '12.5px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  {(redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal 
                    ? `✓ QSA Validado: Soma das quotas equivale a 100% do Capital Social.`
                    : `⚠️ Erro: A soma das quotas diverge do Capital Social Total.`
                  }
                </div>

                <button 
                  onClick={() => {
                    if ((redesimDados.socio1Quotas + redesimDados.socio2Quotas) !== redesimDados.capitalTotal) {
                      if (typeof mostrarToast === 'function') mostrarToast("Corrija a distribuição de quotas antes de transmitir!", "erro");
                      return;
                    }
                    setRedesimFase('junta');
                    if (typeof mostrarToast === 'function') mostrarToast("DBE transmitido e deferido! Prossiga para o Contrato Social.", "sucesso");
                  }}
                  style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxSizing: 'border-box' }}
                >
                  Transmitir DBE e Gerar Contrato Social →
                </button>
              </div>
            )}

            {redesimFase === 'junta' && (
              <div style={{ border: '2px solid #0f172a', padding: '24px', borderRadius: '16px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1351b4', wordBreak: 'break-word' }}>JUCESP • NIRE: {redesimDados.nire}</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', wordBreak: 'break-word' }}>CONTRATO SOCIAL DE SOCIEDADE LIMITADA</h3>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11.5px', flexShrink: '0' }}>
                    CNPJ: {redesimDados.cnpjGerado}
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', lineHeight: '1.7', color: '#1e293b', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <p><strong>Pelo presente instrumento particular:</strong></p>
                  <p>1. <strong>{redesimDados.socio1Nome.toUpperCase()}</strong> e 2. <strong>{redesimDados.socio2Nome.toUpperCase()}</strong> resolvem constituir uma Sociedade Limitada.</p>
                  <p><strong>CLÁUSULA PRIMEIRA:</strong> A sociedade girará sob o nome empresarial de <strong>{redesimDados.razaoSocialOpcao1}</strong>.</p>
                  <p><strong>CLÁUSULA SEGUNDA:</strong> Capital social de <strong>R$ {redesimDados.capitalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>, totalmente integralizado.</p>
                </div>

                <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box' }}>
                  🖨️ Imprimir Contrato Social e Cartão CNPJ
                </button>
              </div>
            )}
          </div>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}