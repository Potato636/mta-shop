# 💳 Integração PIX - MTA Shop

## ✅ Chave PIX Configurada

Sua chave PIX foi adicionada ao sistema:

```
f7d0554d-038f-4a1a-ac7b-799841ba9c03
```

## 📋 Como Funciona

### Cliente vendo o PIX
1. Cliente compra um produto
2. Vai para o Checkout
3. Seleciona **PIX** como método de pagamento
4. Vê a chave PIX exibida na página
5. Envia o PIX do seu banco para a chave
6. Clica "Fazer Pedido" para confirmar

### Backend Processando
1. Ordem é criada com `status: "pending_payment"`
2. Admin recebe notificação (nos logs)
3. Admin confirma pagamento recebido
4. Status muda para `"awaiting_pickup"`
5. Sistema envia para MTA automaticamente

## 🔐 Segurança

- ✅ Chave PIX armazenada em variáveis de ambiente
- ✅ Nunca exposta em logs ou requisições
- ✅ Exibida apenas no checkout final
- ✅ Validação de chave no backend

## 📊 Fluxo Completo PIX

```
Cliente seleciona PIX
    ↓
Vê chave: f7d0554d-038f-4a1a-ac7b-799841ba9c03
    ↓
Envia PIX do seu banco
    ↓
Clica "Fazer Pedido"
    ↓
Ordem criada (pending_payment)
    ↓
Admin confirma pagamento no Painel
    ↓
Automático: MTA delivery acontece
    ↓
Cliente recebe items no jogo
```

## 🎯 Próximos Passos (Opcionais)

1. **Integração com processador de pagamento:**
   - Stripe
   - Mercado Pago
   - PagSeguro

2. **Automação de pagamento:**
   - Webhook para confirmar PIX automaticamente
   - Notificações por email
   - Status em tempo real

3. **Melhorias UI:**
   - QR Code do PIX (precisa de gerador)
   - Timer de expiração
   - Comprovante de pagamento

## 📝 Variáveis de Ambiente

```
PIX_KEY=f7d0554d-038f-4a1a-ac7b-799841ba9c03
```

Armazenado em: **Secrets do Replit** (protegido)

## 🧪 Testando PIX

1. Vá para `/checkout`
2. Adicione um produto no carrinho
3. Selecione **PIX**
4. Veja a chave aparecer
5. Clique "Fazer Pedido"

A ordem será criada com status **"pending_payment"** até você confirmar no admin.

## ⚠️ Importante

- A chave PIX é sua chave pessoal
- Qualquer pagamento enviado para ela chegará na sua conta
- Você é responsável por confirmar o pagamento no painel admin
- O delivery automático só acontece após confirmação

## 📞 Suporte

Se precisar mudar a chave PIX:
1. Entre em `Secrets` do Replit
2. Procure `PIX_KEY`
3. Atualize com a nova chave

Pronto! 🚀
