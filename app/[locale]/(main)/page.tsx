import Image from 'next/image'
import ThemeToggler from '@/components/ui/ThemeChanger'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
     <ThemeToggler/>
    </main>
  )
}
