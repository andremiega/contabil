// ServicosIniciais.jsx - Hub Avançado e Responsivo com Playbooks Completos
import React, { useState } from 'react';

export default function ServicosIniciais() {
  const [abaAtiva, setAbaAtiva] = useState('consultoria'); 

  // ==========================================
  // ESTADOS
  // ==========================================
  const [tipoAtividadeMei, setTipoAtividadeMei] = useState('comercio');
  const [faturamentoMensal, setFaturamentoMensal] = useState('12000'); 
  const [custosFixos, setCustosFixos] = useState('3000');
  const [custosVariaveisPerc, setCustosVariaveisPerc] = useState('20');
  
  const [perfilMei, setPerfilMei] = useState('comum'); 
  const [qtdFuncionarios, setQtdFuncionarios] = useState('2');
  const [salarioFuncionario, setSalarioFuncionario] = useState('1412');

  const [clientes, setClientes] = useState(() => {
    try {
      const salvo = localStorage.getItem('crm_servicos_iniciais');
      return salvo ? JSON.parse(salvo) : [];
    } catch { return []; }
  });

  const [novoCliente, setNovoCliente] = useState({ nome: '', servico: 'Consultoria Financeira', contato: '' });

  const adicionarCliente = (e) => {
    e.preventDefault();
    if (!novoCliente.nome.trim()) return;
    const atualizados = [...clientes, { id: Date.now(), ...novoCliente, status: 'Em Prospecção' }];
    setClientes(atualizados);
    localStorage.setItem('crm_servicos_iniciais', JSON.stringify(atualizados));
    setNovoCliente({ nome: '', servico: 'Consultoria Financeira', contato: '' });
  };

  // ==========================================
  // CÁLCULOS FINANCEIROS MENSAIS E ANUAIS
  // ==========================================
  const calcularDAS = () => {
    if (perfilMei === 'caminhoneiro') return 175.32; 
    let base = 71.00; 
    if (tipoAtividadeMei === 'comercio') base += 1.00; 
    if (tipoAtividadeMei === 'servicos') base += 5.00; 
    if (tipoAtividadeMei === 'mista') base += 6.00; 
    return base;
  };

  const fat = Number(faturamentoMensal) || 0;
  const fixos = Number(custosFixos) || 0;
  const varPerc = Number(custosVariaveisPerc) || 0;
  const salFunc = Number(salarioFuncionario) || 0;
  const qtd = Number(qtdFuncionarios) || 0;

  // CÁLCULOS MENSAIS
  const custoFuncionarioMensal = salFunc > 0 ? (salFunc * 1.30) * qtd : 0; 
  const valorDas = calcularDAS();
  const valorCustosVariaveis = (fat * varPerc) / 100;
  const lucroOperacionalMensal = fat - fixos - valorCustosVariaveis - custoFuncionarioMensal - valorDas;
  const margemLucro = fat > 0 ? ((lucroOperacionalMensal / fat) * 100) : 0;
  
  // CÁLCULOS ANUAIS 
  const receitaAnual = fat * 12;
  const dasAnual = valorDas * 12;
  const salarioBaseAnual = salFunc * 12 * qtd;
  const decimoTerceiro = salFunc * 1 * qtd;
  const tercoFerias = (salFunc / 3) * qtd;
  const baseCalculoEncargos = salarioBaseAnual + decimoTerceiro + tercoFerias;
  const fgtsAnual = baseCalculoEncargos * 0.08;
  const inssPatronalAnual = baseCalculoEncargos * 0.03; 

  const custoTotalFuncionarioAnual = baseCalculoEncargos + fgtsAnual + inssPatronalAnual;
  const despesasFixasAnuais = fixos * 12;
  const despesasVariaveisAnuais = valorCustosVariaveis * 12;
  const lucroAnualLiquido = receitaAnual - despesasFixasAnuais - despesasVariaveisAnuais - dasAnual - custoTotalFuncionarioAnual;

  const imprimirRelatorio = () => window.print();

  return (
    <div className="hub-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
      
      <style>{`
        .grid-responsive { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .grid-responsive-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .grid-crm { display: grid; grid-template-columns: 350px 1fr; gap: 24px; }
        @media (max-width: 1024px) {
          .grid-responsive { grid-template-columns: repeat(2, 1fr); }
          .grid-crm { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr; }
          .grid-responsive-2 { grid-template-columns: 1fr; }
        }
        @media print {
          .no-print { display: none !important; }
          .hub-container { border: none; box-shadow: none; overflow: visible; height: auto; }
          body { background-color: white; }
        }
      `}</style>

      {/* CABEÇALHO */}
      <div className="no-print" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '36px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>💼</div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '24px', letterSpacing: '-0.5px' }}>BPO & Consultoria Start</div>
            <div style={{ fontSize: '14px', color: '#a5b4fc', marginTop: '4px', maxWidth: '700px', lineHeight: '1.5' }}>
              Simuladores de rentabilidade mensal, impacto anual da folha de pagamento e Manuais Legais.
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'consultoria', label: '📊 Diagnóstico & DRE' },
            { id: 'mei', label: '🛠️ Legalização MEI' },
            { id: 'irpf', label: '📋 Malha Fina & IRPF' },
            { id: 'captacao', label: '📇 CRM (Clientes)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: abaAtiva === tab.id ? '1px solid #818cf8' : '1px solid transparent',
                cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                backgroundColor: abaAtiva === tab.id ? 'rgba(79, 70, 229, 0.4)' : 'rgba(255,255,255,0.05)',
                color: abaAtiva === tab.id ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s', backdropFilter: 'blur(4px)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        
        {/* ================= ABA 1: CONSULTORIA (Mantida igual à versão anterior) ================= */}
        {abaAtiva === 'consultoria' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* CALCULADORA */}
            <div className="no-print" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>Dados Financeiros do Cliente</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Insira os dados mensais para gerar os impactos.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Perfil:</label>
                  <select value={perfilMei} onChange={(e) => setPerfilMei(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}>
                    <option value="comum">MEI Comum</option>
                    <option value="uber">Motorista App</option>
                    <option value="caminhoneiro">Caminhoneiro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Faturamento (R$)</label>
                  <input type="number" value={faturamentoMensal} onChange={(e) => setFaturamentoMensal(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Fixos (R$)</label>
                  <input type="number" value={custosFixos} onChange={(e) => setCustosFixos(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Variáveis (%)</label>
                  <input type="number" value={custosVariaveisPerc} onChange={(e) => setCustosVariaveisPerc(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '8px' }}>Nº Funcionários</label>
                  <select value={qtdFuncionarios} onChange={(e) => setQtdFuncionarios(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #a5b4fc', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#eef2ff' }}>
                    <option value="0">Nenhum</option>
                    <option value="1">1 Func.</option>
                    <option value="2">2 Func.</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', display: 'block', marginBottom: '8px' }}>Salário Base (R$)</label>
                  <input type="number" value={salarioFuncionario} onChange={(e) => setSalarioFuncionario(e.target.value)} disabled={qtd === 0} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: qtd === 0 ? '1px solid #cbd5e1' : '1px solid #a5b4fc', fontSize: '14px', boxSizing: 'border-box', backgroundColor: qtd === 0 ? '#f1f5f9' : '#eef2ff' }} />
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={imprimirRelatorio} style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                🖨️ Imprimir Diagnóstico Financeiro
              </button>
            </div>

            {/* RELATÓRIO MENSAL E ANUAL */}
            <div className="print-area">
              <h2 className="print-only" style={{ display: 'none', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                Relatório de Viabilidade e Impacto Financeiro
              </h2>
              
              <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>1. Diagnóstico Mensal</h3>
              <div className="grid-responsive">
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Lucro Líquido</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: lucroOperacionalMensal >= 0 ? '#10b981' : '#ef4444', marginTop: '8px' }}>R$ {lucroOperacionalMensal.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>Margem: {margemLucro.toFixed(1)}%</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #4f46e5' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Custo da Folha Mensal</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#4f46e5', marginTop: '8px' }}>R$ {custoFuncionarioMensal.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>Estimativa c/ encargos</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>DAS (Imposto)</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b', marginTop: '8px' }}>R$ {valorDas.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>Fixo mensal</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #0f172a' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Despesas Totais</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>R$ {(fixos + valorCustosVariaveis + custoFuncionarioMensal + valorDas).toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>Soma de todas as saídas</div>
                </div>
              </div>

              <h3 style={{ margin: '32px 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>2. Impacto Anual no Caixa (Projeção 12 Meses)</h3>
              <div className="grid-responsive-2">
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#4f46e5', fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Custo Anual da Folha ({qtd} Funcionários)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Salários (12 meses):</span><span style={{ fontWeight: '700' }}>R$ {salarioBaseAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>13º Salário:</span><span style={{ fontWeight: '700' }}>R$ {decimoTerceiro.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>1/3 de Férias:</span><span style={{ fontWeight: '700' }}>R$ {tercoFerias.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>FGTS Anual (8%):</span><span style={{ fontWeight: '700' }}>R$ {fgtsAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>INSS Patronal MEI (3%):</span><span style={{ fontWeight: '700' }}>R$ {inssPatronalAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#0f172a', fontWeight: '900', marginTop: '12px', borderTop: '2px solid #e2e8f0', paddingTop: '12px' }}><span>Custo Total com Colaboradores:</span><span style={{ color: '#ef4444' }}>R$ {custoTotalFuncionarioAnual.toFixed(2)}</span></div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#10b981', fontSize: '16px', fontWeight: '800', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Resultado Consolidado Anual
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Faturamento Total Bruto:</span><span style={{ fontWeight: '700', color: '#10b981' }}>+ R$ {receitaAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Despesas Fixas:</span><span style={{ fontWeight: '700', color: '#ef4444' }}>- R$ {despesasFixasAnuais.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Custos Variáveis:</span><span style={{ fontWeight: '700', color: '#ef4444' }}>- R$ {despesasVariaveisAnuais.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Impostos DAS Anual:</span><span style={{ fontWeight: '700', color: '#ef4444' }}>- R$ {dasAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}><span>Custo Folha de Pagamento:</span><span style={{ fontWeight: '700', color: '#ef4444' }}>- R$ {custoTotalFuncionarioAnual.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: '#0f172a', fontWeight: '900', marginTop: '12px', borderTop: '2px solid #e2e8f0', paddingTop: '12px' }}><span>Lucro Líquido Retido (Ano):</span><span style={{ color: lucroAnualLiquido >= 0 ? '#10b981' : '#ef4444' }}>R$ {lucroAnualLiquido.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 2: LEGALIZAÇÃO MEI (AGORA COM 4 BLOCOS) ================= */}
        {abaAtiva === 'mei' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>Playbook MEI: Abertura, Limites e Obrigações</h3>
              
              <div className="grid-responsive-2">
                
                {/* BLOCO 1: Limites 2027/2028 */}
                <div style={{ backgroundColor: '#fff7ed', padding: '24px', borderRadius: '16px', border: '1px solid #fed7aa' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#c2410c', fontSize: '16px', fontWeight: '800' }}>📈 O Novo Teto de Faturamento</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#9a3412', lineHeight: '1.6' }}>
                    A transição do limite do MEI é progressiva:<br/><br/>
                    • <strong>2027:</strong> Teto sobe para <strong>R$ 110.000,00</strong> anuais.<br/>
                    • <strong>2028 em diante:</strong> Teto passa a <strong>R$ 140.000,00</strong> anuais.<br/><br/>
                    <strong>⚠️ A Regra dos 20%:</strong> Se faturar até 20% acima do teto, vira ME em janeiro e paga DAS complementar. Se o excesso for MAIOR que 20%, o fisco cobra impostos retroativos a Janeiro. Desenquadre o cliente antes disso acontecer!
                  </p>
                </div>

                {/* BLOCO 2: Como Contratar */}
                <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#15803d', fontSize: '16px', fontWeight: '800' }}>🤝 Como Contratar Funcionários</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: '1.6' }}>
                    Com a permissão para 2 empregados, o processo é:<br/><br/>
                    <strong>1. Exames e Docs:</strong> ASO admissional, RG, CPF, título de eleitor, e PIS.<br/>
                    <strong>2. eSocial Simplificado:</strong> O cliente entra no Gov.br, acede ao eSocial MEI e regista a admissão. A CTPS Digital atualiza na hora.<br/>
                    <strong>3. Rotina Mensal:</strong> Gerar o DAE (INSS 3% Patronal + FGTS 8%) e o recibo de pagamento do funcionário.
                  </p>
                </div>

                {/* NOVO BLOCO 3: Passo a Passo Abertura */}
                <div style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '16px', fontWeight: '800' }}>📝 Como Abrir o CNPJ & Obrigação Anual</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#075985', lineHeight: '1.6' }}>
                    <strong>Abertura (Totalmente Gratuita):</strong><br/>
                    1. Entrar no site oficial <em>Gov.br / Portal do Empreendedor</em> (Atenção a sites falsos que cobram taxas).<br/>
                    2. Ter selo Prata ou Ouro no Gov.br.<br/>
                    3. Preencher os dados e o Certificado (CCMEI) sai na hora.<br/><br/>
                    <strong>DASN-SIMEI (Obrigação):</strong> Todo ano, até 31 de maio, o MEI deve entregar a declaração informando o Faturamento Bruto do ano anterior. Mesmo se faturou R$ 0,00, a entrega é obrigatória.
                  </p>
                </div>

                {/* NOVO BLOCO 4: Notas e CNAEs */}
                <div style={{ backgroundColor: '#f5f3ff', padding: '24px', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#6d28d9', fontSize: '16px', fontWeight: '800' }}>🧾 Emissão de Notas Fiscais e CNAEs</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#5b21b6', lineHeight: '1.6' }}>
                    <strong>A Regra da Nota:</strong> MEI só é obrigado a emitir Nota Fiscal se vender ou prestar serviço para outra empresa (CNPJ). Para Pessoas Físicas (CPF), é opcional.<br/><br/>
                    <strong>Como Emitir:</strong><br/>
                    • <em>Serviços (ISS):</em> Obrigatoriamente no <strong>Emissor Nacional (gov.br)</strong>. Não usa mais o site da prefeitura.<br/>
                    • <em>Comércio (ICMS):</em> Precisa de Inscrição Estadual e emite a NF-e no portal da SEFAZ estadual.<br/>
                    * A atividade principal (CNAE) define os impostos do DAS.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: IRPF (AGORA COM 4 BLOCOS) ================= */}
        {abaAtiva === 'irpf' && (
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: '900' }}>Dossiê IRPF: Como Fazer e Prevenir a Malha Fina</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', fontWeight: '500' }}>
              Guia definitivo para auxiliar pessoas físicas na declaração do Imposto de Renda.
            </p>
            
            <div className="grid-responsive-2">
              
              {/* BLOCO 1: Limites */}
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '15px', fontWeight: '800' }}>💰 Limites de Deduções</h4>
                <ul style={{ fontSize: '14px', color: '#334155', paddingLeft: '16px', lineHeight: '1.8', margin: 0 }}>
                  <li><strong>Saúde:</strong> Sem limite (100% dedutível). Exige recibo com CPF/CNPJ.</li>
                  <li><strong>Educação:</strong> Limite global anual de aprox. R$ 3.561,50 por dependente. (Só escolas/faculdades).</li>
                  <li><strong>Dependentes:</strong> Dedução de aprox. R$ 2.275,08 por ano.</li>
                </ul>
              </div>

              {/* BLOCO 2: Malha Fina */}
              <div style={{ backgroundColor: '#fff1f2', padding: '24px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#9f1239', fontSize: '15px', fontWeight: '800' }}>🎯 Gatilhos de Malha Fina</h4>
                <ul style={{ fontSize: '14px', color: '#881337', paddingLeft: '16px', lineHeight: '1.8', margin: 0 }}>
                  <li>Omissão de rendimentos de dependentes (Ex: estágio do filho).</li>
                  <li>Inconsistência médica: O cliente declara a despesa, mas a clínica não envia a DMED à Receita.</li>
                  <li>Comprar bens de alto valor sem declarar a origem compatível do dinheiro.</li>
                </ul>
              </div>

              {/* NOVO BLOCO 3: Como Fazer a Declaração */}
              <div style={{ backgroundColor: '#ecfdf5', padding: '24px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#047857', fontSize: '15px', fontWeight: '800' }}>💻 Como Fazer a Declaração (Prática)</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#065f46', lineHeight: '1.6' }}>
                  <strong>A Melhor Estratégia:</strong> Utilize a <em>Declaração Pré-Preenchida</em>. <br/><br/>
                  1. O cliente fornece a senha Gov.br (Ouro/Prata) ou passa uma procuração digital no e-CAC para si.<br/>
                  2. Ao abrir o programa (ou e-CAC), importe os dados. A Receita já puxa as contas bancárias, imóveis, empresas (informes de rendimentos) e planos de saúde (DMED).<br/>
                  3. O seu trabalho como consultor é <strong>cruzar e auditar</strong> esses dados com os recibos físicos do cliente e escolher o melhor modelo: <em>Desconto Simplificado (20%)</em> ou <em>Deduções Legais (Completa)</em>.
                </p>
              </div>

              {/* NOVO BLOCO 4: Regras de Obrigatoriedade */}
              <div style={{ backgroundColor: '#fffbeb', padding: '24px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#b45309', fontSize: '15px', fontWeight: '800' }}>⚖️ Quem é Obrigado a Declarar?</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
                  Geralmente, deve declarar quem, no ano anterior:<br/><br/>
                  • Recebeu <strong>rendimentos tributáveis</strong> (salários, aluguéis) acima do limite estipulado pela Receita (aprox. R$ 30.639,90).<br/>
                  • Recebeu rendimentos isentos (FGTS, indenizações, heranças) acima de R$ 200.000,00.<br/>
                  • Obteve lucro (ganho de capital) na venda de bens ou direitos.<br/>
                  • Possui patrimônio (imóveis, terrenos, veículos) superior a R$ 800.000,00.<br/>
                  • Operou em bolsas de valores e obteve lucro sujeito a imposto.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ================= ABA 4: CAPTAÇÃO / CRM ================= */}
        {abaAtiva === 'captacao' && (
          <div className="grid-crm">
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>Novo Prospect</h3>
              <form onSubmit={adicionarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Nome / Empresa</label>
                  <input type="text" placeholder="Ex: Lucas Pneus" value={novoCliente.nome} onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Serviço Ofertado</label>
                  <select value={novoCliente.servico} onChange={(e) => setNovoCliente({...novoCliente, servico: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option>Consultoria Financeira</option>
                    <option>Abertura / Legalização MEI</option>
                    <option>Declaração de IRPF</option>
                  </select>
                </div>
                <button type="submit" style={{ padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>
                  + Adicionar Cliente
                </button>
              </form>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Cliente</th>
                    <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Serviço</th>
                    <th style={{ padding: '16px', color: '#475569', fontWeight: '700' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#0f172a' }}>{c.nome}</td>
                      <td style={{ padding: '16px', color: '#475569', fontWeight: '500' }}>{c.servico}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Nenhum prospect. Adicione ao lado para treinar!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}