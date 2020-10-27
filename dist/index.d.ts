import * as puppeteer from 'Puppeteer';
export declare type LaunchOptions = puppeteer.LaunchOptions & {
    metamaskVersion?: string;
    metamaskPath?: string;
};
export declare type MetamaskOptions = {
    seed?: string;
    password?: string;
    extensionId?: string;
    extensionUrl?: string;
};
export declare type Dappeteer = {
    lock: () => Promise<void>;
    unlock: (password: string) => Promise<void>;
    addNetwork: (url: string) => Promise<void>;
    importPK: (pk: string) => Promise<void>;
    switchAccount: (accountNumber: number) => Promise<void>;
    switchNetwork: (network: string) => Promise<void>;
    confirmTransaction: (options: TransactionOptions) => Promise<void>;
    sign: () => Promise<void>;
    approve: () => Promise<void>;
};
export declare type TransactionOptions = {
    gas: number;
    gasLimit: number;
};
export declare function launch(puppeteer: any, options?: LaunchOptions): Promise<puppeteer.Browser>;
export declare function getMetamask(browser: puppeteer.Browser, options?: MetamaskOptions): Promise<Dappeteer>;
