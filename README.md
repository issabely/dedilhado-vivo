# Dedilhado Vivo

App web para aprender **flauta transversal**, **violino** e **piano** vendo onde cada dedo aperta, junto com a partitura, a cifra, o som e a correção pelo microfone.

## O que tem aqui

| Pasta / arquivo | O que é |
| --- | --- |
| `web/` | **O projeto principal.** Site completo, pronto para publicar e instalar no celular (PWA, funciona offline). |
| `web/index.html` | Estrutura das telas |
| `web/css/style.css` | Visual (cores, temas claro e escuro, layout) |
| `web/js/app.js` | Toda a lógica do app |
| `web/sw.js` | Service worker: guarda o app no aparelho para funcionar sem internet |
| `web/manifest.webmanifest` e `web/icons/` | Nome, cores e ícones do app instalado |
| `web/three.min.js` | Biblioteca three.js r128, usada na flauta em 3D |
| `web/PUBLICAR.md` | Passo a passo para colocar na internet, instalar no celular e mandar para a Play Store |
| `arquivo-unico/dedilhado-vivo.html` | O app inteiro em um só arquivo. É só dar dois cliques para abrir no navegador. |
| `Abrir Dedilhado Vivo.bat` e `servidor.ps1` | Atalho que roda o app no navegador com dois cliques |
| `exemplos/` | Partituras de teste para o botão "Importar partitura" (.musicxml e .mxl) |

## Como rodar

**Com dois cliques:** dê dois cliques em `Abrir Dedilhado Vivo.bat`. Ele liga um servidor local (usa o PowerShell do Windows, sem instalar nada) e abre o app no navegador em `http://localhost:8080`. Deixe a janela preta aberta enquanto usa e feche-a para parar.

**Só o arquivo:** abra `arquivo-unico/dedilhado-vivo.html` no Chrome ou no Edge. O microfone funciona ali.

**Projeto `web/` no computador:** o service worker só funciona servido por um endereço, não abrindo o arquivo direto. Escolha um:

- **VS Code:** instale a extensão Live Server, abra a pasta `web` e clique em "Go Live".
- **Node:** no terminal, dentro de `web`, rode `npx serve .`
- **Python:** no terminal, dentro de `web`, rode `python -m http.server 8000` e abra `http://localhost:8000`

**Publicar na internet, instalar no celular e Play Store:** veja `web/PUBLICAR.md`.

## O que o app faz

- **Lições:** são duas trilhas, uma para cada instrumento. Cada uma começa com uma lição sobre o básico: o sopro na flauta, a postura e o arco no violino. Cada exercício dá estrelas e o app conta os dias seguidos de prática.
- **Sopro e técnica (flauta):** uma trilha separada, com os exercícios medidos pelo microfone:
  - aquecimento diário;
  - respiração guiada e teste do “sss”;
  - notas longas cronometradas;
  - staccato, legato e língua dupla;
  - forte e fraco sem desafinar;
  - harmônicos.
- **Praticar:**
  - partitura com o nome da nota e a cifra;
  - som, metrônomo e andamento ajustável;
  - modo passo a passo;
  - modo microfone, que só avança quando a nota sai certa.
- **Flauta:**
  - desenho de cima e de trás com todas as chaves, ou modelo 3D;
  - chaves de ação dupla mostradas juntas;
  - mãos com o dedo de cada chave.
- **Piano (Dó 3 a Dó 6):**
  - teclado desenhado com a tecla e o número do dedo de cada nota, e o dedilhado calculado automaticamente (com passagem do polegar);
  - clave de Fá para a mão esquerda;
  - dá para tocar nas teclas da tela ou ligar um teclado USB (MIDI), e as duas formas contam como acerto na lição;
  - trilha própria: postura, posição de Dó, mão esquerda, escala, teclas pretas e repertório.
- **Violino (1ª posição):** braço com as fitas, o dedo e a corda de cada nota, além da direção e da parte do arco a usar.
- **Teoria:** dez capítulos com explicação, exemplos para ouvir e teclado interativo:
  - o som e as notas;
  - nomes das notas e cifra;
  - por que se chama oitava;
  - tons e semitons;
  - sustenido, bemol e bequadro;
  - escala maior e menor;
  - pauta e claves;
  - figuras (semibreve, mínima, semínima…);
  - compasso e andamento;
  - acordes e cifras.

  Cada capítulo tem um teste rápido, e há dois jogos: leitura de notas e grave ou agudo.
- **Dedilhados:** tabela com todas as notas de cada instrumento.
- **Afinador:**
  - ponteiro em cents e linha do tempo de estabilidade;
  - cordas do violino e notas de afinação da flauta;
  - Lá de referência ajustável.
- **Escrever música:** editor nota por nota, e importação de MusicXML (o formato que o MuseScore exporta).

## Onde mexer no código (`web/js/app.js`)

O arquivo é dividido em blocos com comentários `/* ---------- Nome ---------- */`. Os principais:

| Bloco | O que fica nele |
| --- | --- |
| `Dedilhados (flauta Boehm…)` | Tabela de dedilhados da flauta (`BASE`) |
| `Músicas prontas` | Biblioteca (`BUILTIN`), no formato `G4:1 A4:0.5 R:1` (nota:tempos, R = pausa) |
| `Violino` | Dedilhados, desenho, arco e lições do violino (`VIOLIN_LESSONS`) |
| `Piano` | Teclado, dedilhado automático (`pianoFingering`), teclado MIDI e lições do piano (`PIANO_LESSONS`) |
| `Lições` | Lições da flauta (`FLUTE_LESSONS`) |
| `Guias iniciais` | Textos e desenhos das lições do sopro e da postura |
| `Afinador` | Afinador e instruções de afinação |
| `Teoria musical` | Capítulos (`THEORY`), testes e jogos (`gameRead`, `gameEar`) |
| `Treinos de sopro e técnica` | Exercícios medidos pelo microfone (`runBreath`, `runHold`, `runDyn`, `runStacc`) e as lições da trilha `TECH_LESSONS` |
| `Escuta pelo microfone` | Detecção de nota (algoritmo YIN) e correção nas lições |
| `Flauta em 3D` | Modelo 3D (three.js) |

Depois de mudar algo, troque o número em `dedilhado-vivo-v10` dentro de `sw.js` (por exemplo, para `v11`). Assim quem já instalou recebe a versão nova.

## Links

- Página publicada no Claude: https://claude.ai/artifact/27mmHu4Py7fGdBak5sYqhj (dentro do Claude o microfone fica bloqueado)
- Documento de planejamento: https://claude.ai/code/artifact/87f6d6b1-8239-45ce-b427-5e0a3481d396

## Observações

- O progresso das lições fica salvo no navegador de cada aparelho (localStorage).
- As melodias da biblioteca são de domínio público e foram escritas de memória. Vale conferir tocando.
- Os dedilhados da flauta seguem o The Woodwind Fingering Guide (wfg.woodwind.org).

## Versão app (celular)

- `app-expo/`: app com Expo. Teste no Expo Go e gere APK ou AAB pelo EAS. Veja `app-expo/LEIA-ME.md`.
- `app-android/`: projeto Android com Capacitor, para abrir no Android Studio e gerar o APK. Veja `app-android/LEIA-ME.md`.

## Conta e login com Google

- `CONTA.md`: passo a passo para ligar o login com Google e salvar o progresso na nuvem (Supabase).
- `web/config.js`: onde ficam o endereço e a chave pública do Supabase.
- `supabase/schema.sql`: tabelas e regras de segurança, para colar no SQL Editor do Supabase.
