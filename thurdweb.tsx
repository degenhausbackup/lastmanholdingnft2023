import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  safeWallet,
  trustWallet,
  darkTheme,
} from "@thirdweb-dev/react";

export default function App() {
  return (
    <ThirdwebProvider
      activeChain="mumbai"
      clientId="YOUR_CLIENT_ID"
      locale={en()}
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet(),
        walletConnect({ recommended: true }),
        safeWallet({
          recommended: true,
          personalWallets: [
            metamaskWallet({ recommended: true }),
            coinbaseWallet(),
            walletConnect({ recommended: true }),
            trustWallet({ recommended: true }),
          ],
        }),
        trustWallet({ recommended: true }),
      ]}
    >
      <ConnectWallet
        theme={darkTheme({
          colors: {
            accentText: "#ffa70e",
            accentButtonBg: "#ffa70e",
          },
        })}
        switchToActiveChain={true}
        modalSize={"wide"}
        welcomeScreen={{
          title: "Lastman on Binance Smart Chain",
          img: {
            src: "https://raw.githubusercontent.com/degenhausbackup/lastmanholdingnft2023/main/dappfortoken/src/token.png",
            width: 220,
            height: 220,
          },
        }}
        modalTitleIconUrl={
          "https://raw.githubusercontent.com/degenhausbackup/lastmanholdingnft2023/main/dappfortoken/src/token.png"
        }
      />
    </ThirdwebProvider>
  );
}
