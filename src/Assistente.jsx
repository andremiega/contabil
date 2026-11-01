import React, { useState, useEffect } from 'react';

export default function Assistente({ totalAtivo = 0, totalPassivo = 0, totalPL = 0, historico = [], nomeEmpresa = '' }) {
  const [dicas, setDicas] = useState([]);
  const [balancoFechado, setBalancoFechado] = useState(true);

  useEffect(() => {
    // 1. Calcula a diferença do Balanço
    const diff = Number(totalAtivo) - (Number(totalPassivo) + Number(totalPL));
    const isFechado = Math.abs(diff) < 0.05;
    
    setBalancoFechado(isFechado);

    const novasDicas = [];

    // 2. Motor de Inferência (Procura os erros no Diário)
    if (!isFechado) {
      // Regra 1: Lançamentos mancos
      const lancamentosMancos = historico.filter(lanc => (lanc.debito && !lanc.credito) || (!lanc.debito && lanc.credito));
      if (lancamentosMancos.length > 0) {
        novasDicas.push({
          tipo: 'critico',
          titulo: 'Partidas Dobradas Incompletas (Meto das Venezianas)',
          mensagem: 'Identifiquei lançamentos no Diário onde apenas o Débito ou apenas o Crédito foram preenchidos. Todo o registo precisa de origem e destino.'
        });
      }

      // Regra 2: CMV Ausente
      const temVendas = historico.some(l => String(l.credito).startsWith('3.1.1') || String(l.credito).toLowerCase().includes('receita'));
      const temCMV = historico.some(l => String(l.debito).startsWith('3.1.2') || String(l.debito).toLowerCase().includes('cmv'));
      
      if (temVendas && !temCMV) {
        novasDicas.push({
          tipo: 'alerta',
          titulo: 'Baixa de Inventário Ausente',
          mensagem: 'Notei que reconheceu receitas de vendas, mas o custo (CMV) não foi apurado. O lucro pode estar inflacionado.'
        });
      }

      // Regra 3: Dica de valor exato
      if (diff !== 0) {
        novasDicas.push({
          tipo: 'analise',
          titulo: 'Divergência Patrimonial Exata',
          mensagem: `O Ativo não bate certo com o Passivo + PL. A diferença exata é de R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Procure este valor no Diário.`
        });
      }
    } else if (historico.length > 0) {
      novasDicas.push({
        tipo: 'sucesso',
        titulo: 'Compliance Contábil Aprovado',
        mensagem: `Excelente! A equação patrimonial da ${nomeEmpresa || 'empresa'} está equilibrada.`
      });
    }

    setDicas(novasDicas);
  }, [totalAtivo, totalPassivo, totalPL, historico, nomeEmpresa]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {historico?.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '13px', border: '1px dashed #cbd5e1' }}>
          Aguardando os primeiros lançamentos no Livro Diário para iniciar a auditoria contínua...
        </div>
      ) : (
        dicas.map((dica, index) => {
          const cores = {
            critico: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '🚨' },
            alerta: { bg: '#fffbeb', border: '#fcd34d', text: '#b45309', icon: '💡' },
            analise: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '🔍' },
            sucesso: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '✅' }
          };
          const estilo = cores[dica.tipo] || cores.analise;

          return (
            <div key={index} style={{ backgroundColor: estilo.bg, border: `1px solid ${estilo.border}`, padding: '16px', borderRadius: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>{estilo.icon}</span>
              <div>
                <strong style={{ display: 'block', color: estilo.text, fontSize: '13.5px', marginBottom: '6px' }}>
                  {dica.titulo}
                </strong>
                <span style={{ color: estilo.text, fontSize: '12.5px', lineHeight: '1.5' }}>
                  {dica.mensagem}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}