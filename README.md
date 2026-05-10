# Zano Companion

Zano Companion is a browser extension that enhances your experience with Zano-based dApps by providing seamless wallet integration, transaction signing, and more.

## Features

- Connect your Zano wallet to web applications securely.
- Sign transactions and messages directly from the extension.
- Easily access your balance and transaction history.
- Compatible with dApps in the Zano ecosystem.

## Installation

### Chrome Web Store

Install Zano Companion from the [Chrome Web Store](https://chromewebstore.google.com/detail/zano-companion/akcgnllhhhkcpmlenfpicmcpgfpindlb)

### Manual Installation

If you prefer to install manually:

- Download the latest release from [GitHub Releases](https://github.com/hyle-team/zano-extension/releases).
- Extract the archive.
- Open Chrome and navigate to chrome://extensions/.
- Enable Developer mode (top-right corner).
- Click Load unpacked and select the extracted folder.

## Usage

Open the extension and connect your Zano wallet.
Approve connection requests from supported dApps.
Sign transactions securely.

## Patch note: Permission system update

After this branch is merged, connecting a dApp will require reviewing the exact access it is requesting before you continue.

- Connection approvals are now permission-based, so a site can request wallet access, balance access, and transaction history access separately.
- The approval popup now shows the requested permissions before you allow or deny the connection.
- Permissions are stored per site and per active wallet address, so switching to a different account/address can trigger a new access request.
- If a site already has the permissions it needs for the current address, it can reconnect without asking again; requesting extra access will open a new approval prompt.
- Transaction and signing approvals are still separate, so a connected site cannot move funds without your explicit confirmation.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT License
