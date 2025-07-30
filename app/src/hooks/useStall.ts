import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAptos } from "./useAptos";
import {
  FUNCTIONS,
  VIEW_FUNCTIONS,
  STORAGE_KEYS
} from "@/utils/constants";
import { aptToOctas, deriveResourceAccountAddress } from "@/lib/utils";
import { useToast } from "./useToast";

export interface Listing {
  object_addr: string;
  price: number; // in octas
  stall_addr?: string; // optional for backward compatibility
}

export function useStall() {
  const { account, signAndSubmitTransaction } = useWallet();
  const aptos = useAptos();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the stored stall address
  const stallAddress = localStorage.getItem(STORAGE_KEYS.STALL_ADDRESS);

  // Create stall mutation
  const createStallMutation = useMutation({
    mutationFn: async (seed: string) => {
      if (!account) throw new Error("Wallet not connected");

      console.log("Creating stall with seed:", seed);
      console.log("Account address:", account.address);

      // Check if this seed was already used
      const existingSeed = localStorage.getItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`) ||
                          localStorage.getItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`);
      if (existingSeed === seed) {
        throw new Error(`Seed "${seed}" has already been used. Please use a different seed.`);
      }

      const payload = {
        function: FUNCTIONS.CREATE_STALL as `${string}::${string}::${string}`,
        functionArguments: [seed],
      };

      console.log("Submitting transaction with payload:", payload);

      try {
        const response = await signAndSubmitTransaction({ data: payload });
        console.log("Transaction submitted:", response.hash);

        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log("Transaction confirmed");

        // Get the transaction details to extract the stall address from events
        const txnDetails = await aptos.getTransactionByHash({ transactionHash: response.hash });
        console.log("Transaction details:", txnDetails);

        // Look for StallCreated event to get the actual stall address
        let stallAddress = account.address; // fallback to account address

        if ('events' in txnDetails && txnDetails.events) {
          const stallCreatedEvent = txnDetails.events.find(
            (event: any) => event.type.includes('StallCreated') || event.type.includes('marketplace::StallCreated')
          );

          if (stallCreatedEvent && stallCreatedEvent.data) {
            stallAddress = stallCreatedEvent.data.stall_addr;
            console.log("Found stall address from event:", stallAddress);
          } else {
            console.log("StallCreated event not found in events:", txnDetails.events);
            console.log("Trying to derive resource account address");
            try {
              stallAddress = deriveResourceAccountAddress(account.address, seed);
              console.log("Derived stall address:", stallAddress);
            } catch (error) {
              console.warn("Failed to derive resource account address, using account address as fallback:", error);
              stallAddress = account.address;
            }
          }
        } else {
          console.log("No events found in transaction, using account address as fallback");
        }

        // Store the seed and stall address for reference
        localStorage.setItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`, seed);
        localStorage.setItem(STORAGE_KEYS.STALL_ADDRESS, stallAddress);

        return stallAddress;
      } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
      }
    },
    onSuccess: (stallAddr) => {
      toast({
        title: "Stall Created",
        description: `Stall created at ${stallAddr.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["stall"] });
    },
    onError: (error) => {
      console.error("Create stall error:", error);
      let errorMessage = error.message;

      if (errorMessage.includes("claimed account")) {
        errorMessage = "This seed has already been used. Please try a different seed or clear your stall data.";
      }

      toast({
        title: "Failed to Create Stall",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // List item mutation
  const listItemMutation = useMutation({
    mutationFn: async ({ objectId, price }: { objectId: string; price: number }) => {
      if (!account || !stallAddress) throw new Error("Wallet not connected or no stall");

      const payload = {
        function: FUNCTIONS.LIST_ITEM as `${string}::${string}::${string}`,
        typeArguments: ["0x1::object::ObjectCore"], // Generic object type
        functionArguments: [stallAddress, objectId, aptToOctas(price)],
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
      let errorMessage = error.message;
      let errorTitle = "Error";

      // Check for specific error types
      if (errorMessage.includes("ungated transfers") || errorMessage.includes("E_OBJECT_NOT_TRANSFERABLE")) {
        errorTitle = "Object Not Transferable";
        errorMessage = "This digital asset doesn't support free transfers. Please select an asset marked as 'Transferable' in your assets list.";
      } else if (errorMessage.includes("E_KIOSK_NOT_FOUND")) {
        errorTitle = "Stall Not Found";
        errorMessage = "Your stall was not found. Please clear stall data and create a new stall.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Buy item mutation
  const buyItemMutation = useMutation({
    mutationFn: async ({ objectAddr, price, stallAddr }: { objectAddr: string; price: number; stallAddr?: string }) => {
      if (!account) throw new Error("Wallet not connected");

      // Use provided stallAddr or fallback to user's own stall
      const targetStallAddr = stallAddr || stallAddress;
      if (!targetStallAddr) throw new Error("No stall address provided");

      const payload = {
        function: FUNCTIONS.BUY as `${string}::${string}::${string}`,
        typeArguments: ["0x1::object::ObjectCore"],
        functionArguments: [targetStallAddr, objectAddr, price], // price in octas
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
      let errorMessage = error.message;
      let errorTitle = "Purchase Failed";

      // Check for specific error types
      if (errorMessage.includes("E_KIOSK_NOT_FOUND")) {
        errorTitle = "Stall Not Found";
        errorMessage = "The stall was not found. The item may have been removed.";
      } else if (errorMessage.includes("E_NOT_LISTED")) {
        errorTitle = "Item Not Available";
        errorMessage = "This item is no longer listed for sale.";
      } else if (errorMessage.includes("E_PRICE_MISMATCH")) {
        errorTitle = "Price Mismatch";
        errorMessage = "The price has changed. Please refresh and try again.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Check if stall exists
  const stallQuery = useQuery({
    queryKey: ["stall", stallAddress],
    queryFn: async () => {
      if (!stallAddress) return null;

      try {
        const owner = await aptos.view({
          payload: {
            function: VIEW_FUNCTIONS.GET_STALL_OWNER as `${string}::${string}::${string}`,
            functionArguments: [stallAddress],
          },
        });
        return owner[0] ? { address: stallAddress, owner: owner[0] } : null;
      } catch {
        return null;
      }
    },
    enabled: !!stallAddress,
  });

  // Function to clear stall data (for debugging)
  const clearStallData = () => {
    localStorage.removeItem(STORAGE_KEYS.STALL_ADDRESS);
    localStorage.removeItem(`${STORAGE_KEYS.STALL_ADDRESS}_seed`);
    queryClient.invalidateQueries({ queryKey: ["stall"] });
  };

  return {
    stallAddress,
    stall: stallQuery.data,
    isStallLoading: stallQuery.isLoading,
    createStall: createStallMutation.mutate,
    isCreatingStall: createStallMutation.isPending,
    listItem: listItemMutation.mutate,
    isListingItem: listItemMutation.isPending,
    buyItem: buyItemMutation.mutate,
    isBuyingItem: buyItemMutation.isPending,
    clearStallData, // For debugging purposes
  };
}
