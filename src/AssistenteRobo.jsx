// AssistenteRobo.jsx
import React, { useState, useRef, useEffect } from 'react';
import { dicionarioContabil } from './BaseConhecimento';

// 🔑 A SUA CHAVE DO GOOGLE GEMINI:
const GEMINI_API_KEY = 'AQ.Ab8RN6LeRRURCksQfvCPyLinwoos8kNsIQvFRbCBRFdGDBDyQQ';

export default function AssistenteRobo() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [chat, setChat] = useState([
    { autor: 'bot', texto: 'Olá! Sou o Tutor Robo 🤖. Busco regras no nosso ERP sem frescura com acentos, e também uso a rede neural do Gemini para dúvidas complexas!' }
  ]);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat, isOpen]);

  // ==========================================
  // FUNÇÃO MÁGICA: REMOVE ACENTOS E CEDILHAS
  // ==========================================
  const normalizarTexto = (texto) => {
    return texto
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, "") 
      .toLowerCase()
      .trim();
  };

 // ==========================================
  // MOTOR DE INTELIGÊNCIA ARTIFICIAL (GEMINI)
  // ==========================================
  const buscarNoGemini = async (pergunta) => {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
      
      const prompt = `Você é o Tutor Robo, um auditor sênior e professor de contabilidade, tributação e finanças do sistema educacional Contábil Cloud. 
      Responda de forma didática, executiva e curta à seguinte dúvida do aluno. 
      Dúvida do aluno: "${pergunta}"`;

      const resposta = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const dados = await resposta.json();
      
      // Tratamento de Erros da API
      if (dados.error) {
        console.error("Erro retornado pelo Google:", dados.error);
        
        // Se for o erro de "High Demand" (Alta Demanda 503)
        if (dados.error.message.includes("high demand") || dados.error.code === 503) {
          return `🤖 *Tutor Robo:* Puxa, meus servidores neurais no Google estão enfrentando um pico de acesso no mundo todo agora! Você se importa de aguardar uns 10 segundinhos e enviar a pergunta novamente?`;
        }
        
        // Outros erros
        return `⚠️ Erro da IA: ${dados.error.message}`;
      }
      
      const textoGerado = dados.candidates[0].content.parts[0].text;
      return `✨ *IA Tutor Robo:*\n\n${textoGerado}`;
      
    } catch (erro) {
      console.error("Erro na requisição Fetch:", erro);
      return "Tentei processar com minha IA, mas ocorreu um erro de conexão com a internet.";
    }
  };
  // CÉREBRO HÍBRIDO (LOCAL NORMALIZADO + GEMINI)
  // ==========================================
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const textoUsuario = mensagem;
    const novaMensagemUsuario = { autor: 'user', texto: textoUsuario };
    
    setChat((prev) => [...prev, novaMensagemUsuario]);
    setMensagem('');
    setIsTyping(true);

    // Normaliza a pergunta do usuário
    const perguntaNormalizada = normalizarTexto(textoUsuario);
    let respostaIA = '';
    let encontrouLocal = false;

    // 1. TENTA ACHAR NO ARQUIVO LOCAL (Super Rápido)
    for (let item of dicionarioContabil) {
      const match = item.chaves.some(chave => {
        const chaveNormalizada = normalizarTexto(chave);
        return perguntaNormalizada.includes(chaveNormalizada);
      });

      if (match) {
        respostaIA = item.resposta;
        encontrouLocal = true;
        break;
      }
    }

    // 2. SE NÃO ACHOU LOCAL, ACIONA O GEMINI
    if (!encontrouLocal) {
      let termoBusca = textoUsuario
        .replace(/o que é/gi, '')
        .replace(/o que significa/gi, '')
        .replace(/me explique/gi, '')
        .replace(/\?/g, '')
        .trim();
        
      respostaIA = await buscarNoGemini(termoBusca);
    }

    setChat((prev) => [...prev, { autor: 'bot', texto: respostaIA }]);
    setIsTyping(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="no-print"
        style={{
          position: 'fixed', bottom: '150px', right: '0px', width: '60px', height: '60px',
          borderRadius: '50%', backgroundColor: '#0f172a', color: 'white', border: '1px solid #38bdf8',
          boxShadow: '0 4px 15px rgba(15,23,42,0.4)', cursor: 'pointer', fontSize: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          transition: 'transform 0.2s'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div 
          className="no-print"
          style={{
            position: 'fixed', bottom: '200px', right: '0px', width: '380px', height: '500px',
            backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9998,
            border: '1px solid #cbd5e1', fontFamily: 'system-ui, sans-serif',
            animation: 'fadeIn 0.2s'
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: '900', fontSize: '16px' }}>Tutor Robo (IA)</div>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>● Gemini Engine Ativo</div>
            </div>
          </div>

          <div 
            ref={chatRef}
            style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {chat.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.autor === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div 
                  style={{
                    backgroundColor: msg.autor === 'user' ? '#2563eb' : 'white',
                    color: msg.autor === 'user' ? 'white' : '#0f172a',
                    padding: '12px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.5',
                    border: msg.autor === 'user' ? 'none' : '1px solid #cbd5e1',
                    borderBottomRightRadius: msg.autor === 'user' ? '0' : '12px',
                    borderBottomLeftRadius: msg.autor === 'bot' ? '0' : '12px',
                    whiteSpace: 'pre-wrap', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  {msg.texto}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', borderBottomLeftRadius: '0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', fontWeight: 'bold' }}>Processando via IA Neural... ✨</span>
              </div>
            )}
          </div>

          <form onSubmit={handleEnviar} style={{ display: 'flex', padding: '12px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
            <input 
              type="text" 
              placeholder="Ex: Como calcular ICMS-ST?" 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
            />
            <button 
              type="submit" 
              style={{ marginLeft: '10px', padding: '0 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}