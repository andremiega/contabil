import React, { useState } from 'react';

export default function SimuladorPortaisGov({ mostrarToast }) {
  const [moduloAtivo, setModuloAtivo] = useState('mei'); // 'mei', 'pgmei', 'redesim'

  // ==========================================
  // ESTADOS: 1. ABERTURA DE MEI (PORTAL DO EMPREENDEDOR)
  // ==========================================
  const [meiStep, setMeiStep] = useState(1);
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
    naturezaAtividade: 'Comércio', // Comércio, Serviço, Comércio e Serviço, Caminhoneiro
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
  // ESTADOS: 2. PGMEI (EMISSÃO DE DAS MEI)
  // ==========================================
  const [anoCalendarioDas, setAnoCalendarioDas] = useState('2026');
  const [mesSelecionadoDas, setMesSelecionadoDas] = useState('10/2026');
  const [guiaDasGerada, setGuiaDasGerada] = useState(null);

  // ==========================================
  // ESTADOS: 3. REDESIM / JUNTA COMERCIAL (ME / EPP)
  // ==========================================
  const [redesimFase, setRedesimFase] = useState('viabilidade'); // 'viabilidade', 'dbe', 'junta', 'concluido'
  const [redesimDados, setRedesimDados] = useState({
    protocoloViabilidade: 'SP261026994810',
    protocoloDBE: 'SP8839201928',
    nire: '35.2.9984712-1',
    cnpjGerado: '48.912.345/0001-88',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada (LTDA)',
    porteEmpresa: 'ME - Microempresa (Faturamento até R$ 360.000,00)',
    optaSimples: 'Sim',
    opcaoMatrículaPadrao: true,
    razaoSocialOpcao1: 'SILVA & LOPES CONSULTORIA EMPRESARIAL LTDA',
    razaoSocialOpcao2: 'AL GESTAO DE NEGOCIOS LTDA',
    razaoSocialOpcao3: 'AGRESTE SOLUCOES CORPORATIVAS LTDA',
    nomeFantasia: 'Lopes Gestão & Negócios',
    iptuInscricao: '445.112.0098-4',
    areaImovel: '85',
    tipoImovel: 'Comercial Terreo',
    cnaeCodigo: '7020-4/00',
    cnaeDescricao: 'Atividades de consultoria em gestão empresarial, exceto consultoria técnica específica',
    capitalTotal: 50000,
    socio1Nome: 'Andre Lopes da Silva',
    socio1Cpf: '412.889.308-12',
    socio1Quotas: 35000,
    socio1Admin: true,
    socio2Nome: 'Evelin Cristina',
    socio2Cpf: '398.112.408-90',
    socio2Quotas: 15000,
    socio2Admin: false,
    clausulaForo: 'Comarca de Vargem Grande Paulista - SP',
    statusViabilidade: 'Pendente',
    statusDBE: 'Aguardando Viabilidade',
    statusJunta: 'Aguardando DBE'
  });

  // Lista de Ocupações MEI Reais com incidência de ICMS/ISS
  const ocupacoesMei = [
    { nome: 'Comerciante de Artigos do Vestuário e Acessórios', cnae: '4781-4/00', tipo: 'Comércio' },
    { nome: 'Cabeleireiro(a), Manicure e Pedicure Independente', cnae: '9602-5/01', tipo: 'Serviço' },
    { nome: 'Digitador(a) / Preparador(a) de Documentos Independente', cnae: '8219-9/99', tipo: 'Serviço' },
    { nome: 'Eletricista de Instalações e Manutenção Independente', cnae: '4321-5/00', tipo: 'Comércio e Serviço' },
    { nome: 'Transportador(a) Autônomo(a) de Cargas (MEI Caminhoneiro)', cnae: '4930-2/02', tipo: 'Caminhoneiro' },
    { nome: 'Fornecedor(a) de Alimentos Preparados para Consumo Domiciliar', cnae: '5620-1/04', tipo: 'Comércio' }
  ];

  // Cálculo oficial do DAS MEI (Base Salário Mínimo Simulado R$ 1.518,00)
  const calcularValoresDas = (tipo) => {
    const salarioMinimo = 1518.00;
    const inssPadrao = +(salarioMinimo * 0.05).toFixed(2); // 5% = R$ 75,90
    const inssCaminhoneiro = +(salarioMinimo * 0.12).toFixed(2); // 12% = R$ 182,16
    
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
      if (mostrarToast) mostrarToast("Você precisa assinalar todas as Declarações Obrigatórias da Receita Federal.", "aviso");
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
    if (mostrarToast) mostrarToast("Inscrição MEI deferida! CCMEI e CNPJ gerados com sucesso.", "sucesso");
  };

  const handleGerarGuiaDas = () => {
    const valores = calcularValoresDas(meiDados.naturezaAtividade);
    setGuiaDasGerada({
      competencia: mesSelecionadoDas,
      vencimento: `20/${mesSelecionadoDas.split('/')[0] === '12' ? '01/' + (parseInt(anoCalendarioDas) + 1) : (String(parseInt(mesSelecionadoDas.split('/')[0]) + 1).padStart(2, '0')) + '/' + anoCalendarioDas}`,
      numeroDocumento: `07.20.${anoCalendarioDas.slice(2)}301.${Math.floor(1000000 + Math.random() * 8999999)}-${Math.floor(1 + Math.random() * 8)}`,
      codigoBarras: `85890000000-7 ${valores.total.toFixed(2).replace('.', '')}01092610-4 20261020991-2 10492837182-9`,
      ...valores
    });
    if (mostrarToast) mostrarToast("Documento de Arrecadação do Simples Nacional (DAS) gerado!", "sucesso");
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* BARRA SUPERIOR ESTILO PORTAL PÚBLICO EDUCATIVO */}
      <div style={{ backgroundColor: '#071d41', color: 'white', padding: '14px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '4px solid #ffbe00' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#1351b4', padding: '8px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '20px', letterSpacing: '-0.5px', border: '1px solid #38bdf8' }}>
            gov<span style={{ color: '#ffbe00' }}>.simulador</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Simulador Académico de Portais Públicos & Legalização</div>
            <div style={{ fontSize: '11px', color: '#93c5fd' }}>Ambiente Didático Oficial do ERP • Reprodução Técnica da REDESIM, Portal do Empreendedor e RFB</div>
          </div>
        </div>

        {/* SELETOR DE MÓDULOS DO PORTAL */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setModuloAtivo('mei')}
            style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', backgroundColor: moduloAtivo === 'mei' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'mei' ? '#071d41' : 'white' }}
          >
            🏢 1. Abertura MEI (CCMEI)
          </button>
          <button 
            onClick={() => setModuloAtivo('pgmei')}
            style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', backgroundColor: moduloAtivo === 'pgmei' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'pgmei' ? '#071d41' : 'white' }}
          >
            📄 2. Emitir Guia DAS (PGMEI)
          </button>
          <button 
            onClick={() => setModuloAtivo('redesim')}
            style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', backgroundColor: moduloAtivo === 'redesim' ? '#ffbe00' : '#1351b4', color: moduloAtivo === 'redesim' ? '#071d41' : 'white' }}
          >
            ⚖️ 3. REDESIM / Junta Comercial (ME/EPP)
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO PORTAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

        {/* =========================================================
            MÓDULO 1: PORTAL DO EMPREENDEDOR - FORMALIZAÇÃO MEI
           ========================================================= */}
        {moduloAtivo === 'mei' && (
          <div>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Portal Empresas & Negócios • Formalização
                </span>
                <h2 style={{ margin: '8px 0 4px 0', color: '#071d41', fontSize: '22px' }}>Quero ser MEI - Inscrição de Microempreendedor Individual</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Preencha a ficha cadastral unificada conforme exigido pelo Portal do Empreendedor (Lei Complementar nº 123/2006).</p>
              </div>
              {ccmeiGerado && (
                <button onClick={() => setCcmeiGerado(null)} style={{ backgroundColor: '#1351b4', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  🔄 Nova Simulação MEI
                </button>
              )}
            </div>

            {!ccmeiGerado ? (
              <form onSubmit={handleConcluirMei}>
                {/* SECÇÃO 1: IDENTIFICAÇÃO DO EMPREENDEDOR */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    1. Dados de Identificação Civil (Integração Base CPF / Conta Gov.br Nível Prata ou Ouro)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CPF do Titular *</label>
                      <input type="text" required placeholder="000.000.000-00" value={meiDados.cpf} onChange={e => setMeiDados({...meiDados, cpf: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Nome Civil Completo *</label>
                      <input type="text" required placeholder="Ex: Andre Lopes da Silva" value={meiDados.nomeCompleto} onChange={e => setMeiDados({...meiDados, nomeCompleto: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Documento de Identidade (RG) *</label>
                      <input type="text" required placeholder="00.000.000-0" value={meiDados.rg} onChange={e => setMeiDados({...meiDados, rg: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Nome Fantasia do Negócio *</label>
                      <input type="text" required placeholder="Ex: AL Soluções Digitais" value={meiDados.nomeFantasia} onChange={e => setMeiDados({...meiDados, nomeFantasia: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Capital Social Inicial (R$) *</label>
                      <input type="text" required value={meiDados.capitalSocial} onChange={e => setMeiDados({...meiDados, capitalSocial: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* SECÇÃO 2: ESCOLHA DE OCUPAÇÕES (CNAE) */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    2. Atividades Econômicas (Anexo XI da Resolução CGSN nº 140/2018)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Ocupação Principal Permitida no MEI *</label>
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
                        style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', backgroundColor: 'white' }}
                      >
                        {ocupacoesMei.map((oc, i) => (
                          <option key={i} value={oc.nome}>{oc.nome} (CNAE {oc.cnae})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Enquadramento Tributário Automático (DAS)</label>
                      <input type="text" readOnly value={`Modalidade: ${meiDados.naturezaAtividade} (R$ ${calcularValoresDas(meiDados.naturezaAtividade).total.toFixed(2).replace('.', ',')} / mês)`} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', fontWeight: 'bold', color: '#0f172a', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* SECÇÃO 3: ENDEREÇO COMERCIAL */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1351b4', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                    3. Endereço Comercial e Forma de Atuação
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CEP *</label>
                      <input type="text" value={meiDados.cep} onChange={e => setMeiDados({...meiDados, cep: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Logradouro *</label>
                      <input type="text" value={meiDados.logradouro} onChange={e => setMeiDados({...meiDados, logradouro: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Bairro *</label>
                      <input type="text" value={meiDados.bairro} onChange={e => setMeiDados({...meiDados, bairro: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Município / UF *</label>
                      <input type="text" value={`${meiDados.municipio} - ${meiDados.uf}`} readOnly style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* SECÇÃO 4: TERMOS LEGAIS E DECLARAÇÕES */}
                <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#92400e' }}>
                    4. Declarações Obrigatórias (Termo de Ciência e Responsabilidade com Efeito de Dispensa de Alvará)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#451a03' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={meiDados.declaraDesimpedimento} onChange={e => setMeiDados({...meiDados, declaraDesimpedimento: e.target.checked})} style={{ marginTop: '3px' }} />
                      <span><strong>Declaração de Desimpedimento:</strong> Declaro, sob as penas da Lei, ser capaz, não estar impedido de exercer empresa e que não possuo outro registro de empresário ou participação societária em outra empresa.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={meiDados.declaraOpcaoSimples} onChange={e => setMeiDados({...meiDados, declaraOpcaoSimples: e.target.checked})} style={{ marginTop: '3px' }} />
                      <span><strong>Termo de Opção pelo SIMEI:</strong> Declaro que opto pelo Simples Nacional e pelo Sistema de Recolhimento em Valores Fixos Mensais dos Tributos abrangidos pelo Simples Nacional (SIMEI).</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={meiDados.declaraEnquadramento} onChange={e => setMeiDados({...meiDados, declaraEnquadramento: e.target.checked})} style={{ marginTop: '3px' }} />
                      <span><strong>Declaração de Enquadramento de ME:</strong> Declaro que o faturamento anual previsto não ultrapassa o limite legal de R$ 81.000,00 (ou R$ 251.600,00 para MEI Caminhoneiro).</span>
                    </label>
                  </div>
                </div>

                <button type="submit" style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }}>
                  ✅ Confirmar Inscrição e Emitir Certificado CCMEI + CNPJ
                </button>
              </form>
            ) : (
              /* VISUALIZAÇÃO DO CERTIFICADO CCMEI OFICIAL SIMULADO */
              <div style={{ border: '2px solid #0f172a', padding: '30px', borderRadius: '8px', backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>REPÚBLICA FEDERATIVA DO BRASIL • REDESIM</div>
                  <h2 style={{ margin: '5px 0', fontSize: '18px', color: '#0f172a' }}>CERTIFICADO DA CONDIÇÃO DE MICROEMPREENDEDOR INDIVIDUAL (CCMEI)</h2>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    DOCUMENTO COM EFEITO DE ALVARÁ DE LICENÇA E FUNCIONAMENTO PROVISÓRIO
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', marginBottom: '20px' }}>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>EMPRESÁRIO / NOME EMPRESARIAL</span>
                    <strong>{ccmeiGerado.cpf.slice(0, 8)} {ccmeiGerado.nomeCompleto.toUpperCase()}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CNPJ (INSCRIÇÃO NACIONAL)</span>
                    <strong style={{ color: '#1351b4', fontSize: '15px' }}>{ccmeiGerado.cnpj}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>NIRE (JUNTA COMERCIAL)</span>
                    <strong>{ccmeiGerado.nire}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CAPITAL SOCIAL E SITUAÇÃO</span>
                    <strong>R$ {ccmeiGerado.capitalSocial} • ATIVO DESDE {ccmeiGerado.dataAbertura}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>CNAE PRINCIPAL E OCUPAÇÃO</span>
                    <strong>{ccmeiGerado.cnaePrincipal}</strong>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>ENDEREÇO COMERCIAL REGISTRADO</span>
                    <strong>{ccmeiGerado.logradouro}, {ccmeiGerado.numero} - {ccmeiGerado.bairro}, {ccmeiGerado.municipio}/{ccmeiGerado.uf} - CEP: {ccmeiGerado.cep}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    🖨️ Imprimir Certificado CCMEI
                  </button>
                  <button onClick={() => setModuloAtivo('pgmei')} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Ir para Emissão de Guia DAS (PGMEI) →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            MÓDULO 2: PGMEI - EMISSÃO DE GUIA DAS MENSAL
           ========================================================= */}
        {moduloAtivo === 'pgmei' && (
          <div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={{ backgroundColor: '#166534', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>SIMPLES NACIONAL • SIMEI</span>
                <h2 style={{ margin: '6px 0 2px 0', color: '#14532d', fontSize: '20px' }}>PGMEI - Programa Gerador de DAS do Microempreendedor Individual</h2>
                <span style={{ fontSize: '12.5px', color: '#15803d' }}>Emita o Documento de Arrecadação com discriminação exata de INSS (5% ou 12%), ICMS (R$ 1,00) e ISS (R$ 5,00).</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Tipo de Atividade do MEI:</label>
                <select 
                  value={meiDados.naturezaAtividade} 
                  onChange={e => setMeiDados({...meiDados, naturezaAtividade: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #94a3b8', backgroundColor: 'white', fontWeight: 'bold' }}
                >
                  <option value="Comércio">Comércio ou Indústria (INSS + ICMS)</option>
                  <option value="Serviço">Prestação de Serviços (INSS + ISS)</option>
                  <option value="Comércio e Serviço">Comércio e Serviços (INSS + ICMS + ISS)</option>
                  <option value="Caminhoneiro">MEI Caminhoneiro (INSS 12% + ISS)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Período de Apuração (Competência):</label>
                <select 
                  value={mesSelecionadoDas} 
                  onChange={e => setMesSelecionadoDas(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #94a3b8', backgroundColor: 'white' }}
                >
                  <option value="08/2026">Agosto/2026 (Liquidado / Em Dia)</option>
                  <option value="09/2026">Setembro/2026 (A Vencer)</option>
                  <option value="10/2026">Outubro/2026 (A Vencer)</option>
                  <option value="11/2026">Novembro/2026 (A Vencer)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={handleGerarGuiaDas} style={{ width: '100%', padding: '11px', backgroundColor: '#15803d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  📄 Apurar e Emitir Guia DAS
                </button>
              </div>
            </div>

            {guiaDasGerada && (
              <div style={{ border: '2px solid #0f172a', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '16px', display: 'block' }}>Documento de Arrecadação do Simples Nacional (DAS)</strong>
                    <span style={{ fontSize: '12px', color: '#475569' }}>SIMEI - Microempreendedor Individual • Nº Doc: {guiaDasGerada.numeroDocumento}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Período de Apuração</span>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{guiaDasGerada.competencia}</strong>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Composição do Tributo (Ente Federado)</th>
                      <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Destinação</th>
                      <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Valor Principal (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}><strong>INSS - Contribuição Previdenciária</strong></td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>União / Previdência Social</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>R$ {guiaDasGerada.inss.toFixed(2).replace('.', ',')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}><strong>ICMS - Imposto sobre Circulação de Mercadorias</strong></td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Estado de São Paulo (SEFAZ/SP)</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>R$ {guiaDasGerada.icms.toFixed(2).replace('.', ',')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}><strong>ISS - Imposto Sobre Serviços</strong></td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Município de Vargem Grande Paulista</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>R$ {guiaDasGerada.iss.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                      <td colSpan="2" style={{ padding: '10px', border: '1px solid #cbd5e1' }}>VALOR TOTAL DO DOCUMENTO (Vencimento: {guiaDasGerada.vencimento})</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#15803d' }}>R$ {guiaDasGerada.total.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  </tfoot>
                </table>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px dashed #64748b', textAlign: 'center', fontFamily: 'monospace' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>LINHA DIGITÁVEL / PIX COPIA E COLA SIMULADO</div>
                  <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{guiaDasGerada.codigoBarras}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            MÓDULO 3: REDESIM / JUNTA COMERCIAL - ABERTURA DE ME / EPP
           ========================================================= */}
        {moduloAtivo === 'redesim' && (
          <div>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                REDESIM • JUCESP / VRER • COLETOR NACIONAL RFB
              </span>
              <h2 style={{ margin: '8px 0 4px 0', color: '#071d41', fontSize: '22px' }}>Abertura de Empresa (ME / EPP) - Fluxo Completo Junta Comercial</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Execute as 3 etapas obrigatórias do Paralegal: 1. Análise de Viabilidade Municipal e Nome • 2. DBE (Documento Básico de Entrada) • 3. Registro de Contrato Social e Quadro Societário (QSA).</p>
            </div>

            {/* BARRA DE PROGRESSO DAS 3 ETAPAS REDESIM */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <div 
                onClick={() => setRedesimFase('viabilidade')}
                style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', border: redesimFase === 'viabilidade' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'viabilidade' ? '#eff6ff' : '#f8fafc' }}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1351b4' }}>ETAPA 1 • PREFEITURA & JUNTA</div>
                <strong style={{ fontSize: '14px' }}>1. Consulta Prévia de Viabilidade</strong>
                <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>Protocolo: {redesimDados.protocoloViabilidade}</div>
              </div>

              <div 
                onClick={() => setRedesimFase('dbe')}
                style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', border: redesimFase === 'dbe' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'dbe' ? '#eff6ff' : '#f8fafc' }}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1351b4' }}>ETAPA 2 • RECEITA FEDERAL</div>
                <strong style={{ fontSize: '14px' }}>2. Coletor Nacional (DBE / QSA)</strong>
                <div style={{ fontSize: '11px', color: '#ca8a04', marginTop: '4px' }}>Recibo: {redesimDados.protocoloDBE}</div>
              </div>

              <div 
                onClick={() => setRedesimFase('junta')}
                style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', border: redesimFase === 'junta' ? '2px solid #1351b4' : '1px solid #cbd5e1', backgroundColor: redesimFase === 'junta' ? '#eff6ff' : '#f8fafc' }}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1351b4' }}>ETAPA 3 • JUNTA COMERCIAL</div>
                <strong style={{ fontSize: '14px' }}>3. Contrato Social, NIRE e CNPJ</strong>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>Deferimento Automático</div>
              </div>
            </div>

            {/* CONTEÚDO DA ETAPA 1: VIABILIDADE */}
            {redesimFase === 'viabilidade' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '22px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#071d41', fontSize: '16px' }}>Etapa 1: Pesquisa de Colidência de Nome Empresarial e Zoneamento Urbano (IPTU)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Natureza Jurídica (CONCLA/IBGE):</label>
                    <select value={redesimDados.naturezaJuridica} onChange={e => setRedesimDados({...redesimDados, naturezaJuridica: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', backgroundColor: 'white' }}>
                      <option value="206-2 - Sociedade Empresária Limitada (LTDA)">206-2 - Sociedade Empresária Limitada (LTDA)</option>
                      <option value="206-2 - Sociedade Limitada Unipessoal (SLU)">206-2 - Sociedade Limitada Unipessoal (SLU)</option>
                      <option value="213-5 - Empresário Individual (EI)">213-5 - Empresário Individual (EI)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Enquadramento de Porte (LC 123/2006):</label>
                    <select value={redesimDados.porteEmpresa} onChange={e => setRedesimDados({...redesimDados, porteEmpresa: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', backgroundColor: 'white' }}>
                      <option value="ME - Microempresa (Faturamento até R$ 360.000,00)">ME - Microempresa (Até R$ 360.000,00/ano)</option>
                      <option value="EPP - Empresa de Pequeno Porte (De R$ 360 mil a R$ 4,8 milhões)">EPP - Empresa de Pequeno Porte (Até R$ 4.800.000,00/ano)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Inscrição Imobiliária Municipal (IPTU):</label>
                    <input type="text" value={redesimDados.iptuInscricao} onChange={e => setRedesimDados({...redesimDados, iptuInscricao: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>1ª Opção de Razão Social:</label>
                    <input type="text" value={redesimDados.razaoSocialOpcao1} onChange={e => setRedesimDados({...redesimDados, razaoSocialOpcao1: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CNAE Principal:</label>
                    <input type="text" value={`${redesimDados.cnaeCodigo} - ${redesimDados.cnaeDescricao}`} onChange={e => setRedesimDados({...redesimDados, cnaeDescricao: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Área Ocupada do Estabelecimento (m²):</label>
                    <input type="number" value={redesimDados.areaImovel} onChange={e => setRedesimDados({...redesimDados, areaImovel: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setRedesimDados({...redesimDados, statusViabilidade: 'Deferida'});
                    setRedesimFase('dbe');
                    if (mostrarToast) mostrarToast("Viabilidade aprovada pela Prefeitura e Junta Comercial! Avance para o DBE.", "sucesso");
                  }}
                  style={{ backgroundColor: '#1351b4', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                   Transmitir Pedido de Viabilidade e Avançar para o DBE →
                </button>
              </div>
            )}

            {/* CONTEÚDO DA ETAPA 2: DBE E QUADRO SOCIETÁRIO (QSA) */}
            {redesimFase === 'dbe' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '22px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#071d41', fontSize: '16px' }}>Etapa 2: Coletor Nacional RFB - Documento Básico de Entrada (DBE) e QSA</h3>
                <p style={{ fontSize: '12.5px', color: '#475569', marginBottom: '15px' }}>
                  Regra Crítica da Receita Federal: A soma das quotas de todos os sócios no QSA deve fechar <strong>exatamente 100%</strong> do Capital Social informado.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Capital Social Total da Sociedade (R$):</label>
                    <input type="number" value={redesimDados.capitalTotal} onChange={e => setRedesimDados({...redesimDados, capitalTotal: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', fontWeight: 'bold', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Sócio 1 (Administrador - Qualificação 49):</label>
                    <input type="text" value={redesimDados.socio1Nome} onChange={e => setRedesimDados({...redesimDados, socio1Nome: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Capital Sócio 1 (R$):</label>
                    <input type="number" value={redesimDados.socio1Quotas} onChange={e => setRedesimDados({...redesimDados, socio1Quotas: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Sócio 2 (Quotista - Qualificação 22):</label>
                    <input type="text" value={redesimDados.socio2Nome} onChange={e => setRedesimDados({...redesimDados, socio2Nome: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Capital Sócio 2 (R$):</label>
                    <input type="number" value={redesimDados.socio2Quotas} onChange={e => setRedesimDados({...redesimDados, socio2Quotas: e.target.value})} style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* VALIDAÇÃO MATEMÁTICA DO QSA */}
                <div style={{ padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: (redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal ? '#dcfce7' : '#fee2e2', color: (redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal ? '#166534' : '#991b1b', fontWeight: 'bold', fontSize: '13px' }}>
                  {(redesimDados.socio1Quotas + redesimDados.socio2Quotas) === redesimDados.capitalTotal 
                    ? `✓ QSA Validado pela RFB: Soma das Quotas (R$ ${(redesimDados.socio1Quotas + redesimDados.socio2Quotas).toLocaleString('pt-BR')}) equivale a 100% do Capital Social.`
                    : `⚠️ Erro de Crítica DBE: A soma das quotas dos sócios (R$ ${(redesimDados.socio1Quotas + redesimDados.socio2Quotas).toLocaleString('pt-BR')}) diverge do Capital Social Total (R$ ${redesimDados.capitalTotal.toLocaleString('pt-BR')}).`
                  }
                </div>

                <button 
                  onClick={() => {
                    if ((redesimDados.socio1Quotas + redesimDados.socio2Quotas) !== redesimDados.capitalTotal) {
                      if (mostrarToast) mostrarToast("Corrija a distribuição de quotas do QSA antes de transmitir o DBE!", "erro");
                      return;
                    }
                    setRedesimFase('junta');
                    if (mostrarToast) mostrarToast("DBE transmitido e deferido pela Receita Federal! Prossiga para o Contrato Social.", "sucesso");
                  }}
                  style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✅ Transmitir DBE para a Receita Federal e Gerar Contrato Social →
                </button>
              </div>
            )}

            {/* CONTEÚDO DA ETAPA 3: JUNTA COMERCIAL E CONTRATO SOCIAL */}
            {redesimFase === 'junta' && (
              <div style={{ border: '2px solid #0f172a', padding: '25px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1351b4' }}>JUNTA COMERCIAL DO ESTADO DE SÃO PAULO (JUCESP) • NIRE: {redesimDados.nire}</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>INSTRUMENTO PARTICULAR DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA</h3>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                    CNPJ DEFERIDO: {redesimDados.cnpjGerado}
                  </span>
                </div>

                <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#1e293b', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <p><strong>Pelo presente instrumento particular:</strong></p>
                  <p>1. <strong>{redesimDados.socio1Nome.toUpperCase()}</strong>, inscrito(a) no CPF sob nº {redesimDados.socio1Cpf}; e<br/>
                     2. <strong>{redesimDados.socio2Nome.toUpperCase()}</strong>, inscrito(a) no CPF sob nº {redesimDados.socio2Cpf};</p>
                  <p>Resolvem constituir uma Sociedade Empresária Limitada, mediante as seguintes cláusulas:</p>
                  <p><strong>CLÁUSULA PRIMEIRA - DA DENOMINAÇÃO E SEDE:</strong> A sociedade girará sob o nome empresarial de <strong>{redesimDados.razaoSocialOpcao1}</strong>, com sede em {meiDados.logradouro}, {meiDados.numero}, {meiDados.bairro}, {meiDados.municipio}/{meiDados.uf}, Inscrição IPTU nº {redesimDados.iptuInscricao}.</p>
                  <p><strong>CLÁUSULA SEGUNDA - DO OBJETO SOCIAL:</strong> A sociedade terá por objeto o exercício de: <em>{redesimDados.cnaeDescricao} (CNAE {redesimDados.cnaeCodigo})</em>.</p>
                  <p><strong>CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL:</strong> O capital social é de <strong>R$ {redesimDados.capitalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>, dividido em {redesimDados.capitalTotal} quotas de R$ 1,00 cada, totalmente integralizadas em moeda corrente nacional, assim distribuídas:<br/>
                  • {redesimDados.socio1Nome}: {redesimDados.socio1Quotas} quotas (R$ {redesimDados.socio1Quotas.toLocaleString('pt-BR', {minimumFractionDigits: 2})});<br/>
                  • {redesimDados.socio2Nome}: {redesimDados.socio2Quotas} quotas (R$ {redesimDados.socio2Quotas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}).</p>
                  <p><strong>CLÁUSULA QUARTA - DA ADMINISTRAÇÃO:</strong> A administração da sociedade caberá isoladamente ao sócio <strong>{redesimDados.socio1Nome}</strong>, com os poderes e atribuições de representação ativa e passiva, judicial e extrajudicial.</p>
                </div>

                <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  🖨️ Imprimir Contrato Social Arquivado e Cartão CNPJ
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}