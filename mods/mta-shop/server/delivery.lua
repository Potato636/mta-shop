-- MTA Shop Delivery System
-- This script handles automatic delivery of purchased items to players
-- Place this in your MTA resource folder

local MTA_SHOP_URL = "http://YOUR_REPLIT_URL/api/mta/delivery" -- Change to your Replit app URL
local API_KEY = "your-api-key-here" -- Change to your MTA_API_KEY
local DELIVERY_LOG = "mta_delivery_log.txt"

-- Log delivery attempts and results
local function logDelivery(message)
    local file = io.open(DELIVERY_LOG, "a")
    if file then
        local timestamp = os.date("%Y-%m-%d %H:%M:%S")
        file:write(timestamp .. " - " .. message .. "\n")
        file:close()
    end
end

-- Get player by username (case-insensitive)
local function getPlayerByUsername(username)
    for _, player in ipairs(getElementsByType("player")) do
        if string.lower(getPlayerName(player)) == string.lower(username) then
            return player
        end
    end
    return nil
end

-- Deliver VIP status to player
local function deliverVIP(player, data)
    if not player or not isElement(player) then
        return false
    end
    
    local level = data.level or "bronze"
    local days = data.days or 30
    
    -- Give VIP account data
    local account = getPlayerAccount(player)
    if account then
        setAccountData(account, "vip.level", level)
        setAccountData(account, "vip.expiry", tostring(getRealTime().timestamp + (days * 86400)))
        
        outputChatBox("* You have received VIP " .. level:upper() .. " for " .. days .. " days!", player, 0, 255, 0)
        logDelivery("VIP " .. level .. " delivered to " .. getPlayerName(player) .. " for " .. days .. " days")
        return true
    end
    return false
end

-- Deliver coins to player
local function deliverCoins(player, data)
    if not player or not isElement(player) then
        return false
    end
    
    local amount = tonumber(data.amount) or 0
    if amount <= 0 then
        return false
    end
    
    local account = getPlayerAccount(player)
    if account then
        local currentCoins = tonumber(getAccountData(account, "coins")) or 0
        setAccountData(account, "coins", tostring(currentCoins + amount))
        
        outputChatBox("* You have received " .. amount .. " coins!", player, 0, 200, 100)
        logDelivery("Coins delivered to " .. getPlayerName(player) .. ": " .. amount)
        return true
    end
    return false
end

-- Deliver vehicle pack
local function deliverVehiclePack(player, vehiclePackId)
    if not player or not isElement(player) then
        return false
    end
    
    local vehicles = {
        legendary_cars = {
            {model = 402, x = 0, y = 0, z = 0},  -- Buffalo
            {model = 411, x = 3, y = 0, z = 0},  -- Infernus
            {model = 415, x = 6, y = 0, z = 0},  -- Cheetah
            {model = 429, x = 9, y = 0, z = 0},  -- Banshee
            {model = 480, x = 12, y = 0, z = 0}, -- Comet
        }
    }
    
    local pack = vehicles[vehiclePackId]
    if not pack then
        return false
    end
    
    local account = getPlayerAccount(player)
    if account then
        setAccountData(account, "vehicle_pack." .. vehiclePackId, "1")
        outputChatBox("* You have received the " .. vehiclePackId:gsub("_", " "):upper() .. " pack!", player, 0, 255, 0)
        logDelivery("Vehicle pack '" .. vehiclePackId .. "' delivered to " .. getPlayerName(player))
        return true
    end
    return false
end

-- Deliver weapon bundle
local function deliverWeaponBundle(player, bundleId)
    if not player or not isElement(player) then
        return false
    end
    
    local weapons = {
        master = {22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34}
    }
    
    local weaponList = weapons[bundleId]
    if not weaponList then
        return false
    end
    
    for _, weaponId in ipairs(weaponList) do
        giveWeapon(player, weaponId, 999)
    end
    
    local account = getPlayerAccount(player)
    if account then
        setAccountData(account, "weapon_bundle." .. bundleId, "1")
        outputChatBox("* You have received the " .. bundleId:upper() .. " weapon bundle! All weapons unlocked.", player, 200, 100, 0)
        logDelivery("Weapon bundle '" .. bundleId .. "' delivered to " .. getPlayerName(player))
        return true
    end
    return false
end

-- Main delivery handler
local function deliverItem(mtaUsername, itemType, itemData)
    local player = getPlayerByUsername(mtaUsername)
    if not player then
        logDelivery("ERROR: Player '" .. mtaUsername .. "' not found online")
        return false
    end
    
    local success = false
    
    if itemType == "vip" then
        success = deliverVIP(player, itemData)
    elseif itemType == "coins" then
        success = deliverCoins(player, itemData)
    elseif itemType == "vehicle_pack" then
        success = deliverVehiclePack(player, itemData.id)
    elseif itemType == "weapon_bundle" then
        success = deliverWeaponBundle(player, itemData.id)
    elseif itemType == "special" then
        -- Handle special bundles (starter pack, etc)
        outputChatBox("* You have received a special item!", player, 255, 200, 0)
        logDelivery("Special item delivered to " .. getPlayerName(player))
        success = true
    else
        logDelivery("ERROR: Unknown item type: " .. tostring(itemType))
    end
    
    return success
end

-- HTTP callback from shop server (triggered by admin confirming pickup)
function onShopDeliveryRequest(data, errno)
    if errno ~= 0 then
        logDelivery("ERROR: HTTP request failed - " .. errno)
        return
    end
    
    local decoded = fromJSON(data)
    if not decoded then
        logDelivery("ERROR: Invalid JSON response")
        return
    end
    
    if decoded.orderId and decoded.mtaUsername and decoded.items then
        local success = true
        for _, item in ipairs(decoded.items) do
            local itemData = fromJSON(item.mtaItemData or "{}")
            if not deliverItem(decoded.mtaUsername, item.mtaItemType, itemData) then
                success = false
            end
        end
        
        -- Notify shop server of delivery status
        local callbackData = {
            orderId = decoded.orderId,
            success = success,
            error = success and nil or "Delivery failed - player may be offline"
        }
        
        fetchRemote(MTA_SHOP_URL .. "/callback", {
            method = "POST",
            headers = {
                ["Content-Type"] = "application/json",
                ["X-API-Key"] = API_KEY
            },
            post = toJSON(callbackData)
        }, onDeliveryCallback)
    end
end

-- Callback after delivery notification is sent back to shop
function onDeliveryCallback(data, errno)
    if errno == 0 then
        logDelivery("Delivery callback sent to shop server successfully")
    else
        logDelivery("ERROR: Failed to send delivery callback - " .. errno)
    end
end

-- Command for admins to test delivery
function testDeliveryCommand(player, command, username, itemType, ...)
    if not isObjectInACLGroup("user." .. getAccountName(getPlayerAccount(player)), aclGetGroup("Admin")) then
        outputChatBox("You don't have permission to use this command", player, 255, 0, 0)
        return
    end
    
    if not username or not itemType then
        outputChatBox("Usage: /testdelivery [username] [vip|coins|vehicle|weapon] [item_data]", player, 255, 255, 0)
        return
    end
    
    local targetPlayer = getPlayerByUsername(username)
    if not targetPlayer then
        outputChatBox("Player '" .. username .. "' not found", player, 255, 0, 0)
        return
    end
    
    local itemData = {}
    
    if itemType == "vip" then
        itemData = {level = arg[1] or "bronze", days = tonumber(arg[2]) or 30}
        if deliverVIP(targetPlayer, itemData) then
            outputChatBox("VIP delivered successfully", player, 0, 255, 0)
        end
    elseif itemType == "coins" then
        itemData = {amount = tonumber(arg[1]) or 1000}
        if deliverCoins(targetPlayer, itemData) then
            outputChatBox("Coins delivered successfully", player, 0, 255, 0)
        end
    elseif itemType == "vehicle" then
        if deliverVehiclePack(targetPlayer, arg[1] or "legendary_cars") then
            outputChatBox("Vehicle pack delivered successfully", player, 0, 255, 0)
        end
    elseif itemType == "weapon" then
        if deliverWeaponBundle(targetPlayer, arg[1] or "master") then
            outputChatBox("Weapon bundle delivered successfully", player, 0, 255, 0)
        end
    else
        outputChatBox("Unknown item type", player, 255, 0, 0)
    end
end

-- Commands
addCommandHandler("testdelivery", testDeliveryCommand)
addCommandHandler("deliverylog", function(player)
    if not isObjectInACLGroup("user." .. getAccountName(getPlayerAccount(player)), aclGetGroup("Admin")) then
        outputChatBox("You don't have permission", player, 255, 0, 0)
        return
    end
    
    local file = io.open(DELIVERY_LOG, "r")
    if file then
        local content = file:read("*a")
        file:close()
        
        outputChatBox("=== Delivery Log ===", player, 255, 255, 0)
        for line in content:gmatch("[^\n]+") do
            outputChatBox(line, player, 200, 200, 200)
        end
    else
        outputChatBox("No delivery log found", player, 255, 0, 0)
    end
end)

-- Log startup
logDelivery("MTA Shop Delivery System started")
outputConsole("MTA Shop Delivery System loaded. URL: " .. MTA_SHOP_URL)
