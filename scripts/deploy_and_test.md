# Kiosk Marketplace Deployment and Testing Guide

## Prerequisites

1. Install Aptos CLI: https://aptos.dev/tools/aptos-cli/install-cli/
2. Create or configure your Aptos profile for devnet

```bash
# Initialize a new profile (if needed)
aptos init --profile devnet --network devnet

# Or configure existing profile
aptos config set-global-config --config-type workspace
```

## Local Testing

### 1. Compile the contract
```bash
aptos move compile
```

### 2. Run unit tests
```bash
aptos move test
```

### 3. Run specific test
```bash
aptos move test --filter test_list_and_buy_item
```

## Deployment to Devnet

### 1. Publish the contract
```bash
aptos move publish --profile devnet
```

### 2. Note the deployed address
After successful deployment, note the contract address from the output.

## Interacting with the Contract

### 1. Create a Kiosk
```bash
# Replace <CONTRACT_ADDR> with your deployed contract address
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::create_kiosk \
  --args string:"my_kiosk_seed" \
  --profile devnet
```

### 2. Get Kiosk Address
The kiosk address can be calculated as:
```bash
# Use the Aptos CLI to calculate resource address
aptos account derive-resource-address \
  --address <YOUR_ACCOUNT_ADDRESS> \
  --seed "my_kiosk_seed"
```

### 3. List an Item (requires an existing object)
```bash
# This requires you to have an object to list
# Replace <KIOSK_ADDR> and <OBJECT_ADDR> with actual addresses
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::list_item \
  --type-args <OBJECT_TYPE> \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR> u64:100000000 \
  --profile devnet
```

### 4. Buy an Item
```bash
# Replace addresses and ensure you have enough APT
aptos move run \
  --function-id <CONTRACT_ADDR>::marketplace::buy \
  --type-args <OBJECT_TYPE> \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR> \
  --profile devnet
```

## View Functions

### Check if item is listed
```bash
aptos move view \
  --function-id <CONTRACT_ADDR>::marketplace::is_listed \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR>
```

### Get item price
```bash
aptos move view \
  --function-id <CONTRACT_ADDR>::marketplace::get_price \
  --args address:<KIOSK_ADDR> address:<OBJECT_ADDR>
```

### Get kiosk owner
```bash
aptos move view \
  --function-id <CONTRACT_ADDR>::marketplace::get_kiosk_owner \
  --args address:<KIOSK_ADDR>
```

## Example Complete Workflow

1. **Deploy contract**
2. **Create kiosk**
3. **Create/mint an NFT or token to list**
4. **List the item in your kiosk**
5. **Another account buys the item**

## Troubleshooting

### Common Issues:

1. **Compilation errors**: Check Move.toml dependencies and syntax
2. **Gas fees**: Ensure you have enough APT for transactions
3. **Object ownership**: Make sure you own the object you're trying to list
4. **Price mismatch**: Ensure payment amount exactly matches listing price

### Useful Commands:

```bash
# Check account balance
aptos account balance --profile devnet

# Fund account from faucet
aptos account fund-with-faucet --profile devnet

# Check transaction status
aptos transaction show --transaction-hash <TX_HASH>
```
