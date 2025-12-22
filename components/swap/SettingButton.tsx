import { Settings } from "lucide-react";
import { Button } from "../ui/button";

interface SettingButtonProps {
	onClick: () => void;
}

export const SettingButton = ({onClick}: SettingButtonProps) => {

	const onClickButton = () => {
		console.log("Settings button clicked");
		if (onClick){
			onClick();
		}
	}

	return (
		<Button className="mt-4 ml-auto" onClick={onClickButton}>
			<Settings className="h-6! w-6!" />
		</Button>
	)
}