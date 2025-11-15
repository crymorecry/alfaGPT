import Logo from "../ui/logo";
import UserButton from "../user/user-button";

export default function Navbar() {
    return (
        <div className="hidden lg:flex items-center h-14 top-0 backdrop-blur-lg bg-gray-100/90 dark:bg-brand-950/90 sticky z-[9999] px-4 lg:px-6 2xl:px-10">
            <div className="flex w-full justify-between items-center">
                <div className="bg-zinc-200 px-2 py-0.5 rounded-xl">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Beta v 0.1.0</span>
                </div>
                <UserButton />
            </div>
        </div>
    )
}