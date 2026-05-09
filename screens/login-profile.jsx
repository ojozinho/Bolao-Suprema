/* global React, Logo, Flag, Stamp, T, ME */

/* =========================================================
   LOGIN — Mobile
   ========================================================= */
function LoginMobile({ onDone }){
  const [email, setEmail] = React.useState("felipe.souza@");
  return (
    <div style={{ height:'100%', background:'var(--ink)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <img src="assets/hero-portrait.webp" alt="" style={{
        position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%', opacity:.55
      }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(13,13,13,.4), rgba(13,13,13,.2) 30%, rgba(13,13,13,.95))' }}/>

      <div style={{ position:'relative', display:'flex', flexDirection:'column', height:'100%', padding:'24px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--paper-white)', opacity:.7 }}>SUPREMA · BOLÃO '26</span>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--yellow)' }}>★ MUNDIAL '26</span>
        </div>

        <div style={{ flex:1 }}/>

        <Logo height={68}/>
        <div style={{ height:8 }}/>
        <div className="serif-it" style={{ color:'var(--paper-white)', fontSize:22, opacity:.92 }}>boa, jogador.</div>
        <h2 className="display" style={{ color:'var(--paper-white)', fontSize:54, lineHeight:.9, margin:'8px 0 0' }}>
          Bem<br/>vindo<br/><span style={{ color:'var(--yellow)' }}>de volta.</span>
        </h2>
        <div style={{ height:24 }}/>

        <label className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--paper-white)', opacity:.7 }}>E-MAIL DA SUPREMA</label>
        <div style={{ height:6 }}/>
        <div style={{ display:'flex', alignItems:'center', background:'rgba(255,252,245,.06)', border:'1px solid rgba(255,252,245,.22)', borderRadius:10, padding:'4px 10px' }}>
          <input value={email} onChange={e=>setEmail(e.target.value)}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--paper-white)', fontFamily:'var(--mono)', fontSize:15, padding:'14px 6px', letterSpacing:'.02em' }} />
          <span className="mono" style={{ color:'var(--ink-4)', fontSize:13 }}>suprema.gg</span>
        </div>
        <div style={{ height:14 }}/>
        <button onClick={onDone} className="btn-yellow" style={{ width:'100%', justifyContent:'center', padding:'18px' }}>ENVIAR LINK MÁGICO ✦</button>
        <div style={{ height:14 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--paper-white)', opacity:.7 }}>
          <div style={{ flex:1, height:1, background:'rgba(255,252,245,.18)' }}/>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.18em' }}>OU</span>
          <div style={{ flex:1, height:1, background:'rgba(255,252,245,.18)' }}/>
        </div>
        <div style={{ height:14 }}/>
        <button onClick={onDone} style={{
          background:'rgba(255,252,245,.08)', color:'var(--paper-white)', border:'1px solid rgba(255,252,245,.22)',
          padding:'14px', borderRadius:999, fontWeight:700, letterSpacing:'.02em', textTransform:'uppercase', fontSize:13
        }}> Continuar com Google · @suprema.gg</button>

        <div style={{ height:18 }}/>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--paper-white)', opacity:.5, textAlign:'center' }}>
          ACESSO RESTRITO À SUPREMA GAMING. SE NÃO É DA FIRMA, NÃO ROLA.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN — Desktop (split)
   ========================================================= */
function LoginDesktop({ onDone }){
  return (
    <div style={{ height:'100%', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      {/* Left — photo */}
      <div style={{ position:'relative', overflow:'hidden', background:'var(--ink)' }}>
        <img src="assets/hero-jogadores.webp" alt="" style={{
          position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%'
        }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(13,13,13,.2), rgba(13,13,13,.6))' }}/>

        <div style={{ position:'relative', height:'100%', padding:32, display:'flex', flexDirection:'column', color:'var(--paper-white)' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Stamp color="var(--paper-white)" rot={-2}>edição '26</Stamp>
            <span className="mono" style={{ fontSize:11, letterSpacing:'.18em', opacity:.85 }}>★ MUNDIAL · 2 0 2 6</span>
          </div>
          <div style={{ flex:1 }}/>
          <div className="serif-it" style={{ fontSize:30, opacity:.92 }}>aviso de matchday:</div>
          <h2 className="display" style={{ fontSize:'clamp(64px, 7vw, 120px)', lineHeight:.86, margin:'8px 0 0' }}>
            BORA<br/>PALPITAR<br/><span style={{ color:'var(--yellow)' }}>DE NOVO?</span>
          </h2>
          <div style={{ marginTop:20, display:'flex', gap:24, alignItems:'flex-end' }}>
            <div>
              <div className="display" style={{ fontSize:54, lineHeight:.9, color:'var(--yellow)' }}>02</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.85 }}>DIAS PRA RODADA 1</div>
            </div>
            <div>
              <div className="display" style={{ fontSize:54, lineHeight:.9 }}>87</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.85 }}>JOGADORES INSCRITOS</div>
            </div>
            <div>
              <div className="display" style={{ fontSize:54, lineHeight:.9 }}>1.284</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.85 }}>PTS DO LÍDER</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="paper-grain" style={{ background:'var(--paper)', padding:'48px 64px', display:'flex', flexDirection:'column', gap:14, overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Logo height={48}/>
          <span className="mono" style={{ fontSize:11, letterSpacing:'.18em', opacity:.6 }}>v.4 / 2026</span>
        </div>
        <div style={{ flex:.4 }}/>
        <div className="eyebrow" style={{ opacity:.6 }}>03 · ENTRAR</div>
        <h1 className="display" style={{ fontSize:84, lineHeight:.86, margin:0 }}>BEM-VINDO<br/>DE VOLTA.</h1>
        <p style={{ fontSize:16, lineHeight:1.45, color:'var(--ink-2)', margin:'8px 0 0', maxWidth:480 }}>
          Login com seu e-mail da Suprema. Em <em>5 segundos</em> você tá no bolão e xingando o Diogo no chat. <span className="serif-it">(de novo)</span>
        </p>
        <div style={{ height:22 }}/>
        <div>
          <label className="mono" style={{ fontSize:11, letterSpacing:'.18em' }}>E-MAIL DA FIRMA</label>
          <div style={{ height:6 }}/>
          <div style={{ display:'flex', alignItems:'center', background:'var(--paper-white)', border:'1.5px solid var(--ink)', padding:'4px 14px', borderRadius:8 }}>
            <input defaultValue="felipe.souza" style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:'var(--mono)', fontSize:16, padding:'16px 0', letterSpacing:'.02em' }}/>
            <span className="mono" style={{ fontSize:14, opacity:.5 }}>@suprema.gg</span>
          </div>
        </div>
        <div style={{ height:14 }}/>
        <button onClick={onDone} className="btn-yellow" style={{ padding:'18px 24px', fontSize:15, alignSelf:'flex-start' }}>
          ENVIAR LINK MÁGICO →
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
          <div style={{ flex:1, height:1, background:'rgba(13,13,13,.18)' }}/>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', opacity:.6 }}>OU MAIS RÁPIDO</span>
          <div style={{ flex:1, height:1, background:'rgba(13,13,13,.18)' }}/>
        </div>
        <button onClick={onDone} className="btn-ghost" style={{ padding:'14px 18px', alignSelf:'flex-start' }}>
          Continuar com Google Workspace
        </button>
        <div style={{ flex:1 }}/>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.5, marginTop:18 }}>
          ACESSO RESTRITO. ENTRA SÓ QUEM TEM CRACHÁ DA SUPREMA.
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PROFILE CREATION — Mobile
   ========================================================= */
function ProfileMobile({ onDone }){
  const [tab, setTab] = React.useState('avatar'); // photo | avatar
  const [team, setTeam] = React.useState('BRA');
  const [palpite, setPalpite] = React.useState('ARG');
  const teams = ['BRA','ARG','FRA','GER','ESP','POR','ENG','NED'];

  return (
    <div style={{ height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column' }} className="paper-grain">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:'1.5px solid var(--ink)' }}>
        <span className="mono" style={{ fontSize:10, letterSpacing:'.18em' }}>PASSO 03 · DE 03</span>
        <span className="mono" style={{ fontSize:10, letterSpacing:'.18em' }}>FELIPE.SOUZA@SUPREMA.GG</span>
      </div>

      <div style={{ padding:'18px 22px 6px' }}>
        <div className="eyebrow" style={{ opacity:.6 }}>SE APRESENTA AÍ</div>
        <h1 className="display" style={{ fontSize:48, lineHeight:.86, margin:'6px 0 0' }}>
          A galera<br/>quer ver<br/><span style={{ color:'var(--green-deep)' }}>tua cara.</span>
        </h1>
        <p style={{ fontSize:13, lineHeight:1.4, color:'var(--ink-2)', margin:'10px 0 0' }}>
          O ranking é social. Sem cara, sem zueira. <span className="serif-it">(é a regra.)</span>
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', margin:'14px 22px 0', border:'1.5px solid var(--ink)', borderRadius:999, padding:3, background:'var(--paper-white)' }}>
        {[['photo','Foto real'], ['avatar','Avatar']].map(([id, l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:'10px', fontWeight:700, fontSize:12, letterSpacing:'.04em', textTransform:'uppercase',
            borderRadius:999,
            background: tab === id ? 'var(--ink)' : 'transparent',
            color: tab === id ? 'var(--paper-white)' : 'var(--ink)'
          }}>{l}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:'18px 22px', flex:1, overflow:'auto' }}>
        {tab === 'photo' ? <PhotoTab/> : <AvatarTab/>}

        <div style={{ height:18 }}/>
        <div className="eyebrow" style={{ opacity:.6 }}>SUA SELEÇÃO DO ❤</div>
        <div style={{ height:8 }}/>
        <div style={{ display:'flex', gap:10, overflow:'auto', paddingBottom:6 }} className="no-scrollbar">
          {teams.map(c => (
            <button key={c} onClick={()=>setTeam(c)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              padding:8, borderRadius:10,
              border: team === c ? '2px solid var(--ink)' : '1.5px solid var(--hairline)',
              background: team === c ? 'var(--yellow)' : 'var(--paper-white)',
              minWidth: 76,
            }}>
              <Flag team={T[c]} size={44}/>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.12em' }}>{c}</span>
            </button>
          ))}
        </div>

        <div style={{ height:18 }}/>
        <div className="eyebrow" style={{ opacity:.6 }}>PALPITE ARRISCADO · QUEM LEVA A TAÇA?</div>
        <div style={{ height:8 }}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {teams.slice(0,8).map(c => (
            <button key={c} onClick={()=>setPalpite(c)} style={{
              padding:'10px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              border: palpite === c ? '2px solid var(--ink)' : '1.5px solid var(--hairline)',
              background: palpite === c ? 'var(--green)' : 'var(--paper-white)',
              color: palpite === c ? 'var(--paper-white)' : 'var(--ink)',
              borderRadius:8
            }}>
              <Flag team={T[c]} size={32}/>
              <span className="mono" style={{ fontSize:9, letterSpacing:'.1em' }}>{c}</span>
            </button>
          ))}
        </div>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6, marginTop:8 }}>
          ↳ ACERTAR O CAMPEÃO = +50 PTS DE BÔNUS NO FINAL
        </div>
      </div>

      <div style={{ padding:'14px 22px 18px', borderTop:'1.5px solid var(--ink)', background:'var(--paper-white)' }}>
        <button onClick={onDone} className="btn-yellow" style={{ width:'100%', justifyContent:'center', padding:'16px' }}>
          ENTRAR NO BOLÃO · CRIAR PERFIL
        </button>
      </div>
    </div>
  );
}

function PhotoTab(){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        border: '1.5px dashed var(--ink)', position:'relative', overflow:'hidden',
        background: 'var(--paper-white)', flexShrink: 0
      }}>
        <div className="stripe-bg" style={{ position:'absolute', inset:0, opacity:.18 }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="display" style={{ fontSize: 36 }}>FS</span>
        </div>
      </div>
      <div style={{ flex:1 }}>
        <div className="display" style={{ fontSize: 22 }}>Sobe uma foto.</div>
        <div className="serif-it" style={{ fontSize: 14, color:'var(--ink-3)' }}>nada de logo, nada de paisagem.</div>
        <div style={{ height: 8 }}/>
        <button className="btn-ghost" style={{ padding:'8px 12px', fontSize:11 }}>📁 ESCOLHER</button>
        <button className="btn-ghost" style={{ padding:'8px 12px', fontSize:11, marginLeft:6 }}>📷 CÂMERA</button>
      </div>
    </div>
  );
}
function AvatarTab(){
  const [pick, setPick] = React.useState(0);
  const skins = ['#FFCB05','#00A651','#E63946','#1D3557','#C9A856','#6FB4FF'];
  const traits = ['Boné','Bigode','Óculos','Cachecol','Brinco','Tatu'];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{
          width:96, height:96, borderRadius:'50%',
          background: skins[pick], border:'2px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
        }}>
          <span className="display" style={{ fontSize: 38 }}>FS</span>
        </div>
        <div>
          <div className="display" style={{ fontSize:22 }}>Avatar geração 26.</div>
          <div className="serif-it" style={{ fontSize:14, color:'var(--ink-3)' }}>cabelo, traço, energia.</div>
          <div style={{ display:'flex', gap:6, marginTop:8 }}>
            {skins.map((c,i) => (
              <button key={i} onClick={()=>setPick(i)} style={{
                width:28, height:28, borderRadius:'50%', background:c,
                border: i === pick ? '2px solid var(--ink)' : '1px solid rgba(13,13,13,.2)'
              }}/>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height:14 }}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
        {traits.map((t,i) => (
          <button key={t} style={{
            padding:'10px 8px', borderRadius:8, border:'1.5px solid var(--ink)',
            background: i === 0 ? 'var(--yellow)' : 'var(--paper-white)',
            fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em'
          }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE — Desktop (editorial profile sheet)
   ========================================================= */
function ProfileDesktop({ onDone }){
  return (
    <div style={{ height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column' }} className="paper-grain">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 32px', borderBottom:'1.5px solid var(--ink)' }}>
        <Logo height={32}/>
        <span className="mono" style={{ fontSize:11, letterSpacing:'.18em', opacity:.6 }}>FICHA DE INSCRIÇÃO · Nº 088</span>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.1fr 1fr', minHeight:0 }}>
        <div style={{ padding:'34px 48px', overflow:'auto' }}>
          <div className="eyebrow" style={{ opacity:.6 }}>PASSO FINAL · CRIE SEU PERFIL</div>
          <h1 className="display" style={{ fontSize:'clamp(64px, 7vw, 108px)', lineHeight:.86, margin:'10px 0 0' }}>
            FICHA DA<br/><span style={{ color:'var(--green-deep)' }}>RESENHA.</span>
          </h1>
          <p style={{ fontSize:16, lineHeight:1.45, color:'var(--ink-2)', maxWidth:520, margin:'14px 0 0' }}>
            Cara, time e palpite arriscado. Em <em>40 segundos</em> tu tá oficialmente brigando pelo bolão.
          </p>

          <div style={{ height:24 }}/>
          <Field label="01 · NOME COMPLETO">
            <Input defaultValue="Felipe Souza"/>
          </Field>
          <Field label="02 · DEPARTAMENTO / SQUAD">
            <select style={selStyle} defaultValue="Design">
              <option>Design</option><option>Engenharia</option><option>Produto</option><option>Marketing</option><option>RH</option><option>CEO</option>
            </select>
          </Field>
          <Field label="03 · APELIDO DE BOLÃO (vai aparecer na resenha)">
            <Input defaultValue="Fê 'Fenômeno'"/>
          </Field>
          <Field label="04 · SUA SELEÇÃO DO ❤">
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {['BRA','ARG','FRA','POR','ENG','GER','ESP','NED'].map((c, i) => (
                <button key={c} style={{
                  padding:'6px 10px', borderRadius:999,
                  background: i === 0 ? 'var(--yellow)' : 'var(--paper-white)',
                  border:'1.5px solid var(--ink)',
                  display:'inline-flex', alignItems:'center', gap:8,
                  fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em'
                }}><Flag team={T[c]} size={18}/> {T[c].name}</button>
              ))}
            </div>
          </Field>
          <Field label="05 · QUEM LEVA A TAÇA? (palpite arriscado · +50pts)">
            <div style={{ display:'flex', gap:10 }}>
              {['ARG','BRA','FRA','ENG'].map((c,i) => (
                <button key={c} style={{
                  padding:'14px 14px', borderRadius:8,
                  background: i === 0 ? 'var(--green)' : 'var(--paper-white)',
                  color: i === 0 ? 'var(--paper-white)' : 'var(--ink)',
                  border:'1.5px solid var(--ink)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:88
                }}>
                  <Flag team={T[c]} size={32}/>
                  <span className="mono" style={{ fontSize:11, letterSpacing:'.1em' }}>{c}</span>
                </button>
              ))}
            </div>
          </Field>

          <div style={{ height:18 }}/>
          <button onClick={onDone} className="btn-yellow" style={{ padding:'16px 24px', fontSize:15 }}>
            CONCLUIR · ENTRAR NA CHAVE →
          </button>
        </div>

        {/* Right — preview card */}
        <div style={{ padding:'34px 48px', borderLeft:'1.5px solid var(--ink)', background:'var(--paper-deep)' }}>
          <div className="eyebrow" style={{ opacity:.6 }}>PRÉVIA · COMO VOCÊ APARECE NO RANKING</div>
          <div style={{ height:14 }}/>
          <div style={{
            background:'var(--paper-white)', border:'1.5px solid var(--ink)',
            padding:24, position:'relative',
            transform:'rotate(-1deg)', boxShadow:'8px 8px 0 var(--ink)'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <Stamp color="var(--green-deep)">novato '26</Stamp>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.18em' }}>Nº 088</span>
            </div>
            <div style={{ height:14 }}/>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{
                width:96, height:96, borderRadius:'50%', background:'var(--yellow)',
                border:'2px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <span className="display" style={{ fontSize:42 }}>FS</span>
              </div>
              <div>
                <div className="serif-it" style={{ fontSize:18, color:'var(--ink-3)' }}>Fê 'Fenômeno'</div>
                <div className="display" style={{ fontSize:34, lineHeight:.92 }}>FELIPE<br/>SOUZA</div>
                <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.6 }}>DESIGN · DESDE 2023</div>
              </div>
            </div>
            <div style={{ height:18 }}/>
            <div style={{ display:'flex', gap:14, alignItems:'center', borderTop:'1px dashed var(--ink)', paddingTop:14 }}>
              <Flag team={T.BRA} size={48} ring/>
              <div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6 }}>SELEÇÃO DO ❤</div>
                <div className="display" style={{ fontSize:24 }}>BRASIL</div>
              </div>
              <div style={{ flex:1 }}/>
              <Flag team={T.ARG} size={48} ring/>
              <div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6 }}>CAMPEÃO?</div>
                <div className="display" style={{ fontSize:24 }}>ARGENTINA</div>
              </div>
            </div>
          </div>
          <div style={{ height:18 }}/>
          <div className="serif-it" style={{ fontSize:18, lineHeight:1.3, color:'var(--ink-2)' }}>
            "palpitar Argentina sendo brasileiro é o tipo<br/>de coragem que a firma respeita."
          </div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6, marginTop:8 }}>— RESENHA, 14:08</div>
        </div>
      </div>
    </div>
  );
}

const selStyle = {
  width:'100%', padding:'14px', border:'1.5px solid var(--ink)',
  background:'var(--paper-white)', fontFamily:'var(--sans)', fontSize:15, fontWeight:600, borderRadius:8
};
function Field({ label, children }){
  return (
    <div style={{ marginBottom:16 }}>
      <div className="mono" style={{ fontSize:11, letterSpacing:'.18em', marginBottom:6 }}>{label}</div>
      {children}
    </div>
  );
}
function Input(props){
  return <input {...props} style={{ ...selStyle, ...(props.style||{}) }}/>;
}

Object.assign(window, { LoginMobile, LoginDesktop, ProfileMobile, ProfileDesktop });
