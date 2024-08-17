import { createConfig, mergeAbis } from "@ponder/core"
import { BG_Beta_0x2a0bAbi } from "abis/BG_Beta_0x2a0bAbi"
import { BG_Beta_0x3d80Abi } from "abis/BG_Beta_0x3d80Abi"
import { BG_Beta_0x5c59Abi } from "abis/BG_Beta_0x5c59Abi"
import { BG_Beta_0x6b52Abi } from "abis/BG_Beta_0x6b52Abi"
import { BG_Beta_0x7a30Abi } from "abis/BG_Beta_0x7a30Abi"
import { BG_Beta_0x44e7Abi } from "abis/BG_Beta_0x44e7Abi"
import { BG_Beta_0x181fAbi } from "abis/BG_Beta_0x181fAbi"
import { BG_Beta_0x1001Abi } from "abis/BG_Beta_0x1001Abi"
import { BG_Beta_0x2233Abi } from "abis/BG_Beta_0x2233Abi"
import { BG_Beta_0x4970Abi } from "abis/BG_Beta_0x4970Abi"
import { BG_Beta_0xa145Abi } from "abis/BG_Beta_0xa145Abi"
import { BG_Beta_0xb9f5Abi } from "abis/BG_Beta_0xb9f5Abi"
import { BG_Beta_0xb551Abi } from "abis/BG_Beta_0xb551Abi"
import { BG_Beta_0xba30Abi } from "abis/BG_Beta_0xba30Abi"
import { TransparentUpgradeableProxyAbi } from "abis/TransparentUpgradeableProxyAbi"
import { http, fallback } from "viem"

console.info(`INFO: Starting Ponder with NODE_ENV=${process.env.NODE_ENV}`)

export default createConfig({
  database: {
    kind: "postgres",
    publishSchema: "indexer",
  },
  networks: {
    base: {
      chainId: 8453,
      maxRequestsPerSecond: 100,
      transport: fallback([http(process.env.PONDER_RPC_URL_8453), http(process.env.FALLBACK_RPC_URL_8453)]),
    },
    baseSepolia: {
      chainId: 84532,
      maxRequestsPerSecond: 100,
      transport: fallback([http(process.env.PONDER_RPC_URL_84532), http(process.env.FALLBACK_RPC_URL_84532)]),
    },
  },
  contracts: {
    BG_Beta:
      process.env.NODE_ENV === "production"
        ? {
            network: "base",
            startBlock: 11915440,
            maxBlockRange: 1000,
            // abi: BG_Beta_0x7a30Abi,
            // NOTE: Only needed for contracts prior to euro24
            abi: mergeAbis([
              TransparentUpgradeableProxyAbi,
              BG_Beta_0xba30Abi,
              BG_Beta_0xb9f5Abi,
              BG_Beta_0xb551Abi,
              BG_Beta_0x2233Abi,
              BG_Beta_0x181fAbi,
              BG_Beta_0x5c59Abi,
              BG_Beta_0x3d80Abi,
              BG_Beta_0x44e7Abi,
              BG_Beta_0xa145Abi,
              BG_Beta_0x2a0bAbi,
              BG_Beta_0x6b52Abi,
              BG_Beta_0x7a30Abi,
            ]),
            address: [
              // NOTE: Legacy proxy contracts that have been upgraded
              "0x1304BA4137e2C4B58fBfd1cE0BC07F4c3c6F35DA", // 11915440, ncaab
              "0x2990A3046AD17270275882a516290b63Aacc7489", // 12988089, masters
              "0xeAEfe5caf86De5504f291eE2670239E183be95fB", // 13385253, nba
              "0x5b47186EE87888367055626D64090AcE63c07CaA", // 13387079, nhl
              "0x89d667Ee9071a59AA6c92199803a4cc21148B8C5", // 13854819, farcon
              "0xd58CAB19a043C014Ca9366920dA089d924e16c54", // 14447036, golf
              "0xbb916cD7707F6B5eA12D51f0E90F69797D9D1f56", // 14922090, 5aside
              "0x3366821cd41A1daA5F3734B5DAf20157D0620581", // 15104007, castout
              "0x47d74Fe9944fAB7D77f7a0342918fF753AAd706b", // 15356560, dominion
              "0x21f04a6150490D4F185B9e940B7E6ba9724a9A2f", // 15415905, icc24
              "0x0C2467cB040465d85cb5B300A8a43B7455CF67B5", // 15495230, usopengolf
              // NOTE: Below contracts have not been upgraded
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
          }
        : {
            network: "baseSepolia",
            startBlock: 11005720,
            maxBlockRange: 1000,
            abi: mergeAbis([TransparentUpgradeableProxyAbi, BG_Beta_0x4970Abi, BG_Beta_0x1001Abi]),
            address: [
              "0xc8dbF53D48e7036b824A69E500DAF3dF519B99f6", // 11005720, usopengolf
              "0x86135cda8Ea310194F75FEC947bAac01c694AC17", // 11309019, euro24
              "0x3E0DdCc2f3Adaa0e49D9517405DBEA0EC0Cfe7f4", // 12393587, opengolf
              "0xCdcB7106bEC6CFF7DAca056E86eA05EEE1630996", // 13080228, parissoccer
              "0xfe6cdBf90338bA11B829ba5baA73a4449Cf681C2", // 13080282, parissoccerw
              "0x861E60CfEb9B4aeD20eBEb4523B0f68d6f9dc97E", // 13080313, parisbball
              "0xa9a7dC4851c5E3Ac7F3ccD107644EecfE8224263", // 13080339, parisgolf
              "0x8407B357165848fFea64CBbCf740B9B9EED30B3D", // 13080378, paristennis
              "0x2910427Dd4B542d592d0e3B3363400d78aa7B5FA", // 13080459, parisgymnastics
            ],
          },
  },
})
