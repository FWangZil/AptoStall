export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0x421e6060f40c3f658aaa666f68c672768c707a2f26537e4b69e3308fe7504929";
export const APTOS_NODE_URL = import.meta.env.VITE_APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";
export const APTOS_NETWORK = import.meta.env.VITE_APTOS_NETWORK || "testnet";

export const MARKETPLACE_MODULE = `${MODULE_ADDRESS}::marketplace`;

export const FUNCTIONS = {
  CREATE_STALL: `${MARKETPLACE_MODULE}::create_stall`,
  LIST_ITEM: `${MARKETPLACE_MODULE}::list_item`,
  BUY: `${MARKETPLACE_MODULE}::buy`,
} as const;

export const VIEW_FUNCTIONS = {
  IS_LISTED: `${MARKETPLACE_MODULE}::is_listed`,
  GET_PRICE: `${MARKETPLACE_MODULE}::get_price`,
  GET_STALL_OWNER: `${MARKETPLACE_MODULE}::get_stall_owner`,
  IS_OBJECT_TRANSFERABLE: `${MARKETPLACE_MODULE}::is_object_transferable`,
} as const;

export const APTOS_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
export const OCTAS_PER_APT = 100_000_000;

export const STORAGE_KEYS = {
  STALL_ADDRESS: "stall_address",
} as const;
