# MTA Shop Integration Guide

## 📝 Guia de Integração com Servidor MTA

Este guide explica como integrar a loja MTA com seu servidor.

---

## 🚀 Como Usar o Script MTA

### 1. **Copiar o Script para seu Servidor**

Copie o arquivo `mta_delivery_script.lua` para uma pasta resource no seu servidor MTA. Exemplo:

```
seu_servidor/resources/[shop]/mta_shop_delivery/
```

### 2. **Criar o meta.xml**

Crie um arquivo `meta.xml` na mesma pasta:

```xml
<meta>
    <info author="Shop Admin" description="MTA Shop Delivery System" version="1.0"/>
    <script src="mta_delivery_script.lua" type="server"/>
</meta>
```

### 3. **Configurar URL e API Key**

Abra `mta_delivery_script.lua` e altere estas linhas no topo:

```lua
local MTA_SHOP_URL = "http://SEU_URL_REPLIT/api/mta/delivery"
local API_KEY = "sua-api-key-aqui"
```

**Substitua:**
- `SEU_URL_REPLIT` → URL de deploy do seu Replit (ex: `https://my-mta-shop.replit.dev`)
- `sua-api-key-aqui` → Configure a variável `MTA_API_KEY` no Replit

### 4. **Adicionar resource ao server.cfg**

No arquivo `server.cfg` do seu servidor MTA, adicione:

```
start mta_shop_delivery
```

### 5. **ACL Permissions (Importante!)**

Certifique-se de que o resource tem permissão para fazer requisições HTTP. No arquivo `acl.xml`:

```xml
<acl name="Admin">
    <right name="function.fetchRemote" access="allow" />
    <right name="function.setAccountData" access="allow" />
    <right name="function.getAccountData" access="allow" />
    <right name="general.http" access="allow" />
</acl>
```

---

## 🎮 Comandos Admin

### Ver Log de Entregas
```
/deliverylog
```
Mostra todas as entregas realizadas (requer permissão Admin)

### Testar Entrega Manual
```
/testdelivery [username] [tipo] [dados]
```

**Exemplos:**

```lua
/testdelivery PlayerName vip bronze 30
/testdelivery PlayerName coins 1000
/testdelivery PlayerName weapon master
/testdelivery PlayerName vehicle legendary_cars
```

---

## 🔄 Fluxo de Funcionamento

1. **Cliente compra** algo na loja web
2. **Admin confirma pickup** no painel admin
3. **Backend avisa o servidor MTA** via HTTP
4. **MTA entrega o item** automaticamente se o player estiver online
5. **Log é registrado** em `mta_delivery_log.txt`

---

## 📊 Tipos de Itens Suportados

### VIP
```json
{
  "level": "bronze|gold|diamond",
  "days": 30
}
```

### Moedas (Coins)
```json
{
  "amount": 1000
}
```

### Pacote de Veículos
```json
{
  "id": "legendary_cars"
}
```

### Pacote de Armas
```json
{
  "id": "master"
}
```

### Pacotes Especiais
```json
{
  "type": "bundle",
  "id": "starter"
}
```

---

## 🔒 Segurança

- ✅ API Key protegida no backend (nunca expor no cliente)
- ✅ Validação de request headers
- ✅ Logs de todas as entregas
- ✅ Apenas admin pode confirmar retirada
- ✅ Callback de confirmação após entrega

---

## 🐛 Troubleshooting

### "Player não encontrado"
- Verifique se o player está online
- Verifique se o username está correto

### "HTTP request failed"
- Cheque se a URL do Replit está correta
- Cheque se a API Key está configurada
- Verifique ACL permissions

### Items não sendo entregues
- Veja o log com `/deliverylog`
- Use `/testdelivery` para testar manualmente
- Verifique se o player tem permissões (account data)

---

## 📝 Personalizar Items

Para adicionar novos tipos de items, edite o arquivo `mta_delivery_script.lua`:

1. Crie uma função `deliverXXX(player, data)`
2. Adicione um case na função `deliverItem()`
3. Configure o item no banco de dados da loja web

---

## 🔗 Variáveis de Ambiente Replit

Configure estas variáveis no Replit em **Secrets**:

- `MTA_API_KEY` - Sua chave secreta para o MTA
- `SESSION_SECRET` - Chave de sessão (gerado automaticamente)
- `DATABASE_URL` - Conexão PostgreSQL (gerado automaticamente)

---

## 📞 Support

Para mais informações ou problemas, verifique:
- Log do servidor MTA
- `mta_delivery_log.txt` na pasta do resource
- Console do Replit no dashboard

---

**Boa sorte! 🚀**
