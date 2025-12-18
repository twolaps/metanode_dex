import { createPublicClient, http, PublicClient } from "viem";
import { sepolia } from "viem/chains";

// 建议：在真实项目中，client 最好提取到单独的配置文件中
export const client: PublicClient = createPublicClient({
	chain: sepolia,
	transport: http(),
});