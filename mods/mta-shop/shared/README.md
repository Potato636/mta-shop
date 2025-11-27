# Shared Scripts

Pasta para scripts compartilhados entre cliente e servidor.

## Uso

Scripts nesta pasta são executados tanto no cliente quanto no servidor.

## Exemplo

```lua
-- Funções compartilhadas
function formatMoney(amount)
    return "$" .. tostring(math.floor(amount))
end

function getItemEmoji(itemType)
    local emojis = {
        vip = "👑",
        coins = "💰",
        vehicle = "🚗",
        weapon = "🔫"
    }
    return emojis[itemType] or "📦"
end
```

## Referência

Para usar um script compartilhado:

```xml
<!-- meta.xml -->
<script src="shared/seu-script.lua" type="shared" />
```

Depois acesse as funções em qualquer lugar:

```lua
local formatted = formatMoney(1000) -- "$1000"
```
