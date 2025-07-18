# Kiosk Marketplace Smart Contract

A production-grade, minimal smart contract package implementing a **Kiosk-style fixed-price marketplace** on the Aptos blockchain.

## 🎯 Overview

This marketplace allows:
- **Sellers** to create isolated resource accounts that hold "Kiosk" resources
- **Sellers** to list any transferable object (NFT or fungible token) at a fixed price
- **Buyers** to atomically purchase items, with automatic payment transfer and event emission
- Simple fixed-price offers (no auctions or dynamic pricing)

## 🏗️ Architecture

### Core Data Structures

#### Kiosk
```move
struct Kiosk has key {
    items: table::Table<address, Listing>,  // object address -> listing
    owner: address,                         // seller's EOA wallet
    signer_cap: SignerCapability           // capability to sign for this kiosk
}
```

#### Listing
```move
struct Listing has copy, drop, store {
    price: u64,        // price in APT (octas)
    policy: u8         // policy type (currently only fixed price)
}
```

### Public Entry Functions

1. **`create_kiosk(account: &signer, seed: vector<u8>)`**
   - Creates a resource account using the provided seed
   - Publishes an empty Kiosk under that account
   - Emits `KioskCreated` event

2. **`list_item<T: key>(owner: &signer, kiosk_addr: address, object: Object<T>, price: u64)`**
   - Lists an object in the kiosk at a fixed price
   - Transfers object to kiosk storage
   - Emits `ItemListed` event

3. **`buy<T: key>(buyer: &signer, kiosk_addr: address, object_addr: address, payment_amount: u64)`**
   - Purchases an item from the kiosk
   - Transfers payment to seller and object to buyer
   - Emits `ItemSold` event

### View Functions

- `is_listed(kiosk_addr: address, object_addr: address): bool`
- `get_price(kiosk_addr: address, object_addr: address): Option<u64>`
- `get_kiosk_owner(kiosk_addr: address): Option<address>`

## 🚀 Quick Start

### Prerequisites

1. Install [Aptos CLI](https://aptos.dev/tools/aptos-cli/install-cli/)
2. Set up a devnet profile:
   ```bash
   aptos init --profile devnet --network devnet
   ```

### Compilation and Testing

```bash
# Compile the contract
aptos move compile --dev

# Run all tests
aptos move test --dev --skip-fetch-latest-git-deps

# Run specific test
aptos move test --filter test_list_and_buy_item --dev --skip-fetch-latest-git-deps
```

### Deployment

```bash
# Use the provided script
./scripts/deploy.sh

# Or deploy manually
aptos move publish --profile devnet
```

## 📋 Usage Examples

### 1. Create a Kiosk
```bash
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::create_kiosk \
  --args string:"my_kiosk_seed" \
  --profile devnet
```

### 2. List an Item
```bash
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::list_item \
  --type-args <OBJECT_TYPE> \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR> u64:100000000 \
  --profile devnet
```

### 3. Buy an Item
```bash
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::buy \
  --type-args <OBJECT_TYPE> \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR> u64:100000000 \
  --profile devnet
```

## 🔒 Security Features

- **Resource Account Isolation**: Each kiosk operates in its own resource account
- **Ownership Verification**: Only kiosk owners can list items
- **Atomic Transactions**: Payment and object transfer happen atomically
- **Price Validation**: Exact payment amount required
- **Zero Price Protection**: Prevents listing items at zero price

## 🧪 Testing

The contract includes comprehensive unit tests covering:

- ✅ Kiosk creation
- ✅ Item listing and purchasing
- ✅ Error conditions (wrong owner, unlisted items, price mismatches)
- ✅ Balance verification
- ✅ Object ownership transfer

All tests pass successfully:
```
[ PASS    ] test_buy_unlisted_item_fails
[ PASS    ] test_buy_wrong_price_fails
[ PASS    ] test_create_kiosk
[ PASS    ] test_list_and_buy_item
[ PASS    ] test_list_item_wrong_owner_fails
[ PASS    ] test_list_item_zero_price_fails
Test result: OK. Total tests: 6; passed: 6; failed: 0
```

## 📁 Project Structure

```
├── Move.toml                    # Package configuration
├── sources/
│   └── marketplace.move         # Main contract implementation
├── tests/
│   └── marketplace_test.move    # Comprehensive unit tests
├── scripts/
│   ├── deploy.sh               # Deployment script
│   └── deploy_and_test.md      # Detailed interaction guide
└── README.md                   # This file
```

## 🎯 Error Codes

- `E_NOT_OWNER (1)`: Caller is not the kiosk owner
- `E_NOT_LISTED (2)`: Object not found in marketplace
- `E_PRICE_MISMATCH (3)`: Payment amount doesn't match listing price
- `E_ZERO_PRICE (4)`: Cannot list item at zero price
- `E_KIOSK_NOT_FOUND (5)`: Kiosk resource not found

## 📊 Events

- `KioskCreated`: Emitted when a new kiosk is created
- `ItemListed`: Emitted when an item is listed for sale
- `ItemSold`: Emitted when an item is successfully purchased

## 🔮 Future Enhancements

The contract is designed for extensibility:
- Additional policy types (auctions, time-limited offers)
- Royalty support
- Bulk operations
- Advanced filtering and search capabilities

## 📄 License

This project is provided as-is for educational and development purposes.