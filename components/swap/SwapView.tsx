import { useEffect, useState } from "react";
import { SwapButton } from "./SwapButton";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwitchTokenButton } from "./SwitchTokenButton";
import { InQuoteInfo, OutQuoteInfo, PairInfo, SwapStatus, RawPoolInfo, TokenInfo, TradeDirection, BUTTON_CONFIG } from "@/app/tools/types";
import { getPairs, getPools, getOutQuote, getSwapTokenMap, getInQuote } from "@/app/tools/swapMath";
import { Address, formatUnits, maxUint256, parseUnits } from "viem";
import { showQuoteToaster } from "@/app/tools/toaster";
import { useAccount, useBalance } from "wagmi";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useApprove } from "@/hooks/useApprove";
import { toast } from "sonner";
import { useSwap } from "@/hooks/useSwap";
import { SettingButton } from "./SettingButton";
import { SlippageSetting } from "./SlippageSetting";
import { cn } from "@/lib/utils";
import { swapConfig } from "@/config/contracts";

/**
 * 核心组件：SwapView
 * 作用：DEX 的主界面控制器。
 * 职责：
 * 1. 管理所有 UI 状态（输入金额、选择的代币）。
 * 2. 初始化时加载所有池子和代币数据。
 * 3. 监听用户输入，防抖动（Debounce）后触发报价计算。
 * 4. 调用 Wagmi Hooks 实时查询余额。
 */
export default function SwapView() {

	// --- 1. 数据源状态 ---
	// 存储所有可选代币的 Map（地址 -> 代币信息），用于下拉菜单
	const [selectableTokensMap, setSelectableTokensMap] = useState<Map<Address, TokenInfo>>(new Map<Address, TokenInfo>());
	// 存储链上获取的原始池子数据，用于路由计算
	const [allPools, setAllPools] = useState<RawPoolInfo[]>([]);
	// 存储所有交易对信息
	const [pairs, setPairs] = useState<PairInfo[]>([]);

	// --- 2. 用户选择状态 ---
	// 用户当前选中的【支付】代币
	const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
	// 用户当前选中的【获得】代币
	const [toToken, setToToken] = useState<TokenInfo | null>(null);

	// --- 3. 交易数值状态 ---
	// 输入框显示的字符串数值（保留给 UI 显示）
	const [amountIn, setAmountIn] = useState<string>("");
	const [amountOut, setAmountOut] = useState<string>("");

	// 计算出的最佳交易池索引
	const [poolIndex, setPoolIndex] = useState<number | null>(null);

	// --- 4. 逻辑控制状态 ---
	// 交易方向标志位：是 "ExactInput" (指定卖多少) 还是 "ExactOutput" (指定买多少)
	// 类似于游戏里的 "攻击模式" vs "防御模式"
	const [tradeDirection, setTradeDirection] = useState<TradeDirection>(TradeDirection.TO);

	// 交易状态机：控制底部大按钮的文字和可用性 (例如：余额不足、报价中、输入无效)
	const [swapError, setSwapError] = useState<SwapStatus>(SwapStatus.INVALID_AMOUNT);

	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [slippage, setSlippage] = useState('0.5');


	// --- 样式定义 (Tailwind CSS) ---
	const titleClass: string = cn(
		'w-fit', 'text-5xl', 'font-bold',
		'bg-gradient-to-r', 'from-[#6E63F2]', 'to-[#F166BB]', 'bg-clip-text', 'text-transparent',
		'text-[36px]',
	);

	const descriptionClass: string = cn(
		'w-fit', 'text-base', 'mt-2', 'text-[#99A1AF]',
	);

	const radiusRectClass: string = cn(
		'w-[545px]', showSettings ? 'h-[540px]' : 'h-[440px]', 'bg-card', 'rounded-[16px]',
		'flex', 'items-center', 'px-4', 'mb-4',
		'border', 'border-[#2F2C38]', 'mt-2',
		'flex-col', 'relative',
	);


	/**
	 * 核心逻辑 A: 计算【卖出】报价 (Exact Input)
	 * 触发时机：用户在 "From" 输入框输入数字时
	 */
	const checkAndGetOutQuote = async (pools: RawPoolInfo[]) => {
		if (fromToken?.address && toToken?.address) {

			// 1. 简单校验：不能自买自卖
			if (fromToken.address === toToken.address) {
				setSwapError(SwapStatus.SAME_TOKEN);
				showQuoteToaster(SwapStatus.SAME_TOKEN);
				setAmountOut("")
				return;
			}

			// 2. 状态流转：设为“报价中(Loading)”
			setSwapError(SwapStatus.QUOTING);
			
			// 3. 调用 swapMath.ts 中的核心算法进行模拟交易
			const result: OutQuoteInfo = await getOutQuote(fromToken, toToken, amountIn, pools);
			
			// 4. 更新状态
			if (fromToken?.address && fromBalance && (amountIn ? parseUnits(amountIn, fromToken.decimals): 0n) > fromBalance.value) 
			{
				result.error = SwapStatus.INSUFFICIENT_BALANCE;
				setSwapError(result.error);
			}
			else {
				setSwapError(result.error);
			}
			

			if (result.error !== SwapStatus.NONE) {
				showQuoteToaster(result.error);
			}

			// 5. 处理结果：将 BigInt 转换为人类可读的字符串 (例如 1000000 -> 1.0)
			// 注意：这里保留 6 位小数用于 UI 显示
			if (result.amountOut !== null && result.amountOut > 0n && result.amountOut < maxUint256) {
				const amountOutFormatted: string = Number(formatUnits(result.amountOut, toToken.decimals)).toFixed(6);
				setAmountOut(amountOutFormatted);
			}
			else {
				setAmountOut("");
			}
			
			// 6. 记录最佳池子索引，供后续 Swap 合约调用使用
			if (result.poolIndex >= 0){
				setPoolIndex(result.poolIndex);
			}
			
			console.log("Estimated amount out:", result.amountOut.toString(), "from pool index:", result.poolIndex);
		}
	}

	/**
	 * 核心逻辑 B: 计算【买入】报价 (Exact Output)
	 * 触发时机：用户在 "To" 输入框输入数字时（我想买 100 个币，需要花多少钱？）
	 */
	const checkAndGetInQuote = async (pools: RawPoolInfo[]) => {
		if (fromToken?.address && toToken?.address) {
			if (fromToken.address === toToken.address) {
				setSwapError(SwapStatus.SAME_TOKEN);
				showQuoteToaster(SwapStatus.SAME_TOKEN);
				setAmountIn("")
				return;
			}

			setSwapError(SwapStatus.QUOTING);
			// 注意：这里调用的是 getInQuote
			const result: InQuoteInfo = await getInQuote(fromToken, toToken, amountOut, pools);


			// 4. 更新状态
			if (fromToken?.address && fromBalance && result.amountIn > fromBalance.value) 
			{
				result.error = SwapStatus.INSUFFICIENT_BALANCE;
				setSwapError(result.error);
			}
			else {
				setSwapError(result.error);
			}

			if (result.amountIn !== null && result.amountIn > 0n && result.amountIn < maxUint256) {
				const amountInFormatted: string = Number(formatUnits(result.amountIn, fromToken.decimals)).toFixed(6);
				setAmountIn(amountInFormatted);
			}
			else {
				setAmountIn("");
			}
			
			if (result.poolIndex >= 0){
				setPoolIndex(result.poolIndex);
			}
			
			console.log("Estimated amount in:", result.amountIn.toString(), "from pool index:", result.poolIndex);
		}
	}

	// --- 输入事件处理 ---
	
	const onAmountInChange = (value: string) => {
		console.log("Amount In changed:", value);
		setAmountIn(value);
		setTradeDirection(TradeDirection.TO); // 标记方向：从上往下算
	}

	const onAmountOutChange = async (value: string) => {
		console.log("Amount Out changed:", value);
		setAmountOut(value);
		setTradeDirection(TradeDirection.FROM); // 标记方向：从下往上算
	}

	const onClickSwap = async () => {
		console.log("Swap button clicked");

		if (swapError === SwapStatus.NONE) {
			if (needsApprove) {
				try {
					const hash = await approve();
					console.log("Approve transaction hash:", hash);
					toast.success("交易已提交，等待上链...");
				}
				catch (error) {
					console.error("Approval failed:", error);
				}
			}
			else {
				try {
					if (!fromToken || !toToken || !poolIndex || !userAddress) {
						console.error("Swap parameters are incomplete.");
						return;
					}
					console.log("Check Balance:", {
						have: fromBalance?.value.toString(),
						need: parseUnits(amountIn, fromToken?.decimals || 18).toString(),
						isEnough: fromBalance && fromBalance.value >= parseUnits(amountIn, fromToken?.decimals || 18)
					});
					const hash = await swap(
						fromToken,
						toToken,
						amountIn,
						amountOut,
						poolIndex,
						tradeDirection,
						userAddress,
						slippage,
					);
					console.log("Swap transaction hash:", hash);
					toast.success("交易已提交，等待上链...");
				}
				catch (error) {
					console.error("Swap failed:", error);
				}
			}
		}
	}

	const onClickSwitchTokens = () => {
		if (fromToken || toToken) {
			const oldFrom = fromToken;
			setFromToken(toToken);
			setToToken(oldFrom);
		}
		else {
			toast.error("请先选择代币！");
		}
	}

	const onClickSettings = () => {
		setShowSettings(!showSettings);
	}

	// --- 链上交互 (Wagmi Hooks) ---

	const { address: userAddress } = useAccount();

	// 1. 查询【卖出币】余额
	const {data: fromBalance, refetch: refetchFromBalance} = useBalance({
		address: fromToken?.address ? userAddress : undefined,
		token: fromToken?.address as Address,
	});

	// 2. 查询【买入币】余额 
	const {data: toBalance, refetch: refetchToBalance} = useBalance({
		address: toToken?.address ? userAddress : undefined,
		token: toToken?.address as Address,
	});

	console.log("from Balance:", fromBalance);
	console.log("fromToken:", fromToken);
	console.log("userAddress:", userAddress);


	const {allowance, needsApprove, refetch: refetchAllowance} = useTokenAllowance(fromToken, amountIn, swapConfig.address);

	console.log("Token Allowance:", allowance?.toString(), "Needs Approve:", needsApprove);

	const {
		approve, 
		isLoading: isApproving, 
		isSuccess: isApproveSuccess
	} = useApprove(fromToken?.address, swapConfig.address);

	const { swap, isSwapping, isSuccess: isSwapSuccess } = useSwap();


	// --- 副作用 (Effects) ---

	useEffect(() => {
		if (isApproveSuccess) {
				console.log("授权成功，刷新额度数据...");
				// 调用 useTokenAllowance 返回的 refetch 函数
				refetchAllowance(); 
				toast.success("授权成功！");
				// 提示用户：授权成功！
		}
	//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isApproveSuccess]);

	useEffect(() => {
		if (isSwapSuccess) {
			console.log("交换成功，刷新余额数据...");
			// 交易成功后，刷新余额
			refetchFromBalance();
			refetchToBalance();
			setAmountIn("");
			setAmountOut("");
			toast.success("交易成功！");
		}
	//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSwapSuccess]);

	/**
	 * Effect: 监听【卖出金额】变化
	 * 机制：防抖 (Debounce) 500ms。
	 * 目的：防止用户每敲一个键盘按键就发一次 RPC 请求，保护节点配额。
	 */
	useEffect(() => {
		const timerId = setTimeout(() => {
			// 只有当当前的交易意图是 "卖出" 时，才去计算 "能买多少"
			if (tradeDirection === TradeDirection.TO)
				checkAndGetOutQuote(allPools);
		}, 500); 
		
		return () => clearTimeout(timerId); // 清理定时器
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amountIn, fromToken, toToken]);

	/**
	 * Effect: 监听【买入金额】变化
	 * 机制：同上，处理反向计算。
	 */
	useEffect(() => {
		const timerId = setTimeout(() => {
			if (tradeDirection === TradeDirection.FROM)
				checkAndGetInQuote(allPools);
		}, 500);
		
		return () => clearTimeout(timerId);
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amountOut, fromToken, toToken]);


	useEffect(() => {
		// 每当用户切换代币时，重新查询余额
		if (fromToken?.address) {
			refetchFromBalance();
		}
	//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromToken]);

	useEffect(() => {
		// 每当用户切换代币时，重新查询余额
		if (toToken?.address) {
			refetchToBalance();
		}
	//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toToken]);


	/**
	 * Effect: 初始化加载
	 * 时机：组件挂载后执行一次。
	 * 任务：
	 * 1. 抓取所有池子数据 (getPools)。
	 * 2. 整理出所有可用代币 (getSwapTokenMap)。
	 * 3. 抓取交易对信息 (getPairs)。
	 */
	useEffect(() => {
		const fetchSelectableTokens = async () => {
			const pools: RawPoolInfo[] = await getPools();
			setAllPools(pools);
			const map: Map<Address, TokenInfo> = await getSwapTokenMap(pools);
			setSelectableTokensMap(map);
		};

		const fetchPairs = async () => {
			const pairs: PairInfo[] = await getPairs();
			console.log("Fetched pairs:", pairs);
			setPairs(pairs);
		};

		fetchSelectableTokens();
		fetchPairs();
	}, []);

	const getButtonConfig = () => {
		if (isApproving) {
			return {
				text: `授权中...`,
				disabled: true,
			};
		}

		if (isSwapping) {
			return {
				text: `交易中...`,
				disabled: true,
			};
		}

		const baseConfig = BUTTON_CONFIG[swapError];
		// 如果需要批准，覆盖文字和禁用状态
		if (swapError === SwapStatus.NONE && needsApprove) {
			return {
				text: `授权${fromToken?.symbol}`,
				disabled: false,
			};
		}

		return baseConfig;
	}

	// --- 渲染 UI ---
	return (
		<div className="
			w-[550px]
			h-[409px]
			mx-auto
			my-[35px]">
			<h1 className={titleClass}>
				交易
			</h1>
			<h3 className={descriptionClass}>
				选择代币进行兑换
			</h3>

			<div className={radiusRectClass}>
				<SettingButton onClick={onClickSettings}></SettingButton>
				{showSettings && <SlippageSetting slippage={slippage} setSlippage={setSlippage}/>}
				{/* 上方输入框 (From) */}
				<SwapTokenInput
					fromOrTo="from"
					mt={6}
					mb={4}
					selectableTokensMap={selectableTokensMap}
					selectedToken={fromToken}
					setToken={setFromToken}
					onAmountChange={onAmountInChange}
					amount={amountIn}
					balance={Number(formatUnits(fromBalance?.value ?? 0n, fromToken?.decimals ?? 18)).toFixed(6)}
				/>
				
				{/* 切换按钮 (暂未实现逻辑，仅 UI) */}
				<SwitchTokenButton onClick={onClickSwitchTokens}/>
				<SwapTokenInput
					fromOrTo="to"
					mt={0}
					mb={0}
					selectableTokensMap={selectableTokensMap}
					selectedToken={toToken}
					setToken={setToToken}
					onAmountChange={onAmountOutChange}
					amount={amountOut}
					balance={Number(formatUnits(toBalance?.value ?? 0n, toToken?.decimals ?? 18)).toFixed(6)}
				/>
				<SwapButton buttonConfig={getButtonConfig()} onClick={onClickSwap}/>
			</div>
		</div>
	);
}