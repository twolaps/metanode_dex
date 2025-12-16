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
			<Separator />
			{children}
		</ClientLayout>
	)
}
