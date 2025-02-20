import type { Address, ContractAbi, ExtendedAccount, TransactionResult } from './types';

export enum StateId {
    DeployedContracts = 'DeployedContracts',
    CompiledContracts = 'CompiledContracts',
    Accounts = 'Accounts',
    TransactionHistory = 'TransactionHistory',
    Chain = 'Chain',
    App = 'App',
    Sake = 'Sake'
}

/* Account */

export type AccountState = ExtendedAccount[];

/* Deployment */

export enum DeployedContractType {
    Compiled = 'compiled',
    OnChain = 'onchain'
}

export interface ImplementationContract {
    id: string;
    abi: ContractAbi;
    address?: Address;
    name?: string;
}

type BaseDeployedContract = {
    type: DeployedContractType;
    name: string;
    address: Address;
    balance?: number;
    abi: ContractAbi;
    proxyFor?: ImplementationContract[];
} & Omit<ExtendedAccount, 'balance'>;

export type DeployedContract =
    | ({
          type: DeployedContractType.Compiled;
          fqn: string;
      } & BaseDeployedContract)
    | ({
          type: DeployedContractType.OnChain;
      } & BaseDeployedContract);

export type DeploymentState = DeployedContract[];

/* Compilation */

export enum CompilationIssueType {
    Error = 'Error',
    Skipped = 'Skipped'
}

export interface CompilationErrorSpecific {
    message: string;
    path: string;
    startOffset?: number;
    endOffset?: number;
}

export interface CompilationIssue {
    type: CompilationIssueType;
    fqn: string;
    errors: CompilationErrorSpecific[];
}

export interface CompiledContract {
    fqn: string;
    name: string;
    abi: ContractAbi;
    isDeployable: boolean;
}

export interface CompilationState {
    contracts: CompiledContract[];
    issues: CompilationIssue[];
    dirty: boolean;
}

/* Chain */

export interface AppState {
    isAnvilInstalled?: boolean;
    isWakeServerRunning?: boolean;
    isOpenWorkspace: 'open' | 'closed' | 'tooManyWorkspaces' | undefined;
    initializationState: 'initializing' | 'loadingChains' | 'ready' | undefined;
}

export enum NetworkType {
    Local = 'Local Chain'
}

export type NetworkInfo = {
    type: NetworkType.Local;
    uri?: string;
    chainId?: number;
    fork?: string;
};

export interface ChainState {
    chains: ChainInfo[];
    currentChainId: string | undefined;
}

export interface ChainInfo {
    chainId: string;
    chainName: string;
    network: NetworkInfo;
    connected: boolean;
}

/* Transaction History */

export type TransactionHistoryState = TransactionResult[];
