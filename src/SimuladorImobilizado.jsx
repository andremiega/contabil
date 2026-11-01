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
      // Simplificação didática: O valor contabilístico inicial logo após a compra.
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏭</span> Gestão de Imobilizado & Depreciação
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>Controlo de bens patrimoniais e cálculo de desgaste (Método Linear).</p>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '5px', borderLeft: '5px solid #3b82f6' }}>
          <span style={{ color: '#475569', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ativo Imobilizado Bruto</span>
          <strong style={{ color: '#0f172a', fontSize: '28px' }}>{formatMoeda(totais.ativoBruto)}</strong>
        </div>
        
        <div style={{ backgroundColor: '#fff5f5', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '5px', borderLeft: '5px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Depreciação Mensal (Despesa)</span>
          <strong style={{ color: '#dc2626', fontSize: '28px' }}>{formatMoeda(totais.depreciacaoMensal)}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE CADASTRO */}
        <div style={{ flex: '1 1 300px' }}>
          <form onSubmit={handleAddBem} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Registar Novo Bem</h3>
            
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Descrição do Bem:
              <input type="text" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: Máquina de Corte a Laser" required />
            </label>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Categoria:
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                  <option value="maquina">Máquinas e Equip.</option>
                  <option value="veiculo">Veículos</option>
                  <option value="imovel">Edifícios/Imóveis</option>
                  <option value="moveis">Móveis e Utensílios</option>
                  <option value="ti">Equip. Informática</option>
                </select>
              </label>
              
              <label style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Data de Aquisição:
                <input type="text" value={form.dataAquisicao} onChange={e => setForm({...form, dataAquisicao: e.target.value})} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
                Valor de Compra (R$):
                <input type="number" min="1" step="0.01" value={form.valorAquisicao} onChange={e => setForm({...form, valorAquisicao: e.target.value})} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5' }} required />
              </label>
              
              <label style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>
                Valor Residual (R$):
                <input type="number" min="0" step="0.01" value={form.valorResidual} onChange={e => setForm({...form, valorResidual: e.target.value})} title="Valor estimado de revenda no fim da vida útil" style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #fde68a', backgroundColor: '#fffbeb' }} />
              </label>

              <label style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Vida Útil (Anos):
                <input type="number" min="1" value={form.vidaUtilAnos} onChange={e => setForm({...form, vidaUtilAnos: e.target.value})} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </label>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>➕ Integrar ao Património</button>
          </form>

          {/* GUIA DE LANÇAMENTOS */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '20px', marginTop: '15px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧭</span> Guia Contábil: Depreciação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '3px solid #dc2626' }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '4px' }}>Todo fim de mês, lance no Diário:</div>
                <div style={{ color: '#475569' }}>D: Despesa c/ Depreciação (Resultado)</div>
                <div style={{ color: '#475569' }}>C: Depreciação Acumulada (Redutora do Ativo)</div>
                <strong style={{ display: 'block', marginTop: '8px', color: '#0f172a' }}>Valor exato: {formatMoeda(totais.depreciacaoMensal)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CARTÕES DE PATRIMÓNIO */}
        <div style={{ flex: '1 1 450px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignContent: 'start' }}>
          {bens.length === 0 && (
             <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
               A empresa ainda não possui bens imobilizados registados.
             </div>
          )}

          {bens.map(bem => {
            const valorDepreciavel = bem.valorAquisicao - bem.valorResidual;
            const depMensal = (valorDepreciavel / (bem.vidaUtilAnos * 12));

            return (
              <div key={bem.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                
                <button onClick={() => handleRemoverBem(bem.id)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {getIconeTipo(bem.tipo)}
                  </div>
                  <div style={{ width: 'calc(100% - 60px)' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bem.descricao}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{bem.tipo}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Aquisição:</span>
                    <strong style={{ color: '#0f172a' }}>{formatMoeda(bem.valorAquisicao)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Valor Residual:</span>
                    <strong style={{ color: '#0f172a' }}>{formatMoeda(bem.valorResidual)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#475569' }}>Base Depreciável:</span>
                    <strong style={{ color: '#059669' }}>{formatMoeda(valorDepreciavel)}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#991b1b' }}>Quota Mensal:</span>
                  <strong style={{ fontSize: '14px', color: '#dc2626' }}>{formatMoeda(depMensal)}</strong>
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