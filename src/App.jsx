import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { supabase } from './supabase';
import './App.css';

// ============================================================================
// IMPORTAÇÕES DOS SIMULADORES (MÓDULOS)
// ============================================================================
import LaboratorioMercadoCapitais from './LaboratorioMercadoCapitais';
import LaboratorioContabilidadeRural from './LaboratorioContabilidadeRural';
import LaboratorioContabilidadePublica from './LaboratorioContabilidadePublica';
import LaboratorioIAContabil from './LaboratorioIAContabil';
import LaboratorioGamesContabeis from './LaboratorioGamesContabeis';
import InputCustomizado from './InputCustomizado';
import ServicosIniciais from './ServicosIniciais';
import AssistenteRobo from './AssistenteRobo';
import DashboardPrincipal from './Dashboard';
import SimuladorHP12c from './SimuladorHP12c';
import LaboratorioDFC from './LaboratorioDFC';
import LaboratorioPlanoContas from './LaboratorioPlanoContas';
import LaboratorioCustos from './LaboratorioCustos';
import LaboratorioDRE from './LaboratorioDRE';
import LaboratorioTributario from './LaboratorioTributario';
import LaboratorioFolha from './LaboratorioFolha';
import LaboratorioConciliacao from './LaboratorioConciliacao';
import LaboratorioLancamentos from './LaboratorioLancamentos';
import LaboratorioCPC from './LaboratorioCPC';
import SimuladorSimples from './SimuladorSimples';
import SimuladorLucroPresumido from './SimuladorLucroPresumido';
import SimuladorFolhaPagamento from './SimuladorFolhaPagamento';
import SimuladorCustos from './SimuladorCustos';
import SimuladorPontoEquilibrio from './SimuladorPontoEquilibrio';
import SimuladorFerramentasQualidade from './SimuladorFerramentasQualidade';
import SimuladorRateioCustos from './SimuladorRateioCustos';
import SimuladorAnaliseBalanco from './SimuladorAnaliseBalanco';
import SimuladorCEO from './SimuladorCEO';
import SimuladorGreenBelt from './SimuladorGreenBelt';
import SimuladorAtualizacaoJudiciaria from './SimuladorAtualizacaoJudiciaria';
import SimuladorDepreciacao from './SimuladorDepreciacao';
import SimuladorConsultoriaContabil from './SimuladorConsultoriaContabil';
import SimuladorInvestimentos from './SimuladorInvestimentos';
import SimuladorLegalizacao from './SimuladorLegalizacao';
import SimuladorFinanceiro from './SimuladorFinanceiro';
import SimuladorViabilidade from './SimuladorViabilidade';
import SimuladorEconomiaMicro from './SimuladorEconomiaMicro';
import SimuladorReformaTributaria from './SimuladorReformaTributaria';
import SimuladorMatematicaFinanceira from './SimuladorMatematicaFinanceira';
import SimuladorInfoprodutos from './SimuladorInfoprodutos';
import SimuladorCriptoativos from './SimuladorCriptoativos';
import MotorMissoes from './MotorMissoes';
import SimuladorCRC from './SimuladorCRC';
import SimuladorMalhaFina from './SimuladorMalhaFina';
import SimuladorComexCambio from './SimuladorComexCambio';
import GestaoCertificados from './GestaoCertificados';
import EbookPratico from './EbookPratico';
import SimuladorLivroDiario from './SimuladorLivroDiario';
import SimuladorKardex from './SimuladorKardex';
import SimuladorEmprestimo from './SimuladorEmprestimo';
import SimuladorEngenhariaTributaria from './SimuladorEngenhariaTributaria';
import SimuladorConciliacaoOFX from './SimuladorConciliacaoOFX';
import SimuladorLalur from './SimuladorLalur';
import LaboratorioEducacaoFinanceira from './LaboratorioEducacaoFinanceira';
import CentroConhecimentoApostilas from './CentroConhecimentoApostilas';
import CentralNormasContabeis from './CentralNormasContabeis';
import BuscaApostilasChat from './BuscaApostilasChat';
import SimuladorEconomiaMacro from './SimuladorEconomiaMacro';
import SimuladorPortaisGov from './SimuladorPortaisGov';
import SimuladorIRPF from './SimuladorIRPF';
import SimuladorEsocialDCTFWeb from './SimuladorEsocialDCTFWeb';
import SimuladorEmissaoNotas from './SimuladorEmissaoNotas';
import SimuladorSPED from './SimuladorSPED';
import SimuladorPDCARealista from './SimuladorPDCARealista';
import SimuladorCanvasCompleto from './SimuladorCanvasCompleto';
import SimuladorDireitoEmpresarial from './SimuladorDireitoEmpresarial';
import SimuladorPMP10Passos from './SimuladorPMP10Passos';
import SimuladorEstatisticaAvancada from './SimuladorEstatisticaAvancada';
import SimuladorDireitoTributario from './SimuladorDireitoTributario';
import SimuladorEncerramento from './SimuladorEncerramento';
import SimuladorRescisaoDP from './SimuladorRescisaoDP';
import SimuladorValuationOrcamento from './SimuladorValuationOrcamento';
import SimuladorContratosLeasing from './SimuladorContratosLeasing';
import SimuladorESGCarbono from './SimuladorESGCarbono';
import SimuladorOnboardingContratos from './SimuladorOnboardingContratos';
import DemonstracoesContabeis from './DemonstracoesContabeis';

// ============================================================================
// COMPONENTE SEO DINÂMICO
// ============================================================================
function SEO({ title, description, keywords }) {
  return (
    <Helmet>
      <title>{title} | Contábil Cloud</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
}

// ============================================================================
// APP PRINCIPAL (ROTEADOR GLOBAL)
// ============================================================================
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <MainDashboard />
      </BrowserRouter>
    </HelmetProvider>
  );
}

// ============================================================================
// O DASHBOARD (RENDERIZADO DENTRO DO ROUTER PARA MANTER O MENU FIXO)
// ============================================================================
function MainDashboard() {
  const [mostrarSmartHeader, setMostrarSmartHeader] = useState(true);
  const [ultimoScrollY, setUltimoScrollY] = useState(0);
  const location = useLocation();

  const handleScrollMain = (e) => {
    const scrollAtual = e.target.scrollTop;
    if (scrollAtual > ultimoScrollY && scrollAtual > 50) {
      setMostrarSmartHeader(false);
    } else {
      setMostrarSmartHeader(true);
    }
    setUltimoScrollY(scrollAtual);
  };

  useEffect(() => {
    const selecionarTexto = (e) => { if (e.target.tagName === 'INPUT') e.target.select(); };
    document.addEventListener('focusin', selecionarTexto);
    return () => { document.removeEventListener('focusin', selecionarTexto); };
  }, []);

  const formatMoeda = (valor) => (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const LogoSistema = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
      <path d="M25 60 C 25 40, 40 30, 50 30 C 65 30, 75 42, 75 60 C 85 60, 85 75, 70 75 L 30 75 C 15 75, 15 60, 25 60 Z" fill="#1e293b" />
      <rect x="38" y="45" width="5" height="20" fill="#38bdf8" rx="2" />
      <rect x="47" y="38" width="5" height="27" fill="#10b981" rx="2" />
      <rect x="56" y="30" width="5" height="35" fill="#f59e0b" rx="2" />
    </svg>
  );

  const svgFavicon = `data:image/svg+xml,<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="%230f172a" stroke="%2338bdf8" strokeWidth="4" /><path d="M25 60 C 25 40, 40 30, 50 30 C 65 30, 75 42, 75 60 C 85 60, 85 75, 70 75 L 30 75 C 15 75, 15 60, 25 60 Z" fill="%231e293b" /><rect x="38" y="45" width="5" height="20" fill="%2338bdf8" rx="2" /><rect x="47" y="38" width="5" height="27" fill="%2310b981" rx="2" /><rect x="56" y="30" width="5" height="35" fill="%23f59e0b" rx="2" /></svg>`;

  const AssistenteAuditoria = ({ totalAtivo, totalPassivo, totalPL, resultadoExercicio, saldoCaixa, historico, nomeEmpresa, pendencias = [] }) => {
    const totalPassivoMaisPL = totalPassivo + totalPL + resultadoExercicio;
    const diferencaBalanco = Math.abs(totalAtivo - totalPassivoMaisPL);
    const balancoFechado = diferencaBalanco < 0.01;
    const caixaNegativo = saldoCaixa < 0;
    
    const temPendencias = pendencias.length > 0;
    const semLancamentos = historico.length === 0;

    let tipoParecer = 'SEM_RESSALVAS';
    let badgeCor = '#16a34a';
    let badgeTexto = 'Opinião Não Modificada (Sem Ressalvas)';

    if (temPendencias) {
      tipoParecer = 'PENDENCIAS_ATIVAS'; badgeCor = '#dc2626'; badgeTexto = 'Demonstrações Incompletas (Falta Escriturar)';
    } else if (semLancamentos) {
      tipoParecer = 'AGUARDANDO'; badgeCor = '#64748b'; badgeTexto = 'Aguardando Fatos Contábeis';
    } else if (!balancoFechado) {
      tipoParecer = 'COM_RESSALVAS'; badgeCor = '#dc2626'; badgeTexto = 'Opinião Modificada (Erro de Partidas Dobradas)';
    } else if (caixaNegativo || resultadoExercicio < 0) {
      tipoParecer = 'COM_ENFASE'; badgeCor = '#d97706'; badgeTexto = 'Sem Ressalvas com Parágrafo de Ênfase';
    }

    const formatMoeda = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
      <div className="print-area" style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '12px', border: `1.5px solid ${badgeCor}`, marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🦉</span>
            <div><h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Tutor Analítico & Auditoria</h3><span style={{ fontSize: '11px', color: '#64748b' }}>Avaliação algorítmica pedagógica (NBC TA 700)</span></div>
          </div>
          <span style={{ backgroundColor: badgeCor, color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{badgeTexto}</span>
        </div>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
          {tipoParecer === 'AGUARDANDO' && <p style={{ margin: 0, color: '#475569' }}>O Livro Diário da <strong>{nomeEmpresa}</strong> está vazio. Vá aos laboratórios ou lance diretamente no Diário para iniciar a apuração.</p>}
          {tipoParecer === 'PENDENCIAS_ATIVAS' && (
            <div><p style={{ margin: '0 0 10px 0', color: '#991b1b', fontWeight: 'bold' }}>🚨 Alerta de Omissão Contábil:</p><p style={{ margin: 0, color: '#dc2626' }}>Detectamos <strong>{pendencias.length} fato(s) gerador(es)</strong> operacionais que ainda não foram contabilizados. Vá ao <strong>Livro Diário</strong> e resolva as pendências!</p></div>
          )}
          {tipoParecer !== 'AGUARDANDO' && tipoParecer !== 'PENDENCIAS_ATIVAS' && (
            <><p style={{ margin: '0 0 10px 0' }}><strong>Parecer do Auditor:</strong> Examinamos as demonstrações da <strong>{nomeEmpresa}</strong>, baseados em <strong>{historico.length}</strong> registro(s).</p>
              {tipoParecer === 'SEM_RESSALVAS' && <p style={{ margin: 0, color: '#15803d' }}>✓ <strong>Conclusão Técnica:</strong> Demonstrações perfeitamente equilibradas (Total Ativo: <strong>{formatMoeda(totalAtivo)}</strong>).</p>}
              {tipoParecer === 'COM_RESSALVAS' && <p style={{ margin: 0, color: '#dc2626', fontWeight: 'bold' }}>⚠️ Diferença detectada no Balanço: {formatMoeda(diferencaBalanco)}. Revise seus lançamentos!</p>}
            </>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    document.title = "Contábil Cloud | ERP & Gestão";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.getElementsByTagName('head')[0].appendChild(link); }
    link.href = svgFavicon;
  }, []);

  const [toast, setToast] = useState({ visivel: false, mensagem: '', tipo: 'sucesso' });
  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ visivel: true, mensagem, tipo });
    setTimeout(() => setToast(prev => ({ ...prev, visivel: false })), 4000);
  };

  const ToastNotificacao = () => {
    if (!toast.visivel) return null;
    const cores = { sucesso: '#16a34a', erro: '#dc2626', aviso: '#d97706' };
    return (
      <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: cores[toast.tipo], color: 'white', padding: '14px 22px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.25)', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '14px' }}>
        <span>{toast.tipo === 'sucesso' ? '✅' : '⚠️'}</span><span>{toast.mensagem}</span>
      </div>
    );
  };

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  useEffect(() => {
    if (menuMobileAberto) document.body.classList.add('menu-mobile-ativo');
    else document.body.classList.remove('menu-mobile-ativo');
  }, [menuMobileAberto]);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (menuMobileAberto && !event.target.closest('.app-sidebar') && !event.target.closest('.menu-toggle-btn')) { setMenuMobileAberto(false); }
    };
    document.addEventListener('mousedown', handleClickFora);
    document.addEventListener('touchstart', handleClickFora);
    return () => { document.removeEventListener('mousedown', handleClickFora); document.removeEventListener('touchstart', handleClickFora); };
  }, [menuMobileAberto]);

  const [modalSuporte, setModalSuporte] = useState(false);
  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [mostrarPromo, setMostrarPromo] = useState(true);

  const [configAdmin, setConfigAdmin] = useState({ pix: '', whatsapp: '', urlPromo: '', emailContato: '', emailSac: '', precoBasico: 0, precoPro: 0, precoMaster: 0 });

  useEffect(() => {
    const buscarConfiguracoesNuvem = async () => {
      const { data, error } = await supabase.from('configuracoes_erp').select('*').eq('id', 1).single();
      if (data && !error) {
        setConfigAdmin({
          pix: data.pix || '', whatsapp: data.whatsapp || '', urlPromo: data.url_promo || '',
          emailContato: data.email_contato || '', emailSac: data.email_sac || '',
          precoBasico: data.preco_basico || 14.90, precoPro: data.preco_pro || 49.90, precoMaster: data.preco_master || 89.90
        });
      }
    };
    buscarConfiguracoesNuvem();
  }, []);

  const salvarConfiguracoesGlobais = async () => {
    mostrarToast("A salvar na nuvem...", "aviso");
    const pBasico = Number(configAdmin.precoBasico) || 0;
    const pPro = Number(configAdmin.precoPro) || 0;
    const pMaster = Number(configAdmin.precoMaster) || 0;

    const { error } = await supabase.from('configuracoes_erp').upsert({
      id: 1, pix: configAdmin.pix || '', whatsapp: configAdmin.whatsapp || '', url_promo: configAdmin.urlPromo || '', 
      email_contato: configAdmin.emailContato || '', email_sac: configAdmin.emailSac || '',
      preco_basico: pBasico, preco_pro: pPro, preco_master: pMaster
    });
    if (error) { console.error("ERRO SUPABASE:", error); mostrarToast("Erro ao salvar: Verifique a consola (F12)", "erro"); } else { mostrarToast("Configurações atualizadas para todos os usuários!", "sucesso"); }
  };

  const configPlanos = [
    { id: 'basico', nome: 'Acesso Mensal Básico', valor: configAdmin.precoBasico, periodo: 'mês' },
    { id: 'pro', nome: 'Acesso Semestral Pro', valor: configAdmin.precoPro, periodo: 'semestre' },
    { id: 'master', nome: 'Passe Anual Master', valor: configAdmin.precoMaster, periodo: 'ano' }
  ];

  const [userAuth, setUserAuth] = useState(null);
  const [alunoNome, setAlunoNome] = useState('');
  const [isGestor, setIsGestor] = useState(false);
  const [faseLogin, setFaseLogin] = useState('autenticacao'); 
  const [isModoRegisto, setIsModoRegisto] = useState(false);
  const [isModoRecuperacao, setIsModoRecuperacao] = useState(false);
  const [inputNome, setInputNome] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [planoSelecionado, setPlanoSelecionado] = useState('');

  const [faturamentosAlunos, setFaturamentosAlunos] = useState([
    { id: 1, email: "ana@escola.com", nome: "Ana Silva", plano: "Acesso Mensal Básico", valor: 14.90, status: "Pago", ra: "12480" },
    { id: 2, email: "carlos@escola.com", nome: "Carlos Souza", plano: "Passe Anual Master", valor: 89.90, status: "Pendente", ra: "12891" },
  ]);

  const [abaAdminAtiva, setAbaAdminAtiva] = useState('alunos');
  const [uploadForm, setUploadForm] = useState({ titulo: '', palavras_chave: '', categoria: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputFileRef = React.useRef(null);

  const handleUploadApostila = async (e) => {
    if (e) e.preventDefault();
    if (!uploadForm.titulo) return mostrarToast("Preencha o Título do Documento.", "erro");
    if (!uploadForm.categoria) return mostrarToast("Selecione a Categoria.", "erro");
    if (!pdfFile || !pdfFile.buffer) return mostrarToast("Por favor, selecione um arquivo PDF novamente.", "erro");
    
    setIsUploading(true);
    try {
      const nomeLimpo = pdfFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const finalFilePath = `${Date.now()}_${nomeLimpo}`;
      const { error: uploadError } = await supabase.storage.from('apostilas').upload(finalFilePath, pdfFile.buffer, { cacheControl: '3600', upsert: true, contentType: pdfFile.type });
      if (uploadError) throw new Error("Erro no Storage: " + uploadError.message);

      const tagsArray = typeof uploadForm.palavras_chave === 'string' ? uploadForm.palavras_chave.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      const { error: dbError } = await supabase.from('apostilas').insert([{ titulo_livro: uploadForm.titulo, categoria: uploadForm.categoria, palavras_chave: tagsArray, nome_arquivo_storage: finalFilePath }]);
      if (dbError) throw new Error("Erro na Base de Dados: " + dbError.message);

      mostrarToast("Apostila enviada com sucesso!", "sucesso");
      setUploadForm({ titulo: '', palavras_chave: '', categoria: '' });
      setPdfFile(null);
      if (inputFileRef.current) inputFileRef.current.value = '';
    } catch (error) { console.error("Erro detalhado:", error); mostrarToast("Erro: " + error.message, "erro"); } finally { setIsUploading(false); }
  };

  const handleUploadPromo = async (evento) => {
    const file = evento.target.files[0];
    if (!file) return;
    try {
      mostrarToast("A enviar imagem para o servidor...", "aviso");
      if (configAdmin.urlPromo) { const nomeAntigo = configAdmin.urlPromo.split('/').pop(); if (nomeAntigo) await supabase.storage.from('promocoes').remove([nomeAntigo]); }
      const extensao = file.name.split('.').pop(); const novoNome = `promo_${Date.now()}.${extensao}`;
      const { error: erroUpload } = await supabase.storage.from('promocoes').upload(novoNome, file);
      if (erroUpload) throw erroUpload;
      const { data } = supabase.storage.from('promocoes').getPublicUrl(novoNome);
      const novaUrl = data.publicUrl;
      setConfigAdmin({ ...configAdmin, urlPromo: novaUrl });
      const { error: erroDb } = await supabase.from('configuracoes_erp').update({ url_promo: novaUrl }).eq('id', 1);
      if (erroDb) { console.error("Erro no DB:", erroDb); mostrarToast("Upload feito, mas erro ao gravar no banco.", "erro"); } else { mostrarToast("Imagem ativada e salva na nuvem!", "sucesso"); }
    } catch (error) { console.error("Erro no upload:", error); mostrarToast("Erro ao enviar imagem.", "erro"); }
  };

  const [tarefaCorrente, setTarefaCorrente] = useState({ modulo: 'Folha', descricao: 'Lançamento de Salários', valorCorreto: 8500.00, debitoCorreto: '4.1.1.01', creditoCorreto: '2.1.2.01' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) processarSessao(session.user); });
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) processarSessao(session.user);
      else { setUserAuth(null); setAlunoNome(''); setIsGestor(false); setFaseLogin('autenticacao'); }
    });
  }, []);

  const processarSessao = (user) => {
    setUserAuth(user);
    const nomeAExibir = user.user_metadata?.nome || user.email.split('@')[0];
    setAlunoNome(nomeAExibir);
    if (user.email === 'admin@erp.com') { setIsGestor(true); setFaseLogin('logado'); } 
    else { setIsGestor(false); if (localStorage.getItem('checkoutPendente') === 'true') { setFaseLogin('checkout'); } else { setFaseLogin('logado'); } }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!inputEmail || !inputSenha) return mostrarToast("Preencha o e-mail e a senha.", "erro");
    if (isModoRegisto) {
      if (!inputNome) return mostrarToast("Preencha o seu nome.", "erro");
      if (inputEmail !== 'admin@erp.com' && !planoSelecionado) return mostrarToast("Escolha um plano.", "aviso");
      const { error } = await supabase.auth.signUp({ email: inputEmail, password: inputSenha, options: { data: { nome: inputNome } } });
      if (error) { mostrarToast("Erro no registo: " + error.message, "erro"); } else { mostrarToast("Conta criada com sucesso!", "sucesso"); if (inputEmail !== 'admin@erp.com') { localStorage.setItem('checkoutPendente', 'true'); setFaseLogin('checkout'); } }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: inputEmail, password: inputSenha });
      if (error) mostrarToast("Erro ao entrar: " + error.message, "erro");
    }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    if (!inputEmail) return mostrarToast("Insira o seu e-mail.", "aviso");
    const { error } = await supabase.auth.resetPasswordForEmail(inputEmail, { redirectTo: window.location.origin });
    if (error) mostrarToast("Erro: " + error.message, "erro"); else { mostrarToast("Link enviado!", "sucesso"); setIsModoRecuperacao(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleConfirmarCheckout = () => {
    const planoObj = configPlanos.find(p => p.id === planoSelecionado) || configPlanos[0];
    const emailAluno = inputEmail || userAuth?.email || 'Sem email';
    const nomeAluno = inputNome || alunoNome || 'Aluno';
    setFaturamentosAlunos(prev => [...prev, { id: Date.now(), email: emailAluno, nome: nomeAluno, plano: planoObj.nome, valor: planoObj.valor, status: "Pendente", ra: Math.floor(10000 + Math.random() * 90000).toString() }]);
    localStorage.removeItem('checkoutPendente');
    setFaseLogin('logado');
    mostrarToast("Você entrou no sistema. O Admin vai avaliar o seu pagamento.", "sucesso");
  };

  const excluirAlunoAdmin = (id) => {
    if(window.confirm("Atenção! Deseja remover este usuário permanentemente?")) { setFaturamentosAlunos(prev => prev.filter(a => a.id !== id)); mostrarToast("Usuário removido da base de dados.", "sucesso"); }
  };

  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState({ id: 'empresa-01', nome: 'Apoio Social (ONG)' });
  const [configEmpresas, setConfigEmpresas] = useState({}); 
  const [planoContas, setPlanoContas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0); 
  const [abaAtiva, setAbaAtiva] = useState(isGestor ? 'gerencial' : 'inicio');
  const [tutorAberto, setTutorAberto] = useState(false);
  const [roboAberto, setRoboAberto] = useState(false);

  const configAtiva = clienteSelecionado ? (configEmpresas[clienteSelecionado.id] || { modo: 'automatico', mesAtual: 1, pendenciasManuais: [] }) : { modo: 'automatico', mesAtual: 1, pendenciasManuais: [] };

  useEffect(() => { if (userAuth && faseLogin === 'logado') carregarInicial(); }, [userAuth, faseLogin]);
  useEffect(() => { if (clienteSelecionado && userAuth && faseLogin === 'logado') carregarLancamentos(clienteSelecionado.id, userAuth.id); }, [clienteSelecionado, userAuth, faseLogin]);

  const carregarInicial = async () => {
    setLoading(true);
    const { data: clientesDB } = await supabase.from('clientes_ficticios').select('*');
    if (clientesDB && clientesDB.length > 0) { setClientes(clientesDB); setClienteSelecionado(clientesDB[0]); }
    const { data: contasDB } = await supabase.from('plano_contas_base').select('*').order('codigo_contabil', { ascending: true });
    if (contasDB) setPlanoContas(contasDB);
    setLoading(false);
  };

  const carregarLancamentos = async (idCliente, idAluno) => {
    if (!idCliente) return;
    const { data: lancamentosDB, error } = await supabase.from('lancamentos_diario').select('*').or(`id_cliente.eq.${idCliente},id_cliente.eq.${clienteSelecionado?.nome_empresa}`).order('data_lancamento', { ascending: false }).limit(50);
    if (error) { console.error("Erro ao carregar o diário:", error); setHistorico([]); } else if (lancamentosDB && lancamentosDB.length > 0) { formatarHistorico(lancamentosDB); } else { setHistorico([]); }
  };

  const formatarHistorico = (lancamentosDB) => {
    const historicoFormatado = lancamentosDB.map(l => {
      const cDebito = planoContas.find(c => c.id === l.id_conta_debito || c.codigo_contabil === l.id_conta_debito);
      const cCredito = planoContas.find(c => c.id === l.id_conta_credito || c.codigo_contabil === l.id_conta_credito);
      return { id: l.id, data: l.data_lancamento, debito: cDebito?.codigo_contabil || '1.1.1.02', nomeDebito: cDebito?.nome_conta || 'Conta Operacional', credito: cCredito?.codigo_contabil || '2.1.1.01', nomeCredito: cCredito?.nome_conta || 'Fornecedores / Caixa', valor: parseFloat(l.valor) || 0, historico: l.historico };
    });
    setHistorico(historicoFormatado);
  };

  const handleTrocarCliente = (e) => {
    const cliente = clientes.find(c => c.id === e.target.value);
    setClienteSelecionado(cliente);
    mostrarToast(`Entidade alterada para ${cliente.nome_empresa}`, "sucesso");
  };

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
  };

  const criarNovaEmpresaParalegal = async () => {
    const nome = prompt("Nome da nova empresa gerada no Paralegal:");
    if (!nome) return;
    setLoading(true);
    const { data, error } = await supabase.from('clientes_ficticios').insert([{ id: generateUUID(), nome_empresa: nome, regime_tributario: 'Simples Nacional', saldo_caixa_inicial: 0, user_id: userAuth.id }]).select();
    if (error) mostrarToast("Erro ao criar empresa: " + error.message, "erro"); else if (data && data.length > 0) { setClientes(prev => [...prev, data[0]]); setClienteSelecionado(data[0]); setConfigEmpresas(prev => ({ ...prev, [data[0].id]: { modo: 'automatico', mesAtual: 1, pendenciasManuais: [] } })); mostrarToast(`Empresa criada e ativada!`, "sucesso"); }
    setLoading(false);
  };

  const excluirEmpresaParalegal = async () => {
    if (!clienteSelecionado) return;
    if (!clienteSelecionado.user_id) { return mostrarToast("A empresa matriz do sistema não pode ser excluída.", "aviso"); }
    if (window.confirm(`Tem a certeza que deseja excluir a empresa ${clienteSelecionado.nome_empresa} permanentemente?`)) {
      setLoading(true);
      await supabase.from('lancamentos_diario').delete().eq('id_cliente', clienteSelecionado.id);
      const { error } = await supabase.from('clientes_ficticios').delete().eq('id', clienteSelecionado.id);
      if (error) { mostrarToast("Erro ao excluir empresa: " + error.message, "erro"); } else { const novaLista = clientes.filter(c => c.id !== clienteSelecionado.id); setClientes(novaLista); setClienteSelecionado(novaLista[0]); mostrarToast("Empresa excluída com sucesso!", "sucesso"); }
      setLoading(false);
    }
  };

  const handleResetarTreinamento = async () => {
    if (!window.confirm(`⚠️ ATENÇÃO: Isto apagará os lançamentos de ${clienteSelecionado.nome_empresa}.`)) return;
    setLoading(true);
    await supabase.from('lancamentos_diario').delete().eq('id_cliente', clienteSelecionado.id).ilike('historico', `%ID: ${userAuth.id}%`);
    setXp(0); setConfigEmpresas(prev => ({ ...prev, [clienteSelecionado.id]: { ...configAtiva, pendenciasManuais: [] } }));
    carregarLancamentos(clienteSelecionado.id, userAuth.id); mostrarToast("Diário zerado com sucesso.", "sucesso"); setLoading(false);
  };

  const toggleModoEmpresa = () => {
    if (!clienteSelecionado) return;
    setConfigEmpresas(prev => ({ ...prev, [clienteSelecionado.id]: { ...configAtiva, modo: configAtiva.modo === 'automatico' ? 'manual' : 'automatico' } }));
    mostrarToast(`Modo alterado para ${configAtiva.modo === 'automatico' ? 'Manual (✍️)' : 'Automático (⚙️)'}`, "sucesso");
  };

  const registrarFatoGerador = async (descricao, valor, modulo, debitos = [], creditos = []) => {
    if (!clienteSelecionado) return;
    if (configAtiva.modo === 'manual') {
      const novaPendencia = { id: Date.now(), descricao, valor, modulo, data: new Date().toLocaleDateString('pt-BR'), debitosSugeridos: debitos, creditosSugeridos: creditos };
      setConfigEmpresas(prev => {
        const configAtualizada = prev[clienteSelecionado.id] || { modo: 'manual', mesAtual: 1, pendenciasManuais: [] };
        return { ...prev, [clienteSelecionado.id]: { ...configAtualizada, pendenciasManuais: [...configAtualizada.pendenciasManuais, novaPendencia] } };
      });
      return mostrarToast('Fato gerador enviado para a fila do Livro Diário!', 'aviso');
    } 
    try {
      if (planoContas.length === 0) return mostrarToast('Aguarde o carregamento do Plano de Contas...', 'aviso');
      const buscarOuCriarConta = async (codigo) => {
        if (!codigo) return null;
        let conta = planoContas.find(c => c.codigo_contabil === codigo);
        if (conta) return conta.id;
        const { data, error } = await supabase.from('plano_contas_base').insert([{ codigo_contabil: codigo, nome_conta: `Nova Conta Automática (${codigo})`, natureza: 'Devedora', grupo: 'Geral' }]).select();
        if (error) throw error;
        if (data && data.length > 0) { setPlanoContas(prev => [...prev, data[0]]); return data[0].id; }
        return null;
      };
      const idDebito = await buscarOuCriarConta(debitos[0]); const idCredito = await buscarOuCriarConta(creditos[0]);
      if (!idDebito || !idCredito) return mostrarToast(`Erro crítico: Não foi possível processar os IDs das contas.`, 'erro');
      const payload = { id: generateUUID(), id_cliente: clienteSelecionado.id, user_id: userAuth.id, data_lancamento: new Date().toISOString().split('T')[0], id_conta_debito: idDebito, id_conta_credito: idCredito, valor: Number(valor) || 0, historico: `${descricao} (Auto)` };
      const { error } = await supabase.from('lancamentos_diario').insert([payload]);
      if (error) { if (error.message.includes('row-level security') || error.message.includes('RLS')) { return mostrarToast('Bloqueado por Segurança (RLS). Desative o RLS da tabela lancamentos_diario.', 'erro'); } throw error; }
      mostrarToast('Lançamento automático registado com sucesso!', 'sucesso'); carregarLancamentos(clienteSelecionado.id, userAuth.id);
    } catch (err) { console.error("Erro Automático Detalhado:", err); mostrarToast('Erro na Base de Dados: ' + err.message, 'erro'); }
  };

  if (faseLogin === 'autenticacao') {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexWrap: 'wrap', backgroundColor: '#090d16', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' }}>
        {configAdmin.urlPromo && mostrarPromo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
              <button onClick={() => setMostrarPromo(false)} style={{ position: 'absolute', top: '-20px', right: '-20px', backgroundColor: '#ef4444', color: 'white', border: '3px solid white', borderRadius: '50%', width: '45px', height: '45px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>X</button>
              <img src={configAdmin.urlPromo} alt="Promoção Especial" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.9)' }} />
            </div>
          </div>
        )}
        <ToastNotificacao />
        <div style={{ flex: '1 1 520px', minHeight: '100vh', background: 'radial-gradient(circle at 15% 20%, #1e293b 0%, #0f172a 55%, #090d16 100%)', padding: 'clamp(30px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <LogoSistema />
              <div><h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>Contábil <span style={{ color: '#38bdf8' }}>Cloud</span></h1><span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>ERP Enterprise & Laboratório Acadêmico</span></div>
            </div>
          </div>
          <div style={{ my: 'auto', padding: '40px 0' }}>
            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '6px 14px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '18px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>🚀 Ecossistema Contábil, Fiscal & Financeiro</span>
            <h2 style={{ margin: '0 0 18px 0', fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-1px', color: '#f8fafc' }}>De Estudante a <br /><span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Controller de Elite.</span></h2>
            <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.65', maxWidth: '620px' }}>Domine a contabilidade consultiva, auditoria e gestão empresarial em um ambiente ERP realista. Partidas dobradas, apuração fiscal e Business Analytics em tempo real.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>
            <a href={`mailto:${configAdmin.emailContato}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>✉️ Comercial: {configAdmin.emailContato}</a><span>Ambiente Seguro SSL 256-bit</span>
          </div>
        </div>
        <div style={{ flex: '1 1 420px', minHeight: '100vh', backgroundColor: '#ffffff', padding: 'clamp(28px, 4vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '420px', margin: 'auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Portal de Acesso Seguro</span>
              <h3 style={{ margin: '6px 0 8px 0', color: '#0f172a', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' }}>{isModoRecuperacao ? 'Recuperar Senha' : isModoRegisto ? 'Criar Conta Acadêmica' : 'Bem-vindo de volta'}</h3>
            </div>
            {!isModoRecuperacao && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setIsModoRegisto(false)} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer', backgroundColor: !isModoRegisto ? '#ffffff' : 'transparent', color: !isModoRegisto ? '#0f172a' : '#64748b', boxShadow: !isModoRegisto ? '0 2px 6px rgba(0,0,0,0.06)' : 'none' }}>🔑 Já tenho conta</button>
                <button type="button" onClick={() => setIsModoRegisto(true)} style={{ padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer', backgroundColor: isModoRegisto ? '#ffffff' : 'transparent', color: isModoRegisto ? '#0f172a' : '#64748b', boxShadow: isModoRegisto ? '0 2px 6px rgba(0,0,0,0.06)' : 'none' }}>✨ Criar nova conta</button>
              </div>
            )}
            {isModoRecuperacao ? (
              <>
                <form onSubmit={handleRecuperarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="email" placeholder="seu@email.com" value={inputEmail} onChange={e => setInputEmail(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px' }} />
                  <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Enviar Link de Recuperação →</button>
                </form>
                <button onClick={() => setIsModoRecuperacao(false)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', marginTop: '20px', width: '100%', fontWeight: 'bold' }}>← Voltar para o Login</button>
              </>
            ) : (
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isModoRegisto && <input type="text" placeholder="Seu Nome Completo" value={inputNome} onChange={e => setInputNome(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', boxSizing: 'border-box' }} />}
                <input type="email" placeholder="nome@exemplo.com" value={inputEmail} onChange={e => setInputEmail(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', boxSizing: 'border-box' }} />
                <input type="password" placeholder="••••••••" value={inputSenha} onChange={e => setInputSenha(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '15px', boxSizing: 'border-box' }} />
                {isModoRegisto && inputEmail !== 'admin@erp.com' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Escolha o seu plano de assinatura:</span>
                    {configPlanos.map(plano => (
                      <label key={plano.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', border: planoSelecionado === plano.id ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: planoSelecionado === plano.id ? '#eff6ff' : '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><input type="radio" name="plano" value={plano.id} checked={planoSelecionado === plano.id} onChange={() => setPlanoSelecionado(plano.id)} /><span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{plano.nome}</span></div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>R$ {formatMoeda(plano.valor)}</span>
                      </label>
                    ))}
                  </div>
                )}
                <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15.5px' }}>{isModoRegisto ? 'Criar Conta e Iniciar Laboratório' : 'Acessar Painel do ERP'} →</button>
              </form>
            )}
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', marginTop: '40px' }}>
            <button onClick={() => setModalSuporte(true)} style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', border: 'none', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', cursor: 'pointer' }}>🎧 Suporte Técnico</button>
            <button onClick={() => setModalPrivacidade(true)} style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', border: 'none', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', cursor: 'pointer' }}>🔒 Privacidade e Segurança</button>
          </div>
        </div>
        {modalSuporte && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn 0.2s' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '18px' }}>💬 Suporte Técnico</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 15px 0' }}>Para tirar dúvidas, relatar problemas ou solicitar ajuda com os simuladores do ERP Cloud, entre em contato com o seu professor ou suporte técnico.</p>
              <p style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px', marginBottom: '25px' }}>E-mail: {configAdmin.emailSac}</p>
              <button onClick={() => setModalSuporte(false)} style={{ width: '100%', backgroundColor: '#38bdf8', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Compreendi, Fechar</button>
            </div>
          </div>
        )}
        {modalPrivacidade && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn 0.2s' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '18px' }}>🔒 Privacidade e Segurança</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 25px 0' }}>Este é um ambiente laboratorial. Os dados inseridos no ERP Cloud são estritamente para fins acadêmicos e de simulação. Nenhuma informação fiscal real é transmitida para os órgãos governamentais. Garantimos a proteção e o isolamento dos seus exercícios.</p>
              <button onClick={() => setModalPrivacidade(false)} style={{ width: '100%', backgroundColor: '#38bdf8', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Compreendi, Fechar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (faseLogin === 'checkout') {
    const pSel = configPlanos.find(p => p.id === planoSelecionado);
    const msgWpp = `Olá! Acabei de me matricular no plano ${pSel?.nome}. Meu email de acesso é ${inputEmail}. Segue meu comprovante de PIX...`;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <ToastNotificacao />
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <h2>Ativação do Laboratório</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Realize o pagamento via PIX para liberar o seu acesso imediato.</p>
          <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '2px dashed #3b82f6', color: '#1e3a8a', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', wordBreak: 'break-all' }}>{configAdmin.pix}</div>
          <a href={`https://wa.me/${configAdmin.whatsapp}?text=${encodeURIComponent(msgWpp)}`} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', padding: '12px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '10px', boxSizing: 'border-box' }}>💬 Enviar Comprovante no WhatsApp</a>
          <button onClick={handleConfirmarCheckout} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>Já paguei, entrar no sistema</button>
        </div>
      </div>
    );
  }

  if (loading || !clienteSelecionado || !userAuth) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A carregar o cofre central...</div>;

  const contasMovimentadas = planoContas.map(conta => {
    const debitos = historico.filter(t => t.debito === conta.codigo_contabil).reduce((acc, t) => acc + t.valor, 0);
    const creditos = historico.filter(t => t.credito === conta.codigo_contabil).reduce((acc, t) => acc + t.valor, 0);
    return { ...conta, debitos, creditos, saldo: debitos - creditos, saldoAbsoluto: Math.abs(debitos - creditos) };
  }).filter(c => c.debitos > 0 || c.creditos > 0);

  const ativos = contasMovimentadas.filter(c => c.grupo.includes('Ativo'));
  const passivos = contasMovimentadas.filter(c => c.grupo.includes('Passivo'));
  const patrimonioLiquido = contasMovimentadas.filter(c => c.grupo.includes('Patrimônio') || c.grupo === 'PL');
  const receitas = contasMovimentadas.filter(c => c.grupo.includes('Receita'));
  const despesas = contasMovimentadas.filter(c => c.grupo.includes('Despesa'));

  const totalReceitas = receitas.reduce((acc, c) => acc + c.saldoAbsoluto, 0);
  const totalDespesas = despesas.reduce((acc, c) => acc + c.saldoAbsoluto, 0);
  const resultadoExercicio = totalReceitas - totalDespesas;
  const saldoInicial = parseFloat(clienteSelecionado.saldo_caixa_inicial || 0);
  const totalAtivo = ativos.reduce((acc, c) => acc + c.saldoAbsoluto, 0) + saldoInicial;
  const totalPassivo = passivos.reduce((acc, c) => acc + c.saldoAbsoluto, 0);
  const totalPL = patrimonioLiquido.reduce((acc, c) => acc + c.saldoAbsoluto, 0) + saldoInicial;
  const entradasCaixa = historico.filter(t => t.debito === '1.1.1.01' || t.debito === '1.1.1.02').reduce((acc, t) => acc + Number(t.valor || 0), 0);
  const saidasCaixa = historico.filter(t => t.credito === '1.1.1.01' || t.credito === '1.1.1.02').reduce((acc, t) => acc + Number(t.valor || 0), 0);
  const saldoCaixaCalculado = saldoInicial + entradasCaixa - saidasCaixa;

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        .sidebar-btn-custom { background: transparent; color: #94a3b8; border: none; padding: 10px 14px; border-radius: 8px; text-align: left; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s ease; width: 100%; margin-bottom: 2px; }
        .sidebar-btn-custom:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
        .sidebar-btn-custom.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
        .sidebar-cat-custom { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 8px 12px; }
        .sidebar-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
        .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .erp-kpi-card { background-color: #ffffff; padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .erp-kpi-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
        .erp-kpi-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: transparent; transition: background 0.3s ease; }
        .erp-kpi-card:nth-child(1):hover::before { background: #3b82f6; }
        .erp-kpi-card:nth-child(2):hover::before { background: ${resultadoExercicio >= 0 ? '#16a34a' : '#dc2626'}; }
        .erp-kpi-card:nth-child(3):hover::before { background: #a855f7; }
        .erp-kpi-card:nth-child(4):hover::before { background: #f97316; }
        .erp-icon-wrapper { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <ToastNotificacao /> 

      <header className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', flexShrink: 0, zIndex: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="menu-toggle-btn" onClick={() => setMenuMobileAberto(!menuMobileAberto)} style={{ backgroundColor: 'transparent', border: 'none', color: 'white', padding: '4px', cursor: 'pointer', fontSize: '20px' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogoSistema />
            <span style={{ fontWeight: '900', fontSize: '18px', color: '#f8fafc' }}>Contábil <span style={{ color: '#38bdf8' }}>Cloud</span></span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px' }}>👤</span>
          <strong style={{ fontSize: '13px', color: '#ffffff' }}>{alunoNome ? alunoNome.split(' ')[0] : ''} {isGestor && '(Admin)'}</strong>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', padding: '4px' }} title="Sair">✖</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className={`sidebar-scroll no-print app-sidebar ${menuMobileAberto ? 'mobile-open' : ''}`} style={{ width: '280px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', overflowY: 'auto', padding: '10px 16px 90px 16px', transition: 'all 0.3s', flexShrink: 0 }}>
          {isGestor && (
            <>
              <div className="sidebar-cat-custom" style={{ color: '#38bdf8' }}>Painel do Gestor (Admin)</div>
              <Link to="/painel-admin" style={{ textDecoration: 'none' }}>
                <button onClick={() => setMenuMobileAberto(false)} className={`sidebar-btn-custom ${location.pathname === '/painel-admin' ? 'active' : ''}`}>
                  <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>⚙️</span> Configurações & Alunos
                </button>
              </Link>
              <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>
            </>
          )}
          {[
            { titulo: "🏢 Gestão & Estratégia", itens: [{ id: 'inicio', icone: '🏠', label: 'Comando Central', path: '/' }, { id: 'dashboard', icone: '📊', label: 'Dashboard Analítico', path: '/dashboard' }, { id: 'canvas_simulator', icone: '🎯', label: 'Business Canvas', path: '/simulador-business-canvas' }, { id: 'pdca_realista', icone: '🔄', label: 'Ciclo PDCA', path: '/simulador-pdca' }, { id: 'pmp_10passos', icone: '📋', label: 'Projetos (PMBOK)', path: '/simulador-gestao-projetos-pmp' }, { id: 'esg_carbono', icone: '🌳', label: 'Balanço Social & ESG', path: '/simulador-esg-carbono' }, { id: 'consultoria', icone: '💡', label: 'Consultoria Estratégica', path: '/simulador-consultoria-contabil' }, { id: 'greenbelt', icone: '🥋', label: 'Gestão da Qualidade', path: '/simulador-green-belt' }, { id: 'qualidade_tools', icone: '🛠️', label: 'Ferram. da Qualidade', path: '/simulador-ferramentas-qualidade' }, { id: 'ceo', icone: '👔', label: 'Simulador CEO', path: '/simulador-ceo' }, { id: 'servicos', icone: '🚀', label: 'Hub seviços', path: '/servicos-iniciais' }] },
            { titulo: "🏛️ Legal & Societário", itens: [{ id: 'legalizacao', icone: '⚖️', label: 'Paralegal & Abertura', path: '/simulador-legalizacao' }, { id: 'portaisgov', icone: '🏛️', label: 'MEI / REDESIM', path: '/simulador-portais-gov' }, { id: 'certificados', icone: '🔐', label: 'Certificados Digitais', path: '/gestao-certificados' }, { id: 'onboarding', icone: '📝', label: 'Onboarding & Contratos', path: '/simulador-onboarding-contratos' }, { id: 'compliance_leasing', icone: '🤝', label: 'Leasing & Compliance', path: '/simulador-contratos-leasing' }, { id: 'direito', icone: '⚖️', label: 'Direito & Elisão Fiscal', path: '/simulador-direito-tributario' }, { id: 'direito_empresarial', icone: '🏢', label: 'Direito Societário', path: '/simulador-direito-empresarial' }, { id: 'comex', icone: '🚢', label: 'Comércio Exterior', path: '/simulador-comex-cambio' }] },
            { titulo: "💼 Contabilidade Oficial", itens: [{ id: 'diario', icone: '📖', label: 'Livro Diário', path: '/simulador-livro-diario' }, { id: 'kardex', icone: '📦', label: 'Ficha Kardex', path: '/simulador-kardex' }, { id: 'depreciacao', icone: '🏢', label: 'Imobilizado (CPC 27)', path: '/simulador-depreciacao' }, { id: 'encerramento', icone: '🏁', label: 'Encerramento (ARE)', path: '/simulador-encerramento-exercicio' }, { id: 'demonstracoes', icone: '📑', label: 'Balanço & DRE', path: '/demonstracoes-contabeis' }, { id: 'analise', icone: '🔎', label: 'Auditoria de Balanço', path: '/simulador-analise-balanco' }, { id: 'infoprodutos', icone: '🛒', label: 'Contab. Infoprodutos', path: '/simulador-infoprodutos' }, { id: 'criptoativos', icone: '⛓️', label: 'Contab. Criptoativos', path: '/simulador-criptoativos' }, { id: 'ia_contabil', icone: '🤖', label: 'IA na Contabilidade', path: '/simulador-engenharia-prompt-ia-contabil' }, { id: 'rural', icone: '🌾', label: 'Contabilidade Rural', path: '/simulador-contabilidade-rural-lcdpr' }, { id: 'publica', icone: '🏛️', label: 'Contabilidade Pública', path: '/simulador-contabilidade-publica-mcasp' }] },
            { titulo: "🧾 Fiscal & Tributário", itens: [{ id: 'notas', icone: '🧾', label: 'Emissor de Notas', path: '/simulador-emissao-notas' }, { id: 'simples', icone: '🏢', label: 'Simples Nacional', path: '/simulador-simples-nacional' }, { id: 'lalur', icone: '⚖️', label: 'Lucro Real (e-LALUR)', path: '/simulador-lalur' }, { id: 'eng_tributaria', icone: '🧠', label: 'Engenharia Tributária', path: '/simulador-engenharia-tributaria' }, { id: 'reforma', icone: '🔄', label: 'Reforma (IBS/CBS)', path: '/simulador-reforma-tributaria' }, { id: 'sped', icone: '💻', label: 'SPED Digital', path: '/simulador-sped' }, { id: 'irpf', icone: '🦁', label: 'Imposto de Renda PF', path: '/simulador-irpf' }, { id: 'malhafina', icone: '🕵️', label: 'Malha Fina', path: '/simulador-malha-fina' }] },
            { titulo: "👥 Pessoal & Custos", itens: [{ id: 'dp', icone: '👨‍💼', label: 'Folha de Pagamento', path: '/simulador-folha-pagamento' }, { id: 'esocial', icone: '👥', label: 'eSocial & DCTFWeb', path: '/simulador-esocial-dctfweb' }, { id: 'rescisao', icone: '✂️', label: 'Rescisões (TRCT)', path: '/simulador-rescisao-trabalhista' }, { id: 'custos', icone: '🏭', label: 'Custeio Industrial', path: '/simulador-custeio' }, { id: 'rateio', icone: '📐', label: 'Rateio de Custos', path: '/simulador-rateio-custos' }, { id: 'equilibrio', icone: '⚖️', label: 'Ponto de Equilíbrio', path: '/simulador-ponto-equilibrio' }] },
            { titulo: "💰 Finanças & Economia", itens: [{ id: 'financeiro', icone: '💸', label: 'Fluxo de Caixa Livre', path: '/simulador-financeiro' }, { id: 'conciliacao', icone: '🏦', label: 'Conciliação Bancária (OFX)', path: '/simulador-conciliacao-ofx' }, { id: 'emprestimo', icone: '💳', label: 'Empréstimos e Financiamentos', path: '/simulador-emprestimo' }, { id: 'investimentos', icone: '📈', label: 'Aplicações / Tesouraria', path: '/simulador-investimentos' }, { id: 'valuation_fcd', icone: '💎', label: 'Valuation & M&A', path: '/simulador-valuation' }, { id: 'viabilidade', icone: '📊', label: 'VPL, TIR & Payback', path: '/simulador-viabilidade' }, { id: 'economia_macro', icone: '🌍', label: 'Cenários Macroeconômicos', path: '/simulador-economia-macro' }, { id: 'economia_micro', icone: '🔍', label: 'Dinâmica de Mercado', path: '/simulador-economia-micro' }, { id: 'estatistica_avancada', icone: '📉', label: 'Estatística e Dados', path: '/simulador-estatistica-avancada' }, { id: 'mercadocapitais', icone: '📊', label: 'Mercado de Capitais', path: '/simulador-mercado-capitais' }, { id: 'educacao_financeira', icone: '👨‍💼', label: 'Educação Financeira', path: '/laboratorio-educacao-financeira' }] },
            { titulo: "🧪 Laboratórios de Simulação", itens: [{ id: 'laboratoriolancamentos', icone: '📝', label: 'Lab. Partidas Dobradas', path: '/laboratorio-lancamentos' }, { id: 'laboratorio', icone: '🧩', label: 'Lab. Plano de Contas', path: '/laboratorio-plano-contas' }, { id: 'laboratoriodre', icone: '📊', label: 'Lab. da DRE', path: '/laboratorio-dre' }, { id: 'laboratoriodfc', icone: '🚰', label: 'Lab. Fluxo de Caixa', path: '/laboratorio-dfc' }, { id: 'laboratoriocustos', icone: '🏭', label: 'Lab. de Custos', path: '/laboratorio-custos' }, { id: 'laboratoriorh', icone: '👥', label: 'Lab. Dep. Pessoal', path: '/laboratorio-folha' }, { id: 'laboratoriofiscal', icone: '⚖️', label: 'Lab. Tributário (IVA)', path: '/laboratorio-tributario' }, { id: 'laboratorioconciliacao', icone: '🔍', label: 'Lab. Conciliação', path: '/laboratorio-conciliacao' }, { id: 'laboratoriocpc', icone: '📚', label: 'Lab. Normas IFRS/CPC', path: '/laboratorio-cpc' }] },
            { titulo: "Perícia contábil", itens: [{ id: 'pericia_atualizacao', icone: '⚖️', label: 'Atualização Judiciária', path: '/simulador-atualizacao-judiciaria' }] },
            { titulo: "🎓 Academia & Conhecimento", itens: [{ id: 'missoes', icone: '🎮', label: 'Missões & XP', path: '/missoes' }, { id: 'games', icone: '🎮', label: 'Games', path: '/jogos-contabilidade-financas' }, { id: 'crc', icone: '🎯', label: 'Desafio Exame CRC', path: '/simulador-exame-crc' }, { id: 'hp12c', icone: '🧮', label: 'Calculadora HP 12c', path: '/simulador-hp12c' }, { id: 'ebook', icone: '📕', label: 'Caderno de Anotações', path: '/ebook-pratico' }, { id: 'apostilas', icone: '📚', label: 'Apostilas & Manuais', path: '/centro-conhecimento-apostilas' }, { id: 'normas', icone: '📖', label: 'Normas (NBC TG)', path: '/central-normas-contabeis' }, { id: 'chatApostilas', icone: '💬', label: 'Tutor IA (PDFs)', path: '/busca-apostilas-chat' }] }
          ].map((grupo, idx) => (
            <div key={idx}>
              <div className="sidebar-cat-custom">{grupo.titulo}</div>
              {grupo.itens.map(item => (
                <Link key={item.id} to={item.path} style={{ textDecoration: 'none' }}>
                  <button onClick={() => setMenuMobileAberto(false)} className={`sidebar-btn-custom ${location.pathname === item.path ? 'active' : ''}`}>
                    <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icone}</span> {item.label}
                  </button>
                </Link>
              ))}
            </div>
          ))}
          {!isGestor && configAtiva.modo === 'manual' && configAtiva.pendenciasManuais.length > 0 && (
            <div style={{ marginTop: '30px', backgroundColor: 'rgba(245,158,11,0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#fbbf24', display: 'block', marginBottom: '8px' }}>🦉 TUTOR AVISA:</span>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#fcd34d', lineHeight: '1.5' }}>Há <strong>{configAtiva.pendenciasManuais.length}</strong> fato(s) gerador(es) na fila. Vá ao Livro Diário!</p>
            </div>
          )}
        </aside>

        <main onScroll={handleScrollMain} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#f1f5f9', position: 'relative' }}>
          <div style={{ flex: '1 0 auto' }}>
            {!isGestor && (
              <div className="no-print" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 1050, transition: 'transform 0.3s ease-in-out', transform: mostrarSmartHeader ? 'translateY(0)' : 'translateY(-100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '16px' }}>🏢</span>
                  <select value={clienteSelecionado?.id || ''} onChange={handleTrocarCliente} style={{ backgroundColor: 'transparent', color: '#0f172a', border: 'none', fontWeight: '900', fontSize: '15px', outline: 'none', cursor: 'pointer', width: '100%', textOverflow: 'ellipsis', appearance: 'none' }}>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome_empresa}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
                  <button onClick={criarNovaEmpresaParalegal} title="Adicionar Empresa" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}>➕</button>
                  <button onClick={toggleModoEmpresa} title={configAtiva.modo === 'automatico' ? 'Automático' : 'Manual'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}>{configAtiva.modo === 'automatico' ? '⚙️' : '✍️'}</button>
                  <button onClick={handleResetarTreinamento} title="Zerar Lançamentos" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}>🧹</button>
                  <button onClick={excluirEmpresaParalegal} title="Excluir Empresa" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0, color: '#ef4444' }}>🗑️</button>
                </div>
              </div>
            )}
           
            <div style={{ padding: '5px', width: '100%', maxWidth: '1650px', margin: '0 auto', boxSizing: 'border-box' }}>
              <Routes>
                <Route path="/painel-admin" element={
                  isGestor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', maxWidth: '1200px', margin: '0 auto' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '38px' }}>⚙️</span>
                        <div><h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>Painel Admin</h2><p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Gestão de ERP</p></div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                        <button onClick={() => setAbaAdminAtiva('alunos')} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: abaAdminAtiva === 'alunos' ? '#2563eb' : 'transparent', color: abaAdminAtiva === 'alunos' ? 'white' : '#64748b' }}>👥 Alunos</button>
                        <button onClick={() => setAbaAdminAtiva('financeiro')} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: abaAdminAtiva === 'financeiro' ? '#10b981' : 'transparent', color: abaAdminAtiva === 'financeiro' ? 'white' : '#64748b' }}>💰 Vendas/PIX</button>
                        <button onClick={() => setAbaAdminAtiva('marketing')} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: abaAdminAtiva === 'marketing' ? '#ec4899' : 'transparent', color: abaAdminAtiva === 'marketing' ? 'white' : '#64748b' }}>📢 Marketing</button>
                        <button onClick={() => setAbaAdminAtiva('biblioteca')} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: abaAdminAtiva === 'biblioteca' ? '#8b5cf6' : 'transparent', color: abaAdminAtiva === 'biblioteca' ? 'white' : '#64748b' }}>📚 Apostilas</button>
                        <button onClick={() => setAbaAdminAtiva('config')} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: abaAdminAtiva === 'config' ? '#f59e0b' : 'transparent', color: abaAdminAtiva === 'config' ? 'white' : '#64748b' }}>⚙️ Config</button>
                      </div>
                      {abaAdminAtiva === 'alunos' && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Alunos</h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                              <thead><tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}><th style={{ padding: '12px' }}>Nome</th><th style={{ padding: '12px' }}>E-mail</th><th style={{ padding: '12px' }}>Plano</th><th style={{ padding: '12px' }}>Status</th><th style={{ padding: '12px' }}>Ações</th></tr></thead>
                              <tbody>
                                {faturamentosAlunos.map(aluno => (
                                  <tr key={aluno.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{aluno.nome}</td><td style={{ padding: '12px' }}>{aluno.email}</td><td style={{ padding: '12px' }}>{aluno.plano}</td><td style={{ padding: '12px' }}>{aluno.status}</td>
                                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}><button style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => excluirAlunoAdmin(aluno.id)}>Excluir</button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {abaAdminAtiva === 'financeiro' && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h3 style={{ margin: '0 0 15px 0' }}>Preços e PIX</h3>
                          <InputCustomizado label="PIX" value={configAdmin.pix} onChange={e => setConfigAdmin({...configAdmin, pix: e.target.value})} />
                          <InputCustomizado label="WhatsApp" value={configAdmin.whatsapp} onChange={e => setConfigAdmin({...configAdmin, whatsapp: e.target.value})} />
                          <InputCustomizado label="Preço Básico" type="number" value={configAdmin.precoBasico} onChange={e => setConfigAdmin({...configAdmin, precoBasico: e.target.value})} />
                          <button onClick={salvarConfiguracoesGlobais} style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Salvar</button>
                        </div>
                      )}
                      {abaAdminAtiva === 'marketing' && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h3 style={{ margin: '0 0 15px 0' }}>Marketing</h3>
                          <input type="file" accept="image/*" onChange={handleUploadPromo} />
                        </div>
                      )}
                      {abaAdminAtiva === 'biblioteca' && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h3 style={{ margin: '0 0 15px 0' }}>Upload de Apostilas</h3>
                          <input type="text" placeholder="Título" value={uploadForm.titulo} onChange={e => setUploadForm({...uploadForm, titulo: e.target.value})} style={{ display:'block', marginBottom: '10px' }}/>
                          <select value={uploadForm.categoria} onChange={e => setUploadForm({...uploadForm, categoria: e.target.value})} style={{ display:'block', marginBottom: '10px' }}>
                            <option value="">Selecione...</option><option value="Contabilidade">Contabilidade</option><option value="Fiscal">Fiscal</option>
                          </select>
                          <input type="file" ref={inputFileRef} accept=".pdf" onChange={e => {
                                const arquivo = e.target.files && e.target.files[0];
                                if (arquivo) {
                                  const leitor = new FileReader();
                                  leitor.onload = (ev) => { setPdfFile({ name: arquivo.name, type: arquivo.type, buffer: ev.target.result }); };
                                  leitor.readAsArrayBuffer(arquivo);
                                }
                              }} style={{ display:'block', marginBottom: '10px' }} 
                            />
                        </div>
                      )}
                      {abaAdminAtiva === 'config' && (
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h3 style={{ margin: '0 0 15px 0' }}>E-mails</h3>
                          <InputCustomizado label="Comercial" value={configAdmin.emailContato} onChange={e => setConfigAdmin({...configAdmin, emailContato: e.target.value})} />
                          <button onClick={salvarConfiguracoesGlobais} style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Salvar Emails</button>
                        </div>
                      )}
                    </div>
                  ) : <Navigate to="/" />
                } />

                <Route path="/" element={
                  !isGestor && clienteSelecionado ? (() => {
                    const eCaixa = historico.filter(t => t.debito === '1.1.1.01' || t.debito === '1.1.1.02').reduce((acc, t) => acc + Number(t.valor || 0), 0);
                    const sCaixa = historico.filter(t => t.credito === '1.1.1.01' || t.credito === '1.1.1.02').reduce((acc, t) => acc + Number(t.valor || 0), 0);
                    const saldoCx = Number(saldoInicial || 0) + eCaixa - sCaixa;
                    const plResultado = Number(totalPL || 0) + Number(resultadoExercicio || 0);
                    const difB = Math.abs(Number(totalAtivo || 0) - (Number(totalPassivo || 0) + plResultado));
                    const indSolv = Number(totalPassivo) > 0 ? (Number(totalAtivo) / Number(totalPassivo)).toFixed(2) : '∞';
                    const formatM = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const listaPendencias = typeof pendencias !== 'undefined' ? pendencias : (configAtiva?.pendenciasManuais || []);
                    const modoAtual = typeof modo !== 'undefined' ? modo : (configAtiva?.modo || 'automatico');
                    const ultimosLancamentos = historico.slice(0, 4);
                  
                    return (
                      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ backgroundColor: '#ffffff', padding: 'clamp(24px, 4vw, 32px)', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '350px', height: '100%', background: 'linear-gradient(90deg, transparent, #f8fafc)', pointerEvents: 'none' }}></div>
                          <div style={{ zIndex: 1, minWidth: 0, flex: '1 1 300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', border: '1px solid #e2e8f0' }}>COMMAND CENTER</span>
                              <span style={{ backgroundColor: difB < 0.05 ? '#f0fdf4' : '#fef2f2', color: difB < 0.05 ? '#16a34a' : '#dc2626', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${difB < 0.05 ? '#bbf7d0' : '#fecaca'}` }}>{difB < 0.05 ? 'Balanço Conciliado' : '⚠️ Divergência Encontrada'}</span>
                            </div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a', wordBreak: 'break-word' }}>{clienteSelecionado.nome_empresa}</h2>
                            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontWeight: 'bold' }}>{historico.length}</span> fatos contábeis escriturados
                            </div>
                          </div>
                          <div style={{ zIndex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px 24px', borderRadius: '16px', flex: '1 1 300px', maxWidth: '450px', boxSizing: 'border-box' }}>
                            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}><span>Equação Patrimonial (NBC TG)</span><span style={{ color: '#94a3b8' }}>A = P + PL</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>Σ Aplicações (Ativo)</span><span style={{ fontWeight: '800', fontSize: 'clamp(16px, 2vw, 20px)', color: '#0f172a' }}>R$ {formatM(totalAtivo)}</span></div>
                              <div style={{ color: '#cbd5e1', fontSize: '20px', fontWeight: '300' }}>=</div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}><span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>Σ Origens (Passivo + PL)</span><span style={{ fontWeight: '800', fontSize: 'clamp(16px, 2vw, 20px)', color: '#0f172a' }}><span style={{ color: '#dc2626' }}>{formatM(totalPassivo)}</span> <span style={{ color: '#cbd5e1', margin: '0 6px', fontSize: '14px' }}>+</span> <span style={{ color: '#16a34a' }}>{formatM(plResultado)}</span></span></div>
                            </div>
                          </div>
                        </div>
                  
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                          <div className="erp-kpi-card"><div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}><div className="erp-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}><span style={{ fontSize: '22px' }}>💰</span></div><div><div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Caixa e Equivalentes</div><div style={{ fontSize: '24px', fontWeight: '900', color: saldoCx >= 0 ? '#0f172a' : '#dc2626' }}>R$ {formatM(saldoCx)}</div></div></div></div>
                          <div className="erp-kpi-card"><div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}><div className="erp-icon-wrapper" style={{ backgroundColor: resultadoExercicio >= 0 ? '#f0fdf4' : '#fef2f2', color: resultadoExercicio >= 0 ? '#16a34a' : '#dc2626', border: `1px solid ${resultadoExercicio >= 0 ? '#bbf7d0' : '#fecaca'}` }}><span style={{ fontSize: '22px' }}>📈</span></div><div><div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Resultado (DRE)</div><div style={{ fontSize: '24px', fontWeight: '900', color: resultadoExercicio >= 0 ? '#16a34a' : '#dc2626' }}>R$ {formatM(resultadoExercicio)}</div></div></div></div>
                          <div className="erp-kpi-card"><div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}><div className="erp-icon-wrapper" style={{ backgroundColor: '#faf5ff', color: '#a855f7', border: '1px solid #e9d5ff' }}><span style={{ fontSize: '22px' }}>🏛️</span></div><div><div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Patrimônio Líquido</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>R$ {formatM(plResultado)}</div></div></div></div>
                          <div className="erp-kpi-card"><div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}><div className="erp-icon-wrapper" style={{ backgroundColor: '#fff7ed', color: '#f97316', border: '1px solid #ffedd5' }}><span style={{ fontSize: '22px' }}>⚖️</span></div><div><div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Índice de Solvência</div><div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{indSolv}x</div></div></div></div>
                        </div>
                  
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', marginTop: '8px' }}>
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>🦉</span> Fatos Geradores Pendentes</h3>
                              <span style={{ backgroundColor: modoAtual === 'manual' ? '#fef3c7' : '#f1f5f9', color: modoAtual === 'manual' ? '#92400e' : '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{modoAtual === 'manual' ? 'Modo Manual Ativo' : 'Modo Automático'}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {listaPendencias.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}><span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✅</span><strong style={{ color: '#475569', fontSize: '14px' }}>Tudo em dia!</strong></div>
                              ) : (
                                listaPendencias.map(p => (
                                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
                                    <div><strong style={{ fontSize: '13px', color: '#92400e', display: 'block' }}>{p.descricao}</strong><span style={{ fontSize: '11px', color: '#b45309' }}>Módulo: {p.modulo}</span></div><strong style={{ fontSize: '14px', color: '#dc2626' }}>R$ {formatM(p.valor)}</strong>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                  
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>⚡</span> Últimas Operações</h3>
                              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>No Diário</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {ultimosLancamentos.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '13px' }}>Nenhum lançamento registrado no sistema ainda.</div>
                              ) : (
                                ultimosLancamentos.map(l => (
                                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#3b82f6' }}></div>
                                    <div style={{ paddingLeft: '8px', paddingRight: '8px', flex: 1, minWidth: 0 }}>
                                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.historico || l.nomeDebito}>{l.historico ? l.historico.replace(/\[ID:.*\]/, '') : `Lançamento: ${l.nomeDebito}`}</strong>
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(l.data).toLocaleDateString('pt-BR')} • {l.debito} / {l.credito}</span>
                                    </div>
                                    <strong style={{ fontSize: '14px', color: '#16a34a', whiteSpace: 'nowrap' }}>R$ {formatM(l.valor)}</strong>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })() : <div style={{textAlign: 'center', marginTop: '50px'}}>Carregando o cofre central...</div>
                } />
                
                <Route path="/dashboard" element={<DashboardPrincipal clienteSelecionado={clienteSelecionado} />} />
                <Route path="/missoes" element={!isGestor && <MotorMissoes historico={historico} xp={xp} setXp={setXp} />} />
                <Route path="/simulador-simples-nacional" element={<SimuladorSimples mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} clienteSelecionado={clienteSelecionado} />} />
                <Route path="/simulador-folha-pagamento" element={!isGestor && <SimuladorFolhaPagamento />} />
                <Route path="/simulador-custeio" element={!isGestor && <SimuladorCustos mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-ponto-equilibrio" element={!isGestor && <SimuladorPontoEquilibrio />} />
                <Route path="/simulador-rateio-custos" element={!isGestor && <SimuladorRateioCustos />} />
                <Route path="/simulador-analise-balanco" element={!isGestor && <SimuladorAnaliseBalanco />} />
                <Route path="/simulador-hp12c" element={!isGestor && <SimuladorHP12c mostrarToast={mostrarToast} />} />
                <Route path="/simulador-ferramentas-qualidade" element={!isGestor && <SimuladorFerramentasQualidade mostrarToast={mostrarToast} />} />
                <Route path="/simulador-depreciacao" element={!isGestor && <SimuladorDepreciacao mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-emprestimo" element={!isGestor && <SimuladorEmprestimo mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-investimentos" element={!isGestor && <SimuladorInvestimentos mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-viabilidade" element={!isGestor && <SimuladorViabilidade />} />
                <Route path="/simulador-legalizacao" element={<SimuladorLegalizacao mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} clienteSelecionado={clienteSelecionado} />} />
                <Route path="/simulador-financeiro" element={!isGestor && <SimuladorFinanceiro mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-reforma-tributaria" element={!isGestor && <SimuladorReformaTributaria />} />
                <Route path="/simulador-exame-crc" element={!isGestor && <SimuladorCRC xp={xp} setXp={setXp} />} />
                <Route path="/simulador-malha-fina" element={!isGestor && <SimuladorMalhaFina />} />
                <Route path="/gestao-certificados" element={!isGestor && <GestaoCertificados />} />
                <Route path="/simulador-ceo" element={!isGestor && <SimuladorCEO registrarFatoGerador={registrarFatoGerador} mostrarToast={mostrarToast} />} />
                <Route path="/simulador-direito-tributario" element={!isGestor && <SimuladorDireitoTributario mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-matematica-financeira" element={!isGestor && <SimuladorMatematicaFinanceira />} />
                <Route path="/simulador-engenharia-tributaria" element={!isGestor && <SimuladorEngenhariaTributaria mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/ebook-pratico" element={!isGestor && <EbookPratico />} />
                <Route path="/simulador-direito-empresarial" element={!isGestor && <SimuladorDireitoEmpresarial registrarFatoGerador={registrarFatoGerador} mostrarToast={mostrarToast} />} />
                <Route path="/central-normas-contabeis" element={!isGestor && <CentralNormasContabeis />} />
                <Route path="/simulador-infoprodutos" element={!isGestor && <SimuladorInfoprodutos registrarFatoGerador={registrarFatoGerador} mostrarToast={mostrarToast} />} />
                <Route path="/simulador-criptoativos" element={!isGestor && <SimuladorCriptoativos registrarFatoGerador={registrarFatoGerador} mostrarToast={mostrarToast} />} />
                <Route path="/busca-apostilas-chat" element={!isGestor && <BuscaApostilasChat />} />
                <Route path="/simulador-economia-micro" element={!isGestor && <SimuladorEconomiaMicro mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-portais-gov" element={<SimuladorPortaisGov mostrarToast={mostrarToast} />} />
                <Route path="/simulador-irpf" element={!isGestor && <SimuladorIRPF mostrarToast={mostrarToast} />} />
                <Route path="/simulador-esocial-dctfweb" element={!isGestor && <SimuladorEsocialDCTFWeb mostrarToast={mostrarToast} />} />
                <Route path="/simulador-encerramento-exercicio" element={!isGestor && <SimuladorEncerramento historico={historico} planoContas={planoContas} registrarFatoGerador={registrarFatoGerador} mostrarToast={mostrarToast} />} />
                <Route path="/simulador-emissao-notas" element={!isGestor && <SimuladorEmissaoNotas mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-sped" element={!isGestor && <SimuladorSPED mostrarToast={mostrarToast} />} />
                <Route path="/simulador-business-canvas" element={<SimuladorCanvasCompleto mostrarToast={mostrarToast} />} />
                <Route path="/simulador-pdca" element={<SimuladorPDCARealista mostrarToast={mostrarToast} />} />
                <Route path="/simulador-gestao-projetos-pmp" element={<SimuladorPMP10Passos mostrarToast={mostrarToast} />} />
                <Route path="/laboratorio-folha" element={<LaboratorioFolha mostrarToast={mostrarToast} />} />
                <Route path="/servicos-iniciais" element={<ServicosIniciais mostrarToast={mostrarToast} />} />
                <Route path="/laboratorio-educacao-financeira" element={<LaboratorioEducacaoFinanceira mostrarToast={mostrarToast} />} />
                <Route path="/simulador-mercado-capitais" element={<LaboratorioMercadoCapitais mostrarToast={mostrarToast} />} />
                <Route path="/laboratorio-ia-contabil" element={<LaboratorioIAContabil mostrarToast={mostrarToast} />} />
                <Route path="/simulador-contabilidade-rural-lcdpr" element={<LaboratorioContabilidadeRural mostrarToast={mostrarToast} />} />
                <Route path="/jogos-contabilidade-financas" element={<LaboratorioGamesContabeis mostrarToast={mostrarToast} />} />
                <Route path="/simulador-contabilidade-publica-mcasp" element={<LaboratorioContabilidadePublica mostrarToast={mostrarToast} />} />
                <Route path="/simulador-atualizacao-judiciaria" element={<SimuladorAtualizacaoJudiciaria />} />
                <Route path="/laboratorio-lancamentos" element={!isGestor && <LaboratorioLancamentos />} />
                <Route path="/laboratorio-cpc" element={!isGestor && <LaboratorioCPC />} />
                <Route path="/laboratorio-conciliacao" element={!isGestor && <LaboratorioConciliacao />} />
                <Route path="/laboratorio-tributario" element={!isGestor && <LaboratorioTributario />} />
                <Route path="/laboratorio-dre" element={!isGestor && <LaboratorioDRE />} />
                <Route path="/laboratorio-custos" element={!isGestor && <LaboratorioCustos />} />
                <Route path="/laboratorio-dfc" element={!isGestor && <LaboratorioDFC />} />
                <Route path="/simulador-estatistica-avancada" element={<SimuladorEstatisticaAvancada mostrarToast={mostrarToast} />} />
                <Route path="/demonstracoes-contabeis" element={<DemonstracoesContabeis historico={historico} capitalSocial={totalPL} empresa={clienteSelecionado} />} />
                <Route path="/centro-conhecimento-apostilas" element={<CentroConhecimentoApostilas isAdmin={isGestor} />} />
                <Route path="/laboratorio-plano-contas" element={!isGestor && <LaboratorioPlanoContas />} />
                <Route path="/simulador-rescisao-trabalhista" element={<SimuladorRescisaoDP mostrarToast={mostrarToast}/>} />
                <Route path="/simulador-economia-macro" element={!isGestor && <SimuladorEconomiaMacro mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-comex-cambio" element={!isGestor && <SimuladorComexCambio mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-consultoria-contabil" element={!isGestor && <SimuladorConsultoriaContabil mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-onboarding-contratos" element={!isGestor && <SimuladorOnboardingContratos mostrarToast={mostrarToast} />} />
                <Route path="/simulador-green-belt" element={!isGestor && <SimuladorGreenBelt mostrarToast={mostrarToast} />} />
                <Route path="/simulador-esg-carbono" element={!isGestor && <SimuladorESGCarbono mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-contratos-leasing" element={!isGestor && <SimuladorContratosLeasing mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-valuation" element={!isGestor && <SimuladorValuationOrcamento mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} />} />
                <Route path="/simulador-livro-diario" element={!isGestor && clienteSelecionado && <SimuladorLivroDiario clienteSelecionado={clienteSelecionado} userAuth={userAuth} planoContas={planoContas} historico={historico} supabase={supabase} mostrarToast={mostrarToast} tarefaCorrente={tarefaCorrente} modo={configAtiva.modo} pendencias={configAtiva.pendenciasManuais} onExcluirLancamento={(idRemovido) => setHistorico(prev => prev.filter(item => item.id !== idRemovido))} onConcluirPendencia={() => carregarLancamentos(clienteSelecionado.id, userAuth.id)} />} />
                <Route path="/simulador-kardex" element={!isGestor && <SimuladorKardex mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
                <Route path="/simulador-conciliacao-ofx" element={<SimuladorConciliacaoOFX mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} historicoDiario={historico} />} />
                <Route path="/simulador-lalur" element={!isGestor && <SimuladorLalur mostrarToast={mostrarToast} registrarFatoGerador={registrarFatoGerador} planoContas={planoContas} />} />
              </Routes>
            </div>
          </div>

          <footer className="no-print" style={{ flexShrink: 0, width: '100%', maxWidth: '1670px', margin: '0 auto', boxSizing: 'border-box', backgroundColor: '#ffffff', borderTop: '1px solid #cbd5e1', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <LogoSistema />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: '1.2' }}>Contábil <span style={{ color: '#0284c7' }}>Cloud</span></div>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>ERP Enterprise & Acadêmico</span>
                </div>
              </div>
              <div style={{ width: '1px', height: '20px', backgroundColor: '#cbd5e1' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Entidade:</span> {clienteSelecionado ? clienteSelecionado.nome_empresa : ''} (<strong style={{ color: '#2563eb' }}>{clienteSelecionado?.regime_tributario || 'Isenta'}</strong>)
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {!isGestor && clienteSelecionado && (
        <>
          {tutorAberto && (
            <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>
              <div style={{ width: '100%', maxWidth: '420px', maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', padding: '24px', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>🦉</span>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>Tutor Analítico</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>IA de Auditoria Pedagógica</span>
                    </div>
                  </div>
                  <button onClick={() => setTutorAberto(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
                </div>
                <AssistenteAuditoria totalAtivo={totalAtivo} totalPassivo={totalPassivo} totalPL={totalPL} resultadoExercicio={resultadoExercicio} saldoCaixa={saldoCaixaCalculado} historico={historico} nomeEmpresa={clienteSelecionado.nome_empresa} pendencias={configAtiva.pendenciasManuais} />
              </div>
            </div>
          )}

          {roboAberto && (
            <div className="no-print" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>
              <div style={{ width: '100%', maxWidth: '420px', maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', position: 'relative' }}>
                <button onClick={() => setRoboAberto(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: '#64748b', zIndex: 10 }}>✖</button>
                <AssistenteRobo />
              </div>
            </div>
          )}

          <div className="no-print" style={{ 
            position: 'fixed', bottom: '15px', right: '20px', zIndex: 9998, 
            display: 'flex', alignItems: 'center', gap: '4px', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
            padding: '4px 8px', borderRadius: '40px', border: '1px solid #e2e8f0',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <button 
              onClick={() => setTutorAberto(true)}
              title="Tutor Analítico"
              style={{ background: 'transparent', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >🦉</button>
            <div style={{ width: '1px', height: '16px', backgroundColor: '#cbd5e1', margin: '0 2px' }}></div>
            <button 
              onClick={() => setRoboAberto(true)}
              title="Robô Assistente IA"
              style={{ background: 'transparent', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >🤖</button>
          </div>
        </>
      )}
    </div>
  );
}