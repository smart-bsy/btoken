const { ethers, BigNumber } = require("ethers");
const { useState, useEffect } = require("react");
const { useMoralis, useWeb3Contract } = require("react-moralis");
const { useNotification } = require("web3uikit");
const {
  btokenSaleAbi,
  btokenSaleAddress,
  btokenAbi,
  btokenAddress,
} = require("../constants/index");
function TokenSale() {
  const dispatch = useNotification();
  const [btokenPrice, setBTokenPrice] = useState("1");
  const [signerBalance, setSignerBalance] = useState("0");
  const [soldToken, setSoldToken] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [buyTokenNums, setBuyTokenNums] = useState(0); // wei
  const { account, chainId: chainHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainHex, 16);
  const { runContractFunction: getBTokenBalance } = useWeb3Contract();
  const getBTokenBalanceOptions = {
    abi: btokenAbi,
    contractAddress: btokenAddress[chainId],
    functionName: "balanceOf",
  };
  const { runContractFunction: getBTokenPrice } = useWeb3Contract({
    abi: btokenSaleAbi,
    contractAddress: btokenSaleAddress[chainId],
    functionName: "getTokenPrice",
    params: {},
  });
  const { runContractFunction: buyTokens } = useWeb3Contract();
  const buyTokenOptions = {
    abi: btokenSaleAbi,
    contractAddress: btokenSaleAddress[chainId],
    functionName: "buyTokens",
  };
  // TODO: 改成监听事件
  useEffect(() => {
    console.log(isWeb3Enabled);
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  async function updateUI() {
    await updateBTokenSaleBalance();
    await updateBTokenPrice();
    await updateSignerBTokenBalance();
  }
  async function updateBTokenSaleBalance() {
    const balance = (
      await getBTokenBalance({
        params: {
          ...getBTokenBalanceOptions,
          params: { account: btokenSaleAddress[chainId] },
        },
      })
    ).toString();
    setTokenBalance(ethers.utils.formatUnits(balance, "ether"));
  }
  async function updateBTokenPrice() {
    const price = (await getBTokenPrice()).toString();
    setBTokenPrice(ethers.utils.formatUnits(price, "wei"));
  }
  async function updateSignerBTokenBalance() {
    const signerBalance = (
      await getBTokenBalance({
        params: { ...getBTokenBalanceOptions, params: { account: account } },
      })
    ).toString();
    setSignerBalance(ethers.utils.formatUnits(signerBalance, "ether"));
  }

  async function buyTokenHandler(event) {
    event.preventDefault();
    // 1. transfer to wei
    const btn = ethers.utils.parseEther(buyTokenNums.toString());
    // 2. calculate total price, total wei
    const totalPrice = btn.mul(btokenPrice);
    await buyTokens({
      params: {
        ...buyTokenOptions,
        params: {
          numOfTokens: btn.toString(),
        },
        msgValue: totalPrice,
      },
      onSuccess: buyTokenSuccessHandler,
      onError: buyTokenErrorHandler,
    });
  }
  async function buyTokenSuccessHandler(tx) {
    console.log(tx);
    await tx.wait(1);
    handleNewNotification("success");
  }
  async function buyTokenErrorHandler(error) {
    console.log(error);
    handleNewNotification("error");
  }

  function handleNewNotification(type) {
    dispatch({
      type: type,
      message: "Transaction Complete!",
      title: "Transaction Notification",
      icon: "bell",
      position: "topR",
    });
  }

  return (
    <>
      <div>
        <h1 className="text-center p-5 font-bold">
          Introducting "BToken" (BT)! Token price is {btokenPrice} wei. Your
          currently have {signerBalance} BT.
        </h1>
        <div className="text-center">
          <form>
            <input
              className="border-2 rounded-lg h-12 pl-3 w-[36rem] text-xl"
              placeholder="enter token of nums"
              onChange={({ target }) => {
                setBuyTokenNums(target.value);
              }}
            />
            <button
              onClick={buyTokenHandler}
              className="rounded-lg h-12 bg-sky-300 text-white text-xl w-32"
            >
              Buy Tokens
            </button>
          </form>
          <h1 className="pt-6 text-center font-bold">
            Token Balnce: {tokenBalance} BT
          </h1>
          <div className="w-[38rem] mx-auto border-b-4 p-5"></div>
          <div className="pt-5 font-bold text-xl">
            {!account ? (
              "Please connect your wallet !"
            ) : (
              <div>Your account: {account}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

module.exports = { TokenSale };
