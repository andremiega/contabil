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
    { id: 1, cpf: '412.889.308-12', motivo: '03 - Acidente ou doença relacionada ao trabalho (Licença Médica > 15 dias)', dataInicio: '2026-03-01', status: 'Transmitido (S-2230)' }
  ]);
  const [novoAfast, setNovoAfast] = useState({ cpf: '412.889.308-12', motivo: '01 - Doença (geral)', dataInicio: '' });

  // 3. Desligamentos / Rescisões (S-2299)
  const [desligamentos, setDesligamentos] = useState([]);
  const [novoDeslig, setNovoDeslig] = useState({ cpf: '', motivoDesligamento: '02 - Rescisão sem justa causa pelo empregador', dataDesligamento: '' });

  // 4. SST - ASO / Exames (S-2220)
  const [examesSst, setExamesSst] = useState([
    { id: 1, cpf: '412.889.308-12', tipoExame: '0 - Exame Admissional', resultado: 'Ato / Apto', medico: 'Dr. Roberto Souza (CRM 54321-SP)', data: '2025-01-08' }
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
    if (mostrarToast) mostrarToast("Evento S-2200 (Admissão) transmitido com sucesso ao eSocial!", "sucesso");
  };

  const handleCadastrarAfastamento = (e) => {
    e.preventDefault();
    setAfastamentos([...afastamentos, { id: Date.now(), ...novoAfast, status: 'Transmitido (S-2230)' }]);
    if (mostrarToast) mostrarToast("Evento S-2230 (Afastamento Temporário) registado no eSocial!", "sucesso");
  };

  const handleDesligar = (e) => {
    e.preventDefault();
    if (!novoDeslig.cpf || !novoDeslig.dataDesligamento) return;
    setDesligamentos([...desligamentos, { id: Date.now(), ...novoDeslig }]);
    if (mostrarToast) mostrarToast("Evento S-2299 (Desligamento) transmitido. Prazo de 10 dias para pagamento das verbas.", "sucesso");
  };

  const handleCadastrarAso = (e) => {
    e.preventDefault();
    setExamesSst([...examesSst, { id: Date.now(), ...novoAso, data: new Date().toISOString().split('T')[0] }]);
    if (mostrarToast) mostrarToast("Evento S-2220 (Monitoramento da Saúde - ASO) transmitido!", "sucesso");
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* CABEÇALHO INSTITUCIONAL ESOCIAL */}
      <div style={{ backgroundColor: '#1351b4', color: 'white', padding: '14px 22px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '4px solid #ffbe00' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#ffbe00', color: '#071d41', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '18px' }}>
            🏛️ eSocial Completo
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Ambiente Nacional de Escrituração Digital Trabalhista</div>
            <div style={{ fontSize: '11px', color: '#93c5fd' }}>Gestão de Vínculos, Afastamentos, SST (ASO), Rescisões (S-2299) e DCTFWeb</div>
          </div>
        </div>

        {/* SELETOR DE EVENTOS DO ESOCIAL */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaEsocial('admissao')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'admissao' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'admissao' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            👤 S-2200 (Admissão)
          </button>
          <button onClick={() => setAbaEsocial('afastamento')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'afastamento' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'afastamento' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            🏥 S-2230 (Afastamento)
          </button>
          <button onClick={() => setAbaEsocial('sst')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'sst' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'sst' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            🩺 S-2220 (SST / ASO)
          </button>
          <button onClick={() => setAbaEsocial('desligamento')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'desligamento' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'desligamento' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            📄 S-2299 (Rescisão)
          </button>
          <button onClick={() => setAbaEsocial('folha')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'folha' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'folha' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            📊 S-1200 (Folha)
          </button>
          <button onClick={() => setAbaEsocial('dctfweb')} style={{ padding: '7px 10px', backgroundColor: abaEsocial === 'dctfweb' ? '#ffbe00' : '#1e40af', color: abaEsocial === 'dctfweb' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            🧾 DCTFWeb
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1' }}>
        
        {/* ABA 1: S-2200 ADMISSÃO */}
        {abaEsocial === 'admissao' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Evento S-2200: Cadastramento Inicial e Admissão de Trabalhador
            </h3>
            <form onSubmit={handleCadastrarTrabalhador} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CPF do Trabalhador *</label>
                <input type="text" placeholder="000.000.000-00" required value={novoTrab.cpf} onChange={e => setNovoTrab({...novoTrab, cpf: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Nome Completo *</label>
                <input type="text" placeholder="Nome civil" required value={novoTrab.nome} onChange={e => setNovoTrab({...novoTrab, nome: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Cargo *</label>
                <input type="text" placeholder="Ex: Analista Fiscal" required value={novoTrab.cargo} onChange={e => setNovoTrab({...novoTrab, cargo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Salário Base (R$) *</label>
                <input type="number" step="0.01" placeholder="4000.00" required value={novoTrab.salario} onChange={e => setNovoTrab({...novoTrab, salario: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: 'span 2' }}>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  📤 Transmitir Evento S-2200 (Admissão)
                </button>
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Trabalhador</th>
                  <th style={{ padding: '8px' }}>Cargo</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Salário Base</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trabalhadores.map(t => {
                  const desligado = desligamentos.some(d => d.cpf === t.cpf);
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: desligado ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: '8px' }}><strong>{t.nome}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{t.cpf}</span></td>
                      <td style={{ padding: '8px' }}>{t.cargo}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatMoeda(t.salario)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span style={{ backgroundColor: desligado ? '#fee2e2' : '#dcfce7', color: desligado ? '#991b1b' : '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {desligado ? 'Desligado (S-2299)' : t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 2: S-2230 AFASTAMENTO */}
        {abaEsocial === 'afastamento' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Evento S-2230: Afastamento Temporário (Licença Médica, Maternidade ou Acidente)
            </h3>
            <form onSubmit={handleCadastrarAfastamento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Trabalhador:</label>
                <select value={novoAfast.cpf} onChange={e => setNovoAfast({...novoAfast, cpf: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  {trabalhadores.map(t => <option key={t.id} value={t.cpf}>{t.nome} ({t.cpf})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Motivo do Afastamento:</label>
                <select value={novoAfast.motivo} onChange={e => setNovoAfast({...novoAfast, motivo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="01 - Doença (geral) até 15 dias">01 - Doença (geral) até 15 dias</option>
                  <option value="03 - Acidente ou doença relacionada ao trabalho">03 - Acidente ou doença do trabalho</option>
                  <option value="15 - Licença-maternidade (120 dias)">15 - Licença-maternidade (120 dias)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Data de Início:</label>
                <input type="date" required value={novoAfast.dataInicio} onChange={e => setNovoAfast({...novoAfast, dataInicio: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ width: '100%', padding: '9px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Transmitir S-2230
                </button>
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>CPF / Trabalhador</th>
                  <th style={{ padding: '8px' }}>Motivo</th>
                  <th style={{ padding: '8px' }}>Início</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {afastamentos.map(a => {
                  const trab = trabalhadores.find(t => t.cpf === a.cpf);
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}><strong>{trab?.nome || a.cpf}</strong></td>
                      <td style={{ padding: '8px' }}>{a.motivo}</td>
                      <td style={{ padding: '8px' }}>{a.dataInicio}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{a.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 3: S-2220 SST / ASO */}
        {abaEsocial === 'sst' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Evento S-2220: Monitoramento da Saúde do Trabalhador (ASO - Atestado de Saúde Ocupacional)
            </h3>
            <form onSubmit={handleCadastrarAso} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Trabalhador:</label>
                <select value={novoAso.cpf} onChange={e => setNovoAso({...novoAso, cpf: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  {trabalhadores.map(t => <option key={t.id} value={t.cpf}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Tipo de Exame:</label>
                <select value={novoAso.tipoExame} onChange={e => setNovoAso({...novoAso, tipoExame: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="0 - Exame Admissional">0 - Exame Admissional</option>
                  <option value="2 - Exame Periódico">2 - Exame Periódico</option>
                  <option value="9 - Exame Demissional">9 - Exame Demissional</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Médico Coordenador (CRM):</label>
                <input type="text" required value={novoAso.medico} onChange={e => setNovoAso({...novoAso, medico: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ width: '100%', padding: '9px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Transmitir S-2220 (ASO)
                </button>
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Trabalhador</th>
                  <th style={{ padding: '8px' }}>Exame</th>
                  <th style={{ padding: '8px' }}>Médico / CRM</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {examesSst.map(e => {
                  const trab = trabalhadores.find(t => t.cpf === e.cpf);
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}><strong>{trab?.nome || e.cpf}</strong></td>
                      <td style={{ padding: '8px' }}>{e.tipoExame}</td>
                      <td style={{ padding: '8px' }}>{e.medico}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{e.resultado}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 4: S-2299 DESLIGAMENTO */}
        {abaEsocial === 'desligamento' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Evento S-2299: Desligamento / Rescisão de Contrato de Trabalho
            </h3>
            <form onSubmit={handleDesligar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Trabalhador a Desligar:</label>
                <select value={novoDeslig.cpf} onChange={e => setNovoDeslig({...novoDeslig, cpf: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="">Selecione...</option>
                  {trabalhadoresAtivos.map(t => <option key={t.id} value={t.cpf}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Motivo do Desligamento:</label>
                <select value={novoDeslig.motivoDesligamento} onChange={e => setNovoDeslig({...novoDeslig, motivoDesligamento: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="02 - Rescisão sem justa causa pelo empregador">02 - Sem justa causa (Empregador)</option>
                  <option value="06 - Pedido de demissão">06 - Pedido de demissão</option>
                  <option value="08 - Rescisão por acordo entre as partes (Art. 484-A CLT)">08 - Acordo (Art. 484-A CLT)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Data do Desligamento:</label>
                <input type="date" required value={novoDeslig.dataDesligamento} onChange={e => setNovoDeslig({...novoDeslig, dataDesligamento: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{ width: '100%', padding: '9px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Transmitir S-2299 (Rescisão)
                </button>
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Trabalhador</th>
                  <th style={{ padding: '8px' }}>Motivo</th>
                  <th style={{ padding: '8px' }}>Data Saída</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {desligamentos.map(d => {
                  const trab = trabalhadores.find(t => t.cpf === d.cpf);
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}><strong>{trab?.nome || d.cpf}</strong></td>
                      <td style={{ padding: '8px' }}>{d.motivoDesligamento}</td>
                      <td style={{ padding: '8px' }}>{d.dataDesligamento}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}><span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Transmitido (S-2299)</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 5: S-1200 FOLHA */}
        {abaEsocial === 'folha' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Eventos Periódicos S-1200 (Remuneração) e S-1299 (Fechamento)
            </h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Competência:</label>
                <select value={competenciaFolha} onChange={e => setCompetenciaFolha(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="02/2026">Fevereiro/2026</option>
                  <option value="03/2026">Março/2026</option>
                </select>
              </div>
              <div style={{ marginTop: '18px' }}>
                <button onClick={() => { setFolhaProcessada(true); if (mostrarToast) mostrarToast("Folha consolidada e transmitida via S-1299!", "sucesso"); }} style={{ padding: '9px 18px', backgroundColor: '#1351b4', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ⚙️ Consolidar e Fechar Folha (S-1299)
                </button>
              </div>
            </div>

            {folhaProcessada && (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '18px', backgroundColor: '#ffffff' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Encargos Apurados para {competenciaFolha} ({trabalhadoresAtivos.length} empregados ativos)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', display: 'block' }}>TOTAL SALÁRIOS</span>
                    <strong style={{ fontSize: '16px' }}>R$ {formatMoeda(totalSalarios)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', display: 'block' }}>INSS PATRONAL (20%)</span>
                    <strong style={{ fontSize: '16px', color: '#1351b4' }}>R$ {formatMoeda(inssPatronal)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', display: 'block' }}>FGTS (8%)</span>
                    <strong style={{ fontSize: '16px', color: '#16a34a' }}>R$ {formatMoeda(totalFgts)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 6: DCTFWEB */}
        {abaEsocial === 'dctfweb' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1351b4', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              DCTFWeb e DARF Previdenciário Unificado
            </h3>
            {folhaProcessada ? (
              <div style={{ border: '2px solid #0f172a', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff', maxWidth: '750px', margin: '0 auto' }}>
                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <strong style={{ fontSize: '16px', display: 'block' }}>DARF PREVIDENCIÁRIO UNIFICADO (DCTFWeb)</strong>
                  <span style={{ fontSize: '12px', color: '#475569' }}>Competência: {competenciaFolha} • Código 2985-01</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Descrição da Contribuição</th>
                      <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>INSS Patronal + RAT + Outras Entidades (Terceiros)</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>R$ {formatMoeda(totalInssRecolher)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>TOTAL A RECOLHER</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#15803d' }}>R$ {formatMoeda(totalInssRecolher)}</td>
                    </tr>
                  </tfoot>
                </table>
                <button onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                  🖨️ Imprimir DARF Previdenciário Oficial
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px', color: '#92400e', fontSize: '13.5px' }}>
                ⚠️ A DCTFWeb só fica disponível após realizar o fecho da folha no separador anterior (S-1299).
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}