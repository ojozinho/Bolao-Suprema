/* global React, Logo, TourneyMark, Flag, Stamp, Marquee, T */
const { useState: _us1 } = React;

/* =========================================================
   ONBOARDING — Mobile (swipe through 3 cards)
   ========================================================= */
function OnboardingMobile({ onDone }){
  const [step, setStep] = React.useState(0);
  const slides = [
    {
      eyebrow:"BOLÃO INTERNO · SUPREMA GAMING",
      kicker:"Mundial 2026",
      head:["O bolão","da firma","virou","esporte."],
      body:"O bolão oficial da Suprema Gaming pra Copa de 2026. 87 colegas, 64 jogos, 1 taça simbólica e brigas de almoço garantidas.",
      stamp:"Edição '26",
      photo: <PhotoHeroBR/>,
    },
    {
      eyebrow:"COMO É QUE FUNCIONA",
      kicker:"Palpite & Ponto",
      head:["Palpita.","Acerta.","Pontua.","Sobe."],
      body:"Resultado certo: 3 pts · Placar exato: 10 pts · Acerta o campeão na previa: bônus de 50 pts. Ranking ao vivo.",
      stamp:"Easy peasy",
      photo: <PhotoEmblems/>,
    },
    {
      eyebrow:"E A PROVOCAÇÃO?",
      kicker:"Resenha aberta",
      head:["A resenha","tá no","app.","Aguenta."],
      body:"Chat de bolão, reações, palpites públicos, troféus de zueira. Quem segura a galera do TI quando a Argentina ganhar?",
      stamp:"Ai cumade",
      photo: <PhotoCheer/>,
    },
  ];
  const s = slides[step];
  return (
    <div style={{ height:'100%', background:'var(--paper)', display:'flex', flexDirection:'column' }} className="paper-grain">
      {/* Top chrome */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px' }}>
        <Logo height={28}/>
        <button onClick={onDone} className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.6 }}>PULAR ›</button>
      </div>

      {/* Photo hero */}
      <div style={{ height: 280, position:'relative', overflow:'hidden', borderTop:'1.5px solid var(--ink)', borderBottom:'1.5px solid var(--ink)' }}>
        {s.photo}
        <div style={{ position:'absolute', top:14, left:14 }}>
          <Stamp color="var(--ink)">{s.stamp}</Stamp>
        </div>
        <div style={{ position:'absolute', top:14, right:14, color:'var(--paper-white)' }}>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', background:'var(--ink)', padding:'4px 8px' }}>{`0${step+1}`} / 03</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'22px 22px 12px', flex:1, display:'flex', flexDirection:'column' }}>
        <div className="eyebrow" style={{ opacity:.6 }}>{s.eyebrow}</div>
        <div style={{ height: 4 }}/>
        <div className="serif-it" style={{ fontSize: 24, lineHeight:1, color:'var(--green-deep)' }}>{s.kicker}</div>
        <div style={{ height: 8 }}/>
        <h1 className="display" style={{ margin:0, fontSize: 64, lineHeight:.86, letterSpacing:'-.005em' }}>
          {s.head.map((line,i) => (
            <div key={i} style={{
              transform: i%2 ? 'translateX(8px)' : 'none',
              color: i === 1 ? 'var(--green-deep)' : 'var(--ink)'
            }}>{line}</div>
          ))}
        </h1>
        <div style={{ height: 14 }}/>
        <p style={{ fontSize: 14, lineHeight:1.4, color:'var(--ink-2)', margin:0, maxWidth: 320 }}>{s.body}</p>
      </div>

      {/* Pagination + CTA */}
      <div style={{ padding:'14px 22px 22px' }}>
        <div style={{ display:'flex', gap:6, marginBottom: 14 }}>
          {slides.map((_,i)=>(
            <div key={i} style={{
              flex: 1, height: 4,
              background: i <= step ? 'var(--ink)' : 'rgba(13,13,13,.18)'
            }}/>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=> setStep(s => Math.max(0, s-1))} className="btn-ghost" style={{ padding:'12px 14px' }}>←</button>
          <button onClick={()=> step === 2 ? onDone() : setStep(s => s+1)} className="btn-yellow" style={{ flex:1, justifyContent:'center' }}>
            {step === 2 ? 'BORA JOGAR · ENTRAR' : 'PRÓXIMO'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Photo blocks (reuse uploaded imagery) */
function PhotoHeroBR(){
  return (
    <div style={{ position:'absolute', inset:0 }}>
      <div className="stripe-bg" style={{ position:'absolute', inset:0, opacity:.95 }}/>
      <img src="assets/hero-jogadores.webp" alt="" style={{
        position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%',
        mixBlendMode:'normal'
      }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 50%, rgba(13,13,13,.22))' }}/>
    </div>
  );
}
function PhotoEmblems(){
  const stack = [T.BRA, T.ARG, T.FRA, T.ENG, T.GER, T.POR];
  return (
    <div style={{ position:'absolute', inset:0, background:'var(--yellow)', overflow:'hidden' }}>
      <div className="stripe-bg-yellow" style={{ position:'absolute', inset:0, opacity:.6 }}/>
      <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'repeat(3,1fr)', alignItems:'center', justifyItems:'center', padding: 24 }}>
        {stack.map((t,i)=>(
          <div key={t.code} style={{ transform: `rotate(${(i%2?-1:1)*4}deg) translateY(${(i%3-1)*-8}px)` }}>
            <Flag team={t} size={84} ring/>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 70% 30%, rgba(13,13,13,.0), rgba(13,13,13,.18))' }}/>
    </div>
  );
}
function PhotoCheer(){
  return (
    <div style={{ position:'absolute', inset:0, background:'var(--ink)' }}>
      <img src="assets/hero-portrait.webp" alt="" style={{
        position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%', opacity:.92
      }}/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(255,203,5,.0) 50%, rgba(255,203,5,.6))' }}/>
    </div>
  );
}

/* =========================================================
   ONBOARDING — Desktop (single editorial cover)
   ========================================================= */
function OnboardingDesktop({ onDone }){
  return (
    <div style={{ minHeight:'100%', background:'var(--paper)', display:'flex', flexDirection:'column' }} className="paper-grain">
      {/* Top mast */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', borderBottom:'1.5px solid var(--ink)' }}>
        <span className="mono" style={{ fontSize:11, letterSpacing:'.18em' }}>SUPREMA GAMING · BOLETIM Nº 04</span>
        <TourneyMark/>
        <span className="mono" style={{ fontSize:11, letterSpacing:'.18em' }}>03 · JUL · 2026</span>
      </div>

      {/* Hero grid */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.05fr 1fr', minHeight: 620 }}>
        {/* Left — type column */}
        <div style={{ padding:'40px 48px 32px', display:'flex', flexDirection:'column', gap:18, overflow:'hidden' }}>
          <Logo height={56}/>
          <div className="serif-it" style={{ fontSize: 34, lineHeight: 1, color:'var(--green-deep)' }}>
            87 colegas. 64 jogos. <br/>uma taça (simbólica).
          </div>
          <h1 className="display" style={{ margin:0, fontSize: 'clamp(72px, 7.5vw, 130px)', lineHeight:.84, letterSpacing:'-.01em' }}>
            <div>O BOLÃO</div>
            <div style={{ color:'var(--green-deep)' }}>DA FIRMA</div>
            <div style={{ display:'flex', gap:14, alignItems:'baseline' }}>
              <span>VIROU</span>
              <span className="serif-it" style={{ color:'var(--ink-3)', fontSize:'.55em' }}>(de novo)</span>
            </div>
            <div>ESPORTE.</div>
          </h1>
          <p style={{ fontSize: 17, lineHeight:1.45, maxWidth: 540, color:'var(--ink-2)', margin:0 }}>
            Chega o Mundial 2026 e a Suprema entra em campo de novo. <strong>Palpita match a match, acompanha a chave, briga no chat.</strong> No fim, alguém leva a taça e bebida grátis na confra. Pode ser você.
          </p>
          <div style={{ display:'flex', gap:12, marginTop: 12 }}>
            <button onClick={onDone} className="btn-yellow" style={{ padding:'18px 24px', fontSize:15 }}>ENTRAR NO BOLÃO →</button>
            <button className="btn-ghost">VER REGRAS · 5 MIN</button>
          </div>
          <div style={{ display:'flex', gap:32, marginTop:40, borderTop:'1.5px solid var(--ink)', paddingTop:18 }}>
            <Stat n="87" l="colegas inscritos"/>
            <Stat n="64" l="jogos pra palpitar"/>
            <Stat n="48" l="seleções no torneio"/>
            <Stat n="50" l="pts de bônus pelo campeão"/>
          </div>
        </div>

        {/* Right — photo */}
        <div style={{ position:'relative', borderLeft:'1.5px solid var(--ink)', overflow:'hidden' }}>
          <PhotoHeroBR/>
          <div style={{ position:'absolute', top:24, right:24, display:'flex', gap:10 }}>
            <Stamp color="var(--paper-white)" rot={3}>edição '26</Stamp>
            <Stamp color="var(--paper-white)" rot={-2}>oficial da firma</Stamp>
          </div>
          <div style={{ position:'absolute', left:24, bottom:24, color:'var(--paper-white)', maxWidth: 260 }}>
            <div className="serif-it" style={{ fontSize: 18 }}>"Esse ano vai. Marca essa." </div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', opacity:.85, marginTop:6 }}>— RENAN, CEO. (TODO ANO)</div>
          </div>
          <div style={{ position:'absolute', right:0, bottom:0, padding:'10px 16px', background:'var(--yellow)', borderTop:'1.5px solid var(--ink)', borderLeft:'1.5px solid var(--ink)' }}>
            <span className="mono" style={{ fontSize:11, letterSpacing:'.14em', fontWeight:700 }}>↳ FOTO: ARQUIVO BOLÃO</span>
          </div>
        </div>
      </div>

      {/* Marquee bottom */}
      <Marquee items={[
        "INSCRIÇÕES ABERTAS","RODADA 1 INICIA SEX 03 JUL · 16h","CAMPEÃO LEVA TAÇA + ALMOÇO PAGO PELO CEO",
        "RANKING AO VIVO","CADA PALPITE EXATO = 10 PTS","RESENHA ABERTA NO #BOLAO"
      ]}/>
    </div>
  );
}
function Stat({ n, l }){
  return (
    <div>
      <div className="display" style={{ fontSize: 44, lineHeight:.9 }}>{n}</div>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', opacity:.7 }}>{l}</div>
    </div>
  );
}

Object.assign(window, { OnboardingMobile, OnboardingDesktop, PhotoHeroBR, PhotoEmblems, PhotoCheer, Stat });
