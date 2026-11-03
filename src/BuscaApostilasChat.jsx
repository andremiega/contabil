import React, { useState } from 'react';
import { supabase } from './supabase';

export default function BuscaApostilasChat() {
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([
    { remetente: 'bot', texto: 'Olá! Digite o tema ou assunto que procura (ex: "contabilidade", "fiscal", "mei", "hp12c") para encontrar a apostila ideal.' }
  ]);
  const [carregando, setCarregando] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!pergunta.trim()) return;

    const textoUsuario = pergunta;
    setMensagens(prev => [...prev, { remetente: 'usuario', texto: textoUsuario }]);
    setPergunta('');
    setCarregando(true);

    try {
      // Consulta a tabela correta 'apostilas' que aparece no seu Supabase
      const { data, error } = await supabase
        .from('apostilas')
        .select('*');

      if (error) throw error;

      const termo = textoUsuario.toLowerCase();
      const resultadosFiltrados = data?.filter(item => {
        // Usa as colunas corretas vistas na sua base de dados
        const tituloMatch = item.titulo_livro?.toLowerCase().includes(termo);
        
        let tagsMatch = false;
        if (Array.isArray(item.palavras_chave)) {
          tagsMatch = item.palavras_chave.some(tag => tag.toLowerCase().includes(termo));
        } else if (typeof item.palavras_chave === 'string') {
          tagsMatch = item.palavras_chave.toLowerCase().includes(termo);
        }

        return tituloMatch || tagsMatch;
      }) || [];

      if (resultadosFiltrados.length > 0) {
        setMensagens(prev => [
          ...prev, 
          { remetente: 'bot', texto: 'Encontrei o(s) seguinte(s) material(is) no nosso acervo: 📚', resultados: resultadosFiltrados }
        ]);
      } else {
        setMensagens(prev => [
          ...prev, 
          { remetente: 'bot', texto: 'Não encontrei nenhuma apostila com esse termo. Tente pesquisar por palavras como "contabilidade", "fiscal", "mei" ou "hp12c".' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMensagens(prev => [
        ...prev, 
        { remetente: 'bot', texto: 'Ocorreu um erro ao consultar o acervo. Tente novamente mais tarde.' }
      ]);
    } finally {
      setCarregando(false);
    }
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      
      <div style={{ marginBottom: '16px', boxSizing: 'border-box' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
          <span style={{ fontSize: '24px' }}>🤖</span> Assistente de Busca de Apostilas
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0, wordBreak: 'break-word' }}>
          Pesquise por temas técnicos e receba os materiais em PDF instantaneamente.
        </p>
      </div>

      {/* HISTÓRICO DE MENSAGENS */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', height: '350px', overflowY: 'auto', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
        {mensagens.map((msg, index) => (
          <div key={index} style={{ alignSelf: msg.remetente === 'usuario' ? 'flex-end' : 'flex-start', maxWidth: '85%', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ 
              backgroundColor: msg.remetente === 'usuario' ? '#2563eb' : '#ffffff', 
              color: msg.remetente === 'usuario' ? '#ffffff' : '#0f172a', 
              padding: '12px 16px', 
              borderRadius: '16px', 
              border: msg.remetente === 'bot' ? '1px solid #cbd5e1' : 'none',
              fontSize: '13.5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              boxSizing: 'border-box',
              wordBreak: 'break-word'
            }}>
              <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.texto}</p>

              {/* RESULTADOS DA BUSCA */}
              {msg.resultados && msg.resultados.map(res => {
                // Gera o link público diretamente do storage do Supabase usando o nome correto do ficheiro
                const { data: storageData } = supabase.storage
                  .from('apostilas')
                  .getPublicUrl(res.nome_arquivo_storage || '');

                const urlParaDownload = storageData?.publicUrl || '#';

                return (
                  <div key={res.id || res.titulo_livro} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>{res.titulo_livro}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Ficheiro: {res.nome_arquivo_storage}</span>
                    </div>
                    <a 
                      href={urlParaDownload} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}
                    >
                      📥 Baixar PDF
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {carregando && <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', wordBreak: 'border-box' }}>A pesquisar no acervo...</div>}
      </div>

      {/* FORMULÁRIO DE PESQUISA */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
        <input 
          type="text" 
          placeholder="Ex: contabilidade, fiscal, mei, hp12c..." 
          value={pergunta}
          onChange={e => setPergunta(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 250px' }}
        />
        <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer', boxSizing: 'border-box', flexShrink: 0 }}>
          Pesquisar
        </button>
      </form>
    </div>
  );
}