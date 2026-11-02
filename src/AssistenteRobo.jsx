// AssistenteRobo.jsx
import React, { useState, useRef, useEffect } from 'react';
import { dicionarioContabil } from './BaseConhecimento';

// 🔑 A SUA CHAVE DO GROQ API:
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;// <--- Cole aqui a sua chave do Groq

// 🔄 MATRIZ DE MODELOS COM FALLBACK AUTOMÁTICO
const GROQ_MODELS = [
  'openai/gpt-oss-120b',  // 1º Tentativa: Principal (Melhor qualidade)
  'openai/gpt-oss-20b'    // 2º Tentativa: Fallback (Mais rápido / cota separada)
];

export default function AssistenteRobo() {
  const [mensagem, setMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [chat, setChat] = useState([
    { autor: 'bot', texto: 'Olá! Sou o Tutor Robo 🤖. Busco regras no nosso ERP sem frescura com acentos, e também uso o motor de IA em cascata (Groq) para dúvidas complexas!' }
  ]);

  const chatRef = useRef(null);

  // Faz scroll automático para la última mensagem
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chat]);

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
  // MOTOR COM FALLBACK AUTOMÁTICO ENTRE MODELOS
  // ==========================================
  const chamarGroqComFallback = async (pergunta) => {
    const promptSistema = 'Você é o Tutor Robo, um auditor sênior e professor de contabilidade, tributação e finanças do sistema educacional Contábil Cloud. Responda de forma didática, executiva e muito curta (máximo 2 parágrafos).';

    for (const model of GROQ_MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos por modelo

      try {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        
        const resposta = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: promptSistema },
              { role: 'user', content: pergunta }
            ],
            temperature: 0.3,
            max_tokens: 500
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Se a resposta for bem-sucedida (Status 200-299)
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.choices && dados.choices.length > 0) {
            const textoGerado = dados.choices[0].message.content;
            return `✨ *Tutor Robo (Groq - ${model}):*\n\n${textoGerado}`;
          }
        }
        
        // Se deu erro 429 (Too Many Requests / Cota esgotada) ou 5xx (Erro de Servidor), o loop continua para o próximo modelo
        console.warn(`Modelo ${model} falhou ou esgotou cota. A tentar o próximo modelo de fallback...`);

      } catch (erro) {
        clearTimeout(timeoutId);
        console.warn(`Erro de conexão com o modelo ${model}:`, erró => erro.message);
        // Continua para o próximo modelo da lista
      }
    }

    // Se todos os modelos da lista falharem
    return "🤖 *Tutor Robo:* Todos os servidores de IA estão momentaneamente sobrecarregados. Tente novamente em alguns segundos!";
  };

  // ==========================================
  // CÉREBRO HÍBRIDO (LOCAL NORMALIZADO + GROQ)
  // ==========================================
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const textoUsuario = mensagem;
    const novaMensagemUsuario = { autor: 'user', texto: textoUsuario };
    
    setChat((prev) => [...prev, novaMensagemUsuario]);
    setMensagem('');
    setIsTyping(true);

    const perguntaNormalizada = normalizarTexto(textoUsuario);
    let respostaIA = '';
    let encontrouLocal = false;

    // 1. IDENTIFICA PERGUNTAS COMPLEXAS (FORÇA A IDA DIRETA PARA O GROQ)
    const requerInteligencia = ['como', 'calcular', 'calculo', 'exemplo', 'diferenca', 'passo a passo', 'por que', 'explique'];
    const vaiParaGroqDireto = requerInteligencia.some(palavra => perguntaNormalizada.includes(palavra));

    // 2. TENTA ACHAR NO ARQUIVO LOCAL (Apenas se for um conceito simples)
    if (!vaiParaGroqDireto) {
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
    }

    // 3. ACIONA O GROQ COM FALLBACK SE NÃO ACHAR LOCAL OU SE FOR PERGUNTA COMPLEXA
    if (!encontrouLocal) {
      let termoBusca = textoUsuario;
      
      if (!vaiParaGroqDireto) {
        termoBusca = textoUsuario
          .replace(/o que é/gi, '')
          .replace(/o que significa/gi, '')
          .replace(/me explique/gi, '')
          .replace(/\?/g, '')
          .trim();
      }
        
      respostaIA = await chamarGroqComFallback(termoBusca || textoUsuario);
    }

    setChat((prev) => [...prev, { autor: 'bot', texto: respostaIA }]);
    setIsTyping(false);
  };

  // Retorna APENAS o Chat, sem botões flutuantes externos
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px 12px 0 0' }}>
        <span style={{ fontSize: '28px' }}>🤖</span>
        <div>
          <div style={{ fontWeight: '900', fontSize: '16px' }}>Tutor Robo (IA)</div>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>● Groq Failover Ativo (GPT-OSS Models)</div>
        </div>
      </div>

      <div 
        ref={chatRef}
        style={{ flex: 1, minHeight: '300px', padding: '16px', overflowY: 'auto', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}
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
          <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', borderBottomLeftRadius: '0', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <style>{`@keyframes girarIA { 100% { transform: rotate(360deg); } }`}</style>
            
            <div style={{ animation: 'girarIA 1.5s linear infinite', fontSize: '18px' }}>
              ⚙️
            </div>
            <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', fontWeight: 'bold' }}>
              A IA está a formular a resposta...
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleEnviar} style={{ display: 'flex', padding: '12px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', borderRadius: '0 0 12px 12px' }}>
        <input 
          type="text" 
          placeholder="Ex: Como calcular ICMS-ST?" 
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={isTyping}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
        />
        <button 
          type="submit" 
          disabled={isTyping}
          style={{ marginLeft: '10px', padding: '0 20px', backgroundColor: isTyping ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isTyping ? 'not-allowed' : 'pointer' }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}