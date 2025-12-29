
export const PositionOverview = () => {
	return (
		<div className="flex flex-col items-center w-full mt-5">
			<div className="flex justify-center w-[1200px] gap-5">
				<div className="w-1/4 border border-input flex flex-col items-center p-5 mt-5 rounded-lg bg-input">
					<p className="text-lg">5</p>
					<p className="text-lg">活跃头寸</p>
				</div>
				<div className="w-1/4 border border-input flex flex-col items-center p-5 mt-5 rounded-lg bg-input">
					<p className="text-lg">5</p>
					<p className="text-lg">持仓总额</p>
				</div>
				<div className="w-1/4 border border-input flex flex-col items-center p-5 mt-5 rounded-lg bg-input">
					<p className="text-lg">5</p>
					<p className="text-lg">待领取收益</p>
				</div>
				<div className="w-1/4 border border-input flex flex-col items-center p-5 mt-5 rounded-lg bg-input">
					<p className="text-lg">5%</p>
					<p className="text-lg">平均年化收益率</p>
				</div>
			</div>
		</div>
	);		
}