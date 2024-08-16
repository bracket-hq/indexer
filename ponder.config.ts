import { createConfig } from "@ponder/core"
import { BG_Beta_0x7a30Abi } from "abis/BG_Beta_0x7a30Abi"
import { http, fallback } from "viem"

export default createConfig({
  database: {
    kind: "postgres",
    publishSchema: "indexer",
  },
  networks: {
    base: {
      chainId: 8453,
      transport: fallback([http(process.env.PONDER_RPC_URL_8453), http(process.env.FALLBACK_RPC_URL_8453)]),
    },
  },
  contracts: {
    BG_Beta: {
      network: "base",
      startBlock: 15799178,
      maxBlockRange: 1000,
      abi: BG_Beta_0x7a30Abi,
      // NOTE: Only needed for contracts prior to euro24
      // abi: mergeAbis([
      //   TransparentUpgradeableProxyAbi,
      //   BG_Beta_0xba30Abi,
      //   BG_Beta_0xb9f5Abi,
      //   BG_Beta_0xb551Abi,
      //   BG_Beta_0x2233Abi,
      //   BG_Beta_0x181fAbi,
      //   BG_Beta_0x5c59Abi,
      //   BG_Beta_0x3d80Abi,
      //   BG_Beta_0x44e7Abi,
      //   BG_Beta_0xa145Abi,
      //   BG_Beta_0x2a0bAbi,
      //   BG_Beta_0x6b52Abi,
      //   BG_Beta_0x7a30Abi,
      // ]),
      address: [
        // NOTE: Legacy proxy contracts that have been upgraded
        // "0x1304BA4137e2C4B58fBfd1cE0BC07F4c3c6F35DA", // 11915440, ncaab
        // "0x2990A3046AD17270275882a516290b63Aacc7489", // 12988089, masters
        // "0xeAEfe5caf86De5504f291eE2670239E183be95fB", // 13385253, nba
        // "0x5b47186EE87888367055626D64090AcE63c07CaA", // 13387079, nhl
        // "0x89d667Ee9071a59AA6c92199803a4cc21148B8C5", // 13854819, farcon
        // "0xd58CAB19a043C014Ca9366920dA089d924e16c54", // 14447036, golf
        // "0xbb916cD7707F6B5eA12D51f0E90F69797D9D1f56", // 14922090, 5aside
        // "0x3366821cd41A1daA5F3734B5DAf20157D0620581", // 15104007, castout
        // "0x47d74Fe9944fAB7D77f7a0342918fF753AAd706b", // 15356560, dominion
        // "0x21f04a6150490D4F185B9e940B7E6ba9724a9A2f", // 15415905, icc24
        // "0x0C2467cB040465d85cb5B300A8a43B7455CF67B5", // 15495230, usopengolf
        "0x1Fe725AA64fb3EA0c964Cd112561469DF940923A", // 15799178, euro24
        "0xaa3A6D43C4B52F8Bc387539913a19a334cDFCea9", // 16969900, opengolf
        "0x78eC3842d0347aAA5fB3d78f28369D3df96cf055", // 17572482, parissoccer
        "0x4D7Eb98fa967fa7c1216C54a9433dCD893942650", // 17572505, parissoccerw
        "0x3A526CcCfe07994368A128A93BfB217f21d5B26D", // 17572532, parisbball
        "0xBF72E41265AD768DbB7B490e9bCF276597A660D4", // 17572576, parisgolf
        "0x945432469f43d6386FF4F736fC58D6842af126AB", // 17572607, paristennis
        "0xEA55f94bcC44872C318dFC8F91f8d27934cC70D8", // 17572632, parisgymnastics
        "0xA02E3191bD7081A7bB055E67dC1230331ddcc229", // 17832472, basecampdegen
        "0xa38154a41156B128D01d333c11F8C22C46D4C7A8", // 17832605, basecamp
        "0x91F468Ee2131c20d7195eE2F80E0fd49DCB1AeB5", // 17832725, basecamp2
        "0x1368a114A9BcB2C30696CE5CA76B869e34aD9C53", // 17832804, basecamphigher
      ],
    },
  },
})
