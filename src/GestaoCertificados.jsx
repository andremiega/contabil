import React, { useState } from 'react';

export default function GestaoCertificados() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Aba selecionada: 'certificados', 'procuracoes', 'novo'
  const [secaoAtiva, setSecaoAtiva] = useState('certificados');

  // Filtro de status: 'todos', 'expirando', 'vencidos'
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Lista de Certificados Digitais
  const [certificados, setCertificados] = useState([
    {
      id: 1,
      empresa: 'Lopes & Silva Engenharia e Soluções Contábeis Ltda',
      cnpj: '12.345.678/0001-90',
      tipo: 'e-CNPJ A1 (Arquivo PFX)',
      autoridade: 'Certisign ICP-Brasil',
      validade: '2026-11-15',
      diasRestantes: 22,
      status: 'alerta', // 'valido', 'alerta', 'expirado'
      custoAquisicao: 249.00
    },
    {
      id: 2,
      empresa: 'Indústria e Comércio Bandeirantes S/A',
      cnpj: '44.555.666/0001-22',
      tipo: 'e-CNPJ A3 (Token Criptográfico 3 anos)',
      autoridade: 'Valid Certificadora',
      validade: '2028-06-20',
      diasRestantes: 604,
      status: 'valido',
      custoAquisicao: 480.00
    },
    {
      id: 3,
      empresa: 'Comércio de Alimentos São Paulo Ltda',
      cnpj: '98.765.432/0001-11',
      tipo: 'NF-e A1 (Emissão em Nuvem)',
      autoridade: 'Serasa Experian',
      validade: '2026-10-10',
      diasRestantes: -14,
      status: 'expirado',
      custoAquisicao: 220.00
    },
    {
      id: 4,
      empresa: 'Carlos Eduardo Silveira (Sócio)',
      cnpj: '321.654.987-00',
      tipo: 'e-CPF A1 (Assinatura GOV/JUCESP)',
      autoridade: 'Soluti',
      validade: '2027-04-12',
      diasRestantes: 169,
      status: 'valido',
      custoAquisicao: 155.00
    }
  ]);

  // Lista de Procurações Eletrônicas Outorgadas à Contabilidade
  const [procuracoes, setProcuracoes] = useState([
    {
      id: 1,
      outorgante: 'Lopes & Silva Engenharia e Soluções Contábeis Ltda',
      orgao: 'Receita Federal / PGFN (e-CAC)',
      finalidade: 'DCTFWeb, EFD-Reinf, Parcelamentos, IRPJ/CSLL',
      validade: '2029-05-10',
      status: 'vigente'
    },
    {
      id: 2,
      outorgante: 'Indústria e Comércio Bandeirantes S/A',
      orgao: 'Caixa Econômica (Conectividade Social / FGTS Digital)',
      finalidade: 'Envio de SEFIP, Guia FGTS Digital e Extrato Rescisório',
      validade: '2026-11-05',
      status: 'alerta'
    },
    {
      id: 3,
      outorgante: 'Comércio de Alimentos São Paulo Ltda',
      orgao: 'Secretaria da Fazenda Estadual (Posto Fiscal Eletrônico)',
      finalidade: 'GIA, SPED Fiscal ICMS/IPI e AIDF',
      validade: '2026-09-30',
      status: 'vencida'
    }
  ]);

  // Formulário para Novo Certificado
  const [formEmpresa, setFormEmpresa] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formTipo, setFormTipo] = useState('e-CNPJ A1 (Arquivo PFX)');
  const [formAutoridade, setFormAutoridade] = useState('Certisign ICP-Brasil');
  const [formValidade, setFormValidade] = useState('2027-10-24');
  const [formCustoStr, setFormCustoStr] = useState('240.00');

  // Adicionar novo certificado
  const handleAddCertificado = (e) => {
    e.preventDefault();
    if (!formEmpresa || !formCnpj) {
      return alert('Preencha a razão social e o CNPJ/CPF.');
    }

    const hoje = new Date('2026-10-24');
    const dataFim = new Date(formValidade);
    const diffDias = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
    let statusCalc = 'valido';
    if (diffDias < 0) statusCalc = 'expirado';
    else if (diffDias <= 30) statusCalc = 'alerta';

    const novo = {
      id: Date.now(),
      empresa: formEmpresa,
      cnpj: formCnpj,
      tipo: formTipo,
      autoridade: formAutoridade,
      validade: formValidade,
      diasRestantes: diffDias,
      status: statusCalc,
      custoAquisicao: parseFloat(formCustoStr) || 0
    };

    setCertificados([novo, ...certificados]);
    setFormEmpresa('');
    setFormCnpj('');
    setSecaoAtiva('certificados');
  };

  // Renovar certificado
  const renovarCertificado = (id) => {
    setCertificados(certificados.map(c => {
      if (c.id === id) {
        return {
          ...c,
          validade: '2027-10-24',
          diasRestantes: 365,
          status: 'valido'
        };
      }
      return c;
    }));
  };

  // Renovar procuração
  const renovarProcuracao = (id) => {
    setProcuracoes(procuracoes.map(p => {
      if (p.id === id) {
        return {
          ...p,
          validade: '2029-10-24',
          status: 'vigente'
        };
      }
      return p;
    }));
  };

  // Filtragem
  const certificadosFiltrados = certificados.filter(c => {
    if (filtroStatus === 'expirando') return c.status === 'alerta';
    if (filtroStatus === 'vencidos') return c.status === 'expirado';
    return true;
  });

  const totalAtivos = certificados.filter(c => c.status !== 'expirado').length;
  const totalAlerta = certificados.filter(c => c.status === 'alerta').length;
  const totalExpirados = certificados.filter(c => c.status === 'expirado').length;

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🔐</span> Central de Certificados Digitais & Procurações e-CAC
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Monitoramento de expiração de e-CNPJ/e-CPF (ICP-Brasil), poderes delegados e apropriação contábil.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => setSecaoAtiva('certificados')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'certificados' ? '#0f172a' : 'transparent', 
              color: secaoAtiva === 'certificados' ? 'white' : '#64748b'
            }}
          >
            🔑 Certificados ({certificados.length})
          </button>
          <button 
            onClick={() => setSecaoAtiva('procuracoes')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'procuracoes' ? '#2563eb' : 'transparent', 
              color: secaoAtiva === 'procuracoes' ? 'white' : '#64748b'
            }}
          >
            📋 Procurações e-CAC ({procuracoes.length})
          </button>
          <button 
            onClick={() => setSecaoAtiva('novo')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: secaoAtiva === 'novo' ? '#16a34a' : 'transparent', 
              color: secaoAtiva === 'novo' ? 'white' : '#64748b'
            }}
          >
            ➕ Cadastrar Novo
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE GESTÃO E VIGÊNCIA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Certificados Válidos</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {totalAtivos}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Habilitados para emissão e transmissão</span>
        </div>

        <div style={{ backgroundColor: '#fffbeb', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: '#b45309', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Vencendo em até 30 Dias</span>
          <strong style={{ display: 'block', color: '#b45309', fontSize: '24px', marginTop: '4px' }}>
            {totalAlerta}
          </strong>
          <span style={{ fontSize: '11px', color: '#b45309' }}>Ação de renovação requerida</span>
        </div>

        <div style={{ backgroundColor: totalExpirados > 0 ? '#fff5f5' : '#f8fafc', padding: '18px', borderRadius: '12px', border: `1px solid ${totalExpirados > 0 ? '#fecaca' : '#e2e8f0'}`, borderLeft: `4px solid ${totalExpirados > 0 ? '#ef4444' : '#64748b'}` }}>
          <span style={{ color: totalExpirados > 0 ? '#991b1b' : '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Certificados Expirados</span>
          <strong style={{ display: 'block', color: totalExpirados > 0 ? '#dc2626' : '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {totalExpirados}
          </strong>
          <span style={{ fontSize: '11px', color: totalExpirados > 0 ? '#991b1b' : '#64748b' }}>
            {totalExpirados > 0 ? '🚨 NF-e e DCTFWeb paralisadas' : 'Nenhuma empresa bloqueada'}
          </span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Procurações e-CAC Ativas</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {procuracoes.filter(p => p.status !== 'vencida').length} / {procuracoes.length}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Acessos contábeis outorgados</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ABA: LISTAGEM DE CERTIFICADOS                          */}
      {/* ========================================================= */}
      {secaoAtiva === 'certificados' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          
          {/* Barra de Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button 
              onClick={() => setFiltroStatus('todos')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: filtroStatus === 'todos' ? '#0f172a' : 'white', color: filtroStatus === 'todos' ? 'white' : '#475569' }}
            >
              Exibir Todos ({certificados.length})
            </button>
            <button 
              onClick={() => setFiltroStatus('expirando')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: filtroStatus === 'expirando' ? '#f59e0b' : 'white', color: filtroStatus === 'expirando' ? 'white' : '#475569' }}
            >
              Próximos do Vencimento ({totalAlerta})
            </button>
            <button 
              onClick={() => setFiltroStatus('vencidos')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: filtroStatus === 'vencidos' ? '#dc2626' : 'white', color: filtroStatus === 'vencidos' ? 'white' : '#475569' }}
            >
              Vencidos / Bloqueados ({totalExpirados})
            </button>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Empresa / Titular</th>
                  <th style={{ padding: '12px 14px' }}>Modelo & Autoridade</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Vencimento</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Situação</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {certificadosFiltrados.map(cert => (
                  <tr key={cert.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: cert.status === 'expirado' ? '#fff5f5' : cert.status === 'alerta' ? '#fffdf7' : 'white' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{cert.empresa}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>CNPJ/CPF: {cert.cnpj}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block' }}>{cert.tipo}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{cert.autoridade}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block' }}>{cert.validade}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        color: cert.diasRestantes < 0 ? '#dc2626' : cert.diasRestantes <= 30 ? '#d97706' : '#16a34a' 
                      }}>
                        {cert.diasRestantes < 0 ? `Vencido há ${Math.abs(cert.diasRestantes)} dias` : `${cert.diasRestantes} dias restantes`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        backgroundColor: cert.status === 'valido' ? '#f0fdf4' : cert.status === 'alerta' ? '#fffbeb' : '#fef2f2',
                        color: cert.status === 'valido' ? '#166534' : cert.status === 'alerta' ? '#b45309' : '#991b1b',
                        border: `1px solid ${cert.status === 'valido' ? '#86efac' : cert.status === 'alerta' ? '#fde68a' : '#fecaca'}`
                      }}>
                        {cert.status === 'valido' ? '✓ VÁLIDO' : cert.status === 'alerta' ? '⚠️ RENOVAÇÃO' : '🚨 EXPIRADO'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => renovarCertificado(cert.id)}
                          style={{ padding: '4px 10px', backgroundColor: cert.status === 'valido' ? '#f1f5f9' : '#0f172a', color: cert.status === 'valido' ? '#475569' : 'white', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          {cert.status === 'valido' ? 'Atualizar' : 'Renovar Certificado'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: PROCURAÇÕES ELETRÔNICAS (E-CAC)                   */}
      {/* ========================================================= */}
      {secaoAtiva === 'procuracoes' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <tr>
                  <th style={{ padding: '12px 14px' }}>Empresa Outorgante</th>
                  <th style={{ padding: '12px 14px' }}>Portal Governamental</th>
                  <th style={{ padding: '12px 14px' }}>Serviços Delegados</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Vencimento</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Situação</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {procuracoes.map(proc => (
                  <tr key={proc.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: proc.status === 'vencida' ? '#fff5f5' : 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a' }}>{proc.outorgante}</td>
                    <td style={{ padding: '12px 14px', color: '#2563eb', fontWeight: 'bold' }}>{proc.orgao}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{proc.finalidade}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold' }}>{proc.validade}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        backgroundColor: proc.status === 'vigente' ? '#f0fdf4' : proc.status === 'alerta' ? '#fffbeb' : '#fef2f2',
                        color: proc.status === 'vigente' ? '#166534' : proc.status === 'alerta' ? '#b45309' : '#991b1b',
                        border: `1px solid ${proc.status === 'vigente' ? '#86efac' : proc.status === 'alerta' ? '#fde68a' : '#fecaca'}`
                      }}>
                        {proc.status === 'vigente' ? 'ATIVA' : proc.status === 'alerta' ? 'VENCENDO' : 'EXPIRADA'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button 
                        onClick={() => renovarProcuracao(proc.id)}
                        style={{ padding: '4px 10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {proc.status === 'vencida' ? 'Solicitar Nova Outorga' : 'Renovar no e-CAC'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ABA: CADASTRAR NOVO CERTIFICADO                       */}
      {/* ========================================================= */}
      {secaoAtiva === 'novo' && (
        <form onSubmit={handleAddCertificado} style={{ animation: 'fadeIn 0.3s', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Cadastrar Novo Certificado Digital (ICP-Brasil)
          </h3>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Razão Social / Nome Completo:
              <input 
                type="text" 
                value={formEmpresa} 
                onChange={e => setFormEmpresa(e.target.value)} 
                placeholder="Ex: Comercial Vale Verde Ltda"
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              CNPJ ou CPF:
              <input 
                type="text" 
                value={formCnpj} 
                onChange={e => setFormCnpj(e.target.value)} 
                placeholder="00.000.000/0001-00"
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Tipo de Certificado:
              <select 
                value={formTipo} 
                onChange={e => setFormTipo(e.target.value)} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
              >
                <option value="e-CNPJ A1 (Arquivo PFX)">e-CNPJ A1 (Arquivo PFX - 1 Ano)</option>
                <option value="e-CNPJ A3 (Token Criptográfico)">e-CNPJ A3 (Token Criptográfico - 3 Anos)</option>
                <option value="e-CPF A1 (Arquivo PFX)">e-CPF A1 (Arquivo PFX - 1 Ano)</option>
                <option value="e-CPF A3 (Cartão Inteligente)">e-CPF A3 (Cartão Inteligente - 3 Anos)</option>
                <option value="NF-e A1 (Emissão em Nuvem)">NF-e A1 (Exclusivo Emissão Fiscal)</option>
              </select>
            </label>

            <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Autoridade Certificadora:
              <select 
                value={formAutoridade} 
                onChange={e => setFormAutoridade(e.target.value)} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
              >
                <option value="Certisign ICP-Brasil">Certisign ICP-Brasil</option>
                <option value="Serasa Experian">Serasa Experian</option>
                <option value="Valid Certificadora">Valid Certificadora</option>
                <option value="Soluti Digital">Soluti Digital</option>
              </select>
            </label>

            <label style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Data de Vencimento:
              <input 
                type="date" 
                value={formValidade} 
                onChange={e => setFormValidade(e.target.value)} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Custo de Aquisição (R$):
              <input 
                type="text" 
                value={formCustoStr} 
                onChange={e => setFormCustoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button 
              type="submit" 
              style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Salvar Certificado na Base
            </button>
          </div>
        </form>
      )}

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ marginTop: '25px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Contabilização da Aquisição de Certificados Digitais
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
          
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontWeight: 'bold', color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>1. Modelo A1 (Validade 12 meses - Competência):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Assinaturas e Certificados a Apropriar (Ativo Circ.) .. R$ 240,00</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Banco Conta Movimento (Ativo Circulante) ........... R$ 240,00</div>
            <span style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
              * Mensalmente apropria-se 1/12 (R$ 20,00): D: Despesa c/ Certificados Digitais (DRE) e C: Assinaturas a Apropriar (Ativo).
            </span>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #0f172a' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'block', marginBottom: '4px' }}>2. Modelo A3 com Token/Mídia (Validade 36 meses):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesas Antecipadas - Circulante (Ativo) .......... R$ 160,00 (1º ano)</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesas Antecipadas - Não Circulante (RLP) ........ R$ 320,00 (2º e 3º ano)</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Caixa / Banco Conta Movimento ...................... R$ 480,00</div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}