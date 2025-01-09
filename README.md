# Project Description
This repository contains the latest v1.17.0 version of the [Solidity (Wake) extension for VS Code](https://marketplace.visualstudio.com/items?itemName=AckeeBlockchain.tools-for-solidity).

Since the extension version is not yet released this repository joins the extension with all required dependencies for it. The extension can be manually installed from the `.vsix` file. It is important to note that this version of the extension is only compatible with a specific version of Wake, which supports the newly implemented API calls. This version has also not yet been published as of the time of writing. Both the specific Wake implementation and the extension are available within this repository.

## Installation

First, install Wake by running the following command in the `./wake` directory:
```
pip install -e .
```
Once installed, the Wake LSP server can be started by running the following command:
```
wake lsp
```
Wake will run on port `65432` by default.

Install the extension from the `.vsix` file via running the following command from the command palette:
```
Extensions: Install from VSIX...
(CommandID: workbench.extensions.action.installVSIX)
```
Select the `solidity-for-vscode-1.17.0.vsix` file from the thesis attachments.

Additionally, please make sure that you have Foundry's Anvil installed. For details see the [Foundry documentation](https://book.getfoundry.sh/getting-started/installation).

## References
`./wake` is cloned from [https://github.com/Ackee-Blockchain/wake/tree/1f50b37ae1946bc8d4e5ce49d6d883ed2090fd63](https://github.com/Ackee-Blockchain/wake/commit/1f50b37ae1946bc8d4e5ce49d6d883ed2090fd63)

`./solidity-for-vscode` is cloned from [https://github.com/Ackee-Blockchain/solidity-for-vscode/tree/ea1f7ae937f99afe75c94964ab8a73b58c236839](https://github.com/Ackee-Blockchain/solidity-for-vscode/tree/ea1f7ae937f99afe75c94964ab8a73b58c236839)