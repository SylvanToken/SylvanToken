// Sources flattened with hardhat v2.26.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;



/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}


// File contracts/libraries/TaxManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;
/**
 * @title TaxManager
 * @dev Library for managing tax calculations and distributions
 * @notice This library provides tax calculation and distribution mechanisms for token transfers
 */
library TaxManager {
    
    // Constants
    uint256 public constant TAX_RATE = 100;           // 1% = 100/10000
    uint256 public constant TAX_DENOMINATOR = 10000;
    uint256 public constant FEE_SHARE = 5000;         // 50%
    uint256 public constant BURN_SHARE = 2500;        // 25%
    uint256 public constant DONATION_SHARE = 2500;    // 25%
    address public constant BURN_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    /**
     * @dev Tax data structure for managing tax-related state
     */
    struct TaxData {
        mapping(address => bool) isAMMPair;      // AMM pair addresses
        bool tradingEnabled;                     // Whether trading is enabled
    }

    // Events
    event TradingEnabled();
    event AMMPairUpdated(address indexed pair, bool status);
    event TaxDistributed(uint256 feeAmount, uint256 burnAmount, uint256 donationAmount);
    event TransferAnalytics(address indexed user, uint256 amount, uint256 timestamp);

    /**
     * @dev Enable trading
     * @param data Tax data storage reference
     */
    function enableTrading(TaxData storage data) external {
        require(!data.tradingEnabled, "Trading already enabled");
        data.tradingEnabled = true;
        emit TradingEnabled();
    }

    /**
     * @dev Set AMM pair status
     * @param data Tax data storage reference
     * @param pair Address to set as AMM pair
     * @param isPair Whether the address is an AMM pair
     * @param owner Contract owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function setAMMPair(
        TaxData storage data,
        address pair,
        bool isPair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external {
        require(pair != address(0), "Invalid pair address");
        
        if (isPair) {
            require(pair != owner, "Cannot set owner as AMM pair");
            require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
            require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
            require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
        }
        
        data.isAMMPair[pair] = isPair;
        emit AMMPairUpdated(pair, isPair);
    }

    /**
     * @dev Calculate tax amount for a given transfer amount
     * @param amount Transfer amount
     * @return taxAmount Calculated tax amount
     */
    function calculateTaxAmount(uint256 amount) external pure returns (uint256) {
        return (amount * TAX_RATE) / TAX_DENOMINATOR;
    }

    /**
     * @dev Calculate tax distribution amounts
     * @param taxAmount Total tax amount to distribute
     * @return feeAmount Amount going to fee wallet
     * @return burnAmount Amount going to burn wallet
     * @return donationAmount Amount going to donation wallet
     */
    function calculateDistribution(uint256 taxAmount)
        external
        pure
        returns (
            uint256 feeAmount,
            uint256 burnAmount,
            uint256 donationAmount
        )
    {
        feeAmount = (taxAmount * FEE_SHARE) / TAX_DENOMINATOR;
        burnAmount = (taxAmount * BURN_SHARE) / TAX_DENOMINATOR;
        donationAmount = taxAmount - feeAmount - burnAmount; // Ensures no rounding errors
    }

    /**
     * @dev Determine if tax should be applied to a transfer
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt from tax
     * @param isToExempt Whether recipient is exempt from tax
     * @return shouldApply Whether tax should be applied
     */
    function shouldApplyTax(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view returns (bool shouldApply) {
        // Tax only applies when trading is enabled
        if (!data.tradingEnabled) {
            return false;
        }
        
        // No tax if either party is exempt
        if (isFromExempt || isToExempt) {
            return false;
        }
        
        // Tax applies only for AMM pair transactions (buy/sell)
        return (data.isAMMPair[from] || data.isAMMPair[to]);
    }

    /**
     * @dev Validate trading conditions for a transfer
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt from tax
     * @param isToExempt Whether recipient is exempt from tax
     */
    function validateTrading(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view {
        if (!data.tradingEnabled) {
            require(isFromExempt || isToExempt, "Trading not enabled");
        }
    }

    /**
     * @dev Process tax distribution and emit events
     * @param from Sender address (for transfer execution)
     * @param taxAmount Total tax amount
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @return feeAmount Amount distributed to fee wallet
     * @return burnAmount Amount distributed to burn wallet
     * @return donationAmount Amount distributed to donation wallet
     */
    function distributeTax(
        address from,
        uint256 taxAmount,
        address feeWallet,
        address donationWallet
    ) external returns (
        uint256 feeAmount,
        uint256 burnAmount,
        uint256 donationAmount
    ) {
        feeAmount = (taxAmount * FEE_SHARE) / TAX_DENOMINATOR;
        burnAmount = (taxAmount * BURN_SHARE) / TAX_DENOMINATOR;
        donationAmount = taxAmount - feeAmount - burnAmount; // Ensures no rounding errors
        
        // Note: Actual transfers are handled by the main contract
        // This function only calculates and emits events
        
        emit TaxDistributed(feeAmount, burnAmount, donationAmount);
        
        return (feeAmount, burnAmount, donationAmount);
    }

    /**
     * @dev Log transfer analytics for AMM transactions
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     */
    function logTransferAnalytics(
        TaxData storage data,
        address from,
        address to,
        uint256 amount
    ) external {
        if (data.isAMMPair[from] || data.isAMMPair[to]) {
            address user = data.isAMMPair[from] ? to : from;
            emit TransferAnalytics(user, amount, block.timestamp);
        }
    }

    /**
     * @dev Get tax information
     * @return buyTax Tax rate for buy transactions
     * @return sellTax Tax rate for sell transactions
     */
    function getTaxInfo() external pure returns (uint256 buyTax, uint256 sellTax) {
        return (TAX_RATE, TAX_RATE);
    }

    /**
     * @dev Check if an address is an AMM pair
     * @param data Tax data storage reference
     * @param pair Address to check
     * @return isAMM Whether the address is an AMM pair
     */
    function isAMMPair(TaxData storage data, address pair) external view returns (bool) {
        return data.isAMMPair[pair];
    }

    /**
     * @dev Check if trading is enabled
     * @param data Tax data storage reference
     * @return enabled Whether trading is enabled
     */
    function isTradingEnabled(TaxData storage data) external view returns (bool) {
        return data.tradingEnabled;
    }

    /**
     * @dev Calculate effective transfer amount after tax
     * @param amount Original transfer amount
     * @param shouldTax Whether tax should be applied
     * @return transferAmount Amount to transfer to recipient
     * @return taxAmount Tax amount to be distributed
     */
    function calculateTransferAmounts(uint256 amount, bool shouldTax)
        external
        pure
        returns (uint256 transferAmount, uint256 taxAmount)
    {
        if (shouldTax && amount > 0) {
            taxAmount = (amount * TAX_RATE) / TAX_DENOMINATOR;
            transferAmount = amount - taxAmount;
        } else {
            transferAmount = amount;
            taxAmount = 0;
        }
    }

    /**
     * @dev Validate AMM pair setting parameters
     * @param pair Address to validate
     * @param owner Contract owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateAMMPairSetting(
        address pair,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(pair != address(0), "Invalid pair address");
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
        require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
    }

    /**
     * @dev Get comprehensive tax status for an address pair
     * @param data Tax data storage reference
     * @param from Sender address
     * @param to Recipient address
     * @param isFromExempt Whether sender is exempt
     * @param isToExempt Whether recipient is exempt
     * @return willApplyTax Whether tax will be applied
     * @return isFromAMM Whether sender is AMM pair
     * @return isToAMM Whether recipient is AMM pair
     * @return tradingActive Whether trading is enabled
     */
    function getTaxStatus(
        TaxData storage data,
        address from,
        address to,
        bool isFromExempt,
        bool isToExempt
    ) external view returns (
        bool willApplyTax,
        bool isFromAMM,
        bool isToAMM,
        bool tradingActive
    ) {
        isFromAMM = data.isAMMPair[from];
        isToAMM = data.isAMMPair[to];
        tradingActive = data.tradingEnabled;
        
        // Inline shouldApplyTax logic
        if (!data.tradingEnabled) {
            willApplyTax = false;
        } else if (isFromExempt || isToExempt) {
            willApplyTax = false;
        } else {
            willApplyTax = (data.isAMMPair[from] || data.isAMMPair[to]);
        }
    }
}


// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}


// File @openzeppelin/contracts/utils/Address.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     *
     * Furthermore, `isContract` will also return true if the target contract within
     * the same transaction is already scheduled for destruction by `SELFDESTRUCT`,
     * which only has an effect at the end of a transaction.
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.0/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
     * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
     *
     * _Available since v4.8._
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                // only check isContract if the call was successful and the return data is empty
                // otherwise we already know that it was a contract
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason or using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}


// File contracts/interfaces/IAdminWalletHandler.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IAdminWalletHandler
 * @dev Interface for managing admin wallet configurations with immediate access
 */
interface IAdminWalletHandler {
    /**
     * @dev Admin wallet configuration structure
     * @custom:optimization monthlyRelease field removed - calculated dynamically to save gas
     */
    struct AdminWalletConfig {
        uint256 totalAllocation;     // Total token allocation
        uint256 immediateRelease;    // 10% immediate release amount
        uint256 lockedAmount;        // 90% locked amount
        uint256 releasedAmount;      // Amount already released
        uint256 burnedAmount;        // Amount burned during releases
        bool isConfigured;           // Whether admin wallet is configured
        bool immediateReleased;      // Whether immediate release was processed
    }
    
    /**
     * @dev Configure an admin wallet with allocation
     * @param admin The admin wallet address
     * @param allocation Total token allocation for the admin
     */
    function configureAdminWallet(address admin, uint256 allocation) external;
    
    /**
     * @dev Get admin wallet configuration
     * @param admin The admin wallet address
     * @return AdminWalletConfig The admin configuration data
     */
    function getAdminConfig(address admin) external view returns (AdminWalletConfig memory);
    
    /**
     * @dev Process initial 10% release for admin wallet
     * @param admin The admin wallet address
     * @return releasedAmount Amount released immediately
     */
    function processInitialRelease(address admin) external returns (uint256 releasedAmount);
    
    /**
     * @dev Process monthly release for admin wallet
     * @param admin The admin wallet address
     * @return releasedAmount Amount released to admin (90% of calculated)
     * @return burnedAmount Amount burned (10% of calculated)
     */
    function processMonthlyRelease(address admin) external returns (uint256 releasedAmount, uint256 burnedAmount);
    
    /**
     * @dev Check if admin wallet is configured
     * @param admin The admin wallet address
     * @return bool True if admin wallet is configured
     */
    function isAdminConfigured(address admin) external view returns (bool);
    
    /**
     * @dev Calculate available release amount for admin
     * @param admin The admin wallet address
     * @return availableAmount Amount available for release
     * @return burnAmount Amount that will be burned
     */
    function calculateAvailableRelease(address admin) external view returns (uint256 availableAmount, uint256 burnAmount);
    
    /**
     * @dev Get all configured admin wallets
     * @return address[] Array of configured admin wallet addresses
     */
    function getConfiguredAdmins() external view returns (address[] memory);
    
    /**
     * @dev Get total admin allocations
     * @return uint256 Total amount allocated to all admin wallets
     */
    function getTotalAdminAllocations() external view returns (uint256);
    
    // Events
    event AdminWalletConfigured(
        address indexed admin,
        uint256 totalAllocation,
        uint256 immediateRelease,
        uint256 lockedAmount
    );
    event InitialReleaseProcessed(address indexed admin, uint256 amount);
    event MonthlyReleaseProcessed(
        address indexed admin,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 totalReleased
    );
}


// File contracts/interfaces/IEnhancedFeeManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IEnhancedFeeManager
 * @dev Interface for managing dynamic fee exemptions with environment-based configuration
 */
interface IEnhancedFeeManager {
    /**
     * @dev Check if a wallet is exempt from fees
     * @param wallet The wallet address to check
     * @return bool True if wallet is exempt from fees
     */
    function isExempt(address wallet) external view returns (bool);
    
    /**
     * @dev Add a wallet to the fee exemption list
     * @param wallet The wallet address to add
     */
    function addExemptWallet(address wallet) external;
    
    /**
     * @dev Remove a wallet from the fee exemption list
     * @param wallet The wallet address to remove
     */
    function removeExemptWallet(address wallet) external;
    
    /**
     * @dev Get all exempt wallets
     * @return address[] Array of exempt wallet addresses
     */
    function getExemptWallets() external view returns (address[] memory);
    
    /**
     * @dev Load exemptions from configuration
     */
    function loadExemptionsFromConfig() external;
    
    /**
     * @dev Load exemptions from configuration data
     * @param configWallets Array of wallet addresses to configure
     * @param exemptStatuses Array of exemption statuses (true = exempt, false = not exempt)
     */
    function loadExemptionsFromConfig(
        address[] calldata configWallets,
        bool[] calldata exemptStatuses
    ) external;
    
    /**
     * @dev Add multiple wallets to exemption list in batch
     * @param wallets Array of wallet addresses to add
     */
    function addExemptWalletsBatch(address[] calldata wallets) external;
    
    /**
     * @dev Remove multiple wallets from exemption list in batch
     * @param wallets Array of wallet addresses to remove
     */
    function removeExemptWalletsBatch(address[] calldata wallets) external;
    
    /**
     * @dev Get the count of exempt wallets
     * @return uint256 Number of exempt wallets
     */
    function getExemptWalletCount() external view returns (uint256);
    
    // Events
    event FeeExemptionChanged(address indexed wallet, bool exempt);
    event BatchExemptionUpdate(address[] wallets, bool exempt);
    event ExemptionConfigLoaded(uint256 walletCount);
}


// File contracts/interfaces/IVestingManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IVestingManager
 * @dev Interface for managing token vesting schedules with proportional burning
 */
interface IVestingManager {
    /**
     * @dev Vesting schedule structure
     */
    struct VestingSchedule {
        uint256 totalAmount;        // Total amount to be vested
        uint256 releasedAmount;     // Amount already released
        uint256 burnedAmount;       // Amount burned during releases
        uint256 startTime;          // Vesting start timestamp
        uint256 cliffDuration;      // Cliff period in seconds
        uint256 vestingDuration;    // Total vesting duration in seconds
        uint256 releasePercentage;  // Monthly release percentage (basis points)
        uint256 burnPercentage;     // Burn percentage of releases (basis points)
        bool isAdmin;               // Whether this is an admin wallet
        bool isActive;              // Whether the vesting schedule is active
    }
    
    /**
     * @dev Create a new vesting schedule
     * @param beneficiary The address that will receive vested tokens
     * @param amount Total amount to be vested
     * @param cliffDays Cliff period in days
     * @param vestingMonths Total vesting period in months
     * @param releasePercentage Monthly release percentage (basis points)
     * @param burnPercentage Burn percentage of releases (basis points)
     * @param isAdmin Whether this is an admin wallet
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDays,
        uint256 vestingMonths,
        uint256 releasePercentage,
        uint256 burnPercentage,
        bool isAdmin
    ) external;
    
    /**
     * @dev Release vested tokens for a beneficiary
     * @param beneficiary The address to release tokens for
     * @return releasedAmount Amount of tokens released
     * @return burnedAmount Amount of tokens burned
     */
    function releaseVestedTokens(address beneficiary) external returns (uint256 releasedAmount, uint256 burnedAmount);
    
    /**
     * @dev Get vesting information for a beneficiary
     * @param beneficiary The address to get vesting info for
     * @return VestingSchedule The vesting schedule data
     */
    function getVestingInfo(address beneficiary) external view returns (VestingSchedule memory);
    
    /**
     * @dev Calculate releasable amount for a beneficiary
     * @param beneficiary The address to calculate for
     * @return releasableAmount Amount that can be released
     * @return burnAmount Amount that will be burned
     */
    function calculateReleasableAmount(address beneficiary) external view returns (uint256 releasableAmount, uint256 burnAmount);
    
    /**
     * @dev Check if vesting schedule exists for beneficiary
     * @param beneficiary The address to check
     * @return bool True if vesting schedule exists
     */
    function hasVestingSchedule(address beneficiary) external view returns (bool);
    
    /**
     * @dev Get total vested amount across all schedules
     * @return uint256 Total amount being vested
     */
    function getTotalVestedAmount() external view returns (uint256);
    
    /**
     * @dev Get total released amount across all schedules
     * @return uint256 Total amount released
     */
    function getTotalReleasedAmount() external view returns (uint256);
    
    /**
     * @dev Get total burned amount across all schedules
     * @return uint256 Total amount burned
     */
    function getTotalBurnedAmount() external view returns (uint256);
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool isAdmin
    );
    event TokensReleased(
        address indexed beneficiary,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 totalReleased
    );
    event VestingScheduleRevoked(address indexed beneficiary, uint256 unreleased);
}


// File contracts/libraries/InputValidator.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InputValidator
 * @dev Library for comprehensive input validation and security checks
 * @notice This library provides reusable validation functions for addresses, amounts, and arrays
 */
library InputValidator {
    
    // Constants for validation
    uint256 public constant MAX_ARRAY_LENGTH = 100;
    uint256 public constant MIN_TRANSFER_AMOUNT = 1;
    
    /**
     * @dev Validate a single address with custom message
     * @param addr Address to validate
     * @param errorMessage Custom error message
     */
    function validateAddressWithMessage(address addr, string memory errorMessage) external pure {
        require(addr != address(0), errorMessage);
    }

    /**
     * @dev Validate address is not zero
     * @param addr Address to validate
     */
    function validateAddress(address addr) external pure {
        require(addr != address(0), "Invalid address: cannot be zero");
    }

    /**
     * @dev Validate address is not contract address
     * @param addr Address to validate
     * @param contractAddress Contract address to check against
     */
    function validateNotContract(address addr, address contractAddress) external pure {
        require(addr != contractAddress, "Invalid address: cannot be contract address");
    }

    /**
     * @dev Validate wallet pair addresses
     * @param wallet1 First wallet address
     * @param wallet2 Second wallet address
     * @param contractAddress Contract address to check against
     */
    function validateWalletPair(
        address wallet1,
        address wallet2,
        address contractAddress
    ) external pure {
        require(wallet1 != address(0), "Invalid first wallet address");
        require(wallet2 != address(0), "Invalid second wallet address");
        require(wallet1 != contractAddress, "First wallet cannot be contract address");
        require(wallet2 != contractAddress, "Second wallet cannot be contract address");
        require(wallet1 != wallet2, "Wallets cannot be the same");
    }

    /**
     * @dev Validate transfer amount
     * @param amount Amount to validate
     */
    function validateAmount(uint256 amount) external pure {
        require(amount > 0, "Amount must be greater than zero");
    }

    /**
     * @dev Validate transfer amount with minimum threshold
     * @param amount Amount to validate
     * @param minAmount Minimum allowed amount
     */
    function validateAmountWithMin(uint256 amount, uint256 minAmount) external pure {
        require(amount >= minAmount, "Amount below minimum threshold");
    }

    /**
     * @dev Validate transfer addresses
     * @param from Sender address
     * @param to Recipient address
     */
    function validateTransferAddresses(address from, address to) external pure {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(from != to, "Cannot transfer to self");
    }

    /**
     * @dev Validate array length
     * @param arrayLength Length of array to validate
     */
    function validateArrayLength(uint256 arrayLength) external pure {
        require(arrayLength > 0, "Array cannot be empty");
        require(arrayLength <= MAX_ARRAY_LENGTH, "Array too large");
    }

    /**
     * @dev Validate two arrays have same length
     * @param array1Length Length of first array
     * @param array2Length Length of second array
     */
    function validateArrayLengths(uint256 array1Length, uint256 array2Length) external pure {
        require(array1Length == array2Length, "Array lengths must match");
        require(array1Length > 0, "Array cannot be empty");
        require(array1Length <= MAX_ARRAY_LENGTH, "Array too large");
    }

    /**
     * @dev Validate address array for duplicates and zero addresses
     * @param addresses Array of addresses to validate
     */
    function validateAddressArray(address[] memory addresses) external pure {
        require(addresses.length > 0, "Array cannot be empty");
        require(addresses.length <= MAX_ARRAY_LENGTH, "Array too large");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Invalid address in array");
            
            // Check for duplicates
            for (uint256 j = i + 1; j < addresses.length; j++) {
                require(addresses[i] != addresses[j], "Duplicate address in array");
            }
        }
    }

    /**
     * @dev Validate ownership transfer parameters
     * @param newOwner New owner address
     * @param currentOwner Current owner address
     * @param contractAddress Contract address
     */
    function validateOwnershipTransfer(
        address newOwner,
        address currentOwner,
        address contractAddress
    ) external pure {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != currentOwner, "New owner cannot be current owner");
        require(newOwner != contractAddress, "New owner cannot be contract address");
    }

    /**
     * @dev Validate wallet update parameters
     * @param newWallet New wallet address
     * @param currentWallet Current wallet address
     * @param contractAddress Contract address
     */
    function validateWalletUpdate(
        address newWallet,
        address currentWallet,
        address contractAddress
    ) external pure {
        require(newWallet != address(0), "Invalid wallet address");
        require(newWallet != contractAddress, "Cannot be contract address");
        require(newWallet != currentWallet, "Same as current wallet");
    }

    /**
     * @dev Validate AMM pair setting
     * @param pair AMM pair address
     * @param contractAddress Contract address
     * @param owner Owner address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateAMMPair(
        address pair,
        address contractAddress,
        address owner,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(pair != address(0), "Invalid pair address");
        require(pair != contractAddress, "Cannot set contract as AMM pair");
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != donationWallet, "Cannot set donation wallet as AMM pair");
    }

    /**
     * @dev Validate emergency withdraw parameters
     * @param token Token address (can be zero for ETH)
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function validateEmergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external pure {
        require(amount > 0, "Amount must be greater than zero");
        require(recipient != address(0), "Invalid recipient address");
        // Note: token can be address(0) for ETH, so we don't validate it
    }

    /**
     * @dev Validate tax exemption parameters
     * @param account Account address
     * @param exempt Exemption status
     * @param owner Owner address
     * @param contractAddress Contract address
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     */
    function validateTaxExemption(
        address account,
        bool exempt,
        address owner,
        address contractAddress,
        address feeWallet,
        address donationWallet
    ) external pure {
        require(account != address(0), "Invalid account address");
        
        // Prevent removing exemption from critical addresses
        if (!exempt) {
            require(account != contractAddress, "Contract must remain tax exempt");
            require(account != owner, "Owner must remain tax exempt");
            require(account != feeWallet, "Fee wallet must remain tax exempt");
            require(account != donationWallet, "Donation wallet must remain tax exempt");
        }
    }

    /**
     * @dev Validate percentage value (0-10000 basis points)
     * @param percentage Percentage in basis points
     * @param maxPercentage Maximum allowed percentage
     */
    function validatePercentage(uint256 percentage, uint256 maxPercentage) external pure {
        require(percentage <= maxPercentage, "Percentage exceeds maximum");
    }

    /**
     * @dev Validate timelock parameters
     * @param unlockTime Unlock timestamp
     * @param currentTime Current timestamp
     * @param minDelay Minimum delay required
     */
    function validateTimelock(
        uint256 unlockTime,
        uint256 currentTime,
        uint256 minDelay
    ) external pure {
        require(unlockTime > currentTime, "Unlock time must be in future");
        require(unlockTime >= currentTime + minDelay, "Insufficient delay");
    }

    /**
     * @dev Validate cooldown period
     * @param lastAction Timestamp of last action
     * @param currentTime Current timestamp
     * @param cooldownPeriod Required cooldown period
     */
    function validateCooldown(
        uint256 lastAction,
        uint256 currentTime,
        uint256 cooldownPeriod
    ) external pure {
        require(
            currentTime >= lastAction + cooldownPeriod,
            "Cooldown period not elapsed"
        );
    }

    /**
     * @dev Validate balance sufficiency
     * @param balance Available balance
     * @param amount Required amount
     */
    function validateBalance(uint256 balance, uint256 amount) external pure {
        require(balance >= amount, "Insufficient balance");
    }

    /**
     * @dev Validate contract state for operations
     * @param isPaused Whether contract is paused
     * @param tradingEnabled Whether trading is enabled
     * @param requireTrading Whether operation requires trading to be enabled
     */
    function validateContractState(
        bool isPaused,
        bool tradingEnabled,
        bool requireTrading
    ) external pure {
        require(!isPaused, "Contract is paused");
        if (requireTrading) {
            require(tradingEnabled, "Trading not enabled");
        }
    }

    /**
     * @dev Comprehensive validation for constructor parameters
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @param contractAddress Contract address
     * @param initialExemptAccounts Array of initially exempt accounts
     */
    function validateConstructorParams(
        address feeWallet,
        address donationWallet,
        address contractAddress,
        address[] memory initialExemptAccounts
    ) external pure {
        require(feeWallet != address(0), "Invalid fee wallet address");
        require(donationWallet != address(0), "Invalid donation wallet address");
        require(feeWallet != contractAddress, "Fee wallet cannot be contract address");
        require(donationWallet != contractAddress, "Donation wallet cannot be contract address");
        require(feeWallet != donationWallet, "Wallets cannot be the same");
        
        if (initialExemptAccounts.length > 0) {
            require(initialExemptAccounts.length <= MAX_ARRAY_LENGTH, "Array too large");
            
            for (uint256 i = 0; i < initialExemptAccounts.length; i++) {
                require(initialExemptAccounts[i] != address(0), "Invalid address in array");
                
                // Check for duplicates
                for (uint256 j = i + 1; j < initialExemptAccounts.length; j++) {
                    require(initialExemptAccounts[i] != initialExemptAccounts[j], "Duplicate address in array");
                }
            }
        }
    }
}


// File contracts/libraries/WalletManager.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WalletManager
 * @dev Library for managing wallet addresses with validation and tax exemption handling
 * @notice This library provides secure wallet management with proper validation and cooldown controls
 */
library WalletManager {
    
    // Constants
    address public constant BURN_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    /**
     * @dev Wallet data structure for managing wallet addresses and exemptions
     */
    struct WalletData {
        address feeWallet;                           // Address receiving fee portion of tax
        address donationWallet;                      // Address receiving donation portion of tax
        mapping(address => bool) isExemptFromTax;    // Tax exemption mapping
        mapping(bytes4 => uint256) lastAdminAction;  // Cooldown tracking for admin actions
    }

    // Events
    event FeeWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event DonationWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event BatchWalletUpdate(
        address indexed oldFeeWallet, 
        address indexed newFeeWallet, 
        address indexed oldDonationWallet, 
        address newDonationWallet
    );
    event TaxExemptionUpdated(address indexed account, bool isExempt);

    /**
     * @dev Initialize wallet data with initial addresses
     * @param data Wallet data storage reference
     * @param _feeWallet Initial fee wallet address
     * @param _donationWallet Initial donation wallet address
     * @param _owner Contract owner address
     * @param _contractAddress Contract address
     * @param _initialExemptAccounts Array of initially exempt accounts
     */
    function initializeWallets(
        WalletData storage data,
        address _feeWallet,
        address _donationWallet,
        address _owner,
        address _contractAddress,
        address[] memory _initialExemptAccounts
    ) external {
        // Validate initial wallet addresses
        validateWalletPair(_feeWallet, _donationWallet, _contractAddress);
        
        // Set wallet addresses
        data.feeWallet = _feeWallet;
        data.donationWallet = _donationWallet;
        
        // Set initial tax exemptions
        data.isExemptFromTax[_owner] = true;
        data.isExemptFromTax[_contractAddress] = true;
        data.isExemptFromTax[_feeWallet] = true;
        data.isExemptFromTax[_donationWallet] = true;
        data.isExemptFromTax[BURN_WALLET] = true;
        
        // Set additional exempt accounts
        for (uint256 i = 0; i < _initialExemptAccounts.length; i++) {
            if (_initialExemptAccounts[i] != address(0)) {
                data.isExemptFromTax[_initialExemptAccounts[i]] = true;
            }
        }
    }

    /**
     * @dev Update fee wallet address with validation
     * @param data Wallet data storage reference
     * @param newFeeWallet New fee wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateFeeWallet(
        WalletData storage data,
        address newFeeWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate new wallet
        validateSingleWallet(newFeeWallet, contractAddress);
        require(newFeeWallet != data.feeWallet, "Same as current fee wallet");
        require(newFeeWallet != data.donationWallet, "Cannot be same as donation wallet");
        require(newFeeWallet != BURN_WALLET, "Cannot be burn wallet");
        
        address oldWallet = data.feeWallet;
        
        // Remove tax exemption from old wallet (if it's not a critical address)
        if (oldWallet != owner && 
            oldWallet != contractAddress && 
            oldWallet != data.donationWallet) {
            data.isExemptFromTax[oldWallet] = false;
        }
        
        // Update wallet and set exemption
        data.feeWallet = newFeeWallet;
        data.isExemptFromTax[newFeeWallet] = true;
        
        emit FeeWalletUpdated(oldWallet, newFeeWallet);
    }

    /**
     * @dev Update donation wallet address with validation
     * @param data Wallet data storage reference
     * @param newDonationWallet New donation wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateDonationWallet(
        WalletData storage data,
        address newDonationWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate new wallet
        validateSingleWallet(newDonationWallet, contractAddress);
        require(newDonationWallet != data.donationWallet, "Same as current donation wallet");
        require(newDonationWallet != data.feeWallet, "Cannot be same as fee wallet");
        require(newDonationWallet != BURN_WALLET, "Cannot be burn wallet");
        
        address oldWallet = data.donationWallet;
        
        // Remove tax exemption from old wallet (if it's not a critical address)
        if (oldWallet != owner && 
            oldWallet != contractAddress && 
            oldWallet != data.feeWallet) {
            data.isExemptFromTax[oldWallet] = false;
        }
        
        // Update wallet and set exemption
        data.donationWallet = newDonationWallet;
        data.isExemptFromTax[newDonationWallet] = true;
        
        emit DonationWalletUpdated(oldWallet, newDonationWallet);
    }

    /**
     * @dev Update both wallets simultaneously with validation
     * @param data Wallet data storage reference
     * @param newFeeWallet New fee wallet address
     * @param newDonationWallet New donation wallet address
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateBothWallets(
        WalletData storage data,
        address newFeeWallet,
        address newDonationWallet,
        address owner,
        address contractAddress
    ) external {
        // Validate both wallets
        validateWalletPair(newFeeWallet, newDonationWallet, contractAddress);
        
        // Store old addresses
        address oldFeeWallet = data.feeWallet;
        address oldDonationWallet = data.donationWallet;
        
        // Remove tax exemption from old wallets (if they're not critical addresses)
        if (oldFeeWallet != owner && 
            oldFeeWallet != contractAddress && 
            oldFeeWallet != newDonationWallet) {
            data.isExemptFromTax[oldFeeWallet] = false;
        }
        
        if (oldDonationWallet != owner && 
            oldDonationWallet != contractAddress && 
            oldDonationWallet != newFeeWallet) {
            data.isExemptFromTax[oldDonationWallet] = false;
        }
        
        // Update wallets
        data.feeWallet = newFeeWallet;
        data.donationWallet = newDonationWallet;
        
        // Set tax exemptions for new wallets
        data.isExemptFromTax[newFeeWallet] = true;
        data.isExemptFromTax[newDonationWallet] = true;
        
        // Emit events
        emit BatchWalletUpdate(oldFeeWallet, newFeeWallet, oldDonationWallet, newDonationWallet);
        emit FeeWalletUpdated(oldFeeWallet, newFeeWallet);
        emit DonationWalletUpdated(oldDonationWallet, newDonationWallet);
    }

    /**
     * @dev Update tax exemption status for an account
     * @param data Wallet data storage reference
     * @param account Account to update exemption for
     * @param isExempt New exemption status
     * @param owner Contract owner address
     * @param contractAddress Contract address
     */
    function updateTaxExemption(
        WalletData storage data,
        address account,
        bool isExempt,
        address owner,
        address contractAddress
    ) external {
        require(account != address(0), "Invalid account address");
        
        // Prevent removing exemption from critical addresses
        if (!isExempt) {
            require(account != contractAddress, "Contract must remain tax exempt");
            require(account != owner, "Owner must remain tax exempt");
            require(account != data.feeWallet, "Fee wallet must remain tax exempt");
            require(account != data.donationWallet, "Donation wallet must remain tax exempt");
            require(account != BURN_WALLET, "Burn wallet must remain tax exempt");
        }
        
        data.isExemptFromTax[account] = isExempt;
        emit TaxExemptionUpdated(account, isExempt);
    }

    /**
     * @dev Validate a single wallet address
     * @param wallet Wallet address to validate
     * @param contractAddress Contract address to check against
     */
    function validateSingleWallet(address wallet, address contractAddress) public pure {
        require(wallet != address(0), "Invalid wallet address");
        require(wallet != contractAddress, "Cannot be contract address");
    }

    /**
     * @dev Validate a pair of wallet addresses
     * @param feeWallet Fee wallet address
     * @param donationWallet Donation wallet address
     * @param contractAddress Contract address to check against
     */
    function validateWalletPair(
        address feeWallet,
        address donationWallet,
        address contractAddress
    ) public pure {
        validateSingleWallet(feeWallet, contractAddress);
        validateSingleWallet(donationWallet, contractAddress);
        require(feeWallet != donationWallet, "Wallets cannot be the same");
    }

    /**
     * @dev Check if an address is exempt from tax
     * @param data Wallet data storage reference
     * @param account Account to check
     * @return isExempt Whether the account is exempt from tax
     */
    function isExemptFromTax(WalletData storage data, address account) 
        external 
        view 
        returns (bool) 
    {
        return data.isExemptFromTax[account];
    }

    /**
     * @dev Get current wallet addresses
     * @param data Wallet data storage reference
     * @return feeWallet Current fee wallet address
     * @return donationWallet Current donation wallet address
     */
    function getWallets(WalletData storage data) 
        external 
        view 
        returns (address feeWallet, address donationWallet) 
    {
        return (data.feeWallet, data.donationWallet);
    }

    /**
     * @dev Validate wallet for AMM pair setting
     * @param data Wallet data storage reference
     * @param pair Address to validate
     * @param owner Contract owner address
     */
    function validateAMMPairWallet(
        WalletData storage data,
        address pair,
        address owner
    ) external view {
        require(pair != owner, "Cannot set owner as AMM pair");
        require(pair != data.feeWallet, "Cannot set fee wallet as AMM pair");
        require(pair != data.donationWallet, "Cannot set donation wallet as AMM pair");
        require(pair != BURN_WALLET, "Cannot set burn wallet as AMM pair");
    }
}


// File contracts/SylvanToken.sol

/**
 * ÔûêÔûêÔûêÔûêÔûêÔûêÔûêÔòùÔûêÔûêÔòù   ÔûêÔûêÔòùÔûêÔûêÔòù     ÔûêÔûêÔòù   ÔûêÔûêÔòù ÔûêÔûêÔûêÔûêÔûêÔòù ÔûêÔûêÔûêÔòù   ÔûêÔûêÔòù
 * ÔûêÔûêÔòöÔòÉÔòÉÔòÉÔòÉÔòØÔòÜÔûêÔûêÔòù ÔûêÔûêÔòöÔòØÔûêÔûêÔòæ     ÔûêÔûêÔòæ   ÔûêÔûêÔòæÔûêÔûêÔòöÔòÉÔòÉÔûêÔûêÔòùÔûêÔûêÔûêÔûêÔòù  ÔûêÔûêÔòæ
 * ÔûêÔûêÔûêÔûêÔûêÔûêÔûêÔòù ÔòÜÔûêÔûêÔûêÔûêÔòöÔòØ ÔûêÔûêÔòæ     ÔûêÔûêÔòæ   ÔûêÔûêÔòæÔûêÔûêÔûêÔûêÔûêÔûêÔûêÔòæÔûêÔûêÔòöÔûêÔûêÔòù ÔûêÔûêÔòæ
 * ÔòÜÔòÉÔòÉÔòÉÔòÉÔûêÔûêÔòæ  ÔòÜÔûêÔûêÔòöÔòØ  ÔûêÔûêÔòæ     ÔûêÔûêÔòæ   ÔûêÔûêÔòæÔûêÔûêÔòöÔòÉÔòÉÔûêÔûêÔòæÔûêÔûêÔòæÔòÜÔûêÔûêÔòùÔûêÔûêÔòæ
 * ÔûêÔûêÔûêÔûêÔûêÔûêÔûêÔòæ   ÔûêÔûêÔòæ   ÔûêÔûêÔûêÔûêÔûêÔûêÔûêÔòùÔòÜÔûêÔûêÔûêÔûêÔûêÔûêÔòöÔòØÔûêÔûêÔòæ  ÔûêÔûêÔòæÔûêÔûêÔòæ ÔòÜÔûêÔûêÔûêÔûêÔòæ
 * ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ   ÔòÜÔòÉÔòØ   ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ ÔòÜÔòÉÔòØ  ÔòÜÔòÉÔòØÔòÜÔòÉÔòØ  ÔòÜÔòÉÔòÉÔòÉÔòØ
 * 
 * SylvanToken - Advanced BEP-20 Token on Binance Smart Chain
 * Website: https://www.sylvantoken.org
 * Telegram: https://t.me/sylvantoken
 * Twitter: https://x.com/SylvanToken
 * 
 * Features:
 * - 1% Transaction Tax (50% dev, 25% burn, 25% charity)
 * - Advanced Vesting System
 * - Secure & Gas Optimized
 * - Community Driven
 */
// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.24;
// Interface imports
// Library imports for existing functionality
/**
 * @title SylvanToken
 * @author Sylvan Team
 * @notice BEP-20 token with advanced vesting, fee distribution, and lock mechanisms
 * @dev Implements ERC20 standard with additional features:
 *      - Universal 1% transaction fee (50% operations, 25% donations, 25% burn)
 *      - Advanced vesting system with cliff periods and proportional burning
 *      - Dynamic fee exemption management
 *      - Reentrancy protection on all state-changing functions
 *      - Gas-optimized storage access patterns
 * @custom:security-contact security@sylvantoken.org
 */
contract SylvanToken is ERC20, Ownable, ReentrancyGuard, IEnhancedFeeManager, IVestingManager, IAdminWalletHandler {
    using Address for address;
    
    // Library using statements
    using TaxManager for TaxManager.TaxData;
    
    // ­ş¬Ö Token Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Enhanced Fee System Constants
    uint256 public constant UNIVERSAL_FEE_RATE = 100; // 1% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant FEE_DISTRIBUTION_FEE = 5000; // 50%
    uint256 public constant FEE_DISTRIBUTION_DONATION = 2500; // 25%
    uint256 public constant FEE_DISTRIBUTION_BURN = 2500; // 25%
    
    // Vesting Constants
    uint256 public constant ADMIN_IMMEDIATE_RELEASE = 1000; // 10%
    uint256 public constant ADMIN_LOCK_PERCENTAGE = 9000; // 90%
    uint256 public constant ADMIN_MONTHLY_RELEASE = 500; // 5%
    uint256 public constant LOCKED_MONTHLY_RELEASE = 300; // 3%
    uint256 public constant PROPORTIONAL_BURN = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Time Constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant SECONDS_PER_MONTH = 2629746; // Average month in seconds
    
    // Dead wallet for burning
    address public constant DEAD_WALLET = 0x000000000000000000000000000000000000dEaD;
    
    // ­şôÜ Library Data Structures
    TaxManager.TaxData private taxData;
    
    // ­şöğ Enhanced Fee Exemption Data Structures
    struct FeeExemptionData {
        mapping(address => bool) exemptWallets;
        address[] exemptList;
        uint256 exemptCount;
    }
    
    FeeExemptionData private feeExemptionData;
    
    // ­şöÆ Vesting Data Structures
    mapping(address => VestingSchedule) private vestingSchedules;
    mapping(address => AdminWalletConfig) private adminConfigs;
    address[] private configuredAdmins;
    
    // Global vesting tracking
    uint256 private totalVestedAmount;
    uint256 private totalReleasedAmount;
    uint256 private totalBurnedAmount;
    
    // ­şôè Enhanced tracking
    uint256 public totalFeesCollected;
    uint256 public totalTokensBurned;
    
    // ­şöù Wallet addresses
    address public feeWallet;
    address public donationWallet;
    
    // ­şÄ» AMM and Emergency Controls
    mapping(address => bool) private ammPairs;
    
    // ­şÄ» Enhanced Events
    event UniversalFeeApplied(address indexed from, address indexed to, uint256 amount, uint256 feeAmount);
    event FeeDistributed(uint256 feeAmount, uint256 donationAmount, uint256 burnAmount);
    event ProportionalBurn(address indexed beneficiary, uint256 burnAmount, uint256 totalBurned);
    
    // Custom errors for enhanced functionality
    error UnauthorizedExemptionChange();
    error WalletAlreadyExempt(address wallet);
    error WalletNotExempt(address wallet);
    error InvalidExemptionConfiguration();
    error VestingAlreadyExists(address beneficiary);
    error NoVestingSchedule(address beneficiary);
    error VestingNotStarted(address beneficiary);
    error CliffPeriodActive(address beneficiary);
    error NoTokensToRelease(address beneficiary);
    error InvalidVestingParameters();
    error InsufficientUnlockedBalance(address account, uint256 requested, uint256 available);
    error AdminWalletAlreadyConfigured(address admin);
    error AdminWalletNotConfigured(address admin);
    error InvalidAdminAllocation(uint256 amount);
    error ImmediateReleaseAlreadyProcessed(address admin);
    error ZeroAddress();
    error InvalidAmount();
    
    constructor(
        address _feeWallet,
        address _donationWallet,
        address[] memory _initialExemptAccounts
    ) ERC20("Sylvan Token", "SYL") {
        // Validate constructor parameters
        if (_feeWallet == address(0) || _donationWallet == address(0)) {
            revert ZeroAddress();
        }
        
        // Set wallet addresses
        feeWallet = _feeWallet;
        donationWallet = _donationWallet;
        
        // Initialize fee exemptions with initial accounts
        _initializeFeeExemptions(_initialExemptAccounts);
        
        // Mint total supply to owner
        _mint(owner(), TOTAL_SUPPLY);
    }
    
    /**
     * @dev Initialize fee exemptions with initial accounts
     * @param _initialExemptAccounts Array of initially exempt accounts
     */
    function _initializeFeeExemptions(address[] memory _initialExemptAccounts) private {
        // Always exempt contract itself, owner, fee wallet, and donation wallet
        feeExemptionData.exemptWallets[address(this)] = true;
        feeExemptionData.exemptWallets[owner()] = true;
        feeExemptionData.exemptWallets[feeWallet] = true;
        feeExemptionData.exemptWallets[donationWallet] = true;
        feeExemptionData.exemptWallets[DEAD_WALLET] = true;
        
        feeExemptionData.exemptList.push(address(this));
        feeExemptionData.exemptList.push(owner());
        feeExemptionData.exemptList.push(feeWallet);
        feeExemptionData.exemptList.push(donationWallet);
        feeExemptionData.exemptList.push(DEAD_WALLET);
        feeExemptionData.exemptCount = 5;
        
        // Add initial exempt accounts
        for (uint256 i = 0; i < _initialExemptAccounts.length; i++) {
            address account = _initialExemptAccounts[i];
            if (account != address(0) && !feeExemptionData.exemptWallets[account]) {
                feeExemptionData.exemptWallets[account] = true;
                feeExemptionData.exemptList.push(account);
                feeExemptionData.exemptCount++;
            }
        }
    }
    
    // ============================================================================
    // ENHANCED FEE MANAGER IMPLEMENTATION
    // ============================================================================
    
    /**
     * @dev Check if a wallet is exempt from fees
     */
    function isExempt(address wallet) public view override returns (bool) {
        return feeExemptionData.exemptWallets[wallet];
    }
    
    /**
     * @dev Add a wallet to the fee exemption list
     */
    function addExemptWallet(address wallet) external override onlyOwner {
        if (wallet == address(0)) revert ZeroAddress();
        if (feeExemptionData.exemptWallets[wallet]) revert WalletAlreadyExempt(wallet);
        
        feeExemptionData.exemptWallets[wallet] = true;
        feeExemptionData.exemptList.push(wallet);
        feeExemptionData.exemptCount++;
        
        emit FeeExemptionChanged(wallet, true);
    }
    
    /**
     * @dev Remove a wallet from the fee exemption list
     */
    function removeExemptWallet(address wallet) external override onlyOwner {
        if (!feeExemptionData.exemptWallets[wallet]) revert WalletNotExempt(wallet);
        
        feeExemptionData.exemptWallets[wallet] = false;
        
        // Remove from exemptList array
        for (uint256 i = 0; i < feeExemptionData.exemptList.length; i++) {
            if (feeExemptionData.exemptList[i] == wallet) {
                feeExemptionData.exemptList[i] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                feeExemptionData.exemptList.pop();
                break;
            }
        }
        
        feeExemptionData.exemptCount--;
        emit FeeExemptionChanged(wallet, false);
    }
    
    /**
     * @dev Get all exempt wallets
     */
    function getExemptWallets() external view override returns (address[] memory) {
        address[] memory activeExempt = new address[](feeExemptionData.exemptCount);
        uint256 activeIndex = 0;
        
        for (uint256 i = 0; i < feeExemptionData.exemptList.length; i++) {
            if (feeExemptionData.exemptWallets[feeExemptionData.exemptList[i]]) {
                activeExempt[activeIndex] = feeExemptionData.exemptList[i];
                activeIndex++;
            }
        }
        
        return activeExempt;
    }
    
    /**
     * @dev Load exemptions from configuration data
     * @param configWallets Array of wallet addresses to configure
     * @param exemptStatuses Array of exemption statuses (true = exempt, false = not exempt)
     */
    function loadExemptionsFromConfig(
        address[] calldata configWallets,
        bool[] calldata exemptStatuses
    ) external onlyOwner {
        if (configWallets.length != exemptStatuses.length) {
            revert InvalidExemptionConfiguration();
        }
        
        for (uint256 i = 0; i < configWallets.length; i++) {
            address wallet = configWallets[i];
            bool shouldExempt = exemptStatuses[i];
            
            if (wallet == address(0)) continue;
            
            // Current exemption status
            bool currentlyExempt = feeExemptionData.exemptWallets[wallet];
            
            if (shouldExempt && !currentlyExempt) {
                // Add to exemption
                feeExemptionData.exemptWallets[wallet] = true;
                feeExemptionData.exemptList.push(wallet);
                feeExemptionData.exemptCount++;
                emit FeeExemptionChanged(wallet, true);
            } else if (!shouldExempt && currentlyExempt) {
                // Remove from exemption
                feeExemptionData.exemptWallets[wallet] = false;
                
                // Remove from exemptList array
                for (uint256 j = 0; j < feeExemptionData.exemptList.length; j++) {
                    if (feeExemptionData.exemptList[j] == wallet) {
                        feeExemptionData.exemptList[j] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                        feeExemptionData.exemptList.pop();
                        break;
                    }
                }
                
                feeExemptionData.exemptCount--;
                emit FeeExemptionChanged(wallet, false);
            }
        }
        
        emit ExemptionConfigLoaded(feeExemptionData.exemptCount);
    }
    
    /**
     * @dev Load exemptions from configuration (overloaded for backward compatibility)
     */
    function loadExemptionsFromConfig() external override onlyOwner {
        // Emit event to indicate config loading was called
        emit ExemptionConfigLoaded(feeExemptionData.exemptCount);
    }
    
    /**
     * @dev Add multiple wallets to exemption list in batch
     */
    function addExemptWalletsBatch(address[] calldata wallets) external override onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            if (wallet != address(0) && !feeExemptionData.exemptWallets[wallet]) {
                feeExemptionData.exemptWallets[wallet] = true;
                feeExemptionData.exemptList.push(wallet);
                feeExemptionData.exemptCount++;
            }
        }
        
        emit BatchExemptionUpdate(wallets, true);
    }
    
    /**
     * @dev Remove multiple wallets from exemption list in batch
     */
    function removeExemptWalletsBatch(address[] calldata wallets) external override onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            address wallet = wallets[i];
            if (feeExemptionData.exemptWallets[wallet]) {
                feeExemptionData.exemptWallets[wallet] = false;
                
                // Remove from exemptList array
                for (uint256 j = 0; j < feeExemptionData.exemptList.length; j++) {
                    if (feeExemptionData.exemptList[j] == wallet) {
                        feeExemptionData.exemptList[j] = feeExemptionData.exemptList[feeExemptionData.exemptList.length - 1];
                        feeExemptionData.exemptList.pop();
                        break;
                    }
                }
                
                feeExemptionData.exemptCount--;
            }
        }
        
        emit BatchExemptionUpdate(wallets, false);
    }
    
    /**
     * @dev Get the count of exempt wallets
     */
    function getExemptWalletCount() external view override returns (uint256) {
        return feeExemptionData.exemptCount;
    }
    
    // ============================================================================
    // VESTING MANAGER IMPLEMENTATION (Basic Structure)
    // ============================================================================
    
    /**
     * @dev Create a new vesting schedule
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDays,
        uint256 vestingMonths,
        uint256 releasePercentage,
        uint256 burnPercentage,
        bool isAdmin
    ) external override onlyOwner {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (vestingSchedules[beneficiary].isActive) revert VestingAlreadyExists(beneficiary);
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDays * SECONDS_PER_DAY,
            vestingDuration: vestingMonths * SECONDS_PER_MONTH,
            releasePercentage: releasePercentage,
            burnPercentage: burnPercentage,
            isAdmin: isAdmin,
            isActive: true
        });
        
        totalVestedAmount += amount;
        
        emit VestingScheduleCreated(
            beneficiary,
            amount,
            cliffDays * SECONDS_PER_DAY,
            vestingMonths * SECONDS_PER_MONTH,
            isAdmin
        );
    }
    
    /**
     * @dev Release vested tokens for a beneficiary (admin or locked wallet)
     * @notice Routes to correct calculation based on beneficiary type
     * @param beneficiary The address to release tokens for
     * @return releasedAmount Amount of tokens released to beneficiary (after 10% burn)
     * @return burnedAmount Amount of tokens burned (10% of total release)
     * 
     * @custom:calculation-admin For admin wallets: 5% of total allocation monthly over 18 months
     * @custom:calculation-locked For locked wallets: 3% of locked amount monthly over 34 months
     * @custom:security Uses schedule.isAdmin flag to route to correct helper function
     * 
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function releaseVestedTokens(address beneficiary) external override returns (uint256 releasedAmount, uint256 burnedAmount) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive) revert NoVestingSchedule(beneficiary);
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) revert VestingNotStarted(beneficiary);
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) revert CliffPeriodActive(beneficiary);
        
        // SECURITY FIX: Route to correct calculation based on beneficiary type
        // Admin wallets: Calculate based on total allocation (5% monthly)
        // Locked wallets: Calculate based on locked amount (3% monthly)
        (uint256 availableAmount, uint256 burnAmount) = schedule.isAdmin 
            ? _calculateAvailableRelease(beneficiary)
            : _calculateLockedWalletRelease(beneficiary);
        
        if (availableAmount == 0) revert NoTokensToRelease(beneficiary);
        
        // Update schedule tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to beneficiary
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 5.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to beneficiary (Requirement 5.3)
        _transfer(owner(), beneficiary, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit TokensReleased(beneficiary, releasedAmount, burnedAmount, schedule.releasedAmount);
        emit ProportionalBurn(beneficiary, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Get vesting information for a beneficiary
     */
    function getVestingInfo(address beneficiary) external view override returns (VestingSchedule memory) {
        return vestingSchedules[beneficiary];
    }
    
    /**
     * @dev Calculate releasable amount for locked wallet with 3% monthly releases
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function calculateReleasableAmount(address beneficiary) external view override returns (uint256 releasableAmount, uint256 burnAmount) {
        return _calculateLockedWalletRelease(beneficiary);
    }
    
    /**
     * @dev Check if vesting schedule exists
     */
    function hasVestingSchedule(address beneficiary) external view override returns (bool) {
        return vestingSchedules[beneficiary].isActive;
    }
    
    /**
     * @dev Get total vested amount
     */
    function getTotalVestedAmount() external view override returns (uint256) {
        return totalVestedAmount;
    }
    
    /**
     * @dev Get total released amount
     */
    function getTotalReleasedAmount() external view override returns (uint256) {
        return totalReleasedAmount;
    }
    
    /**
     * @dev Get total burned amount
     */
    function getTotalBurnedAmount() external view override returns (uint256) {
        return totalBurnedAmount;
    }
    
    // ============================================================================
    // ADMIN WALLET HANDLER IMPLEMENTATION
    // ============================================================================
    
    /**
     * @dev Configure an admin wallet with 10% immediate access and 90% vested over 18 months
     * @notice Stores TOTAL allocation in VestingSchedule.totalAmount for correct calculations
     * @param admin The admin wallet address
     * @param allocation The total token allocation (100%)
     * 
     * @custom:distribution 10% immediate release, 90% vested over 18 months
     * @custom:monthly-release 5% of total allocation per month (not 5% of locked amount)
     * @custom:vesting-math 18 months ├ù 5% = 90% of total allocation
     * 
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
     */
    function configureAdminWallet(address admin, uint256 allocation) external override onlyOwner {
        if (admin == address(0)) revert ZeroAddress();
        if (allocation == 0) revert InvalidAmount();
        if (adminConfigs[admin].isConfigured) revert AdminWalletAlreadyConfigured(admin);
        
        // Calculate 10% immediate release and 90% locked amount (Requirements 2.1, 2.2)
        uint256 immediateRelease = (allocation * ADMIN_IMMEDIATE_RELEASE) / BASIS_POINTS; // 10%
        uint256 lockedAmount = allocation - immediateRelease; // 90%
        
        adminConfigs[admin] = AdminWalletConfig({
            totalAllocation: allocation,
            immediateRelease: immediateRelease,
            lockedAmount: lockedAmount,
            releasedAmount: 0,
            burnedAmount: 0,
            isConfigured: true,
            immediateReleased: false
        });
        
        configuredAdmins.push(admin);
        
        // SECURITY FIX: Store total allocation (not locked amount) for admin wallets
        // This ensures _calculateAvailableRelease() calculates 5% of total allocation monthly
        // Vesting schedule configuration:
        // - Total amount: FULL allocation (100%) - used for monthly 5% calculation
        // - Cliff period: 0 days (immediate start after initial release)
        // - Vesting duration: 18 months
        // - Release percentage: 500 basis points (5% of total allocation monthly)
        // - Burn percentage: 1000 basis points (10% of each release)
        // Mathematical verification: 18 months ├ù 5% = 90% of total allocation Ô£ô
        vestingSchedules[admin] = VestingSchedule({
            totalAmount: allocation, // FIXED: Store full allocation, not locked amount
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: 0, // No cliff for admin wallets after initial release
            vestingDuration: 18 * SECONDS_PER_MONTH, // 18 months total vesting
            releasePercentage: ADMIN_MONTHLY_RELEASE, // 5% monthly of total allocation
            burnPercentage: PROPORTIONAL_BURN, // 10% burn
            isAdmin: true,
            isActive: true
        });
        
        totalVestedAmount += allocation; // Track full allocation in global vesting
        
        emit AdminWalletConfigured(admin, allocation, immediateRelease, lockedAmount);
        emit VestingScheduleCreated(admin, lockedAmount, 0, 18 * SECONDS_PER_MONTH, true);
    }
    
    /**
     * @dev Get admin configuration
     */
    function getAdminConfig(address admin) external view override returns (AdminWalletConfig memory) {
        return adminConfigs[admin];
    }
    
    /**
     * @dev Process initial 10% release for admin wallet
     * Requirements: 2.1 - 10% immediate access
     */
    function processInitialRelease(address admin) external override onlyOwner returns (uint256 releasedAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        
        if (!config.isConfigured) revert AdminWalletNotConfigured(admin);
        if (config.immediateReleased) revert ImmediateReleaseAlreadyProcessed(admin);
        
        releasedAmount = config.immediateRelease;
        
        // Mark immediate release as processed
        config.immediateReleased = true;
        config.releasedAmount += releasedAmount;
        
        // Transfer 10% immediately to admin wallet
        _transfer(owner(), admin, releasedAmount);
        
        totalReleasedAmount += releasedAmount;
        
        emit InitialReleaseProcessed(admin, releasedAmount);
        
        return releasedAmount;
    }
    
    /**
     * @dev Process monthly release for admin wallet with proportional burning
     * Requirements: 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5
     */
    function processMonthlyRelease(address admin) external override onlyOwner returns (uint256 releasedAmount, uint256 burnedAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        VestingSchedule storage schedule = vestingSchedules[admin];
        
        if (!config.isConfigured) revert AdminWalletNotConfigured(admin);
        if (!schedule.isActive) revert NoVestingSchedule(admin);
        
        // Calculate available release amount using internal function
        (uint256 availableAmount, uint256 burnAmount) = _calculateAvailableRelease(admin);
        
        if (availableAmount == 0) revert NoTokensToRelease(admin);
        
        // Update tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        config.releasedAmount += availableAmount;
        config.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to admin (Requirements 3.1, 3.2, 3.3)
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 3.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to admin wallet (Requirement 3.3)
        _transfer(owner(), admin, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit MonthlyReleaseProcessed(admin, releasedAmount, burnedAmount, config.releasedAmount);
        emit ProportionalBurn(admin, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Check if admin is configured
     */
    function isAdminConfigured(address admin) external view override returns (bool) {
        return adminConfigs[admin].isConfigured;
    }
    
    /**
     * @dev Internal function to calculate available release amount for admin wallet
     * Requirements: 2.4, 2.5 - Monthly 5% release calculation
     */
    function _calculateAvailableRelease(address admin) internal view returns (uint256 availableAmount, uint256 burnAmount) {
        AdminWalletConfig storage config = adminConfigs[admin];
        VestingSchedule storage schedule = vestingSchedules[admin];
        
        if (!config.isConfigured || !schedule.isActive) {
            return (0, 0);
        }
        
        // Check if cliff period has passed (should be 0 for admin wallets)
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return (0, 0);
        }
        
        // Calculate months elapsed since start
        uint256 timeElapsed = block.timestamp - schedule.startTime;
        uint256 monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
        
        // Cap at maximum vesting duration
        if (timeElapsed >= schedule.vestingDuration) {
            monthsElapsed = schedule.vestingDuration / SECONDS_PER_MONTH;
        }
        
        // Calculate total amount that should be released by now
        // Monthly release is 5% of original allocation (Requirements 2.4, 2.5)
        // Calculate based on the locked amount (schedule.totalAmount) since that's what's being vested
        uint256 totalReleasableAmount = (schedule.totalAmount * schedule.releasePercentage * monthsElapsed) / BASIS_POINTS;
        
        // Subtract what has already been released
        if (totalReleasableAmount <= schedule.releasedAmount) {
            return (0, 0);
        }
        
        availableAmount = totalReleasableAmount - schedule.releasedAmount;
        
        // Calculate burn amount (10% of available amount) (Requirements 3.1, 3.4, 3.5)
        burnAmount = (availableAmount * schedule.burnPercentage) / BASIS_POINTS;
        
        return (availableAmount, burnAmount);
    }
    
    /**
     * @dev Calculate available release amount for admin wallet
     * Requirements: 2.4, 2.5 - Monthly 5% release calculation
     */
    function calculateAvailableRelease(address admin) external view override returns (uint256 availableAmount, uint256 burnAmount) {
        return _calculateAvailableRelease(admin);
    }
    
    /**
     * @dev Get configured admins
     */
    function getConfiguredAdmins() external view override returns (address[] memory) {
        return configuredAdmins;
    }
    
    /**
     * @dev Get total admin allocations
     */
    function getTotalAdminAllocations() external view override returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < configuredAdmins.length; i++) {
            total += adminConfigs[configuredAdmins[i]].totalAllocation;
        }
        return total;
    }
    
    /**
     * @dev Get admin wallet release status
     */
    function getAdminReleaseStatus(address admin) external view returns (
        uint256 totalAllocation,
        uint256 immediateReleased,
        uint256 monthlyReleased,
        uint256 totalBurned,
        uint256 remainingLocked,
        bool immediateProcessed
    ) {
        AdminWalletConfig storage config = adminConfigs[admin];
        
        if (!config.isConfigured) {
            return (0, 0, 0, 0, 0, false);
        }
        
        totalAllocation = config.totalAllocation;
        immediateReleased = config.immediateReleased ? config.immediateRelease : 0;
        monthlyReleased = config.releasedAmount - immediateReleased;
        totalBurned = config.burnedAmount;
        remainingLocked = config.lockedAmount - monthlyReleased - totalBurned;
        immediateProcessed = config.immediateReleased;
        
        return (totalAllocation, immediateReleased, monthlyReleased, totalBurned, remainingLocked, immediateProcessed);
    }
    
    // ============================================================================
    // ENHANCED TRANSFER LOGIC
    // ============================================================================
    
    /**
     * @dev Enhanced transfer function with universal 1% fee
     */
    function _transfer(address from, address to, uint256 amount) internal override nonReentrant {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        
        // Check vesting lock - prevent transfer of locked tokens
        // Gas optimization: Cache storage reads
        VestingSchedule storage schedule = vestingSchedules[from];
        if (schedule.isActive) {
            uint256 currentBalance = balanceOf(from);
            
            // Gas optimization: Use unchecked for safe math operations
            uint256 lockedAmount;
            unchecked {
                lockedAmount = schedule.totalAmount - schedule.releasedAmount;
            }
            
            // Calculate available balance with 1 wei tolerance for rounding
            uint256 availableBalance = currentBalance > lockedAmount ? currentBalance - lockedAmount : 0;
            
            // Wei tolerance: Allow 1 wei difference for rounding errors
            if (amount > availableBalance + 1) {
                revert InsufficientUnlockedBalance(from, amount, availableBalance);
            }
        }
        
        // Check if either sender OR receiver is exempt (Requirements 6.2, 6.3)
        bool isFromExempt = isExempt(from);
        bool isToExempt = isExempt(to);
        bool shouldApplyFee = !isFromExempt && !isToExempt;
        
        if (shouldApplyFee && amount > 0) {
            // Calculate 1% universal fee (Requirement 6.1)
            uint256 feeAmount = (amount * UNIVERSAL_FEE_RATE) / FEE_DENOMINATOR;
            uint256 transferAmount = amount - feeAmount;
            
            if (feeAmount > 0) {
                // Distribute fee: 50% fee wallet, 25% donation, 25% burn (Requirement 6.4)
                _distributeFee(from, feeAmount);
                emit UniversalFeeApplied(from, to, amount, feeAmount);
            }
            
            super._transfer(from, to, transferAmount);
        } else {
            super._transfer(from, to, amount);
        }
    }
    
    /**
     * @dev Distribute collected fees according to requirements
     */
    function _distributeFee(address from, uint256 feeAmount) private {
        uint256 feeWalletAmount = (feeAmount * FEE_DISTRIBUTION_FEE) / BASIS_POINTS;
        uint256 donationAmount = (feeAmount * FEE_DISTRIBUTION_DONATION) / BASIS_POINTS;
        uint256 burnAmount = feeAmount - feeWalletAmount - donationAmount; // Remaining amount to handle rounding
        
        // Transfer to fee wallet (50%)
        super._transfer(from, feeWallet, feeWalletAmount);
        
        // Transfer to donation wallet (25%)
        super._transfer(from, donationWallet, donationAmount);
        
        // Transfer to dead wallet for burning (25%)
        super._transfer(from, DEAD_WALLET, burnAmount);
        
        // Update tracking
        totalFeesCollected += feeWalletAmount;
        totalTokensBurned += burnAmount;
        
        emit FeeDistributed(feeWalletAmount, donationAmount, burnAmount);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Get fee system statistics
     */
    function getFeeStats() external view returns (
        uint256 _totalFeesCollected,
        uint256 _totalTokensBurned,
        uint256 _totalDonations
    ) {
        return (
            totalFeesCollected,
            totalTokensBurned,
            balanceOf(donationWallet)
        );
    }
    
    /**
     * @dev Get vesting system statistics
     */
    function getVestingStats() external view returns (
        uint256 _totalVested,
        uint256 _totalReleased,
        uint256 _totalBurned,
        uint256 _activeSchedules
    ) {
        return (
            totalVestedAmount,
            totalReleasedAmount,
            totalBurnedAmount,
            configuredAdmins.length
        );
    }
    
    /**
     * @dev Internal function to calculate available release amount for locked wallet
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 - 3% monthly release with 34-month vesting
     */
    function _calculateLockedWalletRelease(address beneficiary) internal view returns (uint256 availableAmount, uint256 burnAmount) {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        
        if (!schedule.isActive) {
            return (0, 0);
        }
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) {
            return (0, 0);
        }
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return (0, 0);
        }
        
        // Calculate months elapsed since cliff period ended
        uint256 timeElapsed = block.timestamp - (schedule.startTime + schedule.cliffDuration);
        uint256 monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
        
        // For locked wallets: 34-month vesting schedule (Requirement 5.5)
        // Cap at maximum vesting duration
        uint256 maxMonths = schedule.vestingDuration / SECONDS_PER_MONTH;
        if (monthsElapsed > maxMonths) {
            monthsElapsed = maxMonths;
        }
        
        // Calculate total amount that should be released by now
        // For locked wallets: 3% monthly release (Requirement 5.1)
        uint256 totalReleasableAmount;
        
        if (schedule.isAdmin) {
            // Admin wallets: 5% of original allocation monthly
            totalReleasableAmount = (schedule.totalAmount * schedule.releasePercentage * monthsElapsed) / BASIS_POINTS;
        } else {
            // Locked wallets: 3% of original allocation monthly (Requirement 5.1)
            totalReleasableAmount = (schedule.totalAmount * LOCKED_MONTHLY_RELEASE * monthsElapsed) / BASIS_POINTS;
        }
        
        // Ensure we don't exceed total amount
        if (totalReleasableAmount > schedule.totalAmount) {
            totalReleasableAmount = schedule.totalAmount;
        }
        
        // Subtract what has already been released
        if (totalReleasableAmount <= schedule.releasedAmount) {
            return (0, 0);
        }
        
        availableAmount = totalReleasableAmount - schedule.releasedAmount;
        
        // Calculate burn amount (10% of available amount) (Requirements 5.2, 5.3, 5.4)
        burnAmount = (availableAmount * PROPORTIONAL_BURN) / BASIS_POINTS;
        
        return (availableAmount, burnAmount);
    }
    
    /**
     * @dev Create locked wallet vesting schedule with 34-month duration
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function createLockedWalletVesting(
        address lockedWallet,
        uint256 amount,
        uint256 cliffDays
    ) external onlyOwner {
        if (lockedWallet == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (vestingSchedules[lockedWallet].isActive) revert VestingAlreadyExists(lockedWallet);
        
        // Create 33-month vesting schedule for locked wallet (Requirement 5.5)
        // Changed from 34 to 33 months to match 3% monthly release (33 ├ù 3% = 99%)
        vestingSchedules[lockedWallet] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            burnedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDays * SECONDS_PER_DAY,
            vestingDuration: 33 * SECONDS_PER_MONTH, // 33-month vesting (33 ├ù 3% = 99%)
            releasePercentage: LOCKED_MONTHLY_RELEASE, // 3% monthly (Requirement 5.1)
            burnPercentage: PROPORTIONAL_BURN, // 10% burn (Requirements 5.2, 5.3, 5.4)
            isAdmin: false,
            isActive: true
        });
        
        totalVestedAmount += amount;
        
        emit VestingScheduleCreated(
            lockedWallet,
            amount,
            cliffDays * SECONDS_PER_DAY,
            33 * SECONDS_PER_MONTH,
            false
        );
    }
    
    /**
     * @dev Process locked wallet monthly release with proportional burning
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function processLockedWalletRelease(address lockedWallet) external onlyOwner returns (uint256 releasedAmount, uint256 burnedAmount) {
        VestingSchedule storage schedule = vestingSchedules[lockedWallet];
        
        if (!schedule.isActive) revert NoVestingSchedule(lockedWallet);
        if (schedule.isAdmin) revert InvalidVestingParameters(); // This function is for locked wallets only
        
        // Check if vesting has started
        if (block.timestamp < schedule.startTime) revert VestingNotStarted(lockedWallet);
        
        // Check if cliff period has passed
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) revert CliffPeriodActive(lockedWallet);
        
        // Calculate available release amount using locked wallet logic
        (uint256 availableAmount, uint256 burnAmount) = _calculateLockedWalletRelease(lockedWallet);
        
        if (availableAmount == 0) revert NoTokensToRelease(lockedWallet);
        
        // Update schedule tracking
        schedule.releasedAmount += availableAmount;
        schedule.burnedAmount += burnAmount;
        
        // Calculate actual amounts: 10% burn, 90% to locked wallet (Requirements 5.2, 5.3, 5.4)
        burnedAmount = burnAmount;
        releasedAmount = availableAmount - burnedAmount;
        
        // Transfer burn amount to dead wallet (Requirement 5.2)
        _transfer(owner(), DEAD_WALLET, burnedAmount);
        
        // Transfer remaining 90% to locked wallet (Requirements 5.3, 5.4)
        _transfer(owner(), lockedWallet, releasedAmount);
        
        // Update global tracking
        totalReleasedAmount += availableAmount;
        totalBurnedAmount += burnedAmount;
        totalTokensBurned += burnedAmount;
        
        emit TokensReleased(lockedWallet, releasedAmount, burnedAmount, schedule.releasedAmount);
        emit ProportionalBurn(lockedWallet, burnedAmount, totalBurnedAmount);
        
        return (releasedAmount, burnedAmount);
    }
    
    /**
     * @dev Calculate proportional burn amount for locked wallet release
     * Requirements: 5.2, 5.3, 5.4 - 10% burn of released amount
     */
    function calculateProportionalBurn(address lockedWallet) external view returns (uint256 burnAmount, uint256 netReleaseAmount) {
        (uint256 availableAmount, uint256 calculatedBurnAmount) = _calculateLockedWalletRelease(lockedWallet);
        
        burnAmount = calculatedBurnAmount;
        netReleaseAmount = availableAmount - burnAmount;
        
        return (burnAmount, netReleaseAmount);
    }
    
    /**
     * @dev Get locked wallet vesting information
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
     */
    function getLockedWalletInfo(address lockedWallet) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 burnedAmount,
        uint256 remainingAmount,
        uint256 nextReleaseTime,
        uint256 monthsElapsed,
        uint256 monthsRemaining,
        bool canRelease
    ) {
        VestingSchedule storage schedule = vestingSchedules[lockedWallet];
        
        if (!schedule.isActive) {
            return (0, 0, 0, 0, 0, 0, 0, false);
        }
        
        totalAmount = schedule.totalAmount;
        releasedAmount = schedule.releasedAmount;
        burnedAmount = schedule.burnedAmount;
        remainingAmount = totalAmount - releasedAmount;
        
        // Calculate time-based information
        uint256 cliffEndTime = schedule.startTime + schedule.cliffDuration;
        uint256 vestingEndTime = schedule.startTime + schedule.cliffDuration + schedule.vestingDuration;
        
        if (block.timestamp < cliffEndTime) {
            // Still in cliff period
            nextReleaseTime = cliffEndTime;
            monthsElapsed = 0;
            monthsRemaining = schedule.vestingDuration / SECONDS_PER_MONTH;
            canRelease = false;
        } else if (block.timestamp >= vestingEndTime) {
            // Vesting completed
            monthsElapsed = schedule.vestingDuration / SECONDS_PER_MONTH;
            monthsRemaining = 0;
            nextReleaseTime = 0;
            (uint256 available,) = _calculateLockedWalletRelease(lockedWallet);
            canRelease = available > 0;
        } else {
            // In vesting period
            uint256 timeElapsed = block.timestamp - cliffEndTime;
            monthsElapsed = timeElapsed / SECONDS_PER_MONTH;
            monthsRemaining = (schedule.vestingDuration / SECONDS_PER_MONTH) - monthsElapsed;
            
            // Next release time is at the start of next month
            uint256 nextMonthStart = cliffEndTime + ((monthsElapsed + 1) * SECONDS_PER_MONTH);
            nextReleaseTime = nextMonthStart;
            
            (uint256 available,) = _calculateLockedWalletRelease(lockedWallet);
            canRelease = available > 0;
        }
        
        return (totalAmount, releasedAmount, burnedAmount, remainingAmount, nextReleaseTime, monthsElapsed, monthsRemaining, canRelease);
    }
    
    // ============================================
    // AMM Management
    // ============================================
    
    /**
     * @dev Set AMM pair status
     * @notice Trading control mechanism removed - trading enabled from deployment
     */
    function setAMMPair(address pair, bool isAMM) external onlyOwner {
        require(pair != address(0), "Invalid pair address");
        ammPairs[pair] = isAMM;
    }
    
    /**
     * @dev Check if address is AMM pair
     */
    function isAMMPair(address pair) external view returns (bool) {
        return ammPairs[pair];
    }
    
}
