# Embeddable NFTs
Easily embed OpenSea listings in your website!

### Component inputs

`horizontal` - If this is present, the card will be rendered horizontally.

`width` - The width of the embeddable. Ex. values `100%` `250px`. Default: `388px`

`height` - The height of the embeddable. Ex. values `40vh` `300px`. Default: `560px`

`contractAddress`\*- The token's contract address.

`tokenId`\* - The token Id of the asset.

`network` - The name of the network the asset is on `mainnet` or `rinkeby`. Default: `mainnet`.

\*Required inputs

Example:
```
<nft-card
  width="100%"
  height="250px"
  contractAddress="0x5caebd3b32e210e85ce3e9d51638b9c445481567"
  tokenId="2242579050293992223"
  network="mainnet"
  >
</nft-card>
```

### Development
For developers looking to contribute or modify the code, or view the example use the following commands:
```bash
  git clone https://github.com/ProjectOpenSea/embeddable_nfts.git
  cd embeddable_nfts
  npm install
  npm run dev:demo
```

#### Development server
This project uses webpack for building and running a development server. Once the server starts, any changes made will trigger a rebuild after which those changes should be reflected in your browser.