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
			router.push("/test");
		}
	}

	return (
		<div className="flex h-25 relative">

			<div id="test1" className="absolute flex justify-center border w-full h-full items-center">
				<Tabs defaultValue="tab1" onValueChange={onValueChange}>
					<TabsList className="w-100 h-12 gap-5 p-1">
						<TabsTrigger value="tab1" className="text-2xl">Swap</TabsTrigger>
						<TabsTrigger value="tab2" className="text-2xl">Pools</TabsTrigger>
						<TabsTrigger value="tab3" className="text-2xl">Position</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="flex ml-auto m-5 items-center">
				<ConnectButton />
			</div>
		</div>
	);
}