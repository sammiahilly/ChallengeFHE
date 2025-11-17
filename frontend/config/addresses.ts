export function getChallengeAddressByChainId(chainId: number | undefined): `0x${string}` | undefined {
  if (!chainId) return undefined;
  if (chainId === 31337) {
    // Fill after local deploy
    const addr = process.env.NEXT_PUBLIC_LOCAL_CHALLENGE_ADDRESS as `0x${string}` | undefined;
    return addr;
  }
  if (chainId === 11155111) {
    // Sepolia
    const envAddr = process.env.NEXT_PUBLIC_SEPOLIA_CHALLENGE_ADDRESS as `0x${string}` | undefined;
    // Fallback to deployed address if env is missing
    const fallback: `0x${string}` = "0x78450fe69Da4A8329953735661918bD4aAda0319";
    return (envAddr && envAddr.startsWith("0x")) ? envAddr : fallback;
  }
  return undefined;
}


