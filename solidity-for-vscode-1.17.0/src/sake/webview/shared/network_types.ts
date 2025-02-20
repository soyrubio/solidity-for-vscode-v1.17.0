import type { AbiFunctionFragment, Address, HexString, TransactionReceipt } from 'web3-types';
import type {
    WakeCallTrace,
    WakeGetBytecodeResponse,
    WakeGetBytecodeRequestParams
} from './wake_types';

interface Transaction {
    success: boolean;
    receipt?: TransactionReceipt;
    callTrace: WakeCallTrace | null; // @hotfix: this is currently undefined in the response
    error?: string; // @dev wake returns a user-friendly error message as string
    events?: string[]; // @dev wake returns a list of events as strings
}

export enum CallType {
    Call = 'Call',
    Transact = 'Transact'
}

export enum CallOperation {
    Deployment = 'Deployment',
    FunctionCall = 'Function Call'
}

/* Compilation */

export type GetBytecodeRequest = WakeGetBytecodeRequestParams;
export type GetBytecodeResponse = WakeGetBytecodeResponse;

/* Account Management */

export interface SetAccountBalanceRequest {
    address: Address;
    balance: number;
}

export interface SetAccountBalanceResponse {
    success: boolean;
}

export interface SetAccountLabelRequest {
    address: Address;
    label?: string;
}

/* Deployment */

export interface DeploymentRequest {
    contractFqn: string;
    sender: Address;
    calldata: HexString;
    value: string; // @dev encoded bigint
}

export interface DeploymentResponse extends Transaction {
    deployedAddress: Address;
    error?: string;
    events?: string[];
}

/* Call */

export interface CallRequest {
    to: Address;
    from: Address;
    calldata: HexString;
    value: string; // @dev encoded bigint
    callType?: CallType;
    functionAbi: AbiFunctionFragment;
}

export interface CallResponse extends Transaction {
    returnValue: HexString;
}

/* Transact */

export interface TransactRequest extends CallRequest {}

export interface TransactResponse extends CallResponse {}

/* Network Configuration */

export interface NetworkConfiguration {
    sessionId: string;
    type?: string;
    uri?: string;
    chainId?: number;
    fork?: string;
    hardfork?: string;
    minGasPrice?: number;
    blockBaseFeePerGas?: number;
}
export interface CreateLocalChainRequest {
    sessionId: string;
    accounts?: number;
    chainId?: number;
    fork?: string;
    hardfork?: string;
    minGasPrice?: number;
    blockBaseFeePerGas?: number;
}

export interface NetworkCreationConfiguration extends Omit<CreateLocalChainRequest, 'sessionId'> {}
export interface NetworkConnectionConfiguration {}
