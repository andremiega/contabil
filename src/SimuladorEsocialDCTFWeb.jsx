import React, { useState } from 'react';

export default function SimuladorEsocialDCTFWeb({ mostrarToast }) {
  const [abaEsocial, setAbaEsocial] = useState('admissao');

  // 1. Trabalhadores Cadastrados (S-2200)
  const [trabalhadores, setTrabalhadores] = useState([
    { id: 1, cpf: '412.889.308-12', nome: 'Andre Lopes da Silva', cargo: 'Analista Contábil Pleno', salario: 4500.00, dataAdmissao: '2025-01-10', status: 'Ativo (S-2200 Transmitido)' }
  ]);
  const [novoTrab, setNovoTrab] = useState({ cpf: '', nome: '', cargo: '', salario: '', dataAdmissao: '2026-01-02' });

  // 2. Afastamentos Temporários (S-2230)
  const [afastamentos, setAfastamentos] = useState([
    { id: 1, cpf: '412.889.308-12', motivo: '03 - Acidente ou doença relacionada ao trabalho', dataInicio: '2026-03-01', status: 'Transmitido (S-2230)' }
  ]);
  const [novoAfast, setNovoAfast] = useState({ cpf: '412.889.308-12', motivo: '01 - Doença (geral)', dataInicio: '' });

  // 3. Desligamentos / Rescisões (S-2299)
  const [desligamentos, setDesligamentos] = useState([]);
  const [novoDeslig, setNovoDeslig] = useState({ cpf: '', motivoDesligamento: '02 - Rescisão sem justa causa pelo empregador', dataDesligamento: '' });

  // 4. SST - ASO / Exames (S-2220)
  const [examesSst, setExamesSst] = useState([
    { id: 1, cpf: '412.889.308-12', tipoExame: '0 - Exame Admissional', resultado: 'Apto', medico: 'Dr. Roberto Souza (CRM 54321-SP)', data: '2025-01-08' }
  ]);
  const [novoAso, setNovoAso] = useState({ cpf: '412.889.308-12', tipoExame: '2 - Exame Periódico', resultado: 'Apto', medico: 'Dra. Carla Mendes (CRM 88912-SP)' });

  // Folha e Encargos (S-1200 / DCTFWeb)
  const [competenciaFolha, setCompetenciaFolha] = useState('02/2026');
  const [folhaProcessada, setFolhaProcessada] = useState(false);

  const trabalhadoresAtivos = trabalhadores.filter(t => !desligamentos.some(d => d.cpf === t.cpf));
  const totalSalarios = trabalhadoresAtivos.reduce((acc, t) => acc + Number(t.salario || 0), 0);
  const inssPatronal = totalSalarios * 0.20;
  const ratFap = totalSalarios * 0.02;
  const outrasEntidades = totalSalarios * 0.058;
  const totalInssRecolher = inssPatronal + ratFap + outrasEntidades;
  const totalFgts = totalSalarios * 0.08;

  const handleCadastrarTrabalhador = (e) => {
    e.preventDefault();
    if (!novoTrab.cpf || !novoTrab.nome || !novoTrab.salario) return;
    setTrabalhadores([...trabalhadores, { id: Date.now(), ...novoTrab, salario: Number(novoTrab.salario), status: 'Ativo (S-2200 Transmitido)' }]);
    setNovoTrab({ cpf: '', nome: '', cargo: '', salario: '', dataAdmissao: '2026-01-02' });
    if (typeof mostrarToast === 'function') mostrarToast("Evento S-2200 (Admissão) transmitido com sucesso ao eSocial!", "sucesso");
  };

  const handleCadastrarAfastamento = (e) => {
    e.preventDefault();
    setAfastamentos([...afastamentos, { id: Date.now(), ...novoAfast, status: 'Transmitido (S-2230)' }]);
    if (typeof mostrarToast === 'function') mostrarToast("Evento S-2230 (Afastamento Temporário) registado no eSocial!", "sucesso");
  };

  const handleDesligar = (e) => {
    e.preventDefault();
    if (!novoDeslig.cpf || !novoDeslig.dataDesligamento) return;
    setDesligamentos([...desligamentos, { id: Date.now(), ...novoDeslig }]);
    if (typeof mostrarToast === 'function') mostrarToast("Evento S-2299 (Desligamento) transmitido. Prazo de 10 dias para pagamento das verbas.", "sucesso");
  };

  const handleCadastrarAso = (e) => {
    e.preventDefault();
    setExamesSst([...examesSst, { id: Date.now(), ...novoAso, data: new Date().toISOString().split('T')[0] }]);
    if (typeof mostrarToast === 'function') mostrarToast("Evento S-2220 (Monitoramento da Saúde - ASO) transmitido!", "sucesso");
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO INSTITUCIONAL ESOCIAL */}
      <div style={{ backgroundColor: '#1351b4', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #ffbe00', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ backgroundColor: '#ffbe00', color: '#071d41', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '17px', flexShrink: 0 }}>
            🏛️ eSocial
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word' }}>Escrituração Digital Trabalhista</div>
            <div style={{ fontSize: '11.5px', color: '#93c5fd', wordBreak: 'break-word' }}>Vínculos, Afastamentos, SST (ASO), Rescisões e DCTFWeb</div>
          </div>
        </div>

        {/* SELETOR DE EVENTOS DO ESOCIAL */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          {[
            { id: 'admissao', label: '👤 S-2200 (Admissão)' },
            { id: 'afastamento', label: '🏥 S-2230 (Afastamento)' },
            { id: 'sst', label: '🩺 S-2220 (SST)' },
            { id: 'desligamento', label: '📄 S-2299 (Rescisão)' },
            { id: 'folha', label: '📊 S-1200 (Folha)' },
            { id: 'dctfweb', label: '🧾 DCTFWeb' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaEsocial(tab.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: abaEsocial === tab.id ? '#ffbe00' : '#1e40af',
                color: abaEsocial === tab.id ? '#071d41' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '11.5px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                wordBreak: 'break-word'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ABA 1: S-2200 ADMISSÃO */}
        {abaEsocial === 'admissao' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Evento S-2200: Cadastramento Inicial e Admissão de Trabalhador
            </h3>
            
            <form onSubmit={handleCadastrarTrabalhador} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>CPF do Trabalhador *</label>
                <input type="text" placeholder="000.000.000-00" required value={novoTrab.cpf} onChange={e => setNovoTrab({...novoTrab, cpf: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nome Completo *</label>
                <input type="text" placeholder="Nome civil" required value={novoTrab.nome} onChange={e => setNovoTrab({...novoTrab, nome: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Cargo *</label>
                <input type="text" placeholder="Ex: Analista Fiscal" required value={novoTrab.cargo} onChange={e => setNovoTrab({...novoTrab, cargo: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Salário Base (R$) *</label>
                <input type="number" step="0.01" placeholder="4000.00" required value={novoTrab.salario} onChange={e => setNovoTrab({...novoTrab, salario: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1', boxSizing: 'border-box' }}>
                <button type="submit" style={{ width: '100%', maxWidth: '280px', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                  📤 Transmitir Evento S-2200
                </button>
              </div>
            </form>

            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Trabalhador</th>
                    <th style={{ padding: '10px' }}>Cargo</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Salário Base</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {trabalhadores.map(t => {
                    const desligado = desligamentos.some(d => d.cpf === t.cpf);
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: desligado ? '#fef2f2' : 'white' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}><strong style={{ wordBreak: 'break-word' }}>{t.nome}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{t.cpf}</span></td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{t.cargo}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ {formatMoeda(t.salario)}</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{ backgroundColor: desligado ? '#fee2e2' : '#dcfce7', color: desligado ? '#991b1b' : '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {desligado ? 'Desligado (S-2299)' : t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: S-2230 AFASTAMENTO */}
        {abaEsocial === 'afastamento' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Evento S-2230: Afastamento Temporário
            </h3>
            <form onSubmit={handleCadastrarAfastamento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Trabalhador:</label>
                <select value={novoAfast.cpf} onChange={e => setNovoAfast({...novoAfast, cpf: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  {trabalhadores.map(t => <option key={t.id} value={t.cpf}>{t.nome} ({t.cpf})</option>)}
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Motivo do Afastamento:</label>
                <select value={novoAfast.motivo} onChange={e => setNovoAfast({...novoAfast, motivo: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="01 - Doença (geral) até 15 dias">01 - Doença até 15 dias</option>
                  <option value="03 - Acidente de trabalho">03 - Acidente de trabalho</option>
                  <option value="15 - Licença-maternidade">15 - Licença-maternidade</option>
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Data de Início:</label>
                <input type="date" required value={novoAfast.dataInicio} onChange={e => setNovoAfast({...novoAfast, dataInicio: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                  Transmitir S-2230
                </button>
              </div>
            </form>

            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Trabalhador</th>
                    <th style={{ padding: '10px' }}>Motivo</th>
                    <th style={{ padding: '10px' }}>Início</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {afastamentos.map(a => {
                    const trab = trabalhadores.find(t => t.cpf === a.cpf);
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}><strong>{trab?.nome || a.cpf}</strong></td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{a.motivo}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{a.dataInicio}</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{a.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: S-2220 SST / ASO */}
        {abaEsocial === 'sst' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Evento S-2220: Monitoramento da Saúde (ASO)
            </h3>
            <form onSubmit={handleCadastrarAso} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Trabalhador:</label>
                <select value={novoAso.cpf} onChange={e => setNovoAso({...novoAso, cpf: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  {trabalhadores.map(t => <option key={t.id} value={t.cpf}>{t.nome}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Tipo de Exame:</label>
                <select value={novoAso.tipoExame} onChange={e => setNovoAso({...novoAso, tipoExame: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="0 - Exame Admissional">0 - Admissional</option>
                  <option value="2 - Exame Periódico">2 - Periódico</option>
                  <option value="9 - Exame Demissional">9 - Demissional</option>
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Médico / CRM:</label>
                <input type="text" required value={novoAso.medico} onChange={e => setNovoAso({...novoAso, medico: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                  Transmitir S-2220 (ASO)
                </button>
              </div>
            </form>

            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Trabalhador</th>
                    <th style={{ padding: '10px' }}>Exame</th>
                    <th style={{ padding: '10px' }}>Médico</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {examesSst.map(e => {
                    const trab = trabalhadores.find(t => t.cpf === e.cpf);
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}><strong>{trab?.nome || e.cpf}</strong></td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{e.tipoExame}</td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{e.medico}</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{e.resultado}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: S-2299 DESLIGAMENTO */}
        {abaEsocial === 'desligamento' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Evento S-2299: Desligamento / Rescisão
            </h3>
            <form onSubmit={handleDesligar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Trabalhador:</label>
                <select value={novoDeslig.cpf} onChange={e => setNovoDeslig({...novoDeslig, cpf: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="">Selecione...</option>
                  {trabalhadoresAtivos.map(t => <option key={t.id} value={t.cpf}>{t.nome}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Motivo:</label>
                <select value={novoDeslig.motivoDesligamento} onChange={e => setNovoDeslig({...novoDeslig, motivoDesligamento: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="02 - Rescisão sem justa causa">02 - Sem justa causa</option>
                  <option value="06 - Pedido de demissão">06 - Pedido de demissão</option>
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Data da Saída:</label>
                <input type="date" required value={novoDeslig.dataDesligamento} onChange={e => setNovoDeslig({...novoDeslig, dataDesligamento: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>
                  Transmitir S-2299
                </button>
              </div>
            </form>

            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Trabalhador</th>
                    <th style={{ padding: '10px' }}>Motivo</th>
                    <th style={{ padding: '10px' }}>Data</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {desligamentos.map(d => {
                    const trab = trabalhadores.find(t => t.cpf === d.cpf);
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}><strong>{trab?.nome || d.cpf}</strong></td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{d.motivoDesligamento}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{d.dataDesligamento}</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Transmitido (S-2299)</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 5: S-1200 FOLHA */}
        {abaEsocial === 'folha' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Eventos S-1200 (Remuneração) e S-1299 (Fechamento)
            </h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Competência:</label>
                <select value={competenciaFolha} onChange={e => setCompetenciaFolha(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="02/2026">Fevereiro/2026</option>
                  <option value="03/2026">Março/2026</option>
                </select>
              </div>
              <div style={{ alignSelf: 'flex-end', boxSizing: 'border-box' }}>
                <button onClick={() => { setFolhaProcessada(true); if (typeof mostrarToast === 'function') mostrarToast("Folha consolidada e transmitida via S-1299!", "sucesso"); }} style={{ padding: '10px 18px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box' }}>
                  ⚙️ Consolidar e Fechar Folha (S-1299)
                </button>
              </div>
            </div>

            {folhaProcessada && (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', backgroundColor: 'white', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: '14.5px', wordBreak: 'break-word' }}>Encargos Apurados para {competenciaFolha} ({trabalhadoresAtivos.length} ativos)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', fontSize: '12.5px', boxSizing: 'border-box' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>TOTAL SALÁRIOS</span>
                    <strong style={{ fontSize: '16px', wordBreak: 'break-word' }}>R$ {formatMoeda(totalSalarios)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>INSS PATRONAL (20%)</span>
                    <strong style={{ fontSize: '16px', color: '#1351b4', wordBreak: 'break-word' }}>R$ {formatMoeda(inssPatronal)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                    <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', display: 'block' }}>FGTS (8%)</span>
                    <strong style={{ fontSize: '16px', color: '#16a34a', wordBreak: 'break-word' }}>R$ {formatMoeda(totalFgts)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 6: DCTFWEB */}
        {abaEsocial === 'dctfweb' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              DCTFWeb e DARF Previdenciário Unificado
            </h3>
            {folhaProcessada ? (
              <div style={{ border: '2px solid #0f172a', borderRadius: '16px', padding: '20px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
                  <strong style={{ fontSize: '15px', display: 'block', wordBreak: 'break-word' }}>DARF PREVIDENCIÁRIO UNIFICADO (DCTFWeb)</strong>
                  <span style={{ fontSize: '11.5px', color: '#475569', wordBreak: 'break-word' }}>Competência: {competenciaFolha} | Código 2985-01</span>
                </div>
                <div style={{ overflowX: 'auto', boxSizing: 'border-box', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '350px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Contribuição</th>
                        <th style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>INSS Patronal + RAT + Terceiros</td>
                        <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(totalInssRecolher)}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold' }}>
                        <td style={{ padding: '10px', border: '1px solid #cbd5e1', wordBreak: 'break-word' }}>TOTAL A RECOLHER</td>
                        <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#15803d', whiteSpace: 'nowrap' }}>R$ {formatMoeda(totalInssRecolher)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '13.5px', boxSizing: 'border-box' }}>
                  🖨️ Imprimir DARF Previdenciário Oficial
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', color: '#92400e', fontSize: '13px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                ⚠️ A DCTFWeb só fica disponível após realizar o fecho da folha no separador anterior (S-1299).
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}