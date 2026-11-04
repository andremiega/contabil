import React, { useState } from 'react';

export default function LaboratorioContabilidadeRural({ mostrarToast }) {
  // ==========================================
  // 1. ESTADOS GLOBAIS E NAVEGAÇÃO
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState('onboarding');
  const [menuLateralAberto, setMenuLateralAberto] = useState(true);
  const [gerarRelatorio, setGerarRelatorio] = useState(false); // <-- CORREÇÃO AQUI: Estado que estava a faltar/dar erro

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ==========================================
  // 2. ESTADOS DOS MÓDULOS
  // ==========================================

  // Passo 1: Contrato de Honorários
  const [contratoHonorarios, setContratoHonorarios] = useState({
    nomeCliente: '', cpfCnpj: '', enderecoPropriedade: '', areaHectares: '',
    tipoCliente: 'pf', servicos: 'contabilidade_completa',
    honorarioMensal: 2500, cobrancaItrLcdpr: 3000, multaAtrasoDoc: 10,
    prazoDocs: 5, vigenciaMeses: 12
  });

  const gerarContratoPDF = () => {
    if (!contratoHonorarios.nomeCliente || !contratoHonorarios.cpfCnpj) {
      dispararToast('Preencha Nome e CPF/CNPJ para gerar o contrato.', 'erro');
      return;
    }
    const texto = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS RURAIS
    
CONTRATANTE: ${contratoHonorarios.nomeCliente}, inscrito no CPF/CNPJ: ${contratoHonorarios.cpfCnpj}.
PROPRIEDADE: ${contratoHonorarios.enderecoPropriedade} (${contratoHonorarios.areaHectares} ha).

OBJETO: Prestação de serviços de ${contratoHonorarios.servicos.replace('_', ' ')} para enquadramento na Pessoa ${contratoHonorarios.tipoCliente.toUpperCase()}.

HONORÁRIOS: Valor mensal acordado é de ${formatMoeda(contratoHonorarios.honorarioMensal)}.
FECHAMENTO ANUAL (ITR/LCDPR/IRPF): Acordado em ${formatMoeda(contratoHonorarios.cobrancaItrLcdpr)}.

OBRIGAÇÕES: O contratante deve enviar os documentos até o dia ${contratoHonorarios.prazoDocs} do mês subsequente, sob pena de multa de ${contratoHonorarios.multaAtrasoDoc}%.

VIGÊNCIA: ${contratoHonorarios.vigenciaMeses} meses a partir desta data.

_________________________________
Assinatura Produtor / Contratante`;

    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `Contrato_Contabilidade_${contratoHonorarios.nomeCliente.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispararToast('Contrato gerado com sucesso!', 'sucesso');
  };

  // Passo 2: Checklist Documental
  const [checklist, setChecklist] = useState([
    { id: 1, doc: 'Documentos Pessoais (RG, CPF, Cert. Casamento)', recebido: false, categoria: 'inicial' },
    { id: 2, doc: 'Comprovante de Endereço (Urbano e Rural)', recebido: false, categoria: 'inicial' },
    { id: 3, doc: 'CCIR (Certificado de Cadastro de Imóvel Rural)', recebido: false, categoria: 'inicial' },
    { id: 4, doc: 'CAR (Cadastro Ambiental Rural)', recebido: false, categoria: 'inicial' },
    { id: 5, doc: 'NIRF (Número do Imóvel na Receita Federal)', recebido: false, categoria: 'inicial' },
    { id: 6, doc: 'Inscrição Estadual de Produtor Rural (SEFAZ)', recebido: false, categoria: 'inicial' },
    { id: 7, doc: 'Contratos Agrários (Arrendamento/Parceria/Comodato)', recebido: false, categoria: 'inicial' },
    { id: 8, doc: 'Documentação p/ eSocial (ASO, Cópias Docs)', recebido: false, categoria: 'contratacao' },
    { id: 9, doc: 'Contrato de Trabalho de Safra / Prazo Determinado', recebido: false, categoria: 'contratacao' },
    { id: 10, doc: 'XMLs NFP-e Vendas e Compras', recebido: false, categoria: 'mensal' },
    { id: 11, doc: 'Extrato Bancário .OFX (Contas CAEPF)', recebido: false, categoria: 'mensal' },
    { id: 12, doc: 'Recibos assinados de diaristas e prestadores', recebido: false, categoria: 'mensal' }
  ]);

  const alternarChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, recebido: !item.recebido } : item));
  };
  const docsFaltantes = checklist.filter(c => !c.recebido).length;

  // Passo 3: Plano de Contas
  const planoDeContas = [
    { cod: '1.1.04.01', nome: 'Almoxarifado (Insumos)', tipo: 'ATIVO CIRCULANTE', cor: '#059669', icon: '📦', expl: 'Sementes, adubos, defensivos e combustíveis armazenados. Conta devedora.' },
    { cod: '1.1.04.05', nome: 'Culturas Temp. em Formação', tipo: 'ATIVO CIRCULANTE (Biológico)', cor: '#059669', icon: '🌱', expl: 'Acumula os custos da safra (soja, milho) até a colheita (CPC 29). Conta devedora.' },
    { cod: '1.1.04.08', nome: 'Produtos Agrícolas (Colhidos)', tipo: 'ATIVO CIRCULANTE (Estoque)', cor: '#059669', icon: '🌾', expl: 'Grãos ensacados avaliados a valor justo na colheita (CPC 16). Conta devedora.' },
    { cod: '1.2.03.01', nome: 'Terras Nuas', tipo: 'ATIVO NÃO CIRCULANTE (Imobilizado)', cor: '#2563eb', icon: '🗺️', expl: 'A terra rural em si. Não sofre depreciação. Conta devedora.' },
    { cod: '1.2.03.05', nome: 'Culturas Permanentes', tipo: 'ATIVO NÃO CIRCULANTE (Biológico)', cor: '#2563eb', icon: '🌳', expl: 'Plantas portadoras (café, laranja) em formação ou produção (CPC 27). Conta devedora.' },
    { cod: '1.2.03.10', nome: 'Matrizes e Reprodutores', tipo: 'ATIVO NÃO CIRCULANTE (Imob.)', cor: '#2563eb', icon: '🐄', expl: 'Gado destinado à procriação ou leite. Sofre exaustão sistemática. Conta devedora.' },
    { cod: '1.2.03.15', nome: 'Máquinas e Tratores', tipo: 'ATIVO NÃO CIRCULANTE (Imob.)', cor: '#2563eb', icon: '🚜', expl: 'Tratores e implementos. Sofrem depreciação. Conta devedora.' },
    { cod: '1.2.03.20', nome: 'Benfeitorias Rurais', tipo: 'ATIVO NÃO CIRCULANTE (Imob.)', cor: '#2563eb', icon: '🏭', expl: 'Silos, galpões, cercas agregados à terra. Sofrem depreciação. Conta devedora.' },
    { cod: '2.1.01.01', nome: 'Fornecedores e Custeios', tipo: 'PASSIVO CIRCULANTE', cor: '#dc2626', icon: '🧾', expl: 'Obrigações a pagar a cooperativas e bancos. Conta credora.' },
    { cod: '3.1.01.01', nome: 'Receita da Atividade Rural', tipo: 'RESULTADO (Receita)', cor: '#059669', icon: '💰', expl: 'Faturamento bruto da venda de safra ou rebanho. Conta credora.' },
    { cod: '3.1.01.05', nome: 'Variação de Valor Justo', tipo: 'RESULTADO (Ganho Biol.)', cor: '#059669', icon: '📈', expl: 'Ganho biológico antes da venda física (CPC 29). Conta credora.' },
    { cod: '4.1.01.01', nome: 'Custo de Produção (CPV)', tipo: 'RESULTADO (Custo)', cor: '#dc2626', icon: '📉', expl: 'Baixa do estoque no momento da venda. Conta devedora.' }
  ];

  // Passo 4: LCDPR Expandido
  const [lancamentoLcdpr, setLancamentoLcdpr] = useState({ data: '', numDoc: '', participante: '', historico: '', tipo: 'despesa', valor: '' });
  const [livroCaixa, setLivroCaixa] = useState([
    { id: 1, data: '2026-10-15', numDoc: '55890', participante: '12.345.678/0001-90', historico: 'Pgto NF 55890 - Sementes Cooperativa', tipo: 'despesa', valor: 85000, status: 'validado' }
  ]);
  const [saldoBancario, setSaldoBancario] = useState(250000);

  const registrarLcdpr = () => {
    if (!lancamentoLcdpr.data || !lancamentoLcdpr.numDoc || !lancamentoLcdpr.participante || !lancamentoLcdpr.valor) {
      dispararToast('Preencha os campos obrigatórios.', 'erro');
      return;
    }
    let erroFicticio = false;
    const hist = lancamentoLcdpr.historico.toLowerCase();
    if (hist.includes('escola') || hist.includes('viagem') || hist.includes('pessoal')) {
      dispararToast('ERRO: Despesa pessoal não dedutível no LCDPR.', 'erro');
      erroFicticio = true;
    }
    const novoLanc = { ...lancamentoLcdpr, id: Date.now(), valor: Number(lancamentoLcdpr.valor), status: erroFicticio ? 'erro_malha' : 'validado' };
    if (!erroFicticio) setSaldoBancario(prev => lancamentoLcdpr.tipo === 'receita' ? prev + novoLanc.valor : prev - novoLanc.valor);
    
    setLivroCaixa([novoLanc, ...livroCaixa]);
    setLancamentoLcdpr({ data: '', numDoc: '', participante: '', historico: '', tipo: 'despesa', valor: '' });
  };

  // Passo 5: DP Rural
  const [funcionario, setFuncionario] = useState({ salarioBruto: 2500 });
  const [opcaoFunrural, setOpcaoFunrural] = useState('comercializacao');
  const inssEmpregado = funcionario.salarioBruto * 0.09; 
  const fgtsMensal = funcionario.salarioBruto * 0.08;
  const inssPatronal = opcaoFunrural === 'folha' ? funcionario.salarioBruto * 0.227 : funcionario.salarioBruto * 0.027; 
  const salarioLiquido = funcionario.salarioBruto - inssEmpregado;
  const custoTotalEmpresa = funcionario.salarioBruto + fgtsMensal + inssPatronal;

  // Passo 6: NF e Reforma Tributária
  const [lancamentoFiscal, setLancamentoFiscal] = useState({ tipo: 'venda', valor: 100000, item: 'Soja em Grãos' });
  const [nfpEmissao, setNfpEmissao] = useState({ quantidade: 1000, valorUnitario: 135 });
  const totalNFP = nfpEmissao.quantidade * nfpEmissao.valorUnitario;
  const impostosNFP = lancamentoFiscal.tipo === 'venda' ? totalNFP * 0.106 : totalNFP * 0.265;
  const funruralNFP = lancamentoFiscal.tipo === 'venda' ? totalNFP * 0.015 : 0;

  // Teoria (Cards)
  const teorias = [
    { titulo: 'O que é Contabilidade Rural?', icon: '🌾', texto: 'Aplica a ciência contábil à agricultura e pecuária, focando no crescimento biológico.' },
    { titulo: 'LCDPR vs Balanço', icon: '⚖️', texto: 'LCDPR atua em Regime de Caixa para PF. Balanço atua em Competência para PJ.' },
    { titulo: 'Ativos Biológicos (CPC 29)', icon: '🌱', texto: 'Plantas e animais avaliados a Valor Justo. Gera lucro antes da venda.' },
    { titulo: 'Plantas Portadoras (CPC 27)', icon: '🌳', texto: 'Cafezais são Imobilizado. Sofrem exaustão anual.' },
    { titulo: 'Produtos Colhidos (CPC 16)', icon: '📦', texto: 'Ao colher, vira Estoque e congela o valor justo da colheita.' },
    { titulo: 'Investimento vs Custeio', icon: '🚜', texto: 'No LCDPR, trator abate 100% no IR. Na PJ, apenas a depreciação abate.' },
    { titulo: 'Arrendamento vs Parceria', icon: '📜', texto: 'Arrendamento é aluguel (sem deduções). Parceria é atividade rural.' },
    { titulo: 'A Escolha do Funrural', icon: '📊', texto: 'Em Janeiro, decide-se entre 20% na Folha ou 1,5% na Venda Bruta.' }
  ];

  // ==========================================
  // 3. RENDERIZAÇÃO E ESTILOS
  // ==========================================
  const mainBg = '#f4f4f5'; const cardBg = '#ffffff'; const borderC = '#e4e4e7';
  const textP = '#18181b'; const textS = '#52525b';
  const prim = '#059669'; const sec = '#2563eb'; const warn = '#ea580c'; const err = '#dc2626';

  const navBtnStyle = (ativo) => ({
    padding: '10px 16px', borderRadius: '8px', border: 'none',
    backgroundColor: ativo ? prim : 'transparent', color: ativo ? '#ffffff' : '#a1a1aa',
    fontWeight: ativo ? 'bold' : '600', cursor: 'pointer', fontSize: '13px'
  });
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px', marginTop: '6px', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: mainBg, color: textP, fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <div style={{ backgroundColor: '#18181b', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ color: 'white', fontWeight: '900', fontSize: '16px', marginRight: '20px' }}>🌱 AGRO C-LEVEL</div>
        <button style={navBtnStyle(abaAtiva === 'onboarding' && !gerarRelatorio)} onClick={() => { setAbaAtiva('onboarding'); setGerarRelatorio(false); }}>1. Contrato & Checklist</button>
        <button style={navBtnStyle(abaAtiva === 'planocontas' && !gerarRelatorio)} onClick={() => { setAbaAtiva('planocontas'); setGerarRelatorio(false); }}>2. Plano de Contas</button>
        <button style={navBtnStyle(abaAtiva === 'lcdpr' && !gerarRelatorio)} onClick={() => { setAbaAtiva('lcdpr'); setGerarRelatorio(false); }}>3. LCDPR (Livro Caixa)</button>
        <button style={navBtnStyle(abaAtiva === 'dp' && !gerarRelatorio)} onClick={() => { setAbaAtiva('dp'); setGerarRelatorio(false); }}>4. Depto. Pessoal</button>
        <button style={navBtnStyle(abaAtiva === 'fiscal' && !gerarRelatorio)} onClick={() => { setAbaAtiva('fiscal'); setGerarRelatorio(false); }}>5. NF-e & Impostos</button>
        <button style={navBtnStyle(gerarRelatorio)} onClick={() => setGerarRelatorio(true)}>6. Balanço & Relatório</button>
        <button style={navBtnStyle(abaAtiva === 'teoria' && !gerarRelatorio)} onClick={() => { setAbaAtiva('teoria'); setGerarRelatorio(false); }}>7. Teoria Contábil</button>
      </div>

      <div style={{ flex: 1, padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {!gerarRelatorio ? (
          <>
            {/* PASSO 1 E 2: CONTRATO E CHECKLIST */}
            {abaAtiva === 'onboarding' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}`, marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: textP }}>📄 Elaboração do Contrato de Serviços</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nome do Produtor:</label><input type="text" style={inputStyle} value={contratoHonorarios.nomeCliente} onChange={e => setContratoHonorarios({...contratoHonorarios, nomeCliente: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>CPF/CNPJ:</label><input type="text" style={inputStyle} value={contratoHonorarios.cpfCnpj} onChange={e => setContratoHonorarios({...contratoHonorarios, cpfCnpj: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Endereço Rural:</label><input type="text" style={inputStyle} value={contratoHonorarios.enderecoPropriedade} onChange={e => setContratoHonorarios({...contratoHonorarios, enderecoPropriedade: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Área (ha):</label><input type="text" style={inputStyle} value={contratoHonorarios.areaHectares} onChange={e => setContratoHonorarios({...contratoHonorarios, areaHectares: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Honorário Mensal (R$):</label><input type="number" style={inputStyle} value={contratoHonorarios.honorarioMensal} onChange={e => setContratoHonorarios({...contratoHonorarios, honorarioMensal: Number(e.target.value)})} /></div>
                  </div>
                  <button onClick={gerarContratoPDF} style={{ marginTop: '24px', padding: '14px', backgroundColor: sec, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>🖨️ Imprimir / Gerar Contrato (.txt)</button>
                </div>

                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}` }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: textP }}>📋 Checklist Documental</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${borderC}` }}>
                      <h4 style={{ color: sec, margin: '0 0 12px 0' }}>Iniciais & Cadastros</h4>
                      {checklist.filter(c => c.categoria === 'inicial').map(item => (
                        <label key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={item.recebido} onChange={() => alternarChecklist(item.id)} /> <span style={{ textDecoration: item.recebido ? 'line-through' : 'none' }}>{item.doc}</span>
                        </label>
                      ))}
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${borderC}` }}>
                      <h4 style={{ color: warn, margin: '0 0 12px 0' }}>Mensais & RH</h4>
                      {checklist.filter(c => c.categoria !== 'inicial').map(item => (
                        <label key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={item.recebido} onChange={() => alternarChecklist(item.id)} /> <span style={{ textDecoration: item.recebido ? 'line-through' : 'none' }}>{item.doc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: PLANO DE CONTAS */}
            {abaAtiva === 'planocontas' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', color: textP, marginBottom: '20px', textAlign: 'center' }}>Plano de Contas Agropecuário Estruturado</h2>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {planoDeContas.map((conta, idx) => (
                      <div key={idx} style={{ backgroundColor: cardBg, borderRadius: '16px', border: `1px solid ${borderC}`, borderTop: `6px solid ${conta.cor}`, padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <span style={{ fontSize: '28px' }}>{conta.icon}</span>
                          <span style={{ backgroundColor: `${conta.cor}15`, color: conta.cor, padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>{conta.tipo}</span>
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: textP }}>{conta.cod}</h3>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: textS }}>{conta.nome}</h4>
                        <p style={{ margin: '0', fontSize: '13px', color: '#71717a' }}>{conta.expl}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* PASSO 4: LCDPR */}
            {abaAtiva === 'lcdpr' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}`, marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>💻 Escrituração do Livro Caixa Digital (LCDPR)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Data:</label><input type="date" style={inputStyle} value={lancamentoLcdpr.data} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, data: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Doc:</label><input type="text" style={inputStyle} value={lancamentoLcdpr.numDoc} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, numDoc: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>CPF/CNPJ:</label><input type="text" style={inputStyle} value={lancamentoLcdpr.participante} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, participante: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Natureza:</label>
                      <select style={inputStyle} value={lancamentoLcdpr.tipo} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, tipo: e.target.value})}>
                        <option value="despesa">Saída (Despesa)</option><option value="receita">Entrada (Receita)</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Histórico:</label><input type="text" style={inputStyle} value={lancamentoLcdpr.historico} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, historico: e.target.value})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Valor Bruto:</label><input type="number" style={inputStyle} value={lancamentoLcdpr.valor} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, valor: e.target.value})} /></div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}><button onClick={registrarLcdpr} style={{ backgroundColor: prim, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Gravar Registro</button></div>
                  </div>
                </div>

                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Bloco Q100</h3>
                    <strong style={{ color: sec }}>Saldo: {formatMoeda(saldoBancario)}</strong>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '12px', borderBottom: `2px solid ${borderC}` }}>Data</th>
                          <th style={{ padding: '12px', borderBottom: `2px solid ${borderC}` }}>Doc</th>
                          <th style={{ padding: '12px', borderBottom: `2px solid ${borderC}` }}>Histórico</th>
                          <th style={{ padding: '12px', borderBottom: `2px solid ${borderC}` }}>Valor</th>
                          <th style={{ padding: '12px', borderBottom: `2px solid ${borderC}` }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {livroCaixa.map(l => (
                          <tr key={l.id} style={{ borderBottom: `1px solid ${borderC}` }}>
                            <td style={{ padding: '12px' }}>{l.data}</td>
                            <td style={{ padding: '12px' }}>{l.numDoc}</td>
                            <td style={{ padding: '12px' }}>{l.historico}</td>
                            <td style={{ padding: '12px', color: l.tipo === 'receita' ? sec : err }}>{l.tipo === 'receita' ? '+' : '-'}{formatMoeda(l.valor)}</td>
                            <td style={{ padding: '12px' }}>{l.status === 'validado' ? '✅' : '❌ Glosa'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 5: DP RURAL E FUNRURAL */}
            {abaAtiva === 'dp' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}` }}>
                  <h3 style={{ margin: '0 0 20px 0' }}>👥 Holerite Rural e Custo do Empregador</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Salário Base (R$):</label><input type="number" style={inputStyle} value={funcionario.salarioBruto} onChange={e => setFuncionario({...funcionario, salarioBruto: Number(e.target.value)})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Opção Funrural (S-1000):</label>
                      <select style={inputStyle} value={opcaoFunrural} onChange={e => setOpcaoFunrural(e.target.value)}>
                        <option value="comercializacao">Sobre Comercialização (Isenta 20% Folha)</option>
                        <option value="folha">Sobre a Folha de Salários (Paga 20% Patronal)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: `1px solid ${borderC}` }}>
                      <h4 style={{ margin: '0 0 16px 0' }}>Visão do Funcionário</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Salário Bruto:</span><strong>{formatMoeda(funcionario.salarioBruto)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: err, marginBottom: '16px' }}><span>(-) INSS Retido:</span><strong>{formatMoeda(inssEmpregado)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: `2px solid ${borderC}`, paddingTop: '12px', color: prim }}><span>Líquido a Receber:</span><span>{formatMoeda(salarioLiquido)}</span></div>
                    </div>
                    <div style={{ backgroundColor: '#eff6ff', padding: '24px', borderRadius: '12px', border: `1px solid #bfdbfe` }}>
                      <h4 style={{ margin: '0 0 16px 0', color: sec }}>Custo Total da Fazenda</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Salário Bruto:</span><strong>{formatMoeda(funcionario.salarioBruto)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>(+) FGTS (8%):</span><strong>{formatMoeda(fgtsMensal)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: warn, marginBottom: '16px' }}><span>(+) Encargo Patronal:</span><strong>{formatMoeda(inssPatronal)}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: `2px solid #bfdbfe`, paddingTop: '12px', color: sec }}><span>Custo Total:</span><span>{formatMoeda(custoTotalEmpresa)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 6: FISCAL */}
            {abaAtiva === 'fiscal' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <div style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}` }}>
                  <h3 style={{ margin: '0 0 20px 0' }}>🧾 Emissão NFP-e e Reforma Tributária (CBS/IBS)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Operação:</label>
                      <select style={inputStyle} value={lancamentoFiscal.tipo} onChange={e => setLancamentoFiscal({...lancamentoFiscal, tipo: e.target.value})}>
                        <option value="venda">Venda (Saída)</option>
                        <option value="compra_insumo">Compra de Insumo (Crédito)</option>
                      </select>
                    </div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Qtd:</label><input type="number" style={inputStyle} value={nfpEmissao.quantidade} onChange={e => setNfpEmissao({...nfpEmissao, quantidade: Number(e.target.value)})} /></div>
                    <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>Vlr Unitário:</label><input type="number" style={inputStyle} value={nfpEmissao.valorUnitario} onChange={e => setNfpEmissao({...nfpEmissao, valorUnitario: Number(e.target.value)})} /></div>
                  </div>

                  <div style={{ marginTop: '24px', padding: '24px', backgroundColor: lancamentoFiscal.tipo === 'venda' ? '#fdf4ff' : '#f0fdf4', borderRadius: '12px', border: `1px solid ${lancamentoFiscal.tipo === 'venda' ? '#f5d0fe' : '#bbf7d0'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontWeight: 'bold' }}>Valor Total da Nota:</span><span style={{ fontSize: '24px', fontWeight: '900' }}>{formatMoeda(totalNFP)}</span>
                    </div>
                    {lancamentoFiscal.tipo === 'venda' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c026d3', fontWeight: 'bold', marginBottom: '10px' }}><span>IBS/CBS (A Pagar - Reduzida 60%):</span><span>{formatMoeda(impostosNFP)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: warn, fontWeight: 'bold' }}><span>Funrural Retido PF (1,5%):</span><span>{formatMoeda(funruralNFP)}</span></div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: prim, fontWeight: 'bold' }}><span>Crédito IBS/CBS (Ativo - Integral):</span><span>{formatMoeda(impostosNFP)}</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ABA TEORIA */}
            {abaAtiva === 'teoria' && (
              <div style={{ animation: 'fadeIn 0.4s' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>Fundamentos da Contabilidade Agro</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {teorias.map((t, idx) => (
                    <div key={idx} style={{ backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{t.icon}</div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{t.titulo}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: textS, lineHeight: '1.6' }}>{t.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ========================================================= */
          /* RELATÓRIO FINAL GERENCIAL                                 */
          /* ========================================================= */
          <div style={{ animation: 'fadeIn 0.5s', backgroundColor: 'white', padding: '40px', borderRadius: '16px', color: '#0f172a', maxWidth: '900px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ borderBottom: `4px solid ${prim}`, paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: '900' }}>DASHBOARD EXECUTIVO RURAL</h1>
                <h3 style={{ margin: 0, fontWeight: '600', color: textS, fontSize: '15px' }}>
                  Produtor: {contratoHonorarios.nomeCliente || 'Produtor Fictício'} | Propriedade: {contratoHonorarios.enderecoPropriedade}
                </h3>
              </div>
            </div>

            <h4 style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', borderRadius: '6px', color: sec, fontSize: '16px', margin: '0 0 20px 0', borderLeft: `6px solid ${sec}` }}>1. BALANÇO PATRIMONIAL CONSOLIDADO</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px', fontSize: '14px' }}>
              <div>
                <h5 style={{ margin: '0 0 12px 0', borderBottom: `2px solid ${borderC}`, paddingBottom: '5px' }}>ATIVO</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Caixa e Bancos</span><span>R$ 250.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Ativos Biológicos</span><span>R$ 1.850.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Imobilizado</span><span>R$ 6.500.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '12px', borderTop: `2px solid ${borderC}`, paddingTop: '8px', color: sec }}><span>TOTAL ATIVO</span><span>R$ 8.600.000,00</span></div>
              </div>
              <div>
                <h5 style={{ margin: '0 0 12px 0', borderBottom: `2px solid ${borderC}`, paddingBottom: '5px' }}>PASSIVO E PATRIMÔNIO LÍQUIDO</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Custeio (Curto Pz)</span><span>R$ 800.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Financiamentos (Longo Pz)</span><span>R$ 1.200.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Patrimônio Líquido</span><span>R$ 6.600.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '12px', borderTop: `2px solid ${borderC}`, paddingTop: '8px', color: warn }}><span>TOTAL PASSIVO E PL</span><span>R$ 8.600.000,00</span></div>
              </div>
            </div>

            <h4 style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', borderRadius: '6px', color: prim, fontSize: '16px', margin: '0 0 20px 0', borderLeft: `6px solid ${prim}` }}>2. DEMONSTRAÇÃO DO RESULTADO (DRE)</h4>
            <div style={{ marginBottom: '40px', fontSize: '14px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: `1px solid ${borderC}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Receita Bruta (Vendas)</span><span style={{fontWeight:'bold'}}>R$ 4.500.000,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: err }}><span>(-) Custo Prod. Vendida (CPV)</span><span>(R$ 2.600.000,00)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: prim, fontWeight:'bold' }}><span>(+) Var. Valor Justo (CPC 29)</span><span>+ R$ 650.000,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: err }}><span>(-) Desp. Administrativas/DP</span><span>(R$ 550.000,00)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '15px', borderTop: `2px solid ${borderC}`, paddingTop: '10px', fontSize: '18px', color: prim }}><span>LUCRO LÍQUIDO DO EXERCÍCIO</span><span>R$ 2.000.000,00</span></div>
            </div>

            <h4 style={{ backgroundColor: '#fef3c7', padding: '10px 16px', borderRadius: '6px', color: '#b45309', fontSize: '16px', margin: '0 0 15px 0', borderLeft: `6px solid ${warn}` }}>3. PARECER TÉCNICO</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.7', textAlign: 'justify' }}>
              O resultado demonstra alta rentabilidade puxada pelo ganho de Valor Justo da safra no campo. Sugerimos a implantação de Rateio por Centros de Custo por Talhão. A adequação do DP com a opção do Funrural sobre folha ou comercialização otimizará o fluxo de caixa. A contabilidade deve garantir a rastreabilidade integral dos créditos não cumulativos na compra de insumos perante a Reforma Tributária (IBS/CBS).
            </p>

            <div style={{ marginTop: '50px', textAlign: 'center' }}>
              <p style={{ borderTop: `1px solid ${textP}`, width: '300px', margin: '0 auto', paddingTop: '10px', fontWeight: 'bold' }}>Contador Responsável</p>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button onClick={() => setGerarRelatorio(false)} style={{ padding: '12px 24px', backgroundColor: sec, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔙 Voltar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}