import React, { useEffect, useState } from 'react';

import {
  Box,
  Link,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Spacer,
  Tab,
  TabPanel,
  Input,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';

import Web3 from 'web3';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { useAccount, useContractWrite } from 'wagmi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import abiFile from './abiFile.json';
import tokenAbi from './tokenAbi.json';
import './styles.css';
import backgroundGif from './gold.gif';
import tokenGif from './token.gif';
import tokenLogo from './token.png';
import tokenSvg from './token.svg';

import MainTextLogo from './headerlogo.png';

const CONTRACT_ADDRESS = '0xca695feb6b1b603ca9fec66aaa98be164db4e660';
// const TOKEN_ADDRESS = '0xdedC661d414619C3E838e6845830456f71d2f98a';
const TOKEN_ADDRESS = '0xAD7F1c958159c59f01b163965B83d306E5143C39'; //og lastman

const getExplorerLink = () => `https://bscscan.com/address/${CONTRACT_ADDRESS}`;
const getOpenSeaURL = () => `https://opensea.io/collection/aplha-dawgz-nft-collection`;
const getTofuNftURL = () => `https://tofunft.com/discover/items?contracts=98523`;
const BLOCK_RATE_SECONDS = 3; // BSC block rate



function App() {

  const tokenContractConfig = {
    addressOrName: TOKEN_ADDRESS,
    contractInterface: tokenAbi,
  };

  const account = useAccount();
  const [contractName, setContractName] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true);

  const contractConfig = {
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: abiFile,
  };

  const [imgURL, setImgURL] = useState('');
  const { writeAsync: mint, error: mintError } = useContractWrite({
    ...contractConfig,
    functionName: 'mint',
  });
  const [mintLoading, setMintLoading] = useState(false);
  const { address } = useAccount();
  const isConnected = !!address;
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [mintAmount, setMintQuantity] = useState(1);

  const [newCost, setNewCost] = useState('');

  const { writeAsync: pauseContract, error: pauseError } = useContractWrite({
    ...contractConfig,
    functionName: 'pause',
  });


    const calculateTotalPrice = () => {
      const pricePerToken = parseFloat(cost);
      return ethers.utils.parseEther((mintAmount * pricePerToken).toString());
    };


    const maxSupply = 777;
    const remainingSupply = maxSupply - totalSupply;


  const { writeAsync: setNewCostFn, error: setNewCostError } = useContractWrite({
  ...contractConfig,
  functionName: 'setCost',
});

  const handleIncrement = () => {
    setMintQuantity((prevQuantity) => Math.min(prevQuantity + 1, 100));
  };

  const handleDecrement = () => {
    setMintQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const onMintClick = async () => {
    try {
      setMintLoading(true);
      const totalPrice = calculateTotalPrice();

      const tx = await mint({
        args: [mintAmount, { value: totalPrice }],
      });

      await tx.wait();
      toast.success('Mint successful! You can view your NFT soon.');
    } catch (error) {
      console.error(error);
      toast.error('Mint unsuccessful! Please try again.');
    } finally {
      setMintLoading(false);
    }
  };

  const { writeAsync: unstake1Month } = useContractWrite({
    ...tokenContractConfig,
    functionName: 'Unstake1Month',
  });
  const onUnstake1MonthClick = async () => {
    try {
      const tx = await unstake1Month();
      await tx.wait();
      toast.success('Unstaking successful!');
    } catch (error) {
      console.error(error);
      toast.error('Unstaking failed. Please Check your Unlock Date in dapp.');
    }
  };

  const onSetCostClick = async () => {
    try {
      // Convert the new cost value to Wei
      const newCostValueInWei = ethers.utils.parseUnits(newCost.toString(), 'wei');

      // Call the setCost function in the contract
      const tx = await setNewCostFn({
        args: [newCostValueInWei],
      });

      await tx.wait();
      toast.success('Cost updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update cost. Please try again.');
    }
  };

  const onTogglePauseClick = async () => {
    try {
      // Toggle the pause state
      const newState = !isPaused;

      // Call the pause function in the contract
      const tx = await pauseContract({
        args: [newState],
      });

      await tx.wait();
      toast.success(`Contract is now ${newState ? 'paused' : 'resumed'}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle pause state. Please try again.');
    }
  };

  const { writeAsync: claimTokens } = useContractWrite({
    ...tokenContractConfig,
    functionName: 'claim',
  });

  const onClaimClick = async () => {
  try {
    const tx = await claimTokens();
    await tx.wait();
    toast.success('Claim successful!');
  } catch (error) {
    console.error(error);
    toast.error('Claim failed. Please try again.');
  }
};








  useEffect(() => {
    async function fetchContractData() {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile, provider);
        const name = await contract.name();
        const supply = await contract.totalSupply();
        setContractName(name);
        setTotalSupply(supply.toNumber());
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContractData();
  }, []);

  const [contractBalance, setContractBalance] = useState(0);

  useEffect(() => {
    async function fetchContractBalance() {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile, provider);

        // Read the balance directly from the contract address
        const balance = await provider.getBalance(CONTRACT_ADDRESS);

        // Convert BigNumber to number before setting the state
        setContractBalance(balance.toNumber());
      } catch (error) {
        console.error('Error fetching contract balance:', error);
      }
    }

    fetchContractBalance();
  }, []);

const [cost, setCost] = useState('0');

useEffect(() => {
  async function fetchCost() {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile, provider);

      // Read the cost value directly from the contract
      const costValue = await contract.cost();

      // Convert Wei to Ether and set the state
      setCost(ethers.utils.formatEther(costValue));
    } catch (error) {
      console.error('Error fetching cost:', error);
    }
  }

  fetchCost();
}, []);

const [isPaused, setIsPaused] = useState(false);

useEffect(() => {
  async function fetchPauseStatus() {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile, provider);

      // Read the paused status directly from the contract
      const pausedStatus = await contract.paused();

      setIsPaused(pausedStatus);
    } catch (error) {
      console.error('Error fetching paused status:', error);
    }
  }

  fetchPauseStatus();
}, []);

const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    async function fetchRevealStatus() {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abiFile, provider);

        // Read the revealed status directly from the contract
        const revealedStatus = await contract.revealed();

        setIsRevealed(revealedStatus);
      } catch (error) {
        console.error('Error fetching revealed status:', error);
      }
    }

    fetchRevealStatus();
  }, []);



  const { writeAsync: revealCollection, error: revealError } = useContractWrite({
    ...contractConfig,
    functionName: 'reveal',
  });

  const onRevealClick = async () => {
    try {
      // Check if the collection is already revealed
      if (isRevealed) {
        toast.info('Collection is already revealed!');
        return;
      }

      // Call the reveal function in the contract
      const tx = await revealCollection();

      await tx.wait();
      toast.success('Collection revealed successfully!');
      setIsRevealed(true); // Update the local state to reflect that the collection is revealed
    } catch (error) {
      console.error(error);
      toast.error('Failed to reveal collection. Please try again.');
    }
  };

  // State for staking amount
   const [stakeAmount, setStakeAmount] = useState('');

   // Contract write hook for staking in the token contract
   const { writeAsync: stakeFor1Month } = useContractWrite({
     ...tokenContractConfig,
     functionName: 'StakeFor1Month',
   });

   // Function to handle staking
   const onStakeClick = async () => {
     try {
       if (!stakeAmount) {
         toast.error('Please enter an amount to stake.');
         return;
       }

       // Convert the stake amount to Wei
       const stakeAmountInWei = ethers.utils.parseUnits(stakeAmount, 'wei');

       // Call the StakeFor1Month function in the contract
       const tx = await stakeFor1Month({
         args: [stakeAmountInWei],
       });

       await tx.wait();
       toast.success('Staking successful!');
     } catch (error) {
       console.error(error);
       toast.error('Staking failed. Please try again.');
     }
   };



//
//   return (
//     <>
//       <ToastContainer />
//
//       <header>
//         <div className="connect-button">
//           <ConnectButton />
//         </div>
//       </header>
//
//       <div
//         className="wrapper"
//         style={{
//           backgroundColor: 'black',
//           color: 'white',
//           backgroundImage: `url(${backgroundGif})`,
//           backgroundSize: 'cover',
//         }}
//       >
//         <div className="mainboxwrapper">
//           <Container className="container" paddingY="4">
//           <Tabs isFitted variant="enclosed">
//             <TabList>
//               <Tab style={{ fontWeight: 'bold', color: 'white' }}>Mint</Tab>
//             </TabList>
//
//             <TabPanels>
//               <TabPanel>

//
//
//
//
//               </TabPanel>
//             </TabPanels>
//           </Tabs>
//             <Text className="paragraph1" style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
//               &copy; Alpha 7 Token on BSC 2024. All rights reserved.
//             </Text>
//           </Container>
//         </div>
//       </div>
//     </>
//   );
// }
//
// export default App;

// Function to handle adding token to MetaMask
const handleAddToken = async () => {
  if (window.ethereum) {
    try {
      // MetaMask request to watch the asset
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Use 'ERC721' for NFTs
          options: {
            address: TOKEN_ADDRESS, // The address that the token is at
            symbol: 'LASTMAN', // A ticker symbol or shorthand, up to 5 characters
            decimals: 18, // The number of decimals in the token
            image: tokenSvg, // A string url of the token logo
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('MetaMask is not installed!');
  }
};

  const headerTextStyle = {
    fontSize: '28px', // Increased font size
    fontWeight: 'bold', // Make the text bolder
    color: '#f8f8ff', // Off-white color
  };

  const [rewardsToClaim, setRewardsToClaim] = useState('Loading...');

  useEffect(() => {
    const fetchRewardsToClaim = async () => {
      if (address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

          const rewards = await tokenContract.withdrawableDividendOf(address);
          // Format rewards and set it to 4 decimal places
          const formattedRewards = ethers.utils.formatUnits(rewards, 'ether');
          setRewardsToClaim(parseFloat(formattedRewards).toFixed(4)); // Now the rewards are a string with 4 decimal places
        } catch (error) {
          console.error('Error fetching rewards:', error);
          setRewardsToClaim('Error');
        }
      }
    };

    fetchRewardsToClaim();
  }, [address]); // Fetch rewards when the address changes


// is the user staked
  const [userStaked, setUserStaked] = useState('Loading...');

  useEffect(() => {
   const fetchUserStakedStatus = async () => {
     if (address) {
       try {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

         const isStaked = await tokenContract._isStaked1Month(address);
         setUserStaked(isStaked.toString());
       } catch (error) {
         console.error('Error fetching staking status:', error);
         setUserStaked('Error');
       }
     }
   };

   fetchUserStakedStatus();
 }, [address]); // Fetch staking status when the address changes

// amount staked 1 month pool
  const [tokensStaked1Month, setTokensStaked1Month] = useState('Loading...');

  useEffect(() => {
     const fetchTokensStaked1Month = async () => {
       if (address) {
         try {
           const provider = new ethers.providers.Web3Provider(window.ethereum);
           const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

           const tokens = await tokenContract.tokensStaked1Month(address);
           setTokensStaked1Month(ethers.utils.formatUnits(tokens, 'ether')); // Adjust based on your token's decimals
         } catch (error) {
           console.error('Error fetching tokens staked for 1 month:', error);
           setTokensStaked1Month('Error');
         }
       }
     };

     fetchTokensStaked1Month();
   }, [address]); // Fetch when the address changes


// available balance after staking locks
const [availableBalance, setAvailableBalance] = useState('Loading...');

useEffect(() => {
  const fetchBalances = async () => {
    if (address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

        const [balance, tokensStaked] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.tokensStaked1Month(address),
        ]);

        const available = balance.sub(tokensStaked);
        // Format balance and set it to 2 decimal places
        const formattedAvailable = ethers.utils.formatUnits(available, 'ether');
        setAvailableBalance(parseFloat(formattedAvailable).toFixed(2)); // Now the balance is a string with 2 decimal places
      } catch (error) {
        console.error('Error fetching balances:', error);
        setAvailableBalance('Error');
      }
    }
  };

  fetchBalances();
}, [address]); // Fetch when the address changes



  const [unlockTime, setUnlockTime] = useState('Loading...');

  useEffect(() => {
    const fetchUnlockTime = async () => {
      if (address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

          const stakedTimestamp = await tokenContract._staked1MonthTimestamp(address);
          const currentBlock = await provider.getBlock('latest');
          const currentTime = currentBlock.timestamp;

          const timeDiff = stakedTimestamp - currentTime;
          if (timeDiff <= 0) {
            setUnlockTime('Unlocked');
            return;
          }

          const days = Math.floor(timeDiff / (24 * 3600));
          const hours = Math.floor((timeDiff % (24 * 3600)) / 3600);
          const minutes = Math.floor((timeDiff % 3600) / 60);
          const seconds = Math.floor(timeDiff % 60);

          setUnlockTime(`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        } catch (error) {
          console.error('Error fetching unlock time:', error);
          setUnlockTime('Error');
        }
      }
    };

    fetchUnlockTime();
  }, [address]);



  const [stakedTimestamp, setStakedTimestamp] = useState('Loading...');

  useEffect(() => {
    const fetchStakedTimestamp = async () => {
      if (address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

          const timestamp = await tokenContract._staked1MonthTimestamp(address);
          const date = new Date(timestamp.toNumber() * 1000).toLocaleString(); // Convert timestamp to readable date
          setStakedTimestamp(date);
        } catch (error) {
          console.error('Error fetching staked timestamp:', error);
          setStakedTimestamp('Error');
        }
      }
    };

    fetchStakedTimestamp();
  }, [address]);


  const [stakedBlockNumber, setStakedBlockNumber] = useState('Loading...');

  useEffect(() => {
   const fetchStakedBlockNumber = async () => {
     if (address) {
       try {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

         const stakedTimestampBN = await tokenContract._staked1MonthTimestamp(address);
         const stakedTimestamp = stakedTimestampBN.toNumber();

         const currentBlock = await provider.getBlock('latest');
         const currentTimestamp = currentBlock.timestamp;
         const currentBlockNumber = currentBlock.number;

         // Estimate the block number of the staked timestamp
         const blockDifference = (stakedTimestamp - currentTimestamp) / BLOCK_RATE_SECONDS;
         const estimatedStakedBlockNumber = currentBlockNumber + Math.round(blockDifference);

         setStakedBlockNumber(estimatedStakedBlockNumber.toString());
       } catch (error) {
         console.error('Error fetching staked block number:', error);
         setStakedBlockNumber('Error');
       }
     }
   };

   fetchStakedBlockNumber();
 }, [address]);

   const [unlockDate, setUnlockDate] = useState('Loading...');

   useEffect(() => {
    const fetchUnlockDate = async () => {
      if (address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

          const stakedTimestampBN = await tokenContract._staked1MonthTimestamp(address);
          const stakedTimestamp = stakedTimestampBN.toNumber();

          // Add 30 days to the staked timestamp
          const unlockTimestamp = new Date(stakedTimestamp * 1000);
          unlockTimestamp.setDate(unlockTimestamp.getDate() + 30);

          setUnlockDate(unlockTimestamp.toLocaleDateString());
        } catch (error) {
          console.error('Error fetching unlock date:', error);
          setUnlockDate('Error');
        }
      }
    };

    fetchUnlockDate();
  }, [address]);


//fetch token pricePerToken in usd
const [tokenPriceUSD, setTokenPriceUSD] = useState('Loading...');
  const tokenAddress = '0xa7efd5d0575cd4682b0c83155bb9e4ff1a85a6f9'; // Your token address

  useEffect(() => {
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${tokenAddress}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data && data.data && data.data.attributes && data.data.attributes.token_prices) {
          const price = data.data.attributes.token_prices[tokenAddress];
          setTokenPriceUSD(`${parseFloat(price).toFixed(6)} USD`); // Format the price to 6 decimal places
        } else {
          setTokenPriceUSD('Price not available');
        }
      })
      .catch(error => {
        console.error('Error fetching token price:', error);
        setTokenPriceUSD('Error fetching price');
      });
  }, []);

  const [xrpPriceUSD, setXrpPriceUSD] = useState('Loading...');
 const xrpTokenAddress = '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe'; // XRP token address on BSC

 useEffect(() => {
   const url = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${xrpTokenAddress}`;

   fetch(url)
     .then(response => response.json())
     .then(data => {
       if (data && data.data && data.data.attributes && data.data.attributes.token_prices) {
         const price = data.data.attributes.token_prices[xrpTokenAddress];
         setXrpPriceUSD(`${parseFloat(price).toFixed(6)} USD`); // Format the price to 6 decimal places
       } else {
         setXrpPriceUSD('Price not available');
       }
     })
     .catch(error => {
       console.error('Error fetching XRP price:', error);
       setXrpPriceUSD('Error fetching price');
     });
 }, []);

 const [bnbPriceUSD, setBnbPriceUSD] = useState('Loading...');
const bnbTokenAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'; // BNB token address on BSC

useEffect(() => {
  const url = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${bnbTokenAddress}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.data && data.data.attributes && data.data.attributes.token_prices) {
        const price = data.data.attributes.token_prices[bnbTokenAddress];
        setBnbPriceUSD(`${parseFloat(price).toFixed(2)} USD`); // Format the price to 6 decimal places
      } else {
        setBnbPriceUSD('Price not available');
      }
    })
    .catch(error => {
      console.error('Error fetching BNB price:', error);
      setBnbPriceUSD('Error fetching price');
    });
}, []);

const [rewardsValueInUSD, setRewardsValueInUSD] = useState('Loading...');

  useEffect(() => {
    // Calculate rewards in USD
    const xrpPrice = parseFloat(xrpPriceUSD.replace(' USD', ''));
    const rewardsAmount = parseFloat(rewardsToClaim);

    if (!isNaN(xrpPrice) && !isNaN(rewardsAmount)) {
      const calculatedValue = (rewardsAmount * xrpPrice).toFixed(2); // Format the result to 2 decimal places
      setRewardsValueInUSD(`${calculatedValue} USD`);
    } else {
      setRewardsValueInUSD('Calculating...');
    }
  }, [xrpPriceUSD, rewardsToClaim]);


  // fetch token balance
  const [tokenBalance, setTokenBalance] = useState('Loading...');

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (address) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

          const balance = await tokenContract.balanceOf(address);
          // Format balance and set it to 2 decimal places
          const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
          setTokenBalance(parseFloat(formattedBalance).toFixed(2)); // Now the balance is a string with 2 decimal places
        } catch (error) {
          console.error('Error fetching balance:', error);
          setTokenBalance('Error');
        }
      }
    };

    fetchTokenBalance();
  }, [address]); // Fetch balance when the address changes


  return (
    <>
     <ToastContainer />
      <header className="header">

          <div style={headerTextStyle}>Lastman </div>
          <div className="connect-button">
            <ConnectButton />
        </div>
      </header>



      <div className="container">


      <div className="row row-1_0"></div>

        <div className="row row-1">
                  {/* Apply the logobody class to the image */}

                  {/* Rest of your first row content */}
                </div>
        <div className="row row-3">

                                                    <div>

                                                          <img src={tokenLogo} alt="Main Text Logo" className="logobody" />
                                                          <div style={{ fontSize: '80px', fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: '1px' }}>
                                                    Lastman
                                                    </div>
                                                    <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: '10px' }}>
                                              Token Staking with XRP Reflections
                                              </div>
                                              <Box
                                                display='flex'
                                                flexDirection='column'
                                                alignItems='center'
                                                justifyContent='center'
                                                marginTop='4'
                                              >
                                                <div> Your Total Token Balance: {tokenBalance} </div>
                                                <div>  your Staked Balance all pools: {tokensStaked1Month}</div>
                                                <div>Available Balance: {availableBalance} Tokens</div>


                                                                </Box>


        <div style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
              Your XRP rewards
        </div>
        <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
{rewardsToClaim} XRP ( {rewardsValueInUSD} value)</div>


                                                        <Tabs isFitted variant="enclosed">
                                                        <TabList>
    <Tab style={{ fontWeight: 'bold', color: 'white' }}>30 day</Tab>
    <Tab style={{ fontWeight: 'bold', color: 'white' }}>60 day</Tab>
    <Tab style={{ fontWeight: 'bold', color: 'white' }}>90 day</Tab>
  </TabList>

                                                                  <TabPanels>
                                                                    <TabPanel>
                                                                                                                            <Box
                                                                                                                              display='flex'
                                                                                                                              flexDirection='column'
                                                                                                                              alignItems='center'
                                                                                                                              justifyContent='center'
                                                                                                                              marginTop='4'
                                                                                                                              style={{ backgroundColor: '#211202' }} // Light dark grey color
                                                                                                                              >

                                                                                                                              <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                                                                                                                                30 Day Staking Pool
                                                                                                                              </div>

                                            {/* Staking Section */}
      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
        <Input
          placeholder='Enter amount to stake 30 Days'
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          size='md'
          width='250px'
        />
        <Button
          onClick={onStakeClick}
          marginTop='2'
          textColor='white'
          bg='#b07e18'
          _hover={{ bg: '#ffc810' }}
        >
          Stake for 30 Days
        </Button>
      </Box>
      {/* Unstake Section */}
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
      <Button
        onClick={onUnstake1MonthClick}
        textColor='white'
        bg='#b07e18'
        _hover={{ bg: '#ffc810' }}
      >
        Unstake from 30 Day Staking
      </Button>
    </Box>
          <div>1 month active Stake: {userStaked}</div>
          <div>Your Tokens Staked for 1 Month: {tokensStaked1Month}</div>
          <div>Staked on: {stakedTimestamp}</div>
                <div>Unlock Date: {unlockDate}</div>

                </Box>



              </TabPanel>


// 60day display to finish
              <TabPanel>
                                                                        <Box
                                                                          display='flex'
                                                                          flexDirection='column'
                                                                          alignItems='center'
                                                                          justifyContent='center'
                                                                          marginTop='4'
                                                                          style={{ backgroundColor: '#211202' }} // Light dark grey color
                                                                          >

                                                                          <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                                                                            60 Day Staking Pool
                                                                          </div>

{/* Staking Section */}
<Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
<Input
placeholder='Enter amount to stake 60 Days'
value={stakeAmount}
onChange={(e) => setStakeAmount(e.target.value)}
size='md'
width='250px'
/>
<Button
onClick={onStakeClick}
marginTop='2'
textColor='white'
bg='#b07e18'
_hover={{ bg: '#ffc810' }}
>
Stake for 60 Days
</Button>
</Box>
{/* Unstake Section */}
<Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
<Button
onClick={onUnstake1MonthClick}
textColor='white'
bg='#b07e18'
_hover={{ bg: '#ffc810' }}
>
Unstake from 60 Day Staking
</Button>
</Box>
<div>1 month active Stake: {userStaked}</div>
<div>Your Tokens Staked for 1 Month: {tokensStaked1Month}</div>
<div>Staked on: {stakedTimestamp}</div>
<div>Unlock Date: {unlockDate}</div>

</Box>



</TabPanel>

// 90day display to finish
<TabPanel>
                                                          <Box
                                                            display='flex'
                                                            flexDirection='column'
                                                            alignItems='center'
                                                            justifyContent='center'
                                                            marginTop='4'
                                                            style={{ backgroundColor: '#211202' }} // Light dark grey color
                                                            >

                                                            <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                                                              90 Day Staking Pool
                                                            </div>

{/* Staking Section */}
<Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
<Input
placeholder='Enter amount to stake 90 Days'
value={stakeAmount}
onChange={(e) => setStakeAmount(e.target.value)}
size='md'
width='250px'
/>
<Button
onClick={onStakeClick}
marginTop='2'
textColor='white'
bg='#b07e18'
_hover={{ bg: '#ffc810' }}
>
Stake for 90 Days
</Button>
</Box>
{/* Unstake Section */}
<Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
<Button
onClick={onUnstake1MonthClick}
textColor='white'
bg='#b07e18'
_hover={{ bg: '#ffc810' }}
>
Unstake from 90 Day Staking
</Button>
</Box>
<div>1 month active Stake: {userStaked}</div>
<div>Your Tokens Staked for 1 Month: {tokensStaked1Month}</div>
<div>Staked on: {stakedTimestamp}</div>
<div>Unlock Date: {unlockDate}</div>

</Box>



</TabPanel>
            </TabPanels>
          </Tabs>
          <div>


                                                        {/* Claim Section */}
                                                      <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>
                                                        <Button
                                                          onClick={onClaimClick}
                                                          textColor='white'
                                                          bg='#b07e18'
                                                          _hover={{ bg: '#ffc810' }}
                                                        >
                                                          Claim Tokens
                                                        </Button>
                                                      </Box>

          <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' marginTop='4'>

          <Button
                  marginTop='6'
                  onClick={handleAddToken}
                  textColor='white'
                  bg='#b07e18'
                  _hover={{
                    bg: '#ffc810',
                  }}
                >
                  Add Lastman Token to MetaMask
                </Button>

                </Box>

<div>
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    marginTop='4'
                    style={{ backgroundColor: '#432f06' }} // Light dark grey color
                  >
                  <div>
  Token Price (USD): {tokenPriceUSD}
</div>
<div>
  XRP: {xrpPriceUSD} --- BNB: {bnbPriceUSD}
</div>

                </Box>
                                                                  </div>


                                                  </div>
                </div>
      </div>
      </div>
    </>
  );
}

export default App;
