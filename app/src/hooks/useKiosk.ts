import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAptos } from "./useAptos";
import {
  FUNCTIONS,
  VIEW_FUNCTIONS,
  STORAGE_KEYS
} from "@/utils/constants";
import { aptToOctas } from "@/lib/utils";
import { useToast } from "./useToast";

export interface Listing {
  object_addr: string;
  price: number; // in octas
}

export function useKiosk() {
  const { account, signAndSubmitTransaction } = useWallet();
  const aptos = useAptos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const kioskAddress = localStorage.getItem(STORAGE_KEYS.KIOSK_ADDRESS);

  // Create kiosk mutation
  const createKioskMutation = useMutation({
    mutationFn: async (seed: string) => {
      if (!account) throw new Error("Wallet not connected");

      const payload = {
        function: FUNCTIONS.CREATE_KIOSK as `${string}::${string}::${string}`,
        functionArguments: [seed],
      };

      const response = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // For now, let's use a simple approach - store the seed and derive address later
      // We'll get the actual kiosk address from the contract events or use a different method
      const kioskAddress = `${account.address}_${seed}`;

      localStorage.setItem(STORAGE_KEYS.KIOSK_ADDRESS, kioskAddress);
      return kioskAddress;
    },
    onSuccess: (kioskAddr) => {
      toast({
        title: "Kiosk Created",
        description: `Kiosk created at ${kioskAddr.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["kiosk"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // List item mutation
  const listItemMutation = useMutation({
    mutationFn: async ({ objectId, price }: { objectId: string; price: number }) => {
      if (!account || !kioskAddress) throw new Error("Wallet not connected or no kiosk");

      const payload = {
        function: FUNCTIONS.LIST_ITEM as `${string}::${string}::${string}`,
        typeArguments: ["0x1::object::ObjectCore"], // Generic object type
        functionArguments: [kioskAddress, objectId, aptToOctas(price)],
      };

      const response = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Item Listed",
        description: "Your item has been listed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Buy item mutation
  const buyItemMutation = useMutation({
    mutationFn: async ({ objectAddr, price }: { objectAddr: string; price: number }) => {
      if (!account || !kioskAddress) throw new Error("Wallet not connected");

      const payload = {
        function: FUNCTIONS.BUY as `${string}::${string}::${string}`,
        typeArguments: ["0x1::object::ObjectCore"],
        functionArguments: [kioskAddress, objectAddr, price], // price in octas
      };

      const response = await signAndSubmitTransaction({ data: payload });
      await aptos.waitForTransaction({ transactionHash: response.hash });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "Item purchased successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if kiosk exists
  const kioskQuery = useQuery({
    queryKey: ["kiosk", kioskAddress],
    queryFn: async () => {
      if (!kioskAddress) return null;

      try {
        const owner = await aptos.view({
          payload: {
            function: VIEW_FUNCTIONS.GET_KIOSK_OWNER as `${string}::${string}::${string}`,
            functionArguments: [kioskAddress],
          },
        });
        return owner[0] ? { address: kioskAddress, owner: owner[0] } : null;
      } catch {
        return null;
      }
    },
    enabled: !!kioskAddress,
  });

  return {
    kioskAddress,
    kiosk: kioskQuery.data,
    isKioskLoading: kioskQuery.isLoading,
    createKiosk: createKioskMutation.mutate,
    isCreatingKiosk: createKioskMutation.isPending,
    listItem: listItemMutation.mutate,
    isListingItem: listItemMutation.isPending,
    buyItem: buyItemMutation.mutate,
    isBuyingItem: buyItemMutation.isPending,
  };
}
