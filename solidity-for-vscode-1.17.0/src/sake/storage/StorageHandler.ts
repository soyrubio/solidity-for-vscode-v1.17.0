import * as vscode from 'vscode';
import { SakeContext } from '../context';
import { sakeProviderManager } from '../sake_providers/SakeProviderManager';
import { StoredSakeState } from '../webview/shared/storage_types';

export class StorageHandler {
    static readonly storageFolder = ['.wake', 'extension'];

    static async hasAnySavedState() {
        const state = await this.loadFromWorkspaceFolder('state.json');
        return state != undefined;
    }

    static async loadExtensionState(notifyUser: boolean = true) {
        try {
            const state = await this.getExtensionState();

            if (state == undefined) {
                throw new Error('State file not found');
            }

            await sakeProviderManager.loadState(state, notifyUser);
        } catch (e) {
            console.error('Failed to load state:', e);
            if (notifyUser) {
                vscode.window.showErrorMessage(
                    `Failed to load state: ${e instanceof Error ? e.message : String(e)}`
                );
            }
        }
    }

    static async getExtensionState(): Promise<StoredSakeState | undefined> {
        return await this.loadFromWorkspaceFolder('state.json')
            .then((state) => {
                if (state == undefined) {
                    throw new Error('State file not found');
                }
                return JSON.parse(state);
            })
            .catch((e) => {
                console.error('Failed to load state:', e);
                return undefined;
            });
    }

    static async saveExtensionState(notifyUser: boolean = true) {
        const state = await sakeProviderManager.dumpState().catch((e) => {
            if (notifyUser) {
                vscode.window.showErrorMessage(
                    `Failed to dump state: ${e instanceof Error ? e.message : String(e)}`
                );
            }
            return undefined;
        });

        if (state == undefined) {
            return;
        }

        // @dev BigInt fails to be serialized by JSON.stringify
        // see https://github.com/GoogleChromeLabs/jsbi/issues/30
        const encodedState = JSON.stringify(state, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );

        // also save to storageUri
        try {
            await this.saveToWorkspaceFolder('state.json', encodedState);
            if (notifyUser) {
                vscode.window.showInformationMessage('Extension state saved');
            }
        } catch (e) {
            if (notifyUser) {
                vscode.window.showErrorMessage(
                    `Failed to save state: ${e instanceof Error ? e.message : String(e)}`
                );
            }
        }
    }

    static async deleteExtensionState() {
        await this.deleteFromWorkspaceFolder('state.json');
    }

    private static async saveToWorkspaceFolder(filename: string, json: string) {
        // save to workspace folder
        // create workspace folder if it doesn't exist
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
        if (workspaceFolder == undefined) {
            throw new Error('Workspace folder is undefined');
        }

        const solidityFolder = vscode.Uri.joinPath(workspaceFolder, ...this.storageFolder);

        // check if .solidity folder exists
        await vscode.workspace.fs.createDirectory(solidityFolder);

        const file = vscode.Uri.joinPath(solidityFolder, filename);
        await vscode.workspace.fs.writeFile(file, new TextEncoder().encode(json));
    }

    private static async loadFromWorkspaceFolder(filename: string): Promise<string | undefined> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
        if (workspaceFolder == undefined) {
            throw new Error('Workspace folder is undefined');
        }

        const solidityFolder = vscode.Uri.joinPath(workspaceFolder, ...this.storageFolder);
        const file = vscode.Uri.joinPath(solidityFolder, filename);

        try {
            const content = await vscode.workspace.fs.readFile(file);
            return new TextDecoder().decode(content);
        } catch (e) {
            return undefined;
        }
    }

    private static async deleteFromWorkspaceFolder(filename: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
        if (workspaceFolder == undefined) {
            throw new Error('Workspace folder is undefined');
        }

        const solidityFolder = vscode.Uri.joinPath(workspaceFolder, ...this.storageFolder);
        const file = vscode.Uri.joinPath(solidityFolder, filename);
        await vscode.workspace.fs.delete(file);
    }

    private static get context() {
        return SakeContext.getInstance().context;
    }
}
