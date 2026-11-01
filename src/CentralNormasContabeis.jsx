import React, { useState } from 'react';

export default function CentralNormasContabeis() {
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas'); // 'todas', 'cpc', 'itg', 'societaria', 'fiscal'

  // Banco de Normas Contábeis e Fiscais Expandido com a Reforma Tributária
  const normasDB = [
    {
      id: 'ec-132',
      categoria: 'fiscal',
      codigo: 'EC nº 132/2023',
      titulo: 'Reforma Tributária do Consumo (IBS, CBS e IS)',
      orgao: 'Congresso Nacional / Presidência da República',
      resumo: 'Altera o Sistema Tributário Nacional criando o IVA Dual composto pela CBS (federal) e pelo IBS (estadual/municipal), além do Imposto Seletivo (IS) sobre bens e serviços prejudiciais à saúde e ao meio ambiente.',
      aplicacaoPratica: 'Base para o simulador da Reforma Tributária e projeções de impacto nos preços e créditos tributários.'
    },
    {
      id: 'cpc-00',
      categoria: 'cpc',
      codigo: 'CPC 00 (R2)',
      titulo: 'Estrutura Conceitual para Relatório Financeiro',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Define os conceitos fundamentais para a elaboração e apresentação de demonstrações contábeis: relevância, representação fidedigna, comparabilidade e tempestividade.',
      aplicacaoPratica: 'Norteia a estrutura lógica de elaboração do Balanço Patrimonial e da DRE no Centro de Operações.'
    },
    {
      id: 'cpc-01',
      categoria: 'cpc',
      codigo: 'CPC 01 (R1)',
      titulo: 'Redução ao Valor Recuperável de Ativos (Impairment)',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Garante que os ativos não estejam registados por valor superior ao seu valor recuperável (maior entre o valor justo líquido de despesas de venda e o valor em uso).',
      aplicacaoPratica: 'Utilizado em auditoria de balanço para avaliar a desvalorização de máquinas, equipamentos e investimentos.'
    },
    {
      id: 'cpc-03',
      categoria: 'cpc',
      codigo: 'CPC 03 (R2)',
      titulo: 'Demonstrações dos Fluxos de Caixa (DFC)',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Estabelece exigências para a apresentação da DFC, classificando os fluxos de caixa do período em atividades operacionais, de investimento e de financiamento.',
      aplicacaoPratica: 'Alimenta o relatório DFC integrado no painel de relatórios oficiais do ERP.'
    },
    {
      id: 'cpc-06',
      categoria: 'cpc',
      codigo: 'CPC 06 (R2) / IFRS 16',
      titulo: 'Operações de Arrendamento Mercantil (Leasing)',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Requer o reconhecimento de ativos e passivos para a maioria dos contratos de arrendamento no balanço das empresas arrendatárias.',
      aplicacaoPratica: 'Utilizado no controlo de contratos de locação de imóveis e frotas de veículos.'
    },
    {
      id: 'cpc-16',
      categoria: 'cpc',
      codigo: 'CPC 16 (R1)',
      titulo: 'Inventários / Estoques',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Orienta sobre a mensuração de estoques pelo custo ou pelo valor líquido realizável, o que for menor. Proíbe o método UEPS (LIFO) e autoriza PEPS ou Média Ponderada.',
      aplicacaoPratica: 'Fundamenta diretamente os cálculos e movimentações do módulo de Ficha Kardex.'
    },
    {
      id: 'cpc-25',
      categoria: 'cpc',
      codigo: 'CPC 25',
      titulo: 'Provisões, Passivos Contingentes e Ativos Contingentes',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Define critérios de reconhecimento e bases de mensuração para provisões (obrigações presentes de valor ou prazo incerto), passivos e ativos contingentes.',
      aplicacaoPratica: 'Utilizado em provisões laborais, cíveis e fiscais na contabilidade empresarial.'
    },
    {
      id: 'cpc-27',
      categoria: 'cpc',
      codigo: 'CPC 27 / NBC TG 27',
      titulo: 'Ativo Imobilizado',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Estabelece o tratamento contabilístico para ativos imobilizados. Define reconhecimento inicial pelo custo, valor residual, vida útil económica e obrigatoriedade de depreciação.',
      aplicacaoPratica: 'Base do simulador de Depreciação e cálculo de quotas lineares e aceleradas.'
    },
    {
      id: 'cpc-47',
      categoria: 'cpc',
      codigo: 'CPC 47 / IFRS 15',
      titulo: 'Receita de Contratos com Clientes',
      orgao: 'Comitê de Pronunciamentos Contábeis (CPC)',
      resumo: 'Modelo de 5 etapas para reconhecimento de receita: identificação do contrato, obrigações de desempenho, preço de transação, alocação e reconhecimento.',
      aplicacaoPratica: 'Aplicado na emissão de faturas/notas fiscais e reconhecimento da Receita Bruta.'
    },
    {
      id: 'itg-2000',
      categoria: 'itg',
      codigo: 'ITG 2000 (R1)',
      titulo: 'Escrituração Contabilística',
      orgao: 'Conselho Federal de Contabilidade (CFC)',
      resumo: 'Dispõe sobre as formalidades da escrituração contabilística, exigindo rigor no método das partidas dobradas, ordem cronológica diária e histórico claro.',
      aplicacaoPratica: 'Rige a estrutura e validação dos lançamentos no Livro Diário Geral.'
    },
    {
      id: 'itg-2002',
      categoria: 'itg',
      codigo: 'ITG 2002 (R1)',
      titulo: 'Entidades sem Finalidade de Lucros (Terceiro Setor)',
      orgao: 'Conselho Federal de Contabilidade (CFC)',
      resumo: 'Orienta o registo contabilístico de entidades do terceiro setor, substituindo o Lucro Líquido pela Demonstração do Superávit ou Déficit do Exercício.',
      aplicacaoPratica: 'Aplicado no perfil da entidade "Associação Comunitária Esperança".'
    },
    {
      id: 'lei-6404',
      categoria: 'societaria',
      codigo: 'Lei nº 6.404/1976',
      titulo: 'Lei das Sociedades por Ações (S.A.)',
      orgao: 'Legislação Federal Brasileira',
      resumo: 'Marco regulatório fundamental da contabilidade societária. Regula a elaboração do Balanço, DRE, DFC, DMPL e regras de distribuição de dividendos.',
      aplicacaoPratica: 'Estrutura padrão obrigatória para as demonstrações contábeis oficiais do ERP.'
    },
    {
      id: 'ctn',
      categoria: 'fiscal',
      codigo: 'Lei nº 5.172/1966 (CTN)',
      titulo: 'Código Tributário Nacional',
      orgao: 'Legislação Federal Brasileira',
      resumo: 'Dispõe sobre o sistema tributário nacional e estabelece normas gerais de direito tributário aplicáveis à União, Estados e Municípios.',
      aplicacaoPratica: 'Base concetual para todas as apurações nos simuladores tributários e fiscais.'
    },
    {
      id: 'rir-2018',
      categoria: 'fiscal',
      codigo: 'Decreto nº 9.580/2018 (RIR/18)',
      titulo: 'Regulamento do Imposto sobre a Renda',
      orgao: 'Receita Federal do Brasil (RFB)',
      resumo: 'Consolida as normas de tributação, fiscalização e arrecadação do IRPJ e da CSLL para pessoas jurídicas nos regimes de Lucro Real, Presumido e Arbitrado.',
      aplicacaoPratica: 'Utilizado nos cálculos do Lucro Presumido, Lucro Real e apuração no LALUR.'
    },
    {
      id: 'lc-123',
      categoria: 'fiscal',
      codigo: 'Lei Complementar nº 123/2006',
      titulo: 'Estatuto Nacional da Microempresa e da EPP (Simples Nacional)',
      orgao: 'Legislação Federal Brasileira',
      resumo: 'Regulamenta o regime unificado de arrecadação de tributos e contribuições das microempresas e empresas de pequeno porte.',
      aplicacaoPratica: 'Utilizado no Simulador do Simples Nacional e cálculo do Fator R.'
    }
  ];

  // Filtragem por termo e categoria
  const normasFiltradas = normasDB.filter(n => {
    const matchCategoria = categoriaAtiva === 'todas' || n.categoria === categoriaAtiva;
    const matchTermo = n.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       n.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       n.resumo.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchTermo;
  });

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📚</span> Central de Normas Contábeis, CPCs e Legislação
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Repositório técnico oficial para consulta de Pronunciamentos (CPC), ITGs, Leis Societárias, CTN e Reforma Tributária.
          </p>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '12px', fontWeight: 'bold', color: '#1e40af' }}>
          Normas Indexadas: <span style={{ color: '#2563eb' }}>{normasDB.length} Ativas</span>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS POR CATEGORIA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', alignItems: 'center' }}>
        
        {/* Input de Pesquisa */}
        <input 
          type="text" 
          placeholder="Pesquisar por norma (ex: EC 132, CPC 27, CTN, Simples)..."
          value={termoBusca}
          onChange={e => setTermoBusca(e.target.value)}
          style={{ flex: '1 1 280px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        />

        {/* Botões de Filtro */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'cpc', label: 'CPCs (Pronunciamentos)' },
            { id: 'itg', label: 'ITGs / CFC' },
            { id: 'societaria', label: 'Societária' },
            { id: 'fiscal', label: 'Tributária & Fiscal' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: categoriaAtiva === cat.id ? '#0f172a' : 'transparent',
                color: categoriaAtiva === cat.id ? 'white' : '#64748b'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* GRID DE CARDS DAS NORMAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {normasFiltradas.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Nenhuma norma encontrada para os critérios de busca informados.
          </div>
        ) : (
          normasFiltradas.map(norma => (
            <div 
              key={norma.id} 
              style={{ 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px', 
                border: '1px solid #cbd5e1', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#e2e8f0', color: '#1e293b' }}>
                  {norma.codigo}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
                  {norma.orgao.split(' ')[0]}
                </span>
              </div>

              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                {norma.titulo}
              </h3>

              <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                {norma.resumo}
              </p>

              <div style={{ marginTop: 'auto', backgroundColor: 'white', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#334155' }}>
                <strong>💡 Aplicação no ERP:</strong> {norma.aplicacaoPratica}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}