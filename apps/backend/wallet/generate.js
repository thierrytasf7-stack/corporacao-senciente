
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_FILE = path.join(__dirname, 'corp_wallet.enc.json');

// NOTE: In production, password should come from a secure ENV or KMS.
// For this "Sovereign" prototype, we use a local secret.
const KEYSTORE_PASSWORD = process.env.WALLET_PASSWORD || 'senciente-corp-sovereignty-2025';

async function generateWallet() {
    if (fs.existsSync(WALLET_FILE)) {
        console.log("ℹ️ Wallet already exists. Loading...");
        const json = fs.readFileSync(WALLET_FILE, 'utf8');
        const wallet = await ethers.Wallet.fromEncryptedJson(json, KEYSTORE_PASSWORD);
        console.log(`✅ Loaded Corp Wallet: ${wallet.address}`);
        return wallet;
    }

    console.log("🪙 Generanting new Sovereign Wallet (Polygon/Base compatible)...");
    const wallet = ethers.Wallet.createRandom();
    console.log(`✅ New Wallet Address: ${wallet.address}`);
    console.log(`🔑 Private Key: ************** (Encrypted locally)`);

    const encryptedJson = await wallet.encrypt(KEYSTORE_PASSWORD);
    fs.writeFileSync(WALLET_FILE, encryptedJson);
    console.log(`💾 Wallet saved to ${WALLET_FILE}`);

    return wallet;
}

if (process.argv[1] === __filename) {
    generateWallet().catch(console.error);
}

export { generateWallet };
