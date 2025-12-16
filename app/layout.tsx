import { HeaderView } from "@/components/common/HeaderView";
import ClientLayout from "./ClientLayout";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Metanode Swap",
  description: "Metanode Swap 页面",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return(
		<ClientLayout>
			<HeaderView/>
			<Separator className="h-2 w-full" style={{ backgroundColor: "rgba(120, 120, 180, 0.3)" }} />
			{children}
		</ClientLayout>
	)
}
