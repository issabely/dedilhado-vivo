# Dedilhado Vivo: app com Expo

O app é o mesmo Dedilhado Vivo do site, rodando dentro de uma tela (WebView) e totalmente offline. O app inteiro está em `web/app.html` e já traz a flauta 3D.

## Testar no celular com o Expo Go

1. Abra o terminal nesta pasta e rode `npm install` (só na primeira vez).
2. Rode `npx expo start`.
3. No celular, abra o **Expo Go** e leia o QR code.
4. Quando o app pedir o microfone, toque em **Permitir**.

O Expo Go precisa ser da mesma versão do Expo do projeto (SDK 57). Se der erro de versão, atualize o Expo Go na loja.

## Gerar o APK ou o arquivo da Play Store (EAS)

1. Rode `npm install -g eas-cli` e depois `eas login`.
2. Na primeira vez, rode `eas build:configure`. Ele liga o projeto à sua conta Expo.
3. Escolha o que gerar:
   - **APK para instalar direto no celular:** `eas build -p android --profile preview`
   - **AAB para a Play Store:** `eas build -p android --profile production`
4. Depois, `eas submit -p android` envia para o Play Console.

O build acontece nos servidores da Expo. Ao terminar, aparece um link para baixar o arquivo.

## Quando mudar o app

1. Gere o arquivo único novo e coloque no lugar de `web/app.html`.
2. Rode `npm run gerar-html`. Ele atualiza o `src/appHtml.ts`.
3. Para a loja, aumente `version` e `android.versionCode` no `app.json`.

## Onde fica cada coisa

| Arquivo | O que é |
| --- | --- |
| `App.tsx` | Tela do app: WebView, pedido do microfone e áreas seguras |
| `web/app.html` | O app Dedilhado Vivo inteiro, offline |
| `src/appHtml.ts` | O mesmo HTML em formato que o app carrega (gerado) |
| `app.json` | Nome, pacote `br.com.dedilhadovivo`, ícones e permissões |
| `eas.json` | Perfis de build: `preview` (APK) e `production` (AAB) |
