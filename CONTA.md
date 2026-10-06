# Login com Google e progresso na nuvem

O app já tem o botão **Entrar** no canto de cima. Para ele funcionar, você precisa criar duas contas grátis: o **Supabase**, onde ficam os dados, e um projeto no **Google Cloud**, que libera o "Entrar com Google". Faça uma vez só; leva uns 20 minutos.

Enquanto isso não estiver pronto, o app funciona normalmente, sem conta, e o progresso fica salvo no aparelho.

## 1. Criar o projeto no Supabase

1. Entre em **supabase.com**, crie a conta e clique em **New project**.
2. Dê um nome (por exemplo, `dedilhado-vivo`), crie uma senha do banco, guarde-a bem e escolha a região **São Paulo**.
3. Quando o projeto abrir, vá em **SQL Editor → New query**. Cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas e as regras de segurança.
4. Vá em **Project Settings → API**, ou em **Connect**, e copie:
   - a **Project URL** (algo como `https://abcd1234.supabase.co`);
   - a chave pública: a **anon** ou a **publishable**. Nunca use a `service_role` / `secret` no app.

## 2. Criar o "Entrar com Google" no Google Cloud

1. Entre em **console.cloud.google.com** e crie um projeto novo (por exemplo, `Dedilhado Vivo`).
2. Abra **APIs e serviços → Tela de permissão OAuth** (pode aparecer como **Google Auth Platform**):
   - Tipo de usuário: **Externo**.
   - Nome do app: `Dedilhado Vivo`, seu e-mail de suporte e o e-mail de contato.
   - Nos escopos, ficam só os básicos: e-mail, perfil e openid.
3. Abra **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**.
   - Em **Origens JavaScript autorizadas**, coloque `http://localhost:8080` e, quando tiver, o endereço do site publicado.
   - Em **URIs de redirecionamento autorizados**, coloque o endereço que o Supabase mostra no passo 3 abaixo. Ele tem este formato: `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
4. Copie o **ID do cliente** e a **Chave secreta do cliente**.

Enquanto o app estiver "em teste" no Google, só os e-mails que você colocar em **Usuários de teste** conseguem entrar. Para liberar para todo mundo, clique em **Publicar app** nessa mesma tela.

## 3. Ligar o Google dentro do Supabase

1. No Supabase, vá em **Authentication → Sign In / Providers → Google**.
2. Ative, cole o **Client ID** e o **Client Secret** do Google e salve. O endereço de callback que o Google pede aparece nessa tela.
3. Vá em **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:8080` por enquanto. Depois, troque pelo site publicado.
   - **Redirect URLs:** adicione `http://localhost:8080/**`, `http://localhost:8081/**` e `http://localhost:8082/**`. O "Abrir Dedilhado Vivo.bat" usa uma dessas portas. Quando publicar o site, adicione o endereço dele também, por exemplo `https://dedilhadovivo.com.br/**`.

## 4. Colocar os dados no app

Abra `web/config.js` e preencha:

```js
window.DV_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabaseKey: "SUA-CHAVE-ANON-OU-PUBLISHABLE"
};
```

Salve, abra pelo **Abrir Dedilhado Vivo.bat** e clique em **Entrar → Entrar com Google**.

O login não funciona abrindo o arquivo único com dois cliques, porque o Google precisa voltar para um endereço `http://`. Use o `.bat` ou o site publicado.

## Como funciona

- **Sem conta:** tudo continua igual e o progresso fica no aparelho.
- **Ao entrar:**
  - o progresso do aparelho e o da nuvem são juntados: fica a maior nota de cada exercício, todos os dias praticados e todas as músicas;
  - as preferências (instrumento, tema e afinação) vêm da conta.
- **Depois de entrar:** cada estrela, lição, música ou ajuste é enviado sozinho para a nuvem em cerca de 1 segundo. Sem internet, ele fica guardado e vai quando a conexão voltar.
- **No perfil (botão com sua foto):**
  - nome, instrumentos e nível;
  - um resumo do progresso;
  - os botões **Sair** e **Apagar meus dados da nuvem**.

## O que fica guardado (para a política de privacidade)

| Dado | De onde vem |
| --- | --- |
| Nome, e-mail e foto | Conta Google |
| Instrumentos e nível | Perfil preenchido pela pessoa |
| Estrelas, dias praticados, teoria, músicas, tema, instrumento e afinação | Uso do app |

As tabelas `perfis` e `progresso` têm regras (RLS) que deixam cada pessoa ver e mudar só os próprios dados.

## Ainda falta (próximas etapas)

- **Login no app de celular:** dentro do app, o Google não deixa entrar por uma tela embutida. Vamos usar o navegador do sistema e voltar para o app.
- **Apagar a conta inteira:** o botão de hoje apaga os dados da nuvem. Apagar também o cadastro de login precisa de uma função no servidor (Edge Function).
- **Política de privacidade e termos de uso:** obrigatórios antes de abrir para o público.
