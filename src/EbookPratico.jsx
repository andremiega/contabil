import React from 'react';

// Logótipo Oficial Importado para a Capa do E-book
const LogoSistema = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
    <path d="M25 60 C 25 40, 40 30, 50 30 C 65 30, 75 42, 75 60 C 85 60, 85 75, 70 75 L 30 75 C 15 75, 15 60, 25 60 Z" fill="#1e293b" />
    <rect x="38" y="45" width="5" height="20" fill="#38bdf8" rx="2" />
    <rect x="47" y="38" width="5" height="27" fill="#10b981" rx="2" />
    <rect x="56" y="30" width="5" height="35" fill="#f59e0b" rx="2" />
  </svg>
);

export default function EbookPratico() {

  const formatStyle = {
    capituloContainer: { marginBottom: '50px', pageBreakAfter: 'always', boxSizing: 'border-box' },
    h1: { fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: '900', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.5px', borderBottom: '3px solid #2563eb', paddingBottom: '10px', wordBreak: 'break-word' },
    h2: { fontSize: 'clamp(18px, 2.5vw, 20px)', fontWeight: '800', color: '#1e3a8a', marginTop: '30px', marginBottom: '12px', wordBreak: 'break-word' },
    h3: { fontSize: '15px', fontWeight: '700', color: '#334155', marginTop: '20px', marginBottom: '8px', wordBreak: 'break-word' },
    p: { fontSize: '14px', color: '#475569', lineHeight: '1.8', marginBottom: '16px', textAlign: 'justify', wordBreak: 'break-word' },
    ul: { paddingLeft: '20px', marginBottom: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.8' },
    li: { marginBottom: '8px', wordBreak: 'break-word' },
    destaque: { backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '0 8px 8px 0', color: '#1e40af', fontSize: '13.5px', marginBottom: '20px', lineHeight: '1.6', boxSizing: 'border-box' },
    alerta: { backgroundColor: '#fff5f5', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '0 8px 8px 0', color: '#991b1b', fontSize: '13.5px', marginBottom: '20px', lineHeight: '1.6', boxSizing: 'border-box' },
    sucesso: { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '0 8px 8px 0', color: '#166534', fontSize: '13.5px', marginBottom: '20px', lineHeight: '1.6', boxSizing: 'border-box' },
    tabela: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '24px', textAlign: 'left', backgroundColor: 'white' },
    th: { backgroundColor: '#0f172a', color: 'white', padding: '10px 14px', fontWeight: 'bold', border: '1px solid #1e293b' },
    td: { padding: '10px 14px', border: '1px solid #cbd5e1', color: '#334155', wordBreak: 'break-word' },
    tccQuestCard: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '18px', marginBottom: '16px', pageBreakInside: 'avoid', boxSizing: 'border-box' },
    tccInput: { display: 'block', borderBottom: '1px dashed #64748b', height: '24px', width: '100%', marginTop: '8px' }
  };

  return (
    <div translate="no" className="notranslate" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', overflowY: 'auto', scrollBehavior: 'smooth', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* BARRA SUPERIOR FLUTUANTE DE IMPRESSÃO */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#0f172a', padding: '12px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #2563eb', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📘</span>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Modo Leitura Focada</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a href="#indice" style={{ backgroundColor: '#1e293b', color: 'white', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', border: '1px solid #334155' }}>Ir para o Índice ↓</a>
          <button onClick={() => window.print()} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
            🖨️ Imprimir PDF
          </button>
        </div>
      </div>

      {/* PÁGINA DO LIVRO (FOLHA A4 VIRTUAL) */}
      <main style={{ flex: 1, padding: '24px 12px', boxSizing: 'border-box', width: '100%' }}>
        <div className="print-page" style={{ maxWidth: '900px', width: '100%', margin: '0 auto', backgroundColor: '#ffffff', padding: 'clamp(24px, 5vw, 60px) clamp(20px, 6vw, 60px)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          
          {/* =======================================================
              CAPA OFICIAL
             ======================================================= */}
          <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 30px)', border: '6px solid #0f172a', borderRadius: '16px', marginBottom: '60px', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: '#2563eb', opacity: 0.05, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', backgroundColor: '#38bdf8', opacity: 0.05, borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <LogoSistema size={100} />
            </div>
            
            <div style={{ display: 'inline-block', backgroundColor: '#2563eb', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '12px', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>
              Edição Atualizada 2026
            </div>
            
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '900', color: '#0f172a', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '-1.5px', lineHeight: '1.1', wordBreak: 'break-word' }}>
              Manual do Controller<br/>e Auditoria Digital
            </h1>
            
            <h2 style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: '400', color: '#3b82f6', margin: '0 0 30px 0', letterSpacing: '0.5px', wordBreak: 'break-word' }}>
              Integração Contábil, Tributária e Governamental
            </h2>
            
            <div style={{ width: '50px', height: '4px', backgroundColor: '#0f172a', margin: '0 auto 30px auto' }}></div>
            
            <div style={{ fontSize: '13.5px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sistema ERP Contábil Cloud
            </div>
          </div>

          <div style={{ pageBreakAfter: 'always' }}></div>

          {/* =======================================================
              ÍNDICE
             ======================================================= */}
          <div id="indice" style={formatStyle.capituloContainer}>
            <h1 style={formatStyle.h1}>Índice</h1>
            
            <h3 style={{ color: '#0f172a', marginTop: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>LIVRO I: O Guia do Controller</h3>
            <ul style={{ ...formatStyle.ul, listStyleType: 'none', padding: 0, fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#cap1" style={{ color: 'inherit', textDecoration: 'none' }}>1. Introdução à Arquitetura do ERP</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#cap2" style={{ color: 'inherit', textDecoration: 'none' }}>2. A Nova Contabilidade: Reforma Tributária (IVA Dual)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#cap3" style={{ color: 'inherit', textDecoration: 'none' }}>3. Legislação e Normas Contábeis (NBC TG e CLT)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#cap4" style={{ color: 'inherit', textDecoration: 'none' }}>4. Ambientes de Fiscalização (SPED, eSocial, DCTFWeb)</a></li>
            </ul>

            <h3 style={{ color: '#0f172a', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>LIVRO II: Caderno de Laboratório</h3>
            <ul style={{ ...formatStyle.ul, listStyleType: 'none', padding: 0, fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab1" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 1: Operações Comerciais (Nível Básico)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab2" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 2: Prestação de Serviços (Intermediário)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab3" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 3: Indústria e Maquinário Pesado</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab4" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 4: Folha de Pagamento e Encargos</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab5" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 5: Sangria Tributária</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab6" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 6: O Terceiro Setor (ONGs e Imunidade)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab7" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 7: Gestão de Crises e Contingências</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab8" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulo 8: O Sistema IVA Dual (Reforma)</a></li>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#lab9" style={{ color: 'inherit', textDecoration: 'none' }}>Capítulos 9 & 10: Lucro Real (LALUR) & Cripto</a></li>
            </ul>

            <h3 style={{ color: '#ef4444', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>LIVRO III: Desafio Final</h3>
            <ul style={{ ...formatStyle.ul, listStyleType: 'none', padding: 0, fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>
              <li style={{ padding: '8px 0', borderBottom: '1px dashed #cbd5e1' }}><a href="#tcc" style={{ color: 'inherit', textDecoration: 'none' }}>Classificação Ultra Secreta: Operação Fênix (TCC)</a></li>
            </ul>
          </div>

          {/* =======================================================
              LIVRO I: TEORIA
             ======================================================= */}
          <div id="cap1" style={formatStyle.capituloContainer}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}><span style={{ backgroundColor: '#1e293b', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>LIVRO I: O GUIA DO CONTROLLER</span></div>
            <h1 style={formatStyle.h1}>1. Introdução à Arquitetura do ERP</h1>
            <p style={formatStyle.p}>O <strong>Contábil Cloud</strong> não é apenas um sistema de registros; é um <strong>Laboratório de Simulação Empresarial de Alta Fidelidade</strong>. Ele foi desenhado para preencher a lacuna entre a teoria acadêmica e a prática agressiva do mercado de trabalho moderno.</p>
            <div style={formatStyle.destaque}>
              <strong>O Cérebro do Sistema (Tutor Analítico & Livro Diário):</strong><br/>
              Toda ação que você toma nos módulos periféricos converge para o Livro Diário. Se um lançamento não fechar (Débitos ≠ Créditos), o Tutor Analítico bloqueará o Balanço Patrimonial, simulando uma auditoria real da CVM.
            </div>
          </div>

          <div id="cap2" style={formatStyle.capituloContainer}>
            <h1 style={formatStyle.h1}>2. A Nova Contabilidade: Reforma Tributária</h1>
            <p style={formatStyle.p}>Aprovada no final de 2023, a Reforma Tributária altera a forma como os impostos sobre o consumo são calculados, substituindo a cumulatividade pelo sistema de <strong>Imposto sobre Valor Agregado (IVA Dual)</strong>.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '10px', fontSize: '14px' }}>❌ Extintos:</strong>
                <ul style={{ ...formatStyle.ul, color: '#7f1d1d', margin: 0, paddingLeft: '16px' }}><li>PIS e COFINS</li><li>IPI</li><li>ICMS</li><li>ISS</li></ul>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '10px', fontSize: '14px' }}>✅ O Novo Modelo:</strong>
                <ul style={{ ...formatStyle.ul, color: '#14532d', margin: 0, paddingLeft: '16px' }}><li><strong>CBS:</strong> Federal.</li><li><strong>IBS:</strong> Estados/Municípios.</li><li><strong>IS:</strong> Imposto Seletivo.</li></ul>
              </div>
            </div>
            <div style={formatStyle.destaque}>
              <strong>Princípio da Não-Cumulatividade Plena:</strong><br/>O IVA é cobrado "por fora". Todo o imposto pago na compra gera crédito imediato para abater no imposto a pagar na venda.
            </div>
          </div>

          <div id="cap3" style={formatStyle.capituloContainer}>
            <h1 style={formatStyle.h1}>3. Legislação e Normas Contábeis</h1>
            <h2 style={formatStyle.h2}>Principais Pronunciamentos Contábeis (CPCs)</h2>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Norma / CPC</th><th style={formatStyle.th}>Impacto Operacional no ERP</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}><strong>CPC 00 (R2)</strong></td><td style={formatStyle.td}>Define o <strong>Regime de Competência</strong>. Receitas e Despesas são registradas pelo Fato Gerador.</td></tr>
                  <tr><td style={formatStyle.td}><strong>CPC 16 (R1)</strong></td><td style={formatStyle.td}>Proíbe terminantemente o UEPS no controle de estoques.</td></tr>
                  <tr><td style={formatStyle.td}><strong>CPC 27</strong></td><td style={formatStyle.td}>Exige o reconhecimento da <strong>Depreciação</strong> com base na vida útil, alocada na DRE.</td></tr>
                  <tr><td style={formatStyle.td}><strong>ITG 2002 (R1)</strong></td><td style={formatStyle.td}>Igrejas e ONGs não têm "Lucro" (é Superávit) nem "Capital Social" (Fundo). Imunes a IRPJ.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="cap4" style={formatStyle.capituloContainer}>
            <h1 style={formatStyle.h1}>4. Ambientes de Fiscalização Digital (SPED)</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginTop: '20px', boxSizing: 'border-box' }}>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
                <h3 style={formatStyle.h3}>👥 eSocial e DCTFWeb</h3>
                <p style={{...formatStyle.p, margin: 0}}>O evento S-1200 (Remuneração) alimenta o eSocial. A DCTFWeb "puxa" os débitos automaticamente para gerar a guia única de pagamento do INSS e IRRF.</p>
              </div>
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
                <h3 style={formatStyle.h3}>📊 SPED (ECD e ECF)</h3>
                <p style={{...formatStyle.p, margin: 0}}>O ECD substitui os livros diário e razão. O ECF cruza a contabilidade com a apuração de IRPJ/CSLL (LALUR), provando que não houve sonegação.</p>
              </div>
            </div>
          </div>

          {/* =======================================================
              LIVRO II: LABORATÓRIO
             ======================================================= */}
          <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '50px' }}><span style={{ backgroundColor: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>LIVRO II: CADERNO DE LABORATÓRIO</span></div>
          
          <div id="lab1" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 1: Operações Comerciais (Nível Básico)</h2>
            <p style={formatStyle.p}>O foco aqui é dominar o ciclo operacional básico: comprar, vender, apurar o Custo da Mercadoria Vendida (CMV) e gerir o Caixa.<br/><strong>Setup:</strong> Selecione a empresa <em>Comercial</em>. Garanta que o laboratório está limpo.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={{...formatStyle.th, width:'15%'}}>Data</th><th style={{...formatStyle.th, width:'45%'}}>Missão Contábil</th><th style={{...formatStyle.th, width:'20%'}}>Valor (R$)</th><th style={{...formatStyle.th, width:'20%'}}>Radar de Contas</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>01/01</td><td style={formatStyle.td}><strong>Aporte Financeiro:</strong> Injeção de liquidez imediata via depósito.</td><td style={formatStyle.td}>R$ 100.000,00</td><td style={formatStyle.td}>Bancos / Capital Social</td></tr>
                  <tr><td style={formatStyle.td}>05/01</td><td style={formatStyle.td}><strong>Abastecimento (A Prazo):</strong> Compra de mercadoria (30 dias).</td><td style={formatStyle.td}>R$ 40.000,00</td><td style={formatStyle.td}>Estoque / Fornecedores</td></tr>
                  <tr><td style={formatStyle.td}>10/01</td><td style={formatStyle.td}><strong>Venda Expressa:</strong> Escoamento de 50% do estoque à vista.</td><td style={formatStyle.td}>R$ 35.000,00</td><td style={formatStyle.td}>Bancos / Rec. Vendas</td></tr>
                  <tr><td style={formatStyle.td}>10/01</td><td style={formatStyle.td}><strong>Baixa de Inventário:</strong> Custo da mercadoria (metade do lote).</td><td style={formatStyle.td}>R$ 20.000,00</td><td style={formatStyle.td}>CMV / Estoque</td></tr>
                  <tr><td style={formatStyle.td}>15/01</td><td style={formatStyle.td}><strong>Custo de Operação:</strong> Débito automático energia.</td><td style={formatStyle.td}>R$ 1.200,00</td><td style={formatStyle.td}>Desp. Energia / Bancos</td></tr>
                </tbody>
              </table>
            </div>
            <div style={formatStyle.sucesso}><strong>Check-point do Controller:</strong> O Resultado do Exercício deve estar em <strong>R$ 13.800,00</strong> e Bancos em <strong>R$ 133.800,00</strong>.</div>
          </div>

          <div id="lab2" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 2: Prestação de Serviços (Intermediário)</h2>
            <p style={formatStyle.p}>O setor de Serviços troca o Estoque pela gestão de intangíveis e Adiantamentos.<br/><strong>Setup:</strong> Troque a Entidade para <em>Serviços</em>.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th><th style={formatStyle.th}>Radar de Contas</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>01/02</td><td style={formatStyle.td}><strong>Fundo de Maneio:</strong> Sócio aportou dinheiro físico.</td><td style={formatStyle.td}>R$ 15.000,00</td><td style={formatStyle.td}>Caixa / Capital Social</td></tr>
                  <tr><td style={formatStyle.td}>03/02</td><td style={formatStyle.td}><strong>Arsenal Digital:</strong> Compra de licenças vitálícias de software.</td><td style={formatStyle.td}>R$ 5.000,00</td><td style={formatStyle.td}>Softwares / Caixa</td></tr>
                  <tr><td style={formatStyle.td}>12/02</td><td style={formatStyle.td}><strong>Contrato B2B:</strong> Emissão de NF de serviço a prazo (60 dias).</td><td style={formatStyle.td}>R$ 28.000,00</td><td style={formatStyle.td}>Clientes / Rec. Serviços</td></tr>
                  <tr><td style={formatStyle.td}>20/02</td><td style={formatStyle.td}><strong>Capital Retido:</strong> Cliente depositou sinal para projeto futuro.</td><td style={formatStyle.td}>R$ 8.000,00</td><td style={formatStyle.td}>Bancos / Adiant. Clientes</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="lab3" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 3: Indústria e Maquinário Pesado</h2>
            <p style={formatStyle.p}>Numa Indústria, você financia imobilizado e gere o desgaste das máquinas.<br/><strong>Setup:</strong> Selecione a <em>Indústria</em>.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th><th style={formatStyle.th}>Radar de Contas</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>01/03</td><td style={formatStyle.td}><strong>Alavancagem:</strong> Empréstimo BNDES na conta.</td><td style={formatStyle.td}>R$ 200.000,00</td><td style={formatStyle.td}>Bancos / Empréstimos</td></tr>
                  <tr><td style={formatStyle.td}>02/03</td><td style={formatStyle.td}><strong>Força Motriz:</strong> Compra de maquinário fabril à vista.</td><td style={formatStyle.td}>R$ 150.000,00</td><td style={formatStyle.td}>Máquinas / Bancos</td></tr>
                  <tr><td style={formatStyle.td}>31/03</td><td style={formatStyle.td}><strong>Desgaste:</strong> Apropriação da depreciação no primeiro mês.</td><td style={formatStyle.td}>R$ 1.250,00</td><td style={formatStyle.td}>Desp. Deprec. / Deprec. Acumulada</td></tr>
                  <tr><td style={formatStyle.td}>31/03</td><td style={formatStyle.td}><strong>Consumo de Insumos:</strong> Baixa da matéria-prima para a linha.</td><td style={formatStyle.td}>R$ 25.000,00</td><td style={formatStyle.td}>CMV / Estoque</td></tr>
                </tbody>
              </table>
            </div>
            <div style={formatStyle.destaque}><strong>Dica de Auditoria:</strong> A Depreciação Acumulada "corrói" o Ativo. O valor líquido de Máquinas no Balanço deve exibir <strong>R$ 148.750,00</strong>.</div>
          </div>

          <div id="lab4" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 4: Folha de Pagamento e Encargos</h2>
            <p style={formatStyle.p}>O capital humano custa caro. Processe a folha e identifique o que é despesa da empresa e o que é apenas retenção.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th><th style={formatStyle.th}>Radar de Contas</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>30/04</td><td style={formatStyle.td}><strong>Custo Laboral:</strong> Despesa total bruta da folha.</td><td style={formatStyle.td}>R$ 30.000,00</td><td style={formatStyle.td}>Desp. Salários / Salários a Pagar</td></tr>
                  <tr><td style={formatStyle.td}>30/04</td><td style={formatStyle.td}><strong>Tesoura Fiscal:</strong> Retenção de 10% de INSS.</td><td style={formatStyle.td}>R$ 3.000,00</td><td style={formatStyle.td}>Salários a Pagar / INSS a Recolher</td></tr>
                  <tr><td style={formatStyle.td}>30/04</td><td style={formatStyle.td}><strong>Provisão FGTS:</strong> Despesa patronal (8%) sobre a folha.</td><td style={formatStyle.td}>R$ 2.400,00</td><td style={formatStyle.td}>Desp. FGTS / FGTS a Recolher</td></tr>
                  <tr><td style={formatStyle.td}>05/05</td><td style={formatStyle.td}><strong>Liquidação:</strong> Transferência do LÍQUIDO para a equipe.</td><td style={formatStyle.td}>R$ 27.000,00</td><td style={formatStyle.td}>Salários a Pagar / Bancos</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="lab5" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 5: Sangria Tributária</h2>
            <p style={formatStyle.p}>No Brasil, os impostos são sugados diretamente da Receita Bruta. Simule a apropriação do ICMS e PIS/COFINS.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th><th style={formatStyle.th}>Radar de Contas</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>10/05</td><td style={formatStyle.td}><strong>Emissão de NF-e:</strong> Faturamento a prazo.</td><td style={formatStyle.td}>R$ 50.000,00</td><td style={formatStyle.td}>Clientes / Rec. Vendas</td></tr>
                  <tr><td style={formatStyle.td}>10/05</td><td style={formatStyle.td}><strong>Fatia do Leão (ICMS):</strong> Apropriação de 18%.</td><td style={formatStyle.td}>R$ 9.000,00</td><td style={formatStyle.td}>Desp. Impostos / Impostos a Pagar</td></tr>
                  <tr><td style={formatStyle.td}>10/05</td><td style={formatStyle.td}><strong>Carga Federal:</strong> Apropriação de 9,25% de PIS/COFINS.</td><td style={formatStyle.td}>R$ 4.625,00</td><td style={formatStyle.td}>Desp. Impostos / Impostos a Pagar</td></tr>
                </tbody>
              </table>
            </div>
            <div style={formatStyle.sucesso}><strong>Leitura de DRE:</strong> Os impostos atuam como Deduções. A sua "Receita Líquida" vitalícia nesta operação é de R$ 36.375,00. É com esta margem que a empresa sobrevive.</div>
          </div>

          <div id="lab6" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 6: O Terceiro Setor (ONGs e Imunidade)</h2>
            <p style={formatStyle.p}>Mude as regras. Na ONG, o lucro é "Superávit", e as doações substituem o faturamento.</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>01/06</td><td style={formatStyle.td}><strong>Fundo Social:</strong> Benfeitores transferiram capital inicial.</td><td style={formatStyle.td}>R$ 60.000,00</td></tr>
                  <tr><td style={formatStyle.td}>15/06</td><td style={formatStyle.td}><strong>Linha de Frente:</strong> Compra de mantimentos para doação.</td><td style={formatStyle.td}>R$ 8.500,00</td></tr>
                  <tr><td style={formatStyle.td}>20/06</td><td style={formatStyle.td}><strong>Imunidade:</strong> Prefeitura cobrou IPTU indevidamente (Estorne).</td><td style={formatStyle.td}>R$ 3.000,00</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="lab7" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 7: Gestão de Crises e Contingências</h2>
            <p style={formatStyle.p}>Este módulo testa a sua capacidade de registar perdas catastróficas e calotes (PECLD).</p>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Missão Contábil</th><th style={formatStyle.th}>Valor (R$)</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>05/07</td><td style={formatStyle.td}><strong>Calote (PECLD):</strong> Cliente faliu.</td><td style={formatStyle.td}>R$ 12.000,00</td></tr>
                  <tr><td style={formatStyle.td}>12/07</td><td style={formatStyle.td}><strong>Desastre:</strong> Enchente destruiu parte do armazém.</td><td style={formatStyle.td}>R$ 8.000,00</td></tr>
                  <tr><td style={formatStyle.td}>18/07</td><td style={formatStyle.td}><strong>Vitória:</strong> Tribunal bloqueou contas da operadora (Indenização).</td><td style={formatStyle.td}>R$ 15.000,00</td></tr>
                </tbody>
              </table>
            </div>
            <div style={formatStyle.alerta}>Se sobreviveu a isto e o seu Balanço ainda iguala (Ativo = Passivo + PL), o seu treino de base está concluído.</div>
          </div>

          <div id="lab8" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulo 8: O Sistema IVA Dual</h2>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Operação IVA Dual</th><th style={formatStyle.th}>Valor (R$)</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>01/08</td><td style={formatStyle.td}><strong>Compra Limpa:</strong> Nota de R$ 50k. Extraia CBS (8,8%) e IBS (17,7%) a recuperar.</td><td style={formatStyle.td}>R$ 50.000,00</td></tr>
                  <tr><td style={formatStyle.td}>15/08</td><td style={formatStyle.td}><strong>Apuração do Débito:</strong> Sobre venda de R$ 80k, reconheça a dívida de CBS e IBS.</td><td style={formatStyle.td}>R$ 21.200,00</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="lab9" style={formatStyle.capituloContainer}>
            <h2 style={formatStyle.h2}>Capítulos 9 & 10: LALUR & Criptoativos</h2>
            <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
              <table style={formatStyle.tabela}>
                <thead><tr><th style={formatStyle.th}>Data</th><th style={formatStyle.th}>Operação Específica</th><th style={formatStyle.th}>Valor (R$)</th></tr></thead>
                <tbody>
                  <tr><td style={formatStyle.td}>05/09</td><td style={formatStyle.td}><strong>Multa Ambiental:</strong> Paga via banco. Será "Adicionada" no LALUR.</td><td style={formatStyle.td}>R$ 15.000,00</td></tr>
                  <tr><td style={formatStyle.td}>31/10</td><td style={formatStyle.td}><strong>Baleia Cripto:</strong> Valorização de Bitcoin em carteira (Ajuste a Mercado).</td><td style={formatStyle.td}>R$ 20.000,00</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* =======================================================
              LIVRO III: PROJETO TCC (GAMIFICADO)
             ======================================================= */}
          <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '50px', pageBreakBefore: 'always' }}><span style={{ backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>LIVRO III: DESAFIO FINAL</span></div>
          
          <div id="tcc" style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: 'clamp(20px, 4vw, 40px)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 8px 0', textShadow: '0 0 15px rgba(239, 68, 68, 0.4)', wordBreak: 'break-word' }}>Operação Fênix</h2>
              <h3 style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: '#94a3b8', margin: 0, fontWeight: '300' }}>O Resgate da Indústria Alpha</h3>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderLeft: '5px solid #ef4444', padding: '16px', fontSize: '13.5px', marginBottom: '30px', lineHeight: '1.6', boxSizing: 'border-box' }}>
              <strong style={{ display: 'block', fontSize: '16px', color: '#ef4444', marginBottom: '8px' }}>[ BRIEFING DA MISSÃO ]</strong>
              Outubro de 2026. O antigo CEO desapareceu, deixando a empresa com as contas congeladas. Você é o <strong>Controller de Elite</strong>. Use todos os módulos do ERP para limpar o caos, injetar liquidez e legitimar a operação antes que a empresa decrete falência.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', boxSizing: 'border-box' }}>
              
              {/* Cards do TCC */}
              {[
                { n: '01', t: 'Fugir das Sombras (Redesim)', d: 'O antigo CNPJ está bloqueado. Use o simulador Paralegal para criar uma nova entidade limpa. CNAE 1412-6/01.', r: 'NIRE de Segurança Gerado' },
                { n: '02', t: 'Chaves do Cofre (Certificação)', d: 'Vá à Gestão de Certificados e emita uma chave criptográfica e-CNPJ Tipo A1.', r: 'Data Limite (Vencimento)' },
                { n: '03', t: 'Oxigênio Financeiro (Tabela SAC)', d: 'Simule um empréstimo de R$ 60.000,00 em 12x a 1,5% a.m. (SAC) para reativar o chão de fábrica.', r: 'Amortização Fixa Paga ao Banco' },
                { n: '04', t: 'Sangrar Recebíveis (Antecipação)', d: 'Desconte duplicatas de R$ 35.000 a 45 dias (Taxa 3% + R$ 150) para pagar funcionários.', r: 'Liquidez Imediata Creditada' },
                { n: '05', t: 'Apaziguar a Tropa (e-Social)', d: 'Salário bruto: R$ 2.800,00. Calcule os descontos de INSS exatos para evitar multas.', r: 'Valor Líquido Entregue na Conta' },
                { n: '06', t: 'A Grande Venda (Emissão NF-e)', d: 'Emita a NF-e (CFOP 5101) de 1.000 peças a R$ 45,00 cada.', r: 'Faturamento Bruto Total' },
                { n: '07', t: 'O Pedágio do Estado (Simples)', d: 'Apure o imposto da NF-e no Módulo Fiscal - Anexo II (Indústria - 4,5%).', r: 'Guia DAS Emitida' },
                { n: '08', t: 'Guardião do Estoque (Kardex)', d: 'Compre 500 un. a R$ 20. Compre +500 a R$ 30. Registre a saída das 1.000 peças da Missão 06.', r: 'CMV Automático Gerado', c: '#8b5cf6' },
                { n: '09', t: 'Desgaste do Tempo (Imobilizado)', d: 'Cadastre o maquinário fabril: R$ 150.000 (Taxa 10% a.a.). Processe 1 Mês de uso.', r: 'Valor Líquido Contábil após 1 mês', c: '#0d9488' },
                { n: '10', t: 'Detetive Financeiro (OFX)', d: 'Importe o OFX na Conciliação Bancária e faça o "Match" de 100% dos lançamentos.', r: 'Número de transações conciliadas', c: '#2563eb' },
                { n: '11', t: 'O Leão (Apuração LALUR)', d: 'Insira R$ 100.000 de lucro, adicione uma multa de R$ 30.000 e calcule os impostos com Adicional.', r: 'Valor do IRPJ Total a pagar', c: '#d97706' },
                { n: '12', t: 'O Inquisidor (Malha Fina SPED)', d: 'Alerta vermelho! O validador da Receita bloqueou a operação. Identifique os furos deixados na NF-e e no Diário.', r: 'Relatório de Inconsistência', c: '#ef4444' }
              ].map(q => (
                <div key={q.n} style={{ ...formatStyle.tccQuestCard, borderLeft: `4px solid ${q.c || '#38bdf8'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: q.c || '#38bdf8', color: q.c ? 'white' : '#0f172a', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 'bold' }}>MISSÃO {q.n}</span>
                    <strong style={{ color: 'white', fontSize: '15px', wordBreak: 'break-word' }}>{q.t}</strong>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px', wordBreak: 'break-word' }}>{q.d}</p>
                  <div style={{ color: '#cbd5e1', fontSize: '13.5px', wordBreak: 'break-word' }}>
                    {q.r}: <span style={formatStyle.tccInput}></span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ border: '2px dashed #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '24px 16px', borderRadius: '12px', textAlign: 'center', marginTop: '30px', boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#60a5fa', fontSize: '17px', textTransform: 'uppercase', letterSpacing: '2px' }}>🔒 Desencriptação de Conclusão</h3>
              <p style={{ margin: '0 auto', fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '600px', wordBreak: 'break-word' }}>Ao assinar abaixo, declaro que as ameaças fiscais foram neutralizadas, os estoques e a conciliação bancária fechados, e a Indústria Alpha sobreviveu ao ano de 2026 graças às minhas operações na plataforma.</p>
              <div style={{ marginTop: '40px', borderTop: '1px solid #60a5fa', width: '260px', maxWidth: '100%', marginInline: 'auto', paddingTop: '10px', fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Assinatura do Agente (Controller)
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}