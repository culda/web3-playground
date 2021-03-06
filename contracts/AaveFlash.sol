pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    FlashLoanReceiverBase
} from "./flashLoanContracts/FlashLoanReceiverBase.sol";
import "./flashLoanContracts/ILendingPool.sol";
import "./flashLoanContracts/ILendingPoolAddressesProvider.sol";
import "./UniswapContracts/IUniswapV2Router02.sol";
import "./UniswapContracts/IUniswapV2Factory.sol";

contract AaveFlash is FlashLoanReceiverBase {
    address owner;
    IERC20 daiAddress = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    ILendingPoolAddressesProvider provider =
        ILendingPoolAddressesProvider(
            0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
        );
    IUniswapV2Router02 public uniswapRouter = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    IUniswapV2Router02 public sushiswapRouter = IUniswapV2Router02(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    event Debug(string msg);

    uint256 public flashLoanedAmount;

    uint256 public tokensOut;
    uint256 public ethBalance;
    uint256 public daiAmount;
    uint256 public ethAmount;
    uint256 public estimatedTokens;

    constructor(ILendingPoolAddressesProvider _addressProvider) FlashLoanReceiverBase(_addressProvider) public {}

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums
    ) external override returns (bool) {
        swapTokens(amounts[0]);

        ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
        for (uint256 i = 0; i < assets.length; i++) {
            uint256 amountOwing = amounts[i].add(premiums[i]);
            flashLoanedAmount = amounts[i];
            IERC20(assets[i]).approve(address(lendingPool), amountOwing);
        }
        
    }



    event Paid(address indexed _from, uint _value);

    fallback() external payable {
        owner = msg.sender;
        emit Paid(msg.sender, msg.value);
    }

    function getUint() external pure returns (uint)
    {       
        return 4;
    }
    function setOwner() external returns(bool) 
    {
        owner = msg.sender;
        return true;
    }

    function startFlashLoan(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata modes
    ) public {

        ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
        lendingPool.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            "",
            0
        );
    }

    function swapTokens(uint256 amount) public {
        IERC20 dai = IERC20(daiAddress);
        uint256 deadline = block.timestamp + 300;

        uint256 estimatedETH =
            getEstimatedETHForToken(amount, address(daiAddress))[1];

        uniswapRouter.swapExactTokensForETH(
            amount,
            estimatedETH,
            getAssetPath(address(daiAddress)),
            address(this),
            deadline
        );

        ethBalance = address(this).balance;

        estimatedTokens = getEstimatedTokensForETH(
            ethBalance,
            address(daiAddress)
        )[1];

        sushiswapRouter.swapExactETHForTokens{value: ethBalance}(
            estimatedTokens,
            getETHPath(address(daiAddress)),
            address(this),
            deadline
        );
    }

    function getEstimatedETHForToken(uint256 _tokenAmount, address ERC20Token)
        public
        view
        returns (uint256[] memory)
    {
        return
            uniswapRouter.getAmountsOut(_tokenAmount, getAssetPath(ERC20Token));
    }

    function getEstimatedTokensForETH(uint256 _tokenAmount, address ERC20Token)
        public
        view
        returns (uint256[] memory)
    {
        return
            sushiswapRouter.getAmountsOut(_tokenAmount, getETHPath(ERC20Token));
    }

    function getAssetPath(address Token)
        private
        view
        returns (address[] memory)
    {
        address[] memory path = new address[](2);
        path[0] = Token;
        path[1] = uniswapRouter.WETH();

        return path;
    }


    function getETHPath(address Token) private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = sushiswapRouter.WETH();
        path[1] = Token;

        return path;
    }

    receive() external payable {}
}