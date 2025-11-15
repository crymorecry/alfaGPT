import Image from "next/image"
export default function Logo() {
    return (
        <div className="">
            <Image src="/logo_light.svg" alt="Logo" width={100} height={100} className="dark:hidden w-full h-full"/>
            <Image src="/logo_dark.svg" alt="Logo" width={100} height={100} className="hidden dark:block w-full h-full"/>
        </div>
    )
}