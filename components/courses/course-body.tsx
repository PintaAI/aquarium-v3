interface CourseBodyProps {
  htmlDescription: string | null;
}

export function CourseBody({ htmlDescription }: CourseBodyProps) {
  if (!htmlDescription) return null;

  return (
    <div className="mb-6 prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: htmlDescription }} />
    </div>
  );
}
