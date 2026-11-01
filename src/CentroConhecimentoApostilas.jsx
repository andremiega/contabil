import React, { useState, useEffect } from 'react';
import { modulosApostila as dadosIniciais } from './data/apostilaCompleta';

export default function CentroConhecimentoApostilas({ isAdmin }) {
  const [modulos, setModulos] = useState(() => {
    try {
      const salvo = localStorage.getItem('erp_apostilas_custom');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Erro ao ler localStorage", e);
    }
    return dadosIniciais;
  });

  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [artigoSelecionadoId, setArtigoSelecionadoId] = useState(() => modulos[0]?.id || '');
  
  const [modoAdicao, setModoAdicao] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('contabil');
  const [novoResumo, setNovoResumo] = useState('');
  const [novoTexto, setNovoTexto] = useState('');
  const [codigoGerado, setCodigoGerado] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('erp_apostilas_custom', JSON.stringify(modulos));
    } catch (e) {
      console.error("Erro ao salvar localStorage", e);
    }
  }, [modulos]);

  const handleSalvarNovoModulo = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acesso negado.');
      return;
    }

    if (!novoTitulo.trim() || !novoTexto.trim()) {
      alert('Preencha pelo menos o Título e o Conteúdo do módulo.');
      return;
    }

    const idUnico = 'mod-' + Date.now();
    const categoriaNomeMapa = {
      contabil: 'Contabilidade Geral & Avançada',
      dp: 'Departamento Pessoal & eSocial',
      fiscal: 'Fiscal & Tributário',
      design: 'Ergonomia & Design de Interiores'
    };

    const categoriaNome = categoriaNomeMapa[novaCategoria] || 'Material de Estudo';

    const novoModuloObj = {
      id: idUnico,
      categoria: novaCategoria,
      categoriaNome: categoriaNome,
      titulo: novoTitulo,
      resumo: novoResumo || 'Módulo personalizado.',
      leituraMinutos: 8,
      topicos: [{ subtitulo: 'Conteúdo Técnico', texto: novoTexto }]
    };

    const codigoPronto = `  {
    id: '${idUnico}',
    categoria: '${novaCategoria}',
    categoriaNome: '${categoriaNome}',
    titulo: '${novoTitulo}',
    resumo: '${novoResumo}',
    leituraMinutos: 8,
    topicos: [
      {
        subtitulo: 'Conteúdo Técnico',
        texto: \`${novoTexto}\`
      }
    ]
  },`;

    setCodigoGerado(codigoPronto);
    setModulos([novoModuloObj, ...modulos]);
    setArtigoSelecionadoId(idUnico);
    
    setNovoTitulo('');
    setNovoResumo('');
    setNovoTexto('');
  };

  const modulosFiltrados = modulos.filter((mod) => {
    const combinaCategoria = categoriaAtiva === 'todos' || mod.categoria === categoriaAtiva;
    const termo = termoBusca.toLowerCase();
    const combinaBusca =
      mod.titulo.toLowerCase().includes(termo) ||
      mod.resumo.toLowerCase().includes(termo) ||
      mod.categoriaNome.toLowerCase().includes(termo);
    return combinaCategoria && combinaBusca;
  });

  const moduloAtivo = modulos.find((m) => m.id === artigoSelecionadoId) || modulosFiltrados[0] || modulos[0];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* ========================================================
          CABEÇALHO EXECUTIVO
          ======================================================== */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
            <span style={{ fontSize: '24px' }}>📚</span> Central de Manuais & Biblioteca Técnica
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Acervo de normas, procedimentos e guiões de preenchimento. {isAdmin ? '🔓 Modo Gestor Ativo.' : '📖 Modo Leitura.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <button
              onClick={() => setModoAdicao(!modoAdicao)}
              className="no-print"
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
            >
              {modoAdicao ? '✖️ Fechar Editor' : '➕ Adicionar Módulo'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Imprimir PDF
          </button>
        </div>
      </div>

      {/* ========================================================
          PAINEL DE CADASTRO ADMIN
          ======================================================== */}
      {isAdmin && modoAdicao && (
        <form onSubmit={handleSalvarNovoModulo} className="no-print" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '2px dashed #94a3b8', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>📥 Cadastro de Novo Manual</h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 300px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Título do Módulo:</label>
              <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Ex: Contabilidade Avançada" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Categoria:</label>
              <select value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="contabil">Contabilidade</option>
                <option value="dp">Departamento Pessoal</option>
                <option value="fiscal">Fiscal & Tributário</option>
                <option value="design">Ergonomia & Design</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Resumo Curto:</label>
            <input type="text" value={novoResumo} onChange={e => setNovoResumo(e.target.value)} placeholder="Breve descrição dos tópicos abordados..." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Conteúdo Técnico:</label>
            <textarea value={novoTexto} onChange={e => setNovoTexto(e.target.value)} rows="4" placeholder="Cole o texto aqui..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setModoAdicao(false)} style={{ padding: '10px 18px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>✓ Salvar e Publicar</button>
          </div>
        </form>
      )}

      {/* ========================================================
          VITRINE HORIZONTAL DE MANUAIS (CARROSSEL SUPERIOR)
          ======================================================== */}
      <div className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Manuais Disponíveis
          </h3>
          <input
            type="text"
            placeholder="🔍 Pesquisar manual..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ width: '100%', maxWidth: '300px', padding: '8px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          />
        </div>

        {/* Grade Horizontal Rolável (Scroll X) */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          gap: '16px', 
          paddingBottom: '12px', 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}>
          {modulosFiltrados.map((mod) => {
            const ativo = moduloAtivo?.id === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => setArtigoSelecionadoId(mod.id)}
                style={{
                  flex: '0 0 auto',
                  width: '280px',
                  backgroundColor: ativo ? '#eff6ff' : '#ffffff',
                  border: `2px solid ${ativo ? '#3b82f6' : '#cbd5e1'}`,
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: ativo ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '2px 2px 4px rgba(0,0,0,0.02)',
                 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: ativo ? '#2563eb' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {mod.categoriaNome}
                    </span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '8px', lineHeight: '1.3' }}>
                    {mod.titulo}
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', borderTop: `1px solid ${ativo ? '#bfdbfe' : '#f1f5f9'}`, paddingTop: '8px' }}>
                  ⏱️ {mod.leituraMinutos} minutos de leitura
                </div>
              </div>
            );
          })}

          {modulosFiltrados.length === 0 && (
            <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              Nenhum manual encontrado para "{termoBusca}".
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          ÁREA DE LEITURA (100% DA LARGURA ABAIXO DOS CARTÕES)
          ======================================================== */}
      {moduloAtivo && (
        <div className="print-area" style={{ 
          width: '100%', 
          backgroundColor: '#ffffff', 
          padding: 'clamp(24px, 5vw, 60px)', 
          borderRadius: '12px', 
          border: '1px solid #cbd5e1', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          boxSizing: 'border-box'
        }}>
          
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', border: '1px solid #bfdbfe' }}>
                {moduloAtivo.categoriaNome}
              </span>
            </div>
            <h1 style={{ margin: '0 0 12px 0', fontSize: 'clamp(24px, 3vw, 36px)', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              {moduloAtivo.titulo}
            </h1>
            <p style={{ margin: 0, fontSize: '16.5px', color: '#475569', lineHeight: '1.6' }}>
              {moduloAtivo.resumo}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', color: '#1e293b' }}>
            {moduloAtivo.topicos.map((top, idx) => (
              <div key={idx} style={{ paddingBottom: idx !== moduloAtivo.topicos.length - 1 ? '32px' : '0', borderBottom: idx !== moduloAtivo.topicos.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                <h3 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>
                  {top.subtitulo}
                </h3>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#334155' }}>
                  {top.texto}
                </p>
              </div>
            ))}
          </div>

          <div className="no-print" style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
            <span>Documento ID: {moduloAtivo.id}</span>
            <span>Contábil Cloud Enterprise</span>
          </div>
        </div>
      )}

    </div>
  );
}