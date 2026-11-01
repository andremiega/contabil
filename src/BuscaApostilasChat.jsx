import React, { useState } from 'react';
import { supabase } from './supabase';

export default function BuscaApostilasChat() {
  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([
    { remetente: 'bot', texto: 'Olá! Digite o tema ou assunto que procura (ex: "contabilidade", "fiscal", "mei", "dp") para encontrar a apostila ideal.' }
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
      // Busca todos os registos da tabela 'apostilas'
      const { data, error } = await supabase
        .from('apostilas')
        .select('*');

      if (error) throw error;

      // Filtra de forma segura pelo título ou pelas palavras-chave (array)
      const termo = textoUsuario.toLowerCase();
      const resultadosFiltrados = data?.filter(item => {
        const tituloMatch = item.titulo_livro?.toLowerCase().includes(termo);
        const tagsMatch = item.palavras_chave?.some(tag => tag.toLowerCase().includes(termo));
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
          { remetente: 'bot', texto: 'Não encontrei nenhuma apostila com esse termo. Tente pesquisar por palavras como "contabilidade", "fiscal", "mei" ou "dp".' }
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🤖</span> Assistente de Busca de Apostilas
      </h2>
      <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
        Pesquise por temas técnicos e receba os materiais em PDF instantaneamente.
      </p>

      {/* HISTÓRICO DE MENSAGENS */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', height: '350px', overflowY: 'auto', padding: '15px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mensagens.map((msg, index) => (
          <div key={index} style={{ alignSelf: msg.remetente === 'usuario' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ 
              backgroundColor: msg.remetente === 'usuario' ? '#2563eb' : '#ffffff', 
              color: msg.remetente === 'usuario' ? '#ffffff' : '#0f172a', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              border: msg.remetente === 'bot' ? '1px solid #cbd5e1' : 'none',
              fontSize: '13.5px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: 0 }}>{msg.texto}</p>

              {/* RESULTADOS DA BUSCA */}
              {msg.resultados && msg.resultados.map(res => {
                // Gera o link público do PDF no Storage do Supabase de forma segura
                const { data: storageData } = supabase.storage
                  .from('apostilas')
                  .getPublicUrl(res.nome_arquivo_storage || '');

                const urlParaDownload = storageData?.publicUrl || '#';

                return (
                  <div key={res.id} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{res.titulo_livro}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Ficheiro: {res.nome_arquivo_storage}</span>
                    </div>
                    <a 
                      href={urlParaDownload} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ backgroundColor: '#16a34a', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      📥 Baixar PDF
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {carregando && <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>A pesquisar no acervo...</div>}
      </div>

      {/* FORMULÁRIO DE PESQUISA */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Ex: contabilidade, fiscal, mei, dp..." 
          value={pergunta}
          onChange={e => setPergunta(e.target.value)}
          style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
        />
        <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer' }}>
          Pesquisar
        </button>
      </form>
    </div>
  );
}