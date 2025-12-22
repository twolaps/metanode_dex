'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export const HeaderView = () => {
	const router = useRouter();

	const onValueChange = (value: string) => {
		if (value === "tab1") {
			router.push("/");
		} else if (value === "tab2") {
			router.push("/pools");
		}
	}

	const tabTriggerClass: string = [
		'cursor-pointer',
		'text-2xl',
		'data-[state=active]:bg-[#2F2C38]',
		'data-[state=active]:text-white',
	].join(' ');

	return (
		<div className="flex h-25 relative bg-[#171422] text-white items-center">

			<div id="test1" className="absolute flex justify-center w-full h-full items-center">
				<Tabs defaultValue="tab1" onValueChange={onValueChange}>
					<TabsList className="w-100 h-12 gap-5 p-1 bg-transparent">
						<TabsTrigger value="tab1" className={tabTriggerClass}>Swap</TabsTrigger>
						<TabsTrigger value="tab2" className={tabTriggerClass}>Pools</TabsTrigger>
						<TabsTrigger value="tab3" className={tabTriggerClass}>Position</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="flex ml-auto m-5 items-center">
				<ConnectButton />
			</div>
		</div>
	);
}