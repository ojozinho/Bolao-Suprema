import type { Team } from '@/types'
import { asset } from '@/lib/utils'

const flag = (name: string) => asset(`assets/flags/${name}.png`)

export const TEAMS: Record<string, Team> = {
  BRA: { code: 'BRA', name: 'Brasil', flag: flag('brazil'), color: '#FFCB05', group: 'E' },
  ARG: { code: 'ARG', name: 'Argentina', flag: flag('argentina'), color: '#74ACDF', group: 'D' },
  FRA: { code: 'FRA', name: 'França', flag: flag('france'), color: '#002395', group: 'B' },
  GER: { code: 'GER', name: 'Alemanha', flag: flag('germany'), color: '#000000', group: 'A' },
  ESP: { code: 'ESP', name: 'Espanha', flag: flag('spain'), color: '#AA151B', group: 'C' },
  POR: { code: 'POR', name: 'Portugal', flag: flag('portugal'), color: '#006600', group: 'F' },
  ENG: { code: 'ENG', name: 'Inglaterra', flag: flag('england'), color: '#CF091D', group: 'G' },
  NED: { code: 'NED', name: 'Holanda', flag: flag('netherlands'), color: '#FF6600', group: 'H' },
  BEL: { code: 'BEL', name: 'Bélgica', flag: flag('belgium'), color: '#EF3340', group: 'B' },
  CRO: { code: 'CRO', name: 'Croácia', flag: flag('croatia'), color: '#FF0000', group: 'A' },
  URU: { code: 'URU', name: 'Uruguai', flag: flag('uruguay'), color: '#5BB0D8', group: 'G' },
  MEX: { code: 'MEX', name: 'México', flag: flag('mexico'), color: '#006847', group: 'C' },
  MAR: { code: 'MAR', name: 'Marrocos', flag: flag('morocco'), color: '#C1272D', group: 'F' },
  JPN: { code: 'JPN', name: 'Japão', flag: flag('japan'), color: '#BC002D', group: 'D' },
  KOR: { code: 'KOR', name: 'Coreia do Sul', flag: flag('south-korea'), color: '#003478', group: 'H' },
  SEN: { code: 'SEN', name: 'Senegal', flag: flag('senegal'), color: '#00853F', group: 'E' },
  COL: { code: 'COL', name: 'Colômbia', flag: flag('colombia'), color: '#FCD116', group: 'C' },
  USA: { code: 'USA', name: 'Estados Unidos', flag: flag('united-states'), color: '#B22234', group: 'B' },
  CAN: { code: 'CAN', name: 'Canadá', flag: flag('canada'), color: '#FF0000', group: 'A' },
  SUI: { code: 'SUI', name: 'Suíça', flag: flag('switzerland'), color: '#FF0000', group: 'D' },
  ECU: { code: 'ECU', name: 'Equador', flag: flag('ecuador'), color: '#FFD700', group: 'G' },
  KSA: { code: 'KSA', name: 'Arábia Saudita', flag: flag('saudi-arabia'), color: '#006C35', group: 'H' },
  AUS: { code: 'AUS', name: 'Austrália', flag: flag('australia'), color: '#00843D', group: 'F' },
  NOR: { code: 'NOR', name: 'Noruega', flag: flag('norway'), color: '#EF2B2D', group: 'E' },
  PAR: { code: 'PAR', name: 'Paraguai', flag: flag('paraguay'), color: '#D52B1E', group: 'C' },
  SCO: { code: 'SCO', name: 'Escócia', flag: flag('scotland'), color: '#003078', group: 'B' },
}
