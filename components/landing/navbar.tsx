'use client'

import UserButton from "../user/user-button";
import BusinessSelector from "../business/BusinessSelector";
import { useBusiness } from "../business/BusinessProvider";

export default function Navbar() {
    const { currentBusiness, setCurrentBusiness, loading } = useBusiness();

    return (
        <div className="hidden lg:flex items-center h-14 top-0 backdrop-blur-lg bg-gray-100/90 dark:bg-brand-950/90 sticky z-[70] px-4 lg:px-6 2xl:px-10">
            <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-200 px-2 py-0.5 rounded-xl">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Beta v 0.1.0</span>
                    </div>

                </div>
                <div className='flex gap-x-4 items-center'>
                    {!loading && currentBusiness && (
                        <BusinessSelector
                            currentBusinessId={currentBusiness.id}
                            onBusinessChange={setCurrentBusiness}
                        />
                    )}
                    <UserButton />
                </div>
            </div>
        </div>
    )
}