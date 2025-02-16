import { pdfBooks } from "@/data/pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EBookPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pdfBooks.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>{book.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full"
              >
                <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Baca PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
