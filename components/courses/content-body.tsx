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
          className="prose max-w-none dark:prose-invert focus:outline-none
          prose-headings:font-title prose-headings:text-lg sm:prose-headings:text-xl
          prose-p:text-sm sm:prose-p:text-base
          prose-li:text-sm sm:prose-li:text-base
          prose-strong:text-sm sm:prose-strong:text-base
          prose-img:rounded-lg prose-img:w-full prose-img:object-cover"
          dangerouslySetInnerHTML={{ __html: htmlDescription }} 
        />
      </CardContent>
    </Card>
  );
}
