# 🚀 SOLUTION RAPIDE - 3 ÉTAPES

## ❌ ERREUR : "Contrat non disponible sur ce réseau"

**Solution en 3 étapes (5 minutes) :**

## 1️⃣ ÉTAPE 1 : Obtenir les clés API (2 minutes)

**Alchemy (Gratuit) :**
1. Allez sur https://alchemy.com
2. Créez un compte gratuit
3. Créez une nouvelle app pour "Polygon Mumbai"
4. Copiez votre API Key

**Polygonscan (Gratuit) :**
1. Allez sur https://polygonscan.com/apis
2. Créez un compte gratuit
3. Créez une nouvelle API Key
4. Copiez votre API Key

## 2️⃣ ÉTAPE 2 : Configurer les fichiers .env (1 minute)

**Editez `contracts/.env` :**
```bash
ALCHEMY_API_KEY=votre_alchemy_api_key
PRIVATE_KEY=votre_private_key_metamask
POLYGONSCAN_API_KEY=votre_polygonscan_api_key
```

**Comment obtenir votre Private Key :**
1. Ouvrez MetaMask
2. Cliquez sur les 3 points → "Account details"
3. Cliquez "Export Private Key"
4. Entrez votre mot de passe
5. Copiez la clé privée

## 3️⃣ ÉTAPE 3 : Déployer le contrat (2 minutes)

```bash
npm run deploy-contract
```

**Copiez l'adresse du contrat déployé et mettez à jour `frontend/.env` :**
```bash
REACT_APP_CONTRACT_ADDRESS_MUMBAI=0xabcd...ef12
```

## 🎉 C'EST TOUT !

**Testez maintenant :**
```bash
npm run dev
```

1. **Connectez votre wallet** à Mumbai testnet
2. **Allez sur** `/upload` (page Mint)
3. **Créez un certificat** → Plus d'erreur !

## 💰 MATIC de test

Si vous n'avez pas de MATIC de test :
- https://faucet.polygon.technology/
- https://mumbaifaucet.com/

## 🆘 En cas de problème

**Erreur "Insufficient funds"** → Obtenez plus de MATIC de test
**Erreur "Contract deployment failed"** → Vérifiez vos clés API
**Erreur "Network not supported"** → Ajoutez Mumbai testnet à MetaMask

**🎉 Une fois le contrat déployé, l'erreur disparaîtra !** 