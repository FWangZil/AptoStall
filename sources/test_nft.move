module marketplace::test_nft {
    use std::string::{Self, String};
    use std::signer;
    use std::option;
    use std::error;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map;
    use aptos_framework::timestamp;

    /// The test NFT collection name
    const COLLECTION_NAME: vector<u8> = b"Test NFT Collection";
    /// The test NFT collection description
    const COLLECTION_DESCRIPTION: vector<u8> = b"A collection of test NFTs for marketplace testing";
    /// The test NFT collection URI
    const COLLECTION_URI: vector<u8> = b"https://via.placeholder.com/400x400.png?text=Test+Collection";

    /// Error codes
    const ETOKEN_DOES_NOT_EXIST: u64 = 1;
    const ENOT_CREATOR: u64 = 2;
    const ECOLLECTION_DOES_NOT_EXIST: u64 = 3;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// The test NFT token structure
    struct TestNFT has key {
        /// Used to mutate the token uri
        mutator_ref: token::MutatorRef,
        /// Used to burn
        burn_ref: token::BurnRef,
        /// Used to mutate properties
        property_mutator_ref: property_map::MutatorRef,
        /// The base URI of the token
        base_uri: String,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Test NFT metadata structure
    struct TestNFTMetadata has key {
        name: String,
        description: String,
        creator: address,
        created_at: u64,
    }

    #[event]
    /// Event emitted when a test NFT is created
    struct TestNFTCreated has drop, store {
        token: Object<TestNFT>,
        name: String,
        creator: address,
        recipient: address,
    }

    #[event]
    /// Event emitted when a collection is created
    struct CollectionCreated has drop, store {
        collection_address: address,
        name: String,
        creator: address,
    }

    // Note: init_module removed to avoid deployment issues
    // Users need to manually call create_test_collection

    /// Create the test NFT collection
    public entry fun create_test_collection(creator: &signer) {
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let name = string::utf8(COLLECTION_NAME);
        let uri = string::utf8(COLLECTION_URI);

        // Create collection with unlimited supply
        collection::create_unlimited_collection(
            creator,
            description,
            name,
            option::none(),
            uri,
        );

        let collection_address = collection::create_collection_address(
            &signer::address_of(creator),
            &name
        );

        event::emit(
            CollectionCreated {
                collection_address,
                name,
                creator: signer::address_of(creator),
            }
        );
    }

    /// Create a test NFT
    public entry fun create_test_nft(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
        recipient: address,
    ) {
        let collection_name = string::utf8(COLLECTION_NAME);
        
        // Create the token
        let constructor_ref = token::create_named_token(
            creator,
            collection_name,
            description,
            name,
            option::none(),
            uri,
        );

        // Generate necessary refs
        let object_signer = object::generate_signer(&constructor_ref);
        let mutator_ref = token::generate_mutator_ref(&constructor_ref);
        let burn_ref = token::generate_burn_ref(&constructor_ref);
        let property_mutator_ref = property_map::generate_mutator_ref(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);

        // Transfer to recipient
        let linear_transfer_ref = object::generate_linear_transfer_ref(&transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, recipient);

        // Initialize token metadata
        move_to(&object_signer, TestNFTMetadata {
            name,
            description,
            creator: signer::address_of(creator),
            created_at: timestamp::now_seconds(),
        });

        // Initialize the TestNFT resource
        let test_nft = TestNFT {
            mutator_ref,
            burn_ref,
            property_mutator_ref,
            base_uri: uri,
        };
        move_to(&object_signer, test_nft);

        // Initialize empty property map
        let properties = property_map::prepare_input(vector[], vector[], vector[]);
        property_map::init(&constructor_ref, properties);

        // Get token object
        let token = object::object_from_constructor_ref<TestNFT>(&constructor_ref);

        event::emit(
            TestNFTCreated {
                token,
                name,
                creator: signer::address_of(creator),
                recipient,
            }
        );
    }

    /// Burn a test NFT
    public entry fun burn(creator: &signer, token: Object<TestNFT>) acquires TestNFT, TestNFTMetadata {
        authorize_creator(creator, &token);
        
        let token_address = object::object_address(&token);
        let test_nft = move_from<TestNFT>(token_address);
        let metadata = move_from<TestNFTMetadata>(token_address);
        
        let TestNFT {
            mutator_ref: _,
            burn_ref,
            property_mutator_ref,
            base_uri: _,
        } = test_nft;
        
        let TestNFTMetadata {
            name: _,
            description: _,
            creator: _,
            created_at: _,
        } = metadata;

        property_map::burn(property_mutator_ref);
        token::burn(burn_ref);
    }

    /// Authorize the creator of the token
    inline fun authorize_creator<T: key>(creator: &signer, token: &Object<T>) {
        let token_address = object::object_address(token);
        assert!(
            exists<TestNFTMetadata>(token_address),
            error::not_found(ETOKEN_DOES_NOT_EXIST),
        );
        let metadata = borrow_global<TestNFTMetadata>(token_address);
        assert!(
            metadata.creator == signer::address_of(creator),
            error::permission_denied(ENOT_CREATOR),
        );
    }

    #[view]
    /// Get the token name
    public fun get_name(token: Object<TestNFT>): String acquires TestNFTMetadata {
        let metadata = borrow_global<TestNFTMetadata>(object::object_address(&token));
        metadata.name
    }

    #[view]
    /// Get the token description
    public fun get_description(token: Object<TestNFT>): String acquires TestNFTMetadata {
        let metadata = borrow_global<TestNFTMetadata>(object::object_address(&token));
        metadata.description
    }

    #[view]
    /// Get the token URI
    public fun get_uri(token: Object<TestNFT>): String {
        token::uri(token)
    }

    #[view]
    /// Get the token creator
    public fun get_creator(token: Object<TestNFT>): address acquires TestNFTMetadata {
        let metadata = borrow_global<TestNFTMetadata>(object::object_address(&token));
        metadata.creator
    }

    #[view]
    /// Get the token creation time
    public fun get_created_at(token: Object<TestNFT>): u64 acquires TestNFTMetadata {
        let metadata = borrow_global<TestNFTMetadata>(object::object_address(&token));
        metadata.created_at
    }

    #[view]
    /// Check if an address has a TestNFT
    public fun is_test_nft(token_address: address): bool {
        exists<TestNFT>(token_address) && exists<TestNFTMetadata>(token_address)
    }

    #[view]
    /// Get collection info
    public fun get_collection_info(creator: address): (String, String, String) {
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_address = collection::create_collection_address(&creator, &collection_name);
        let collection_obj = object::address_to_object<collection::Collection>(collection_address);
        (
            collection::name(collection_obj),
            collection::description(collection_obj),
            collection::uri(collection_obj),
        )
    }

    #[test(creator = @0x123, user1 = @0x456, framework = @aptos_framework)]
    fun test_create_nft(creator: &signer, user1: &signer, framework: &signer) 
        acquires TestNFT, TestNFTMetadata {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        
        // Create collection
        create_test_collection(creator);
        
        // Create NFT
        let name = string::utf8(b"Test NFT #1");
        let description = string::utf8(b"A test NFT");
        let uri = string::utf8(b"https://via.placeholder.com/400x400.png?text=Test+NFT");
        let user1_addr = signer::address_of(user1);
        
        create_test_nft(creator, name, description, uri, user1_addr);
        
        // Verify NFT exists
        let collection_name = string::utf8(COLLECTION_NAME);
        let token_address = token::create_token_address(
            &signer::address_of(creator),
            &collection_name,
            &name
        );
        
        assert!(is_test_nft(token_address), 1);
        
        // Verify metadata
        let token = object::address_to_object<TestNFT>(token_address);
        assert!(get_name(token) == name, 2);
        assert!(get_description(token) == description, 3);
        assert!(get_creator(token) == signer::address_of(creator), 4);
        assert!(object::owner(token) == user1_addr, 5);
    }
}
