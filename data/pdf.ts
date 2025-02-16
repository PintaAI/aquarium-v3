interface PdfBook {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
}

export const pdfBooks: PdfBook[] = [
  {
    id: "kosakata-bahasa-korea",
    title: "Kosakata Bahasa Korea",
    description: "Kumpulan kosakata bahasa Korea ",
    pdfUrl: "https://drive.google.com/file/d/1S3IE6c45-J7wZ0DXMx9Wy6bjKqZfENRs/view?usp=sharing"
  },
  {
    id: "dasar-bahasa-korea",
    title: "Dasar Bahasa Korea",
    description: "Pengenalan dasar bahasa Korea untuk pemula",
    pdfUrl: "https://drive.google.com/file/d/1tlxXw7YC4XzWDDaHixGy9RYHc1AEjJKx/view?usp=sharing"
  },
  {
    id: "topik-handbook",
    title: "TOPIK Handbook",
    description: "Buku panduan persiapan ujian TOPIK lengkap",
    pdfUrl: "https://drive.google.com/file/d/1V5ClHSWwJ7Bt9YdpBZv4AQ-BxqB2Aeqz/view?usp=sharing"
  },
  {
    id: "kosakata-eps-topik",
    title: "Kosakata EPS TOPIK",
    description: "Daftar kosakata untuk persiapan ujian EPS TOPIK",
    pdfUrl: "https://drive.google.com/file/d/19ykvHfRDjYzUJFQ3QV1uyQbBp-jqYzZw/view?usp=sharing"
  }
];
