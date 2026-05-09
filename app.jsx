/* global React, ReactDOM,
   Logo,
   OnboardingMobile, OnboardingDesktop,
   LoginMobile, LoginDesktop,
   ProfileMobile, ProfileDesktop,
   HomeMobile, HomeDesktop,
   BracketMobile, BracketDesktop,
   PredictionMobile, PredictionDesktop,
   RankingMobile, RankingDesktop,
   ResenhaMobile, ResenhaDesktop,
   AdminMobile, AdminDesktop,
   IOSDevice,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakToggle
*/

const SCREENS = [
  { id:'onboarding', label:'01 · Onboarding', mobile: OnboardingMobile, desktop: OnboardingDesktop },
  { id:'login',      label:'02 · Login',      mobile: LoginMobile,      desktop: LoginDesktop },
  { id:'profile',    label:'03 · Perfil',     mobile: ProfileMobile,    desktop: ProfileDesktop },
  { id:'home',       label:'04 · Capa',       mobile: HomeMobile,       desktop: HomeDesktop },
  { id:'bracket',    label:'05 · Chave ★',    mobile: BracketMobile,    desktop: BracketDesktop },
  { id:'prediction', label:'06 · Palpitar',   mobile: PredictionMobile, desktop: PredictionDesktop },
  { id:'ranking',    label:'07 · Ranking',    mobile: RankingMobile,    desktop: RankingDesktop },
  { id:'resenha',    label:'08 · Resenha',    mobile: ResenhaMobile,    desktop: ResenhaDesktop },
  { id:'admin',      label:'09 · Admin',      mobile: AdminMobile,      desktop: AdminDesktop },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewport": "both",
  "screen": "home",
  "accent": "vivid",
  "paperTone": "warm"
}/*EDITMODE-END*/;

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(t.screen || 'home');
  const [view, setView] = React.useState(t.viewport || 'both');

  // Apply theme tweaks
  React.useEffect(() => {
    const root = document.documentElement;
    const accents = {
      vivid:    { yellow:'#FFCB05', green:'#00A651', red:'#E63946', greenDeep:'#007A3E' },
      gold:     { yellow:'#E6B800', green:'#0E5E3F', red:'#B23A48', greenDeep:'#0A4530' },
      desert:   { yellow:'#F4A300', green:'#2A6F4A', red:'#C9382E', greenDeep:'#1B4D32' },
    };
    const a = accents[t.accent] || accents.vivid;
    root.style.setProperty('--yellow', a.yellow);
    root.style.setProperty('--green', a.green);
    root.style.setProperty('--red', a.red);
    root.style.setProperty('--green-deep', a.greenDeep);

    const papers = {
      warm:    { paper:'#F5F1E8', deep:'#ECE6D6', white:'#FFFCF5' },
      cool:    { paper:'#F0F2EE', deep:'#E0E4DD', white:'#FBFDF9' },
      cream:   { paper:'#F8F0DD', deep:'#EFE4C8', white:'#FFF9EB' },
    };
    const p = papers[t.paperTone] || papers.warm;
    root.style.setProperty('--paper', p.paper);
    root.style.setProperty('--paper-deep', p.deep);
    root.style.setProperty('--paper-white', p.white);
  }, [t.accent, t.paperTone]);

  // sync screen back to tweaks (so editmode persists screen)
  React.useEffect(() => { setTweak('screen', screen); }, [screen]);
  React.useEffect(() => { setTweak('viewport', view); }, [view]);

  const cur = SCREENS.find(s => s.id === screen);
  const Mobile = cur.mobile;
  const Desktop = cur.desktop;

  const navMobile = (id) => setScreen(id);
  const navDesktop = (id) => setScreen(id);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0d0d0d', color:'var(--paper-white)' }}>
      <TopChrome screen={screen} setScreen={setScreen} view={view} setView={setView}/>

      <div style={{ flex:1, padding:'24px 24px 64px', display:'flex', justifyContent:'center', gap: 32, flexWrap:'wrap' }}>
        {(view === 'mobile' || view === 'both') && (
          <div data-screen-label={`Mobile · ${cur.label}`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
            <Caption text={`MOBILE · ${cur.label.toUpperCase()}`}/>
            <IOSDevice width={390} height={844} dark={false}>
              <Mobile onNav={navMobile} onDone={() => navMobile(nextScreen(screen))} onDoneFlow={() => navMobile('home')}/>
            </IOSDevice>
          </div>
        )}
        {(view === 'desktop' || view === 'both') && (
          <div data-screen-label={`Desktop · ${cur.label}`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, flex: view === 'desktop' ? 1 : 'unset', maxWidth: '100%' }}>
            <Caption text={`DESKTOP · ${cur.label.toUpperCase()}`}/>
            <BrowserChrome>
              <Desktop onNav={navDesktop} onDone={() => navDesktop(nextScreen(screen))}/>
            </BrowserChrome>
          </div>
        )}
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks · Bolão da Suprema">
        <TweakSection label="Visualização"/>
        <TweakRadio label="Viewport" value={t.viewport} options={['mobile','both','desktop']} onChange={(v)=>{ setTweak('viewport', v); setView(v); }}/>
        <TweakSection label="Tela"/>
        <TweakSelect label="Screen" value={t.screen} options={SCREENS.map(s=>({ value:s.id, label:s.label }))} onChange={(v)=>{ setTweak('screen', v); setScreen(v); }}/>
        <TweakSection label="Tema"/>
        <TweakRadio label="Acento" value={t.accent} options={['vivid','gold','desert']} onChange={(v)=>setTweak('accent', v)}/>
        <TweakRadio label="Papel" value={t.paperTone} options={['warm','cool','cream']} onChange={(v)=>setTweak('paperTone', v)}/>
      </TweaksPanel>
    </div>
  );
}

function nextScreen(curId){
  const order = ['onboarding','login','profile','home','bracket','prediction','ranking','resenha','admin'];
  const i = order.indexOf(curId);
  return order[Math.min(i+1, order.length-1)];
}

function TopChrome({ screen, setScreen, view, setView }){
  return (
    <div style={{
      position:'sticky', top:0, zIndex:50,
      background:'#0d0d0d', borderBottom:'1px solid #1f1f1f',
      padding:'12px 24px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap',
      color:'#fafafa'
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <Logo height={28}/>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.18em', opacity:.6 }}>
          PROTÓTIPO · MUNDIAL '26
        </span>
      </div>
      <div style={{ flex:1 }}/>
      <div style={{ display:'flex', gap:4, alignItems:'center', overflow:'auto' }} className="no-scrollbar">
        {SCREENS.map(s => (
          <button key={s.id} onClick={()=>setScreen(s.id)} style={{
            padding:'8px 12px', borderRadius:999,
            background: screen === s.id ? 'var(--yellow)' : 'transparent',
            color: screen === s.id ? '#0d0d0d' : '#a9a89f',
            fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.10em', textTransform:'uppercase', fontWeight: screen === s.id ? 700 : 500,
            whiteSpace:'nowrap'
          }}>{s.label}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:0, padding:3, background:'#1c1c1c', borderRadius:999 }}>
        {['mobile','both','desktop'].map(v => (
          <button key={v} onClick={()=>setView(v)} style={{
            padding:'6px 12px', borderRadius:999, fontSize:11, letterSpacing:'.12em', fontWeight:600, textTransform:'uppercase',
            fontFamily:'var(--mono)',
            background: view === v ? 'var(--paper-white)' : 'transparent',
            color: view === v ? '#0d0d0d' : '#a9a89f'
          }}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function Caption({ text }){
  return (
    <div style={{
      fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.18em',
      color:'#a9a89f', textTransform:'uppercase'
    }}>{text}</div>
  );
}

/* Browser-style frame for desktop screens */
function BrowserChrome({ children }){
  return (
    <div style={{
      width: 1280, maxWidth: '100%',
      borderRadius: 12, overflow:'hidden',
      border:'1px solid #2a2a2a', background:'#0d0d0d',
      boxShadow:'0 30px 60px rgba(0,0,0,.6)'
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'10px 14px', background:'#161616', borderBottom:'1px solid #2a2a2a'
      }}>
        <span style={{ width:12, height:12, borderRadius:'50%', background:'#ff5f56' }}/>
        <span style={{ width:12, height:12, borderRadius:'50%', background:'#ffbd2e' }}/>
        <span style={{ width:12, height:12, borderRadius:'50%', background:'#27c93f' }}/>
        <div style={{ flex:1, marginLeft:14, padding:'4px 12px', background:'#0d0d0d', borderRadius:6, color:'#a9a89f', fontFamily:'var(--mono)', fontSize:11 }}>
          bolao.suprema.gg
        </div>
      </div>
      <div style={{ height: 820, overflow:'auto', background:'var(--paper)' }}>
        {children}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
