import { useAccount, useDisconnect, useBalance, useReadContract } from 'wagmi';
import * as fherc20 from '../contracts/FHERC20.json';
import { FhenixClient, getPermit } from 'fhenixjs';
import { JsonRpcProvider, getDefaultProvider } from 'ethers';
import {FHERC20__factory} from '../../types/factories/contracts';

const token1Address = '0x140979a2d63Aa5e3C1a11078dfa981428A1E80aA'; 

type Repo = {
    name: string
    stargazers_count: number
  }
  

export const getServerSideProps = (async () => {
    console.log('entered get server side');
    const token1 = FHERC20__factory.connect(token1Address);
    const response = await token1.name();
console.log(`My Balance: ${response}`)

    // Pass data to the page via props
    return { props: { response } }
  });

export default function Account(props) {
  const { address } = useAccount();
  const result = useBalance({
    address});
    console.log('result', result);
    const abi = fherc20.abi;
  const { disconnect } = useDisconnect();
  
//   const resultRead = useReadContract({
//     abi,
//     address: '0x140979a2d63Aa5e3C1a11078dfa981428A1E80aA',
//     functionName: 'name',
//   });
//   console.log("result read", resultRead);


const provider = new JsonRpcProvider('https://test01.fhenix.zone/evm');
const client = new FhenixClient({provider});

// const permit = await getPermit(token1Address, provider);
// client.storePermit(permit);

// const permission = client.extractPermitPermission(permit);

//const token1 = FHERC20__factory.connect(token1Address);

//const response = await token1.name();

//const plaintext = client.unseal(token1Address, response);

//console.log(`My Balance: ${response}`)


  return (
    <div>
      <p>address {address}</p>
      <p>balance:  {result ? result.data?.value.toString() : null}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}