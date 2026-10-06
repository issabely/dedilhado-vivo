# Dedilhado Vivo: app Android com Capacitor

É um projeto Android nativo de verdade, que abre no **Android Studio**. O app inteiro fica em `www/index.html`, funciona offline e já traz a flauta 3D. O microfone já está liberado no `AndroidManifest.xml`.

## Gerar o APK no seu computador

Você precisa ter o **Node.js** e o **Android Studio** instalados.

1. Abra o terminal nesta pasta e rode `npm install` (só na primeira vez).
2. Rode `npx cap sync android`. Ele copia o `www/` para dentro do projeto Android.
3. Rode `npx cap open android`. O projeto abre no Android Studio. Espere o Gradle terminar de baixar tudo; na primeira vez demora.
4. Escolha como testar ou gerar:
   - **Testar no celular:** ligue a Depuração USB no celular, conecte no cabo e clique em ▶ Run.
   - **APK:** menu **Build → Build App Bundle(s) / APK(s) → Build APK(s)**. O arquivo fica em `android/app/build/outputs/apk/debug/app-debug.apk`.
   - **Play Store:** menu **Build → Generate Signed App Bundle / APK → Android App Bundle**. Crie a chave (guarde bem o arquivo e a senha) e envie o `.aab` gerado para o Play Console.

## Quando mudar o app

1. Troque o `www/index.html` pelo arquivo único novo.
2. Rode `npx cap sync android`.
3. Para a loja, aumente `versionCode` e `versionName` em `android/app/build.gradle`.

## Onde fica cada coisa

| Arquivo | O que é |
| --- | --- |
| `www/index.html` | O app Dedilhado Vivo inteiro, offline |
| `capacitor.config.ts` | Nome, pacote `br.com.dedilhadovivo` e cor de fundo |
| `android/` | Projeto Android: ícones, tela de abertura e permissões |
