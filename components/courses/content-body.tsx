import { Card, CardContent } from "@/components/ui/card";

interface ContentBodyProps {
  htmlDescription: string | null;
}

export function ContentBody({ htmlDescription }: ContentBodyProps) {
  if (!htmlDescription) return null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border border-border bg-card">
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
        <div 
          className="prose max-w-none dark:prose-invert break-words text-sm md:text-base"
          dangerouslySetInnerHTML={{ __html: htmlDescription }} 
        />
      </CardContent>
    </Card>
  );
}
