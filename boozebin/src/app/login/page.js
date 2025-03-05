'use client';
import Link from 'next/link'
import {Button} from "@heroui/react";
import {Input} from "@heroui/react";

export default function LoginPage(){
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-t from-black-800 to-purple-800">
            <div className="shadow-xl shadow-custom-shadow px-8 pb-8 pt-12 rounded-xl space-y-12">
            <h1 className="text-4xl font-semibold mb-12">Log In</h1>
            
            <form className="space-y-12 w-[400px]">
                <div key="faded" className="grid w-full max-w-sm items-center gap-1.5">
                <Input classNames={{input: ['outline-none', 'focus:outline-none'],}} label="Email" variant="faded" placeholder="Enter your email" type="email" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input classNames={{input: ['outline-none', 'focus:outline-none'],}} label="Password" placeholder="Enter Password" type="password"/>
                </div>
                <div className="w-full">
                <Button
                className="relative bg-gradient-to-tr from-purple-500 to-black-500 text-white shadow-lg"
                radius="full"
                fullWidth="true"
                >
                    Log In
                </Button>
                </div>
            </form>
            <p>Have an account? <Link className='text-purple-300 hover:underline' href="/register">Register</Link></p>

            </div>
        </div>   
    );
}