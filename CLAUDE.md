# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do projeto

**Antes de qualquer tarefa, verifique** [`.claude/rules/project-context.md`](.claude/rules/project-context.md):

- Se contiver `<!-- status: template -->` ou placeholders como `<NOME>` → o projeto **não foi inicializado**. Instrua o usuário a rodar `/setup` primeiro.
- Se contiver `<!-- status: active -->` → o projeto está configurado. Use as informações de stack e domínio de lá como fonte de verdade.

## Inicialização (primeira vez)

```
/setup
```

Wizard interativo que:
1. Coleta nome, domínio, stack e convenções do projeto
2. Preenche `.claude/rules/project-context.md` automaticamente
3. Bootstrapa os domínios iniciais da KB via `/train-kb`
4. Sincroniza o CLAUDE.md com o contexto do projeto

Após o `/setup`, o scaffold está pronto para trabalhar.

## O que é este repositório

Scaffold pessoal para desenvolvimento assistido por IA, baseado em **SDD** (Spec-Driven Development). O contrato completo para agentes está em [`.claude/AGENTS.md`](.claude/AGENTS.md).

Diretórios `src/`, `tests/`, `design/`, `notes/` estão vazios no bootstrap — conteúdo gerado vive em `.claude/sdd/`, `.claude/dev/` e `.claude/kb/`.

## Slash commands disponíveis

| Comando | Propósito |
|---------|-----------|
| `/setup` | **Inicialização** — wizard completo de configuração do projeto |
| `/audit-agents` | Analisa cobertura de agentes e gera customizados para lacunas do projeto |
| `/train-kb` | Bootstrap de novo domínio na KB |
| `/brainstorm` | Fase 0 SDD — exploração de ideia |
| `/define` | Fase 1 SDD — captura de requisitos |
| `/design` | Fase 2 SDD — arquitetura e spec técnica |
| `/build` | Fase 3 SDD — implementação |
| `/ship` | Fase 4 SDD — arquivamento e lições |
| `/iterate` | Atualizar requisitos no meio de uma feature |
| `/dev` | Dev Loop — tarefa pequena sem SDD completo |
| `/review` | Revisão de PR ou diff |
| `/create-kb` | Criar entrada individual na KB |
| `/sync-context` | Ressincronizar CLAUDE.md com estado atual do projeto |

Todos os comandos ficam em `.claude/commands/`.

## Workflow SDD (features maiores)

Cinco fases sequenciais — **nunca pule fases** sem autorização explícita.

| Fase | Subagent | Artefato gerado |
|------|----------|-----------------|
| 0. Brainstorm | `brainstorm-agent` | `.claude/sdd/features/BRAINSTORM_<FEATURE>.md` |
| 1. Define | `define-agent` | `.claude/sdd/features/DEFINE_<FEATURE>.md` |
| 2. Design | `design-agent` | `.claude/sdd/features/DESIGN_<FEATURE>.md` |
| 3. Build | `build-agent` | código + `.claude/sdd/reports/BUILD_REPORT_<FEATURE>.md` |
| 4. Ship | `ship-agent` | `.claude/sdd/archive/<FEATURE>/SHIPPED_<DATE>.md` |

Templates em `.claude/sdd/templates/`. Passe sempre o artefato da fase anterior como contexto.

## Dev Loop (tarefas pequenas)

Para utilitários, protótipos ou arquivos únicos, use o Dev Loop:

1. `prompt-crafter` → gera `.claude/dev/tasks/PROMPT_<NOME>.md`
2. `dev-loop-executor` → executa e registra progresso em `.claude/dev/progress/`

## Roteamento de subagents

Invoke subagents via ferramenta `Agent` com `subagent_type` igual ao `name` no frontmatter do agente. Tarefas independentes rodam em paralelo.

| Categoria | Diretório | Agentes principais |
|-----------|-----------|-------------------|
| Workflow SDD | `workflow/` | `brainstorm-agent`, `define-agent`, `design-agent`, `build-agent`, `ship-agent`, `iterate-agent` |
| Setores técnicos | `setores/` | `setor-frontend`, `setor-backend`, `setor-dados`, `setor-devops`, `setor-ia`, `setor-seguranca`, `setor-qa` |
| Testes | `testes/` | `qa-automation`, `integration-tester`, `regression-tester`, `performance-tester`, `test-generator` |
| Qualidade | `qualidade/` | `code-reviewer`, `dual-reviewer`, `code-cleaner`, `code-documenter`, `python-developer`, `auditor-qualidade`, `acessibilidade-reviewer`, `security-auditor`, `performance-auditor` |
| Conteúdo | `conteudo/` | `redator-tecnico`, `copywriter`, `doc-generator`, `changelog-writer`, `tutorial-writer` |
| Planejamento | `planejamento/` | `orquestrador-mestre`, `planejador-estrategico`, `cronograma-tatico` |
| KB | `kb/` | `orquestrador-de-kb`, `curador-kb`, `taxonomista-kb` |
| Exploração | `exploration/` | `codebase-explorer`, `kb-architect` |
| Comunicação | `communication/` | `adaptive-explainer`, `meeting-analyst`, `the-planner` |
| Dev Loop | `dev/` | `prompt-crafter`, `dev-loop-executor` |
| IA/ML | `ai-ml/` | `ai-prompt-specialist`, `genai-architect`, `llm-specialist`, `ai-data-engineer` |

Quando o usuário escrever `@nome-do-agente`, invoque esse subagent com o restante da mensagem como tarefa.

## KB em 4 camadas

Todo arquivo em `.claude/kb/` pertence a **exatamente uma** camada:

| Camada | Pergunta | Exemplos de conteúdo |
|--------|----------|----------------------|
| `business/` | Qual é a regra de negócio? | KPIs, glossário, políticas |
| `tools/` | Como funciona esta tecnologia? | Docs agnósticas de fornecedor |
| `implementation/` | O que nós construímos? | URLs internas, schemas, IDs concretos |
| `operations/` | Como rodo ou recupero? | Runbooks, playbooks de incidente |

Caminho canônico: `.claude/kb/<camada>/<domínio>/<tipo>/<arquivo>.md`. Templates em `.claude/kb/_templates/`. Taxonomia em `.claude/kb/_taxonomy.yaml`.

Frontmatter obrigatório em cada arquivo da KB:

```yaml
---
id: <kebab-case>
layer: business | tools | implementation | operations
domain: <nome-da-pasta>
content_type: concept | pattern | reference | spec | runbook | index | quick-reference
status: active | scaffolded | wip | deprecated | archived
---
```

## Regras de contexto

As regras em `.claude/rules/` documentam contratos do sistema:

- [`workflow-sdd.md`](.claude/rules/workflow-sdd.md) — fases SDD, quando invocar cada agente
- [`agent-routing.md`](.claude/rules/agent-routing.md) — mapa completo de subagents por gatilho
- [`project-context.md`](.claude/rules/project-context.md) — stack, equipa, convenções (**preencher via `/setup`**)
- [`kb-taxonomy.md`](.claude/rules/kb-taxonomy.md) — disciplina das 4 camadas da KB

## Telemetria

Cada fase do workflow emite um registro conforme `.claude/telemetry/SESSION_SCHEMA.yaml`. Não fabrique entradas — deixe os subagents escreverem.

## MCPs

Integrações MCP são **opcionais**. Se não estiverem configuradas, trabalhe com KB local e código do repositório.
