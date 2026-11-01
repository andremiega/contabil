import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function SimuladorDireitoEmpresarial({ registrarFatoGerador, mostrarToast }) {
  // ==========================================
  // ESTADO GLOBAL: PORTFÓLIO DE CASOS (BACKLOG)
  // ==========================================
  const [casos, setCasos] = useState([
    {
      id: 1,
      titulo: 'Holding Familiar & Sucessão',
      cliente: 'Família Mendonça',
      tipo: 'holding',
      desc: 'O patriarca (75 anos) quer proteger o patrimônio (fazendas e imóveis) e evitar um inventário caro (ITCMD) para os 3 filhos. Como estruturar essa Holding?',
      resolvido: false
    },
    {
      id: 2,
      titulo: 'M&A: Fusão vs Aquisição',
      cliente: 'TechCorp S.A.',
      tipo: 'ma',
      desc: 'A TechCorp quer absorver sua concorrente menor (DataSec Ltda). Eles querem saber se fazem uma Incorporação, Fusão ou Cisão.',
      resolvido: false
    },
    {
      id: 3,
      titulo: 'Recuperação Judicial (Lei 11.101)',
      cliente: 'Indústria Metalúrgica XYZ',
      tipo: 'rj',
      desc: 'A empresa faturou R$ 10M, mas deve R$ 15M (Bancos, Trabalhistas e Fornecedores). O caixa zerou. Devemos pedir RJ ou Falência?',
      resolvido: false
    }
  ]);

  const [casoAtivo, setCasoAtivo] = useState(null);
  
  // ==========================================
  // ESTADOS ESPECÍFICOS DE CADA SIMULADOR
  // ==========================================
  
  // HOLDING
  const [holdingParams, setHoldingParams] = useState({ patriarca: 100, filho1: 0, filho2: 0, filho3: 0, usufruto: false });
  const patrimonioTotal = 5000000; // 5 Milhões

  // M&A (FUSÃO / INCORPORAÇÃO)
  const [estrategiaMA, setEstrategiaMA] = useState(null);
  const [contratoGerado, setContratoGerado] = useState(false);

  // RECUPERAÇÃO JUDICIAL
  const [planoRJ, setPlanoRJ] = useState({ desagio: 0, carencia: 0 }); // desagio % desconto, carencia em meses
  const dividaTrabalhista = 3000000;
  const dividaBancos = 8000000;
  const dividaFornecedores = 4000000;

  // ==========================================
  // FUNÇÕES GERAIS E AÇÕES
  // ==========================================
  const abrirCaso = (c) => {
    setCasoAtivo(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const aprovarParecer = () => {
    setCasos(casos.map(c => c.id === casoAtivo.id ? { ...c, resolvido: true } : c));
    mostrarToast('Parecer Societário assinado e aprovado!', 'sucesso');
    setCasoAtivo(null);
  };

  // Funções Holding
  const doarCotas = () => {
    setHoldingParams({ patriarca: 10, filho1: 30, filho2: 30, filho3: 30, usufruto: true });
    registrarFatoGerador('Constituição de Holding Patrimonial (Capital Social)', patrimonioTotal, 'Paralegal', ['1.2.3.01'], ['2.3.1.01']);
    mostrarToast('Cotas doadas com Usufruto! Empresa protegida contra inventário.', 'sucesso');
  };

  // Funções M&A
  const assinarMA = () => {
    if (!estrategiaMA) return mostrarToast('Selecione uma estratégia jurídica primeiro!', 'erro');
    setContratoGerado(true);
    
    if (estrategiaMA === 'incorporacao') {
      registrarFatoGerador('Incorporação da DataSec (Aumento de Capital TechCorp)', 2500000, 'Paralegal', ['1.2.1.02'], ['2.3.1.01']);
      mostrarToast('Contrato de Incorporação arquivado na Junta Comercial!', 'sucesso');
    }
  };

  // Funções RJ
  const protocolarRJ = () => {
    if (planoRJ.desagio === 0 || planoRJ.carencia === 0) return mostrarToast('Ajuste o plano de renegociação antes de enviar ao Juiz!', 'erro');
    registrarFatoGerador(`Reclassificação de Dívida Curto p/ Longo Prazo (RJ)`, dividaBancos + dividaFornecedores, 'Paralegal', ['2.1.2.01'], ['2.2.1.01']);
    mostrarToast('Plano de Recuperação protocolado com sucesso! Ações de cobrança suspensas (Stay Period).', 'sucesso');
  };

  // ==========================================
  // TELA 1: PORTFÓLIO PARALEGAL
  // ==========================================
  if (!casoAtivo) {
    return (
      <div style={{ backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>
        
        {/* CABEÇALHO HERO */}
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '42px' }}>⚖️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900' }}>Departamento Societário & Paralegal</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14.5px' }}>Engenharia Societária, Planejamento Patrimonial, M&A e Recuperação Judicial.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '18px' }}>📁 Mesa do Consultor (Casos em Aberto)</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {casos.map(caso => (
              <div key={caso.id} style={{ border: `1px solid ${caso.resolvido ? '#10b981' : '#cbd5e1'}`, borderRadius: '10px', padding: '20px', backgroundColor: caso.resolvido ? '#ecfdf5' : '#ffffff', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                   onClick={() => abrirCaso(caso)}
                   onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'}
                   onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: caso.resolvido ? '#10b981' : '#1e293b', color: 'white', fontSize: '10.5px', padding: '4px 10px', borderRadius: '15px', fontWeight: '800', textTransform: 'uppercase' }}>
                    {caso.tipo}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>👤 {caso.cliente}</span>
                </div>
                
                <h4 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '16.5px' }}>{caso.titulo}</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', flex: 1, lineHeight: '1.5' }}>{caso.desc}</p>
                
                <button style={{ ...btnStyle(caso.resolvido ? 'transparent' : '#2563eb'), color: caso.resolvido ? '#065f46' : 'white', border: caso.resolvido ? '1px solid #10b981' : 'none', width: '100%', fontSize: '13.5px' }}>
                  {caso.resolvido ? 'Visualizar Arquivamento 🔒' : 'Prestar Consultoria 📝'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: WORKSPACE (Consultoria Ativa)
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      
      <div style={{ backgroundColor: '#0f172a', padding: '20px 25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <button onClick={() => setCasoAtivo(null)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 8px 0', fontSize: '13px' }}>← Voltar aos Casos</button>
          <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 24px)' }}>Caso: {casoAtivo.titulo}</h2>
        </div>
        {!casoAtivo.resolvido && (
          <button onClick={aprovarParecer} style={{...btnStyle('#10b981'), padding: '10px 20px'}}>✅ Assinar Parecer Jurídico</button>
        )}
      </div>

      <div style={{ backgroundColor: 'white', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '500px' }}>
        
        {/* ================================================== */}
        {/* SIMULADOR 1: HOLDING FAMILIAR (SUCESSÃO) */}
        {/* ================================================== */}
        {casoAtivo.tipo === 'holding' && (
          <div className="tool-fade">
            <ToolHeader icone="🏛️" titulo="Engenharia de Proteção Patrimonial (Holding)" desc="O patriarca quer distribuir os R$ 5 Milhões em vida para os 3 filhos, sem perder o controle. Integre os imóveis ao capital social da Holding e faça a doação das cotas com reserva de usufruto." />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h4 style={{ margin: 0, color: '#0f172a' }}>Composição do Quadro Societário (QSA)</h4>
                
                <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold' }}>Patrimônio Integralizado:</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#1d4ed8' }}>R$ {patrimonioTotal.toLocaleString('pt-BR')}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div style={qsaBox}><strong>Patriarca:</strong> {holdingParams.patriarca}%</div>
                  <div style={qsaBox}><strong>Filho 1:</strong> {holdingParams.filho1}%</div>
                  <div style={qsaBox}><strong>Filho 2:</strong> {holdingParams.filho2}%</div>
                  <div style={qsaBox}><strong>Filho 3:</strong> {holdingParams.filho3}%</div>
                </div>

                <button onClick={doarCotas} disabled={holdingParams.usufruto} style={btnStyle(holdingParams.usufruto ? '#cbd5e1' : '#8b5cf6')}>
                  {holdingParams.usufruto ? '🔒 Cotas Doadas com Usufruto' : '📑 Executar Doação de Cotas (Usufruto Vitalício)'}
                </button>
                
                {holdingParams.usufruto && (
                  <div style={{ fontSize: '12px', color: '#15803d', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: 'auto' }}>
                    <strong>Vitória Societária:</strong> O pai transferiu a propriedade, mas a cláusula de <em>Usufruto Vitalício</em> garante que ele administra e recebe os aluguéis até falecer. Zero ITCMD na morte!
                  </div>
                )}
              </div>

              {/* Gráfico Societário */}
              <div style={{ height: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Distribuição do Capital Social</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Patriarca (Administrador)', value: holdingParams.patriarca, color: '#3b82f6' },
                      { name: 'Filho 1', value: holdingParams.filho1, color: '#10b981' },
                      { name: 'Filho 2', value: holdingParams.filho2, color: '#8b5cf6' },
                      { name: 'Filho 3', value: holdingParams.filho3, color: '#f59e0b' }
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${value}%`}>
                      {[{color: '#3b82f6'}, {color: '#10b981'}, {color: '#8b5cf6'}, {color: '#f59e0b'}].map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}% das Cotas`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* SIMULADOR 2: FUSÕES E AQUISIÇÕES (M&A) */}
        {/* ================================================== */}
        {casoAtivo.tipo === 'ma' && (
          <div className="tool-fade">
            <ToolHeader icone="🤝" titulo="Fusões e Aquisições (M&A)" desc="A TechCorp comprou a DataSec. Defina a estrutura jurídica da operação. Incorporação (uma engole a outra) ou Fusão (as duas morrem e nasce uma nova)?" />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <EstrategiaCard 
                titulo="Incorporação (Art. 227 LSA)" desc="A TechCorp (A) absorve todo o patrimônio da DataSec (B). A DataSec é extinta." formula="A + B = A"
                ativo={estrategiaMA === 'incorporacao'} onClick={() => setEstrategiaMA('incorporacao')} cor="#2563eb"
              />
              <EstrategiaCard 
                titulo="Fusão (Art. 228 LSA)" desc="TechCorp (A) e DataSec (B) se unem e são extintas para formar uma nova empresa (C)." formula="A + B = C"
                ativo={estrategiaMA === 'fusao'} onClick={() => setEstrategiaMA('fusao')} cor="#10b981"
              />
              <EstrategiaCard 
                titulo="Cisão Parcial (Art. 229 LSA)" desc="A DataSec (B) divide apenas uma parte de seu patrimônio para a TechCorp (A) e continua existindo." formula="B ➔ B + A"
                ativo={estrategiaMA === 'cisao'} onClick={() => setEstrategiaMA('cisao')} cor="#f59e0b"
              />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
              {!contratoGerado ? (
                <>
                  <h4 style={{ margin: '0 0 15px 0' }}>Parecer Jurídico de Operação Societária</h4>
                  <button onClick={assinarMA} style={btnStyle('#0f172a')}>✍️ Elaborar Protocolo e Justificação</button>
                </>
              ) : (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                  <span style={{ fontSize: '40px' }}>📄</span>
                  <h3 style={{ color: '#16a34a', margin: '10px 0' }}>Operação Estruturada com Sucesso!</h3>
                  <p style={{ color: '#475569', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
                    {estrategiaMA === 'incorporacao' && 'No Diário Contábil, os Ativos e Passivos da DataSec foram absorvidos pela TechCorp, gerando um Aumento de Capital Social na incorporadora.'}
                    {estrategiaMA === 'fusao' && 'Ambos os CNPJs foram baixados na Receita Federal. O contador abrirá um novo Diário Contábil para a nova empresa unificada.'}
                    {estrategiaMA === 'cisao' && 'A versão da alteração contratual reflete a transferência parcial de bens. O CNPJ da DataSec continua ativo.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* SIMULADOR 3: RECUPERAÇÃO JUDICIAL */}
        {/* ================================================== */}
        {casoAtivo.tipo === 'rj' && (
          <div className="tool-fade">
             <ToolHeader icone="🆘" titulo="Recuperação Judicial (Lei 11.101/05)" desc="A indústria não consegue pagar a dívida de R$ 15 Milhões no curto prazo. Negocie um Deságio (Desconto) e Carência para evitar a falência (Liquidação)." />
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Quadro de Credores */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ef4444' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚠️</span> Quadro Geral de Credores</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <CredorRow classe="Classe I (Trabalhistas)" orig={dividaTrabalhista} desconto={0} aviso="Não aceita deságio por lei!" />
                    <CredorRow classe="Classe II (Garantia Real/Bancos)" orig={dividaBancos} desconto={planoRJ.desagio} />
                    <CredorRow classe="Classe III (Fornecedores/Quirografários)" orig={dividaFornecedores} desconto={planoRJ.desagio} />
                  </div>
                  
                  <div style={{ borderTop: '2px solid #fca5a5', marginTop: '15px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#7f1d1d', fontSize: '18px' }}>
                    <span>Nova Dívida Total:</span>
                    <span>R$ {((dividaBancos + dividaFornecedores) * (1 - (planoRJ.desagio/100)) + dividaTrabalhista).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Painel de Negociação */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Plano de Recuperação (Negociação)</h4>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lblSty}>Deságio (Desconto pedido aos Bancos/Fornecedores): <strong>{planoRJ.desagio}%</strong></label>
                    <input type="range" min="0" max="70" step="10" value={planoRJ.desagio} onChange={e => setPlanoRJ({...planoRJ, desagio: e.target.value})} style={{ width: '100%', cursor: 'pointer' }} />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>*Desconto máximo tolerado costuma ser 70%.</span>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label style={lblSty}>Carência (Meses sem pagar nada para recuperar caixa): <strong>{planoRJ.carencia} meses</strong></label>
                    <input type="range" min="0" max="36" step="6" value={planoRJ.carencia} onChange={e => setPlanoRJ({...planoRJ, carencia: e.target.value})} style={{ width: '100%', cursor: 'pointer' }} />
                  </div>

                  <button onClick={protocolarRJ} style={{...btnStyle('#0f172a'), width: '100%'}}>
                    ⚖️ Protocolar Plano no Tribunal de Justiça
                  </button>

                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '15px', backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '6px' }}>
                    <strong>Impacto Contábil:</strong> Ao aprovar a RJ, o passivo circulante sufocante vira Passivo Não Circulante (Longo Prazo). O Deságio perdoado entra na DRE como "Receita de Perdão de Dívida", salvando a empresa.
                  </div>
                </div>

             </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tool-fade { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ==========================================
// COMPONENTES DE UI & ESTILOS REUSÁVEIS
// ==========================================
const ToolHeader = ({ icone, titulo, desc }) => (
  <div style={{ marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icone}</span> {titulo}
    </h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px', lineHeight: '1.5' }}>{desc}</p>
  </div>
);

const EstrategiaCard = ({ titulo, desc, formula, ativo, onClick, cor }) => (
  <div onClick={onClick} style={{ 
    padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', border: ativo ? `2px solid ${cor}` : '1px solid #cbd5e1', 
    backgroundColor: ativo ? `${cor}15` : '#ffffff', display: 'flex', flexDirection: 'column'
  }}>
    <h4 style={{ margin: '0 0 8px 0', color: ativo ? cor : '#0f172a' }}>{titulo}</h4>
    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#475569', lineHeight: '1.4', flex: 1 }}>{desc}</p>
    <div style={{ backgroundColor: ativo ? cor : '#e2e8f0', color: ativo ? 'white' : '#475569', padding: '6px', borderRadius: '6px', textAlign: 'center', fontWeight: '900', fontSize: '14px', letterSpacing: '2px' }}>
      {formula}
    </div>
  </div>
);

const CredorRow = ({ classe, orig, desconto, aviso }) => {
  const final = orig * (1 - (desconto / 100));
  return (
    <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
      <span style={{ display: 'block', fontSize: '11px', color: '#b91c1c', fontWeight: 'bold', textTransform: 'uppercase' }}>{classe}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <span style={{ fontSize: '13px', color: '#7f1d1d', textDecoration: desconto > 0 ? 'line-through' : 'none' }}>R$ {orig.toLocaleString('pt-BR')}</span>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#ef4444' }}>R$ {final.toLocaleString('pt-BR')}</span>
      </div>
      {aviso && <span style={{ display: 'block', fontSize: '10px', color: '#dc2626', marginTop: '4px', fontStyle: 'italic' }}>* {aviso}</span>}
    </div>
  );
};

const qsaBox = { backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' };
const lblSty = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' };
const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '14px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' });