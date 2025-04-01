'use client';
import React from 'react';

import { Input } from "@/components/ui/Input";
import { Mail, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

const RegisterPage: React.FC = () => {
	return (
		<div className="flex gap-4 flex-col">
			<h1 className="text-xl font-semibold text-center mb-5 w-full">One step away from something great</h1>

			<Input
				type="text"
				placeholder="Username"
				startIcon={User}
			/>
			<Input
				type="text"
				placeholder="Email"
				startIcon={Mail}
			/>
			<Input
				type="password"
				placeholder="Password"
			/>
			<Input
				type="password"
				placeholder="Repeat Password"
			/>
			<div className="flex items-center">
				<Checkbox id="remember" />
				<label htmlFor="remember" className="text-sm text-muted-foreground ml-2">
					By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
				</label>
			</div>
			<Button className="w-full">CREATE AN ACCOUNT</Button>
			<span className="block text-center text-gray-500">or</span>
			<Button variant="outline" className="w-full" onClick={() => {
				window.location.href = '/login';
			}}>
				I ALREADY HAVE AN ACCOUNT
			</Button>
		</div>
	);
};

export default RegisterPage;