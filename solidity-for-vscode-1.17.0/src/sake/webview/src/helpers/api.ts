import { messageHandler } from '@estruyf/vscode/dist/client';
import {
    type CallRequest,
    type WakeDeploymentRequestParams,
    type WakeSetBalancesRequestParams,
    type CompiledContract,
    type WakeGetBytecodeResponse,
    WebviewMessageId,
    type WebviewMessageRequest,
    type Address,
    type DeployedContract,
    type GetBytecodeResponse,
    type NetworkCreationConfiguration,
    type WebviewMessageResponsePayload
} from '../../shared/types';
import { deployedContracts } from './stores';

export function ping(): Promise<boolean> {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.ping,
        payload: undefined
    };
    return messageHandler.request<boolean>(request.command, request.payload);
}

export function copyToClipboard(stringToCopy: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.copyToClipboard,
        payload: stringToCopy
    };
    messageHandler.send(request.command, request.payload);
}

export function setBalance(address: string, balance: number) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.setBalance,
        payload: {
            address,
            balance
        }
    };

    messageHandler.send(request.command, request.payload);
}

export function functionCall(payload: CallRequest) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.contractFunctionCall,
        payload: payload
    };

    messageHandler.send(request.command, request.payload);
}

export function deployContract(
    contractFqn: string,
    sender: string,
    calldata: string,
    value: bigint
) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.deploy,
        payload: {
            contractFqn,
            sender,
            calldata,
            value: value.toString()
        }
    };

    messageHandler.send(request.command, request.payload);
}

export function showErrorMessage(message: string) {
    messageHandler.send(WebviewMessageId.showError, message);
}

export function showInfoMessage(message: string) {
    messageHandler.send(WebviewMessageId.showInfo, message);
}

export async function getInputFromTopBar(
    value: string = '',
    title: string | undefined = undefined
) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.getTextFromInputBox,
        payload: {
            value,
            title
        }
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.getTextFromInputBox> =
        await messageHandler.request(request.command, request.payload);
    return response;
}

export async function compileContracts() {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.compile,
        payload: undefined
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.compile> =
        await messageHandler.request(request.command, request.payload);
    return response;
}

export async function removeDeployedContract(address: Address) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.undeployContract,
        payload: address
    };
    messageHandler.send(request.command, request.payload);
}

export function setLabel(address: Address, label: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.setLabel,
        payload: {
            address,
            label
        }
    };
    messageHandler.send(request.command, request.payload);
}

export async function requestLabel(address: Address) {
    const label = await getInputFromTopBar('', 'New Label');
    if (!label || label.value === undefined) {
        return;
    }
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.setLabel,
        payload: {
            address,
            label: label.value
        }
    };
    messageHandler.send(request.command, request.payload);
}

export async function navigateTo(
    path: string,
    startOffset: number | undefined,
    endOffset: number | undefined
) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.navigate,
        payload: { path, startOffset, endOffset }
    };
    messageHandler.send(request.command, request.payload);
}

export async function openExternal(url: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.openExternal,
        payload: {
            path: url
        }
    };
    messageHandler.send(request.command, request.payload);
}

export async function openSettings(settingsUrl: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.openSettings,
        payload: settingsUrl
    };
    messageHandler.send(request.command, request.payload);
}

export async function getBytecode(contractFqn: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.getBytecode,
        payload: {
            contractFqn
        }
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.getBytecode> =
        await messageHandler.request(request.command, request.payload);
    return response;
}

// export async function requestNewProvider() {
//     const request: WebviewMessageRequest = {
//         command: WebviewMessageId.requestNewProvider,
//         payload: undefined
//     };
//     messageHandler.send(request.command, request.payload);
// }

// export async function selectChain(chainId: string) {
//     const request: WebviewMessageRequest = {
//         command: WebviewMessageId.selectChain,
//         payload: undefined
//     };
//     messageHandler.send(request.command, request.payload);
// }

export async function restartWakeServer() {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.restartWakeServer,
        payload: undefined
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.restartWakeServer> =
        await messageHandler.request(request.command, request.payload);
    return response;
}

export function openChainsQuickPick() {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.openChainsQuickPick,
        payload: undefined
    };
    messageHandler.send(request.command, request.payload);
}

export function openAddAbiQuickPick(contractAddress: Address) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.openAddAbiQuickPick,
        payload: {
            contractAddress
        }
    };
    messageHandler.send(request.command, request.payload);
}

export function removeProxy(contractAddress: Address, proxyId: string) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.removeProxy,
        payload: {
            contractAddress,
            proxyId
        }
    };
    messageHandler.send(request.command, request.payload);
}

export function requestAddDeployedContract() {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.requestAddDeployedContract,
        payload: undefined
    };
    messageHandler.send(request.command, request.payload);
}

export async function reconnectChain(): Promise<boolean> {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.reconnectChain,
        payload: undefined
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.reconnectChain> =
        await messageHandler.request(request.command, request.payload);
    return response.success;
}

export async function createNewLocalChain(
    displayName: string,
    networkCreationConfig?: NetworkCreationConfiguration,
    onlySuccessful: boolean = false
) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.createNewLocalChain,
        payload: {
            displayName,
            networkCreationConfig,
            onlySuccessful
        }
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.createNewLocalChain> =
        await messageHandler.request(request.command, request.payload);
    return response;
}

export async function connectToLocalChain(
    displayName: string,
    uri: string,
    onlySuccessful: boolean = false
) {
    const request: WebviewMessageRequest = {
        command: WebviewMessageId.connectToLocalChain,
        payload: {
            displayName,
            uri,
            onlySuccessful
        }
    };
    const response: WebviewMessageResponsePayload<WebviewMessageId.connectToLocalChain> =
        await messageHandler.request(request.command, request.payload);
    return response;
}
