const { buildDelegatingAccessAddDelegateInitFunction } = require('@paypr/ethereum-contracts/dist/src/contracts/access');
const {
  buildERC721AddHooksInitFunction,
  buildERC721TokenInfoInitFunction,
} = require('@paypr/ethereum-contracts/dist/src/contracts/artifacts');
const {
  buildContractInfoInitializeInitFunction,
} = require('@paypr/ethereum-contracts/dist/src/contracts/contractInfo');
const {
  buildDiamondFacetCut,
  buildDiamondInitFunction,
} = require('@paypr/ethereum-contracts/dist/src/contracts/diamonds');
const {
  ERC721EnumerableFacet__factory,
  ERC721EnumerableHooks__factory,
  ERC721Facet__factory,
  ERC721Init__factory,
  ERC721SoulboundHooks__factory,
  ERC721TokenInfoFacet__factory,
  ERC721TokenInfoInit__factory,
} = require('@paypr/ethereum-contracts/dist/types/contracts');
const {
  buildMessageContentLimitsInitSetMaxContentLengthFunction,
} = require('../dist/src/contracts/messages/messageContentLimits');
const { buildMessageCostInitSetBasicCostFunction } = require('../dist/src/contracts/messages/messageCost');
const {
  BasicMessageCostERC721Hooks__factory,
  BasicMessageCostFacet__factory,
  LikableFacet__factory,
  MessageContentLimitsERC721Hooks__factory,
  MessageContentLimitsFacet__factory,
  MessageContentLimitsInit__factory,
  MessageCostInit__factory,
  MessageFacet__factory,
  MessageRepliesFacet__factory,
} = require('../dist/types/contracts');
const {
  ContractInfoFacet__factory,
  ContractInfoInit__factory,
  DelegatingAccessCheckFacet__factory,
  DelegatingAccessFacet__factory,
  DelegatingAccessInit__factory,
  DiamondCutFacet__factory,
  DiamondInit__factory,
  DiamondLoupeFacet__factory,
  ERC165Facet__factory,
  TransferFacet__factory,
} = require('@paypr/ethereum-contracts/dist/types/contracts');
const { parseEther } = require('ethers/lib/utils');

const accessControlDelegateAddress = '0x0000000000000000000000000000000000000000';
const name = 'MessageNFT';
const baseUri = 'https://example.xyz/metadata/';
const costInWei = parseEther('1.00');
const maxLength = 200;

const contractInfoFacet = new ContractInfoFacet__factory().attach('0x0000000000000000000000000000000000000000');
const contractInfoInit = new ContractInfoInit__factory().attach('0x0000000000000000000000000000000000000000');
const delegatingAccessCheckFacet = new DelegatingAccessCheckFacet__factory().attach(
  '0x0000000000000000000000000000000000000000',
);
const delegatingAccessFacet = new DelegatingAccessFacet__factory().attach('0x0000000000000000000000000000000000000000');
const delegatingAccessInit = new DelegatingAccessInit__factory().attach('0x0000000000000000000000000000000000000000');
const diamondCutFacet = new DiamondCutFacet__factory().attach('0x0000000000000000000000000000000000000000');
const diamondLoupeFacet = new DiamondLoupeFacet__factory().attach('0x0000000000000000000000000000000000000000');
const diamondInit = new DiamondInit__factory().attach('0x0000000000000000000000000000000000000000');
const erc721Facet = new ERC721Facet__factory().attach('0x0000000000000000000000000000000000000000');
const erc721Init = new ERC721Init__factory().attach('0x0000000000000000000000000000000000000000');
const erc721EnumerableFacet = new ERC721EnumerableFacet__factory().attach('0x0000000000000000000000000000000000000000');
const erc721EnumerableHooks = new ERC721EnumerableHooks__factory().attach('0x0000000000000000000000000000000000000000');
const erc721SoulboundHooks = new ERC721SoulboundHooks__factory().attach('0x0000000000000000000000000000000000000000');
const erc721TokenInfoFacet = new ERC721TokenInfoFacet__factory().attach('0x0000000000000000000000000000000000000000');
const erc721TokenInfoInit = new ERC721TokenInfoInit__factory().attach('0x0000000000000000000000000000000000000000');
const erc165Facet = new ERC165Facet__factory().attach('0x0000000000000000000000000000000000000000');
const messageFacet = new MessageFacet__factory().attach('0x0000000000000000000000000000000000000000');
const messageRepliesFacet = new MessageRepliesFacet__factory().attach('0x0000000000000000000000000000000000000000');
const basicMessageCostFacet = new BasicMessageCostFacet__factory().attach('0x0000000000000000000000000000000000000000');
const basicMessageCostErc721Hooks = new BasicMessageCostERC721Hooks__factory().attach(
  '0x0000000000000000000000000000000000000000',
);
const messageCostInit = new MessageCostInit__factory().attach('0x0000000000000000000000000000000000000000');
const likableFacet = new LikableFacet__factory().attach('0x0000000000000000000000000000000000000000');
const messageContentLimitsFacet = new MessageContentLimitsFacet__factory().attach(
  '0x0000000000000000000000000000000000000000',
);
const messageContentLimitsInit = new MessageContentLimitsInit__factory().attach(
  '0x0000000000000000000000000000000000000000',
);
const messageContentLimitsErc721Hooks = new MessageContentLimitsERC721Hooks__factory().attach(
  '0x0000000000000000000000000000000000000000',
);
const transferFacet = new TransferFacet__factory().attach('0x0000000000000000000000000000000000000000');

const args = {
  diamondCuts: [
    buildDiamondFacetCut(erc165Facet),
    buildDiamondFacetCut(diamondCutFacet),
    buildDiamondFacetCut(diamondLoupeFacet),
    buildDiamondFacetCut(contractInfoFacet),
    buildDiamondFacetCut(delegatingAccessCheckFacet),
    buildDiamondFacetCut(delegatingAccessFacet),
    buildDiamondFacetCut(erc721Facet),
    buildDiamondFacetCut(erc721EnumerableFacet),
    buildDiamondFacetCut(erc721TokenInfoFacet),
    buildDiamondFacetCut(messageFacet),
    buildDiamondFacetCut(messageRepliesFacet),
    buildDiamondFacetCut(basicMessageCostFacet),
    buildDiamondFacetCut(messageContentLimitsFacet),
    buildDiamondFacetCut(likableFacet),
    buildDiamondFacetCut(transferFacet),
  ],
  initFunction: buildDiamondInitFunction(diamondInit, [
    buildDelegatingAccessAddDelegateInitFunction(delegatingAccessInit, accessControlDelegateAddress),
    buildContractInfoInitializeInitFunction(contractInfoInit, {
      name,
      description: 'Messages on chain',
    }),
    buildERC721TokenInfoInitFunction(erc721TokenInfoInit, baseUri, true),
    buildMessageCostInitSetBasicCostFunction(messageCostInit, costInWei),
    buildMessageContentLimitsInitSetMaxContentLengthFunction(messageContentLimitsInit, maxLength),
    buildERC721AddHooksInitFunction(erc721Init, erc721EnumerableHooks),
    buildERC721AddHooksInitFunction(erc721Init, erc721SoulboundHooks),
    buildERC721AddHooksInitFunction(erc721Init, basicMessageCostErc721Hooks),
    buildERC721AddHooksInitFunction(erc721Init, messageContentLimitsErc721Hooks),
  ]),
};

module.exports = [args];
