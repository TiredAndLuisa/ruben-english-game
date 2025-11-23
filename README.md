# Professor Ruben — Learn English (Kids) — Sound Version

Projeto estático simples para ensinar inglês para crianças, com interface colorida, efeitos sonoros gerados pelo Web Audio API e pronúncia por SpeechSynthesis.

## Estrutura
- `index.html` — página principal
- `style.css` — estilos
- `app.js` — lógica do jogo + motor de sons

## Como rodar localmente
Abra `index.html` diretamente no navegador ou use um servidor local para evitar restrições de `speechSynthesis`/AudioContext em alguns navegadores.

Com `npx` (recomendado):

```powershell
npx http-server -c-1 . -p 8080
# depois abra http://localhost:8080
```

Ou com Python (se instalado):

```powershell
python -m http.server 8080
# depois abra http://localhost:8080
```

## Deploy no Vercel
1. Crie um repositório (GitHub) com esses arquivos.
2. Conecte o repo no Vercel (https://vercel.com) e faça deploy como projeto estático.

### Passos rápidos para criar repo e fazer deploy (Windows PowerShell)

```powershell
cd "c:\Users\migue\OneDrive\Documents\Nova pasta\ruben-english-game-sound"
git init
git add .
git commit -m "Initial: Ruben English Game with sounds and stickers"
# criar repo no GitHub via CLI (gh) ou pelo site. Com gh:
gh repo create your-username/ruben-english-game --public --source=. --remote=origin
git push -u origin main
```

Depois de subir para o GitHub, no Vercel:
- Faça login em https://vercel.com
- Clique em "New Project" → selecione o repo `ruben-english-game` → Deploy

Se preferir, me forneça o link do repo ou um token com acesso (opcional) e eu posso automatizar o deploy para você.

## Recursos e melhorias possíveis
- Substituir sons gerados por loops ou efeitos gravados (assets `.mp3`) — mantenha arquivos livres de direitos.
- Adicionar imagens e animações para cada item.
- Adicionar tela de progresso e recompensas (stickers).
- Traduzir textos para múltiplos idiomas.

## Privacidade e compatibilidade
- O sintetizador `SpeechSynthesis` é usado localmente no navegador — não envia texto para servidores.
- Testado em navegadores modernos (Chrome, Edge, Firefox). Em Safari o comportamento do WebAudio/AutoPlay pode variar.

Divirta-se! 🎉
