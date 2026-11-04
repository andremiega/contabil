import React, { useState } from 'react';

export default function LaboratorioContabilidadeRural({ mostrarToast }) {
  // ==========================================
  // 1. ESTADOS GLOBAIS E NAVEGAÇÃO
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState('onboarding');
  const [gerarRelatorio, setGerarRelatorio] = useState(false);

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ==========================================
  // 2. ESTADOS DOS MÓDULOS
  // ==========================================

  // Passo 1: Contrato de Honorários
  const [contratoHonorarios, setContratoHonorarios] = useState({
    nomeCliente: '',
    cpfCnpj: '',
    enderecoPropriedade: '',
    areaHectares: '',
    tipoCliente: 'pf',
    servicos: 'contabilidade_completa',
    honorarioMensal: 2500,
    cobrancaItrLcdpr: 3000,
    multaAtrasoDoc: 10,
    prazoDocs: 5,
    vigenciaMeses: 12
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
    link.download = `Contrato_Rural_${contratoHonorarios.nomeCliente.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispararToast('Contrato rural gerado com sucesso!', 'sucesso');
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
    { id: 8, doc: 'Documentação p/ eSocial (ASO, NR-31, Cópias Docs)', recebido: false, categoria: 'contratacao' },
    { id: 9, doc: 'Contrato de Trabalho de Safra / Prazo Determinado', recebido: false, categoria: 'contratacao' },
    { id: 10, doc: 'XMLs NFP-e Vendas e Compras de Insumos', recebido: false, categoria: 'mensal' },
    { id: 11, doc: 'Extrato Bancário .OFX (Contas vinculadas ao CAEPF)', recebido: false, categoria: 'mensal' },
    { id: 12, doc: 'Recibos assinados de safristas e fretes agrícolas', recebido: false, categoria: 'mensal' }
  ]);

  const alternarChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, recebido: !item.recebido } : item));
    dispararToast('Status do documento atualizado no malote.', 'info');
  };

  // Passo 3: Plano de Contas (12 Cards Estilizados em Paleta Terra)
  const planoDeContas = [
    { cod: '1.1.04.01', nome: 'Almoxarifado (Insumos)', tipo: 'ATIVO CIRCULANTE', cor: '#b45309', icon: '📦', expl: 'Sementes, fertilizantes, defensivos e diesel estocados para aplicação na safra. Natureza Devedora.' },
    { cod: '1.1.04.05', nome: 'Culturas Temp. em Formação', tipo: 'ATIVO BIOLÓGICO CIRCULANTE', cor: '#15803d', icon: '🌱', expl: 'Custos acumulados da lavoura no solo (soja, milho, algodão) até a colheita (CPC 29). Natureza Devedora.' },
    { cod: '1.1.04.08', nome: 'Produtos Agrícolas Colhidos', tipo: 'ESTOQUE CIRCULANTE', cor: '#b45309', icon: '🌾', expl: 'Grãos ensacados ou armazenados em silos prontos para venda física ou entrega futura (CPC 16). Natureza Devedora.' },
    { cod: '1.2.03.01', nome: 'Terras Nuas (Imóveis Rurais)', tipo: 'ATIVO IMOBILIZADO', cor: '#78350f', icon: '🗺️', expl: 'A terra física da fazenda. Não sofre depreciação, sujeita a ITR e teste de impairment. Natureza Devedora.' },
    { cod: '1.2.03.05', nome: 'Culturas Permanentes', tipo: 'PLANTAS PORTADORAS (IMOB.)', cor: '#15803d', icon: '🌳', expl: 'Pomares e cafezais em produção. Classificados no Imobilizado (CPC 27) com exaustão periódica. Natureza Devedora.' },
    { cod: '1.2.03.10', nome: 'Matrizes e Reprodutores', tipo: 'PECUÁRIA (IMOBILIZADO)', cor: '#78350f', icon: '🐄', expl: 'Plantel reprodutor e vacas de ordenha. Sofrem depreciação pela perda de fertilidade. Natureza Devedora.' },
    { cod: '1.2.03.15', nome: 'Tratores e Colheitadeiras', tipo: 'ATIVO IMOBILIZADO', cor: '#c2410c', icon: '🚜', expl: 'Maquinários e implementos agrícolas. Depreciação contínua baseada em horas trabalhadas. Natureza Devedora.' },
    { cod: '1.2.03.20', nome: 'Benfeitorias e Silos', tipo: 'ATIVO IMOBILIZADO', cor: '#78350f', icon: '🏭', expl: 'Construções rurais: silos graneleiros, galpões de máquinas, currais e cercas. Natureza Devedora.' },
    { cod: '2.1.01.01', nome: 'Fornecedores e CPRs', tipo: 'PASSIVO CIRCULANTE', cor: '#991b1b', icon: '🧾', expl: 'Dívidas com tradings, revendas de adubos e Cédulas de Produto Rural com liquidação no ano. Natureza Credora.' },
    { cod: '3.1.01.01', nome: 'Receita Bruta Agropecuária', tipo: 'RECEITA OPERACIONAL', cor: '#15803d', icon: '💰', expl: 'Faturamento bruto da comercialização de grãos, arrobas de gado ou leite. Natureza Credora.' },
    { cod: '3.1.01.05', nome: 'Ganho a Valor Justo', tipo: 'RECEITA (CPC 29)', cor: '#15803d', icon: '📈', expl: 'Variação positiva do valor biológico da safra no pé ou ganho de peso do rebanho antes da venda. Natureza Credora.' },
    { cod: '4.1.01.01', nome: 'Custo do Produto Vendido (CPV)', tipo: 'CUSTOS (RESULTADO)', cor: '#991b1b', icon: '📉', expl: 'Apropriação do custo das sacas vendidas (baixa do estoque contra o resultado). Natureza Devedora.' }
  ];

  // Passo 4: LCDPR Expandido (Livro Caixa Digital)
  const [lancamentoLcdpr, setLancamentoLcdpr] = useState({ data: '', numDoc: '', participante: '', historico: '', tipo: 'despesa', valor: '' });
  const [livroCaixa, setLivroCaixa] = useState([
    { id: 1, data: '2026-10-15', numDoc: 'NF-55890', participante: '12.345.678/0001-90', historico: 'Aquisição de sementes certificadas ref. safra soja', tipo: 'despesa', valor: 85000, status: 'validado' },
    { id: 2, data: '2026-10-20', numDoc: 'NF-11220', participante: '00.111.222/0001-33', historico: 'Manutenção periódica e peças colheitadeira', tipo: 'despesa', valor: 12500, status: 'validado' }
  ]);
  const [saldoBancario, setSaldoBancario] = useState(250000);

  const registrarLcdpr = () => {
    if (!lancamentoLcdpr.data || !lancamentoLcdpr.numDoc || !lancamentoLcdpr.participante || !lancamentoLcdpr.valor) {
      dispararToast('Preencha data, número do documento, participante e valor.', 'erro');
      return;
    }
    let erroFicticio = false;
    const hist = lancamentoLcdpr.historico.toLowerCase();
    if (hist.includes('escola') || hist.includes('viagem') || hist.includes('pessoal') || hist.includes('mercado casa')) {
      dispararToast('GLOSA FISCAL: Despesa pessoal não dedutível no LCDPR da atividade rural.', 'erro');
      erroFicticio = true;
    }
    const novoLanc = { ...lancamentoLcdpr, id: Date.now(), valor: Number(lancamentoLcdpr.valor), status: erroFicticio ? 'erro_malha' : 'validado' };
    if (!erroFicticio) setSaldoBancario(prev => lancamentoLcdpr.tipo === 'receita' ? prev + novoLanc.valor : prev - novoLanc.valor);
    
    setLivroCaixa([novoLanc, ...livroCaixa]);
    setLancamentoLcdpr({ data: '', numDoc: '', participante: '', historico: '', tipo: 'despesa', valor: '' });
    if (!erroFicticio) dispararToast('Lançamento registrado com sucesso no Bloco Q100!', 'sucesso');
  };

  // Passo 5: DP Rural e Funrural
  const [funcionario, setFuncionario] = useState({ salarioBruto: 2600 });
  const [opcaoFunrural, setOpcaoFunrural] = useState('comercializacao');
  const inssEmpregado = funcionario.salarioBruto * 0.09; 
  const fgtsMensal = funcionario.salarioBruto * 0.08;
  const inssPatronal = opcaoFunrural === 'folha' ? funcionario.salarioBruto * 0.227 : funcionario.salarioBruto * 0.027; 
  const salarioLiquido = funcionario.salarioBruto - inssEmpregado;
  const custoTotalEmpresa = funcionario.salarioBruto + fgtsMensal + inssPatronal;

  // Passo 6: NF e Reforma Tributária
  const [lancamentoFiscal, setLancamentoFiscal] = useState({ tipo: 'venda', valor: 100000, item: 'Soja em Grãos (Commodity)' });
  const [nfpEmissao, setNfpEmissao] = useState({ quantidade: 1000, valorUnitario: 135 });
  const totalNFP = nfpEmissao.quantidade * nfpEmissao.valorUnitario;
  const impostosNFP = lancamentoFiscal.tipo === 'venda' ? totalNFP * 0.106 : totalNFP * 0.265;
  const funruralNFP = lancamentoFiscal.tipo === 'venda' ? totalNFP * 0.015 : 0;

  // Teoria (12 Cards Estilizados)
  const teorias = [
    { titulo: 'O que é a Contabilidade Rural?', icon: '🌾', texto: 'Aplica a ciência contábil a empreendimentos agrícolas e pecuários. Seu núcleo é mensurar a transformação biológica natural de plantas e animais antes da venda física.' },
    { titulo: 'LCDPR vs Balanço Societário', icon: '⚖️', texto: 'O produtor rural Pessoa Física escritura o LCDPR em Regime de Caixa (data do desembolso). Empresas rurais (PJs) apuram Balanço e DRE em Regime de Competência.' },
    { titulo: 'Ativos Biológicos (CPC 29)', icon: '🌱', texto: 'Culturas no campo e rebanhos em crescimento devem ser avaliados ao Valor Justo menos despesas de venda, reconhecendo ganhos biológicos antes da colheita.' },
    { titulo: 'Plantas Portadoras (CPC 27)', icon: '🌳', texto: 'Cafezais, laranjais e seringueiras são ativos imobilizados de suporte. Não são reavaliados a valor justo, mas sofrem quotas periódicas de exaustão.' },
    { titulo: 'Produtos Colhidos (CPC 16)', icon: '📦', texto: 'Ao colher o grão ou abater o animal, o bem cessa a transformação biológica e converte-se em estoque de produto agrícola, congelando o custo a valor de mercado.' },
    { titulo: 'Investimento vs Custeio no Fisco', icon: '🚜', texto: 'Na PF (LCDPR), a compra de maquinário agrícola à vista abate 100% da base do IRPF no próprio ano. Na PJ rural, o bem vai ao Imobilizado e apenas a depreciação abate o lucro.' },
    { titulo: 'Arrendamento vs Parceria Rural', icon: '📜', texto: 'O Arrendamento é aluguel fixo (tributado como Carnê-Leão sem dedução ampla). A Parceria divide riscos de safra e clima, qualificando como Atividade Rural no LCDPR.' },
    { titulo: 'A Opção Anual do Funrural', icon: '📊', texto: 'Em janeiro, o produtor elege no evento S-1000 do eSocial o recolhimento sobre a folha (20%) ou sobre a venda da safra (1,5%). A escolha é irretratável para todo o ano.' },
    { titulo: 'O CAEPF e as Obrigações Trabalhistas', icon: '🆔', texto: 'Trabalhadores rurais devem ser registrados vinculados ao CAEPF da propriedade (S-2200), obedecendo às exigências de saúde e segurança do trabalho rural (NR-31).' },
    { titulo: 'ITR e Terra Nua (VTNT)', icon: '🗺️', texto: 'O Imposto Territorial Rural recai estritamente sobre a Terra Nua Tributável, excluindo áreas de preservação ambiental (APP e Reserva Legal) averbadas no CAR.' },
    { titulo: 'Rateio por Talhões e Centros de Custo', icon: '🎯', texto: 'Custos indiretos comuns (diesel, energia dos silos, tratoristas) devem ser rateados por hectare para determinar o Break-Even (Ponto de Equilíbrio) exato por saca.' },
    { titulo: 'Reforma Tributária (IBS e CBS no Agro)', icon: '🏛️', texto: 'Substitui PIS/COFINS e ICMS com desconto de 60% na alíquota padrão para alimentos e grãos in natura, garantindo apropriação integral de créditos na compra de insumos.' }
  ];

  // ==========================================
  // 3. PALETA DE CORES TERRA & DESIGN RESPONSIVO
  // ==========================================
  // Tons Terra: Terracota profundo, argila, marrom café, ouro velho e linho suave
  const terraEscuro = '#3d2010';      // Fundo topo / títulos fortes
  const terraMedio = '#78350f';       // Marrom terra
  const terracota = '#9a3412';        // Terracota vivo para destaques
  const ocre = '#b45309';             // Dourado terra
  const fundoLinho = '#faf6f0';       // Fundo geral bege terra suave
  const cardLinho = '#ffffff';        // Branco puro dos cards
  const bordaLinho = '#e7ded4';       // Borda suave tom de linho
  const textoPrincipal = '#27170c';   // Marrom quase preto para legibilidade total
  const textoSuave = '#6e5d50';       // Cinza terra para legendas

  // ESTILOS RESPONSIVOS (SEM NAVEGAÇÃO FIXA - ROLA NATURALMENTE COM A TELA)
  const navBtnStyle = (ativo) => ({
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: ativo ? terracota : '#4a2c1a',
    color: ativo ? '#ffffff' : '#e5d7cc',
    fontWeight: ativo ? '700' : '500',
    cursor: 'pointer',
    fontSize: '12.5px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    flex: '1 1 auto',
    textAlign: 'center'
  });

  const inputStyle = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: '8px',
    border: `1px solid ${bordaLinho}`,
    fontSize: '13.5px',
    marginTop: '5px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: textoPrincipal,
    outline: 'none',
    maxWidth: '100%'
  };

  const labelStyle = {
    fontWeight: '700',
    fontSize: '11.5px',
    color: textoSuave,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    display: 'block'
  };

  return (
    <div style={{ backgroundColor: fundoLinho, color: textoPrincipal, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* CABEÇALHO E MENU HORIZONTAL COM PALETA TERRA (NORMAL DOCUMENT FLOW - ROLA PRA CIMA NO CELULAR) */}
      <header style={{ backgroundColor: terraEscuro, color: '#ffffff', padding: '16px 14px', width: '100%', boxSizing: 'border-box', borderBottom: `3px solid ${terracota}` }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ backgroundColor: terracota, color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px' }}>
              AGRO • CONTABILIDADE RURAL
            </span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fef3c7', letterSpacing: '-0.3px' }}>
              🌾 Laboratório Prático do Agronegócio
            </h1>
          </div>

          {/* MENU HORIZONTAL RESPONSIVO - NÃO FIXO / ROLA JUNTO */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%', justifyContent: 'center' }} aria-label="Navegação do Módulo Rural">
            <button style={navBtnStyle(abaAtiva === 'onboarding' && !gerarRelatorio)} onClick={() => { setAbaAtiva('onboarding'); setGerarRelatorio(false); }}>1. Contrato & Checklist</button>
            <button style={navBtnStyle(abaAtiva === 'planocontas' && !gerarRelatorio)} onClick={() => { setAbaAtiva('planocontas'); setGerarRelatorio(false); }}>2. Plano de Contas</button>
            <button style={navBtnStyle(abaAtiva === 'lcdpr' && !gerarRelatorio)} onClick={() => { setAbaAtiva('lcdpr'); setGerarRelatorio(false); }}>3. LCDPR (Livro Caixa)</button>
            <button style={navBtnStyle(abaAtiva === 'dp' && !gerarRelatorio)} onClick={() => { setAbaAtiva('dp'); setGerarRelatorio(false); }}>4. Depto. Pessoal</button>
            <button style={navBtnStyle(abaAtiva === 'fiscal' && !gerarRelatorio)} onClick={() => { setAbaAtiva('fiscal'); setGerarRelatorio(false); }}>5. NF-e & Reforma</button>
            <button style={navBtnStyle(gerarRelatorio)} onClick={() => setGerarRelatorio(true)}>6. Balanço & Relatório</button>
            <button style={navBtnStyle(abaAtiva === 'teoria' && !gerarRelatorio)} onClick={() => { setAbaAtiva('teoria'); setGerarRelatorio(false); }}>7. Teoria Rural</button>
          </nav>

        </div>
      </header>

      {/* ÁREA DE TRABALHO RESPONSIVA (SEM TRANSBORDAMENTO LATERAL) */}
      <main style={{ flex: 1, padding: '16px 12px', maxWidth: '1300px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {!gerarRelatorio ? (
          <>
            {/* ========================================================= */}
            {/* PASSO 1 E 2: CONTRATO DE HONORÁRIOS E CHECKLIST           */}
            {/* ========================================================= */}
            {abaAtiva === 'onboarding' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                
                {/* CARD CONTRATO */}
                <div style={{ backgroundColor: cardLinho, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, boxShadow: '0 2px 5px rgba(61,32,16,0.04)', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ borderLeft: `4px solid ${terracota}`, paddingLeft: '10px', marginBottom: '14px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: terraEscuro }}>📄 Contrato de Prestação de Serviços Contábeis Rurais</h2>
                    <span style={{ fontSize: '12px', color: textoSuave }}>Formalização com cláusulas de responsabilidade fiscal e honorários para LCDPR e ITR</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', width: '100%' }}>
                    <div>
                      <label style={labelStyle}>Nome do Produtor ou Fazenda:</label>
                      <input type="text" style={inputStyle} placeholder="Ex: Fazenda Santa Maria" value={contratoHonorarios.nomeCliente} onChange={e => setContratoHonorarios({...contratoHonorarios, nomeCliente: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>CPF ou CNPJ:</label>
                      <input type="text" style={inputStyle} placeholder="000.000.000-00" value={contratoHonorarios.cpfCnpj} onChange={e => setContratoHonorarios({...contratoHonorarios, cpfCnpj: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Município / Local da Propriedade:</label>
                      <input type="text" style={inputStyle} placeholder="Ex: Sorriso - MT" value={contratoHonorarios.enderecoPropriedade} onChange={e => setContratoHonorarios({...contratoHonorarios, enderecoPropriedade: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Área Total Explorada (Hectares):</label>
                      <input type="text" style={inputStyle} placeholder="Ex: 850" value={contratoHonorarios.areaHectares} onChange={e => setContratoHonorarios({...contratoHonorarios, areaHectares: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Regime / Enquadramento:</label>
                      <select style={inputStyle} value={contratoHonorarios.tipoCliente} onChange={e => setContratoHonorarios({...contratoHonorarios, tipoCliente: e.target.value})}>
                        <option value="pf">Pessoa Física Rural (Livro Caixa / LCDPR)</option>
                        <option value="pj">Pessoa Jurídica (Holding Rural / Lucro Real ou Presumido)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Honorário Mensal Base (R$):</label>
                      <input type="number" style={inputStyle} value={contratoHonorarios.honorarioMensal} onChange={e => setContratoHonorarios({...contratoHonorarios, honorarioMensal: Number(e.target.value)})} />
                    </div>
                  </div>

                  <button 
                    onClick={gerarContratoPDF} 
                    style={{ marginTop: '16px', padding: '13px 18px', backgroundColor: terracota, color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', width: '100%', cursor: 'pointer', fontSize: '14px', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(154,52,18,0.2)' }}
                  >
                    🖨️ Baixar Minuta do Contrato (.txt pronto para impressão)
                  </button>
                </div>

                {/* CARD CHECKLIST */}
                <div style={{ backgroundColor: cardLinho, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, boxShadow: '0 2px 5px rgba(61,32,16,0.04)', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ borderLeft: `4px solid ${ocre}`, paddingLeft: '10px', marginBottom: '14px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: terraEscuro }}>📋 Checklist de Documentação e Malote Digital</h2>
                    <span style={{ fontSize: '12px', color: textoSuave }}>Controle rigoroso dos documentos obrigatórios para evitar rejeição no CAEPF e eSocial</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%' }}>
                    
                    {/* Bloco Inicial */}
                    <div style={{ backgroundColor: '#fdfbf9', padding: '12px', borderRadius: '8px', border: `1px solid ${bordaLinho}` }}>
                      <h3 style={{ color: terraMedio, margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', fontWeight: '800' }}>Cadastros & Fundiário</h3>
                      {checklist.filter(c => c.categoria === 'inicial').map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '9px', fontSize: '12.5px', cursor: 'pointer', lineHeight: '1.4' }}>
                          <input type="checkbox" checked={item.recebido} onChange={() => alternarChecklist(item.id)} style={{ marginTop: '2px', accentColor: terracota }} /> 
                          <span style={{ color: item.recebido ? '#15803d' : textoPrincipal, textDecoration: item.recebido ? 'line-through' : 'none' }}>{item.doc}</span>
                        </label>
                      ))}
                    </div>

                    {/* Bloco Operacional / Mensal */}
                    <div style={{ backgroundColor: '#fdfbf9', padding: '12px', borderRadius: '8px', border: `1px solid ${bordaLinho}` }}>
                      <h3 style={{ color: ocre, margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', fontWeight: '800' }}>Trabalhista & Movimento Mensal</h3>
                      {checklist.filter(c => c.categoria !== 'inicial').map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '9px', fontSize: '12.5px', cursor: 'pointer', lineHeight: '1.4' }}>
                          <input type="checkbox" checked={item.recebido} onChange={() => alternarChecklist(item.id)} style={{ marginTop: '2px', accentColor: terracota }} /> 
                          <span style={{ color: item.recebido ? '#15803d' : textoPrincipal, textDecoration: item.recebido ? 'line-through' : 'none' }}>{item.doc}</span>
                        </label>
                      ))}
                    </div>

                  </div>
                </div>

              </section>
            )}

            {/* ========================================================= */}
            {/* PASSO 3: PLANO DE CONTAS (12 CARDS RESPONSIVOS)           */}
            {/* ========================================================= */}
            {abaAtiva === 'planocontas' && (
              <section style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: terraEscuro, margin: '0 0 6px 0' }}>Plano de Contas Agropecuário Estruturado</h2>
                  <p style={{ fontSize: '13px', color: textoSuave, margin: 0 }}>Classificação analítica específica para atividades agrícolas e pecuárias (CPC 29, CPC 27 e CPC 16)</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                  {planoDeContas.map((conta, idx) => (
                    <article key={idx} style={{ backgroundColor: cardLinho, borderRadius: '12px', border: `1px solid ${bordaLinho}`, borderTop: `5px solid ${conta.cor}`, padding: '14px', boxShadow: '0 2px 4px rgba(61,32,16,0.04)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '22px' }}>{conta.icon}</span>
                        <span style={{ backgroundColor: '#f5eee6', color: conta.cor, padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px' }}>{conta.tipo}</span>
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: terraEscuro, fontWeight: '800', fontFamily: 'monospace' }}>{conta.cod}</h3>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: textoPrincipal, fontWeight: '700' }}>{conta.nome}</h4>
                      <p style={{ margin: '0', fontSize: '12px', color: textoSuave, lineHeight: '1.5' }}>{conta.expl}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* PASSO 4: LCDPR (LIVRO CAIXA DIGITAL)                      */}
            {/* ========================================================= */}
            {abaAtiva === 'lcdpr' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                
                <div style={{ backgroundColor: cardLinho, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ borderLeft: `4px solid ${terracota}`, paddingLeft: '10px', marginBottom: '14px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: terraEscuro }}>💻 Escrituração do Livro Caixa Digital do Produtor Rural</h2>
                    <span style={{ fontSize: '12px', color: textoSuave }}>Regime de Caixa Estrito (IN RFB 1.848/2018) com cruzamento bancário via CAEPF</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', width: '100%' }}>
                    <div>
                      <label style={labelStyle}>Data do Pagamento:</label>
                      <input type="date" style={inputStyle} value={lancamentoLcdpr.data} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, data: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nº do Documento / NFe:</label>
                      <input type="text" style={inputStyle} placeholder="Ex: NF-7894" value={lancamentoLcdpr.numDoc} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, numDoc: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>CPF/CNPJ Participante:</label>
                      <input type="text" style={inputStyle} placeholder="Apenas números" value={lancamentoLcdpr.participante} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, participante: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo de Operação:</label>
                      <select style={inputStyle} value={lancamentoLcdpr.tipo} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, tipo: e.target.value})}>
                        <option value="despesa">Saída (Despesa de Custeio / Investimento)</option>
                        <option value="receita">Entrada (Receita de Venda de Produção)</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Histórico Padronizado e Rastreável:</label>
                      <input type="text" style={inputStyle} placeholder="Ex: Pagamento referente aquisição de adubo formulado NPK ref. NF 7894" value={lancamentoLcdpr.historico} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, historico: e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor Bruto (R$):</label>
                      <input type="number" style={inputStyle} placeholder="0,00" value={lancamentoLcdpr.valor} onChange={e => setLancamentoLcdpr({...lancamentoLcdpr, valor: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button onClick={registrarLcdpr} style={{ backgroundColor: terracota, color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', width: '100%', fontSize: '13px' }}>
                        Gravar no Registro Q100
                      </button>
                    </div>
                  </div>
                </div>

                {/* TABELA DE REGISTROS COM WRAPPER DE ROLAGEM HORIZONTAL */}
                <div style={{ backgroundColor: cardLinho, padding: '16px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: terraEscuro, fontWeight: '800' }}>Demonstrativo de Lançamentos (Bloco Q100)</h3>
                    <div style={{ backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fde68a', color: terraMedio, fontWeight: '800', fontSize: '13px' }}>
                      Saldo Vinculado CAEPF: {formatMoeda(saldoBancario)}
                    </div>
                  </div>

                  <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fbf7f4', borderBottom: `2px solid ${bordaLinho}` }}>
                          <th style={{ padding: '10px 8px', color: terraEscuro }}>Data</th>
                          <th style={{ padding: '10px 8px', color: terraEscuro }}>Doc</th>
                          <th style={{ padding: '10px 8px', color: terraEscuro }}>Histórico</th>
                          <th style={{ padding: '10px 8px', color: terraEscuro }}>Valor</th>
                          <th style={{ padding: '10px 8px', color: terraEscuro }}>Auditoria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {livroCaixa.map(l => (
                          <tr key={l.id} style={{ borderBottom: `1px solid ${bordaLinho}` }}>
                            <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{l.data}</td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: 'bold' }}>{l.numDoc}</td>
                            <td style={{ padding: '10px 8px' }}>{l.historico}</td>
                            <td style={{ padding: '10px 8px', color: l.tipo === 'receita' ? '#15803d' : '#b91c1c', fontWeight: '800', whiteSpace: 'nowrap' }}>
                              {l.tipo === 'receita' ? '+' : '-'}{formatMoeda(l.valor)}
                            </td>
                            <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                              {l.status === 'validado' ? (
                                <span style={{ color: '#15803d', fontWeight: '700', backgroundColor: '#dcfce7', padding: '3px 7px', borderRadius: '4px', fontSize: '11px' }}>Válido</span>
                              ) : (
                                <span style={{ color: '#b91c1c', fontWeight: '700', backgroundColor: '#fee2e2', padding: '3px 7px', borderRadius: '4px', fontSize: '11px' }}>Glosa</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </section>
            )}

            {/* ========================================================= */}
            {/* PASSO 5: DP RURAL E FUNRURAL                              */}
            {/* ========================================================= */}
            {abaAtiva === 'dp' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ backgroundColor: cardLinho, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, width: '100%', boxSizing: 'border-box' }}>
                  
                  <div style={{ borderLeft: `4px solid ${terracota}`, paddingLeft: '10px', marginBottom: '14px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: terraEscuro }}>👥 Folha de Pagamento Rural & eSocial</h2>
                    <span style={{ fontSize: '12px', color: textoSuave }}>Simulação de holerite com desconto do trabalhador e encargos patronais (S-1000)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px', width: '100%' }}>
                    <div>
                      <label style={labelStyle}>Salário Base Contratual (R$):</label>
                      <input type="number" style={inputStyle} value={funcionario.salarioBruto} onChange={e => setFuncionario({...funcionario, salarioBruto: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Opção Funrural (Evento S-1000):</label>
                      <select style={inputStyle} value={opcaoFunrural} onChange={e => setOpcaoFunrural(e.target.value)}>
                        <option value="comercializacao">Sobre a Comercialização (Isenta os 20% patronais)</option>
                        <option value="folha">Sobre a Folha de Salários (Recolhe 20% patronal)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%' }}>
                    
                    {/* Lado Funcionário */}
                    <div style={{ backgroundColor: '#fcfaf8', padding: '16px', borderRadius: '10px', border: `1px solid ${bordaLinho}` }}>
                      <h3 style={{ margin: '0 0 12px 0', color: terraEscuro, fontSize: '14px', fontWeight: '800' }}>Holerite do Trabalhador</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Salário Bruto:</span><strong>{formatMoeda(funcionario.salarioBruto)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#b91c1c', marginBottom: '12px' }}>
                        <span>(-) INSS Retido (aprox. 9%):</span><strong>{formatMoeda(inssEmpregado)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: `2px solid ${bordaLinho}`, paddingTop: '10px', color: '#15803d' }}>
                        <span>Líquido a Pagar (Conta Salário):</span><span>{formatMoeda(salarioLiquido)}</span>
                      </div>
                    </div>

                    {/* Lado Empregador */}
                    <div style={{ backgroundColor: '#fcfaf8', padding: '16px', borderRadius: '10px', border: `1px solid ${bordaLinho}` }}>
                      <h3 style={{ margin: '0 0 12px 0', color: terraMedio, fontSize: '14px', fontWeight: '800' }}>Custo Total para a Fazenda</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Salário Bruto:</span><strong>{formatMoeda(funcionario.salarioBruto)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>(+) FGTS Depósito (8%):</span><strong>{formatMoeda(fgtsMensal)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: ocre, marginBottom: '12px' }}>
                        <span>(+) Encargo Patronal (INSS/RAT/Senar):</span><strong>{formatMoeda(inssPatronal)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: `2px solid ${bordaLinho}`, paddingTop: '10px', color: terraEscuro }}>
                        <span>Custo Efetivo Mensal:</span><span>{formatMoeda(custoTotalEmpresa)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* PASSO 6: FISCAL E REFORMA TRIBUTÁRIA                      */}
            {/* ========================================================= */}
            {abaAtiva === 'fiscal' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ backgroundColor: cardLinho, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, width: '100%', boxSizing: 'border-box' }}>
                  
                  <div style={{ borderLeft: `4px solid ${terracota}`, paddingLeft: '10px', marginBottom: '14px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: terraEscuro }}>🧾 Emissão NFP-e e Reforma Tributária (IBS e CBS)</h2>
                    <span style={{ fontSize: '12px', color: textoSuave }}>Simulador de venda com alíquota reduzida de 60% e aproveitamento de créditos na compra de insumos</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%' }}>
                    <div>
                      <label style={labelStyle}>Tipo de Operação:</label>
                      <select style={inputStyle} value={lancamentoFiscal.tipo} onChange={e => setLancamentoFiscal({...lancamentoFiscal, tipo: e.target.value})}>
                        <option value="venda">Venda de Produção (Alíquota Reduzida 60%)</option>
                        <option value="compra_insumo">Compra de Insumos Industriais (Crédito Integral)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Quantidade Comercializada:</label>
                      <input type="number" style={inputStyle} value={nfpEmissao.quantidade} onChange={e => setNfpEmissao({...nfpEmissao, quantidade: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Valor Unitário (R$):</label>
                      <input type="number" style={inputStyle} value={nfpEmissao.valorUnitario} onChange={e => setNfpEmissao({...nfpEmissao, valorUnitario: Number(e.target.value)})} />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: lancamentoFiscal.tipo === 'venda' ? '#fdfbf7' : '#f0fdf4', borderRadius: '10px', border: `1px solid ${bordaLinho}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: textoSuave }}>Total da Nota Fiscal:</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: terraEscuro }}>{formatMoeda(totalNFP)}</span>
                    </div>

                    {lancamentoFiscal.tipo === 'venda' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `1px solid ${bordaLinho}`, paddingTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: terracota, fontWeight: '700' }}>
                          <span>IBS + CBS Reduzido (60% de desconto ~ 10,6%):</span>
                          <span>{formatMoeda(impostosNFP)} (A Recolher)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: ocre, fontWeight: '700' }}>
                          <span>Retenção Funrural PF (1,5%):</span>
                          <span>{formatMoeda(funruralNFP)} (Retido pela Indústria/Trading)</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ borderTop: `1px solid ${bordaLinho}`, paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#15803d', fontWeight: '800' }}>
                        <span>Crédito Tributário IBS/CBS a Compensar (26,5%):</span>
                        <span>{formatMoeda(impostosNFP)} (Ativo Recuperável)</span>
                      </div>
                    )}
                  </div>

                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* ABA 7: TEORIA RURAL EM 12 CARDS RESPONSIVOS               */}
            {/* ========================================================= */}
            {abaAtiva === 'teoria' && (
              <section style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: terraEscuro, margin: '0 0 6px 0' }}>Fundamentos e Prática da Contabilidade do Agro</h2>
                  <p style={{ fontSize: '13px', color: textoSuave, margin: 0 }}>Guia rápido de conceitos contábeis, tributários e societários aplicáveis ao campo</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                  {teorias.map((t, idx) => (
                    <article key={idx} style={{ backgroundColor: cardLinho, padding: '16px', borderRadius: '12px', border: `1px solid ${bordaLinho}`, boxShadow: '0 2px 4px rgba(61,32,16,0.04)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                      <div style={{ fontSize: '26px', marginBottom: '8px' }}>{t.icon}</div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '14.5px', color: terraEscuro, fontWeight: '800' }}>{t.titulo}</h3>
                      <p style={{ margin: 0, fontSize: '12.5px', color: textoSuave, lineHeight: '1.6' }}>{t.texto}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

          </>
        ) : (
         
          <section style={{ backgroundColor: '#ffffff', padding: '20px 16px', borderRadius: '14px', color: '#1c1917', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 10px rgba(61,32,16,0.08)', width: '100%', boxSizing: 'border-box' }}>
            
            <div style={{ borderBottom: `3px solid ${terracota}`, paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: terraEscuro }}>RELATÓRIO CONTÁBIL & GERENCIAL RURAL</h2>
                <div style={{ fontSize: '12.5px', color: textoSuave }}>
                  Cliente: <strong>{contratoHonorarios.nomeCliente || 'Produtor Rural Modelo'}</strong> | Imóvel: <strong>{contratoHonorarios.enderecoPropriedade || 'Gleba Rural'}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: textoSuave }}>
                Exercício: 2026/2027<br/>
                Status: Auditado
              </div>
            </div>

            {/* Balanço Patrimonial */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ backgroundColor: '#fcf8f5', padding: '8px 12px', borderRadius: '6px', color: terraEscuro, fontSize: '14px', margin: '0 0 12px 0', borderLeft: `4px solid ${terracota}`, fontWeight: '800' }}>
                1. Balanço Patrimonial Consolidado
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px' }}>
                <div style={{ border: `1px solid ${bordaLinho}`, padding: '12px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', borderBottom: `1px solid ${bordaLinho}`, paddingBottom: '4px', fontSize: '13.5px', color: terraMedio }}>ATIVO</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Caixa e Bancos:</span><span>R$ 250.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Ativos Biológicos:</span><span>R$ 1.850.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Terras e Máquinas:</span><span>R$ 6.500.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '8px', borderTop: `1px solid ${bordaLinho}`, paddingTop: '6px', color: terraEscuro }}>
                    <span>TOTAL ATIVO:</span><span>R$ 8.600.000,00</span>
                  </div>
                </div>

                <div style={{ border: `1px solid ${bordaLinho}`, padding: '12px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', borderBottom: `1px solid ${bordaLinho}`, paddingBottom: '4px', fontSize: '13.5px', color: terraMedio }}>PASSIVO & PATRIMÔNIO LÍQUIDO</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Custeio Safra (Curto Pz):</span><span>R$ 800.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Financiamentos (Longo Pz):</span><span>R$ 1.200.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Patrimônio Líquido:</span><span>R$ 6.600.000,00</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '8px', borderTop: `1px solid ${bordaLinho}`, paddingTop: '6px', color: ocre }}>
                    <span>TOTAL PASSIVO E PL:</span><span>R$ 8.600.000,00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DRE */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ backgroundColor: '#fcf8f5', padding: '8px 12px', borderRadius: '6px', color: terraEscuro, fontSize: '14px', margin: '0 0 12px 0', borderLeft: `4px solid ${ocre}`, fontWeight: '800' }}>
                2. Demonstração do Resultado do Exercício (DRE)
              </h3>
              
              <div style={{ backgroundColor: '#fcfaf8', padding: '14px', borderRadius: '8px', border: `1px solid ${bordaLinho}`, fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Receita Bruta da Safra:</span><strong>R$ 4.500.000,00</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#b91c1c' }}><span>(-) Custo dos Produtos Vendidos:</span><span>(R$ 2.600.000,00)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#15803d', fontWeight: '700' }}><span>(+) Variação Positiva Valor Justo (CPC 29):</span><span>+ R$ 650.000,00</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#b91c1c' }}><span>(-) Despesas Administrativas e Tributárias:</span><span>(R$ 550.000,00)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', marginTop: '10px', borderTop: `2px solid ${bordaLinho}`, paddingTop: '8px', fontSize: '15px', color: '#15803d' }}>
                  <span>RESULTADO LÍQUIDO DO EXERCÍCIO:</span><span>R$ 2.000.000,00</span>
                </div>
              </div>
            </div>

            {/* Parecer do Consultor */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '6px', color: '#78350f', fontSize: '14px', margin: '0 0 10px 0', borderLeft: `4px solid ${ocre}`, fontWeight: '800' }}>
                3. Parecer Técnico de Gestão e Governança Rural
              </h3>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: textoPrincipal, margin: 0, textAlign: 'justify' }}>
                O resultado demonstra solidez operacional impulsionada pela valorização biológica das lavouras. Para otimização de caixa no próximo exercício, recomendamos a segregação contábil por <strong>Centro de Custos por Talhão</strong>, permitindo apontar o custo exato da saca colhida contra os preços futuros da B3. No âmbito tributário, manter a conformidade do LCDPR com conciliação rigorosa de extratos vinculados ao CAEPF para blindagem contra a malha fina da Receita Federal.
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setGerarRelatorio(false)} 
                style={{ padding: '10px 24px', backgroundColor: terracota, color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
              >
                🔙 Voltar ao Painel
              </button>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}