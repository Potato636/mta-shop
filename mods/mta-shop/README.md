# MTA Shop Mods

Pasta para organizar todos os scripts e mods do MTA Shop.

## Estrutura de Pastas

```
mods/
└── mta-shop/
    ├── client/          # Scripts do lado do cliente (Lua)
    ├── server/          # Scripts do lado do servidor (Lua)
    ├── shared/          # Scripts compartilhados (Lua)
    └── meta.xml         # Arquivo de configuração do resource
```

## Instalação

1. Copie a pasta `mta-shop` para sua pasta de resources do MTA:
   ```
   MTA Server\mods\deathmatch\resources\mta-shop\
   ```

2. Configure as variáveis de ambiente no script:
   - `MTA_SHOP_URL` - URL da sua aplicação Replit
   - `API_KEY` - Chave de API do seu servidor

3. Reinicie o servidor MTA

## Scripts Inclusos

### Delivery System (server/delivery.lua)
Sistema automático de entrega de itens comprados:
- Entrega de VIP
- Entrega de moedas
- Entrega de veículos
- Entrega de armas
- Entrega de bundles

### Configuração

Edite `server/delivery.lua` e configure:

```lua
local MTA_SHOP_URL = "http://YOUR_REPLIT_URL/api/mta/delivery"
local API_KEY = "your-api-key-here"
```

## Adicionando Novos Mods

Para adicionar novos mods:

1. Crie uma pasta para seu mod em `mods/`
2. Adicione scripts em `client/`, `server/`, ou `shared/`
3. Configure o `meta.xml`
4. Reinicie o servidor MTA

## Logs

Os logs de entrega são salvos em `mta_delivery_log.txt` no diretório do servidor MTA.

## Suporte

Para problemas, consulte:
- Documentação MTA: https://wiki.multitheftauto.com/
- Replit Docs: https://docs.replit.com/
- GitHub Issues: Abra um issue no repositório do projeto
