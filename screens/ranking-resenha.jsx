/* global React, Flag, Avatar, Stamp, T, RANKING, CHAT, Eyebrow, Marquee */

/* =========================================================
   RANKING — Mobile
   ========================================================= */
function RankingMobile(){
  const [tab, setTab] = React.useState('geral');
  return (
    <div style={{ background:'var(--paper)', minHeight:'100%' }} className="paper-grain">
      <div style={{ padding:'14px 18px 8px' }}>
        <div className="eyebrow" style={{ opacity:.6 }}>SEÇÃO 04</div>
        <h1 className="display" style={{ fontSize:46, lineHeight:.85, margin:'4px 0 0' }}>
          RANKING.<br/><span className="serif-it" style={{ color:'var(--green-deep)', fontSize:30 }}>87 jogadores · 1 taça.</span>
        </h1>
      </div>

      <div style={{ display:'flex', gap:6, padding:'10px 18px 0' }}>
        {['geral','squad','semana'].map(k=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:'8px 14px', borderRadius:999, border:'1.5px solid var(--ink)',
            background: tab === k ? 'var(--ink)' : 'var(--paper-white)',
            color: tab === k ? 'var(--paper-white)' : 'var(--ink)',
            fontFamily:'var(--display)', fontSize:14, letterSpacing:'.04em', textTransform:'uppercase'
          }}>{k}</button>
        ))}
      </div>

      {/* podium */}
      <div style={{ padding:'18px 18px 8px', display:'grid', gridTemplateColumns:'1fr 1.15fr 1fr', alignItems:'flex-end', gap:6 }}>
        {[RANKING[1], RANKING[0], RANKING[2]].map((p, i) => {
          const heights = [104, 132, 90];
          const order = [2,1,3];
          return (
            <div key={p.rank} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <Avatar p={p} size={i===1?64:48}/>
              <div style={{ fontSize:11, fontWeight:700, textAlign:'center', lineHeight:1.1 }}>{p.name.split(' ')[0]}</div>
              <div className="mono" style={{ fontSize:10, opacity:.6 }}>{p.pts} pts</div>
              <div style={{
                width:'100%', height: heights[i],
                background: i === 1 ? 'var(--yellow)' : i === 0 ? 'var(--paper-deep)' : 'var(--paper-deep)',
                border:'1.5px solid var(--ink)',
                borderRadius:'10px 10px 0 0',
                display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop: 10
              }}>
                <span className="display" style={{ fontSize: i === 1 ? 50 : 36 }}>{order[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* you sticky */}
      <div style={{ margin:'8px 14px', padding:'12px 14px', background:'var(--ink)', color:'var(--paper-white)', borderRadius:14, display:'flex', alignItems:'center', gap:12 }}>
        <span className="avatar" style={{ width:40, height:40, background:'var(--yellow)', color:'var(--ink)' }}>FS</span>
        <div style={{ flex:1 }}>
          <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', opacity:.7 }}>VOCÊ</div>
          <div className="display" style={{ fontSize:18 }}>FELIPE SOUZA</div>
        </div>
        <div className="display" style={{ fontSize:36 }}>06º</div>
        <div style={{ width:1, height:30, background:'rgba(255,252,245,.2)' }}/>
        <div className="display" style={{ fontSize:24, color:'var(--yellow)' }}>1.204</div>
      </div>

      {/* table */}
      <div style={{ margin:'4px 14px 18px', background:'var(--paper-white)', border:'1.5px solid var(--ink)', borderRadius:14, overflow:'hidden' }}>
        {RANKING.map((p, i) => {
          const movPos = p.mov.startsWith('+');
          const movNeg = p.mov.startsWith('-');
          return (
            <div key={p.rank} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 14px',
              borderTop: i ? '1px dashed rgba(13,13,13,.12)' : 'none',
              background: p.isYou ? 'var(--yellow)' : 'transparent'
            }}>
              <span className="display" style={{ fontSize:18, width:28 }}>{String(p.rank).padStart(2,'0')}</span>
              <Avatar p={p} size={32}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight: p.isYou? 800: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', opacity:.55 }}>{p.dept.toUpperCase()} · {p.exact} EXATOS</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div className="display" style={{ fontSize:18 }}>{p.pts}</div>
                <div className="mono" style={{ fontSize:9, letterSpacing:'.12em',
                  color: movPos ? 'var(--green-deep)' : movNeg ? 'var(--red)' : 'var(--ink-3)'
                }}>{movPos? '▲':movNeg? '▼':'•'} {p.mov}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   RANKING — Desktop
   ========================================================= */
function RankingDesktop(){
  return (
    <div style={{ background:'var(--paper)', minHeight:'100%' }} className="paper-grain">
      <div style={{ padding:'18px 32px', borderBottom:'1.5px solid var(--ink)' }}>
        <span className="eyebrow" style={{ opacity:.6 }}>SEÇÃO 04 · TABELA OFICIAL</span>
        <h1 className="display" style={{ fontSize:'clamp(60px, 7vw, 110px)', lineHeight:.86, margin:'4px 0 0' }}>
          O <span className="serif-it" style={{ color:'var(--green-deep)' }}>caos</span> da firma.
        </h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', minHeight:0 }}>
        {/* left — podium + table */}
        <div style={{ padding:'24px 32px', borderRight:'1.5px solid var(--ink)' }}>
          <Eyebrow num="01" sub="ATUALIZADO 14:08">PÓDIO · OITAVAS</Eyebrow>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr 1fr', alignItems:'flex-end', gap:14, marginTop:14 }}>
            {[RANKING[1], RANKING[0], RANKING[2]].map((p, i) => (
              <div key={p.rank} style={{
                background: i === 1 ? 'var(--yellow)' : 'var(--paper-white)',
                border:'1.5px solid var(--ink)', borderRadius:14, padding:'18px 18px 24px',
                position:'relative', overflow:'hidden',
                transform: i === 1 ? 'translateY(-8px)' : 'none',
                boxShadow: '6px 6px 0 var(--ink)'
              }}>
                <div className="display" style={{ fontSize: i === 1 ? 90 : 64, lineHeight:.9, position:'absolute', right:14, top:8, opacity:.18 }}>
                  {i === 1 ? '01' : i === 0 ? '02' : '03'}
                </div>
                <Avatar p={p} size={i === 1 ? 72 : 56}/>
                <div className="display" style={{ fontSize: i === 1 ? 28 : 22, marginTop:10, lineHeight:.95 }}>{p.name.toUpperCase()}</div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6, marginTop:4 }}>{p.dept.toUpperCase()}</div>
                <div style={{ height:10 }}/>
                <div className="display" style={{ fontSize:42, lineHeight:1 }}>{p.pts}</div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em' }}>PTS · {p.exact} EXATOS · STREAK {p.streak}</div>
              </div>
            ))}
          </div>

          <div style={{ height:24 }}/>
          <Eyebrow num="02">TABELA · TODOS OS 12 PRIMEIROS</Eyebrow>
          <div style={{ marginTop:10, background:'var(--paper-white)', border:'1.5px solid var(--ink)', borderRadius:14, overflow:'hidden' }}>
            <div style={{
              display:'grid', gridTemplateColumns:'40px 1.4fr 1fr 70px 70px 70px 70px',
              padding:'10px 14px', borderBottom:'1.5px solid var(--ink)', background:'var(--paper-deep)',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:600
            }}>
              <div>#</div><div>jogador</div><div>squad</div><div>acertos</div><div>exatos</div><div>streak</div><div style={{ textAlign:'right' }}>pts</div>
            </div>
            {RANKING.map((p, i) => {
              const movPos = p.mov.startsWith('+');
              const movNeg = p.mov.startsWith('-');
              return (
                <div key={p.rank} style={{
                  display:'grid', gridTemplateColumns:'40px 1.4fr 1fr 70px 70px 70px 70px',
                  padding:'12px 14px', alignItems:'center',
                  borderTop: i ? '1px dashed rgba(13,13,13,.12)' : 'none',
                  background: p.isYou ? 'var(--yellow)' : 'transparent'
                }}>
                  <div className="display" style={{ fontSize:18 }}>{String(p.rank).padStart(2,'0')}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Avatar p={p} size={28}/>
                    <span style={{ fontWeight: p.isYou? 800 : 600, fontSize:14 }}>{p.name}</span>
                    <span className="mono" style={{ fontSize:10, color: movPos? 'var(--green-deep)':movNeg?'var(--red)':'var(--ink-3)' }}>{movPos?'▲':movNeg?'▼':'•'}{p.mov}</span>
                  </div>
                  <div className="mono" style={{ fontSize:11, opacity:.7 }}>{p.dept}</div>
                  <div className="display" style={{ fontSize:18 }}>{p.correct}</div>
                  <div className="display" style={{ fontSize:18, color:'var(--green-deep)' }}>{p.exact}</div>
                  <div className="mono" style={{ fontSize:12 }}>{p.streak}🔥</div>
                  <div className="display" style={{ fontSize:22, textAlign:'right' }}>{p.pts}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* right rail */}
        <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:18, background:'var(--paper-deep)' }}>
          <div style={{
            background:'var(--ink)', color:'var(--paper-white)', borderRadius:14, padding:20, position:'relative', overflow:'hidden'
          }}>
            <Stamp color="var(--yellow)" rot={-3}>você</Stamp>
            <div className="display" style={{ fontSize:90, lineHeight:.85, marginTop:10 }}>06<span className="serif-it" style={{ fontSize:32 }}>º</span></div>
            <div className="display" style={{ fontSize:34 }}>1.204 PTS</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.7, marginTop:4 }}>FELIPE SOUZA · DESIGN</div>
            <div style={{ height:14, borderTop:'1px dashed rgba(255,252,245,.22)', marginTop:14, paddingTop:14 }}/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              <Stat2 n="15" l="acertos"/>
              <Stat2 n="5" l="exatos"/>
              <Stat2 n="5🔥" l="streak"/>
            </div>
          </div>

          <div style={{ background:'var(--paper-white)', border:'1.5px solid var(--ink)', borderRadius:14, padding:18 }}>
            <Eyebrow num="03">RANKING POR SQUAD</Eyebrow>
            <div style={{ height:10 }}/>
            {[
              ['Eng. Plataforma',1284,'#00A651'],['Marketing',1271,'#FFCB05'],['CEO',1248,'#E63946'],['Produto',1230,'#1D3557'],['Data',1218,'#C9A856'],
              ['Design',1204,'#FFCB05']
            ].map(([d, pts, c], i)=>(
              <div key={d} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop: i? '1px dashed rgba(13,13,13,.15)':'none' }}>
                <div style={{ width:8, height:24, background:c }}/>
                <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{d}</span>
                <span className="display" style={{ fontSize:18 }}>{pts}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--paper-white)', border:'1.5px solid var(--ink)', borderRadius:14, padding:18 }}>
            <Eyebrow num="04">TROFÉUS DA SEMANA</Eyebrow>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginTop:10 }}>
              {[
                ['🎯','SNIPER','Mais exatos','5'],
                ['🔥','STREAK','Maior sequência','5🔥'],
                ['💀','MICO','Pior palpite','+0pt'],
                ['🤝','JURADO','Mais reagiu','22'],
              ].map(([e, t, l, n]) => (
                <div key={t} style={{ border:'1.5px solid var(--ink)', borderRadius:10, padding:'12px 10px' }}>
                  <div style={{ fontSize:24 }}>{e}</div>
                  <div className="display" style={{ fontSize:18, marginTop:4 }}>{t}</div>
                  <div className="mono" style={{ fontSize:9, letterSpacing:'.12em', opacity:.6 }}>{l}</div>
                  <div className="display" style={{ fontSize:20, marginTop:4, color:'var(--green-deep)' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Stat2({ n, l }){
  return (
    <div>
      <div className="display" style={{ fontSize:28, color:'var(--yellow)' }}>{n}</div>
      <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', opacity:.7 }}>{l.toUpperCase()}</div>
    </div>
  );
}


/* =========================================================
   RESENHA — Mobile chat
   ========================================================= */
function ResenhaMobile(){
  return (
    <div style={{ background:'var(--paper)', height:'100%', display:'flex', flexDirection:'column' }} className="paper-grain">
      <div style={{ padding:'12px 18px', borderBottom:'1.5px solid var(--ink)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div className="display" style={{ fontSize:24 }}>#RESENHA</div>
          <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', opacity:.6 }}>87 ONLINE · 412 MSGS HOJE</div>
        </div>
        <span className="badge" style={{ background:'var(--green)', color:'var(--paper-white)' }}>● ATIVO</span>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px' }}>
        {CHAT.map((m, i) => (
          <ChatBubble key={i} m={m}/>
        ))}
        <div style={{
          padding:14, marginTop:8, border:'1.5px dashed var(--ink)', borderRadius:14, background:'var(--paper-deep)',
          textAlign:'center'
        }}>
          <Stamp color="var(--green-deep)" rot={-2}>provocação oficial</Stamp>
          <div className="serif-it" style={{ marginTop:10, fontSize:18 }}>"se BRA não ganha do Marrocos, eu raspo a cabeça."</div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6, marginTop:6 }}>— RENAN, CEO · 23 ✓ APOSTARAM</div>
        </div>
      </div>

      <div style={{ padding:10, borderTop:'1.5px solid var(--ink)', display:'flex', gap:8, alignItems:'center', background:'var(--paper-white)' }}>
        <button className="mono" style={{ fontSize:18 }}>⚽</button>
        <input placeholder="manda a tua aí…" style={{
          flex:1, padding:'10px 14px', borderRadius:999,
          border:'1.5px solid var(--ink)', background:'var(--paper)', fontFamily:'var(--sans)', fontSize:14
        }}/>
        <button className="btn-yellow" style={{ padding:'10px 14px', fontSize:11 }}>ENVIAR</button>
      </div>
    </div>
  );
}

function ChatBubble({ m }){
  const isYou = m.isYou;
  return (
    <div style={{ display:'flex', gap:10, marginBottom:14, flexDirection: isYou ? 'row-reverse' : 'row' }}>
      <span className="avatar" style={{ width:36, height:36, fontSize:13, background:m.color }}>{m.init}</span>
      <div style={{ maxWidth:'78%' }}>
        <div style={{ display:'flex', gap:8, alignItems:'baseline', justifyContent: isYou ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize:12, fontWeight:700 }}>{m.who}</span>
          <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', opacity:.5 }}>{m.dept.toUpperCase()} · {m.time}</span>
        </div>
        <div style={{
          marginTop:4, padding:'10px 14px',
          background: isYou ? 'var(--yellow)' : 'var(--paper-white)',
          border:'1.5px solid var(--ink)',
          borderRadius: isYou ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          fontSize:14, lineHeight:1.4
        }}>{m.text}</div>
        {m.reaction && (
          <div style={{ marginTop:4, display:'flex', gap:6, justifyContent: isYou? 'flex-end' : 'flex-start' }}>
            <span style={{
              padding:'3px 8px', border:'1px solid var(--ink)', borderRadius:999, background:'var(--paper-white)', fontSize:11
            }}>{m.reaction} 12</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RESENHA — Desktop (chat + threads + stats)
   ========================================================= */
function ResenhaDesktop(){
  return (
    <div style={{ background:'var(--paper)', minHeight:'100%' }} className="paper-grain">
      <div style={{ padding:'18px 32px', borderBottom:'1.5px solid var(--ink)' }}>
        <span className="eyebrow" style={{ opacity:.6 }}>SEÇÃO 05 · CHAT DA FIRMA</span>
        <h1 className="display" style={{ fontSize:'clamp(60px, 7vw, 110px)', lineHeight:.86, margin:'4px 0 0' }}>
          A <span className="serif-it" style={{ color:'var(--green-deep)' }}>resenha.</span>
        </h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 320px', minHeight: 700 }}>
        {/* channels */}
        <div style={{ borderRight:'1.5px solid var(--ink)', padding:'18px 0' }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', padding:'0 18px 8px', opacity:.6 }}>CANAIS</div>
          {[
            ['#geral', 412, true],
            ['#bra', 287, false],
            ['#por-x-uru', 64, false],
            ['#zueira', 198, false],
            ['#palpites-ousados', 73, false],
            ['#mathzi-vs-renan', 22, false],
            ['#cafezinho', 8, false],
          ].map(([n, c, active]) => (
            <button key={n} style={{
              display:'flex', alignItems:'center', gap:8, width:'100%',
              padding:'10px 18px',
              background: active ? 'var(--yellow)' : 'transparent',
              borderLeft: active ? '4px solid var(--ink)' : '4px solid transparent',
              fontWeight: active? 800 : 600
            }}>
              <span style={{ flex:1, textAlign:'left', fontSize:13 }}>{n}</span>
              <span className="mono" style={{ fontSize:10, opacity:.5 }}>{c}</span>
            </button>
          ))}
          <div style={{ height:14, borderTop:'1px dashed rgba(13,13,13,.15)', margin:'14px 0' }}/>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', padding:'0 18px 8px', opacity:.6 }}>JOGADORES ONLINE</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'0 18px' }}>
            {RANKING.slice(0,12).map(p => <Avatar key={p.rank} p={p} size={28}/>)}
          </div>
        </div>

        {/* main chat */}
        <div style={{ display:'flex', flexDirection:'column', borderRight:'1.5px solid var(--ink)' }}>
          <div style={{ padding:'14px 24px', borderBottom:'1.5px solid var(--ink)', background:'var(--paper-white)' }}>
            <div className="display" style={{ fontSize:24 }}>#GERAL</div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.6 }}>BAR DA FIRMA · BOLÃO '26 · TODO MUNDO</div>
          </div>
          <div style={{ flex:1, padding:'18px 24px', overflow:'auto' }}>
            {CHAT.map((m, i) => <ChatBubble key={i} m={m}/>)}
          </div>
          <div style={{ padding:14, borderTop:'1.5px solid var(--ink)', display:'flex', gap:10, alignItems:'center', background:'var(--paper-white)' }}>
            <input placeholder="manda a tua aí, jogador…" style={{
              flex:1, padding:'14px 18px', borderRadius:999,
              border:'1.5px solid var(--ink)', background:'var(--paper)', fontFamily:'var(--sans)', fontSize:14
            }}/>
            <button className="btn-ghost" style={{ padding:'10px 14px' }}>⚽ GIF</button>
            <button className="btn-yellow">ENVIAR →</button>
          </div>
        </div>

        {/* right rail — provocações */}
        <div style={{ padding:'18px 24px', background:'var(--paper-deep)' }}>
          <Eyebrow>PROVOCAÇÕES OFICIAIS</Eyebrow>
          <div style={{ height:14 }}/>
          {[
            ['Renan, CEO',"se BRA não passa do Marrocos, raspo a cabeça",23],
            ['Mathzi, Data',"pago café da firma 1 semana se BRA cair",47],
            ['Carla, Mkt',"cantar hino do adversário se ARG bater BRA",12],
          ].map(([who, t, n], i)=>(
            <div key={i} style={{
              background:'var(--paper-white)', border:'1.5px solid var(--ink)',
              borderRadius:12, padding:'14px', marginBottom:10,
              transform: `rotate(${i%2? -1:1}deg)`,
              boxShadow:'4px 4px 0 var(--ink)'
            }}>
              <Stamp color={i%2? "var(--red)" : "var(--green-deep)"} rot={-3}>aposta pública</Stamp>
              <div className="serif-it" style={{ fontSize:18, lineHeight:1.3, margin:'10px 0 6px' }}>"{t}"</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', opacity:.65 }}>— {who.toUpperCase()} · {n} APOSTARAM</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RankingMobile, RankingDesktop, ResenhaMobile, ResenhaDesktop, ChatBubble });
