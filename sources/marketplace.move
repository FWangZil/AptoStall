/// Kiosk-style fixed-price marketplace for Aptos
/// Allows sellers to create isolated resource accounts to hold Kiosk resources
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
    const E_KIOSK_NOT_FOUND: u64 = 5;

    // Policy types for future extensibility
    const POLICY_FIXED_PRICE: u8 = 0;

    /// Represents a listing in the marketplace
    struct Listing has copy, drop, store {
        price: u64,        // price in APT (octas)
        policy: u8         // policy type (currently only fixed price)
    }

    /// Main kiosk resource that holds listed items
    struct Kiosk has key {
        items: Table<address, Listing>,  // object address -> listing
        owner: address,                  // seller's EOA wallet
        signer_cap: SignerCapability     // capability to sign for this kiosk
    }

    // Events
    #[event]
    struct KioskCreated has drop, store {
        kiosk_addr: address,
        owner: address
    }

    #[event]
    struct ItemListed has drop, store {
        kiosk_addr: address,
        object_addr: address,
        price: u64
    }

    #[event]
    struct ItemSold has drop, store {
        kiosk_addr: address,
        object_addr: address,
        price: u64,
        seller: address,
        buyer: address
    }

    /// Creates a new kiosk using a resource account
    public entry fun create_kiosk(account: &signer, seed: vector<u8>) {
        let owner_addr = signer::address_of(account);

        // Create resource account
        let (kiosk_signer, signer_cap) = account::create_resource_account(account, seed);
        let kiosk_addr = signer::address_of(&kiosk_signer);

        // Initialize empty kiosk
        let kiosk = Kiosk {
            items: table::new(),
            owner: owner_addr,
            signer_cap
        };

        // Move kiosk to resource account
        move_to(&kiosk_signer, kiosk);

        // Emit event
        event::emit(KioskCreated {
            kiosk_addr,
            owner: owner_addr
        });
    }

    /// Lists an object in the kiosk at a fixed price
    public entry fun list_item<T: key>(
        owner: &signer,
        kiosk_addr: address,
        object: Object<T>,
        price: u64
    ) acquires Kiosk {
        assert!(price > 0, E_ZERO_PRICE);
        assert!(exists<Kiosk>(kiosk_addr), E_KIOSK_NOT_FOUND);

        let kiosk = borrow_global_mut<Kiosk>(kiosk_addr);
        assert!(kiosk.owner == signer::address_of(owner), E_NOT_OWNER);

        let object_addr = object::object_address(&object);

        // Transfer object to kiosk
        let kiosk_signer = account::create_signer_with_capability(&kiosk.signer_cap);
        object::transfer(owner, object, signer::address_of(&kiosk_signer));

        // Add listing
        let listing = Listing {
            price,
            policy: POLICY_FIXED_PRICE
        };
        table::add(&mut kiosk.items, object_addr, listing);

        // Emit event
        event::emit(ItemListed {
            kiosk_addr,
            object_addr,
            price
        });
    }

    /// Buys an item from the kiosk
    public entry fun buy<T: key>(
        buyer: &signer,
        kiosk_addr: address,
        object_addr: address,
        payment_amount: u64
    ) acquires Kiosk {
        assert!(exists<Kiosk>(kiosk_addr), E_KIOSK_NOT_FOUND);

        let kiosk = borrow_global_mut<Kiosk>(kiosk_addr);
        assert!(table::contains(&kiosk.items, object_addr), E_NOT_LISTED);

        let listing = table::remove(&mut kiosk.items, object_addr);
        assert!(payment_amount == listing.price, E_PRICE_MISMATCH);

        // Transfer payment from buyer to kiosk owner
        coin::transfer<AptosCoin>(buyer, kiosk.owner, payment_amount);

        // Transfer object to buyer
        let kiosk_signer = account::create_signer_with_capability(&kiosk.signer_cap);
        let object = object::address_to_object<T>(object_addr);
        object::transfer(&kiosk_signer, object, signer::address_of(buyer));

        // Emit event
        event::emit(ItemSold {
            kiosk_addr,
            object_addr,
            price: listing.price,
            seller: kiosk.owner,
            buyer: signer::address_of(buyer)
        });
    }

    // View functions

    #[view]
    /// Check if an item is listed in a kiosk
    public fun is_listed(kiosk_addr: address, object_addr: address): bool acquires Kiosk {
        if (!exists<Kiosk>(kiosk_addr)) {
            return false
        };
        let kiosk = borrow_global<Kiosk>(kiosk_addr);
        table::contains(&kiosk.items, object_addr)
    }

    #[view]
    /// Get the price of a listed item
    public fun get_price(kiosk_addr: address, object_addr: address): Option<u64> acquires Kiosk {
        if (!exists<Kiosk>(kiosk_addr)) {
            return option::none()
        };
        let kiosk = borrow_global<Kiosk>(kiosk_addr);
        if (!table::contains(&kiosk.items, object_addr)) {
            return option::none()
        };
        let listing = table::borrow(&kiosk.items, object_addr);
        option::some(listing.price)
    }

    #[view]
    /// Get the owner of a kiosk
    public fun get_kiosk_owner(kiosk_addr: address): Option<address> acquires Kiosk {
        if (!exists<Kiosk>(kiosk_addr)) {
            return option::none()
        };
        let kiosk = borrow_global<Kiosk>(kiosk_addr);
        option::some(kiosk.owner)
    }
}
