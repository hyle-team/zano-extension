/*global chrome*/
import React from "react";
import { useContext, useEffect, useState, useCallback } from "react";
import { Router, goTo } from "react-chrome-extension-router";
import AppPlug from "./components/AppPlug/AppPlug";
import Header from "./components/Header/Header";
import TokensTabs from "./components/TokensTabs/TokensTabs";
import AppLoader from "./components/UI/AppLoader/AppLoader";
import Wallet from "./components/Wallet/Wallet";
import ModalConfirmation from "./components/ModalConfirmation/ModalConfirmation";
import {
	comparePasswords,
	fetchBackground,
	getSessionPassword,
	passwordExists,
	setPassword,
	setSessionPassword,
} from "./utils/utils";
import {
	updateWalletConnected,
	updateActiveWalletId,
	updateWalletsList,
	updateWalletData,
	updatePriceData,
	updateLoading,
	updateConfirmationModal,
	updateTransactionStatus,
	setConnectData,
	setWhiteList,
} from "./store/actions";
import { Store } from "./store/store-reducer";
import { getZanoPrice } from "./api/coingecko";
import "./styles/App.scss";
import PasswordPage from "./components/PasswordPage/PasswordPage";
import MessageSignPage from "./components/MessageSignPage/MessageSignPage";
import AliasCreatePage from "./components/AliasCreatePage/AliasCreatePaget";
import ConnectPage from "./components/ConnectPage/ConnectPage";
import ConnectKeyUtils from "./utils/ConnectKeyUtils";
import { defaultPort } from "./config/config";
import OuterConfirmation from "./components/OuterConfirmation/OuterConfirmation";
import Formatters from "./utils/formatters";
import Big from "big.js";
import swapModalStyles from "./styles/SwapModal.module.scss";
import useGetAsset from "./hooks/useGetAsset";
import browser from "./utils/browserApi";

// Types
type dispatchType = () => void;
type destinationsType = { address: string, amount: number }[];
type transferType = { transfer: { sender: string, destination: string, destinations: destinationsType, amount: string, asset: { ticker: string }, comment?: string }, id: number };
type RequestType = { method: string; assetId: string, amount: string, destinationAddress: string, destinationChainId: string };
type SwapRequest = {
	id: string;
	swap: {
		destinationAddress: string;
		destinationAsset: string;
		destinationAssetAmount: string;
		currentAsset: string;
		currentAssetAmount: string;
	};
};
type SwapProposal = {
	to_finalizer: { amount: Big }[];
	to_initiator: { amount: Big }[];
};
type Asset = {
	decimal_point: number;
	[key: string]: any;
};
type AcceptSwapReq = {
	id: string;
	hex_raw_proposal: string;
	swapProposal: SwapProposal;
	receivingAsset: Asset;
	sendingAsset: Asset;
};

type AssetWhitelistReq = {
	id: string;
	asset_id: string;
	asset_name: string;
}

function App() {
	const { state, dispatch } = useContext(Store);
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
	const { getAssetById } = useGetAsset();

	const [incorrectPassword, setIncorrectPassword] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);

	const [firstWalletLoaded, setFirstWalletLoaded] = useState(false);

	const [connectOpened, setConnectOpened] = useState(false);

	// Flags of display
	// creatingPassword flag has an effect only in case of loggedIn flag is false.
	// creatingPassword flag means whether to show the password create screen or existing password enter screen.
	// const creatingPassword = !passwordExists();

	useEffect(() => {
		async function loadLogin() {
			const password = await getSessionPassword();
			setLoggedIn(!!password);
			if (password) {
				const connectData = ConnectKeyUtils.getConnectData(password);

				setConnectData(dispatch as dispatchType, {
					token: String(connectData?.token),
					port: String(connectData?.port),
				});
			}
		}
		loadLogin();
	}, []);

	const executeTransfer = useCallback(async () => {
		try {
			const response = await fetchBackground({
				method: "EXECUTE_BRIDGING_TRANSFER",
			});
			if (response.data.error) {
				return { sent: false, status: response.data.error };
			} else {
				return { sent: true, status: response.data.result };
			}
		} catch (error) {
			return { sent: false, status: error };
		}
	}, []);

	const closeModal = () => {
		setConfirmationModalOpen(false);
		updateConfirmationModal(dispatch as dispatchType, null);
		browser.storage.local.remove(["pendingTx"]);
		browser.action.setBadgeText({ text: "" });
	};

	const handleConfirm = async () => {
		try {
			const response = await executeTransfer();
			if (response.sent) {
				closeModal();
			} else {
				closeModal();
				console.log(response.status);
				updateTransactionStatus(dispatch as dispatchType, {
					visible: true,
					type: "error",
					code: response.status.code || 0,
					message: response.status.message || "Insufficient balance",
				});
			}
		} catch (error) {
			console.log("Error during transfer confirmation:", error);
		}
	};

	const handleCancel = () => {
		closeModal();
	};

	useEffect(() => {
		const checkConnection = async () => {
			if (!browser?.runtime?.sendMessage) return;

			const walletActive = await fetchBackground({
				method: "GET_WALLET_DATA",
			});
			updateWalletConnected(dispatch as dispatchType, !walletActive.error);
			updateLoading(dispatch as dispatchType, false);
		};

		const getWalletData = async () => {
			if (!browser?.runtime?.sendMessage) return;

			try {
				const walletsList = await fetchBackground({ method: "GET_WALLETS" });
				if (walletsList.data) {
					updateWalletsList(dispatch as dispatchType, walletsList.data);
				}

				const walletData = await fetchBackground({
					method: "GET_WALLET_DATA",
				});
				console.log("[DEBUG] walletData result:", walletData);

				if (walletData.data) {
					const { address, alias, balance, transactions, assets } = walletData.data;
					updateWalletData(dispatch as dispatchType, {
						address,
						alias,
						balance,
						assets,
						transactions,
					});
					setFirstWalletLoaded(true);
					console.log("[DEBUG] setFirstWalletLoaded called");
				} else {
					console.error("No wallet data received");
				}
			} catch (error) {
				console.error("Error fetching wallet data:", error);
			} finally {
				updateLoading(dispatch as dispatchType, false);
			}
		};

		const intervalId = setInterval(async () => {
			await checkConnection();
			console.log("connected", state.isConnected);
			if (state.isConnected && loggedIn) {
				await getWalletData();
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [dispatch, state.isConnected, state.activeWalletId, loggedIn]);

	useEffect(() => {
		async function updateWhiteList() {
			const whiteList = await fetchBackground({ method: "GET_WHITELIST" });
			if (whiteList.data) {
				setWhiteList(dispatch as dispatchType, whiteList.data);
			}
		}
		updateWhiteList();
	}, []);

	useEffect(() => {
		getZanoPrice().then((priceData) => {
			console.log("price data", priceData);
			updatePriceData(dispatch as dispatchType, priceData);
		});
	}, [dispatch]);

	useEffect(() => {
		const listener = (request: RequestType, sender: any, sendResponse: (response: { status: string }) => void) => {
			if (
				!(
					"assetId" in request &&
					"amount" in request &&
					"destinationAddress" in request &&
					"destinationChainId" in request
				)
			) {
				console.error("Invalid BRIDGING_TRANSFER request", request);
				return;
			}

			if (request.method === "BRIDGING_TRANSFER") {
				updateConfirmationModal(dispatch as dispatchType, {
					method: "SEND_TRANSFER",
					params: [
						request.assetId,
						request.amount,
						request.destinationAddress,
						request.destinationChainId,
					],
				});
				browser.storage.local.set({ pendingTx: request });
				setConfirmationModalOpen(true);
				sendResponse({ status: "confirmation_pending" });
			}
			return true;
		};

		if (typeof browser !== "undefined" && browser.runtime?.onMessage) {
			browser.runtime.onMessage.addListener(listener);
		}

		return () => {
			if (typeof browser !== "undefined" && browser.runtime?.onMessage) {
				browser.runtime.onMessage.removeListener(listener);
			}
		};
	}, [dispatch]);

	useEffect(() => {
		(async () => {
			const result = await browser.storage.local.get(["pendingTx"]);
			if (result.pendingTx) {
				updateConfirmationModal(dispatch as dispatchType, {
					method: "SEND_TRANSFER",
					params: [
						result.pendingTx.assetId,
						result.pendingTx.amount,
						result.pendingTx.destinationAddress,
						result.pendingTx.destinationChainId,
					],
				});
				setConfirmationModalOpen(true);
			}
		})();
	}, [dispatch]);

	useEffect(() => {
		(async () => {
			let walletId = 0;
			const result = await browser.storage.local.get(["key"]);
			if (!result.key) {
				await browser.storage.local.set({ key: walletId });
				console.log("Active wallet set to", walletId);
			} else {
				walletId = result.key;
			}
			fetchBackground({
				method: "SET_ACTIVE_WALLET",
				id: walletId,
			});
			updateActiveWalletId(dispatch as dispatchType, walletId);
		})();
	}, [dispatch]);

	const appConnected = !!(
		state.connectCredentials?.token || ConnectKeyUtils.getConnectKeyEncrypted()
	);

	useEffect(() => {
		async function modalLoad() {
			async function getTransferRequests() {
				const transferRes = await fetchBackground({
					method: "GET_TRANSFER_REQUEST",
				});
				const transferRequests = transferRes.data;

				const tranfserPageReqs = transferRequests.map((e: transferType) => {
					const { transfer } = e;
					const transferParams = [
						{
							key: "From",
							value: transfer.sender
								? Formatters.walletAddress(transfer.sender)
								: "???",
						},
						{
							key: "Amount",
							value: transfer.amount || "???",
						},
						{
							key: "Asset",
							value: transfer?.asset?.ticker || "???",
						},
					];

					if (!transfer.destinations || transfer.destinations.length === 0) {
						transferParams.push({
							key: "To",
							value: transfer.destination
								? Formatters.walletAddress(transfer.destination)
								: "???",
						});
					}

					if (transfer.comment) {
						transferParams.push({ key: "Comment", value: transfer.comment });
					}

					const destinations = transfer.destinations?.map((d: { address: string, amount: number }, index: number) => ({
						address: Formatters.walletAddress(d.address),
						amount: d.amount,
					})) || [];

					return {
						id: e.id,
						fee: "fee" in transfer ? transfer.fee : "???",
						method: "FINALIZE_TRANSFER_REQUEST",
						name: "Transfer",
						params: transferParams,
						destinations,
					};
				});

				if (tranfserPageReqs && tranfserPageReqs.length > 0) {
					goTo(OuterConfirmation, { reqs: tranfserPageReqs });
				}
			}


			async function getSignRequests() {
				const response = await fetchBackground({ method: "GET_SIGN_REQUESTS" });
				const signRequests = response.data;

				if (signRequests && signRequests.length > 0) {
					goTo(MessageSignPage, { signRequests });
				}
			}

			async function getAliasCreationRequests() {
				const response = await fetchBackground({
					method: "GET_ALIAS_CREATE_REQUESTS",
				});
				console.log("alias creation requests", response);
				const createRequests = response.data;

				if (createRequests && createRequests.length > 0) {
					console.log("open alias create page");
					goTo(AliasCreatePage, { createRequests });
				}
			}

			async function getIonicSwapRequests() {
				function getSwapAmountText(amount: number | Big, asset: { ticker: string }) {
					const result = (
						<>
							<span className={swapModalStyles.swapAmount}>
								{amount.toFixed()}
							</span>{" "}
							{asset.ticker}
						</>
					);

					return result;
				}

				const ionicSwapRes = await fetchBackground({
					method: "GET_IONIC_SWAP_REQUESTS",
				});
				const swapRequests = ionicSwapRes.data;

				const swapPageReqs = swapRequests.map((e: SwapRequest) => {
					const { swap } = e;

					const swapParams: ({ address: string } | any) = {};

					swapParams.address = swap.destinationAddress;

					const receivingAsset = swap.destinationAsset;
					const receivingAmount = new Big(swap.destinationAssetAmount);

					swapParams.receiving = getSwapAmountText(
						receivingAmount,
						receivingAsset as any
					);

					const sendingAsset = swap.currentAsset;
					const sendingAmount = new Big(swap.currentAssetAmount);

					swapParams.sending = getSwapAmountText(sendingAmount, sendingAsset as any);

					return {
						id: e.id,
						method: "FINALIZE_IONIC_SWAP_REQUEST",
						name: "Ionic Swap",
						params: [
							{
								key: "Address",
								value: swapParams.address
									? Formatters.walletAddress(swapParams.address)
									: "???",
							},
							{
								key: "Sending",
								value: swapParams.sending || "???",
							},
							{
								key: "Receiving",
								value: swapParams.receiving || "???",
							},
						],
					};
				});

				const ionicSwapAcceptRes = await fetchBackground({
					method: "GET_ACCEPT_IONIC_SWAP_REQUESTS",
				});
				const acceptSwapReqs = ionicSwapAcceptRes.data;

				console.log("ACCEPT SWAP", acceptSwapReqs);

				const acceptPageReqs = await Promise.all(
					acceptSwapReqs.map(async (e: AcceptSwapReq) => {
						const hex_raw_proposal = e?.hex_raw_proposal;

						const swap = e?.swapProposal;

						const swapParams: ({ receiving: string } | any) = {};

						function toBigWithDecimal(amount: Big, decimalPoint: number) {
							if (amount) {
								return new Big(amount).div(new Big(10).pow(decimalPoint));
							}
						}

						if (swap) {
							const receivingAsset = e?.receivingAsset;
							const receivingAmount = toBigWithDecimal(
								swap.to_finalizer[0]?.amount,
								receivingAsset.decimal_point
							);

							if (receivingAmount !== undefined) {
								swapParams.receiving = getSwapAmountText(
									receivingAmount,
									receivingAsset as any
								);
							}

							const sendingAsset = e?.sendingAsset;
							const sendingAmount = toBigWithDecimal(
								swap.to_initiator[0]?.amount,
								sendingAsset.decimal_point
							);

							if (sendingAmount !== undefined) {
								swapParams.sending = getSwapAmountText(
									sendingAmount,
									sendingAsset as any
								);
							}
						}

						return {
							id: e.id,
							method: "FINALIZE_ACCEPT_IONIC_SWAP_REQUEST",
							name: "Accept Ionic Swap",
							params: [
								{
									key: "Hex Proposal",
									value: Formatters.walletAddress(hex_raw_proposal),
								},
								{
									key: "Sending",
									value: swapParams.sending || "???",
								},
								{
									key: "Receiving",
									value: swapParams.receiving || "???",
								},
							],
						};
					})
				);

				const pageReqs = [...swapPageReqs, ...acceptPageReqs];

				if (pageReqs && pageReqs.length > 0) {
					goTo(OuterConfirmation, { reqs: pageReqs });
				}
			}

			async function getAssetWhitelistAddRequests() {
				try {
					const response = await fetchBackground({ method: "GET_ASSETS_WHITELIST_ADD_REQUESTS" });
					const assetWhitelistAddRequests = response.data?.map((request: AssetWhitelistReq) => {
						return {
							id: request.id,
							method: "FINALIZE_ASSETS_WHITELIST_ADD_REQUESTS",
							name: "Confirm adding asset to whitelist",
							params: [
								{
									key: "Asset id",
									value: Formatters.walletAddress(request.asset_id),
								},
								{
									key: "Asset name",
									value: request.asset_name,
								}
							]

						}
					})
					if (assetWhitelistAddRequests && assetWhitelistAddRequests.length > 0) {
						goTo(OuterConfirmation, { reqs: assetWhitelistAddRequests });
					}
				} catch (e) {
					console.error(e);
				}
			}

			await getAliasCreationRequests();
			await getIonicSwapRequests();
			await getSignRequests();
			await getTransferRequests();
			await getAssetWhitelistAddRequests()
		}

		if (appConnected && !connectOpened && loggedIn && state.isConnected) {
			modalLoad();
		}
	}, [
		appConnected,
		connectOpened,
		loggedIn,
		state.isConnected,
		state.wallet?.assets,
	]);

	useEffect(() => {
		console.log("connectCredentials", state.connectCredentials);
		if (state.connectCredentials.token) {
			fetchBackground({
				method: "SET_API_CREDENTIALS",
				credentials: {
					token: state.connectCredentials.token,
					port: state?.connectCredentials?.port || defaultPort,
				} as any,
			});
		}
	}, [state.connectCredentials]);

	function PasswordPages() {
		return (
			<PasswordPage
				incorrectPassword={incorrectPassword}
				setIncorrectPassword={setIncorrectPassword}
				onConfirm={(password) => {
					console.log(password, comparePasswords(password));
					if (comparePasswords(password)) {
						updateLoading(dispatch as dispatchType, true);

						setTimeout(() => {
							updateLoading(dispatch as dispatchType, false);
						}, 2000);

						setLoggedIn(true);
						setSessionPassword(password);
						const connectData = ConnectKeyUtils.getConnectData(password);
						console.log("connectData", connectData);
						if (connectData?.token) {
							setConnectData(dispatch as dispatchType, {
								token: connectData.token,
								port: connectData.port,
							});
						}
					} else {
						setIncorrectPassword(true);
					}
				}}
			/>
		);
	}

	return (
		<div className="App">
			<>
				<ModalConfirmation
					isOpen={confirmationModalOpen}
					onClose={handleCancel}
					onConfirm={handleConfirm}
				/>
				{loggedIn && state.isConnected && <Header />}
				<AppLoader firstWalletLoaded={firstWalletLoaded} loggedIn={loggedIn} />

				{appConnected && !connectOpened ? (
					loggedIn ? (
						state.isConnected ? (
							<div className="container">
								<Router>
									<Wallet setConnectOpened={setConnectOpened} />
									<TokensTabs />
								</Router>
							</div>
						) : (
							<AppPlug setConnectOpened={setConnectOpened} />
						)
					) : (
						PasswordPages()
					)
				) : (
					<ConnectPage
						incorrectPassword={incorrectPassword}
						setIncorrectPassword={setIncorrectPassword}
						passwordExists={passwordExists()}
						setConnectOpened={setConnectOpened}
						onConfirm={async (inputPassword, connectKey, walletPort) => {
							const password = inputPassword || (await getSessionPassword());

							if (!password) return;
							setPassword(password);

							if (connectKey)
								ConnectKeyUtils.setConnectData(
									connectKey,
									String(walletPort),
									password
								);
							setLoggedIn(true);
							await setSessionPassword(password);
						}}
					/>
				)}
			</>
		</div>
	);
}

export default App;