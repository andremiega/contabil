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

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* ========================================================
          CABEÇALHO EXECUTIVO
          ======================================================== */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>📚</span> Central de Manuais & Biblioteca Técnica
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Acervo de normas, procedimentos e guias. {isAdmin ? '🔓 Gestor Ativo.' : '📖 Modo Leitura.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          {isAdmin && (
            <button
              onClick={() => setModoAdicao(!modoAdicao)}
              className="no-print"
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
            >
              {modoAdicao ? '✖️ Fechar Editor' : '➕ Adicionar Módulo'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Imprimir PDF
          </button>
        </div>
      </div>

      {/* ========================================================
          PAINEL DE CADASTRO ADMIN
          ======================================================== */}
      {isAdmin && modoAdicao && (
        <form onSubmit={handleSalvarNovoModulo} className="no-print" style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '2px dashed #94a3b8', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', wordBreak: 'break-word' }}>📥 Cadastro de Novo Manual</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Título do Módulo:</label>
              <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Ex: Contabilidade Avançada" style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Categoria:</label>
              <select value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
                <option value="contabil">Contabilidade</option>
                <option value="dp">Departamento Pessoal</option>
                <option value="fiscal">Fiscal & Tributário</option>
                <option value="design">Ergonomia & Design</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>Resumo Curto:</label>
            <input type="text" value={novoResumo} onChange={e => setNovoResumo(e.target.value)} placeholder="Breve descrição dos tópicos..." style={inputStyle} />
          </div>

          <div style={{ minWidth: 0 }}>
            <label style={labelStyle}>Conteúdo Técnico:</label>
            <textarea value={novoTexto} onChange={e => setNovoTexto(e.target.value)} rows="4" placeholder="Cole o texto aqui..." style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
            <button type="button" onClick={() => setModoAdicao(false)} style={{ padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>✓ Salvar e Publicar</button>
          </div>
        </form>
      )}

      {/* ========================================================
          VITRINE HORIZONTAL DE MANUAIS (CARROSSEL SUPERIOR)
          ======================================================== */}
      <div className="no-print" style={{ marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, fontSize: '14.5px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', wordBreak: 'break-word' }}>
            Manuais Disponíveis
          </h3>
          <input
            type="text"
            placeholder="🔍 Pesquisar manual..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ width: '100%', maxWidth: '280px', padding: '8px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Grade Horizontal Rolável */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          gap: '14px', 
          paddingBottom: '10px', 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          boxSizing: 'border-box'
        }}>
          {modulosFiltrados.map((mod) => {
            const ativo = moduloAtivo?.id === mod.id;
            return (
              <div
                key={mod.id}
                onClick={() => setArtigoSelecionadoId(mod.id)}
                style={{
                  flex: '0 0 auto',
                  width: '260px',
                  backgroundColor: ativo ? '#eff6ff' : '#ffffff',
                  border: `2px solid ${ativo ? '#3b82f6' : '#cbd5e1'}`,
                  padding: '16px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: ativo ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '2px 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: ativo ? '#2563eb' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', wordBreak: 'break-word' }}>
                      {mod.categoriaNome}
                    </span>
                  </div>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', marginBottom: '6px', lineHeight: '1.3', wordBreak: 'break-word' }}>
                    {mod.titulo}
                  </strong>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', borderTop: `1px solid ${ativo ? '#bfdbfe' : '#f1f5f9'}`, paddingTop: '8px', wordBreak: 'break-word' }}>
                  ⏱️ {mod.leituraMinutos} min de leitura
                </div>
              </div>
            );
          })}

          {modulosFiltrados.length === 0 && (
            <div style={{ width: '100%', padding: '20px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              Nenhum manual encontrado para "{termoBusca}".
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          ÁREA DE LEITURA
          ======================================================== */}
      {moduloAtivo && (
        <div className="print-area" style={{ 
          width: '100%', 
          backgroundColor: '#ffffff', 
          padding: 'clamp(20px, 4vw, 40px)', 
          borderRadius: '16px', 
          border: '1px solid #cbd5e1', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          boxSizing: 'border-box',
          minWidth: 0
        }}>
          
          <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', textTransform: 'uppercase', border: '1px solid #bfdbfe', wordBreak: 'break-word' }}>
                {moduloAtivo.categoriaNome}
              </span>
            </div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: 'clamp(20px, 3vw, 30px)', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: '1.2', wordBreak: 'break-word' }}>
              {moduloAtivo.titulo}
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.5', wordBreak: 'break-word' }}>
              {moduloAtivo.resumo}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', color: '#1e293b', boxSizing: 'border-box' }}>
            {moduloAtivo.topicos.map((top, idx) => (
              <div key={idx} style={{ paddingBottom: idx !== moduloAtivo.topicos.length - 1 ? '24px' : '0', borderBottom: idx !== moduloAtivo.topicos.length - 1 ? '1px solid #e2e8f0' : 'none', boxSizing: 'border-box', minWidth: 0 }}>
                <h3 style={{ color: '#0f172a', fontSize: '17.5px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.3px', wordBreak: 'break-word' }}>
                  {top.subtitulo}
                </h3>
                <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#334155', wordBreak: 'break-word' }}>
                  {top.texto}
                </p>
              </div>
            ))}
          </div>

          <div className="no-print" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#94a3b8', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
            <span style={{ wordBreak: 'break-word' }}>Documento ID: {moduloAtivo.id}</span>
            <span style={{ wordBreak: 'break-word' }}>Contábil Cloud Enterprise</span>
          </div>
        </div>
      )}

    </div>
  );
}