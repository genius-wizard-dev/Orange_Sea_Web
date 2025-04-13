import { cn } from '@/lib/utils';
import React from 'react';

interface StartSidebarProps {
	children?: React.ReactNode,
	className?: string,
	hidden?: boolean
	onClose?: () => void
}

const StartSidebar: React.FC<StartSidebarProps> = ({ 
	children,
	className = "",
	hidden = false,
	onClose,
 }) => {
	return (
		<div className={cn(
			"h-full p-4 overflow-y-auto overflow-x-hidden border-e backdrop-filter backdrop-blur-sm bg-white/30",
			"top-0 left-0 w-screen w-full", // Responsive smaller screens
			"lg:top-0 lg:left-0 lg:w-[500px]", // Larger screens
			"xl:w-[500px]", // Extra large screens
		)}>
			{children}
		</div>
	);
};

export default StartSidebar;