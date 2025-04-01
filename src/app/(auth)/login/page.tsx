'use client';
import React from 'react';

import { Input } from "@/components/ui/Input";
import { User } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

const LoginPage: React.FC = () => {
	return (
		<div className="flex gap-4 flex-col pb-4">
			<h1 className="text-xl font-semibold text-center mb-5 w-full">Sign in and start using awesome stuff</h1>

			<Input
				type="text"
				placeholder="Email or Username"
				startIcon={User}
			/>
			<Input
				type="password"
				placeholder="Password"
			/>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<Checkbox id="remember" />
					<label htmlFor="remember" className="text-sm text-muted-foreground ml-2">Keep me signed in on this device.</label>
				</div>
				<a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
			</div>
			<Button className="w-full">SIGN IN</Button>
			<span className="block my-1 text-center text-gray-500">or</span>
			<Button variant="outline" className="w-full" onClick={() => {
				window.location.href = '/register';
			}}>CREATE A NEW ACCOUNT</Button>
		</div>
	);
};

export default LoginPage;