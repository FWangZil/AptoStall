export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0x42";
export const APTOS_NODE_URL = import.meta.env.VITE_APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com/v1";
export const APTOS_NETWORK = import.meta.env.VITE_APTOS_NETWORK || "devnet";

export const MARKETPLACE_MODULE = `${MODULE_ADDRESS}::marketplace`;

export const FUNCTIONS = {
  CREATE_KIOSK: `${MARKETPLACE_MODULE}::create_kiosk`,
  LIST_ITEM: `${MARKETPLACE_MODULE}::list_item`,
  BUY: `${MARKETPLACE_MODULE}::buy`,
} as const;

export const VIEW_FUNCTIONS = {
  IS_LISTED: `${MARKETPLACE_MODULE}::is_listed`,
  GET_PRICE: `${MARKETPLACE_MODULE}::get_price`,
  GET_KIOSK_OWNER: `${MARKETPLACE_MODULE}::get_kiosk_owner`,
} as const;

export const APTOS_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
export const OCTAS_PER_APT = 100_000_000;

export const STORAGE_KEYS = {
  KIOSK_ADDRESS: "kiosk_address",
} as const;
