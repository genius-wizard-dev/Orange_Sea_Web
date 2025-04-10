import React from 'react';

interface StartSidebarProps {
	children?: React.ReactNode;
}

const StartSidebar: React.FC<StartSidebarProps> = ({ children }) => {
	return (
		<div className="w-[500px] h-full bg-gray-200 p-4 overflow-y-auto overflow-x-hidden border-e backdrop-filter backdrop-blur-sm bg-white/30">
			{children}
		</div>
	);
};

export default StartSidebar;