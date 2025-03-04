'use client';
import {Button} from "@heroui/react";
export default function RegisterPage(){
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-t from-black-800 to-purple-800">
            <div className="shadow-xl p-4">
            <h1>Register</h1>
            <Button
             className="bg-gradient-to-tr from-purple-500 to-black-500 text-white shadow-lg"
             radius="full"
             >
                Register
            </Button>
            </div>
        </div>   
    );
}