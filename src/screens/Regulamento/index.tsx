import { BRAZIL_TIME_LABEL, formatMatchDateTime } from '@/lib/matchTime'
import { WC2026_MATCHES } from '@/data/wc2026'

const GROUP_RULES = [
  { pts: 10, label: 'Placar exato',                    detail: 'ex: colocou 2×1 e foi 2×1' },
  { pts: 7,  label: 'Resultado + gols do vencedor',    detail: 'ex: colocou 3×0 e foi 3×1' },
  { pts: 5,  label: 'Resultado correto (V/E/D)',        detail: 'ex: colocou 2×1 e foi 1×0' },
  { pts: 1,  label: 'Gols de uma equipe acertados',    detail: 'ex: colocou 1×1 e foi 2×1' },
]

const KO_RULES = [
  { pts: 12, label: 'Placar exato (tempo regulamentar)',            detail: 'apenas 90 min' },
  { pts: 8,  label: 'Resultado + gols de um time',                  detail: 'no tempo regulamentar' },
  { pts: 5,  label: 'Resultado correto',                            detail: 'vencedor no regulamentar' },
  { pts: 2,  label: 'Classificado acertado',                        detail: 'incluindo prorrogação e pênaltis' },
]

const GENERAL_RULES = [
  { pts: 25, label: 'Campeão',     detail: 'seleção campeã' },
  { pts: 15, label: 'Vice-campeão', detail: 'seleção vice-campeã' },
  { pts: 10, label: 'Artilheiro',  detail: 'também é critério de desempate' },
]

const TIEBREAKERS = [
  'Maior número de acertos de placar exato',
  'Acerto do artilheiro (quem acertou leva; se nenhum, vai quem escolheu o jogador com mais gols)',
  'Maior pontuação na fase eliminatória',
  'Acerto do placar da final',
  'Ordem de envio das apostas (quem apostou primeiro)',
]

export function RegulamentoScreen() {
  const firstMatch = formatMatchDateTime(WC2026_MATCHES[0])

  return (
    <div className="min-h-dvh bg-paper px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-4xl mx-auto space-y-5">

        <header className="border-2 border-ink p-5 bg-ink text-paper">
          <p className="font-mono text-[10px] tracking-eyebrow text-yellow">REGULAMENTO OFICIAL</p>
          <h1 className="font-display text-5xl md:text-7xl leading-none mt-1">BOLÃO SUPREMA</h1>
          <p className="font-serif-it text-xl text-paper/70 mt-2">Copa do Mundo FIFA 2026</p>
        </header>

        {/* Objetivo + Participação */}
        <section className="grid md:grid-cols-2 gap-4">
          <Info title="Objetivo" items={[
            'Bolão cumulativo: cada participante acumula pontos ao longo de toda a competição.',
            'Vence quem tiver a maior pontuação total ao final do torneio.',
            'Participação voluntária e gratuita — todos os prêmios são cortesias da Suprema Gaming.',
          ]} />
          <Info title="Participação" items={[
            'Aberto a todos os colaboradores da empresa.',
            'Cada participante pode realizar apenas um cadastro.',
            'Ao participar, o usuário concorda integralmente com este regulamento.',
            'Participantes bloqueados ou removidos não podem palpitar.',
          ]} />
        </section>

        {/* Tipos de apostas */}
        <section className="grid md:grid-cols-2 gap-4">
          <Info title="Apostas por partida" items={[
            'Para cada jogo, informe o placar exato (ex: 2×1).',
            `Todas as datas e horas usam ${BRAZIL_TIME_LABEL}.`,
            `Primeiro jogo: ${firstMatch}.`,
            'Cada palpite fecha automaticamente no kickoff da partida.',
            'Não é permitido editar apostas após o início das partidas.',
          ]} />
          <Info title="Apostas gerais" items={[
            'Devem ser realizadas antes do início da primeira partida do torneio.',
            'Campeão: seleção campeã do mundo (+25 pts).',
            'Vice-campeão: seleção vice-campeã (+15 pts).',
            'Artilheiro: nome do jogador (+10 pts e critério de desempate).',
            'Campeão e vice não podem ser do mesmo grupo.',
          ]} />
        </section>

        {/* Pontuação */}
        <section className="border-2 border-ink">
          <div className="px-4 py-3 border-b border-hairline bg-ink text-paper">
            <h2 className="font-display text-2xl">SISTEMA DE PONTUAÇÃO</h2>
          </div>

          <div className="divide-y divide-hairline">
            <RulesBlock title="FASE DE GRUPOS" rules={GROUP_RULES} />
            <RulesBlock title="MATA-MATA (fase eliminatória)" rules={KO_RULES} />
            <RulesBlock title="APOSTAS GERAIS" rules={GENERAL_RULES} />
          </div>
        </section>

        {/* Regras especiais */}
        <section className="grid md:grid-cols-2 gap-4">
          <Info title="Prorrogação e pênaltis" items={[
            'O placar considerado para fins de aposta é o do tempo regulamentar (90 min).',
            'Para definição de vencedor no mata-mata, vale apenas o tempo regulamentar.',
            'O bônus de +2 pts (classificado acertado) considera o resultado final, incluindo prorrogação e pênaltis.',
          ]} />
          <Info title="Cancelamento / alteração" items={[
            'Em caso de cancelamento ou alteração relevante de uma partida, a organização poderá anular a rodada ou considerar o resultado oficial da competição.',
            'Qualquer tentativa de fraude ou manipulação resultará em desclassificação.',
            'Admin pode bloquear/desbloquear mercados por necessidade operacional.',
          ]} />
        </section>

        {/* Desempate */}
        <section className="border-2 border-ink">
          <div className="px-4 py-3 border-b border-hairline bg-ink text-paper">
            <h2 className="font-display text-2xl">CRITÉRIOS DE DESEMPATE</h2>
            <p className="font-mono text-[10px] text-paper/50 mt-0.5">aplicados nesta ordem</p>
          </div>
          <ol className="divide-y divide-hairline">
            {TIEBREAKERS.map((t, i) => (
              <li key={i} className="px-4 py-3 flex items-start gap-3">
                <span className="font-display text-2xl text-ink-4 flex-shrink-0 w-7">{i + 1}</span>
                <span className="font-mono text-[11px] text-ink-2 leading-relaxed pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Ranking + Premiação */}
        <section className="grid md:grid-cols-2 gap-4">
          <Info title="Ranking" items={[
            'Atualizado após cada rodada com os resultados registrados pelo admin.',
            'Classificação geral disponível a todos os participantes.',
          ]} />
          <Info title="Premiação" items={[
            'Definida previamente e comunicada antes do início do torneio.',
            'A participação é 100% gratuita — prêmios são cortesias da Suprema Gaming.',
          ]} />
        </section>

        <section className="border-2 border-ink p-5 space-y-2">
          <h2 className="font-display text-2xl">DISPOSIÇÕES FINAIS</h2>
          <p className="font-mono text-[11px] text-ink-3 leading-relaxed">
            A organização se reserva o direito de resolver casos omissos. O regulamento pode ser complementado
            antes do início do torneio. Após o início da competição, nenhuma regra poderá ser alterada.
          </p>
          <p className="font-mono text-[10px] text-ink-4 leading-relaxed">
            v1 · Regulamento inicial. Alterações comunicadas via Boletim.
          </p>
        </section>

      </div>
    </div>
  )
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="border-2 border-ink p-4">
      <h2 className="font-display text-2xl mb-3">{title}</h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="font-mono text-[11px] leading-relaxed text-ink-2">— {item}</li>
        ))}
      </ul>
    </section>
  )
}

function RulesBlock({ title, rules }: { title: string; rules: { pts: number; label: string; detail: string }[] }) {
  return (
    <div className="px-4 py-4">
      <p className="font-mono text-[9px] tracking-eyebrow text-ink-4 mb-3">{title}</p>
      <div className="space-y-2">
        {rules.map(r => (
          <div key={r.label} className="flex items-start gap-3">
            <span className="font-display text-2xl text-green w-8 flex-shrink-0">{r.pts}</span>
            <div>
              <div className="font-mono text-[11px] font-bold">{r.label}</div>
              <div className="font-mono text-[9px] text-ink-4">{r.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
