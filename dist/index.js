"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const timeout = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
function launch(puppeteer, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { args } = options, rest = __rest(options, ["args"]);
        const { metamaskVersion, metamaskPath } = options;
        const METAMASK_VERSION = metamaskVersion || '8.0.10';
        console['log'](path.join(__dirname, `metamask/${METAMASK_VERSION}`));
        const METAMASK_PATH = metamaskPath || path.resolve(__dirname, '..', 'metamask', METAMASK_VERSION);
        return puppeteer.launch(Object.assign({ headless: false, args: [
                `--disable-extensions-except=${METAMASK_PATH}`,
                `--load-extension=${METAMASK_PATH}`,
                ...(args || [])
            ] }, rest));
    });
}
exports.launch = launch;
function getMetamask(browser, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const metamaskPage = yield closeHomeScreen(browser);
        // const metamaskPage = await getMetamaskPage(browser, options.extensionId, options.extensionUrl)
        yield confirmWelcomeScreen(metamaskPage);
        yield importAccount(metamaskPage, options.seed || 'already turtle birth enroll since owner keep patch skirt drift any dinner', options.password || 'password1234');
        let signedIn = true;
        closeNotificationPage(browser);
        return {
            lock: () => __awaiter(this, void 0, void 0, function* () {
                if (!signedIn) {
                    throw new Error("You can't sign out because you haven't signed in yet");
                }
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitFor('.identicon');
                yield accountSwitcher.click();
                const signoutButton = yield metamaskPage.waitFor('.account-menu__logout-button');
                yield signoutButton.click();
                yield waitForSignInScreen(metamaskPage);
                signedIn = false;
            }),
            unlock: (password = 'password1234') => __awaiter(this, void 0, void 0, function* () {
                if (signedIn) {
                    throw new Error("You can't sign in because you are already signed in");
                }
                yield metamaskPage.bringToFront();
                const passwordBox = yield metamaskPage.waitFor('#password');
                yield passwordBox.type(password);
                const login = yield metamaskPage.waitFor('.unlock-page button');
                yield login.click();
                yield waitForUnlockedScreen(metamaskPage);
                signedIn = true;
            }),
            addNetwork: (url) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const networkSwitcher = yield metamaskPage.waitFor('.network-indicator');
                yield networkSwitcher.click();
                yield metamaskPage.waitFor('li.dropdown-menu-item');
                const networkIndex = yield metamaskPage.evaluate(network => {
                    const elements = document.querySelectorAll('li.dropdown-menu-item');
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.innerText.toLowerCase().includes(network.toLowerCase())) {
                            return i;
                        }
                    }
                    return elements.length - 1;
                }, 'Custom RPC');
                const networkButton = (yield metamaskPage.$$('li.dropdown-menu-item'))[networkIndex];
                yield networkButton.click();
                const newRPCInput = yield metamaskPage.waitFor('input#new-rpc');
                yield newRPCInput.type(url);
                const saveButton = yield metamaskPage.waitFor('button.settings-tab__rpc-save-button');
                yield saveButton.click();
                const prevButton = yield metamaskPage.waitFor('img.app-header__metafox-logo');
                yield prevButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            importPK: (pk) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitFor('.identicon');
                yield accountSwitcher.click();
                const addAccount = yield metamaskPage.waitFor('.account-menu > div:nth-child(7)');
                yield addAccount.click();
                const PKInput = yield metamaskPage.waitFor('input#private-key-box');
                yield PKInput.type(pk);
                const importButton = yield metamaskPage.waitFor('button.btn-secondary');
                yield importButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            switchAccount: (accountNumber) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitFor('.identicon');
                yield accountSwitcher.click();
                const account = yield metamaskPage.waitFor(`.account-menu__accounts > div:nth-child(${accountNumber})`);
                yield account.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            switchNetwork: (network = 'main') => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const networkSwitcher = yield metamaskPage.waitFor('.network-indicator');
                yield networkSwitcher.click();
                yield metamaskPage.waitFor('li.dropdown-menu-item');
                const networkIndex = yield metamaskPage.evaluate(network => {
                    const elements = document.querySelectorAll('li.dropdown-menu-item');
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.innerText.toLowerCase().includes(network.toLowerCase())) {
                            return i;
                        }
                    }
                    return 0;
                }, network);
                const networkButton = (yield metamaskPage.$$('li.dropdown-menu-item'))[networkIndex];
                yield networkButton.click();
                yield waitForEthereum(metamaskPage);
            }),
            confirmTransaction: (options) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                if (!signedIn) {
                    throw new Error("You haven't signed in yet");
                }
                yield metamaskPage.waitFor('.transaction-list__pending-transactions .transaction-list-item .transaction-status--unapproved');
                yield metamaskPage.reload();
                if (options) {
                    const editButtonSelector = 'div.confirm-detail-row__header-text--edit';
                    const editButton = yield metamaskPage.waitFor(editButtonSelector);
                    yield editButton.click();
                    const tabSelector = 'li.page-container__tab:nth-child(2)';
                    const tab = yield metamaskPage.waitFor(tabSelector);
                    yield tab.click();
                    if (options.gas) {
                        const gasSelector = '.advanced-gas-inputs__gas-edit-row:nth-child(1) input';
                        const gas = yield metamaskPage.waitFor(gasSelector);
                        yield metamaskPage.evaluate(() => (document.querySelectorAll('.advanced-gas-inputs__gas-edit-row:nth-child(1) input')[0].value = ''));
                        yield gas.type(options.gas.toString());
                    }
                    if (options.gasLimit) {
                        const gasLimitSelector = '.advanced-gas-inputs__gas-edit-row:nth-child(2) input';
                        const gasLimit = yield metamaskPage.waitFor(gasLimitSelector);
                        yield metamaskPage.evaluate(() => (document.querySelectorAll('.advanced-gas-inputs__gas-edit-row:nth-child(2) input')[0].value = ''));
                        yield gasLimit.type(options.gasLimit.toString());
                    }
                    const saveSelector = '#app-content > div > span > div.modal > div > div > div > div.page-container__bottom > div.page-container__footer > header > button';
                    const saveButton = yield metamaskPage.waitFor(saveSelector);
                    yield saveButton.click();
                    //Wait for modal to disappear
                    yield metamaskPage.waitFor(() => !document.querySelector('div.modal'));
                }
                const confirmButtonSelector = '#app-content > div > div.main-container-wrapper > div > div.page-container__footer > header > button.button.btn-primary.btn--large.page-container__footer-button';
                const confirmButton = yield metamaskPage.waitFor(confirmButtonSelector);
                yield confirmButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            sign: () => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                if (!signedIn) {
                    throw new Error("You haven't signed in yet");
                }
                yield metamaskPage.reload();
                const confirmButtonSelector = '.request-signature__footer button.btn-secondary';
                const button = yield metamaskPage.waitFor(confirmButtonSelector);
                yield button.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            approve: () => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const confirmButtonSelector = 'button.button.btn-primary.btn--large.page-container__footer-button';
                const button = yield metamaskPage.waitFor(confirmButtonSelector);
                yield button.click();
                yield waitForUnlockedScreen(metamaskPage);
            })
        };
    });
}
exports.getMetamask = getMetamask;
function closeHomeScreen(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            browser.on('targetcreated', (target) => __awaiter(this, void 0, void 0, function* () {
                if (target.url().match("chrome-extension://[a-z]+/home.html")) {
                    try {
                        const page = yield target.page();
                        resolve(page);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            }));
        });
    });
}
function closeNotificationPage(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        browser.on('targetcreated', (target) => __awaiter(this, void 0, void 0, function* () {
            if (target.url() === 'chrome-extension://plkiloelkgnphnmaonlbbjbiphdalblo/notification.html') {
                try {
                    const page = yield target.page();
                    yield page.close();
                }
                catch (_a) { }
            }
        }));
    });
}
function getMetamaskPage(browser, extensionId, extensionUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const EXTENSION_ID = extensionId || 'nkbihfbeogaeaoehlefnkodbefgpgknn';
        const EXTENSION_URL = extensionUrl || `chrome-extension://${EXTENSION_ID}/popup.html`;
        const metamaskPage = yield browser.newPage();
        yield metamaskPage.goto(EXTENSION_URL);
    });
}
function confirmWelcomeScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const continueButton = yield metamaskPage.waitFor('.welcome-page button');
        yield continueButton.click();
    });
}
function importAccount(metamaskPage, seed, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const importLink = yield metamaskPage.waitFor('.first-time-flow button');
        yield importLink.click();
        const metricsOptOut = yield metamaskPage.waitFor('.metametrics-opt-in button.btn-primary');
        yield metricsOptOut.click();
        const seedPhraseInput = yield metamaskPage.waitFor('.first-time-flow textarea');
        yield seedPhraseInput.type(seed);
        const passwordInput = yield metamaskPage.waitFor('#password');
        yield passwordInput.type(password);
        const passwordConfirmInput = yield metamaskPage.waitFor('#confirm-password');
        yield passwordConfirmInput.type(password);
        const acceptTerms = yield metamaskPage.waitFor('div[role=checkbox]');
        yield acceptTerms.click();
        const restoreButton = yield metamaskPage.waitFor('.first-time-flow button');
        yield restoreButton.click();
        const doneButton = yield metamaskPage.waitFor('.end-of-flow button');
        yield doneButton.click();
    });
}
function waitForUnlockedScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForSelector('.main-container-wrapper');
    });
}
function waitForSignInScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForSelector('#metamask-mascot-container');
    });
}
function waitForEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.race([waitUntilStartConnectingToEthereum(metamaskPage), timeout(1)]);
        return Promise.race([waitUntilConnectedToEthereum(metamaskPage), timeout(10)]);
    });
}
function waitUntilStartConnectingToEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitFor(() => {
            return !!document.querySelector('img[src="images/loading.svg"]');
        });
    });
}
function waitUntilConnectedToEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitFor(() => {
            return document.querySelector('img[src="images/loading.svg"]') == null;
        });
    });
}
