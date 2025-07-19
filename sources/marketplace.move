/// Stall-style fixed-price marketplace for Aptos
/// Allows sellers to create isolated resource accounts to hold Stall resources
/// and list transferable objects at fixed prices for buyers to purchase.
module marketplace::marketplace {
    use std::signer;
    use std::option::{Self, Option};
    use aptos_std::table::{Self, Table};
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_NOT_LISTED: u64 = 2;
    const E_PRICE_MISMATCH: u64 = 3;
    const E_ZERO_PRICE: u64 = 4;
    const E_STALL_NOT_FOUND: u64 = 5;
    const E_OBJECT_NOT_TRANSFERABLE: u64 = 6;

    // Policy types for future extensibility
    const POLICY_FIXED_PRICE: u8 = 0;

    /// Represents a listing in the marketplace
    struct Listing has copy, drop, store {
        price: u64,        // price in APT (octas)
        policy: u8         // policy type (currently only fixed price)
    }

    /// Main stall resource that holds listed items
    struct Stall has key {
        items: Table<address, Listing>,  // object address -> listing
        owner: address,                  // seller's EOA wallet
        signer_cap: SignerCapability     // capability to sign for this stall
    }

    // Events
    #[event]
    struct StallCreated has drop, store {
        stall_addr: address,
        owner: address
    }

    #[event]
    struct ItemListed has drop, store {
        stall_addr: address,
        object_addr: address,
        price: u64
    }

    #[event]
    struct ItemSold has drop, store {
        stall_addr: address,
        object_addr: address,
        price: u64,
        seller: address,
        buyer: address
    }

    /// Creates a new stall using a resource account
    public entry fun create_stall(account: &signer, seed: vector<u8>) {
        let owner_addr = signer::address_of(account);

        // Create resource account
        let (stall_signer, signer_cap) = account::create_resource_account(account, seed);
        let stall_addr = signer::address_of(&stall_signer);

        // Initialize empty stall
        let stall = Stall {
            items: table::new(),
            owner: owner_addr,
            signer_cap
        };

        // Move stall to resource account
        move_to(&stall_signer, stall);

        // Emit event
        event::emit(StallCreated {
            stall_addr,
            owner: owner_addr
        });
    }

    /// Lists an object in the stall at a fixed price
    public entry fun list_item<T: key>(
        owner: &signer,
        stall_addr: address,
        object: Object<T>,
        price: u64
    ) acquires Stall {
        assert!(price > 0, E_ZERO_PRICE);
        assert!(exists<Stall>(stall_addr), E_STALL_NOT_FOUND);

        let stall = borrow_global_mut<Stall>(stall_addr);
        assert!(stall.owner == signer::address_of(owner), E_NOT_OWNER);

        let object_addr = object::object_address(&object);

        // Check if object supports ungated transfer
        assert!(object::ungated_transfer_allowed(object), E_OBJECT_NOT_TRANSFERABLE);

        // Transfer object to stall
        let stall_signer = account::create_signer_with_capability(&stall.signer_cap);
        object::transfer(owner, object, signer::address_of(&stall_signer));

        // Add listing
        let listing = Listing {
            price,
            policy: POLICY_FIXED_PRICE
        };
        table::add(&mut stall.items, object_addr, listing);

        // Emit event
        event::emit(ItemListed {
            stall_addr,
            object_addr,
            price
        });
    }

    /// Buys an item from the stall
    public entry fun buy<T: key>(
        buyer: &signer,
        stall_addr: address,
        object_addr: address,
        payment_amount: u64
    ) acquires Stall {
        assert!(exists<Stall>(stall_addr), E_STALL_NOT_FOUND);

        let stall = borrow_global_mut<Stall>(stall_addr);
        assert!(table::contains(&stall.items, object_addr), E_NOT_LISTED);

        let listing = table::remove(&mut stall.items, object_addr);
        assert!(payment_amount == listing.price, E_PRICE_MISMATCH);

        // Transfer payment from buyer to stall owner
        coin::transfer<AptosCoin>(buyer, stall.owner, payment_amount);

        // Transfer object to buyer
        let stall_signer = account::create_signer_with_capability(&stall.signer_cap);
        let object = object::address_to_object<T>(object_addr);
        object::transfer(&stall_signer, object, signer::address_of(buyer));

        // Emit event
        event::emit(ItemSold {
            stall_addr,
            object_addr,
            price: listing.price,
            seller: stall.owner,
            buyer: signer::address_of(buyer)
        });
    }

    // View functions

    #[view]
    /// Check if an item is listed in a stall
    public fun is_listed(stall_addr: address, object_addr: address): bool acquires Stall {
        if (!exists<Stall>(stall_addr)) {
            return false
        };
        let stall = borrow_global<Stall>(stall_addr);
        table::contains(&stall.items, object_addr)
    }

    #[view]
    /// Get the price of a listed item
    public fun get_price(stall_addr: address, object_addr: address): Option<u64> acquires Stall {
        if (!exists<Stall>(stall_addr)) {
            return option::none()
        };
        let stall = borrow_global<Stall>(stall_addr);
        if (!table::contains(&stall.items, object_addr)) {
            return option::none()
        };
        let listing = table::borrow(&stall.items, object_addr);
        option::some(listing.price)
    }

    #[view]
    /// Get the owner of a stall
    public fun get_stall_owner(stall_addr: address): Option<address> acquires Stall {
        if (!exists<Stall>(stall_addr)) {
            return option::none()
        };
        let stall = borrow_global<Stall>(stall_addr);
        option::some(stall.owner)
    }

    #[view]
    /// Check if an object can be transferred (supports ungated transfer)
    public fun is_object_transferable<T: key>(object: Object<T>): bool {
        object::ungated_transfer_allowed(object)
    }
}
