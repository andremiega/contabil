import React, { useState, useEffect } from 'react';

export default function SimuladorImobilizado() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [bens, setBens] = useState([
    { id: 1, descricao: 'Veículo de Entrega (Furgão)', tipo: 'veiculo', valorAquisicao: 85000, valorResidual: 15000, vidaUtilAnos: 5, dataAquisicao: '01/01/2026' }
  ]);

  const [form, setForm] = useState({
    descricao: '', tipo: 'maquina', valorAquisicao: 0, valorResidual: 0, vidaUtilAnos: 10, dataAquisicao: new Date().toLocaleDateString('pt-BR')
  });

  const [totais, setTotais] = useState({ ativoBruto: 0, depreciacaoMensal: 0, valorContabil: 0 });

  useEffect(() => {
    let bruto = 0;
    let depMensal = 0;

    bens.forEach(bem => {
      bruto += Number(bem.valorAquisicao);
      const valorDepreciavel = Number(bem.valorAquisicao) - Number(bem.valorResidual);
      const mesesVida = Number(bem.vidaUtilAnos) * 12;
      depMensal += mesesVida > 0 ? (valorDepreciavel / mesesVida) : 0;
    });

    setTotais({
      ativoBruto: bruto,
      depreciacaoMensal: depMensal,
      valorContabil: bruto 
    });
  }, [bens]);

  const handleAddBem = (e) => {
    e.preventDefault();
    if (!form.descricao || form.valorAquisicao <= 0) return alert("Preencha a descrição e o valor de aquisição.");
    if (form.valorResidual >= form.valorAquisicao) return alert("O valor residual deve ser menor que o valor de aquisição.");

    setBens([...bens, { ...form, id: Date.now() }]);
    setForm({ descricao: '', tipo: 'maquina', valorAquisicao: 0, valorResidual: 0, vidaUtilAnos: 10, dataAquisicao: new Date().toLocaleDateString('pt-BR') });
  };

  const handleRemoverBem = (id) => {
    setBens(bens.filter(b => b.id !== id));
  };

  const getIconeTipo = (tipo) => {
    switch(tipo) {
      case 'veiculo': return '🚚';
      case 'maquina': return '⚙️';
      case 'imovel': return '🏢';
      case 'moveis': return '🪑';
      case 'ti': return '💻';
      default: return '📦';
    }
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🏭</span> Gestão de Imobilizado & Depreciação
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>Controlo de bens patrimoniais e cálculo de desgaste (Método Linear).</p>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '5px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#475569', fontSize: '11.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ativo Imobilizado Bruto</span>
          <strong style={{ color: '#0f172a', fontSize: '24px', wordBreak: 'break-word' }}>{formatMoeda(totais.ativoBruto)}</strong>
        </div>
        
        <div style={{ backgroundColor: '#fff5f5', padding: '20px', borderRadius: '16px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '5px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '11.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Depreciação Mensal (Despesa)</span>
          <strong style={{ color: '#dc2626', fontSize: '24px', wordBreak: 'break-word' }}>{formatMoeda(totais.depreciacaoMensal)}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE CADASTRO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          <form onSubmit={handleAddBem} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Registar Novo Bem</h3>
            
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Descrição do Bem:</label>
              <input type="text" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} style={inputStyle} placeholder="Ex: Máquina de Corte a Laser" required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Categoria:</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="maquina">Máquinas e Equip.</option>
                  <option value="veiculo">Veículos</option>
                  <option value="imovel">Edifícios/Imóveis</option>
                  <option value="moveis">Móveis e Utensílios</option>
                  <option value="ti">Equip. Informática</option>
                </select>
              </div>
              
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Data de Aquisição:</label>
                <input type="text" value={form.dataAquisicao} onChange={e => setForm({...form, dataAquisicao: e.target.value})} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#059669' }}>Valor Compra (R$):</label>
                <input type="number" min="1" step="0.01" value={form.valorAquisicao} onChange={e => setForm({...form, valorAquisicao: e.target.value})} style={{ ...inputStyle, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }} required />
              </div>
              
              <div style={{ minWidth: 0 }}>
                <label style={{ ...labelStyle, color: '#92400e' }}>Valor Residual (R$):</label>
                <input type="number" min="0" step="0.01" value={form.valorResidual} onChange={e => setForm({...form, valorResidual: e.target.value})} title="Valor estimado de revenda no fim da vida útil" style={{ ...inputStyle, borderColor: '#fde68a', backgroundColor: '#fffbeb' }} />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Vida Útil (Anos):</label>
                <input type="number" min="1" value={form.vidaUtilAnos} onChange={e => setForm({...form, vidaUtilAnos: e.target.value})} style={inputStyle} required />
              </div>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px', boxSizing: 'border-box' }}>➕ Integrar ao Património</button>
          </form>

          {/* GUIA DE LANÇAMENTOS */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span>🧭</span> Guia Contábil: Depreciação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
              <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '10px', borderLeft: '4px solid #dc2626', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '6px', wordBreak: 'break-word' }}>Todo fim de mês, lance no Diário:</div>
                <div style={{ color: '#475569', wordBreak: 'break-word' }}>D: Despesa c/ Depreciação (Resultado)</div>
                <div style={{ color: '#475569', wordBreak: 'break-word' }}>C: Depreciação Acumulada (Redutora Ativo)</div>
                <strong style={{ display: 'block', marginTop: '8px', color: '#0f172a', wordBreak: 'break-word' }}>Valor: {formatMoeda(totais.depreciacaoMensal)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CARTÕES DE PATRIMÓNIO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', alignContent: 'start', boxSizing: 'border-box', minWidth: 0 }}>
          {bens.length === 0 && (
             <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1', wordBreak: 'break-word' }}>
              A empresa ainda não possui bens imobilizados registados.
             </div>
          )}

          {bens.map(bem => {
            const valorDepreciavel = bem.valorAquisicao - bem.valorResidual;
            const depMensal = (valorDepreciavel / (bem.vidaUtilAnos * 12));

            return (
              <div key={bem.id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
                
                <button onClick={() => handleRemoverBem(bem.id)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', boxSizing: 'border-box' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {getIconeTipo(bem.tipo)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '13.5px', wordBreak: 'break-word' }}>{bem.descricao}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', wordBreak: 'break-word' }}>{bem.tipo}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '12px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: '#475569' }}>Aquisição:</span>
                    <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(bem.valorAquisicao)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: '#475569' }}>Valor Residual:</span>
                    <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(bem.valorResidual)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: '#475569' }}>Base Depreciável:</span>
                    <strong style={{ color: '#059669', wordBreak: 'break-word' }}>{formatMoeda(valorDepreciavel)}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', backgroundColor: '#fff5f5', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#991b1b' }}>Quota Mensal:</span>
                  <strong style={{ fontSize: '13.5px', color: '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(depMensal)}</strong>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}