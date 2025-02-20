import { Account, AccountState, Address, ExtendedAccount, StateId } from '../webview/shared/types';
import BaseStateProvider from './BaseStateProvider';

export default class AccountStateProvider extends BaseStateProvider<AccountState> {
    constructor() {
        super(StateId.Accounts, []);
    }

    public add(account: ExtendedAccount) {
        if (this.includes(account.address)) {
            return;
        }
        this.state = [...this.state, account];
    }

    public update(account: ExtendedAccount) {
        this.state = this.state.map((a) => {
            if (a.address === account.address) {
                return account;
            }
            return a;
        });
    }

    public get(address: Address): ExtendedAccount | undefined {
        return this.state.find((a) => a.address === address);
    }

    public includes(address: Address): boolean {
        return this.state.some((a) => a.address === address);
    }

    public remove(address: Address) {
        this.state = this.state.filter((a) => a.address !== address);
    }

    public setBalance(address: Address, balance: number) {
        this.state = this.state.map((a) => {
            if (a.address === address) {
                a.balance = balance;
            }
            return a;
        });
    }

    public setLabel(address: Address, label?: string) {
        this.state = this.state.map((a) => {
            if (a.address === address) {
                a.label = label;
            }
            return a;
        });
    }

    public setAccounts(accounts: Account[]) {
        this.state = accounts;
    }
    /**
     * Set accounts without emitting an update event to webviews
     * @dev used in getAccounts (which calls getBalances, which will emit an update event)
     *
     * @param accounts state to set
     */
    public setAccountsSilent(accounts: Account[]) {
        this._state = accounts;
    }

    public updateBalances(balances: { [key: string]: number }) {
        const _modifiedAccounts = Object.keys(balances);
        this.state = this.state.map((account) => {
            if (_modifiedAccounts.includes(account.address)) {
                account.balance = balances[account.address];
            }
            return account;
        });
    }

    public getAccounts(): Account[] {
        return this.state;
    }
}
