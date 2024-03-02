'use client';
import Image from "next/image";
import styles from "./page.module.css";
import {Web3Provider} from "./Web3Provider";
import { ConnectKitButton, ChainIcon } from "connectkit";
import { Account } from "./Account";


export default function Home() {
  
  return (
    <main className={styles.main}>
      
    <Web3Provider>
      <ConnectKitButton />
      
      <p>test</p>
      <Account />
      
    </Web3Provider>

    

    </main>
  );
}
