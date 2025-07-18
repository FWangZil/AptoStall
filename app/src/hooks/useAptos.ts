import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { APTOS_NODE_URL, APTOS_NETWORK } from "@/utils/constants";

const config = new AptosConfig({ 
  network: APTOS_NETWORK as Network,
  fullnode: APTOS_NODE_URL 
});

export const aptos = new Aptos(config);

export function useAptos() {
  return aptos;
}
