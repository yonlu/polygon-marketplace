require('@nomiclabs/hardhat-waffle');
const fs = require('fs');
const privateKey = fs.readFileSync('.secret').toString();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [privateKey],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [privateKey],
    },
  },
  solidity: '0.8.4',
};
