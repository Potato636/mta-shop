# 🚀 Setup Completo da Loja MTA no Replit

## ✅ Checklist de Setup

### 1. **Variáveis de Ambiente**

No painel Secrets do Replit, configure:

```
MTA_API_KEY = sua-chave-api-secreta-aqui
SESSION_SECRET = (deixe como está, gerado automaticamente)
DATABASE_URL = (deixe como está, gerado automaticamente)
```

### 2. **Primeiro Acesso**

Acesse: `https://seu-projeto.replit.dev`

Você verá:
- ✅ Homepage com produtos em destaque
- ✅ Botão de Browse Products
- ✅ Link de Register/Login

### 3. **Criar Admin**

**Manualmente no banco de dados:**

```sql
UPDATE users SET is_admin = 1 WHERE username = 'seu_username';
```

Ou use o terminal do Replit:

```bash
npm run db:push
```

### 4. **Seeding de Produtos**

Os produtos são criados automaticamente na primeira requisição a `/api/products`.

Você verá:
- 3 pacotes VIP (Bronze, Gold, Diamond)
- 2 opções de moedas (1000, 5000)
- 2 bundles especiais
- Starter pack

### 5. **Teste da Loja**

1. **Register** - Crie uma conta
2. **Browse Products** - Veja os produtos
3. **Add to Cart** - Adicione um produto
4. **Checkout** - Complete a compra
5. **View Orders** - Acompanhe seu pedido

### 6. **Painel Admin**

Acesse: `https://seu-projeto.replit.dev/admin`

**Opções disponíveis:**

- **Products** - Criar/editar/deletar produtos
- **Orders** - Ver todos os pedidos
- **Pickup Confirmation** - Confirmar entrega MTA

### 7. **Integrar com MTA**

Siga o guia em `MTA_SETUP_GUIDE.md`

---

## 📊 Dados de Teste

### Conta de Teste Padrão
```
Username: testuser
Email: test@example.com
Senha: test123456
MTA Username: TestPlayer
```

Para criar: Use o formulário de registro

### Produtos de Teste
Todos criados automaticamente com imagens reais

---

## 🔗 URLs Importantes

| Página | URL |
|--------|-----|
| Homepage | `/` |
| Produtos | `/products` |
| Checkout | `/checkout` |
| Meus Pedidos | `/my-orders` |
| Login | `/login` |
| Register | `/register` |
| Admin | `/admin` |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário

### Produtos
- `GET /api/products` - Listar todos
- `GET /api/products/:id` - Detalhe
- `POST /api/products` - Criar (admin)
- `PATCH /api/products/:id` - Editar (admin)
- `DELETE /api/products/:id` - Deletar (admin)

### Carrinho
- `GET /api/cart` - Ver carrinho
- `POST /api/cart` - Adicionar item
- `PATCH /api/cart/:id` - Atualizar quantidade
- `DELETE /api/cart/:id` - Remover item
- `DELETE /api/cart` - Limpar carrinho

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Meus pedidos

### Admin
- `GET /api/admin/orders` - Todos os pedidos
- `PATCH /api/admin/orders/:id` - Atualizar status
- `POST /api/admin/orders/:id/confirm-pickup` - Confirmar retirada

### MTA
- `POST /api/mta/delivery-callback` - Callback de entrega
- `POST /api/orders/payment-webhook` - Webhook de pagamento

---

## 🎯 Próximos Passos

1. ✅ Testar compra de produto
2. ✅ Configurar MTA delivery script
3. ✅ Integrar com gateway de pagamento (Stripe/Pix)
4. ✅ Personalizar produtos
5. ✅ Deploy em produção

---

## 💾 Backup & Dados

O banco de dados PostgreSQL é mantido automaticamente pelo Replit.

**Para exportar dados:**
```bash
npm run db:export > backup.sql
```

---

**Tudo pronto! 🎉**
