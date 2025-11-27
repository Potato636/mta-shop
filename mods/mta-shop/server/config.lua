-- MTA Shop Configuration
-- Configure aqui as variáveis do seu servidor

local config = {
    -- Conexão com a API
    shopUrl = "http://YOUR_REPLIT_URL/api/mta/delivery",
    apiKey = "your-api-key-here",
    
    -- Configurações de Entrega
    maxRetries = 3,
    retryDelay = 300000, -- 5 minutos em ms
    
    -- VIP Configuration
    vipLevels = {
        bronze = { commands = 5, slots = 1 },
        silver = { commands = 10, slots = 2 },
        gold = { commands = 20, slots = 3 },
        platinum = { commands = 50, slots = 5 }
    },
    
    -- Logs
    enableLogging = true,
    logFile = "mta_delivery_log.txt"
}

-- Função para obter configuração
function getShopConfig(key)
    if key then
        return config[key]
    end
    return config
end

-- Função para definir configuração
function setShopConfig(key, value)
    config[key] = value
end

-- Exportar para outros scripts
return config
