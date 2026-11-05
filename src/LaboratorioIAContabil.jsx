import React, { useState } from 'react';

export default function LaboratorioIAContabil({ mostrarToast }) {
  // ==========================================
  // ESTADOS DO MÓDULO
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState('introducao');
  
  // Estados para o Gerador de Prompts (Aba 3)
  const [areaPrompt, setAreaPrompt] = useState('tributario');
  const [objetivoPrompt, setObjetivoPrompt] = useState('');
  const [tomDeVoz, setTomDeVoz] = useState('profissional');
  const [formatoSaida, setFormatoSaida] = useState('bullet');
  const [promptGerado, setPromptGerado] = useState('');

  // Estados para Casos de Uso (Aba 4)
  const [casoExpandido, setCasoExpandido] = useState(null);

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  // ==========================================
  // DADOS DE ENGENHARIA DE PROMPT
  // ==========================================
  const personas = {
    tributario: "Atue como um Auditor Fiscal e Consultor Tributário Sênior (ex-auditor da Receita Federal do Brasil), com amplo domínio das leis 10.833, 10.637, Regulamento do Imposto de Renda e jurisprudência do CARF.",
    dp: "Atue como um Especialista em Departamento Pessoal, Recursos Humanos, Legislação Trabalhista (CLT) e eSocial S-1.0 no Brasil, com visão orientada para mitigação de passivos trabalhistas.",
    financeiro: "Atue como um CFO (Chief Financial Officer) experiente e Especialista em Valuation, Controladoria e BPO Financeiro para pequenas e médias empresas (PMEs).",
    societario: "Atue como um Paralegal e Especialista em Direito Societário e Legalização de Empresas, com profundo conhecimento em regras da Junta Comercial (DREI) e Simples Nacional.",
    atendimento: "Atue como um Especialista em Customer Success (CS) voltado para a Contabilidade Consultiva, focado em comunicação empática, persuasão, retenção de clientes e gatilhos mentais.",
    tecnologia: "Atue como um Cientista de Dados e Arquiteto de Software focado em Contabilidade Digital, ERPs, SPED e automação de processos contábeis via RPA."
  };

  const frameworks = {
    tributario: "Sua resposta deve citar a base legal (Leis/Instruções Normativas), descrever os riscos fiscais, propor uma estratégia preventiva e apresentar uma conclusão direta.",
    dp: "Sua resposta deve considerar as regras da CLT aplicáveis, o impacto nas convenções coletivas de trabalho (CCT) e listar exatamente quais eventos do eSocial devem ser enviados.",
    financeiro: "Apresente a solução focando em impacto direto no Fluxo de Caixa, EBITDA, redução de custos fixos, e sugira pelo menos 3 KPIs para o dono da empresa monitorar.",
    societario: "Detalhe o fluxo processual nos órgãos competentes (Junta Comercial, RFB, SEFAZ, Prefeitura), liste a documentação necessária e aente para prazos ou custos envolvidos.",
    atendimento: "Use um tom acolhedor e persuasivo. Evite o 'Contabilês'. Use analogias do dia a dia (como comparar imposto com aluguel). Se for cobrar o cliente, aplique a técnica do sanduíche (Elogio > Cobrança > Suporte).",
    tecnologia: "Explique a solução tecnológica passo a passo, sugerindo ferramentas de mercado (ex: Make, Zapier, PowerBI) e como o escritório pode automatizar a rotina sem gastar milhares de reais."
  };

  const tons = {
    profissional: "Tom: Profissional, consultivo, seguro, direto e estritamente técnico.",
    didatico: "Tom: Extremamente didático, paciente, usando analogias simples como se estivesse explicando para uma pessoa de 15 anos.",
    autoridade: "Tom: Autoridade máxima, firme e incisivo, demonstrando profundo domínio do assunto, mas sem ser rude.",
    amigavel: "Tom: Acolhedor, amigável, parceiro de negócios, focado em ajudar e apoiar a decisão do cliente."
  };

  const formatos = {
    bullet: "Formato: Utilize tópicos (bullet points) claros e curtos, destacando as palavras-chave em negrito.",
    tabela: "Formato: Apresente a resposta exclusivamente em formato de Tabela (Markdown) para facilitar a comparação visual dos dados.",
    email: "Formato: Estruture a resposta como um e-mail pronto para ser enviado, incluindo campo de 'Assunto', saudação inicial, corpo do e-mail e despedida cordial.",
    relatorio: "Formato: Estruture a resposta como um Relatório Executivo de 1 página (Resumo, Análise, Conclusão, Recomendações)."
  };

  // ==========================================
  // LÓGICA DO GERADOR DE PROMPTS
  // ==========================================
  const gerarPrompt = () => {
    if (!objetivoPrompt.trim()) {
      dispararToast('Por favor, descreva o seu objetivo ou problema.', 'erro');
      return;
    }

    const promptFinal = `[CONTEXTO E PERSONA]
${personas[areaPrompt]}

[TAREFA E OBJETIVO]
Analise e resolva a seguinte situação: 
"${objetivoPrompt}"

[REGRAS DE FORMATAÇÃO E ESTRUTURA]
${frameworks[areaPrompt]}

[DIRETRIZES DE SAÍDA]
${tons[tomDeVoz]}
${formatos[formatoSaida]}
Atenção: Não invente leis ou artigos. Se não houver certeza absoluta da base legal, informe que a interpretação jurisprudencial pode variar.`;

    setPromptGerado(promptFinal);
    dispararToast('Super Prompt estruturado e pronto!', 'sucesso');
  };

  const copiarPrompt = () => {
    navigator.clipboard.writeText(promptGerado);
    dispararToast('Copiado! Cole no ChatGPT, Claude ou Gemini.', 'sucesso');
  };

  // ==========================================
  // DADOS DOS CARDS EXPLICATIVOS
  // ==========================================
  const fundamentosIA = [
    { icone: '🧠', titulo: 'O Fim do "Contabilês"', texto: 'A IA traduz relatórios financeiros e balancetes complexos para uma linguagem que o empresário entenda, aumentando o valor percebido da contabilidade consultiva.' },
    { icone: '⚡', titulo: 'Produtividade Extrema', texto: 'Ler e resumir uma Instrução Normativa de 50 páginas leva minutos em vez de horas. O foco muda da execução operacional para a análise e estratégia.' },
    { icone: '🔒', titulo: 'Segurança (LGPD)', texto: 'Nunca alimente a IA com CPFs, CNPJs, nomes ou dados bancários reais. Use pseudônimos (Empresa Alfa, Cliente João) para garantir sigilo profissional absoluto.' },
    { icone: '🏗️', titulo: 'Engenharia de Prompt', texto: 'A IA é um estagiário genial sem iniciativa. A regra é: Persona + Contexto + Tarefa + Formato. Quanto mais detalhes você fornecer, melhor será a entrega.' }
  ];

  const casosDeUso = [
    {
      id: 1, categoria: 'Tributário', cor: '#38bdf8', titulo: 'Análise de Exclusão do Simples',
      cenario: 'Cliente ultrapassou o sublimite de R$ 3.6M. Preciso calcular se vale a pena ir para o Lucro Presumido no estado do SP, considerando o ICMS.',
      solucao: 'Forneça à IA as margens de lucro presumidas e peça para montar uma tabela comparativa de custos tributários (Simples x Presumido), destacando o impacto do ICMS fora da DAS.'
    },
    {
      id: 2, categoria: 'Atendimento', cor: '#10b981', titulo: 'Cobrança de Documentos',
      cenario: 'Cliente da clínica médica atrasou o envio dos extratos OFX pela 3ª vez consecutiva. Preciso cobrar sem perder o cliente.',
      solucao: 'Peça à IA para agir como "Customer Success" e gerar um e-mail utilizando a técnica do Sanduíche: Elogia o crescimento da clínica, explica o risco da multa do SPED e oferece ajuda para automatizar o envio bancário.'
    },
    {
      id: 3, categoria: 'DP & RH', cor: '#a855f7', titulo: 'Resumo de Convenção Coletiva (CCT)',
      cenario: 'Saiu o novo dissídio do comércio (Sindicato X). Tem 40 páginas em PDF cheio de termos jurídicos.',
      solucao: 'Copie o texto do PDF, cole na IA e peça: "Extraia apenas os pisos salariais por função, o novo percentual de reajuste e as mudanças no Vale Alimentação. Formate em uma tabela simples".'
    },
    {
      id: 4, categoria: 'Societário', cor: '#f59e0b', titulo: 'Redação de Contrato Social Específico',
      cenario: 'Preciso incluir uma cláusula de "Vesting" e "Tag Along" em um contrato de Holding Familiar, mas o modelo da Junta Comercial não tem.',
      solucao: 'Peça à IA (atuando como Advogado Societário) para redigir apenas as duas cláusulas específicas, garantindo que estejam de acordo com a Lei das S.A. e o Código Civil Brasileiro, prontas para inserção.'
    }
  ];

  // ==========================================
  // ESTILOS VISUAIS (TEMA IA / CYBER)
  // ==========================================
  const mainBg = '#0f172a'; const cardBg = '#1e293b'; const borderC = '#334155';
  const textP = '#f8fafc'; const textS = '#94a3b8';
  const accI = '#10b981'; // Green (Primário da IA neste tema)
  const accB = '#38bdf8'; // Blue
  const accW = '#f59e0b'; // Amber

  const containerStyle = { backgroundColor: mainBg, padding: '16px', borderRadius: '24px', border: `1px solid ${borderC}`, fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderC}`, fontSize: '13.5px', backgroundColor: mainBg, color: accI, outline: 'none', boxSizing: 'border-box', marginTop: '6px' };
  const labelStyle = { fontWeight: 'bold', fontSize: '11px', color: textS, display: 'block', textTransform: 'uppercase' };
  const cardStyle = { backgroundColor: cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${borderC}`, boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const boxMentorStyle = { backgroundColor: '#022c22', borderLeft: `4px solid ${accI}`, padding: '16px', borderRadius: '12px', color: '#a7f3d0', fontSize: '13.5px', lineHeight: '1.6' };

  return (
    <div style={containerStyle}>
      
      {/* HEADER E MENU */}
      <div style={{ color: 'white', padding: '15px 20px', borderRadius: '16px 16px 0 0', borderBottom: `1px solid ${borderC}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
          <div>
            <span style={{ backgroundColor: accI, color: mainBg, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              IA CONTÁBIL E ENGENHARIA DE PROMPT
            </span>
            <h2 style={{ margin: '12px 0 0 0', fontSize: '24px', color: textP, fontWeight: '800' }}>🤖 O Contador Aumentado (CFO Virtual)</h2>
          </div>
          <div style={{ backgroundColor: cardBg, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${accB}`, color: accB, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span> Powered by AI
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'introducao', label: '1. 🧠 Fundamentos da IA' },
            { id: 'casos_uso', label: '2. 💼 Casos de Uso (Prática)' },
            { id: 'gerador', label: '3. 🪄 Gerador de Super Prompts' },
            { id: 'biblioteca', label: '4. 📚 Biblioteca de Prompts (Templates)' }
          ].map(aba => (
            <button 
              key={aba.id} 
              onClick={() => setAbaAtiva(aba.id)} 
              style={{ 
                flex: '1 1 auto', 
                backgroundColor: abaAtiva === aba.id ? accI : cardBg, 
                color: abaAtiva === aba.id ? mainBg : textS, 
                border: `1px solid ${borderC}`, 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                fontSize: '12.5px', 
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px', minHeight: '550px' }}>

        {/* ========================================== */}
        {/* ABA 1: FUNDAMENTOS DA IA (O QUE É E COMO USAR) */}
        {/* ========================================== */}
        {abaAtiva === 'introducao' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={boxMentorStyle}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>A Nova Era Contábil (Inteligência Ampliada):</strong>
              A Inteligência Artificial não veio para roubar empregos, mas sim para eliminar a digitação e a pesquisa exaustiva. <strong>Contadores que dominam a IA substituirão os escritórios tradicionais.</strong> O objetivo é elevar o profissional do papel de "apurador de impostos" para "Consultor Estratégico de Negócios" (BPO Financeiro / CFO).
            </div>

            <h3 style={{ color: textP, margin: '10px 0 0 0', fontSize: '20px' }}>Os 4 Pilares da IA no Escritório</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {fundamentosIA.map((fundamento, idx) => (
                <div key={idx} style={{ ...cardStyle, borderTop: `4px solid ${idx % 2 === 0 ? accB : accW}`, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{fundamento.icone}</div>
                  <h4 style={{ color: textP, margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800' }}>{fundamento.titulo}</h4>
                  <p style={{ color: textS, fontSize: '13px', lineHeight: '1.6', margin: 'auto 0 0 0' }}>
                    {fundamento.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 2: CASOS DE USO E PRÁTICA                */}
        {/* ========================================== */}
        {abaAtiva === 'casos_uso' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ color: textP, margin: 0, fontSize: '20px' }}>Aplicações Reais: O que pedir para a IA hoje?</h3>
            <p style={{ color: textS, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              Descubra como os escritórios de contabilidade mais avançados do Brasil já estão ganhando horas de produtividade diária usando o ChatGPT, Claude ou Gemini.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {casosDeUso.map((caso) => (
                <div key={caso.id} style={{ ...cardStyle, borderLeft: `6px solid ${caso.cor}`, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${borderC}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: caso.cor, textTransform: 'uppercase', letterSpacing: '1px' }}>{caso.categoria}</span>
                      <h4 style={{ color: textP, margin: '6px 0 0 0', fontSize: '16px' }}>{caso.titulo}</h4>
                    </div>
                  </div>
                  
                  <div style={{ padding: '20px', flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: textS, fontSize: '12px', display: 'block', marginBottom: '6px' }}>O Problema (Cenário):</strong>
                      <p style={{ color: '#cbd5e1', fontSize: '13.5px', margin: 0, lineHeight: '1.5' }}>{caso.cenario}</p>
                    </div>
                    
                    <button 
                      onClick={() => setCasoExpandido(casoExpandido === caso.id ? null : caso.id)}
                      style={{ backgroundColor: 'transparent', border: `1px solid ${borderC}`, color: accI, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}
                    >
                      {casoExpandido === caso.id ? 'Ocultar Solução IA' : 'Ver como a IA resolve 💡'}
                    </button>
                    
                    {casoExpandido === caso.id && (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: mainBg, borderRadius: '8px', border: `1px dashed ${caso.cor}` }}>
                        <strong style={{ color: caso.cor, fontSize: '12px', display: 'block', marginBottom: '6px' }}>Solução (O que pedir):</strong>
                        <p style={{ color: textP, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{caso.solucao}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ABA 3: GERADOR DE SUPER PROMPTS            */}
        {/* ========================================== */}
        {abaAtiva === 'gerador' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...boxMentorStyle, backgroundColor: '#1e3a8a', borderLeftColor: accB, color: '#bfdbfe' }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>🪄 O Laboratório de Engenharia de Prompt:</strong> 
              Não perca tempo tentando explicar o contexto do zero para a IA. Preencha os campos abaixo. O nosso sistema montará a estrutura perfeita (com Persona de Especialista Sênior e Diretrizes de Saída), pronta para você copiar e obter respostas precisas, jurídicas e prontas para uso.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              
              {/* PAINEL DE CONFIGURAÇÃO */}
              <div style={cardStyle}>
                <h4 style={{ color: textP, margin: '0 0 20px 0', fontSize: '18px', borderBottom: `1px solid ${borderC}`, paddingBottom: '12px' }}>⚙️ Setup do Prompt</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>1. Qual a Área / Especialidade?</label>
                    <select style={inputStyle} value={areaPrompt} onChange={(e) => setAreaPrompt(e.target.value)}>
                      <option value="tributario">Fiscal / Tributário / Lucro Real</option>
                      <option value="dp">Depto Pessoal / eSocial / CLT</option>
                      <option value="financeiro">Controladoria / BPO Financeiro / CFO</option>
                      <option value="societario">Societário / Junta Comercial / Legalização</option>
                      <option value="atendimento">Comunicação / Customer Success (E-mails)</option>
                      <option value="tecnologia">Tecnologia / Automação SPED / ERP</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>2. Qual o tom de voz da resposta?</label>
                    <select style={inputStyle} value={tomDeVoz} onChange={(e) => setTomDeVoz(e.target.value)}>
                      <option value="profissional">Técnico e Profissional (Para uso interno/Documentos)</option>
                      <option value="didatico">Muito Didático (Para explicar ao dono da empresa)</option>
                      <option value="amigavel">Amigável e Empático (Para cobranças e avisos)</option>
                      <option value="autoridade">Firme e de Autoridade (Para defesas fiscais)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>3. Formato de Saída:</label>
                    <select style={inputStyle} value={formatoSaida} onChange={(e) => setFormatoSaida(e.target.value)}>
                      <option value="bullet">Tópicos Destacados (Bullet Points)</option>
                      <option value="tabela">Tabela Comparativa (Markdown)</option>
                      <option value="email">Formato de E-mail (Pronto para envio)</option>
                      <option value="relatorio">Relatório Executivo (1 página)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>4. Qual é o seu problema exato? (Sem dados sensíveis)</label>
                    <textarea 
                      rows="5" 
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }} 
                      placeholder="Ex: Preciso entender se uma empresa de serviços de TI (CNAE X) pagará menos impostos no Anexo III do Simples Nacional ou no Lucro Presumido, considerando que a folha salarial dela é muito baixa (não atinge o Fator R)..."
                      value={objetivoPrompt}
                      onChange={(e) => setObjetivoPrompt(e.target.value)}
                    />
                  </div>

                  <button 
                    onClick={gerarPrompt}
                    style={{ backgroundColor: accI, color: mainBg, border: 'none', padding: '16px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                  >
                    ⚡ Gerar Super Prompt
                  </button>
                </div>
              </div>

              {/* PAINEL DE RESULTADO */}
              <div style={{ ...cardStyle, border: promptGerado ? `1px solid ${accI}` : `1px solid ${borderC}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderC}`, paddingBottom: '12px', marginBottom: '16px' }}>
                  <h4 style={{ color: promptGerado ? accI : textP, margin: 0, fontSize: '18px' }}>📝 Resultado Final</h4>
                  {promptGerado && (
                    <button 
                      onClick={copiarPrompt}
                      style={{ backgroundColor: accB, color: mainBg, border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📋 Copiar Prompt
                    </button>
                  )}
                </div>
                
                {promptGerado ? (
                  <div style={{ flex: 1, padding: '20px', backgroundColor: mainBg, borderRadius: '8px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace', overflowY: 'auto' }}>
                    {promptGerado}
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: textS, textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', opacity: 0.2, marginBottom: '16px' }}>🤖</div>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Preencha os dados e clique em gerar.<br/>O seu prompt otimizado aparecerá aqui, pronto para comandar a IA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: BIBLIOTECA DE PROMPTS (TEMPLATES PRONTOS)           */}
        {/* ========================================================= */}
        {abaAtiva === 'biblioteca' && (
          <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <h3 style={{ color: textP, margin: 0, fontSize: '20px' }}>Templates Prontos para Uso Imediato</h3>
             <p style={{ color: textS, margin: 0, fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                Copie os prompts abaixo e cole na sua IA favorita (substituindo as palavras entre colchetes pelos dados reais).
             </p>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
               
               <div style={cardStyle}>
                 <h4 style={{ color: accB, margin: '0 0 12px 0', fontSize: '16px' }}>🧾 Explicador de DRE para Leigos</h4>
                 <div style={{ padding: '16px', backgroundColor: mainBg, borderRadius: '8px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '16px', borderLeft: `3px solid ${accB}` }}>
                   "Atue como um CFO consultivo. Explique o balancete abaixo para um dono de padaria que não entende de contabilidade. Destaque onde está o ralo financeiro (despesas muito altas) e dê 3 dicas práticas para melhorar a margem de lucro. Use tom amigável. [COLE OS DADOS DA DRE AQUI]"
                 </div>
                 <button onClick={() => { navigator.clipboard.writeText("Atue como um CFO consultivo. Explique o balancete abaixo para um dono de padaria que não entende de contabilidade. Destaque onde está o ralo financeiro (despesas muito altas) e dê 3 dicas práticas para melhorar a margem de lucro. Use tom amigável. [COLE OS DADOS DA DRE AQUI]"); dispararToast('Template copiado!', 'sucesso'); }} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: `1px solid ${borderC}`, color: textP, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Copiar Template</button>
               </div>

               <div style={cardStyle}>
                 <h4 style={{ color: accW, margin: '0 0 12px 0', fontSize: '16px' }}>📜 Criador de Recurso de Multa</h4>
                 <div style={{ padding: '16px', backgroundColor: mainBg, borderRadius: '8px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '16px', borderLeft: `3px solid ${accW}` }}>
                   "Atue como um advogado tributarista especialista em defesas administrativas na RFB. Redija um recurso administrativo impugnando a multa por atraso na entrega da [DCTF/EFD] da empresa [NOME DA EMPRESA]. A justificativa baseia-se na inoperabilidade do sistema do e-CAC no último dia do prazo (instabilidade comprovada). Formate como petição formal."
                 </div>
                 <button onClick={() => { navigator.clipboard.writeText("Atue como um advogado tributarista especialista em defesas administrativas na RFB. Redija um recurso administrativo impugnando a multa por atraso na entrega da [NOME DA DECLARAÇÃO] da empresa [NOME DA EMPRESA]. A justificativa baseia-se na inoperabilidade do sistema do e-CAC no último dia do prazo (instabilidade comprovada). Formate como petição formal."); dispararToast('Template copiado!', 'sucesso'); }} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', border: `1px solid ${borderC}`, color: textP, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Copiar Template</button>
               </div>

             </div>
          </div>
        )}

      </div>
    </div>
  );
}
