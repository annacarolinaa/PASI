# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Versão do app e atualizações OTA (EAS Update)

O app instalado (APK do perfil `preview`) recebe atualizações automáticas:
todo push na `dev` que mexa em `apps/mobile` publica um update
(`.github/workflows/mobile-update.yml`). O `runtimeVersion` usa a política
`appVersion`, ou seja, é o `"version"` do `app.json`. Um APK só aceita updates
com o mesmo runtimeVersion dele.

## Regra: mudança nativa => aumentar o "version"

Se a alteração mudar o código NATIVO do app, aumente `expo.version` no
`app.json` NA MESMA alteração e avise que é preciso gerar um APK novo
(`eas build -p android --profile preview` em `apps/mobile`). Se você não
aumentar, o update chega a APKs que não têm esse código nativo e o app trava.

Conta como mudança nativa:
- adicionar, remover ou atualizar uma dependência com código nativo
  (`expo-*`, `react-native-*`, `@react-native-*` ou qualquer pacote com
  pasta `android/`/`ios/` ou config plugin);
- atualizar o Expo SDK ou o React Native;
- alterar no `app.json` o que vai para o binário: `plugins`, `android.*`
  (package, permissões, adaptiveIcon), `ios.*`, `icon`, `splash`, `scheme`,
  `name`, `orientation`, `userInterfaceStyle`, `runtimeVersion`, `updates`;
- alterar `eas.json` de forma que mude o build (perfil, canal, ambiente).

NÃO é mudança nativa (vai por update, sem mexer na versão): código em `src/`,
`App.tsx`, estilos e Tailwind, textos, imagens importadas pelo JS e
dependências só de JavaScript (ex.: axios).

Como incrementar (semver):
- MINOR (`1.0.0` -> `1.1.0`) para mudança nativa comum;
- MAJOR (`1.x` -> `2.0.0`) para atualização do Expo SDK.

Não mexa no `versionCode` do Android: o EAS incrementa sozinho
(`autoIncrement` + `appVersionSource: remote`).

Na dúvida se um pacote tem código nativo, trate como nativo e aumente a versão.
Um APK a mais custa pouco; um app travado no celular de quem usa custa muito.
