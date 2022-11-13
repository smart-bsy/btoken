const { ConnectButton } = require("web3uikit");

function Header() {
  return (
    <>
      <div>
        <div>
          <div className="font-mono font-bold text-4xl text-center p-6">
            BTOKEN SALE MARKET
          </div>
          <div className="ml-auto w-96">
            <ConnectButton />
          </div>
        </div>
        <div className="w-[38rem] mx-auto border-b-4"></div>
      </div>
    </>
  );
}
module.exports = { Header };
