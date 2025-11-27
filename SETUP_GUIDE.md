# 🎮 MTA Shop - Setup Guide Completo

## ✅ O Que Você Precisa

### 1. **Para o SITE** (Já configurado!)
- ✅ PostgreSQL Database (automático no Replit)
- ✅ SESSION_SECRET (automático no Replit)
- ✅ MTA_API_KEY (você vai gerar abaixo)

### 2. **Para o MOD MTA**
- 🔗 URL do seu site Replit
- 🔐 API Key (mesma do site)
- 📝 Arquivo `mta-shop.lua` na pasta resources do MTA

---

## 🚀 Passo-a-Passo Setup

### **PASSO 1: Copiar a URL do Replit**

1. Clique em **Tools** (canto superior esquerdo do Replit)
2. Selecione **URL**
3. Copie a URL que aparece (exemplo: `https://seu-replit-app.replit.dev`)
4. **Guarde essa URL!** Você vai usar em vários lugares

---

### **PASSO 2: Configurar MTA_API_KEY no Backend**

Sua chave de API segura foi gerada. Você encontra em `Secrets` no Replit:

**Como adicionar no Replit:**
1. Clique na aba **Secrets** (lado esquerdo)
2. Clique em **Add Secret**
3. Nome: `MTA_API_KEY`
4. Valor: A chave gerada abaixo ↓

**SUA CHAVE SEGURA:**
```
(Será mostrada após setup final)
```

---

### **PASSO 3: Preparar o Script Lua para o MTA**

O arquivo `mta_delivery_script.lua` já existe. Você precisa:

1. **Abrir** o arquivo `mta_delivery_script.lua` em seu editor
2. **Encontrar as linhas 5-6:**
   ```lua
   local MTA_SHOP_URL = "http://YOUR_REPLIT_URL/api/mta/delivery"
   local API_KEY = "your-api-key-here"
   ```
3. **Substituir:**
   - `YOUR_REPLIT_URL` → Sua URL do Replit (sem `/api/mta/delivery`)
   - `your-api-key-here` → A chave gerada na PASSO 2

**Exemplo completo:**
```lua
local MTA_SHOP_URL = "https://seu-replit-app.replit.dev/api/mta/delivery"
local API_KEY = "sua-chave-segura-aqui"
```

---

### **PASSO 4: Copiar o Script para o MTA**

1. **Crie uma pasta** no seu servidor MTA:
   ```
   resources/
   └── mta-shop/
       └── mta-shop.lua
   ```

2. **Copie o conteúdo** do arquivo `mta_delivery_script.lua` para `mta-shop.lua`

3. **No meta.xml** da sua resource, adicione:
   ```xml
   <meta>
     <info author="MTA Shop" description="MTA Shop Delivery System" version="1.0"/>
     <script src="mta-shop.lua" type="server"/>
   </meta>
   ```

---

## 📋 Endpoints Disponíveis

### **Delivery Endpoint**
```
POST /api/mta/delivery
```

**Parâmetros:**
```json
{
  "playerUsername": "JogadorMTA",
  "items": [
    {
      "type": "vip",
      "data": {
        "level": "gold",
        "days": 30
      }
    },
    {
      "type": "coins",
      "data": {
        "amount": 1000
      }
    }
  ],
  "apiKey": "SUA_CHAVE_API"
}
```

**Resposta Sucesso:**
```json
{
  "success": true,
  "delivered": ["JogadorMTA"],
  "failed": []
}
```

---

## 🔐 Segurança

- ✅ **API Key** protege o endpoint de acessos não autorizados
- ✅ **SSL/TLS** automático no Replit (HTTPS)
- ✅ **Validação** de dados em cada entrega
- ✅ **Logs** de todas as entregas em `mta_delivery_log.txt`

---

## 🧪 Testando a Integração

### **Via Browser Console (Admin Panel)**
1. Vá para `/admin`
2. No painel de Orders, clique "Confirmar Pickup"
3. O script Lua do MTA receberá a solicitação automaticamente

### **Via cURL (Teste Manual)**
```bash
curl -X POST https://seu-replit-app.replit.dev/api/mta/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "playerUsername": "TestPlayer",
    "items": [{
      "type": "coins",
      "data": {"amount": 100}
    }],
    "apiKey": "sua-chave-aqui"
  }'
```

---

## 📝 Arquivos Criados/Modificados

```
.
├── mta_delivery_script.lua      (✅ Já existe - configure com sua URL)
├── SETUP_GUIDE.md              (✅ Este arquivo)
├── .replit (env vars)
├── client/src/...              (Frontend - já funciona)
├── server/routes.ts            (✅ Endpoint /api/mta/delivery)
└── server/storage.ts           (✅ Banco de dados para pedidos)
```

---

## 🐛 Troubleshooting

### **"Connection refused" no MTA**
- Verifique se a URL está correta (incluindo HTTPS)
- Verifique se o Replit está rodando (Status: RUNNING)

### **"API Key invalid"**
- Confirme que usou a mesma chave no site E no script Lua
- Verifique se não há espaços extras na chave

### **"Player not found"**
- Verifique se o nome do jogador está correto (case-sensitive no MTA)
- Player precisa estar online no servidor

### **Nenhum item entregue**
- Confira `mta_delivery_log.txt` no servidor MTA
- Verifique se a conexão HTTPS está funcionando
- Teste com o cURL acima

---

## 📚 Documentação Adicional

- `replit.md` - Visão geral do projeto
- `mta_delivery_script.lua` - Script completo do MTA
- `/api/admin/orders` - Endpoint para listar pedidos
- `/api/mta/delivery` - Endpoint para entregar itens

---

## ✨ Próximas Etapas

1. ✅ Configure a URL do Replit
2. ✅ Adicione MTA_API_KEY nos Secrets
3. ✅ Configure o script `mta-shop.lua`
4. ✅ Teste a entrega de um item
5. 🎮 Aproveite seu MTA Shop funcional!

---

**Dúvidas?** Confira os logs:
- Backend: Console do Replit
- MTA: `mta_delivery_log.txt`
- Frontend: Developer Tools (F12)
