# Guia de Instalação - MTA Shop

## Pré-requisitos

- MTA Server instalado
- Conhecimento básico de Lua
- Acesso ao arquivo `server.conf` do seu servidor MTA

## Passo 1: Preparar os Arquivos

1. Copie a pasta `mta-shop` para:
   ```
   MTA Server\mods\deathmatch\resources\
   ```

2. Certifique-se de que a estrutura é:
   ```
   resources\
   └── mta-shop\
       ├── meta.xml
       ├── server\
       │   ├── delivery.lua
       │   └── config.lua
       ├── client\
       └── shared\
   ```

## Passo 2: Configurar as Credenciais

Abra o arquivo `server/delivery.lua` e procure pelas variáveis:

```lua
local MTA_SHOP_URL = "http://YOUR_REPLIT_URL/api/mta/delivery"
local API_KEY = "your-api-key-here"
```

**Substitua:**
- `YOUR_REPLIT_URL` - A URL da sua aplicação Replit (ex: `https://seu-app.replit.dev`)
- `your-api-key-here` - Sua chave de API MTA (defina em variáveis de ambiente: `MTA_API_KEY`)

### Como obter a URL do Replit:

1. Acesse seu projeto Replit
2. Clique em "Publish" (ou veja a URL na barra de endereço)
3. Copie a URL (será algo como `https://seu-app.replit.dev`)

### Como definir a Chave de API:

1. No seu servidor Replit, vá para "Secrets" (ícone de chave)
2. Adicione: `MTA_API_KEY = sua-chave-secreta`
3. Use a mesma chave em seu script Lua

## Passo 3: Registrar o Resource

Abra o arquivo `server.conf` do seu servidor MTA e adicione:

```
resource mta-shop
```

## Passo 4: Reiniciar o Servidor

Execute no console do MTA:
```
stop mta-shop
refresh
start mta-shop
```

Ou reinicie o servidor completamente.

## Passo 5: Verificar a Instalação

No console do servidor, você deve ver:
```
[mta-shop] Resource started successfully
[mta-shop] Delivery system initialized
```

## Testando a Entrega

Use o comando admin:
```
/testdelivery [playerName]
```

Exemplo:
```
/testdelivery John
```

## Troubleshooting

### "Resource failed to start"
- Verifique se `meta.xml` está bem formatado
- Verifique se `server/delivery.lua` existe
- Verifique erros de sintaxe Lua

### "Connection refused"
- Verifique se a URL do Replit está correta
- Verifique se seu servidor Replit está rodando
- Verifique a chave de API

### "Items not delivered"
- Verifique os logs em `mta_delivery_log.txt`
- Verifique se o jogador está online
- Verifique se há saldo disponível na conta

## Próximos Passos

1. Customize o script para suas necessidades
2. Adicione novos tipos de itens em `deliverItem()`
3. Configure notificações de entrega
4. Integre com seu sistema de economia

## Suporte

Para mais informações:
- Wiki MTA: https://wiki.multitheftauto.com/
- Documentação Lua: https://www.lua.org/manual/
- Fórum MTA: https://forum.multitheftauto.com/
