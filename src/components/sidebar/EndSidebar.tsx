import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '../ui/button';

interface EndSidebarProps {
	children?: React.ReactNode,
	className?: string,
	hidden?: boolean
	onClose?: () => void
}

const EndSidebar: React.FC<EndSidebarProps> = ({
	children,
	className = "",
	hidden = false,
	onClose,
}) => {
	return (
		<div className={cn( 
			"w-1/4 h-full p-4 overflow-y-auto overflow-x-hidden border-s backdrop-filter backdrop-blur-sm bg-white/30 z-30",
			className,
			"overflow-x-hidden",
			"fixed top-0 right-0 w-screen", // Responsive smaller screens
			"lg:top-0 lg:right-0 lg:w-[400px]", // Larger screens
			"xl:relative xl:w-[400px]", // Extra large screens
			"transition-all duration-300 ease-in-out",
			hidden ? "hidden" : "visible",
		)}>
			<Button variant="outline" className="mb-4" onClick={onClose}>Close</Button>

		</div>
	);
};

export default EndSidebar;