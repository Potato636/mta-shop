# Cliente Scripts

Pasta para scripts do lado do cliente (Lua).

## Arquivos

Este diretório contém scripts executados no cliente (no computador do jogador).

## Exemplo de Script Cliente

```lua
-- Exemplo: Mostrar notificação quando item é entregue
addEventHandler("onClientResourceStart", resourceRoot, function()
    outputChatBox("* MTA Shop carregado!", 255, 255, 0)
end)

-- Ouvir eventos do servidor
addEvent("itemDelivered", true)
addEventHandler("itemDelivered", root, function(itemName)
    outputChatBox("* Você recebeu: " .. itemName, 0, 255, 0)
end)
```

## Integração

Para adicionar um novo script cliente:

1. Crie um arquivo `.lua` nesta pasta
2. Adicione a referência no `meta.xml`:
   ```xml
   <script src="client/seu-script.lua" type="client" />
   ```
3. Reinicie o resource
