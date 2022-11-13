import Head from "next/head";
import { Header } from "../components/Header";
import { TokenSale } from "../components/TokenSale";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* generate <html><head></head></html */}
      <Head></Head>
      <Header />
      <TokenSale />
    </div>
  );
}
