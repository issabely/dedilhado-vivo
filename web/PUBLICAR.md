# Dedilhado Vivo: versão instalável

Esta pasta é o app completo, pronto para colocar na internet e instalar no celular como um aplicativo. Depois de instalado, ele abre em tela cheia, com ícone próprio, e funciona sem internet.

## O que tem na pasta

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O app inteiro (flauta, violino, lições, microfone, editor) |
| `manifest.webmanifest` | Nome, ícone e cores do app instalado |
| `sw.js` | Guarda o app no aparelho para funcionar offline |
| `three.min.js` | Biblioteca da flauta em 3D (vem junto para funcionar offline) |
| `icons/` | Ícones do app |

## 1. Colocar na internet (grátis)

O app precisa de um endereço com **https**. Sem isso o celular não deixa instalar e não libera o microfone.

**Opção mais fácil (Netlify Drop):**
1. Abra app.netlify.com/drop no computador.
2. Arraste esta pasta inteira para a página.
3. Pronto: ele dá um endereço do tipo `https://nome-aleatorio.netlify.app`. Criando uma conta grátis dá para trocar o nome.

**Opção GitHub Pages:** crie um repositório, envie os arquivos desta pasta e ative o Pages em Settings → Pages.

## 2. Instalar no celular

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e em **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o endereço, toque em Compartilhar e em **Adicionar à Tela de Início**.

Na primeira vez que usar o microfone, o celular pergunta se pode liberar. Toque em **Permitir**.

## 3. Publicar na Play Store

Com o app já na internet (passo 1), não precisa reescrever nada:

1. Abra **pwabuilder.com**, cole o endereço do app e clique em Start.
2. Escolha **Android** e baixe o pacote. Ele gera o arquivo `.aab` para a loja e um arquivo `assetlinks.json`.
3. Coloque o `assetlinks.json` dentro de uma pasta `.well-known` no seu site (o PWABuilder explica o passo). É isso que faz o app abrir sem a barra do navegador.
4. No **Google Play Console**, crie o app e envie o `.aab`.

O Play Console cobra uma taxa única para criar a conta de desenvolvedor. Contas pessoais novas também passam por um período de teste fechado, com testadores, antes de liberar a publicação. Confira as regras atuais no próprio Play Console.

## 4. Quando atualizar o app

Depois de trocar o `index.html`, abra o `sw.js` e mude o número em `dedilhado-vivo-v1` (por exemplo, para `v2`). Assim os celulares baixam a versão nova em vez de continuar com a guardada.

## Observações

- O progresso das lições fica salvo no próprio aparelho. Se você trocar de celular, ele começa do zero.
- As fontes do visual vêm do Google Fonts. Sem internet na primeira abertura, o app usa as fontes do sistema e funciona normalmente.
