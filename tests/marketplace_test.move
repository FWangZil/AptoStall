#[test_only]
module marketplace::marketplace_test {

    use aptos_framework::account;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use marketplace::marketplace;
    use std::option;
    use std::signer;

    // Test helper to create a simple test object
    struct TestObject has key {
        value: u64
    }

    fun setup_test(): (signer, signer) {
        let aptos_framework = account::create_account_for_test(@0x1);
        let seller = account::create_account_for_test(@0x100);
        let buyer = account::create_account_for_test(@0x200);

        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&aptos_framework);

        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(&aptos_framework);

        // Fund accounts
        coin::register<AptosCoin>(&seller);
        coin::register<AptosCoin>(&buyer);

        // Mint coins for testing
        let seller_coins = coin::mint<AptosCoin>(1000000000, &mint_cap); // 10 APT
        let buyer_coins = coin::mint<AptosCoin>(5000000000, &mint_cap); // 50 APT

        coin::deposit(signer::address_of(&seller), seller_coins);
        coin::deposit(signer::address_of(&buyer), buyer_coins);

        // Clean up capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        (seller, buyer)
    }

    fun create_test_object(creator: &signer, value: u64): Object<TestObject> {
        let constructor_ref = object::create_object(signer::address_of(creator));
        let object_signer = object::generate_signer(&constructor_ref);

        move_to(&object_signer, TestObject { value });

        object::object_from_constructor_ref(&constructor_ref)
    }

    #[test]
    fun test_create_stall() {
        let (seller, _buyer) = setup_test();
        let seed = b"test_stall";

        // Create stall
        marketplace::create_stall(&seller, seed);

        // Verify stall was created by checking if we can get owner
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);
        let owner = marketplace::get_stall_owner(stall_addr);
        assert!(option::is_some(&owner), 1);
        assert!(option::extract(&mut owner) == signer::address_of(&seller), 2);
    }

    #[test]
    fun test_list_and_buy_item() {
        let (seller, buyer) = setup_test();
        let seed = b"test_stall";

        // Create stall
        marketplace::create_stall(&seller, seed);
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);

        // Create test object
        let test_object = create_test_object(&seller, 42);
        let object_addr = object::object_address(&test_object);

        // List item
        let price = 100000000; // 1 APT in octas
        marketplace::list_item(&seller, stall_addr, test_object, price);

        // Verify item is listed
        assert!(marketplace::is_listed(stall_addr, object_addr), 3);
        let listed_price = marketplace::get_price(stall_addr, object_addr);
        assert!(option::is_some(&listed_price), 4);
        assert!(option::extract(&mut listed_price) == price, 5);

        // Buy item
        let buyer_balance_before = coin::balance<AptosCoin>(signer::address_of(&buyer));
        let seller_balance_before = coin::balance<AptosCoin>(signer::address_of(&seller));

        marketplace::buy<TestObject>(&buyer, stall_addr, object_addr, price);

        // Verify item is no longer listed
        assert!(!marketplace::is_listed(stall_addr, object_addr), 6);

        // Verify balances changed correctly
        let buyer_balance_after = coin::balance<AptosCoin>(signer::address_of(&buyer));
        let seller_balance_after = coin::balance<AptosCoin>(signer::address_of(&seller));

        assert!(
            buyer_balance_after == buyer_balance_before - price,
            7
        );
        assert!(
            seller_balance_after == seller_balance_before + price,
            8
        );

        // Verify object ownership transferred
        assert!(object::is_owner(test_object, signer::address_of(&buyer)), 9);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_ZERO_PRICE)]
    fun test_list_item_zero_price_fails() {
        let (seller, _buyer) = setup_test();
        let seed = b"test_stall";

        marketplace::create_stall(&seller, seed);
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);

        let test_object = create_test_object(&seller, 42);

        // This should fail
        marketplace::list_item(&seller, stall_addr, test_object, 0);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_NOT_OWNER)]
    fun test_list_item_wrong_owner_fails() {
        let (seller, buyer) = setup_test();
        let seed = b"test_stall";

        marketplace::create_stall(&seller, seed);
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);

        let test_object = create_test_object(&buyer, 42);

        // Buyer tries to list in seller's stall - should fail
        marketplace::list_item(&buyer, stall_addr, test_object, 100000000);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_NOT_LISTED)]
    fun test_buy_unlisted_item_fails() {
        let (seller, buyer) = setup_test();
        let seed = b"test_stall";

        marketplace::create_stall(&seller, seed);
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);

        let test_object = create_test_object(&seller, 42);
        let object_addr = object::object_address(&test_object);

        // Try to buy unlisted item - should fail
        marketplace::buy<TestObject>(&buyer, stall_addr, object_addr, 100000000);
    }

    #[test]
    #[expected_failure(abort_code = marketplace::E_PRICE_MISMATCH)]
    fun test_buy_wrong_price_fails() {
        let (seller, buyer) = setup_test();
        let seed = b"test_stall";

        marketplace::create_stall(&seller, seed);
        let stall_addr =
            account::create_resource_address(&signer::address_of(&seller), seed);

        let test_object = create_test_object(&seller, 42);
        let object_addr = object::object_address(&test_object);

        // List at 1 APT
        marketplace::list_item(&seller, stall_addr, test_object, 100000000);

        // Try to pay 0.5 APT - should fail
        marketplace::buy<TestObject>(&buyer, stall_addr, object_addr, 50000000);
    }
}
