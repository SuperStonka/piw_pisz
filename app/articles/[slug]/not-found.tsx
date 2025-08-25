import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Artykuł nie został znaleziony</h2>
        <p className="text-gray-600 mb-8">Przepraszamy, ale artykuł o podanym adresie nie istnieje.</p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-[#2B7CB3] text-[#2B7CB3] hover:bg-[#2B7CB3] hover:text-white"
          >
            Powrót
          </Button>
          <Button asChild className="bg-[#2B7CB3] hover:bg-[#1E5A87]">
            <a href="/">Strona główna</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
