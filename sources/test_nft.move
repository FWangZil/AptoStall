module marketplace::test_nft {
    use std::string::{Self, String};
    use std::signer;
    use aptos_framework::object::{Self};
    use aptos_framework::event;

    /// Test NFT resource that can be attached to objects
    struct TestNFT has key {
        name: String,
        description: String,
        creator: address,
    }

    /// Event emitted when a test NFT is created
    #[event]
    struct TestNFTCreated has drop, store {
        object_addr: address,
        name: String,
        creator: address,
    }

    /// Create a simple test NFT object
    public entry fun create_test_nft(
        creator: &signer,
        name: String,
        description: String,
    ) {
        let creator_addr = signer::address_of(creator);

        // Create a new object with a unique seed
        let seed = name;
        let constructor_ref = object::create_named_object(creator, *string::bytes(&seed));
        let object_signer = object::generate_signer(&constructor_ref);
        let object_addr = object::address_from_constructor_ref(&constructor_ref);
        
        // Enable ungated transfer to allow marketplace listing
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        object::enable_ungated_transfer(&transfer_ref);

        // Create the TestNFT resource
        let test_nft = TestNFT {
            name,
            description,
            creator: creator_addr,
        };

        // Move the TestNFT resource to the object
        move_to(&object_signer, test_nft);

        // Emit event
        event::emit(TestNFTCreated {
            object_addr,
            name,
            creator: creator_addr,
        });
    }

    /// Get the name of a test NFT
    #[view]
    public fun get_name(object_addr: address): String acquires TestNFT {
        let test_nft = borrow_global<TestNFT>(object_addr);
        test_nft.name
    }

    /// Get the description of a test NFT
    #[view]
    public fun get_description(object_addr: address): String acquires TestNFT {
        let test_nft = borrow_global<TestNFT>(object_addr);
        test_nft.description
    }

    /// Get the creator of a test NFT
    #[view]
    public fun get_creator(object_addr: address): address acquires TestNFT {
        let test_nft = borrow_global<TestNFT>(object_addr);
        test_nft.creator
    }

    /// Check if an address has a TestNFT resource
    #[view]
    public fun is_test_nft(object_addr: address): bool {
        exists<TestNFT>(object_addr)
    }
}
