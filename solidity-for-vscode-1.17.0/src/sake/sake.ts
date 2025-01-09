import * as vscode from 'vscode';
import { LanguageClient, State } from 'vscode-languageclient/node';
import { copyToClipboardHandler } from '../commands';
import { copyToClipboard, getTextFromInputBox, showErrorMessage } from './commands';
import { SakeContext } from './context';
import { SakeOutputItem } from './providers/OutputTreeProvider';
import { SakeWebviewProvider } from './providers/WebviewProviders';
import { providerRegistry } from './sake_providers/ProviderRegistry';
import { sakeProviderManager } from './sake_providers/SakeProviderManager';
import { appState } from './state/AppStateProvider';
import { StorageHandler } from './storage/StorageHandler';
import { pingWakeServer } from './utils/helpers';
import {
    CallRequest,
    DeploymentRequest,
    GetBytecodeRequest,
    SetAccountBalanceRequest,
    SetAccountLabelRequest,
    WakeCrashDumpStateResponse
} from './webview/shared/types';
export async function activateSake(context: vscode.ExtensionContext, client: LanguageClient) {
    /* Register Context */
    const sakeContext = SakeContext.getInstance();
    sakeContext.context = context;
    sakeContext.client = client;

    /* Initialize Chain and App State */
    appState.setLazy({
        initializationState: 'initializing'
    });

    appState.setLazy({
        isWakeServerRunning: client.state === State.Running && (await pingWakeServer())
    });
    client.onDidChangeState((state) => {
        appState.setLazy({ isWakeServerRunning: state.newState === State.Running });
    });

    // set provider automatically when no provider is set
    providerRegistry.subscribeAdd((id) => {
        if (sakeProviderManager.currentChainId === undefined) {
            sakeProviderManager.setProvider(id);
        }
    });

    /* Register Webview */
    const sidebarSakeProvider = new SakeWebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sake', sidebarSakeProvider)
    );

    /* Register Webview Provider for Context */
    sakeContext.webviewProvider = sidebarSakeProvider;

    /* Workspace watcher */
    const workspaceWatcher = () => {
        const workspaces = vscode.workspace.workspaceFolders;
        if (workspaces === undefined || workspaces.length === 0) {
            appState.setLazy({
                isOpenWorkspace: 'closed'
            });
            return;
        } else if (workspaces.length > 1) {
            appState.setLazy({
                isOpenWorkspace: 'tooManyWorkspaces'
            });
            return;
        }

        appState.setLazy({
            isOpenWorkspace: 'open'
        });
    };

    // check if workspace is open
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
        workspaceWatcher();
    });

    workspaceWatcher();

    /* Wake Crash Dump */

    client.onNotification('wake/sake/dumpState', (dump: WakeCrashDumpStateResponse) => {
        // StorageHandler.saveExtensionState(dump.chain_dump);
    });

    /* Register Commands */

    registerCommands(context);

    /* Load Chains */
    console.log('loading chains');
    appState.setLazy({
        initializationState: 'loadingChains'
    });

    await loadChains();

    console.log('setting ready');
    appState.setLazy({
        initializationState: 'ready'
    });
}

export function deactivateSake() {
    const sakeContext = SakeContext.getInstance();
    console.log('deactivating sake');
    sakeContext.context?.workspaceState.update('sake', 'deactivated');
    console.log(sakeContext.context?.workspaceState.get('sake'));
    StorageHandler.saveExtensionState(false);
}

async function loadChains() {
    // Check if there is was any state saved
    if (await StorageHandler.hasAnySavedState()) {
        await StorageHandler.loadExtensionState(false).catch((e) => {
            showErrorMessage(
                'Saved extension state could not be loaded. Chain state save file was found but seems to be corrupted and could not be loaded.'
            );
            console.error('Failed to load saved state', e);
        });
    } else {
        // Start with a default local chain
        await sakeProviderManager.createNewLocalChain('Local Chain 1');
    }
}

function registerCommands(context: vscode.ExtensionContext) {
    // register commands
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'sake.copyToClipboard',
            async (text: string) => await copyToClipboardHandler(text)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'sake.getTextFromInputBox',
            async (initialValue: string) => await getTextFromInputBox(initialValue)
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('Tools-for-Solidity.sake.compile', () =>
            sakeProviderManager.provider?.compile()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('Tools-for-Solidity.sake.show_history', () =>
            sakeProviderManager.state?.history.show()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'Tools-for-Solidity.sake.copyFromResults',
            (context: SakeOutputItem) => copyToClipboard(context.value)
        )
    );

    vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.languageId == 'solidity' && !e.document.isDirty) {
            sakeProviderManager.state?.compilation.makeDirty();
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('Tools-for-Solidity.sake.save-state', () =>
            StorageHandler.saveExtensionState()
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('Tools-for-Solidity.sake.delete-state', () =>
            StorageHandler.deleteExtensionState()
        )
    );
}
