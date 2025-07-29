module marketplace::test_nft {
    use std::string::{Self, String};
    use std::signer;
    use std::bcs;
    use aptos_framework::object::{Self};
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Test NFT resource that can be attached to objects
    struct TestNFT has key {
        name: String,
        description: String,
        creator: address,
        uri: String,
    }

    #[event]
    struct TestNFTCreated has drop, store {
        object_addr: address,
        name: String,
        creator: address,
    }

    /// Create a simple test NFT object with proper metadata
    public entry fun create_test_nft(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
    ) {
        let creator_addr = signer::address_of(creator);

        // Create a new object with a unique seed based on name and timestamp
        let timestamp = aptos_framework::timestamp::now_microseconds();
        let seed_string = string::utf8(b"");
        string::append(&mut seed_string, name);
        string::append_utf8(&mut seed_string, b"_");
        string::append_utf8(&mut seed_string, *string::bytes(&string::utf8(bcs::to_bytes(&timestamp))));
        let constructor_ref = object::create_named_object(creator, *string::bytes(&seed_string));
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
            uri,
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
