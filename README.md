## Yotube Clip Discord Bot Downloader

Simples bot criado utilizando discord.js e yt-dlp-wrap para baixar clipes de vídeos e lives do youtube. Utiliza comandos de aplicação do discord e possui um simples sistema de fila para garantir que os clipes sejam baixados em ordem.

1. Clone o repositório:

```bash
git clone https://github.com/cardtunic/yt-clip-discord-bot.git
```

2. Instale as dependências:

```bash
npm install
```

3. Copie o arquivo `config.example.json` e renomeie para `config.json` e edite o arquivo para adicionar as informações necessárias:

```json
{
  "discord": {
    "token": "", // Token da aplicação
    "guildsIds": [""], // IDs dos servidores que o bot deve funcionar
    "clipsChannelsIds": {} // [guildId]: "channelId"
    "appId": "" // ID da aplicação
  },
  "youtube": {
    "allowedChannels": [""] // Canais que o bot pode baixar clipes
  }
}
```

4. Execute o bot:

```bash
node client.js
```
